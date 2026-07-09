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