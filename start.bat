@echo off
echo Starting Chat Platform Environment...

echo Bringing up all Docker containers (Database, Redis, Backend, Frontend, Nginx)...
docker compose up -d

echo Environment is successfully running!
echo Access the application at http://localhost
