import logging

from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser
from channels.db import database_sync_to_async
from channels.middleware import BaseMiddleware
from urllib.parse import parse_qs

logger = logging.getLogger(__name__)

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
        
        # Read from query string
        if not token:
            query_string = scope.get('query_string', b'').decode()
            if query_string:
                parsed_qs = parse_qs(query_string)
                if 'token' in parsed_qs:
                    token = parsed_qs['token'][0]

        # Read from Sec-WebSocket-Protocol (Browser WebSocket API workaround)
        if not token:
            # Check scope['subprotocols'] which is populated by ASGI servers
            subprotocols = scope.get('subprotocols', [])
            if len(subprotocols) >= 2 and subprotocols[0] == 'access_token':
                token = subprotocols[1]
            else:
                # Fallback to headers just in case
                sec_protocol = headers.get(b'sec-websocket-protocol', b'').decode()
                if sec_protocol:
                    protocols = [p.strip() for p in sec_protocol.split(',')]
                    if len(protocols) >= 2 and protocols[0] == 'access_token':
                        token = protocols[1]

        if token:
            try:
                # Use SimpleJWT AccessToken to validate expiry, token type, and blacklist
                from rest_framework_simplejwt.tokens import AccessToken
                validated_token = AccessToken(token)
                user_id = validated_token['user_id']
                scope['user'] = await get_user(user_id)
            except Exception as e:
                logger.warning("JWT authentication failed: %s", e)
                scope['user'] = AnonymousUser()
        else:
            scope['user'] = AnonymousUser()

        return await super().__call__(scope, receive, send)
