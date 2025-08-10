import logging
from channels.middleware import BaseMiddleware
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from django.core.exceptions import ObjectDoesNotExist

User = get_user_model()
logger = logging.getLogger(__name__)


class JWTAuthMiddleware(BaseMiddleware):
    async def __call__(self, scope, receive, send):
        # Get token from query parameters or headers
        token = None
        
        # Check query parameters first
        query_string = scope.get('query_string', b'').decode('utf-8')
        if query_string:
            params = dict(item.split('=') for item in query_string.split('&') if '=' in item)
            token = params.get('token')
        
        # If no token in query params, check headers
        if not token:
            headers = dict(scope['headers'])
            auth_header = headers.get(b'authorization', b'').decode('utf-8')
            if auth_header.startswith('Bearer '):
                token = auth_header.split(' ')[1]
        
        # Authenticate user
        if token:
            try:
                user = await self.get_user_from_token(token)
                if user:
                    scope['user'] = user
                    logger.info(f"WebSocket authenticated user: {user.username}")
                else:
                    logger.warning("WebSocket authentication failed: user not found")
            except (InvalidToken, TokenError, ObjectDoesNotExist) as e:
                logger.warning(f"WebSocket authentication error: {str(e)}")
                pass
        else:
            logger.warning("WebSocket connection attempt without token")
        
        return await super().__call__(scope, receive, send)

    @database_sync_to_async
    def get_user_from_token(self, token):
        """Get user from JWT token"""
        try:
            access_token = AccessToken(token)
            user_id = access_token['user_id']
            return User.objects.get(id=user_id)
        except (InvalidToken, TokenError, ObjectDoesNotExist, KeyError):
            return None 