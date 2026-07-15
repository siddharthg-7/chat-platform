import json
import logging
import time
from django.conf import settings
from django.contrib.auth import get_user_model
from django.utils import timezone
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import Conversation, Message, Reaction, Attachment

User = get_user_model()
logger = logging.getLogger(__name__)

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        if self.scope["user"].is_anonymous:
            await self.close()
            return

        self.user = self.scope["user"]
        self.user_group_name = f'user_{self.user.id}'

        # Join personal user group
        await self.channel_layer.group_add(
            self.user_group_name,
            self.channel_name
        )

        if 'access_token' in self.scope.get('subprotocols', []):
            await self.accept(subprotocol='access_token')
        else:
            await self.accept()

        # Update online status in DB
        await self.set_online_status(True)

        # Find all unique chat partners and notify them
        partner_ids = await self.get_user_chat_partners()
        for partner_id in partner_ids:
            await self.channel_layer.group_send(
                f'user_{partner_id}',
                {
                    'type': 'presence_status',
                    'action': 'user_online',
                    'user_id': self.user.id
                }
            )

        # Send list of currently online partners back to the connecting client
        online_partners = await self.get_online_user_ids(partner_ids)
        await self.send(text_data=json.dumps({
            'action': 'online_users',
            'user_ids': online_partners
        }))

    async def disconnect(self, close_code):
        if hasattr(self, 'user_group_name'):
            await self.channel_layer.group_discard(
                self.user_group_name,
                self.channel_name
            )

            # Update offline status in DB
            await self.set_online_status(False)

            # Notify chat partners
            partner_ids = await self.get_user_chat_partners()
            for partner_id in partner_ids:
                await self.channel_layer.group_send(
                    f'user_{partner_id}',
                    {
                        'type': 'presence_status',
                        'action': 'user_offline',
                        'user_id': self.user.id
                    }
                )

    async def receive(self, text_data):
        if not hasattr(self, 'message_timestamps'):
            self.message_timestamps = []

        try:
            data = json.loads(text_data)
        except Exception:
            logger.error(f"Malformed WS payload: {text_data}")
            return

        action = data.get('action')

        if action == 'send_message':
            # Rate limiting check: max 30 messages/minute
            now = time.time()
            self.message_timestamps = [t for t in self.message_timestamps if now - t < 60]
            if len(self.message_timestamps) >= 30:
                await self.send(text_data=json.dumps({
                    'action': 'error',
                    'message': 'Rate limit exceeded. Please wait before sending more messages.'
                }))
                return
            self.message_timestamps.append(now)

            conversation_id = data.get('conversation_id')
            text = data.get('text', '')
            temp_id = data.get('temp_id')
            reply_to_id = data.get('reply_to_id')
            voice_note = data.get('voice_note')

            if not conversation_id:
                return

            # Check if user is participant
            is_part = await self.is_participant(self.user.id, conversation_id)
            if not is_part:
                return

            # Save message
            msg = await self.save_message(
                conversation_id, self.user.id, text, reply_to_id, voice_note
            )

            # Create in-app notifications for recipients
            await self.create_message_notifications(
                conversation_id, self.user.id, self.user.username, text, voice_note
            )

            # Send ack back to sender
            if temp_id:
                await self.send(text_data=json.dumps({
                    'action': 'message_ack',
                    'temp_id': temp_id,
                    'message_id': msg.id,
                    'created_at': str(msg.created_at)
                }))

            # Broadcast to all participants' user groups
            participant_ids = await self.get_conversation_participants(conversation_id)
            for p_id in participant_ids:
                await self.channel_layer.group_send(
                    f'user_{p_id}',
                    {
                        'type': 'chat_event',
                        'event': {
                            'action': 'receive_message',
                            'message_id': msg.id,
                            'conversation_id': conversation_id,
                            'text': msg.text,
                            'sender_id': self.user.id,
                            'sender_username': self.user.username,
                            'created_at': str(msg.created_at),
                            'reply_to_id': reply_to_id,
                            'voice_note': voice_note,
                            'is_read': msg.is_read,
                            'is_delivered': msg.is_delivered,
                            'attachments': []
                        }
                    }
                )

        elif action in ['typing_start', 'typing_stop']:
            conversation_id = data.get('conversation_id')
            if not conversation_id:
                return
            participant_ids = await self.get_conversation_participants(conversation_id)
            for p_id in participant_ids:
                if p_id != self.user.id:
                    await self.channel_layer.group_send(
                        f'user_{p_id}',
                        {
                            'type': 'chat_event',
                            'event': {
                                'action': action,
                                'conversation_id': conversation_id,
                                'sender_id': self.user.id
                            }
                        }
                    )

        elif action == 'message_read':
            message_id = data.get('message_id')
            conversation_id = data.get('conversation_id')
            if not message_id or not conversation_id:
                return
            
            await self.mark_message_read(message_id)
            participant_ids = await self.get_conversation_participants(conversation_id)
            for p_id in participant_ids:
                if p_id != self.user.id:
                    await self.channel_layer.group_send(
                        f'user_{p_id}',
                        {
                            'type': 'chat_event',
                            'event': {
                                'action': 'message_read',
                                'conversation_id': conversation_id,
                                'message_id': message_id,
                                'reader_id': self.user.id
                            }
                        }
                    )

        elif action == 'read_all':
            conversation_id = data.get('conversation_id')
            if not conversation_id:
                return

            marked_ids = await self.mark_all_messages_read(conversation_id, self.user.id)
            if marked_ids:
                participant_ids = await self.get_conversation_participants(conversation_id)
                for p_id in participant_ids:
                    if p_id != self.user.id:
                        await self.channel_layer.group_send(
                            f'user_{p_id}',
                            {
                                'type': 'chat_event',
                                'event': {
                                    'action': 'read_all_confirm',
                                    'conversation_id': conversation_id,
                                    'message_ids': marked_ids,
                                    'reader_id': self.user.id
                                }
                            }
                        )

        elif action == 'message_reaction':
            message_id = data.get('message_id')
            conversation_id = data.get('conversation_id')
            emoji = data.get('emoji')
            if not message_id or not conversation_id or not emoji:
                return

            reactions = await self.toggle_reaction(message_id, self.user.id, emoji)
            participant_ids = await self.get_conversation_participants(conversation_id)
            for p_id in participant_ids:
                await self.channel_layer.group_send(
                    f'user_{p_id}',
                    {
                        'type': 'chat_event',
                        'event': {
                            'action': 'message_reactions_updated',
                            'conversation_id': conversation_id,
                            'message_id': message_id,
                            'reactions': reactions
                        }
                    }
                )

        elif action == 'edit_message':
            message_id = data.get('message_id')
            conversation_id = data.get('conversation_id')
            new_text = data.get('text', '').strip()
            if not message_id or not conversation_id or not new_text:
                return

            success = await self.edit_message(message_id, self.user.id, new_text)
            if success:
                participant_ids = await self.get_conversation_participants(conversation_id)
                for p_id in participant_ids:
                    await self.channel_layer.group_send(
                        f'user_{p_id}',
                        {
                            'type': 'chat_event',
                            'event': {
                                'action': 'message_edited',
                                'conversation_id': conversation_id,
                                'message_id': message_id,
                                'text': new_text
                            }
                        }
                    )

        elif action == 'delete_message':
            message_id = data.get('message_id')
            conversation_id = data.get('conversation_id')
            delete_type = data.get('delete_type')  # 'me' or 'everyone'
            if not message_id or not conversation_id or not delete_type:
                return

            if delete_type == 'everyone':
                success = await self.delete_message_everyone(message_id, self.user.id)
                if success:
                    participant_ids = await self.get_conversation_participants(conversation_id)
                    for p_id in participant_ids:
                        await self.channel_layer.group_send(
                            f'user_{p_id}',
                            {
                                'type': 'chat_event',
                                'event': {
                                    'action': 'message_deleted_everyone',
                                    'conversation_id': conversation_id,
                                    'message_id': message_id
                                }
                            }
                        )
            elif delete_type == 'me':
                await self.delete_message_me(message_id, self.user.id)
                # Confirm back to sender only
                await self.send(text_data=json.dumps({
                    'action': 'message_deleted_me',
                    'conversation_id': conversation_id,
                    'message_id': message_id
                }))

        elif action == 'toggle_pin':
            message_id = data.get('message_id')
            conversation_id = data.get('conversation_id')
            if not message_id or not conversation_id:
                return

            is_pinned = await self.toggle_message_pin(message_id)
            participant_ids = await self.get_conversation_participants(conversation_id)
            for p_id in participant_ids:
                await self.channel_layer.group_send(
                    f'user_{p_id}',
                    {
                        'type': 'chat_event',
                        'event': {
                            'action': 'message_pin_updated',
                            'conversation_id': conversation_id,
                            'message_id': message_id,
                            'is_pinned': is_pinned
                        }
                    }
                )


        elif action == 'ping':
            await self.send(text_data=json.dumps({'action': 'pong'}))

    # WebSocket events router helper
    async def chat_event(self, event):
        await self.send(text_data=json.dumps(event['event']))

    async def presence_status(self, event):
        await self.send(text_data=json.dumps({
            'action': event['action'],
            'user_id': event['user_id']
        }))

    # Database Helpers
    @database_sync_to_async
    def get_user_chat_partners(self):
        return list(
            User.objects.filter(
                conversations__participants=self.user
            ).exclude(id=self.user.id).values_list('id', flat=True).distinct()
        )

    @database_sync_to_async
    def get_online_user_ids(self, partner_ids):
        from apps.accounts.models import Profile
        return list(
            Profile.objects.filter(
                user_id__in=partner_ids,
                is_online=True
            ).values_list('user_id', flat=True)
        )

    @database_sync_to_async
    def is_participant(self, user_id, conversation_id):
        try:
            conv = Conversation.objects.get(id=conversation_id)
            return conv.participants.filter(id=user_id).exists()
        except Conversation.DoesNotExist:
            return False

    @database_sync_to_async
    def get_conversation_participants(self, conversation_id):
        try:
            conv = Conversation.objects.get(id=conversation_id)
            return list(conv.participants.values_list('id', flat=True))
        except Conversation.DoesNotExist:
            return []

    @database_sync_to_async
    def create_message_notifications(self, conversation_id, sender_id, sender_username, text, voice_note):
        from apps.notifications.services import create_message_notifications as _create
        return _create(conversation_id, sender_id, sender_username, text, voice_note)

    @database_sync_to_async
    def save_message(self, conversation_id, sender_id, text, reply_to_id=None, voice_note=None):
        reply_to = None
        if reply_to_id:
            try:
                reply_to = Message.objects.get(id=reply_to_id)
            except Message.DoesNotExist:
                pass
                
        msg = Message.objects.create(
            conversation_id=conversation_id,
            sender_id=sender_id,
            text=text,
            reply_to=reply_to,
            voice_note=voice_note
        )
        # Touch conversation to update updated_at timestamp
        Conversation.objects.filter(id=conversation_id).update(updated_at=timezone.now())
        return msg

    @database_sync_to_async
    def mark_message_read(self, message_id):
        Message.objects.filter(id=message_id).update(is_read=True, is_delivered=True)

    @database_sync_to_async
    def mark_all_messages_read(self, conversation_id, user_id):
        unread_msgs = Message.objects.filter(
            conversation_id=conversation_id,
            is_read=False
        ).exclude(sender_id=user_id)
        marked_ids = list(unread_msgs.values_list('id', flat=True))
        unread_msgs.update(is_read=True, is_delivered=True)
        return marked_ids

    @database_sync_to_async
    def toggle_reaction(self, message_id, user_id, emoji):
        reaction, created = Reaction.objects.get_or_create(
            message_id=message_id,
            user_id=user_id,
            emoji=emoji
        )
        if not created:
            reaction.delete()
            
        # Get updated reactions list
        updated_reactions = Reaction.objects.filter(message_id=message_id)
        return [
            {
                'id': r.id,
                'user': r.user_id,
                'username': r.user.username,
                'emoji': r.emoji
            } for r in updated_reactions
        ]

    @database_sync_to_async
    def edit_message(self, message_id, user_id, new_text):
        try:
            msg = Message.objects.get(id=message_id, sender_id=user_id)
            msg.text = new_text
            msg.is_edited = True
            msg.save()
            return True
        except Message.DoesNotExist:
            return False

    @database_sync_to_async
    def delete_message_everyone(self, message_id, user_id):
        try:
            msg = Message.objects.get(id=message_id, sender_id=user_id)
            # Remove content, attachments, and reactions
            msg.text = "This message was deleted."
            msg.voice_note = None
            msg.is_edited = False
            msg.attachments.all().delete()
            msg.reactions.all().delete()
            # Mark it deleted for everyone using a custom logic or simply clear contents
            # We can use text to display the deletion
            msg.save()
            return True
        except Message.DoesNotExist:
            return False

    @database_sync_to_async
    def delete_message_me(self, message_id, user_id):
        try:
            msg = Message.objects.get(id=message_id)
            msg.deleted_for_users.add(user_id)
        except Message.DoesNotExist:
            pass

    @database_sync_to_async
    def toggle_message_pin(self, message_id):
        try:
            msg = Message.objects.get(id=message_id)
            msg.is_pinned = not msg.is_pinned
            msg.save()
            return msg.is_pinned
        except Message.DoesNotExist:
            return False

    @database_sync_to_async
    def set_online_status(self, status):
        try:
            profile = self.user.profile
            profile.is_online = status
            if not status:
                profile.last_seen = timezone.now()
            profile.save()
        except Exception as e:
            logger.error(f"Failed to set user online status: {e}")

