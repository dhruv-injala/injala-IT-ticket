# System Architecture

## Overview

The IT Support Ticketing System is a full-stack web application with the following architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend (React)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │    Login     │  │  Dashboard   │  │   Tickets    │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │  Admin Panel │  │ Audit Logs   │  │ Notifications│       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│                                                               │
│                    Socket.io Client ──┐                      │
└────────────────────────────────────────┼──────────────────────┘
                                         │
                                         │ HTTP/REST + WebSocket
                                         ↓
┌─────────────────────────────────────────────────────────────┐
│                    Backend (Node.js/Express)                 │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                   API Routes                            │ │
│  │  /api/auth  /api/tickets  /api/comments  /api/audit  │ │
│  │  /api/attachments  /api/notifications  /api/users      │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              Middleware                                  │ │
│  │  - Authentication (JWT)                                │ │
│  │  - Authorization (RBAC)                                 │ │
│  │  - Rate Limiting                                        │ │
│  │  - Audit Logging                                        │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                               │
│                    Socket.io Server ──┐                      │
└────────────────────────────────────────┼──────────────────────┘
                                         │
                                         ↓
┌─────────────────────────────────────────────────────────────┐
│                      MongoDB Database                         │
│                                                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Users   │  │ Tickets  │  │ Comments │  │Attachments│   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│                                                               │
│  ┌──────────┐  ┌──────────┐                                │
│  │ AuditLogs│  │Notifications│                              │
│  └──────────┘  └──────────┘                                  │
└─────────────────────────────────────────────────────────────┘
```

## Component Flow

### Authentication Flow
```
User → Login Page → Backend (/api/auth/login) → MongoDB (User Creation/Update)
  → JWT Token → Frontend (Store in localStorage) → Socket.io Connection
```

### Ticket Creation Flow
```
Employee → Create Ticket Form → POST /api/tickets → MongoDB (Create Ticket)
  → Socket.io Event → All Connected Clients → Real-time Update
```

### Ticket Assignment Flow
```
Admin → Assign Ticket → PATCH /api/tickets/:id/reassign → MongoDB (Update)
  → Create Notification → Socket.io Event → Notify Assigned User
```

### Comment Flow
```
User → Add Comment → POST /api/comments → MongoDB (Create Comment)
  → Create Notifications → Socket.io Event → Notify Related Users
```

## Data Models

### User Model
```
{
  email: String (unique, required)
  name: String (required)
  azureId: String (unique)
  role: Enum [Employee, IT Admin, Senior Admin]
  department: String
  isActive: Boolean
  lastLogin: Date
  timestamps: { createdAt, updatedAt }
}
```

### Ticket Model
```
{
  title: String (required)
  description: String (required)
  priority: Enum [Low, Medium, High, Urgent]
  status: Enum [New, Assigned, In Progress, Done, In Review, Completed, Reopened]
  createdBy: ObjectId (ref: User)
  assignedTo: ObjectId (ref: User)
  timestamps: { createdAt, updatedAt }
}
```

### Audit Log Model
```
{
  ticket: ObjectId (ref: Ticket)
  user: ObjectId (ref: User, required)
  action: String (required)
  description: String (required)
  oldValue: Mixed
  newValue: Mixed
  ipAddress: String
  timestamps: { createdAt, updatedAt }
}
```

## Security Architecture

### Authentication
- JWT-based authentication
- Token stored in localStorage
- Token validation on every request
- Automatic token refresh

### Authorization
- Role-based access control (RBAC)
- Three-tier roles: Employee, IT Admin, Senior Admin
- Middleware enforcement
- API-level protection

### Security Headers
- Helmet.js for HTTP headers
- CORS configuration
- Rate limiting
- Input validation

### File Upload Security
- File type validation
- File size limits (10MB)
- Secure storage
- Virus scanning capability (optional)

## Real-time Architecture

### WebSocket Connection
```
Client Connection → Socket.io Server
  → Join Room (User ID) → Receive Room-specific Events
```

### Events
- `ticket:created` - New ticket creation
- `ticket:updated` - Ticket status/priority change
- `comment:added` - New comment
- `attachment:added` - File upload
- `notification` - User-specific notifications

## Deployment Architecture

### Development
```
Frontend: http://localhost:3000 (React Dev Server)
Backend:  http://localhost:5000 (Express Server)
Database: Local MongoDB
```

### Production (Azure)
```
Frontend: Azure Static Web Apps / Azure App Service
Backend:  Azure App Service / Azure Functions
Database: Azure Cosmos DB / MongoDB Atlas
Storage:  Azure Blob Storage (for uploads)
Auth:     Azure AD B2C
```

## Scalability Considerations

### Horizontal Scaling
- Stateless backend (can scale horizontally)
- MongoDB replica sets
- Load balancing for backend
- CDN for frontend static assets

### Performance
- Database indexing on frequently queried fields
- Pagination for large datasets
- Caching for static data
- Lazy loading for comments/attachments

### Monitoring
- Application logs
- Error tracking
- Performance metrics
- User activity monitoring
- Audit trail for compliance

