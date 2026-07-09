from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.models import User
from .models import Conversation, Message, Attachment
from .serializers import ConversationSerializer, MessageSerializer
from .services import create_conversation, get_messages, send_message
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
        messages = get_messages(conversation_id)
        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data)

# -------------------------
# SEND MESSAGE API
# -------------------------
class SendMessageView(APIView):
    def post(self, request):
        serializer = MessageSerializer(data=request.data)

        if serializer.is_valid():
            send_message(serializer, request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)