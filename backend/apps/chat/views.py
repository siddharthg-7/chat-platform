from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from django.contrib.auth.models import User

from .models import Conversation, Message
from .serializers import ConversationSerializer, MessageSerializer


# -------------------------
# CONVERSATION API
# -------------------------
class ConversationListView(APIView):

    def get(self, request):
        conversations = Conversation.objects.all()
        serializer = ConversationSerializer(conversations, many=True)
        return Response(serializer.data)

    def post(self, request):
        user1 = request.user
        user2_id = request.data.get("user_id")

        if not user2_id:
            return Response(
                {"error": "user_id is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user2 = User.objects.get(id=user2_id)
        except User.DoesNotExist:
            return Response(
                {"error": "User not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        conversation = Conversation.objects.create()
        conversation.participants.add(user1, user2)

        serializer = ConversationSerializer(conversation)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


# -------------------------
# MESSAGE LIST API
# -------------------------
class MessageListView(APIView):

    def get(self, request, conversation_id):
        messages = Message.objects.filter(conversation_id=conversation_id)
        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data)


# -------------------------
# SEND MESSAGE API
# -------------------------
class SendMessageView(APIView):

    def post(self, request):
        serializer = MessageSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save(sender=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)