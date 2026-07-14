from django.urls import path
from .views import (
    ConversationListView,
    CreateGroupConversationView,
    ConversationDetailView,
    ToggleMuteConversationView,
    MessageListView,
    SendMessageView,
)

urlpatterns = [
    path("conversations/", ConversationListView.as_view(), name="conversation-list"),
    path("conversations/group/", CreateGroupConversationView.as_view(), name="conversation-group-create"),
    path("conversations/<int:conversation_id>/", ConversationDetailView.as_view(), name="conversation-detail"),
    path("conversations/<int:conversation_id>/mute/", ToggleMuteConversationView.as_view(), name="conversation-mute"),
    path("messages/<int:conversation_id>/", MessageListView.as_view(), name="message-list"),
    path("send/", SendMessageView.as_view(), name="send-message"),
    path("messages/<int:message_id>/reactions/", MessageReactionView.as_view(), name="message-reactions"),
    path("muted/", MutedConversationsView.as_view(), name="muted-conversations"),
]