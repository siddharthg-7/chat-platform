from django.contrib.auth.models import User
from .models import Conversation, Message


def create_conversation(user1, user2_id):
    if not user2_id:
        return None, "user_id is required"

    try:
        user2 = User.objects.get(id=user2_id)
    except User.DoesNotExist:
        return None, "User not found"

    conversation = Conversation.objects.create()
    conversation.participants.add(user1, user2)

    return conversation, None


def get_messages(conversation_id):
    return Message.objects.filter(conversation_id=conversation_id)
def send_message(serializer, user):
    return serializer.save(sender=user)