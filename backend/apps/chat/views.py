from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model
from .models import Conversation, Message, Attachment
from .serializers import ConversationSerializer, MessageSerializer
from .services import create_conversation, get_messages, send_message

User = get_user_model()

# -------------------------
# CONVERSATION API
# -------------------------
class ConversationListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        conversations = request.user.conversations.all()
        serializer = ConversationSerializer(conversations, many=True)
        return Response(serializer.data)

    def post(self, request):
        conversation, error = create_conversation(
            request.user,
            request.data.get("user_id")
        )

        if error:
            if error == "exists":
                serializer = ConversationSerializer(conversation)
                return Response(serializer.data, status=status.HTTP_200_OK)
            if error == "User not found":
                return Response(
                    {"error": error},
                    status=status.HTTP_404_NOT_FOUND
                )

            return Response(
                {"error": error},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = ConversationSerializer(conversation)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


# -------------------------
# MESSAGE LIST API
# -------------------------
class MessageListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, conversation_id):
        try:
            # Verify user has access to conversation
            conversation = request.user.conversations.get(id=conversation_id)
        except Conversation.DoesNotExist:
            return Response(
                {"error": "Conversation not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        messages = get_messages(conversation_id)
        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data)


# -------------------------
# SEND MESSAGE API
# -------------------------
class SendMessageView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        conversation_id = request.data.get("conversation")
        text = request.data.get("text", "")
        files = request.FILES.getlist("files")

        message, error = send_message(request.user, conversation_id, text, files)

        if error:
            if error == "Conversation not found":
                return Response(
                    {"error": error},
                    status=status.HTTP_404_NOT_FOUND
                )
            return Response(
                {"error": error},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = MessageSerializer(message)
        return Response(serializer.data, status=status.HTTP_201_CREATED)