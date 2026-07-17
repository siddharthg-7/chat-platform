# Professional Deployment Guide

This guide outlines how to deploy the Chat Application in a professional production environment using Docker, Nginx, PostgreSQL, and Redis.

## Prerequisites

1. A Linux server (e.g., Ubuntu 22.04 LTS on DigitalOcean, AWS EC2, or Linode).
2. Domain name pointed to your server's IP address.
3. Docker and Docker Compose installed on the server.
4. An SSL/TLS certificate (e.g., via Let's Encrypt / Certbot).

## Step 1: Environment Variables Setup

On your production server, create the `.env` file inside the `backend` directory with strong credentials:

```bash
# backend/.env
SECRET_KEY=your_super_secret_production_key_here
DEBUG=False
ALLOWED_HOSTS=yourdomain.com,api.yourdomain.com
FRONTEND_URL=https://yourdomain.com
CORS_ALLOWED_ORIGINS=https://yourdomain.com

DATABASE_ENGINE=django.db.backends.postgresql
DATABASE_NAME=chatdb
DATABASE_USER=chatuser
DATABASE_PASSWORD=strong_db_password
DATABASE_HOST=db
DATABASE_PORT=5432

REDIS_URL=redis://redis:6379/0

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret

# VAPID (Web Push)
VAPID_PUBLIC_KEY=your_public_key
VAPID_PRIVATE_KEY=your_private_key
```

## Step 2: Build and Run with Docker Compose

We've optimized the `docker-compose.yml` and `Dockerfile` to use **Gunicorn** with **Uvicorn** workers. This provides robust multi-threaded, asynchronous processing which handles thousands of simultaneous WebSockets effortlessly (acting just like WhatsApp's backend architecture).

Run the application in detached mode:

```bash
docker-compose up --build -d
```

### What happens during startup?
1. **Nginx** builds the React frontend statically.
2. **Backend** installs dependencies (including `uvicorn[standard]` for native C-extension WebSockets).
3. The `entrypoint.sh` script automatically runs `collectstatic` and `migrate`.
4. Gunicorn starts binding on port 8000.

## Step 3: Nginx Reverse Proxy & SSL (Host Machine)

Your `docker-compose.yml` maps port 80 to the Nginx container. For a true production setup, you should use an Nginx reverse proxy on the host machine to handle SSL termination.

Install Certbot and get an SSL certificate:
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

Your host Nginx config (`/etc/nginx/sites-available/chatapp`) should look like this:

```nginx
server {
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:80; # Points to your Docker Nginx
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Specifically handle WebSockets with upgrade headers
    location /ws/ {
        proxy_pass http://localhost:80;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
        proxy_read_timeout 3600s;
        proxy_send_timeout 3600s;
    }

    listen 443 ssl; # Managed by Certbot
    # ... certbot ssl lines ...
}
```

## Troubleshooting & Maintenance

### Logs
The application is now configured to suppress noisy health-check logs. To view actual warnings or errors:
```bash
docker-compose logs --tail=100 -f backend
```

### Millisecond Messaging
Messages now process in milliseconds because:
1. We installed `uvicorn[standard]` (Cython-compiled websockets).
2. The event dispatcher is fully asynchronous.
3. Push notifications run in a non-blocking background thread.
4. The Redis rate limiter permits rapid burst transmissions (up to 50 messages/sec) when a client reconnects after being offline.
