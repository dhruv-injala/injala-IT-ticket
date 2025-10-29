# API Documentation

Base URL: `http://localhost:5000/api` (Development)

## Authentication

All endpoints require authentication except `/api/auth/login`.

Include the JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Endpoints

### Authentication

#### POST /api/auth/login
Login and get JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "azureId": "azure-user-id"
}
```

**Response:**
```json
{
  "token": "jwt-token-here",
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "Employee",
    "department": "IT"
  }
}
```

#### GET /api/auth/me
Get current user information.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "_id": "user-id",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "Employee",
  "department": "IT",
  "isActive": true,
  "lastLogin": "2024-01-15T10:30:00.000Z"
}
```

---

### Tickets

#### GET /api/tickets
Get all tickets with optional filters.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `status` - Filter by status (New, Assigned, etc.)
- `priority` - Filter by priority (Low, Medium, High, Urgent)
- `assignedTo` - Filter by assignee ID
- `createdBy` - Filter by creator ID
- `search` - Search in title and description

**Example:**
```
GET /api/tickets?status=New&priority=High&search=server
```

**Response:**
```json
{
  "tickets": [
    {
      "_id": "ticket-id",
      "title": "Server is down",
      "description": "Production server is not responding",
      "priority": "Urgent",
      "status": "New",
      "createdBy": {
        "_id": "user-id",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "assignedTo": null,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "counts": {
    "total": 50,
    "new": 10,
    "assigned": 5,
    "inProgress": 15,
    "done": 8,
    "completed": 12
  }
}
```

#### GET /api/tickets/:id
Get a single ticket with comments and attachments.

**Response:**
```json
{
  "ticket": {
    "_id": "ticket-id",
    "title": "Server is down",
    "description": "Production server is not responding",
    "priority": "Urgent",
    "status": "New",
    "createdBy": { "name": "John Doe", "email": "john@example.com" },
    "assignedTo": null,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  },
  "comments": [
    {
      "_id": "comment-id",
      "comment": "Looking into this issue",
      "user": { "name": "Admin", "email": "admin@example.com" },
      "isInternal": false,
      "createdAt": "2024-01-15T11:00:00.000Z"
    }
  ],
  "attachments": [
    {
      "_id": "attachment-id",
      "filename": "error.log",
      "fileSize": 12345,
      "uploadedBy": { "name": "John Doe" },
      "createdAt": "2024-01-15T10:35:00.000Z"
    }
  ]
}
```

#### POST /api/tickets
Create a new ticket.

**Request Body:**
```json
{
  "title": "Server is down",
  "description": "Production server is not responding to requests",
  "priority": "Urgent"
}
```

**Response:**
```json
{
  "_id": "ticket-id",
  "title": "Server is down",
  "description": "Production server is not responding to requests",
  "priority": "Urgent",
  "status": "New",
  "createdBy": "user-id",
  "assignedTo": null,
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

#### PUT /api/tickets/:id
Update ticket (Admin only).

**Request Body:**
```json
{
  "status": "In Progress",
  "priority": "High",
  "assignedTo": "admin-id",
  "title": "Updated title",
  "description": "Updated description"
}
```

**Response:**
```json
{
  "_id": "ticket-id",
  "title": "Updated title",
  "description": "Updated description",
  "priority": "High",
  "status": "In Progress",
  "assignedTo": "admin-id",
  "updatedAt": "2024-01-15T11:00:00.000Z"
}
```

#### PATCH /api/tickets/:id/reassign
Reassign ticket to another admin (Admin only).

**Request Body:**
```json
{
  "assignedTo": "admin-id"
}
```

---

### Comments

#### GET /api/comments/ticket/:ticketId
Get all comments for a ticket.

**Response:**
```json
[
  {
    "_id": "comment-id",
    "comment": "Looking into this issue",
    "user": { "name": "Admin", "email": "admin@example.com" },
    "isInternal": false,
    "createdAt": "2024-01-15T11:00:00.000Z"
  }
]
```

#### POST /api/comments
Add a comment to a ticket.

**Request Body:**
```json
{
  "ticket": "ticket-id",
  "comment": "This issue has been resolved",
  "isInternal": false
}
```

**Response:**
```json
{
  "_id": "comment-id",
  "ticket": "ticket-id",
  "user": "user-id",
  "comment": "This issue has been resolved",
  "isInternal": false,
  "createdAt": "2024-01-15T11:00:00.000Z"
}
```

---

### Attachments

#### GET /api/attachments/ticket/:ticketId
Get all attachments for a ticket.

**Response:**
```json
[
  {
    "_id": "attachment-id",
    "filename": "error.log",
    "fileSize": 12345,
    "uploadedBy": { "name": "John Doe" },
    "createdAt": "2024-01-15T10:35:00.000Z"
  }
]
```

#### POST /api/attachments/upload
Upload a file attachment.

**Request Type:** `multipart/form-data`

**Form Data:**
- `file` - The file to upload (max 10MB)
- `ticket` - Ticket ID

**Allowed File Types:**
jpeg, jpg, png, gif, pdf, doc, docx, xls, xlsx, txt, zip

**Response:**
```json
{
  "_id": "attachment-id",
  "ticket": "ticket-id",
  "filename": "error.log",
  "filePath": "uploads/1234567890-123456789.error.log",
  "fileSize": 12345,
  "uploadedBy": "user-id",
  "createdAt": "2024-01-15T10:35:00.000Z"
}
```

#### GET /api/attachments/:id/download
Download an attachment.

**Response:**
Binary file download

#### DELETE /api/attachments/:id
Delete an attachment.

---

### Audit Logs

#### GET /api/audit
Get audit logs (Admin only).

**Query Parameters:**
- `ticket` - Filter by ticket ID
- `user` - Filter by user ID
- `action` - Filter by action type
- `startDate` - Filter from date (YYYY-MM-DD)
- `endDate` - Filter to date (YYYY-MM-DD)
- `limit` - Number of records (default: 100)

**Example:**
```
GET /api/audit?action=UPDATE_TICKET&startDate=2024-01-01&limit=50
```

**Response:**
```json
[
  {
    "_id": "audit-id",
    "ticket": {
      "_id": "ticket-id",
      "title": "Server is down"
    },
    "user": {
      "_id": "user-id",
      "name": "Admin",
      "email": "admin@example.com"
    },
    "action": "UPDATE_TICKET",
    "description": "Ticket status changed",
    "oldValue": { "status": "New" },
    "newValue": { "status": "In Progress" },
    "ipAddress": "192.168.1.1",
    "createdAt": "2024-01-15T11:00:00.000Z"
  }
]
```

#### GET /api/audit/ticket/:ticketId
Get audit logs for a specific ticket (Admin only).

---

### Notifications

#### GET /api/notifications
Get user notifications.

**Query Parameters:**
- `unreadOnly` - Only return unread notifications (true/false)

**Response:**
```json
{
  "notifications": [
    {
      "_id": "notification-id",
      "type": "ticket_assigned",
      "title": "New Ticket Assigned",
      "message": "You have been assigned to ticket 'Server is down'",
      "ticket": {
        "_id": "ticket-id",
        "title": "Server is down"
      },
      "isRead": false,
      "createdAt": "2024-01-15T11:00:00.000Z"
    }
  ],
  "unreadCount": 5
}
```

**Notification Types:**
- `ticket_assigned` - Ticket assigned to you
- `ticket_updated` - Ticket updated
- `ticket_commented` - New comment on ticket
- `status_changed` - Ticket status changed
- `sla_violation` - SLA violation

#### PATCH /api/notifications/:id/read
Mark a notification as read.

**Response:**
```json
{
  "_id": "notification-id",
  "isRead": true,
  "updatedAt": "2024-01-15T11:05:00.000Z"
}
```

#### PATCH /api/notifications/read-all
Mark all notifications as read.

#### DELETE /api/notifications/:id
Delete a notification.

---

### Users

#### GET /api/users
Get all users (Admin only).

**Response:**
```json
[
  {
    "_id": "user-id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "Employee",
    "department": "IT",
    "createdAt": "2024-01-10T10:00:00.000Z"
  }
]
```

#### PATCH /api/users/:id/role
Update user role (Senior Admin only).

**Request Body:**
```json
{
  "role": "IT Admin"
}
```

**Response:**
```json
{
  "_id": "user-id",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "IT Admin",
  "updatedAt": "2024-01-15T11:00:00.000Z"
}
```

#### GET /api/users/stats/dashboard
Get dashboard statistics (Admin only).

**Response:**
```json
{
  "totalTickets": 100,
  "openTickets": 45,
  "ticketsByStatus": [
    { "_id": "New", "count": 10 },
    { "_id": "In Progress", "count": 25 }
  ],
  "ticketsByPriority": [
    { "_id": "Urgent", "count": 5 },
    { "_id": "High", "count": 20 }
  ]
}
```

---

## WebSocket Events

### Client → Server

#### join-room
Join user-specific notification room.

**Data:**
```json
{
  "userId": "user-id"
}
```

### Server → Client

#### notification
New notification for the user.

**Data:**
```json
{
  "type": "ticket_assigned",
  "title": "New Ticket Assigned",
  "message": "You have been assigned to ticket 'Server is down'",
  "ticket": { "title": "Server is down", ... }
}
```

#### ticket:created
New ticket created.

**Data:**
```json
{
  "_id": "ticket-id",
  "title": "New ticket",
  ...
}
```

#### ticket:updated
Ticket updated.

**Data:**
```json
{
  "_id": "ticket-id",
  "title": "Updated ticket",
  ...
}
```

#### comment:added
New comment added to a ticket.

**Data:**
```json
{
  "ticket": "ticket-id",
  "comment": {
    "_id": "comment-id",
    "comment": "Comment text",
    ...
  }
}
```

#### attachment:added
New attachment uploaded.

**Data:**
```json
{
  "ticket": "ticket-id",
  "attachment": {
    "_id": "attachment-id",
    "filename": "file.pdf",
    ...
  }
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "message": "Invalid request data",
  "error": "Validation error details"
}
```

### 401 Unauthorized
```json
{
  "message": "No authentication token provided"
}
```

### 403 Forbidden
```json
{
  "message": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "message": "Error message",
  "error": "Detailed error information"
}
```

---

## Rate Limiting

- All endpoints are rate-limited to 100 requests per 15 minutes per IP address
- Exceeding the limit returns a 429 Too Many Requests status

## Pagination

Currently, endpoints do not implement pagination. For large datasets, consider adding:

```
GET /api/tickets?page=1&limit=20
```

---

## Testing with cURL

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"Test User","azureId":"test-id"}'
```

### Get Tickets
```bash
curl -X GET http://localhost:5000/api/tickets \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Create Ticket
```bash
curl -X POST http://localhost:5000/api/tickets \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Ticket","description":"Test description","priority":"Low"}'
```

### Upload File
```bash
curl -X POST http://localhost:5000/api/attachments/upload \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "file=@/path/to/file.pdf" \
  -F "ticket=ticket-id-here"
```

