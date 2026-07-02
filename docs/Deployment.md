# Deployment Guide

## Architecture
The production deployment uses Docker Compose to orchestrate the following services:
- **Nginx**: Reverse proxy to handle static files and route traffic to the Frontend/Backend.
- **Frontend**: Serves the Vite built static assets (via Nginx or a lightweight Node server).
- **Backend API**: Gunicorn for WSGI traffic.
- **Backend WebSocket**: Daphne for ASGI traffic.
- **PostgreSQL**: Production database.
- **Redis**: In-memory data store for caching and Channels layer.

## Process
*(Detailed deployment pipeline instructions placeholder)*
