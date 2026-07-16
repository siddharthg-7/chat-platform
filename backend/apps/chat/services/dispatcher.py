import json
import logging
import time
from typing import Any, Dict, Set
from django.utils import timezone

from ..constants import Actions, Events
from ..dataclasses import WSMessagePayload
from .message import MessageService
from .notification import NotificationService
from .presence import PresenceService

logger = logging.getLogger(__name__)

class EventDispatcher:
    CONVERSATION_ACTIONS: Set[str] = {
        Actions.SEND_MESSAGE,
        Actions.TYPING_START,
        Actions.TYPING_STOP,
        Actions.MESSAGE_READ,
        Actions.READ_ALL,
        Actions.MESSAGE_REACTION,
        Actions.EDIT_MESSAGE,
        Actions.DELETE_MESSAGE,
        Actions.TOGGLE_PIN
    }

    def __init__(self, consumer: Any):
        self.consumer = consumer
        self._handlers = {
            Actions.SEND_MESSAGE: self.handle_send_message,
            Actions.TYPING_START: self.handle_typing,
            Actions.TYPING_STOP: self.handle_typing,
            Actions.MESSAGE_READ: self.handle_message_read,
            Actions.READ_ALL: self.handle_read_all,
            Actions.MESSAGE_REACTION: self.handle_message_reaction,
            Actions.EDIT_MESSAGE: self.handle_edit_message,
            Actions.DELETE_MESSAGE: self.handle_delete_message,
            Actions.TOGGLE_PIN: self.handle_toggle_pin,
            Actions.PING: self.handle_ping,
        }

    async def dispatch(self, data: dict) -> None:
        payload = WSMessagePayload.from_dict(data)
        handler = self._handlers.get(payload.action)
        if not handler:
            logger.warning(f"Unhandled WS action: {payload.action}")
            return

        if payload.action in self.CONVERSATION_ACTIONS:
            if not payload.conversation_id:
                logger.warning(f"Conversation actions require conversation_id: {payload.action}")
                return
            is_part = await MessageService.is_participant(self.consumer.user.id, payload.conversation_id)
            if not is_part:
                logger.warning(
                    f"User {self.consumer.user.id} tried to perform {payload.action} "
                    f"on conversation {payload.conversation_id} without being a participant."
                )
                return

        await handler(payload)

    async def handle_send_message(self, payload: WSMessagePayload) -> None:
        if not payload.client_id:
            logger.error("Missing client_id in send_message payload")
            await self.consumer.send(text_data=json.dumps({
                'action': 'error',
                'message': 'client_id is required for sending messages'
            }))
            return

        try:
            logger.info(f"Saving message for conv {payload.conversation_id} from {self.consumer.user.id}")
            msg, created = await MessageService.save_message(
                payload.conversation_id,
                self.consumer.user.id,
                payload.text or '',
                payload.reply_to_id,
                payload.voice_note,
                payload.client_id
            )
            logger.info(f"save_message returned: msg.id={msg.id}, created={created}")
        except Exception as e:
            logger.error(f"Failed to save message: {e}")
            return

        if created:
            try:
                await NotificationService.create_message_notifications(
                    payload.conversation_id,
                    self.consumer.user.id,
                    self.consumer.user.username,
                    payload.text or '',
                    payload.voice_note
                )
            except Exception as e:
                logger.error(f"Failed to create notifications: {e}")

        if payload.temp_id:
            await self.consumer.send(text_data=json.dumps({
                'action': Events.MESSAGE_ACK,
                'temp_id': payload.temp_id,
                'message_id': msg.id,
                'created_at': str(msg.created_at)
            }))

        if created:
            await self.consumer.channel_layer.group_send(
                f'conversation_{payload.conversation_id}',
                {
                    'type': 'chat_event',
                    'event': {
                        'action': Events.RECEIVE_MESSAGE,
                        'message_id': msg.id,
                        'conversation_id': payload.conversation_id,
                        'text': msg.text,
                        'sender_id': self.consumer.user.id,
                        'sender_username': self.consumer.user.username,
                        'created_at': str(msg.created_at),
                        'reply_to_id': payload.reply_to_id,
                        'voice_note': payload.voice_note,
                        'is_read': msg.is_read,
                        'is_delivered': msg.is_delivered,
                        'attachments': []
                    }
                }
            )

    async def handle_typing(self, payload: WSMessagePayload) -> None:
        await self.consumer.channel_layer.group_send(
            f'conversation_{payload.conversation_id}',
            {
                'type': 'chat_event',
                'event': {
                    'action': payload.action,
                    'conversation_id': payload.conversation_id,
                    'sender_id': self.consumer.user.id
                }
            }
        )

    async def handle_message_read(self, payload: WSMessagePayload) -> None:
        if not payload.message_id:
            return
        await MessageService.mark_message_read(payload.message_id)
        await self.consumer.channel_layer.group_send(
            f'conversation_{payload.conversation_id}',
            {
                'type': 'chat_event',
                'event': {
                    'action': Events.MESSAGE_READ,
                    'conversation_id': payload.conversation_id,
                    'message_id': payload.message_id,
                    'reader_id': self.consumer.user.id
                }
            }
        )

    async def handle_read_all(self, payload: WSMessagePayload) -> None:
        marked_ids = await MessageService.mark_all_messages_read(
            payload.conversation_id,
            self.consumer.user.id
        )
        if marked_ids:
            await self.consumer.channel_layer.group_send(
                f'conversation_{payload.conversation_id}',
                {
                    'type': 'chat_event',
                    'event': {
                        'action': Events.READ_ALL_CONFIRM,
                        'conversation_id': payload.conversation_id,
                        'message_ids': marked_ids,
                        'reader_id': self.consumer.user.id
                    }
                }
            )

    async def handle_message_reaction(self, payload: WSMessagePayload) -> None:
        if not payload.message_id or not payload.emoji:
            return
        reactions = await MessageService.toggle_reaction(
            payload.message_id,
            self.consumer.user.id,
            payload.emoji
        )
        await self.consumer.channel_layer.group_send(
            f'conversation_{payload.conversation_id}',
            {
                'type': 'chat_event',
                'event': {
                    'action': Events.MESSAGE_REACTIONS_UPDATED,
                    'conversation_id': payload.conversation_id,
                    'message_id': payload.message_id,
                    'reactions': reactions
                }
            }
        )

    async def handle_edit_message(self, payload: WSMessagePayload) -> None:
        if not payload.message_id or not payload.text:
            return
        new_text = payload.text.strip()
        if not new_text:
            return
        success = await MessageService.edit_message(
            payload.message_id,
            self.consumer.user.id,
            new_text
        )
        if success:
            await self.consumer.channel_layer.group_send(
                f'conversation_{payload.conversation_id}',
                {
                    'type': 'chat_event',
                    'event': {
                        'action': Events.MESSAGE_EDITED,
                        'conversation_id': payload.conversation_id,
                        'message_id': payload.message_id,
                        'text': new_text
                    }
                }
            )

    async def handle_delete_message(self, payload: WSMessagePayload) -> None:
        if not payload.message_id or not payload.delete_type:
            return
        if payload.delete_type == 'everyone':
            success = await MessageService.delete_message_everyone(
                payload.message_id,
                self.consumer.user.id
            )
            if success:
                await self.consumer.channel_layer.group_send(
                    f'conversation_{payload.conversation_id}',
                    {
                        'type': 'chat_event',
                        'event': {
                            'action': Events.MESSAGE_DELETED_EVERYONE,
                            'conversation_id': payload.conversation_id,
                            'message_id': payload.message_id
                        }
                    }
                )
        elif payload.delete_type == 'me':
            await MessageService.delete_message_me(
                payload.message_id,
                self.consumer.user.id
            )
            await self.consumer.send(text_data=json.dumps({
                'action': Events.MESSAGE_DELETED_ME,
                'conversation_id': payload.conversation_id,
                'message_id': payload.message_id
            }))

    async def handle_toggle_pin(self, payload: WSMessagePayload) -> None:
        if not payload.message_id:
            return
        is_pinned = await MessageService.toggle_message_pin(payload.message_id)
        await self.consumer.channel_layer.group_send(
            f'conversation_{payload.conversation_id}',
            {
                'type': 'chat_event',
                'event': {
                    'action': Events.MESSAGE_PIN_UPDATED,
                    'conversation_id': payload.conversation_id,
                    'message_id': payload.message_id,
                    'is_pinned': is_pinned
                }
            }
        )

    async def handle_ping(self, payload: WSMessagePayload) -> None:
        self.consumer.last_ping = time.time()
        await PresenceService.update_last_seen(self.consumer.user)
        await self.consumer.send(text_data=json.dumps({'action': Events.PONG}))
