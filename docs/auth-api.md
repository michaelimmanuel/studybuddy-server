# 🔐 Authentication API

Authentication endpoints powered by Better Auth for secure session management.

## Base URL
```
http://localhost:8000/api/auth
```

## Endpoints

### Sign Up with Email
```http
POST /api/auth/sign-up/email
```
**Access:** Public

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com", 
  "password": "password123"
}
```

**Response (201):**
```json
{
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "emailVerified": false
  },
  "session": {
    "id": "session-id",
    "token": "session-token"
  }
}
```

**Validation Rules:**
- Name: Required, 1-100 characters
- Email: Valid email format, unique
- Password: Minimum 8 characters

---

### Sign In with Email
```http
POST /api/auth/sign-in/email
```
**Access:** Public

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "session": {
    "id": "session-id",
    "token": "session-token"
  }
}
```

---

### Sign Out
```http
POST /api/auth/sign-out
```
**Access:** Authenticated users

**Response (200):**
```json
{
  "message": "Signed out successfully"
}
```

---

### Get Current Session
```http
GET /api/auth/session
```
**Access:** Authenticated users

**Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "admin"
  },
  "session": {
    "id": "session-id",
    "expiresAt": "2025-10-26T10:00:00.000Z"
  }
}
```

---

### Health Check (Auth)
```http
GET /api/auth/ok
```
**Access:** Public

**Response (200):**
```json
{
  "status": "ok"
}
```

## Cookie Management

Better Auth uses HTTP-only cookies for session management:

- **Cookie Name:** `better-auth.session_token`
- **Security:** HTTP-only, Secure (in production)
- **SameSite:** Lax
- **Auto-expires:** Based on session duration

## Error Responses

### Invalid Credentials (401)
```json
{
  "message": "Invalid email or password"
}
```

### Email Already Exists (409)
```json
{
  "message": "Email already in use"
}
```

### Session Expired (401)
```json
{
  "message": "Session expired"
}
```

## Testing Examples

### Sign Up
```bash
curl -X POST http://localhost:8000/api/auth/sign-up/email \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"password123"}'
```

### Sign In
```bash
curl -X POST http://localhost:8000/api/auth/sign-in/email \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'
```

### Get Session
```bash
curl -X GET http://localhost:8000/api/auth/session \
  -H "Cookie: better-auth.session_token=YOUR_SESSION_TOKEN"
```