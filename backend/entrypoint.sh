#!/bin/sh

# Ensure directories exist
mkdir -p /app/static /app/media

# Collect static files and migrate
echo "Collecting static files..."
python manage.py collectstatic --noinput

echo "Running migrations..."
python manage.py migrate

# Start Gunicorn with Uvicorn workers
echo "Starting Gunicorn..."
exec gunicorn config.asgi:application -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:${PORT:-8000} --workers 2 --threads 4 --timeout 120
