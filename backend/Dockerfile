FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

RUN apt-get update && apt-get install -y \
    libpq-dev gcc \
    && rm -rf /var/lib/apt/lists/*
RUN groupadd -r django && useradd -r -g django django

COPY requirements.txt /app/
RUN pip install --upgrade pip --no-cache-dir && pip install -r requirements.txt --no-cache-dir

COPY . /app/
RUN chown -R django:django /app

USER django
