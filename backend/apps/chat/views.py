from rest_framework import viewsets, permissions, status, views
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
from .models import Conversation, Message
from .serializers import ConversationSerializer, MessageSerializer, UserSerializer

class ConversationViewSet(viewsets.ModelViewSet):
    serializer_class = ConversationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return self.request.user.conversations.all()

    @action(detail=False, methods=['post'])
    def start(self, request):
        username = request.data.get('username')
        try:
            target_user = User.objects.get(username=username)
        except User.DoesNotExist:
            return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

        if target_user == request.user:
            return Response({'error': 'Cannot start conversation with yourself.'}, status=status.HTTP_400_BAD_REQUEST)

        # Find existing conversation
        conversation = Conversation.objects.filter(participants=request.user).filter(participants=target_user).first()
        if not conversation:
            conversation = Conversation.objects.create()
            conversation.participants.add(request.user, target_user)

        serializer = self.get_serializer(conversation)
        return Response(serializer.data)

class MessageViewSet(viewsets.ModelViewSet):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        conversation_id = self.request.query_params.get('conversation_id')
        if conversation_id:
            return Message.objects.filter(conversation_id=conversation_id, conversation__participants=self.request.user)
        return Message.objects.filter(conversation__participants=self.request.user)

    def perform_create(self, serializer):
        serializer.save(sender=self.request.user)

class LoginView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            return Response(UserSerializer(user).data)
        return Response({'error': 'Invalid Credentials'}, status=status.HTTP_401_UNAUTHORIZED)

class LogoutView(views.APIView):
    def post(self, request):
        logout(request)
        return Response(status=status.HTTP_204_NO_CONTENT)

class SignupView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        if User.objects.filter(username=username).exists():
            return Response({'error': 'Username already exists'}, status=status.HTTP_400_BAD_REQUEST)
        user = User.objects.create_user(username=username, password=password)
        login(request, user)
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)

class CurrentUserView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)
