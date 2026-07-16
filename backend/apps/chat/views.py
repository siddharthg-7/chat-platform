from rest_framework.views import APIView
from rest_framework import generics
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import CursorPagination
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from .models import Conversation, Message, Attachment, ConversationMute, Reaction
from .serializers import ConversationSerializer, MessageSerializer, ReactionSerializer
from .services import create_conversation

User = get_user_model()


from django.db.models import Prefetch, Count, Q, Exists, OuterRef

class ConversationListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        conversations = request.user.conversations.prefetch_related(
            'participants', 'participants__profile', 'admins'
        ).annotate(
            unread_count_annotated=Count(
                'messages',
                filter=Q(messages__is_read=False) & ~Q(messages__sender=request.user),
                distinct=True
            ),
            is_muted_annotated=Exists(
                ConversationMute.objects.filter(conversation=OuterRef('pk'), user=request.user)
            )
        ).order_by('-updated_at')

        conversation_list = list(conversations)
        conversation_ids = [c.id for c in conversation_list]

        if conversation_ids:
            # PostgreSQL specific: distinct on conversation_id requires sorting by it first
            latest_messages = Message.objects.filter(
                conversation_id__in=conversation_ids
            ).order_by('conversation_id', '-created_at').distinct('conversation_id').select_related(
                'sender', 'sender__profile'
            ).prefetch_related('attachments', 'reactions')

            last_message_map = {m.conversation_id: m for m in latest_messages}
        else:
            last_message_map = {}

        for c in conversation_list:
            c.prefetched_last_message = last_message_map.get(c.id)
            c.prefetched_unread_count = c.unread_count_annotated
            c.prefetched_is_muted = c.is_muted_annotated

        serializer = ConversationSerializer(conversation_list, many=True, context={'request': request})
        return Response(serializer.data)

    def post(self, request):
        conversation, error = create_conversation(request.user, request.data.get("user_id"))

        if error:
            if error == "exists":
                serializer = ConversationSerializer(conversation, context={'request': request})
                return Response(serializer.data, status=status.HTTP_200_OK)
            if error == "User not found":
                return Response({"error": error}, status=status.HTTP_404_NOT_FOUND)
            return Response({"error": error}, status=status.HTTP_400_BAD_REQUEST)

        serializer = ConversationSerializer(conversation, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class CreateGroupConversationView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        name = request.data.get("name", "").strip()
        member_ids = request.data.get("member_ids", [])

        if not name:
            return Response({"error": "Group name is required"}, status=status.HTTP_400_BAD_REQUEST)
        if not isinstance(member_ids, list) or len(member_ids) < 2:
            return Response({"error": "Select at least 2 members"}, status=status.HTTP_400_BAD_REQUEST)

        members = User.objects.filter(id__in=member_ids)
        if members.count() != len(member_ids):
            return Response({"error": "One or more users not found"}, status=status.HTTP_404_NOT_FOUND)

        conversation = Conversation.objects.create(is_group=True, name=name, admin=request.user)
        conversation.participants.add(request.user, *members)
        conversation.admins.add(request.user)

        serializer = ConversationSerializer(conversation, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class ConversationDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, conversation_id):
        conversation = get_object_or_404(request.user.conversations, id=conversation_id)
        conversation.participants.remove(request.user)
        if conversation.participants.count() == 0:
            conversation.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class ToggleMuteConversationView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, conversation_id):
        conversation = get_object_or_404(request.user.conversations, id=conversation_id)
        mute, created = ConversationMute.objects.get_or_create(conversation=conversation, user=request.user)
        if not created:
            mute.delete()
            return Response({"is_muted": False})
        return Response({"is_muted": True})


class MessagePagination(CursorPagination):
    page_size = 50
    ordering = '-created_at'


class MessageListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = MessageSerializer
    pagination_class = MessagePagination

    def get_queryset(self):
        conversation_id = self.kwargs.get('conversation_id')
        try:
            conversation = self.request.user.conversations.get(id=conversation_id)
            return conversation.messages.select_related('sender', 'sender__profile').prefetch_related('attachments', 'reactions', 'starred_by').all()
        except Conversation.DoesNotExist:
            return Message.objects.none()


class SendMessageView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        conversation_id = request.data.get("conversation_id")
        text = request.data.get("text", "")
        files = request.FILES.getlist('files')

        if not conversation_id:
            print("ERROR: conversation_id is required")
            return Response({"error": "conversation_id is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            conversation = request.user.conversations.get(id=conversation_id)
        except Conversation.DoesNotExist:
            print("ERROR: Conversation not found")
            return Response({"error": "Conversation not found"}, status=status.HTTP_404_NOT_FOUND)

        if not text and not files:
            print("ERROR: Message text or file is required")
            return Response({"error": "Message text or file is required"}, status=status.HTTP_400_BAD_REQUEST)

        ALLOWED_EXTENSIONS = ('.png', '.jpg', '.jpeg', '.gif', '.pdf', '.doc', '.docx', '.txt', '.webm', '.ogg', '.mp3', '.wav', '.m4a')
        MAX_FILE_SIZE = 5 * 1024 * 1024

        for file in files:
            if file.size > MAX_FILE_SIZE:
                print(f"ERROR: File {file.name} exceeds 5MB limit.")
                return Response({"error": f"File {file.name} exceeds 5MB limit."}, status=status.HTTP_400_BAD_REQUEST)
            if not file.name.lower().endswith(ALLOWED_EXTENSIONS):
                print(f"ERROR: File {file.name} has unsupported type.")
                return Response({"error": f"File {file.name} has unsupported type."}, status=status.HTTP_400_BAD_REQUEST)

        from apps.common.cloudinary_service import upload_attachment
        import mimetypes

        is_voice_note = request.data.get("is_voice_note") in ["true", True, "True"]

        message = Message.objects.create(conversation=conversation, sender=request.user, text=text)

        if is_voice_note and files:
            file_url = upload_attachment(files[0], files[0].name)
            message.voice_note = file_url
            message.save()
        else:
            for file in files:
                file_url = upload_attachment(file, file.name)
                mime_type, _ = mimetypes.guess_type(file.name)
                if not mime_type:
                    mime_type = "application/octet-stream"

                Attachment.objects.create(
                    message=message,
                    file_url=file_url,
                    file_name=file.name,
                    file_size=file.size,
                    mime_type=mime_type
                )

        conversation.save()

        serializer = MessageSerializer(message)

        # Create in-app notifications for recipients
        from apps.notifications.services import create_message_notifications
        create_message_notifications(
            conversation.id,
            request.user.id,
            request.user.username,
            text,
            message.voice_note,
        )

        # Broadcast the newly created message to all participants' WebSocket groups
        from asgiref.sync import async_to_sync
        from channels.layers import get_channel_layer
        
        channel_layer = get_channel_layer()
        if channel_layer:
            participant_ids = list(conversation.participants.values_list('id', flat=True))
            for p_id in participant_ids:
                async_to_sync(channel_layer.group_send)(
                    f'user_{p_id}',
                    {
                        'type': 'chat_event',
                        'event': {
                            'action': 'receive_message',
                            'message_id': message.id,
                            'conversation_id': conversation.id,
                            'text': message.text,
                            'sender_id': request.user.id,
                            'sender_username': request.user.username,
                            'created_at': str(message.created_at),
                            'reply_to_id': message.reply_to_id,
                            'voice_note': message.voice_note,
                            'is_read': message.is_read,
                            'is_delivered': message.is_delivered,
                            'attachments': serializer.data.get('attachments', [])
                        }
                    }
                )

        return Response(serializer.data, status=status.HTTP_201_CREATED)


class ToggleReactionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, message_id):
        emoji = request.data.get("emoji")
        if not emoji:
            return Response({"error": "emoji is required"}, status=status.HTTP_400_BAD_REQUEST)

        message = get_object_or_404(Message, id=message_id)
        
        reaction, created = Reaction.objects.get_or_create(
            message=message,
            user=request.user,
            emoji=emoji
        )
        
        if not created:
            reaction.delete()
            return Response({"status": "removed"}, status=status.HTTP_200_OK)
            
        serializer = ReactionSerializer(reaction)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class GroupUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, conversation_id):
        conversation = get_object_or_404(Conversation, id=conversation_id, is_group=True)
        
        # Check if user is admin
        if not (conversation.admin == request.user or conversation.admins.filter(id=request.user.id).exists()):
            return Response({"error": "Only group admins can update group settings."}, status=status.HTTP_403_FORBIDDEN)
            
        name = request.data.get("name")
        avatar_file = request.FILES.get("avatar")
        cover_file = request.FILES.get("cover")
        
        if name is not None:
            name_str = name.strip()
            if not name_str:
                return Response({"error": "Group name cannot be empty."}, status=status.HTTP_400_BAD_REQUEST)
            conversation.name = name_str

        from apps.common.cloudinary_service import upload_attachment
        
        if avatar_file:
            avatar_url = upload_attachment(avatar_file, f"group_{conversation_id}_avatar")
            conversation.avatar = avatar_url
            
        if cover_file:
            cover_url = upload_attachment(cover_file, f"group_{conversation_id}_cover")
            conversation.cover = cover_url
            
        conversation.save()
        serializer = ConversationSerializer(conversation, context={'request': request})
        return Response(serializer.data)


class GroupMemberActionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, conversation_id):
        conversation = get_object_or_404(Conversation, id=conversation_id, is_group=True)
        
        # Check if user is admin
        if not (conversation.admin == request.user or conversation.admins.filter(id=request.user.id).exists()):
            return Response({"error": "Only group admins can perform member actions."}, status=status.HTTP_403_FORBIDDEN)
            
        action = request.data.get("action") # 'promote', 'remove', 'add'
        target_user_id = request.data.get("user_id")
        
        if not action or not target_user_id:
            return Response({"error": "action and user_id are required."}, status=status.HTTP_400_BAD_REQUEST)
            
        target_user = get_object_or_404(User, id=target_user_id)
        
        if action == "promote":
            if not conversation.participants.filter(id=target_user.id).exists():
                return Response({"error": "User is not a participant of this group."}, status=status.HTTP_400_BAD_REQUEST)
            conversation.admins.add(target_user)
            conversation.save()
            
        elif action == "remove":
            if target_user == request.user:
                return Response({"error": "Cannot remove yourself. Use leave group instead."}, status=status.HTTP_400_BAD_REQUEST)
            conversation.participants.remove(target_user)
            conversation.admins.remove(target_user)
            conversation.save()
            
        elif action == "add":
            conversation.participants.add(target_user)
            conversation.save()
            
        else:
            return Response({"error": "Invalid action."}, status=status.HTTP_400_BAD_REQUEST)
            
        serializer = ConversationSerializer(conversation, context={'request': request})
        return Response(serializer.data)


class GroupLeaveView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, conversation_id):
        conversation = get_object_or_404(Conversation, id=conversation_id, is_group=True)
        
        if not conversation.participants.filter(id=request.user.id).exists():
            return Response({"error": "You are not a participant of this group."}, status=status.HTTP_400_BAD_REQUEST)
            
        # Remove from participants and admins
        conversation.participants.remove(request.user)
        is_admin = conversation.admins.filter(id=request.user.id).exists()
        if is_admin:
            conversation.admins.remove(request.user)
            
        remaining_participants = conversation.participants.all()
        if remaining_participants.count() == 0:
            conversation.delete()
            return Response({"status": "deleted"}, status=status.HTTP_200_OK)
            
        # If no admins remaining, promote the next oldest participant
        if is_admin and conversation.admins.count() == 0:
            next_admin = remaining_participants.first()
            conversation.admins.add(next_admin)
            conversation.admin = next_admin
            conversation.save()
            
        return Response({"status": "left"}, status=status.HTTP_200_OK)


class ToggleStarView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, message_id):
        message = get_object_or_404(Message, id=message_id)
        if message.starred_by.filter(id=request.user.id).exists():
            message.starred_by.remove(request.user)
            return Response({"starred": False}, status=status.HTTP_200_OK)
        else:
            message.starred_by.add(request.user)
            return Response({"starred": True}, status=status.HTTP_200_OK)