# 🔧 System API

Health checks and system information endpoints.

## Base URL
```
http://localhost:8000/api
```

## Health & Status Routes

### Health Check
```http
GET /api/health
```
**Access:** Public (no authentication required)

**Response (200):**
```json
{
  "status": "OK",
  "timestamp": "2025-10-01T10:00:00.000Z",
  "environment": "development",
  "version": "1.0.0",
  "services": {
    "database": "connected",
    "auth": "operational"
  }
}
```

**Response (503) - Service Unavailable:**
```json
{
  "status": "ERROR",
  "timestamp": "2025-10-01T10:00:00.000Z",
  "environment": "development",
  "version": "1.0.0",
  "services": {
    "database": "disconnected",
    "auth": "operational"
  },
  "errors": [
    "Database connection failed"
  ]
}
```

---

### System Information
```http
GET /api/system/info
```
**Access:** Admin only

**Response (200):**
```json
{
  "application": {
    "name": "StudyBuddy Server",
    "version": "1.0.0",
    "environment": "development",
    "nodeVersion": "20.10.0",
    "startTime": "2025-10-01T09:00:00.000Z",
    "uptime": "3600000"
  },
  "database": {
    "status": "connected",
    "version": "PostgreSQL 15.4",
    "migrationsApplied": 7,
    "lastMigration": "20251001073137_add_answer_explanation"
  },
  "auth": {
    "provider": "better-auth",
    "sessionStore": "database",
    "activeSessions": 12
  },
  "performance": {
    "memoryUsage": {
      "used": "45.2 MB",
      "total": "512 MB",
      "percentage": 8.8
    },
    "cpuUsage": "12.5%"
  }
}
```

---

### Database Status
```http
GET /api/system/database
```
**Access:** Admin only

**Response (200):**
```json
{
  "connection": {
    "status": "connected",
    "host": "localhost",
    "port": 5432,
    "database": "studybuddy_dev",
    "connectionPool": {
      "active": 3,
      "idle": 7,
      "total": 10
    }
  },
  "migrations": {
    "applied": [
      "20250923115638_user",
      "20250925060021_admin_role", 
      "20250926165032_create_course_table",
      "20250928164359_add_quiz_table",
      "20250928164920_add_quiz_constraints",
      "20250930044426_remove_quiz_add_course_questions",
      "20251001073137_add_answer_explanation"
    ],
    "pending": [],
    "lastApplied": "20251001073137_add_answer_explanation",
    "appliedAt": "2025-10-01T07:31:37.000Z"
  },
  "statistics": {
    "users": 150,
    "courses": 25,
    "questions": 320,
    "answers": 1280,
    "enrollments": 75
  }
}
```

---

### Performance Metrics
```http
GET /api/system/metrics
```
**Access:** Admin only

**Response (200):**
```json
{
  "server": {
    "uptime": "3600000",
    "requestsPerMinute": 45,
    "averageResponseTime": "125ms",
    "errorRate": "0.2%"
  },
  "memory": {
    "used": "45.2 MB",
    "available": "466.8 MB",
    "total": "512 MB",
    "percentage": 8.8
  },
  "cpu": {
    "usage": "12.5%",
    "loadAverage": [0.5, 0.3, 0.2]
  },
  "database": {
    "activeConnections": 3,
    "queryTime": {
      "average": "15ms",
      "slowest": "250ms"
    },
    "cacheHitRatio": "94.2%"
  }
}
```

## Maintenance Routes

### Cache Clear
```http
POST /api/system/cache/clear
```
**Access:** Admin only

**Request Body (optional):**
```json
{
  "type": "all"
}
```

**Available cache types:**
- `all` - Clear all caches
- `sessions` - Clear session cache
- `queries` - Clear query cache
- `static` - Clear static content cache

**Response (200):**
```json
{
  "message": "Cache cleared successfully",
  "type": "all",
  "clearedAt": "2025-10-01T10:00:00.000Z"
}
```

---

### Restart Services
```http
POST /api/system/restart
```
**Access:** Admin only

**Request Body:**
```json
{
  "services": ["auth", "database"]
}
```

**Available services:**
- `auth` - Authentication service
- `database` - Database connections
- `cache` - Cache service

**Response (200):**
```json
{
  "message": "Services restarted successfully", 
  "services": ["auth", "database"],
  "restartedAt": "2025-10-01T10:00:00.000Z"
}
```

## Logs & Monitoring

### Application Logs
```http
GET /api/system/logs
```
**Access:** Admin only

**Query Parameters:**
- `level` (string, optional) - Log level filter: `error`, `warn`, `info`, `debug`
- `limit` (number, optional) - Number of log entries (default: 100, max: 1000)
- `from` (ISO string, optional) - Start date filter
- `to` (ISO string, optional) - End date filter

**Response (200):**
```json
{
  "logs": [
    {
      "timestamp": "2025-10-01T10:00:00.000Z",
      "level": "info",
      "message": "User authenticated successfully",
      "userId": "user-uuid",
      "ip": "192.168.1.100"
    },
    {
      "timestamp": "2025-10-01T09:59:30.000Z",
      "level": "error",
      "message": "Database query timeout",
      "query": "SELECT * FROM courses WHERE...",
      "duration": "5000ms"
    }
  ],
  "pagination": {
    "total": 1250,
    "returned": 100,
    "hasMore": true
  }
}
```

---

### Error Tracking
```http
GET /api/system/errors
```
**Access:** Admin only

**Query Parameters:**
- `timeframe` (string, optional) - Time period: `1h`, `24h`, `7d`, `30d` (default: 24h)
- `severity` (string, optional) - Error severity: `low`, `medium`, `high`, `critical`

**Response (200):**
```json
{
  "summary": {
    "timeframe": "24h",
    "totalErrors": 12,
    "criticalErrors": 0,
    "highErrors": 2,
    "mediumErrors": 5,
    "lowErrors": 5
  },
  "errors": [
    {
      "id": "error-uuid",
      "timestamp": "2025-10-01T09:30:00.000Z",
      "severity": "high",
      "type": "DatabaseError",
      "message": "Connection timeout to database",
      "stack": "Error: Connection timeout...",
      "frequency": 3,
      "lastOccurrence": "2025-10-01T09:30:00.000Z"
    }
  ],
  "trends": {
    "errorRate": "0.2%",
    "trending": "stable",
    "comparedToPrevious": "-15%"
  }
}
```

## Configuration Routes

### Get System Configuration
```http
GET /api/system/config
```
**Access:** Admin only

**Response (200):**
```json
{
  "application": {
    "port": 8000,
    "environment": "development",
    "corsEnabled": true,
    "rateLimiting": {
      "enabled": true,
      "requestsPerMinute": 100
    }
  },
  "database": {
    "maxConnections": 10,
    "connectionTimeout": "30s",
    "queryTimeout": "5s"
  },
  "auth": {
    "sessionDuration": "7d",
    "requireEmailVerification": false,
    "allowRegistration": true
  },
  "features": {
    "userRegistration": true,
    "courseEnrollment": true,
    "questionExplanations": true
  }
}
```

---

### Update System Configuration
```http
PUT /api/system/config
```
**Access:** Admin only

**Request Body:**
```json
{
  "rateLimiting": {
    "requestsPerMinute": 120
  },
  "auth": {
    "sessionDuration": "14d"
  }
}
```

**Response (200):**
```json
{
  "message": "Configuration updated successfully",
  "updatedFields": [
    "rateLimiting.requestsPerMinute",
    "auth.sessionDuration"
  ],
  "updatedAt": "2025-10-01T10:00:00.000Z"
}
```

## Security Routes

### Security Audit
```http
GET /api/system/security/audit
```
**Access:** Admin only

**Response (200):**
```json
{
  "audit": {
    "timestamp": "2025-10-01T10:00:00.000Z",
    "status": "secure",
    "score": 95
  },
  "checks": [
    {
      "name": "SSL/TLS Configuration",
      "status": "pass",
      "score": 100
    },
    {
      "name": "Session Security",
      "status": "pass", 
      "score": 98
    },
    {
      "name": "Input Validation",
      "status": "pass",
      "score": 100
    },
    {
      "name": "Rate Limiting",
      "status": "pass",
      "score": 85
    }
  ],
  "recommendations": [
    "Consider implementing 2FA for admin accounts",
    "Review and rotate API keys monthly"
  ]
}
```

---

### Active Sessions
```http
GET /api/system/security/sessions
```
**Access:** Admin only

**Response (200):**
```json
{
  "activeSessions": [
    {
      "sessionId": "session-uuid",
      "userId": "user-uuid",
      "userEmail": "admin@example.com",
      "role": "admin",
      "ipAddress": "192.168.1.100",
      "userAgent": "Mozilla/5.0...",
      "createdAt": "2025-10-01T08:00:00.000Z",
      "lastActivity": "2025-10-01T09:45:00.000Z",
      "expiresAt": "2025-10-08T08:00:00.000Z"
    }
  ],
  "statistics": {
    "totalSessions": 12,
    "adminSessions": 2,
    "userSessions": 10,
    "expiringSoon": 3
  }
}
```

## Error Responses

### Unauthorized (401)
```json
{
  "message": "Authentication required"
}
```

### Admin Required (403)
```json
{
  "message": "Access denied. Admin privileges required."
}
```

### Service Unavailable (503)
```json
{
  "message": "Service temporarily unavailable",
  "service": "database",
  "retryAfter": "30s"
}
```

### Configuration Error (400)
```json
{
  "message": "Invalid configuration",
  "details": [
    {
      "field": "rateLimiting.requestsPerMinute",
      "message": "Must be between 1 and 1000"
    }
  ]
}
```

## Testing Examples

### Health Check
```bash
curl -X GET http://localhost:8000/api/health
```

### System Information (Admin)
```bash
curl -X GET http://localhost:8000/api/system/info \
  -H "Cookie: better-auth.session_token=ADMIN_SESSION_TOKEN"
```

### Clear Cache (Admin)
```bash
curl -X POST http://localhost:8000/api/system/cache/clear \
  -H "Content-Type: application/json" \
  -H "Cookie: better-auth.session_token=ADMIN_SESSION_TOKEN" \
  -d '{"type": "all"}'
```

### Get Application Logs (Admin)
```bash
curl -X GET "http://localhost:8000/api/system/logs?level=error&limit=50" \
  -H "Cookie: better-auth.session_token=ADMIN_SESSION_TOKEN"
```

### Security Audit (Admin)
```bash
curl -X GET http://localhost:8000/api/system/security/audit \
  -H "Cookie: better-auth.session_token=ADMIN_SESSION_TOKEN"
```