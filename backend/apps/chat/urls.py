from django.urls import path
from .views import ConversationListView, MessageListView, SendMessageView

urlpatterns = [
    path("conversations/", ConversationListView.as_view(), name="conversation-list"),
    path("messages/<int:conversation_id>/", MessageListView.as_view(), name="message-list"),
    path("send/", SendMessageView.as_view(), name="send-message"),
]