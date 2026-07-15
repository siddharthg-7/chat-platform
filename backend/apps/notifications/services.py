from .models import Notification


def create_message_notifications(
    conversation_id,
    sender_id,
    sender_username,
    text="",
    voice_note=None,
):
    """Create a Notification row for every conversation participant except the
    sender (and except participants who have muted the conversation)."""
    from apps.chat.models import Conversation

    try:
        conversation = Conversation.objects.get(id=conversation_id)
    except Conversation.DoesNotExist:
        return []

    recipients = list(
        conversation.participants.exclude(id=sender_id).exclude(
            mutes__conversation=conversation
        )
    )
    if not recipients:
        return []

    snippet = text or ("Voice note" if voice_note else "Attachment")
    notifications = [
        Notification(
            user=user,
            type="message",
            content=f"{sender_username}: {snippet[:200]}",
        )
        for user in recipients
    ]
    Notification.objects.bulk_create(notifications)
    return recipients
