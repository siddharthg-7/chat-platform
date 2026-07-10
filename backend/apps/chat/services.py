from django.contrib.auth.models import User
from django.db.models import Count
from .models import Conversation, Message


def create_conversation(user1, user2_id):
    if not user2_id:
        return None, "user_id is required"

    try:
        user2 = User.objects.get(id=user2_id)
    except User.DoesNotExist:
        return None, "User not found"

    # Check for an existing 1-on-1 conversation between these two users
    existing = (
        Conversation.objects
        .filter(participants=user1)
        .filter(participants=user2)
        .annotate(cnt=Count('participants'))
        .filter(cnt=2)
        .first()
    )
    if existing:
        return existing, None

    conversation = Conversation.objects.create()
    conversation.participants.add(user1, user2)

    return conversation, None


def get_messages(conversation_id):
    return Message.objects.filter(conversation_id=conversation_id)
def send_message(serializer, user):
    return serializer.save(sender=user)