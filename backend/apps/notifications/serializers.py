from rest_framework import serializers
from .models import Notification

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'type', 'content', 'is_read', 'created_at']
        read_only_fields = ['id', 'type', 'content', 'created_at']
