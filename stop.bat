@echo off
echo Stopping Docker Compose...
docker compose down

echo Stopping Backend and Frontend processes...
taskkill /F /IM node.exe
taskkill /F /IM python.exe

echo All processes stopped.
pause
