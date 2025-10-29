# Deployment Guide

## Prerequisites

- Node.js 14+ installed
- MongoDB database (local or cloud)
- Git repository
- Azure account (for cloud deployment)

## Local Development Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd injala-it-ticket-tool
```

### 2. Install Dependencies

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the `backend` directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/it-tickets
JWT_SECRET=your-super-secret-key-change-this-in-production
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

**Important:** Change `JWT_SECRET` to a strong random string in production!

### 4. Start MongoDB

**Windows:**
```bash
mongod
```

**Linux/Mac:**
```bash
sudo systemctl start mongod
```

Or use MongoDB Atlas (cloud):
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/it-tickets
```

### 5. Start the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

### 6. Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Production Deployment

### Option 1: Azure Deployment (Recommended)

#### Frontend Deployment (Azure Static Web Apps)

1. **Install Azure CLI:**
```bash
npm install -g azure-static-web-apps-cli
```

2. **Build the frontend:**
```bash
cd frontend
npm run build
```

3. **Deploy to Azure:**
```bash
swa deploy ./build --app-name injala-it-ticket
```

#### Backend Deployment (Azure App Service)

1. **Install Azure CLI and login:**
```bash
az login
```

2. **Create a resource group:**
```bash
az group create --name injala-it-rg --location eastus
```

3. **Create MongoDB database:**
```bash
# Use Azure Cosmos DB (MongoDB compatible)
az cosmosdb create --name injala-mongodb --resource-group injala-it-rg
```

4. **Create App Service:**
```bash
az webapp create --resource-group injala-it-rg --plan injala-plan --name injala-it-backend --runtime "NODE:18-lts"
```

5. **Configure environment variables:**
```bash
az webapp config appsettings set --resource-group injala-it-rg --name injala-it-backend --settings \
  "MONGODB_URI=mongodb://..." \
  "JWT_SECRET=your-production-secret" \
  "FRONTEND_URL=https://injala-it-ticket.azurestaticapps.net" \
  "NODE_ENV=production"
```

6. **Deploy backend:**
```bash
cd backend
az webapp deploy --resource-group injala-it-rg --name injala-it-backend --src-path . --type zip
```

### Option 2: Docker Deployment

#### Backend Dockerfile
```dockerfile
FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5000
CMD ["node", "server.js"]
```

#### Frontend Dockerfile
```dockerfile
FROM node:18 as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### Docker Compose
```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:7
    ports:
      - "27017:27017"
    volumes:
      - mongodb-data:/data/db

  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - MONGODB_URI=mongodb://mongodb:27017/it-tickets
      - JWT_SECRET=your-secret
      - FRONTEND_URL=http://localhost:3000
    depends_on:
      - mongodb

  frontend:
    build: ./frontend
    ports:
      - "3000:80"
    depends_on:
      - backend

volumes:
  mongodb-data:
```

### Option 3: Manual Server Deployment

#### VPS Setup (Ubuntu/Debian)

1. **Install Node.js:**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

2. **Install MongoDB:**
```bash
sudo apt-get install -y mongodb
```

3. **Clone and setup:**
```bash
git clone <repository-url>
cd injala-it-ticket-tool
npm run install-all
```

4. **Setup backend:**
```bash
cd backend
cp .env.example .env
nano .env  # Edit configuration
npm start
```

5. **Setup frontend:**
```bash
cd frontend
npm run build
```

6. **Use PM2 for process management:**
```bash
npm install -g pm2
cd backend
pm2 start server.js --name it-ticket-backend
pm2 save
pm2 startup  # Auto-start on boot
```

7. **Setup Nginx as reverse proxy:**
```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        root /path/to/injala-it-ticket-tool/frontend/build;
        try_files $uri /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket
    location /socket.io {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

8. **Setup SSL with Let's Encrypt:**
```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## Environment Variables

### Backend (.env)
```env
# Server
PORT=5000
NODE_ENV=production

# Database
MONGODB_URI=mongodb://localhost:27017/it-tickets
# or
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/it-tickets

# Security
JWT_SECRET=your-super-secret-key-min-32-characters

# CORS
FRONTEND_URL=https://your-domain.com

# Optional: File upload size
MAX_FILE_SIZE=10485760  # 10MB
```

## Database Setup

### MongoDB Atlas (Cloud)

1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Create a database user
4. Get the connection string
5. Update `.env` with the connection string

### Local MongoDB

```bash
# Install MongoDB
# Ubuntu/Debian
sudo apt-get install mongodb

# Mac
brew install mongodb-community

# Windows
# Download from mongodb.com

# Start MongoDB
mongod
```

## Testing the Deployment

1. **Health Check:**
```bash
curl http://your-domain.com/api/auth/me
```

2. **Test Login:**
- Visit the application URL
- Use quick login buttons or Microsoft AD login
- Verify dashboard loads

3. **Test Real-time:**
- Open two browser windows
- Create a ticket in one
- Verify it appears in the other without refresh

## Troubleshooting

### Backend Issues

**Port already in use:**
```bash
# Find process
lsof -i :5000
# Kill process
kill -9 <PID>
```

**MongoDB connection error:**
- Check if MongoDB is running
- Verify connection string
- Check firewall settings

### Frontend Issues

**Build errors:**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run build
```

**API connection errors:**
- Verify backend URL in axios requests
- Check CORS settings
- Check network connectivity

## Monitoring

### PM2 Monitoring
```bash
pm2 status
pm2 logs it-ticket-backend
pm2 monit
```

### Nginx Logs
```bash
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

## Backup

### Database Backup
```bash
# Backup
mongodump --db it-tickets --out /path/to/backup

# Restore
mongorestore --db it-tickets /path/to/backup/it-tickets
```

### File Uploads Backup
```bash
# Backup uploads directory
tar -czf uploads-backup.tar.gz backend/uploads
```

## Updates and Maintenance

```bash
# Pull latest code
git pull origin main

# Update dependencies
npm install

# Restart services
pm2 restart all

# Rebuild frontend (if needed)
cd frontend
npm run build
```

## Security Checklist

- [ ] Change default JWT secret
- [ ] Enable HTTPS
- [ ] Configure CORS properly
- [ ] Set up rate limiting
- [ ] Enable file upload validation
- [ ] Use environment variables for secrets
- [ ] Set up regular database backups
- [ ] Configure firewall rules
- [ ] Enable audit logging
- [ ] Regular security updates

