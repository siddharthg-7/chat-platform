import logging
import redis.asyncio as redis
from django.conf import settings
from django.utils import timezone
from apps.accounts.models import Profile
from django.contrib.auth import get_user_model
from apps.chat.models import Conversation
from channels.db import database_sync_to_async

User = get_user_model()
logger = logging.getLogger(__name__)

# Single async Redis client for presence tracking
redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)

class PresenceService:
    @staticmethod
    async def increment_connections(user_id: int) -> int:
        return await redis_client.incr(f"user:{user_id}:connections")

    @staticmethod
    async def decrement_connections(user_id: int) -> int:
        active_connections = await redis_client.decr(f"user:{user_id}:connections")
        if active_connections < 0:
            await redis_client.set(f"user:{user_id}:connections", 0)
            return 0
        return active_connections

    @staticmethod
    @database_sync_to_async
    def initialize_user_session(user_id: int, active_connections: int) -> dict:
        partner_ids = list(User.objects.filter(
            conversations__participants=user_id
        ).exclude(id=user_id).values_list('id', flat=True).distinct())

        currently_online = Profile.objects.filter(user_id=user_id, is_online=True).exists()
        should_transition_online = (active_connections == 1) or (not currently_online)

        if should_transition_online:
            Profile.objects.filter(user_id=user_id).update(
                is_online=True,
                last_seen=timezone.now()
            )

        conversation_ids = list(Conversation.objects.filter(participants=user_id).values_list('id', flat=True))

        online_partners = list(Profile.objects.filter(
            user_id__in=partner_ids,
            is_online=True
        ).values_list('user_id', flat=True))

        return {
            'partner_ids': partner_ids,
            'conversation_ids': conversation_ids,
            'online_partners': online_partners,
            'transitioned_online': should_transition_online
        }

    @staticmethod
    @database_sync_to_async
    def set_online_status_db(user_id: int, is_online: bool) -> None:
        try:
            Profile.objects.filter(user_id=user_id).update(
                is_online=is_online,
                last_seen=timezone.now()
            )
        except Exception as e:
            logger.error(f"Failed to set user online status in DB for user {user_id}: {e}")

    @staticmethod
    @database_sync_to_async
    def update_last_seen(user_id: int) -> None:
        try:
            Profile.objects.filter(user_id=user_id).update(last_seen=timezone.now())
        except Exception as e:
            logger.error(f"Failed to update last_seen for user {user_id}: {e}")

    @staticmethod
    async def broadcast_presence(channel_layer, user_id: int, action: str, partner_ids: list[int]) -> None:
        for partner_id in partner_ids:
            await channel_layer.group_send(
                f'user_{partner_id}',
                {
                    'type': 'presence_status',
                    'action': action,
                    'user_id': user_id
                }
            )
