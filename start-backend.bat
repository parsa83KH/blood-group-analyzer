@echo off
echo Starting Backend Server...
cd backend
echo Installing dependencies...
npm install
echo Starting server on http://localhost:3001
echo Make sure to set GEMINI_API_KEY in your environment variables
npm start
pause
