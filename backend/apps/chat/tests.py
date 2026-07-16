import json

import redis
from channels.db import database_sync_to_async
from channels.testing import WebsocketCommunicator
from config.asgi import application
from django.conf import settings
from django.contrib.auth import get_user_model
from django.test import TestCase, TransactionTestCase
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import AccessToken

from apps.chat.models import Conversation, Message
from apps.chat.serializers import ConversationSerializer, MessageSerializer

User = get_user_model()


# ---------------------------------------------------------------------------
# ORM helpers for use inside async test methods
# ---------------------------------------------------------------------------

@database_sync_to_async
def create_user(username, password='pw'):
    return User.objects.create_user(username=username, password=password)


@database_sync_to_async
def create_conversation(*participants):
    c = Conversation.objects.create()
    c.participants.add(*participants)
    return c


# ---------------------------------------------------------------------------
# Model-level tests
# ---------------------------------------------------------------------------

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


# ---------------------------------------------------------------------------
# Serializer tests
# ---------------------------------------------------------------------------

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


# ---------------------------------------------------------------------------
# WebSocket / consumer tests
# ---------------------------------------------------------------------------

class ChatConsumerTests(TransactionTestCase):
    def setUp(self):
        # Use the synchronous redis client — no asyncio.run(), no .aclose()
        # compatibility issues across redis-py versions.
        r = redis.Redis.from_url(settings.REDIS_URL)
        r.flushdb()
        r.close()

    async def test_websocket_connect_and_message(self):
        # Create users and conversation via sync-to-async helpers so the
        # ORM calls are safe inside the async test context.
        user1 = await create_user('ws_user1')
        user2 = await create_user('ws_user2')
        conversation = await create_conversation(user1, user2)

        # Generate JWT for user1
        token = str(AccessToken.for_user(user1))

        # Connect user1
        communicator = WebsocketCommunicator(
            application,
            "/ws/chat/",
            subprotocols=["access_token", token]
        )
        connected, subprotocol = await communicator.connect()
        self.assertTrue(connected)

        # Consume initial online_users message
        initial_response = await communicator.receive_json_from()
        self.assertEqual(initial_response['action'], 'online_users')

        # Connect user2 to trigger a presence broadcast to user1
        token2 = str(AccessToken.for_user(user2))
        communicator2 = WebsocketCommunicator(
            application,
            "/ws/chat/",
            subprotocols=["access_token", token2]
        )
        connected2, subprotocol2 = await communicator2.connect()
        self.assertTrue(connected2)

        # Consume initial online_users message for user2
        initial_response2 = await communicator2.receive_json_from()
        self.assertEqual(initial_response2['action'], 'online_users')

        # Receive user_online presence broadcast on user1's communicator
        response = await communicator.receive_json_from()
        self.assertEqual(response['action'], 'user_online')
        self.assertEqual(response['user_id'], user2.id)

        # Send a message — client_id is required by the dispatcher
        await communicator.send_json_to({
            "action": "send_message",
            "text": "Hello consumer!",
            "temp_id": "temp-123",
            "client_id": "client-abc-123",
            "conversation_id": conversation.id
        })

        # Expect message_ack back to the sender
        ack_response = await communicator.receive_json_from()
        self.assertEqual(ack_response['action'], 'message_ack')
        self.assertEqual(ack_response['temp_id'], "temp-123")
        self.assertIn('message_id', ack_response)

        # Expect the broadcast to the conversation group
        broadcast_response = await communicator.receive_json_from()
        self.assertEqual(broadcast_response['action'], 'receive_message')
        self.assertEqual(broadcast_response['text'], 'Hello consumer!')
        self.assertEqual(broadcast_response['sender_id'], user1.id)

        await communicator.disconnect()
        await communicator2.disconnect()


# ---------------------------------------------------------------------------
# REST API tests
# ---------------------------------------------------------------------------

class ChatAPITests(TestCase):

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
            {"user_id": self.user1.id},
            format="json"
        )
        self.assertIn(response.status_code, [200, 201])
