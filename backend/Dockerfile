FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

RUN apt-get update && apt-get install -y \
    libpq-dev gcc \
    && rm -rf /var/lib/apt/lists/*
RUN groupadd -r django && useradd -r -g django django
RUN mkdir -p /app/static /app/media

COPY requirements.txt /app/
RUN pip install --upgrade pip --no-cache-dir && \
    pip install -r requirements.txt --no-cache-dir && \
    pip install gunicorn 'uvicorn[standard]' --no-cache-dir

COPY . /app/
RUN mkdir -p /app/static /app/media && chown -R django:django /app
RUN chmod +x /app/entrypoint.sh

USER django
