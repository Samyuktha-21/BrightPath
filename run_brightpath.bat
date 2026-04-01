@echo off
echo ==========================================
echo      BrightPath - Grab the Opportunity
echo ==========================================
echo.
echo 1. navigating to project folder...
cd BrightPath

echo 2. Installing dependencies (just in case)...
call npm install --silent

echo 3. Seeding database with sample exams...
node server/seed/seedExams.js

echo.
echo ==========================================
echo SUCCESS! Server is starting...
echo.
echo Please open your browser to: http://localhost:5000
echo.
echo (Press Ctrl+C to stop the server)
echo ==========================================
echo.

npm start
pause
