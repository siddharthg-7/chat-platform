from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .models import Notification
from .serializers import NotificationSerializer

class NotificationListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        notifications = request.user.notifications.all()
        serializer = NotificationSerializer(notifications, many=True)
        return Response(serializer.data)

class MarkNotificationReadView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, notification_id):
        try:
            notification = request.user.notifications.get(id=notification_id)
            notification.is_read = True
            notification.save()
            return Response(status=status.HTTP_200_OK)
        except Notification.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

class SavePushSubscriptionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        data = request.data
        endpoint = data.get('endpoint')
        keys = data.get('keys', {})
        auth = keys.get('auth')
        p256dh = keys.get('p256dh')

        if not endpoint or not auth or not p256dh:
            return Response({"error": "Invalid subscription data"}, status=status.HTTP_400_BAD_REQUEST)

        from .models import PushSubscription
        sub, created = PushSubscription.objects.get_or_create(
            user=request.user,
            endpoint=endpoint,
            defaults={'auth': auth, 'p256dh': p256dh}
        )
        if not created:
            sub.auth = auth
            sub.p256dh = p256dh
            sub.save()

        return Response(status=status.HTTP_201_CREATED)
