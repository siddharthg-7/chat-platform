import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import User
from .models import Conversation, Message

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
        data = json.loads(text_data)
        action = data.get('action')

        if action == 'send_message':
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
        return Message.objects.create(
            conversation_id=conversation_id,
            sender_id=sender_id,
            text=text
        )

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
            profile = self.user.profile
            profile.is_online = status
            profile.save()
        except Exception:
            pass
