# Render Deployment Guide

Render is a fantastic PaaS (Platform as a Service) that simplifies deploying containerized applications. This guide will walk you through deploying the Chat App onto Render.

## Prerequisites
- A [Render](https://render.com/) account.
- Your code must be pushed to a GitHub, GitLab, or Bitbucket repository.
- Your `.env` secrets (Cloudinary keys, VAPID keys, JWT secret, etc.) ready to be copied.

---

## Step 1: Get Your Neon Database URL

Since your database is hosted on **Neon**, you don't need to create a database on Render.

1. Go to your [Neon Dashboard](https://console.neon.tech/).
2. Select your project.
3. In the **Connection Details** widget on the dashboard, ensure the role and database are correct.
4. Copy the **Postgres connection string** (it will look like `postgresql://user:password@ep-cool-snowflake-123456.us-east-2.aws.neon.tech/dbname?sslmode=require`).
5. Save this string. You will use it as your `DATABASE_URL` in Step 3.

---

## Step 2: Create the Redis Instance (Key Value)

1. Go to your Render Dashboard and click **New +** -> **Key Value**.
2. **Name**: `chatapp-redis`.
3. Select your region (must match the Neon database region if possible, or your web service region).
4. Click **Create Key Value**.
5. Once created, copy the **Internal Connection String**. You will use this as your `REDIS_URL`.

---

## Step 3: Deploy the Backend (Django + Channels)

1. Go to your Render Dashboard and click **New +** -> **Web Service**.
2. Connect your GitHub/GitLab repository.
3. In the setup form, configure the following:
   - **Name**: `chatapp-backend`
   - **Root Directory**: `backend` (Important! This tells Render where your backend Dockerfile is).
   - **Environment**: `Docker`
   - **Region**: Match the database and Redis region.
4. Scroll down to **Advanced** -> **Environment Variables**. Add the following:
   - `SECRET_KEY`: `<generate_a_secure_random_string>`
   - `DEBUG`: `False`
   - `ALLOWED_HOSTS`: `*` (Render handles routing, though restricting it to your frontend URL later is better).
   - `CORS_ALLOWED_ORIGINS`: `https://your-frontend-render-url.onrender.com` (You can update this after deploying the frontend).
   - `DATABASE_URL`: Paste the **Neon connection string** from Step 1.
   - `REDIS_URL`: Paste the **Internal Redis URL** from Step 2.
   - `CLOUDINARY_CLOUD_NAME`: `<your_cloudinary_name>`
   - `CLOUDINARY_API_KEY`: `<your_cloudinary_key>`
   - `CLOUDINARY_API_SECRET`: `<your_cloudinary_secret>`
   - `VAPID_PUBLIC_KEY`: `<your_vapid_public>`
   - `VAPID_PRIVATE_KEY`: `<your_vapid_private>`
5. Click **Create Web Service**. 
6. Render will build the Docker container using `backend/Dockerfile` and execute `entrypoint.sh` automatically (collecting static files and migrating the database). 
7. Once deployed, copy the Backend URL (e.g., `https://chatapp-backend.onrender.com`).

---

## Step 4: Deploy the Frontend (React / Nginx)

1. Go to your Render Dashboard and click **New +** -> **Web Service** (Yes, Web Service, not Static Site, because we are using Docker + Nginx for routing).
2. Connect your repository.
3. Configure the following:
   - **Name**: `chatapp-frontend`
   - **Root Directory**: `frontend`
   - **Environment**: `Docker`
4. Go to **Advanced** -> **Environment Variables**. Add:
   - `VITE_API_URL`: Paste the Backend URL you copied in Step 3 (e.g., `https://chatapp-backend.onrender.com/api`)
   - `VITE_WS_URL`: Change the protocol of your Backend URL to `wss` (e.g., `wss://chatapp-backend.onrender.com/ws/chat`)
5. Click **Create Web Service**.
6. Render will use `frontend/Dockerfile` to build the React app and serve it using Nginx.

---

## Step 5: Final Configuration

1. Go back to your **Backend** service on Render.
2. Update the `CORS_ALLOWED_ORIGINS` and `FRONTEND_URL` environment variables to precisely match your newly generated **Frontend URL**.
3. Trigger a manual deploy of the backend if it doesn't automatically restart.

Your app is now live! WebSockets will work natively over Render's load balancers (they support WebSocket upgrades out of the box), and PostgreSQL/Redis will communicate securely over Render's internal private network.
