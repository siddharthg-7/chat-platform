from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Notification(models.Model):
    NOTIFICATION_TYPES = (
        ('message', 'New Message'),
        ('system', 'System Alert'),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')

    type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES, default='message')
    content = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'is_read', '-created_at']),
        ]

    def __str__(self):
        return f"{self.type} - {self.user.username}"


class PushSubscription(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='push_subscriptions')
    endpoint = models.URLField(max_length=500)
    auth = models.CharField(max_length=100)
    p256dh = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Push Sub for {self.user.username}"
