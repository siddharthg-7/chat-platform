# Real-Time Chat Platform

A scalable, secure, and real-time chat platform built with modern web architecture. This project follows the exact structure outlined in the Team-B architecture specification.

## 🚀 Features

- **Authentication**: User Registration, Login, Logout, and Protected Routes (Session Authentication).
- **Messaging**: Real-time one-to-one messaging with conversation history.
- **Modern UI**: Built with React, Vite, and responsive CSS.
- **Robust Backend**: Powered by Django and Django REST Framework.
- **Database**: PostgreSQL integrated via Docker Compose.

## 🛠️ Tech Stack

### Backend
- Python
- Django
- Django REST Framework
- PostgreSQL

### Frontend
- React
- Vite
- TypeScript
- Axios
- React Router

### Infrastructure
- Docker & Docker Compose

## 📁 Project Structure

```text
project-name/
├── backend/                  # Django Backend
│   ├── apps/                 # Modular Django apps (chat, users, etc.)
│   ├── config/               # Django project settings
│   ├── .env                  # Environment variables
│   ├── requirements.txt      # Python dependencies
│   └── manage.py
├── frontend/                 # React Frontend
│   ├── src/                  # React components, pages, services
│   ├── public/               # Static assets
│   └── package.json
├── docs/                     # Documentation
├── assets/                   # Media & Assets
├── docker/                   # Docker scripts & config
├── .github/                  # GitHub Actions (CI/CD)
├── docker-compose.yml        # Infrastructure setup
├── start.bat                 # One-click startup script
└── stop.bat                  # One-click shutdown script
```

## ⚙️ Quick Start

### Prerequisites
- Node.js (v18+)
- Python (v3.10+)
- Docker Desktop

### Environment Setup
A `.env` file is used to manage sensitive configuration in the `backend/` directory. Create `backend/.env` with the following variables:
```env
DEBUG=True
SECRET_KEY=your_secret_key
DB_NAME=chatdb
DB_USER=chatuser
DB_PASSWORD=chatpassword
DB_HOST=127.0.0.1
DB_PORT=5433
```

### Running the Application

For a frictionless development experience, you can use the provided batch scripts (Windows):

1. **Start the environment:**
   Double-click the `start.bat` file in the root directory. This will start the PostgreSQL database via Docker, launch the Django backend server, and start the React frontend server automatically in separate terminal windows.

2. **Access the application:**
   Open your browser and navigate to `http://localhost:5173`.

3. **Stop the environment:**
   When you are done, double-click the `stop.bat` file. This will safely tear down the Docker containers and terminate the Node and Python development processes.

---
_Developed based on the Team-B Project Scope_
