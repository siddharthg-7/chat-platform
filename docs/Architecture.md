# Architecture Documentation

## System Overview
- **Frontend**: React application bundled with Vite. Connects via HTTP/REST to the API and WebSocket for real-time events.
- **Backend API**: Django REST Framework serving stateless HTTP requests.
- **Backend Channels**: Django Channels serving WebSocket connections.
- **Database**: PostgreSQL for persistent relational data.
- **Cache/Message Broker**: Redis, used by Django Channels for real-time inter-process communication.

## Infrastructure
All services are containerized and orchestrated via Docker Compose.
