import jwt
from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser
from channels.db import database_sync_to_async
from channels.middleware import BaseMiddleware
from urllib.parse import parse_qs

User = get_user_model()

@database_sync_to_async
def get_user(user_id):
    try:
        return User.objects.get(id=user_id)
    except User.DoesNotExist:
        return AnonymousUser()

class JWTAuthMiddleware(BaseMiddleware):
    async def __call__(self, scope, receive, send):
        # Read from Authorization header first
        headers = dict(scope.get('headers', []))
        auth_header = headers.get(b'authorization', b'').decode()
        
        token = None
        if auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
        
        # Fallback to query string for development (Browser WebSocket API limitation)
        if not token:
            query_string = scope.get('query_string', b'').decode()
            query_params = parse_qs(query_string)
            token = query_params.get('token', [None])[0]

        if token:
            try:
                # Use SimpleJWT AccessToken to validate expiry, token type, and blacklist
                from rest_framework_simplejwt.tokens import AccessToken
                validated_token = AccessToken(token)
                user_id = validated_token['user_id']
                scope['user'] = await get_user(user_id)
            except Exception:
                scope['user'] = AnonymousUser()
        else:
            scope['user'] = AnonymousUser()

        return await super().__call__(scope, receive, send)
