# IT Support Ticketing System - Backend

Backend server for the IT Support Ticketing System.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables in `.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/it-tickets
JWT_SECRET=your-secret-key-here
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

3. Start the server:
```bash
npm start
```

## Development

For development with auto-reload:
```bash
npm run dev
```

## API Documentation

See main README.md for complete API endpoint documentation.

## Models

- **User**: User accounts and authentication
- **Ticket**: Support tickets
- **TicketComment**: Comments on tickets
- **TicketAttachment**: File attachments
- **AuditLog**: Audit trail
- **Notification**: User notifications

## Routes

- `/api/auth` - Authentication
- `/api/tickets` - Ticket management
- `/api/comments` - Comment management
- `/api/attachments` - File uploads
- `/api/audit` - Audit logs
- `/api/notifications` - Notifications
- `/api/users` - User management

