@echo off
start cmd /k "cd backend && npm run dev"
start cmd /k "cd frontend && npm run dev"
echo Servers are starting...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:5173
pause
