from rest_framework import serializers
from .models import Conversation, Message, Attachment, ConversationMute, Reaction
from apps.accounts.serializers import UserSerializer


class AttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attachment
        fields = ['id', 'file_url', 'file_name', 'file_size', 'mime_type', 'created_at']


class ReactionSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Reaction
        fields = ['id', 'user', 'username', 'emoji', 'created_at']
        read_only_fields = ['id', 'user', 'created_at']


class MessageSerializer(serializers.ModelSerializer):
    attachments = AttachmentSerializer(many=True, read_only=True)
    reactions = ReactionSerializer(many=True, read_only=True)
    sender = UserSerializer(read_only=True)
    reply_to = serializers.SerializerMethodField()
    starred = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = [
            'id', 'client_id', 'seq_num', 'conversation', 'sender', 'text', 'is_read', 'is_delivered',
            'attachments', 'reactions', 'created_at', 'reply_to', 'voice_note',
            'is_edited', 'is_pinned', 'starred'
        ]
        read_only_fields = ['id', 'sender', 'is_read', 'is_delivered', 'created_at']

    def get_reply_to(self, obj):
        if obj.reply_to:
            return {
                'id': obj.reply_to.id,
                'sender': obj.reply_to.sender.username,
                'text': obj.reply_to.text
            }
        return None

    def get_starred(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        
        # Use in-memory data if prefetched
        if hasattr(obj, '_prefetched_objects_cache') and 'starred_by' in obj._prefetched_objects_cache:
            return any(u.id == request.user.id for u in obj.starred_by.all())
            
        return obj.starred_by.filter(id=request.user.id).exists()


class ConversationSerializer(serializers.ModelSerializer):
    participants = UserSerializer(many=True, read_only=True)
    admins = UserSerializer(many=True, read_only=True)
    last_message = serializers.SerializerMethodField()
    is_muted = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()
    is_pinned = serializers.SerializerMethodField()
    is_archived = serializers.SerializerMethodField()
    is_unread = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = [
            'id', 'participants', 'is_group', 'name', 'admin',
            'admins', 'avatar', 'cover',
            'last_message', 'is_muted', 'unread_count',
            'is_pinned', 'is_archived', 'is_unread',
            'created_at', 'updated_at',
        ]

    def get_last_message(self, obj):
        if hasattr(obj, 'prefetched_last_message'):
            last_message = obj.prefetched_last_message
        else:
            last_message = obj.messages.order_by('-created_at').first()
            
        if last_message:
            return MessageSerializer(last_message).data
        return None

    def get_is_muted(self, obj):
        if hasattr(obj, 'prefetched_is_muted'):
            return obj.prefetched_is_muted
            
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        return obj.mutes.filter(user=request.user).exists()

    def get_unread_count(self, obj):
        if hasattr(obj, 'prefetched_unread_count'):
            return obj.prefetched_unread_count
            
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return 0
        return obj.messages.filter(is_read=False).exclude(sender=request.user).count()

    def get_is_pinned(self, obj):
        if hasattr(obj, 'prefetched_is_pinned'):
            return obj.prefetched_is_pinned
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        return obj.pinned_by.filter(id=request.user.id).exists()

    def get_is_archived(self, obj):
        if hasattr(obj, 'prefetched_is_archived'):
            return obj.prefetched_is_archived
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        return obj.archived_by.filter(id=request.user.id).exists()

    def get_is_unread(self, obj):
        if hasattr(obj, 'prefetched_is_unread'):
            return obj.prefetched_is_unread
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        return obj.unread_by.filter(id=request.user.id).exists()