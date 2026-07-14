@echo off
echo Starting Chat Platform Environment...

echo Bringing up all Docker containers (Database, Redis, Backend, Frontend, Nginx)...
docker compose up --build -d
if %errorlevel% neq 0 (
  echo.
  echo ERROR: docker compose failed with exit code %errorlevel%.
  echo Check Docker Desktop or run "docker compose up --build" manually to see build output.
  exit /b %errorlevel%
)

echo Environment is successfully running!
echo Access the application at http://localhost
echo.
pause
