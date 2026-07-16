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
            conversationmute__conversation=conversation
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
    # Dispatch Push Notifications
    from django.conf import settings
    from .models import PushSubscription
    import json
    import logging
    import threading

    logger = logging.getLogger(__name__)

    try:
        from pywebpush import webpush, WebPushException
    except ImportError:
        webpush = None

    def send_push_async():
        if webpush and getattr(settings, 'VAPID_PRIVATE_KEY', None):
            for user in recipients:
                if hasattr(user, 'profile') and not user.profile.is_online:
                    subs = PushSubscription.objects.filter(user=user)
                    payload = json.dumps({
                        "title": "New Message",
                        "body": f"{sender_username}: {snippet[:200]}",
                        "url": settings.FRONTEND_URL
                    })
                    
                    for sub in subs:
                        try:
                            webpush(
                                subscription_info={
                                    "endpoint": sub.endpoint,
                                    "keys": {
                                        "p256dh": sub.p256dh,
                                        "auth": sub.auth
                                    }
                                },
                                data=payload,
                                vapid_private_key=settings.VAPID_PRIVATE_KEY,
                                vapid_claims={"sub": "mailto:admin@example.com"}
                            )
                        except WebPushException as ex:
                            logger.error(f"Web push failed: {repr(ex)}")
                            if ex.response and ex.response.status_code in [404, 410]:
                                sub.delete()
                                
    # Run the push notification in a background thread to prevent blocking
    threading.Thread(target=send_push_async, daemon=True).start()

    return recipients
