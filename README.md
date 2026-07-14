# One to One Chat Platform
This is the foundational boilerplate for a scalable, production-ready Real-Time Chat Platform designed for a team of 27 developers. 

## Project Architecture
- **Frontend**: React 19, Vite, Tailwind CSS, Axios, React Router DOM
- **Backend API**: Python 3.13+, Django, Django REST Framework, JWT Auth
- **Realtime / WebSockets**: Django Channels, Channels Redis
- **Database**: PostgreSQL
- **Infrastructure**: Docker, Docker Compose, Nginx (Reverse Proxy)

## Folder Structure
```
chat-platform/
├── backend/       # Django API and WebSocket server
├── frontend/      # React + Vite SPA
├── docs/          # Architecture and setup documentation
├── docker/        # Docker and Nginx configurations
├── .github/       # Contribution and PR/Issue templates
├── docker-compose.yml
└── README.md
```

## Installation & Running

### Requirements
- Docker and Docker Compose
- Node.js (for local frontend dev)
- Python 3.13+ (for local backend dev)

### Environment Setup
1. Copy `backend/.env.example` to `backend/.env`
2. Populate the required environment variables.
   > **Note**: `SECRET_KEY` is strictly required and must be provided in the `.env` file or environment variables. The application will fail to start if it is missing. `DEBUG` defaults to `False` for security; ensure you set `DEBUG=True` for local development. `CORS_ALLOWED_ORIGINS` can be passed as a comma-separated list of allowed frontend domains for production.

### WebSocket Authentication Strategy
The Django backend secures WebSockets by validating JWTs via the `JWTAuthMiddleware`. 
- **Production**: It reads the token from the standard `Authorization` header (`scope['headers']`).
- **Development Fallback**: Since the standard browser `WebSocket` API does not support custom headers natively, a fallback mechanism reads the JWT from the query string (e.g. `ws://...?token=your_jwt`). This query parameter passing is restricted to development use cases and should be handled with short-lived tokens.

### Running with Docker (Recommended)
```bash
docker-compose up --build
```
This spins up PostgreSQL, Redis (required for WebSocket Channels), Django Backend, Vite Frontend, and Nginx.

### Running Local Backend
**Note**: The backend relies on PostgreSQL and Redis. You must start the database containers first before running the backend locally.
```bash
# Start DB and Redis
docker-compose up -d db redis

# Run local Django server
cd backend
python -m venv venv
# Activate venv (Windows: venv\Scripts\activate | macOS/Linux: source venv/bin/activate)
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Running Local Frontend
```bash
cd frontend
npm install
npm run dev
```

## Git Workflow
We follow a standard GitFlow process:
- `main` - Stable, production-ready code.
- `develop` - Integration branch for features.
- `feature/*` - Feature development branches.
- `bugfix/*` - Bug fix branches.

## Contribution Guide
Please read `CONTRIBUTING.md` for our code of conduct, pull request process, and coding standards. Make sure to adhere to PEP8/Black for Python, and ESLint/Prettier for JavaScript.
