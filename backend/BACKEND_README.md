# Backend Documentation

This document explains the role and function of every significant file and directory within the Django REST Framework backend of the Chat Platform.

## Directory Structure

### Root Backend Files
- **`manage.py`**: The central command-line utility for Django. It's used to run the server (`runserver`), apply database migrations (`migrate`), and create new apps (`startapp`).
- **`requirements.txt`**: Lists all Python packages required to run the backend (e.g., Django, djangorestframework, psycopg2, python-dotenv).
- **`.env`** (Referenced from Project Root): Stores secure environment variables like database credentials. Loaded dynamically so sensitive information is kept out of source code.

### `config/` Directory (Project Core)
This directory acts as the control center for the entire Django project.
- **`settings.py`**: Contains all the core configurations for the project. This includes Database connections, Installed Apps, Security settings (CORS, CSRF), Authentication setups, and Environment Variable loading.
- **`urls.py`**: The global URL routing file. It intercepts incoming HTTP requests and routes them to the appropriate application URLs (in this case, forwarding `/api/` traffic to the `chat` app).
- **`wsgi.py` & `asgi.py`**: Entry points for production web servers. WSGI is for synchronous deployment, while ASGI is configured for future asynchronous capabilities (like WebSockets).

### `apps/chat/` Directory (Main Application)
This directory contains the actual business logic, API endpoints, and database models for the chat functionality.
- **`models.py`**: Defines the database schema using Python classes. It dictates how `Conversations` and `Messages` are structured and linked to Django's built-in `User` model.
- **`serializers.py`**: Acts as a translator. It converts complex querysets and model instances from `models.py` into native Python datatypes that can easily be rendered into JSON for the frontend to consume.
- **`views.py`**: Contains the core logic for the API endpoints. It defines what happens when the frontend requests a resource (e.g., fetching messages, logging in, or creating a new conversation). It uses Django Rest Framework's ViewSets and APIViews.
- **`urls.py`**: Maps specific API endpoints (like `/messages/` or `/auth/login/`) to the corresponding logic defined in `views.py`.
- **`admin.py`**: Registers models with the Django Admin panel, allowing administrators to view and manage Conversations and Messages through a GUI.
- **`apps.py`**: Configuration for the specific `chat` app module.
