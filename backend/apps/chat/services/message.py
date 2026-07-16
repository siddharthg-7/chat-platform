import logging
from typing import List, Tuple, Dict, Any, Optional
from django.contrib.auth import get_user_model
from django.db import transaction
from django.db.models import Max
from django.utils import timezone
from channels.db import database_sync_to_async

from apps.accounts.models import Block, Profile
from apps.chat.models import Conversation, Message, Reaction

User = get_user_model()
logger = logging.getLogger(__name__)

class MessageService:
    @staticmethod
    @database_sync_to_async
    def get_user_chat_partners(user_id: int) -> List[int]:
        qs = User.objects.filter(
            conversations__participants=user_id
        ).exclude(id=user_id).values_list('id', flat=True).distinct()
        return list(qs)

    @staticmethod
    @database_sync_to_async
    def get_user_conversation_ids(user_id: int) -> List[int]:
        return list(Conversation.objects.filter(participants=user_id).values_list('id', flat=True))

    @staticmethod
    @database_sync_to_async
    def get_online_user_ids(partner_ids: List[int]) -> List[int]:
        qs = Profile.objects.filter(
            user_id__in=partner_ids,
            is_online=True
        ).values_list('user_id', flat=True)
        return list(qs)

    @staticmethod
    @database_sync_to_async
    def get_undelivered_messages(user_id: int) -> List[Dict[str, Any]]:
        try:
            user = User.objects.get(id=user_id)
            conversations = user.conversations.all()
            messages = Message.objects.filter(
                conversation__in=conversations,
                is_delivered=False
            ).exclude(sender_id=user_id)
            return list(messages.values('id', 'sender_id', 'conversation_id'))
        except User.DoesNotExist:
            return []

    @staticmethod
    @database_sync_to_async
    def bulk_mark_messages_delivered(message_ids: List[int]) -> None:
        Message.objects.filter(id__in=message_ids).update(is_delivered=True)

    @staticmethod
    @database_sync_to_async
    def is_participant(user_id: int, conversation_id: int) -> bool:
        try:
            conv = Conversation.objects.get(id=conversation_id)
            return conv.participants.filter(id=user_id).exists()
        except Conversation.DoesNotExist:
            return False

    @staticmethod
    @database_sync_to_async
    def save_message(
        conversation_id: int,
        sender_id: int,
        text: str,
        reply_to_id: Optional[int] = None,
        voice_note: Optional[str] = None,
        client_id: Optional[str] = None
    ) -> Tuple[Message, bool]:
        try:
            conv = Conversation.objects.get(id=conversation_id)
            participants = list(conv.participants.all())
            if len(participants) == 2:
                other_user = participants[0] if participants[1].id == sender_id else participants[1]
                sender = participants[1] if participants[1].id == sender_id else participants[0]
                if Block.objects.filter(blocker=other_user, blocked=sender).exists():
                    raise Exception("You are blocked by this user")
                if Block.objects.filter(blocker=sender, blocked=other_user).exists():
                    raise Exception("You have blocked this user")
        except Conversation.DoesNotExist:
            raise Exception("Conversation not found")

        reply_to = None
        if reply_to_id:
            try:
                reply_to = Message.objects.get(id=reply_to_id)
            except Message.DoesNotExist:
                pass

        with transaction.atomic():
            max_seq = Message.objects.filter(conversation_id=conversation_id).aggregate(Max('seq_num'))['seq_num__max'] or 0
            seq_num = max_seq + 1

            if client_id:
                msg, created = Message.objects.get_or_create(
                    client_id=client_id,
                    defaults={
                        'conversation_id': conversation_id,
                        'sender_id': sender_id,
                        'text': text,
                        'reply_to': reply_to,
                        'voice_note': voice_note,
                        'seq_num': seq_num
                    }
                )
            else:
                msg = Message.objects.create(
                    conversation_id=conversation_id,
                    sender_id=sender_id,
                    text=text,
                    reply_to=reply_to,
                    voice_note=voice_note,
                    seq_num=seq_num
                )
                created = True

            if created:
                Conversation.objects.filter(id=conversation_id).update(updated_at=timezone.now())
        return msg, created

    @staticmethod
    @database_sync_to_async
    def mark_message_read(message_id: int) -> None:
        Message.objects.filter(id=message_id).update(is_read=True, is_delivered=True)

    @staticmethod
    @database_sync_to_async
    def mark_all_messages_read(conversation_id: int, user_id: int) -> List[int]:
        unread_msgs = Message.objects.filter(
            conversation_id=conversation_id,
            is_read=False
        ).exclude(sender_id=user_id)
        marked_ids = list(unread_msgs.values_list('id', flat=True))
        if marked_ids:
            unread_msgs.update(is_read=True, is_delivered=True)
        return marked_ids

    @staticmethod
    @database_sync_to_async
    def toggle_reaction(message_id: int, user_id: int, emoji: str) -> List[Dict[str, Any]]:
        reaction, created = Reaction.objects.get_or_create(
            message_id=message_id,
            user_id=user_id,
            emoji=emoji
        )
        if not created:
            reaction.delete()
            
        updated_reactions = Reaction.objects.filter(message_id=message_id).select_related('user')
        return [
            {
                'id': r.id,
                'user': r.user_id,
                'username': r.user.username,
                'emoji': r.emoji
            } for r in updated_reactions
        ]

    @staticmethod
    @database_sync_to_async
    def edit_message(message_id: int, user_id: int, new_text: str) -> bool:
        try:
            msg = Message.objects.get(id=message_id, sender_id=user_id)
            msg.text = new_text
            msg.is_edited = True
            msg.save(update_fields=['text', 'is_edited'])
            return True
        except Message.DoesNotExist:
            return False

    @staticmethod
    @database_sync_to_async
    def delete_message_everyone(message_id: int, user_id: int) -> bool:
        try:
            msg = Message.objects.get(id=message_id, sender_id=user_id)
            msg.text = "This message was deleted."
            msg.voice_note = None
            msg.is_edited = False
            msg.save(update_fields=['text', 'voice_note', 'is_edited'])
            msg.attachments.all().delete()
            msg.reactions.all().delete()
            return True
        except Message.DoesNotExist:
            return False

    @staticmethod
    @database_sync_to_async
    def delete_message_me(message_id: int, user_id: int) -> None:
        try:
            msg = Message.objects.get(id=message_id)
            msg.deleted_for_users.add(user_id)
        except Message.DoesNotExist:
            pass

    @staticmethod
    @database_sync_to_async
    def toggle_message_pin(message_id: int) -> bool:
        try:
            msg = Message.objects.get(id=message_id)
            msg.is_pinned = not msg.is_pinned
            msg.save(update_fields=['is_pinned'])
            return msg.is_pinned
        except Message.DoesNotExist:
            return False
