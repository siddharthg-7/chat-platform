from django.contrib.auth import get_user_model
from django.db.models import Count
from ..models import Conversation

User = get_user_model()

def create_conversation(user1, user2_id):
    if not user2_id:
        return None, "user_id is required"

    try:
        user2 = User.objects.get(id=user2_id)
    except User.DoesNotExist:
        return None, "User not found"

    from apps.accounts.models import Block
    if Block.objects.filter(blocker=user2, blocked=user1).exists():
        return None, "You are blocked by this user"
    if Block.objects.filter(blocker=user1, blocked=user2).exists():
        return None, "You have blocked this user"

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
