#!/bin/bash

echo "====================================="
echo "IT Support Ticketing System - Setup"
echo "====================================="
echo ""

echo "[1/4] Installing backend dependencies..."
cd backend
npm install
cd ..

echo ""
echo "[2/4] Installing frontend dependencies..."
cd frontend
npm install
cd ..

echo ""
echo "[3/4] Creating backend .env file..."
if [ ! -f backend/.env ]; then
    cat > backend/.env << EOL
PORT=5000
MONGODB_URI=mongodb://localhost:27017/it-tickets
JWT_SECRET=change-this-to-a-random-secret-in-production
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
EOL
    echo "Created backend/.env file"
else
    echo "backend/.env already exists, skipping..."
fi

echo ""
echo "[4/4] Creating uploads directory..."
mkdir -p backend/uploads

echo ""
echo "====================================="
echo "Setup Complete!"
echo "====================================="
echo ""
echo "Next steps:"
echo "1. Start MongoDB: mongod"
echo "2. Start backend: cd backend && npm start"
echo "3. Start frontend: cd frontend && npm start"
echo ""
echo "Read QUICKSTART.md for detailed instructions"
echo ""

