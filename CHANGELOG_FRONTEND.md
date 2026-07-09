# Frontend Changelog

All notable changes to the frontend of this project will be documented in this file.

## [Unreleased]
### Added
- **State Management**: Integrated `@reduxjs/toolkit` and `react-redux`. Created `store.js`, `authSlice.js`, and `chatSlice.js`.
- **API Services**: Added `api.js` (Axios instance with JWT interceptors), `auth.service.js`, and `chat.service.js` to communicate with the Django REST API.
- **Protected Routes**: Added a `ProtectedRoute` component to prevent unauthorized access to the application.
- **WebSocket Integration**: Updated `websocket.js` to connect securely using the JWT token and dispatch real-time events (messages, presence, read receipts) directly to the Redux store.

### Changed
- **App Routing**: Wrapped the Dashboard, Chat, Profile, and Settings routes in `<ProtectedRoute>`.
- **Auth Pages**: Converted the static forms in `Login.jsx` and `Signup.jsx` into controlled React forms that hit the real backend authentication endpoints. Also modified to accept standard `username` based on Django defaults.
- **Chat Page**: Refactored `Chat.jsx` to consume conversations and messages from the Redux store instead of static mock data. Sending messages now hits the `/api/chat/send/` endpoint and broadcasts via WebSockets.
