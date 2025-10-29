@echo off
echo =====================================
echo IT Support Ticketing System - Setup
echo =====================================
echo.

echo [1/4] Installing backend dependencies...
cd backend
call npm install
cd ..

echo.
echo [2/4] Installing frontend dependencies...
cd frontend
call npm install
cd ..

echo.
echo [3/4] Creating backend .env file...
if not exist backend\.env (
    echo PORT=5000 > backend\.env
    echo MONGODB_URI=mongodb://localhost:27017/it-tickets >> backend\.env
    echo JWT_SECRET=change-this-to-a-random-secret-in-production >> backend\.env
    echo FRONTEND_URL=http://localhost:3000 >> backend\.env
    echo NODE_ENV=development >> backend\.env
    echo Created backend\.env file
) else (
    echo backend\.env already exists, skipping...
)

echo.
echo [4/4] Creating uploads directory...
if not exist backend\uploads mkdir backend\uploads

echo.
echo =====================================
echo Setup Complete!
echo =====================================
echo.
echo Next steps:
echo 1. Start MongoDB: mongod
echo 2. Start backend: cd backend && npm start
echo 3. Start frontend: cd frontend && npm start
echo.
echo Read QUICKSTART.md for detailed instructions
echo.
pause

