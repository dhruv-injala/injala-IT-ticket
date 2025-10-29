# MongoDB Setup Guide

You're seeing connection errors because MongoDB is not running. Follow the steps below for your operating system.

## Option 1: Install & Start Local MongoDB (Recommended for Windows)

### Step 1: Download MongoDB

1. Visit: https://www.mongodb.com/try/download/community
2. Select:
   - Version: Latest (7.x)
   - Platform: Windows
   - Package: MSI
3. Download and run the installer

### Step 2: Install MongoDB

1. Run the downloaded MSI file
2. Choose "Complete" installation
3. ✅ Check "Install MongoDB as a Service"
4. ✅ Check "Install MongoDB Compass" (GUI tool)
5. Click "Install"

### Step 3: Verify Installation

Open Command Prompt and run:

```bash
mongod --version
```

You should see MongoDB version information.

### Step 4: Start MongoDB

Since MongoDB was installed as a service on Windows, it should start automatically. If not:

```bash
# Start MongoDB service
net start MongoDB

# Check if it's running
sc query MongoDB
```

### Step 5: Test the Connection

```bash
# Open MongoDB shell
mongosh
```

You should see: `test>` prompt

Exit with: `exit`

### Step 6: Restart Your Backend Server

Now restart your backend:

```bash
cd backend
npm start
```

You should see: `MongoDB connected successfully` ✅

---

## Option 2: Use MongoDB Atlas (Cloud - Free)

If you prefer not to install MongoDB locally:

### Step 1: Create Free Account

1. Visit: https://www.mongodb.com/cloud/atlas
2. Click "Try Free" and sign up

### Step 2: Create Cluster

1. Create a free cluster (M0 Free Tier)
2. Choose a cloud provider (AWS, Google Cloud, or Azure)
3. Choose your preferred region
4. Click "Create Cluster"

### Step 3: Create Database User

1. Go to "Database Access" → "Add New Database User"
2. Choose "Password" authentication
3. Set username: `it-support`
4. Set password: Create a strong password
5. User Privileges: "Read and write to any database"
6. Click "Add User"

### Step 4: Whitelist IP Address

1. Go to "Network Access" → "Add IP Address"
2. Click "Allow Access from Anywhere" (for development)
3. Or add your specific IP address
4. Click "Confirm"

### Step 5: Get Connection String

1. Go to "Database" → "Connect"
2. Choose "Connect your application"
3. Copy the connection string
   - Example: `mongodb+srv://username:password@cluster.mongodb.net/it-tickets`

### Step 6: Update Backend Configuration

Edit `backend/.env` file:

```env
PORT=5000
MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/it-tickets
JWT_SECRET=your-secret-key-here
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

**Replace:**
- `your-username` - Your database username
- `your-password` - Your database password
- `your-cluster` - Your cluster name

### Step 7: Restart Backend

```bash
cd backend
npm start
```

You should see: `MongoDB connected successfully` ✅

---

## Quick Test

After MongoDB is running, you can test the connection:

```bash
# Start backend
cd backend
npm start

# In another terminal, start frontend
cd frontend
npm start
```

Navigate to: http://localhost:3000

Click "Login as IT Admin" and you should be able to log in!

---

## Troubleshooting

### "mongod command not found"

**Solution:** MongoDB is not in your PATH
- On Windows: The installer should add it automatically
- If not, add `C:\Program Files\MongoDB\Server\7.0\bin` to your PATH
- Restart terminal

### "Port 27017 already in use"

**Solution:**
```bash
# Find the process
netstat -ano | findstr :27017

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

### "Access denied" error

**Solution:**
- Make sure MongoDB service is running as administrator
- Check firewall settings
- For Atlas: Make sure your IP is whitelisted

### Still having issues?

**Try these commands:**

```bash
# Check if MongoDB is running
sc query MongoDB

# Check MongoDB logs
type "C:\Program Files\MongoDB\Server\7.0\log\mongod.log"

# Restart MongoDB service
net stop MongoDB
net start MongoDB
```

---

## Alternative: Docker (Advanced Users)

If you have Docker installed:

```bash
# Run MongoDB in Docker
docker run -d -p 27017:27017 --name mongodb mongo:7

# Check status
docker ps

# Stop MongoDB
docker stop mongodb

# Start MongoDB
docker start mongodb
```

---

## Summary

**For Windows users (easiest):**
1. Download and install MongoDB from https://www.mongodb.com/try/download/community
2. MongoDB will start automatically as a service
3. Run `cd backend && npm start`

**For everyone (cloud):**
1. Sign up for MongoDB Atlas (free)
2. Create a cluster
3. Get connection string
4. Update `backend/.env` with the connection string
5. Run `cd backend && npm start`

After MongoDB is connected, the login will work perfectly! 🎉

