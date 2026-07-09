# Backend Changelog - Phase 1

This file logs the modifications made to the backend to complete Phase 1 of the Real-Time One-to-One Messaging Platform.

## App Consolidation & Architecture
- **Removed `apps.conversations`**: Deleted the empty directory to prevent duplicate logic since the chat app handles this.
- **Removed from configuration**: Updated `config/settings.py` and `config/urls.py` to reflect the removal of `apps.conversations`.
- **Email Backend**: Configured `EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'` for local testing of password reset.
- **JWT Blacklist**: Added `rest_framework_simplejwt.token_blacklist` to `INSTALLED_APPS` for logout handling.

## User Management & Auth (`apps.accounts`)
- **Models (`models.py`)**: Added `Profile` model with `avatar`, `bio`, `is_online`, `last_seen` fields mapped one-to-one to the default `User` model.
- **Signals (`signals.py`)**: Added `post_save` hooks to automatically create/save a Profile when a User is created.
- **Serializers (`serializers.py`)**: Created `UserSerializer`, `ProfileSerializer`, and `SignupSerializer`.
- **Views (`views.py`)**: Implemented endpoints for `SignupView`, `LogoutView` (blacklisting token), `ProfileView` (get current user), and `UpdateProfileDetailsView`.
- **Tests (`tests.py`)**: Added basic tests covering signup and login endpoints.

## Chat & WebSockets (`apps.chat`)
- **Models (`models.py`)**: 
  - Enhanced `Conversation` model.
  - Enhanced `Message` model (added `is_read`, `is_delivered`).
  - Added new `Attachment` model linking to `Message`.
- **Serializers (`serializers.py`)**: Added `ConversationSerializer`, `MessageSerializer`, `AttachmentSerializer`.
- **Views (`views.py`)**: Created `ConversationListView` (list and create 1-1 conversations), `MessageListView` (list messages per room), and `SendMessageView` (handling text and file uploads).
- **WebSockets (`consumers.py` & `routing.py`)**: Implemented `ChatConsumer` for real-time bidirectional communication, supporting:
  - Online presence broadcasts
  - Sending real-time messages
  - Typing indicator broadcasts (`typing_start`, `typing_stop`)
  - Read receipts (`message_read`)

## Notifications (`apps.notifications`)
- **Models (`models.py`)**: Created `Notification` model to store system/message alerts.
- **Serializers & Views**: Created logic to list all notifications for the current user and mark individual notifications as read.

## ASGI & Middleware (`config/asgi.py`)
- **Custom JWT Auth**: Created `JWTAuthMiddleware` in `apps.accounts.middleware` to handle WebSocket authentication via the `?token=` query parameter.
- **Routing**: Wrapped the websocket protocol with the new Auth middleware and pointed it to the `apps.chat.routing`.

## Database Optimization (Indexes & ER)
- **Model Indexing**: Added `db_index=True` and composite database indexes (`models.Index`) to the `Message` and `Notification` models to speed up chat message retrieval and notification filtering by user and read state.
- **ER Diagram**: Formalized the schema into a mermaid Entity-Relationship diagram describing relations between User, Profile, Conversation, Message, Attachment, and Notification.
