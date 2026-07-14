from django.urls import path
from .views import ConversationListView, MessageListView, SendMessageView, ConversationDetailView, MessageReactionView, MutedConversationsView

urlpatterns = [
    path("conversations/", ConversationListView.as_view(), name="conversation-list"),
    path("conversations/<int:conversation_id>/", ConversationDetailView.as_view(), name="conversation-detail"),
    path("messages/<int:conversation_id>/", MessageListView.as_view(), name="message-list"),
    path("send/", SendMessageView.as_view(), name="send-message"),
    path("messages/<int:message_id>/reactions/", MessageReactionView.as_view(), name="message-reactions"),
    path("muted/", MutedConversationsView.as_view(), name="muted-conversations"),
]