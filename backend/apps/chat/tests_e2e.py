import json
from django.test import TestCase, TransactionTestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from apps.chat.models import Conversation, Message, Attachment
from channels.testing import WebsocketCommunicator
from config.asgi import application
from rest_framework_simplejwt.tokens import AccessToken
from io import BytesIO
from django.core.files.uploadedfile import SimpleUploadedFile

User = get_user_model()


class ChatE2EWebsocketTests(TransactionTestCase):
    async def test_websocket_message_and_reaction(self):
        # create users and conversation
        user1 = await User.objects.acreate_user(username='e2e_ws_user1', password='pw')
        user2 = await User.objects.acreate_user(username='e2e_ws_user2', password='pw')

        conv = await Conversation.objects.acreate()
        await conv.participants.aadd(user1, user2)

        token1 = str(AccessToken.for_user(user1))
        token2 = str(AccessToken.for_user(user2))

        # connect communicators
        comm1 = WebsocketCommunicator(application, f"/ws/chat/{conv.id}/", subprotocols=["access_token", token1])
        connected1, _ = await comm1.connect()
        assert connected1

        comm2 = WebsocketCommunicator(application, f"/ws/chat/{conv.id}/", subprotocols=["access_token", token2])
        connected2, _ = await comm2.connect()
        assert connected2

        # comm1 send a message
        await comm1.send_json_to({
            "action": "send_message",
            "text": "Hello E2E",
            "temp_id": "temp-e2e-1"
        })

        # ack to sender
        ack = await comm1.receive_json_from()
        assert ack["action"] == "message_ack"
        assert ack["temp_id"] == "temp-e2e-1"
        message_id = ack.get('message_id')
        assert message_id is not None

        # broadcast received by comm1 (server echo) and comm2
        # There may be presence or other events interleaved; wait until we see the receive_message
        def _is_receive(msg):
            return isinstance(msg, dict) and msg.get('action') == 'receive_message'

        # read up to 5 events to find receive_message for comm1
        b1 = None
        for _ in range(5):
            ev = await comm1.receive_json_from()
            if _is_receive(ev):
                b1 = ev
                break
        assert b1 is not None and b1['action'] == 'receive_message'

        # same for comm2
        b2 = None
        for _ in range(5):
            ev = await comm2.receive_json_from()
            if _is_receive(ev):
                b2 = ev
                break
        assert b2 is not None and b2['action'] == 'receive_message'

        # comm2 reacts to the message
        await comm2.send_json_to({
            'action': 'react',
            'message_id': message_id,
            'emoji': '👍'
        })

        # both should receive reaction_added (allow other interleaved events)
        async def _find_reaction(comm):
            for _ in range(6):
                ev = await comm.receive_json_from()
                if isinstance(ev, dict) and ev.get('action') in ('reaction_added', 'reaction_removed'):
                    return ev
            return None

        r1 = await _find_reaction(comm1)
        r2 = await _find_reaction(comm2)
        assert r1 is not None and r1['action'] == 'reaction_added'
        assert r2 is not None and r2['action'] == 'reaction_added'
        assert r1['message_id'] == message_id
        assert r2['message_id'] == message_id

        await comm1.disconnect()
        await comm2.disconnect()


class ChatE2EFileUploadTests(TestCase):
    def test_file_upload_via_rest(self):
        client = APIClient()
        user1 = User.objects.create_user(username='e2e_file_user1', password='pw')
        user2 = User.objects.create_user(username='e2e_file_user2', password='pw')
        conv = Conversation.objects.create()
        conv.participants.add(user1, user2)

        client.force_authenticate(user=user1)

        # create a small text file
        file_content = b"Hello from E2E test"
        uploaded = SimpleUploadedFile('hello.txt', file_content, content_type='text/plain')

        resp = client.post('/api/chat/send/', {'conversation_id': conv.id, 'text': 'File message', 'files': uploaded}, format='multipart')
        assert resp.status_code == 201
        data = resp.json()
        # verify attachment present
        assert 'attachments' in data
        assert len(data['attachments']) >= 1
        # verify DB row
        msg = Message.objects.get(id=data['id'])
        assert msg.attachments.count() >= 1
