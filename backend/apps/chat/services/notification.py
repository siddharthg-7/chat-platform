from channels.db import database_sync_to_async
from apps.notifications.services import create_message_notifications as _create_message_notifications

class NotificationService:
    @staticmethod
    @database_sync_to_async
    def create_message_notifications(
        conversation_id: int,
        sender_id: int,
        sender_username: str,
        text: str,
        voice_note: str = None
    ) -> None:
        _create_message_notifications(conversation_id, sender_id, sender_username, text, voice_note)
