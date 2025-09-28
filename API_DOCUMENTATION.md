# 📚 StudyBuddy API Documentation

Complete documentation for all StudyBuddy API endpoints.

## 🌐 Base URL
```
http://localhost:8000
```

## 🔑 Authentication

StudyBuddy uses **Better Auth** for authentication with cookie-based sessions. Include the session cookie in requests to protected endpoints.

### Authentication Header
```
Cookie: better-auth.session_token=your-session-token
```

## 📋 Route Overview

### Route Structure
- **`/api/auth/*`** - Authentication (Better Auth)
- **`/api/users`** - User management  
- **`/api/courses`** - Course management
- **`/api/health`** - Health check
- **`/api/`** - API information

---

## 🔐 Authentication Routes (Better Auth)

### Sign Up with Email
```http
POST /api/auth/sign-up/email
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com", 
  "password": "password123"
}
```

**Response:**
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

### Sign In with Email
```http
POST /api/auth/sign-in/email
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

### Sign Out
```http
POST /api/auth/sign-out
```

### Get Current Session
```http
GET /api/auth/session
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "session": {
    "id": "session-id",
    "expiresAt": "2025-10-26T10:00:00.000Z"
  }
}
```

### Health Check (Auth)
```http
GET /api/auth/ok
```

---

## 👥 User Routes

### Public Routes

#### Get User Statistics
```http
GET /api/users/stats
```
**Access:** Public

**Response:**
```json
{
  "stats": {
    "totalUsers": 150,
    "verifiedUsers": 120,
    "bannedUsers": 2,
    "adminUsers": 5,
    "recentUsers": 25,
    "verificationRate": "80.00"
  }
}
```

### Protected Routes (Authentication Required)

#### Get Current User
```http
GET /api/users/me
```
**Access:** Authenticated users
**Headers:** `Cookie: better-auth.session_token=...`

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": null,
    "banned": false
  }
}
```

#### Get User Profile
```http
GET /api/users/:id/profile
```
**Access:** Authenticated users
**Parameters:** 
- `id` (UUID) - User ID

**Response:**
```json
{
  "profile": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "image": null,
    "role": null,
    "createdAt": "2025-09-26T10:00:00.000Z"
  }
}
```

#### Update User Profile
```http
PUT /api/users/:id/profile
```
**Access:** Authenticated users (own profile only)

**Request Body:**
```json
{
  "name": "John Smith",
  "image": "https://example.com/avatar.jpg"
}
```

### Admin Routes (Admin Role Required)

#### Get All Users
```http
GET /api/users
```
**Access:** Admin only
**Query Parameters:**
- `page` (number, optional) - Page number (default: 1)
- `limit` (number, optional) - Items per page (default: 10)

**Response:**
```json
{
  "users": [
    {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "role": null,
      "banned": false,
      "createdAt": "2025-09-26T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalPages": 15,
    "totalUsers": 150
  }
}
```

#### Get User by ID
```http
GET /api/users/:id
```
#### Check If the User Logged In is Admin
```http
GET /api/users/is-admin

**Access:** Admin only

#### Create User
```http
POST /api/users
```
**Access:** Admin only

**Request Body:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "role": "admin"
}
```

#### Update User
```http
PUT /api/users/:id
```
**Access:** Admin only

**Request Body:**
```json
{
  "name": "Updated Name",
  "role": "admin",
  "banned": true,
  "banReason": "Violation of terms",
  "banExpires": "2025-12-31T00:00:00.000Z"
}
```

#### Delete User
```http
DELETE /api/users/:id
```
**Access:** Admin only

---

## 🎓 Course Routes

### Public Routes

#### Get All Courses
```http
GET /api/courses
```
**Access:** Public (optional authentication for enrollment status)

**Query Parameters:**
- `page` (number, optional) - Page number (default: 1)
- `limit` (number, optional) - Items per page (default: 10, max: 100)  
- `search` (string, optional) - Search in title and description

**Response:**
```json
{
  "courses": [
    {
      "id": "uuid",
      "title": "JavaScript Fundamentals",
      "description": "Learn the basics of JavaScript",
      "createdAt": "2025-09-26T10:00:00.000Z",
      "updatedAt": "2025-09-26T10:00:00.000Z",
      "enrollmentCount": 15,
      "isEnrolled": false
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalPages": 3,
    "totalCourses": 25
  }
}
```

#### Get Course by ID
```http
GET /api/courses/:id
```
**Access:** Public (optional authentication for detailed enrollment info)

**Response:**
```json
{
  "course": {
    "id": "uuid",
    "title": "JavaScript Fundamentals", 
    "description": "Learn the basics of JavaScript",
    "createdAt": "2025-09-26T10:00:00.000Z",
    "updatedAt": "2025-09-26T10:00:00.000Z",
    "enrollmentCount": 15,
    "userEnrollment": {
      "status": "APPROVED",
      "enrolledAt": "2025-09-26T11:00:00.000Z"
    },
    "enrolledUsers": [
      {
        "id": "uuid",
        "name": "John Doe",
        "email": "john@example.com",
        "image": null,
        "enrolledAt": "2025-09-26T11:00:00.000Z"
      }
    ]
  }
}
```

### Protected Routes (Authentication Required)

#### Enroll in Course
```http
POST /api/courses/:id/enroll
```
**Access:** Authenticated users

**Response:**
```json
{
  "message": "Enrollment request submitted successfully",
  "enrollment": {
    "id": "uuid",
    "status": "PENDING",
    "course": {
      "id": "uuid",
      "title": "JavaScript Fundamentals",
      "description": "Learn JavaScript basics"
    },
    "enrolledAt": "2025-09-26T11:00:00.000Z"
  }
}
```

#### Unenroll from Course
```http
DELETE /api/courses/:id/unenroll  
```
**Access:** Authenticated users

**Response:**
```json
{
  "message": "Successfully unenrolled from course"
}
```

#### Get Course Students
```http
GET /api/courses/:id/students
```
**Access:** Enrolled users or admin

**Response:**
```json
{
  "course": {
    "id": "uuid",
    "title": "JavaScript Fundamentals"
  },
  "students": [
    {
      "enrollmentId": "uuid",
      "status": "APPROVED",
      "enrolledAt": "2025-09-26T11:00:00.000Z",
      "user": {
        "id": "uuid",
        "name": "John Doe",
        "email": "john@example.com",
        "image": null
      }
    }
  ],
  "totalStudents": 15,
  "approvedStudents": 12
}
```

#### Get User's Courses
```http
GET /api/courses/user/:userId
```
**Access:** Own courses or admin

**Response:**
```json
{
  "courses": [
    {
      "enrollmentId": "uuid",
      "status": "APPROVED",
      "enrolledAt": "2025-09-26T11:00:00.000Z",
      "course": {
        "id": "uuid",
        "title": "JavaScript Fundamentals",
        "description": "Learn JavaScript basics",
        "createdAt": "2025-09-26T10:00:00.000Z",
        "updatedAt": "2025-09-26T10:00:00.000Z"
      }
    }
  ],
  "totalEnrollments": 3,
  "approvedEnrollments": 2,
  "pendingEnrollments": 1
}
```

### Admin Routes (Admin Role Required)

#### Create Course
```http
POST /api/courses
```
**Access:** Admin only

**Request Body:**
```json
{
  "title": "React Development",
  "description": "Build modern web applications with React"
}
```

**Response:**
```json
{
  "course": {
    "id": "uuid",
    "title": "React Development",
    "description": "Build modern web applications with React",
    "createdAt": "2025-09-26T10:00:00.000Z",
    "updatedAt": "2025-09-26T10:00:00.000Z",
    "enrollmentCount": 0
  }
}
```

#### Update Course
```http
PUT /api/courses/:id
```
**Access:** Admin only

**Request Body:**
```json
{
  "title": "Advanced React Development",
  "description": "Master React with advanced patterns and hooks"
}
```

#### Delete Course
```http
DELETE /api/courses/:id
```
**Access:** Admin only
**Note:** Cannot delete courses with existing enrollments

**Response:**
```json
{
  "message": "Course deleted successfully"
}
```

#### Get Course Statistics
```http
GET /api/courses/stats
```
**Access:** Admin only

**Response:**
```json
{
  "stats": {
    "totalCourses": 25,
    "totalEnrollments": 150,
    "approvedEnrollments": 120,
    "pendingEnrollments": 20,
    "rejectedEnrollments": 10,
    "averageEnrollmentsPerCourse": "6.00"
  },
  "popularCourses": [
    {
      "id": "uuid",
      "title": "JavaScript Fundamentals",
      "enrollmentCount": 25
    }
  ]
}
```

#### Manage Enrollment Status
```http
PUT /api/courses/enrollments/:enrollmentId
```
**Access:** Admin only

**Request Body:**
```json
{
  "status": "APPROVED"
}
```
**Valid statuses:** `PENDING`, `APPROVED`, `REJECTED`

**Response:**
```json
{
  "message": "Enrollment approved successfully",
  "enrollment": {
    "id": "uuid",
    "status": "APPROVED",
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "course": {
      "id": "uuid",
      "title": "JavaScript Fundamentals"
    },
    "updatedAt": "2025-09-26T12:00:00.000Z"
  }
}
```

---

## 🏥 Health & Info Routes

### Health Check
```http
GET /api/health
```
**Access:** Public

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-09-26T10:00:00.000Z",
  "service": "StudyBuddy API",
  "uptime": 3600
}
```

### API Information  
```http
GET /api
```
**Access:** Public

**Response:**
```json
{
  "message": "StudyBuddy API",
  "version": "1.0.0",
  "endpoints": {
    "auth": "/api/auth/* - Authentication endpoints (Better Auth)",
    "users": "/api/users - User management endpoints",
    "courses": "/api/courses - Course management endpoints",
    "health": "/api/health - Health check endpoint"
  },
  "features": [
    "Email/Password Authentication",
    "User Management", 
    "Study Session Tracking",
    "Course Management",
    "Admin Panel Support"
  ]
}
```

---

## 🔒 Access Levels

| Level | Description | Routes |
|-------|-------------|---------|
| **Public** | No authentication required | Health, API info, course listing |
| **User** | Valid session required | Profile, enrollment, own courses |
| **Student** | Enrolled in specific course | Course classmates |
| **Admin** | Admin role required | User management, course management, statistics |

## 📊 HTTP Status Codes

| Code | Description | When Used |
|------|-------------|-----------|
| `200` | OK | Successful GET, PUT, DELETE |
| `201` | Created | Successful POST (resource created) |
| `400` | Bad Request | Invalid request data, validation errors |
| `401` | Unauthorized | Missing or invalid authentication |
| `403` | Forbidden | Valid auth but insufficient permissions |
| `404` | Not Found | Resource doesn't exist |
| `409` | Conflict | Duplicate data (email exists, already enrolled) |
| `500` | Internal Server Error | Server-side errors |

## 📝 Request/Response Formats

### Content Type
All requests and responses use `application/json` content type.

### Error Response Format
```json
{
  "message": "Error description",
  "details": "Additional error details (development only)"
}
```

### Validation Error Format
```json
{
  "message": "Validation error",
  "details": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

## 🧪 Testing Examples

### Using cURL

#### Sign Up
```bash
curl -X POST http://localhost:8000/api/auth/sign-up/email \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"password123"}'
```

#### Get Courses (Public)
```bash
curl "http://localhost:8000/api/courses?search=javascript&limit=5"
```

#### Enroll in Course (with session)
```bash
curl -X POST http://localhost:8000/api/courses/COURSE_ID/enroll \
  -H "Cookie: better-auth.session_token=YOUR_TOKEN"
```

#### Create Course (Admin)
```bash
curl -X POST http://localhost:8000/api/courses \
  -H "Content-Type: application/json" \
  -H "Cookie: better-auth.session_token=ADMIN_TOKEN" \
  -d '{"title":"New Course","description":"Course description"}'
```

## 🚀 Rate Limiting & Performance

- **Pagination:** Most list endpoints support pagination
- **Search:** Course search is case-insensitive and searches title/description
- **Caching:** Consider implementing caching for frequently accessed public data
- **Validation:** All inputs are validated before processing

## 🔧 Development Notes

### Environment Setup
```bash
# Install dependencies
npm install

# Set up environment variables  
cp .env.example .env

# Run database migrations
npx prisma migrate dev

# Start development server
npm run dev
```

### Authentication Integration
```javascript
// Frontend example (React)
const response = await fetch('/api/courses', {
  credentials: 'include' // Important for cookies
});
```

---

*Last updated: September 26, 2025*