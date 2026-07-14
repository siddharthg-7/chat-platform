from django.contrib.auth import get_user_model
from django.db.models import Count
from .models import Conversation, Message, Attachment

User = get_user_model()

def create_conversation(user1, user2_id):
    if not user2_id:
        return None, "user_id is required"

    try:
        user2 = User.objects.get(id=user2_id)
    except User.DoesNotExist:
        return None, "User not found"

    # Check for an existing 1-on-1 conversation between these two users
    existing_conv = (
        Conversation.objects
        .filter(participants=user1)
        .filter(participants=user2)
        .annotate(cnt=Count('participants'))
        .filter(cnt=2)
        .first()
    )
    if existing_conv:
        return existing_conv, "exists"

    conversation = Conversation.objects.create()
    conversation.participants.add(user1, user2)

    return conversation, None


def get_messages(conversation_id):
    return Message.objects.filter(conversation_id=conversation_id).order_by("created_at")
def send_message(user, conversation_id, text, files=None):
    if not conversation_id:
        return None, "conversation is required"

    try:
        conversation = user.conversations.get(id=conversation_id)
    except Conversation.DoesNotExist:
        return None, "Conversation not found"

    if not text and not files:
        return None, "Message text or file is required"

    message = Message.objects.create(
        conversation=conversation,
        sender=user,
        text=text
    )

    if files:
        for file in files:
            Attachment.objects.create(message=message, file=file)

    conversation.save()  # Update conversation updated_at
    return message, None
    return Message.objects.filter(conversation_id=conversation_id).order_by("created_at")