from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient

from .models import Conversation, Message


class ChatTests(TestCase):

    def setUp(self):
        self.client = APIClient()

        self.user1 = User.objects.create_user(
            username="user1",
            password="password123"
        )

        self.user2 = User.objects.create_user(
            username="user2",
            password="password123"
        )

        self.client.force_authenticate(user=self.user1)

        self.conversation = Conversation.objects.create()
        self.conversation.participants.add(self.user1, self.user2)

        self.message = Message.objects.create(
            conversation=self.conversation,
            sender=self.user1,
            text="Hello"
        )

    def test_message_creation(self):
        self.assertEqual(self.message.text, "Hello")
        self.assertEqual(self.message.sender, self.user1)
        self.assertEqual(self.message.conversation, self.conversation)

    def test_conversation_participants(self):
        participants = self.conversation.participants.all()

        self.assertIn(self.user1, participants)
        self.assertIn(self.user2, participants)

    def test_message_list_api(self):
        response = self.client.get(
            f"/api/chat/messages/{self.conversation.id}/"
        )

        self.assertEqual(response.status_code, 200)

    def test_create_conversation(self):
        response = self.client.post(
            "/api/chat/conversations/",
            {
                "user_id": self.user1.id
            },
            format="json"
        )

        self.assertIn(response.status_code, [200, 201])
import json
from django.test import TestCase, TransactionTestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from apps.chat.models import Conversation, Message
from apps.chat.serializers import ConversationSerializer, MessageSerializer
from channels.testing import WebsocketCommunicator
from config.asgi import application
from rest_framework_simplejwt.tokens import AccessToken

User = get_user_model()

class ChatModelTests(TestCase):
    def setUp(self):
        self.user1 = User.objects.create_user(username='test1', password='pw')
        self.user2 = User.objects.create_user(username='test2', password='pw')
        self.conversation = Conversation.objects.create()
        self.conversation.participants.add(self.user1, self.user2)

    def test_message_creation(self):
        message = Message.objects.create(
            conversation=self.conversation,
            sender=self.user1,
            text='Hello world'
        )
        self.assertEqual(message.text, 'Hello world')
        self.assertFalse(message.is_read)

class ChatSerializerTests(TestCase):
    def setUp(self):
        self.user1 = User.objects.create_user(username='test1', password='pw')
        self.conversation = Conversation.objects.create()
        self.conversation.participants.add(self.user1)

    def test_message_serializer(self):
        message = Message.objects.create(
            conversation=self.conversation,
            sender=self.user1,
            text='Test msg'
        )
        serializer = MessageSerializer(message)
        self.assertEqual(serializer.data['text'], 'Test msg')
        self.assertEqual(serializer.data['sender']['id'], self.user1.id)


class ChatConsumerTests(TransactionTestCase):
    async def test_websocket_connect_and_message(self):
        # Setup users and conversation
        user1 = await User.objects.acreate_user(username='ws_user1', password='pw')
        user2 = await User.objects.acreate_user(username='ws_user2', password='pw')
        
        conversation = await Conversation.objects.acreate()
        await conversation.participants.aadd(user1, user2)

        # Generate JWT for user1
        token = str(AccessToken.for_user(user1))

        # Connect user1
        communicator = WebsocketCommunicator(
            application,
            f"/ws/chat/{conversation.id}/?token={token}"
        )
        connected, subprotocol = await communicator.connect()
        self.assertTrue(connected)

        # Connect user2 to trigger presence broadcast for user1
        token2 = str(AccessToken.for_user(user2))
        communicator2 = WebsocketCommunicator(
            application,
            f"/ws/chat/{conversation.id}/?token={token2}"
        )
        connected2, subprotocol2 = await communicator2.connect()
        self.assertTrue(connected2)

        # Receive presence broadcast
        response = await communicator.receive_json_from()
        self.assertEqual(response['action'], 'user_online')
        self.assertEqual(response['user_id'], user2.id)

        # Send a message with temp_id
        await communicator.send_json_to({
            "action": "send_message",
            "text": "Hello consumer!",
            "temp_id": "temp-123"
        })

        # Expect message_ack for the sender
        ack_response = await communicator.receive_json_from()
        self.assertEqual(ack_response['action'], 'message_ack')
        self.assertEqual(ack_response['temp_id'], "temp-123")
        self.assertIn('message_id', ack_response)

        # Expect broadcasted chat_message
        broadcast_response = await communicator.receive_json_from()
        self.assertEqual(broadcast_response['action'], 'receive_message')
        self.assertEqual(broadcast_response['text'], 'Hello consumer!')
        self.assertEqual(broadcast_response['sender_id'], user1.id)

        await communicator.disconnect()
        await communicator2.disconnect()


class ChatTests(TestCase):

    def setUp(self):
        self.client = APIClient()

        self.user1 = User.objects.create_user(
            username="user1",
            password="password123"
        )

        self.user2 = User.objects.create_user(
            username="user2",
            password="password123"
        )

        self.client.force_authenticate(user=self.user1)

        self.conversation = Conversation.objects.create()
        self.conversation.participants.add(self.user1, self.user2)

        self.message = Message.objects.create(
            conversation=self.conversation,
            sender=self.user1,
            text="Hello"
        )

    def test_message_creation(self):
        self.assertEqual(self.message.text, "Hello")
        self.assertEqual(self.message.sender, self.user1)
        self.assertEqual(self.message.conversation, self.conversation)

    def test_conversation_participants(self):
        participants = self.conversation.participants.all()

        self.assertIn(self.user1, participants)
        self.assertIn(self.user2, participants)

    def test_message_list_api(self):
        response = self.client.get(
            f"/api/chat/messages/{self.conversation.id}/"
        )

        self.assertEqual(response.status_code, 200)

    def test_create_conversation(self):
        response = self.client.post(
            "/api/chat/conversations/",
            {
                "user_id": self.user1.id
            },
            format="json"
        )

        self.assertIn(response.status_code, [200, 201])
