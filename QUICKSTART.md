# Quick Start Guide

Get the IT Support Ticketing System up and running in minutes!

## Prerequisites

✅ Node.js 14+ installed  
✅ MongoDB installed (or use MongoDB Atlas)  
✅ Terminal/Command Prompt  

## Step 1: Install Dependencies

Open terminal in the project root and run:

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

## Step 2: Setup MongoDB

### Option A: Local MongoDB

Make sure MongoDB is running:

```bash
# Check if MongoDB is running
mongod

# If not installed, install it:
# Windows: Download from mongodb.com
# Mac: brew install mongodb-community
# Linux: sudo apt-get install mongodb
```

### Option B: MongoDB Atlas (Cloud)

1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account
3. Create a free cluster
4. Copy the connection string

## Step 3: Configure Backend

Create a `.env` file in the `backend` folder:

```bash
cd backend
touch .env  # or create .env file manually
```

Add this content to `.env`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/it-tickets
JWT_SECRET=change-this-to-a-random-secret-in-production
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

**If using MongoDB Atlas**, replace `MONGODB_URI` with your connection string:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/it-tickets
```

## Step 4: Start the Application

### Terminal 1 - Backend Server

```bash
cd backend
npm start
```

You should see:
```
MongoDB connected
Server running on port 5000
Socket.io connected
```

### Terminal 2 - Frontend Server

```bash
cd frontend
npm start
```

The browser should open automatically at `http://localhost:3000`

If not, manually open: http://localhost:3000

## Step 5: Login

Use the quick login buttons on the login page:

- **Employee Login** - Create and track tickets
- **IT Admin Login** - Manage all tickets
- **Senior Admin Login** - Full system access

## Step 6: Start Using!

### As an Employee:

1. Click "Create Ticket"
2. Fill in title and description
3. Select priority
4. Submit your ticket
5. Go to "My Tickets" to track progress

### As an IT Admin:

1. View all tickets in Admin Dashboard
2. Click on any ticket to view details
3. Assign ticket to yourself or another admin
4. Change ticket status as you work on it
5. Add comments and attachments
6. Mark as complete when done

### As a Senior Admin:

1. View Admin Dashboard for analytics
2. Manage user roles
3. View complete audit logs
4. Monitor ticket distribution
5. Track SLA violations

## What's Next?

✅ Test creating tickets  
✅ Test commenting on tickets  
✅ Test uploading files  
✅ Test real-time notifications  
✅ Test ticket assignment  
✅ View audit logs  

## Troubleshooting

### "Cannot connect to MongoDB"

**Solution:**
- Make sure MongoDB is running: `mongod`
- Check if `MONGODB_URI` in `.env` is correct
- If using Atlas, verify your IP is whitelisted

### "Port 5000 already in use"

**Solution:**
```bash
# Find and kill the process
lsof -i :5000
kill -9 <PID>

# Or change port in .env
PORT=5001
```

### "npm install fails"

**Solution:**
```bash
# Clear cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Frontend can't connect to backend

**Solution:**
- Check if backend is running on port 5000
- Check CORS settings in `backend/server.js`
- Verify `FRONTEND_URL` in `.env`

### Real-time updates not working

**Solution:**
- Make sure Socket.io is running on backend
- Check browser console for WebSocket errors
- Verify port 5000 is not blocked by firewall

## Common Commands

```bash
# Backend
cd backend
npm start          # Start server
npm run dev        # Start with auto-reload
npm test           # Run tests

# Frontend
cd frontend
npm start          # Start dev server
npm run build      # Build for production
npm test           # Run tests

# Both
npm run install-all   # Install dependencies for both
```

## Project Structure

```
injala-it-ticket-tool/
├── backend/          # Node.js/Express backend
│   ├── models/       # Database models
│   ├── routes/       # API routes
│   ├── middleware/   # Auth & validation
│   └── server.js     # Main server file
├── frontend/         # React frontend
│   ├── src/
│   │   ├── pages/    # Page components
│   │   ├── components/ # Reusable components
│   │   └── context/  # State management
│   └── public/       # Static files
└── README.md         # Full documentation
```

## Need Help?

- Check the main [README.md](README.md) for full documentation
- See [API_DOCUMENTATION.md](API_DOCUMENTATION.md) for all endpoints
- Review [DEPLOYMENT.md](DEPLOYMENT.md) for production setup
- Read [ARCHITECTURE.md](ARCHITECTURE.md) for system overview

## Features to Test

✅ User authentication  
✅ Create tickets  
✅ View ticket lists  
✅ Add comments  
✅ Upload files  
✅ Assign tickets  
✅ Change status  
✅ Real-time notifications  
✅ Audit logs  
✅ Role-based access  

Enjoy building with the IT Support Ticketing System! 🚀

