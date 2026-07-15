from django.urls import path
from .views import (
    ConversationListView,
    CreateGroupConversationView,
    ConversationDetailView,
    ToggleMuteConversationView,
    MessageListView,
    SendMessageView,
    ToggleReactionView,
    GroupUpdateView,
    GroupMemberActionView,
    GroupLeaveView,
    ToggleStarView,
)

urlpatterns = [
    path("conversations/", ConversationListView.as_view(), name="conversation-list"),
    path("conversations/group/", CreateGroupConversationView.as_view(), name="conversation-group-create"),
    path("conversations/<int:conversation_id>/", ConversationDetailView.as_view(), name="conversation-detail"),
    path("conversations/<int:conversation_id>/mute/", ToggleMuteConversationView.as_view(), name="conversation-mute"),
    path("messages/<int:conversation_id>/", MessageListView.as_view(), name="message-list"),
    path("messages/<int:message_id>/react/", ToggleReactionView.as_view(), name="toggle-reaction"),
    path("send/", SendMessageView.as_view(), name="send-message"),
    path("group/<int:conversation_id>/", GroupUpdateView.as_view(), name="group-update"),
    path("group/<int:conversation_id>/members/", GroupMemberActionView.as_view(), name="group-member-action"),
    path("group/<int:conversation_id>/leave/", GroupLeaveView.as_view(), name="group-leave"),
    path("messages/<int:message_id>/star/", ToggleStarView.as_view(), name="toggle-star"),
]