from rest_framework.views import APIView
from rest_framework import generics
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import CursorPagination
from django.contrib.auth import get_user_model
from django.db.models import Count
from .models import Conversation, Message, Attachment
from .serializers import ConversationSerializer, MessageSerializer

User = get_user_model()

# -------------------------
# CONVERSATION API
# -------------------------
class ConversationListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        conversations = request.user.conversations.prefetch_related('participants', 'participants__profile').all()
        serializer = ConversationSerializer(conversations, many=True)
        return Response(serializer.data)

    def post(self, request):
        user2_id = request.data.get("user_id")
        if not user2_id:
            return Response({"error": "user_id is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user2 = User.objects.get(id=user2_id)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

        # Check if conversation already exists (exact 2 participants: request.user and user2)
        existing_convs = request.user.conversations.annotate(count=Count('participants')).filter(count=2, participants=user2)
        existing_conv = existing_convs.first()
        
        if existing_conv:
            serializer = ConversationSerializer(existing_conv)
            return Response(serializer.data, status=status.HTTP_200_OK)

        conversation = Conversation.objects.create()
        conversation.participants.add(request.user, user2)

        serializer = ConversationSerializer(conversation)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

# -------------------------
# MESSAGE LIST API
# -------------------------
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


# -------------------------
# SEND MESSAGE API
# -------------------------
class SendMessageView(APIView):
    permission_classes = [IsAuthenticated]  # This is our critical security fix!

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

        # File validation
        ALLOWED_EXTENSIONS = ('.png', '.jpg', '.jpeg', '.gif', '.pdf', '.doc', '.docx', '.txt')
        MAX_FILE_SIZE = 5 * 1024 * 1024 # 5 MB
        
        for file in files:
            if file.size > MAX_FILE_SIZE:
                return Response({"error": f"File {file.name} exceeds 5MB limit."}, status=status.HTTP_400_BAD_REQUEST)
            if not file.name.lower().endswith(ALLOWED_EXTENSIONS):
                return Response({"error": f"File {file.name} has unsupported type."}, status=status.HTTP_400_BAD_REQUEST)

        message = Message.objects.create(
            conversation=conversation,
            sender=request.user,
            text=text
        )

        for file in files:
            Attachment.objects.create(message=message, file=file)

        # Update conversation updated_at
        conversation.save()

        serializer = MessageSerializer(message)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
