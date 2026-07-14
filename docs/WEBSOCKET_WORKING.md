# WebSocket Working Documentation

> **Note:** This document explains the internal implementation and workflow of the WebSocket module. The WebSocket connection URL, message formats, and event payloads are documented separately in **WEBSOCKET_PROTOCOL.md**.

---

# 1. Overview

The Chat Platform uses **Django Channels** to provide real-time communication between authenticated users. Unlike traditional HTTP communication, WebSockets establish a persistent connection between the client and the server, enabling instant message delivery without repeatedly creating new HTTP requests.

The WebSocket module is responsible for:

- Real-time messaging
- User online/offline presence
- Typing indicators
- Read receipts
- JWT-based authentication
- Redis-based event broadcasting

---

# 2. Architecture

```
                 React Frontend
                        │
                        ▼
            WebSocket Connection
                        │
                        ▼
          JWT Authentication Middleware
                        │
                        ▼
                 URL Router (ASGI)
                        │
                        ▼
                  ChatConsumer
                        │
                        ▼
              Redis Channel Layer
                        │
        ┌───────────────┴───────────────┐
        │                               │
      User A                        User B
```

## Components

| Component | Responsibility |
|-----------|----------------|
| React Frontend | Opens and manages WebSocket connection |
| JWT Middleware | Authenticates users before connection |
| URL Router | Maps WebSocket URL to ChatConsumer |
| ChatConsumer | Handles all WebSocket events |
| Redis | Broadcasts events between connected users |
| PostgreSQL | Stores conversations and messages |

---

# 3. Connection Lifecycle

Whenever a user opens a conversation, the frontend creates a WebSocket connection.

```
Client
   │
Connect
   │
JWT Authentication
   │
Conversation Validation
   │
Join Redis Group
   │
Connection Accepted
   │
Broadcast Online Status
```

## Connection Steps

### Step 1 – Authentication

The JWT token is validated using the custom authentication middleware.

If authentication fails, the connection is immediately closed.

---

### Step 2 – Conversation Validation

The conversation ID is extracted from the URL.

Example:

```
ws://localhost/ws/chat/15/
```

The server verifies that the authenticated user belongs to the requested conversation.

---

### Step 3 – Join Redis Group

Each conversation has a dedicated Redis group.

Example:

```
chat_15
```

The connected user joins this group using:

```python
group_add()
```

---

### Step 4 – Accept Connection

After successful validation,

```python
await self.accept()
```

is executed and the WebSocket connection becomes active.

---

### Step 5 – Presence Update

The user's profile is updated:

```
is_online = True
```

The server broadcasts:

```
user_online
```

to every participant in the conversation.

---

# 4. ChatConsumer Workflow

The **ChatConsumer** is the core component responsible for handling all WebSocket communication.

## connect()

Executed whenever a client establishes a WebSocket connection.

Responsibilities:

- Authenticate user
- Validate conversation membership
- Join Redis group
- Accept WebSocket connection
- Update online status
- Broadcast presence

---

## disconnect()

Executed when the client disconnects.

Responsibilities:

- Remove user from Redis group
- Update last seen timestamp
- Mark user offline
- Broadcast offline event

---

## receive()

Processes incoming WebSocket events from the client.

Supported actions:

- send_message
- typing_start
- typing_stop
- message_read
- ping

Based on the received action, the appropriate handler is executed.

---

# 5. Message Processing

When a user sends a message, the following workflow is executed.

```
Frontend
     │
send_message
     │
receive()
     │
save_message()
     │
PostgreSQL
     │
group_send()
     │
Redis
     │
Other Participants
```

## Processing Steps

### 1. Receive Message

The frontend sends a `send_message` event.

### 2. Rate Limiting

The server checks the number of messages sent within the last minute.

Current limit:

```
30 messages per minute
```

### 3. Save Message

The message is stored in the PostgreSQL database.

Stored information includes:

- Conversation
- Sender
- Message text
- Timestamp

### 4. Acknowledge Sender

The sender receives a `message_ack` event containing the official message ID.

### 5. Broadcast Message

The server broadcasts a `receive_message` event to every participant in the Redis group.

---

# 6. Typing Indicators

Typing indicators are temporary events and are not stored in the database.

Workflow:

```
User Starts Typing
        │
typing_start
        │
ChatConsumer
        │
Redis
        │
Other Participant
```

When typing stops, the client sends:

```
typing_stop
```

The indicator is removed from the recipient's interface.

---

# 7. Read Receipts

Read receipts notify the sender that a message has been viewed.

Workflow:

```
Receiver Opens Message
        │
message_read
        │
ChatConsumer
        │
Update Database
        │
Redis
        │
Sender
```

The message status is updated by setting:

```
is_read = True
```

The server then broadcasts a `message_read` event.

---

# 8. User Presence

The application tracks user presence using the Profile model.

## On Connect

```
is_online = True
```

Broadcast:

```
user_online
```

## On Disconnect

```
is_online = False
last_seen = Current Timestamp
```

Broadcast:

```
user_offline
```

This allows other participants to view accurate online/offline status.

---

# 9. Redis Integration

Redis Channel Layer enables communication between connected WebSocket clients.

Each conversation corresponds to a Redis group.

Example:

```
Conversation 15

↓

chat_15
```

Whenever an event occurs, ChatConsumer executes:

```python
await self.channel_layer.group_send(...)
```

Redis broadcasts the event to every connected participant in that conversation.

---

# 10. Security Features

The WebSocket implementation includes several security measures.

- JWT Authentication
- Conversation participant validation
- Rate limiting
- Asynchronous database operations
- Protected private conversations

Only authenticated users who belong to the conversation are allowed to establish WebSocket connections.

---

# 11. Features Implemented

The current implementation supports:

- Real-time messaging
- Message acknowledgements
- Typing indicators
- Read receipts
- Online/Offline presence
- Heartbeat (Ping/Pong)
- Redis-based broadcasting
- JWT-secured WebSocket connections

---

# 12. Future Enhancements

Possible improvements include:

- Group chat support
- Message delivery status
- End-to-end encryption
- Voice and video calling
- Automatic reconnection
- Push notifications
- Message editing and deletion

---

# 13. Conclusion

The WebSocket module forms the core of the Chat Platform's real-time communication system. Using Django Channels, Redis, and ASGI, the platform maintains persistent WebSocket connections that allow users to exchange messages instantly while keeping conversation data synchronized across all connected clients.

JWT authentication, participant validation, and Redis-based broadcasting ensure that communication remains secure, scalable, and responsive. The modular implementation also provides a strong foundation for future enhancements such as group messaging, media sharing, and voice/video communication.
