import asyncio
import json
import logging
import time
import uuid
from typing import Any, Optional

from channels.generic.websocket import AsyncWebsocketConsumer
from django.conf import settings
from django.contrib.auth import get_user_model

from apps.common.middleware import correlation_id_var
from .constants import Actions, Events
from .services.dispatcher import EventDispatcher
from .services.message import MessageService
from .services.presence import PresenceService, redis_client

User = get_user_model()
logger = logging.getLogger(__name__)

class ChatConsumer(AsyncWebsocketConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.connection_id: str = ""
        self.user: Any = None
        self.user_group_name: str = ""
        self.last_ping: float = 0.0
        self.is_connected: bool = False
        self.heartbeat_task: Optional[asyncio.Task] = None
        self.init_task: Optional[asyncio.Task] = None
        self.dispatcher: Optional[EventDispatcher] = None

    async def connect(self) -> None:
        self.connection_id = str(uuid.uuid4())
        correlation_id_var.set(self.connection_id)
        
        user = self.scope.get('user')
        if not user or user.is_anonymous:
            logger.warning(f"WebSocket Connect Rejected: Anonymous user, conn_id={self.connection_id}")
            await self.close()
            return

        self.user = user
        self.user_group_name = f'user_{self.user.id}'
        self.last_ping = time.time()
        self.is_connected = True
        self.dispatcher = EventDispatcher(self)

        logger.info(f"WebSocket Connect Initiated: user={self.user.id}, conn_id={self.connection_id}")

        await self.channel_layer.group_add(self.user_group_name, self.channel_name)

        if 'access_token' in self.scope.get('subprotocols', []):
            await self.accept(subprotocol='access_token')
        else:
            await self.accept()

        self.init_task = asyncio.create_task(self.background_initialization())
        self.heartbeat_task = asyncio.create_task(self.heartbeat_monitor())

    async def background_initialization(self) -> None:
        try:
            await asyncio.sleep(0.1)
            if not self.is_connected:
                return

            active_connections = await PresenceService.increment_connections(self.user.id)
            if not self.is_connected:
                return

            session_data = await PresenceService.initialize_user_session(self.user.id, active_connections)
            partner_ids = session_data['partner_ids']
            conversation_ids = session_data['conversation_ids']
            online_partners = session_data['online_partners']

            if not self.is_connected:
                return
            
            if session_data.get('transitioned_online', False):
                await PresenceService.broadcast_presence(self.channel_layer, self.user.id, Events.USER_ONLINE, partner_ids)

            if not self.is_connected:
                return

            for conv_id in conversation_ids:
                await self.channel_layer.group_add(f"conversation_{conv_id}", self.channel_name)

            if not self.is_connected:
                return

            await self.send(text_data=json.dumps({
                'action': Events.ONLINE_USERS,
                'user_ids': online_partners
            }))

            if not self.is_connected:
                return

            await self.process_delivery_receipts()

        except asyncio.CancelledError:
            pass
        except Exception as e:
            logger.error(f"Error during background_initialization for user {self.user.id}: {e}")

    async def disconnect(self, close_code: int) -> None:
        self.is_connected = False
        correlation_id_var.set(self.connection_id)
        logger.info(f"WebSocket Disconnected: user={self.user}, code={close_code}, conn_id={self.connection_id}")
        
        for task in [self.heartbeat_task, self.init_task]:
            if task and not task.done():
                task.cancel()

        if self.user_group_name:
            await self.channel_layer.group_discard(self.user_group_name, self.channel_name)
            try:
                active_connections = await PresenceService.decrement_connections(self.user.id)
                if active_connections == 0:
                    await PresenceService.set_online_status_db(self.user.id, False)
                    partner_ids = await MessageService.get_user_chat_partners(self.user.id)
                    await PresenceService.broadcast_presence(self.channel_layer, self.user.id, Events.USER_OFFLINE, partner_ids)
            except Exception as e:
                logger.error(f"Error decrementing connections for user {self.user.id}: {e}")

    async def heartbeat_monitor(self) -> None:
        try:
            while self.is_connected:
                await asyncio.sleep(15)
                if time.time() - self.last_ping > 90:
                    logger.warning(f"Heartbeat timeout for user {self.user.id}, conn_id={self.connection_id}. Closing.")
                    await self.close(code=4000)
                    break
        except asyncio.CancelledError:
            pass

    async def receive(self, text_data: str) -> None:
        correlation_id_var.set(self.connection_id)
        if len(text_data) > 10240:
            logger.warning(f"Payload exceeds 10KB limit: user={self.user.id}, conn_id={self.connection_id}")
            return
            
        if not await self._rate_limiter_allows(self.user.id):
            return
        
        try:
            data = json.loads(text_data)
            if not isinstance(data, dict):
                raise ValueError("Payload must be a JSON object")
        except Exception:
            logger.error(f"Malformed WS payload: {text_data}")
            return

        try:
            if self.dispatcher:
                await self.dispatcher.dispatch(data)
        except Exception as e:
            logger.exception(f"Error processing WS action: {e} | payload: {data}")

    async def _rate_limiter_allows(self, user_id: int) -> bool:
        try:
            rl_key = f"rate_limit:{user_id}"
            current = await redis_client.incr(rl_key)
            if current == 1:
                await redis_client.expire(rl_key, 1)
            if current > 50:
                logger.warning(f"User {user_id} hit WebSocket global rate limit (burst). Terminating connection.")
                await self.close(code=4290)
                return False
            return True
        except Exception as e:
            logger.error(f"Rate limiter Redis failure: {e}")
            return True

    async def chat_event(self, event: dict) -> None:
        logger.info(f"Dispatching chat_event to user {self.user.id}: {event}")
        await self.send(text_data=json.dumps(event['event']))

    async def presence_status(self, event: dict) -> None:
        await self.send(text_data=json.dumps({
            'action': event['action'],
            'user_id': event['user_id']
        }))

    async def process_delivery_receipts(self) -> None:
        try:
            messages = await MessageService.get_undelivered_messages(self.user.id)
            if not messages:
                return
                
            message_ids = [m['id'] for m in messages]
            await MessageService.bulk_mark_messages_delivered(message_ids)
            
            for msg in messages:
                await self.channel_layer.group_send(
                    f"user_{msg['sender_id']}",
                    {
                        "type": "chat_event",
                        "event": {
                            "action": Events.MESSAGE_DELIVERED,
                            "message_id": msg['id'],
                            "conversation_id": msg['conversation_id'],
                            "user_id": self.user.id
                        }
                    }
                )
        except asyncio.CancelledError:
            pass
        except Exception as e:
            logger.error(f"Error processing delivery receipts: {e}")
