from django.db import models
from django.conf import settings


class Conversation(models.Model):
    participants = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        related_name="conversations"
    )
    is_group = models.BooleanField(default=False)
    name = models.CharField(max_length=255, blank=True, null=True)
    admin = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name="administered_groups"
    )
    admins = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        related_name="administered_conversations",
        blank=True
    )
    avatar = models.CharField(max_length=1024, null=True, blank=True)
    cover = models.CharField(max_length=1024, null=True, blank=True)
    pinned_by = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name="pinned_conversations", blank=True)
    archived_by = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name="archived_conversations", blank=True)
    unread_by = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name="unread_conversations", blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name or f"Conversation {self.id}"


class ConversationMute(models.Model):
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name="mutes")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    muted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("conversation", "user")


class Message(models.Model):
    client_id = models.CharField(max_length=255, unique=True, null=True, blank=True)
    seq_num = models.IntegerField(default=0, db_index=True)
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name="messages")
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="sent_messages")
    text = models.TextField(blank=True)
    is_read = models.BooleanField(default=False)
    is_delivered = models.BooleanField(default=False)
    reply_to = models.ForeignKey('self', null=True, blank=True, on_delete=models.SET_NULL, related_name="replies")
    is_edited = models.BooleanField(default=False)
    is_pinned = models.BooleanField(default=False)
    deleted_for_users = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name="deleted_messages", blank=True)
    starred_by = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name="starred_messages", blank=True)
    voice_note = models.CharField(max_length=1024, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ["seq_num", "created_at"]
        indexes = [models.Index(fields=['conversation', 'seq_num', 'created_at'])]

    def __str__(self):
        if self.voice_note:
            return "Voice Note"
        return self.text[:30] if self.text else "Attachment"


class Attachment(models.Model):
    message = models.ForeignKey(Message, on_delete=models.CASCADE, related_name="attachments")
    file_url = models.CharField(max_length=1024, default="")
    file_name = models.CharField(max_length=255, blank=True, null=True)
    file_size = models.IntegerField(blank=True, null=True)
    mime_type = models.CharField(max_length=100, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)


class Reaction(models.Model):
    message = models.ForeignKey(Message, on_delete=models.CASCADE, related_name="reactions")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    emoji = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("message", "user", "emoji")