import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from .models import Conversation, Message, Reaction
from apps.notifications.models import Notification


User = get_user_model()

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        if self.scope["user"].is_anonymous:
            await self.close()
            return

        self.user = self.scope["user"]
        self.conversation_id = self.scope['url_route']['kwargs']['conversation_id']
        self.room_group_name = f'chat_{self.conversation_id}'

        # Check if user is part of the conversation
        is_participant = await self.is_participant(self.user.id, self.conversation_id)
        if not is_participant:
            await self.close()
            return

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        
        # User presence group
        self.user_presence_group = f'user_{self.user.id}'
        await self.channel_layer.group_add(
            self.user_presence_group,
            self.channel_name
        )

        if 'access_token' in self.scope.get('subprotocols', []):
            await self.accept(subprotocol='access_token')
        else:
            await self.accept()
        
        await self.set_online_status(True)
        await self.broadcast_presence("user_online")

    async def disconnect(self, close_code):
        if hasattr(self, 'room_group_name'):
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )
            await self.channel_layer.group_discard(
                self.user_presence_group,
                self.channel_name
            )
            
            await self.set_online_status(False)
            await self.broadcast_presence("user_offline")

    # Receive message from WebSocket
    async def receive(self, text_data):
        import time
        
        if not hasattr(self, 'message_timestamps'):
            self.message_timestamps = []
            
        data = json.loads(text_data)
        action = data.get('action')

        if action == 'send_message':
            # Throttling: 30 messages per minute
            now = time.time()
            self.message_timestamps = [t for t in self.message_timestamps if now - t < 60]
            
            if len(self.message_timestamps) >= 30:
                await self.send(text_data=json.dumps({
                    'action': 'error',
                    'message': 'Rate limit exceeded. Please wait before sending more messages.'
                }))
                return
                
            self.message_timestamps.append(now)
            message_text = data.get('text')
            temp_id = data.get('temp_id')
            if message_text:
                message = await self.save_message(self.conversation_id, self.user.id, message_text)
                
                # Send ack back to sender for optimistic UI
                if temp_id:
                    await self.send(text_data=json.dumps({
                        'action': 'message_ack',
                        'temp_id': temp_id,
                        'message_id': message.id,
                        'created_at': str(message.created_at)
                    }))
                
                # Broadcast to room
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'chat_message',
                        'message_id': message.id,
                        'text': message.text,
                        'sender_id': self.user.id,
                        'created_at': str(message.created_at)
                    }
                )

                # Send live notification events to other participants (if connected)
                try:
                    conv = await database_sync_to_async(Conversation.objects.get)(id=self.conversation_id)
                    participants = await database_sync_to_async(lambda: list(conv.participants.exclude(id=self.user.id)) )()
                    preview = (message.text or '')[:200]
                    for p in participants:
                        await self.channel_layer.group_send(
                            f'user_{p.id}',
                            {
                                'type': 'notify_user',
                                'content': f"New message from {self.user.username}: {preview}",
                                'notify_type': 'message'
                            }
                        )
                except Exception:
                    pass
        elif action in ['typing_start', 'typing_stop']:
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'typing_status',
                    'action': action,
                    'sender_id': self.user.id
                }
            )
        elif action == 'message_read':
            message_id = data.get('message_id')
            await self.mark_message_read(message_id)
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'message_status',
                    'action': 'message_read',
                    'message_id': message_id,
                    'reader_id': self.user.id
                }
            )
        elif action == 'react':
            # react action expects: { action: 'react', message_id, emoji, remove: true|false }
            message_id = data.get('message_id')
            emoji = data.get('emoji')
            remove = data.get('remove', False)
            if message_id and emoji:
                if remove:
                    await self.remove_reaction(message_id, self.user.id, emoji)
                    await self.channel_layer.group_send(
                        self.room_group_name,
                        {
                            'type': 'reaction_event',
                            'action': 'reaction_removed',
                            'message_id': message_id,
                            'emoji': emoji,
                            'user_id': self.user.id
                        }
                    )
                else:
                    await self.save_reaction(message_id, self.user.id, emoji)
                    await self.channel_layer.group_send(
                        self.room_group_name,
                        {
                            'type': 'reaction_event',
                            'action': 'reaction_added',
                            'message_id': message_id,
                            'emoji': emoji,
                            'user_id': self.user.id
                        }
                    )
        elif action == 'ping':
            await self.send(text_data=json.dumps({'action': 'pong'}))

    # Receive message from room group
    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            'action': 'receive_message',
            'message_id': event['message_id'],
            'text': event['text'],
            'sender_id': event['sender_id'],
            'created_at': event['created_at']
        }))

    async def typing_status(self, event):
        if event['sender_id'] != self.user.id:
            await self.send(text_data=json.dumps({
                'action': event['action'],
                'sender_id': event['sender_id']
            }))

    async def message_status(self, event):
        if event['reader_id'] != self.user.id:
            await self.send(text_data=json.dumps({
                'action': event['action'],
                'message_id': event['message_id'],
                'reader_id': event['reader_id']
            }))

    async def notify_user(self, event):
        # Receive server-side notification events targeted at a user
        await self.send(text_data=json.dumps({
            'action': 'notification',
            'type': event.get('notify_type', event.get('type', 'message')),
            'content': event.get('content')
        }))

    async def reaction_event(self, event):
        # Broadcast reaction add/remove to clients
        await self.send(text_data=json.dumps({
            'action': event.get('action'),
            'message_id': event.get('message_id'),
            'emoji': event.get('emoji'),
            'user_id': event.get('user_id')
        }))

    async def broadcast_presence(self, action):
        # We broadcast to the room so participants know we are online/offline
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'presence_status',
                'action': action,
                'user_id': self.user.id
            }
        )
        
    async def presence_status(self, event):
        if event['user_id'] != self.user.id:
            await self.send(text_data=json.dumps({
                'action': event['action'],
                'user_id': event['user_id']
            }))

    @database_sync_to_async
    def is_participant(self, user_id, conversation_id):
        try:
            conv = Conversation.objects.get(id=conversation_id)
            return conv.participants.filter(id=user_id).exists()
        except Conversation.DoesNotExist:
            return False

    @database_sync_to_async
    def save_message(self, conversation_id, sender_id, text):
        message = Message.objects.create(
            conversation_id=conversation_id,
            sender_id=sender_id,
            text=text
        )

        # Create notifications for other participants (best-effort)
        try:
            conv = Conversation.objects.get(id=conversation_id)
            participants = conv.participants.exclude(id=sender_id)
            preview = (text or '')[:200]
            for p in participants:
                Notification.objects.create(
                    user=p,
                    type='message',
                    content=f"New message from {message.sender.username}: {preview}"
                )
        except Exception:
            pass

        return message

    @database_sync_to_async
    def save_reaction(self, message_id, user_id, emoji):
        try:
            msg = Message.objects.get(id=message_id)
            Reaction.objects.get_or_create(message=msg, user_id=user_id, emoji=emoji)
        except Exception:
            pass

    @database_sync_to_async
    def remove_reaction(self, message_id, user_id, emoji):
        try:
            Reaction.objects.filter(message_id=message_id, user_id=user_id, emoji=emoji).delete()
        except Exception:
            pass

    @database_sync_to_async
    def mark_message_read(self, message_id):
        try:
            msg = Message.objects.get(id=message_id)
            msg.is_read = True
            msg.save()
        except Message.DoesNotExist:
            pass

    @database_sync_to_async
    def set_online_status(self, status):
        try:
            from django.utils import timezone
            profile = self.user.profile
            profile.is_online = status
            if not status:
                profile.last_seen = timezone.now()
            profile.save()
        except Exception:
            pass
