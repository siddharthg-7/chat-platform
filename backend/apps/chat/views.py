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
from .services import create_conversation, get_messages, send_message

User = get_user_model()


class ConversationListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        conversations = request.user.conversations.prefetch_related(
            'participants', 'participants__profile', 'mutes'
        ).all()
        serializer = ConversationSerializer(conversations, many=True, context={'request': request})
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
            return conversation.messages.select_related('sender', 'sender__profile').prefetch_related('attachments').all()
        except Conversation.DoesNotExist:
            return Message.objects.none()


class SendMessageView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        conversation_id = request.data.get("conversation_id")
        text = request.data.get("text", "")
        files = request.FILES.getlist('files')

        if not conversation_id:
            return Response({"error": "conversation_id is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            conversation = request.user.conversations.get(id=conversation_id)
        except Conversation.DoesNotExist:
            return Response({"error": "Conversation not found"}, status=status.HTTP_404_NOT_FOUND)

        if not text and not files:
            return Response({"error": "Message text or file is required"}, status=status.HTTP_400_BAD_REQUEST)

        ALLOWED_EXTENSIONS = ('.png', '.jpg', '.jpeg', '.gif', '.pdf', '.doc', '.docx', '.txt')
        MAX_FILE_SIZE = 5 * 1024 * 1024

        for file in files:
            if file.size > MAX_FILE_SIZE:
                return Response({"error": f"File {file.name} exceeds 5MB limit."}, status=status.HTTP_400_BAD_REQUEST)
            if not file.name.lower().endswith(ALLOWED_EXTENSIONS):
                return Response({"error": f"File {file.name} has unsupported type."}, status=status.HTTP_400_BAD_REQUEST)

        message = Message.objects.create(conversation=conversation, sender=request.user, text=text)

        for file in files:
            Attachment.objects.create(message=message, file=file)

        conversation.save()

        serializer = MessageSerializer(message)
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