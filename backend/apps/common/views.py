from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.db import connection, OperationalError


class HealthCheckView(APIView):
    """
    Public health check endpoint.
    Returns real connectivity status for the database and Redis channel layer.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        # --- Database ---
        db_ok = False
        try:
            connection.ensure_connection()
            db_ok = True
        except OperationalError:
            db_ok = False

        # --- Redis (channel layer) ---
        redis_ok = False
        try:
            from channels.layers import get_channel_layer
            import asyncio
            layer = get_channel_layer()
            if layer is not None:
                asyncio.run(layer.send("health_check", {"type": "health.ping"}))
                redis_ok = True
        except Exception:
            redis_ok = False

        status_code = 200 if (db_ok and redis_ok) else 503

        return Response(
            {
                "database": "ok" if db_ok else "error",
                "redis": "ok" if redis_ok else "error",
            },
            status=status_code,
        )

