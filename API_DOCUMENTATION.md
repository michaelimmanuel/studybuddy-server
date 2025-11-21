# 📚 StudyBuddy API Documentation

Complete API documentation for the StudyBuddy learning management system.

## 🌐 Base URL
```
http://localhost:8000/api
```

## 🔑 Authentication

StudyBuddy uses **Better Auth** for authentication with cookie-based sessions. Include the session cookie in requests to protected endpoints.

### Authentication Header
```
Cookie: better-auth.session_token=your-session-token
```

## 📋 API Routes Overview

### Route Structure
- **[Authentication Routes](./docs/auth-api.md)** - Better Auth endpoints
- **[User Management](./docs/users-api.md)** - User CRUD and profile management
- **[Course Management](./docs/courses-api.md)** - Course creation, enrollment, and administration
- **[Question Management](./docs/questions-api.md)** - Question bank with answer explanations
- **[Package Management](./docs/packages-api.md)** - Question packages for sale
- **[Bundle Management](./docs/bundles-and-purchases-api.md)** - Package bundles and purchase management
- **[Referral Codes](./docs/referral-codes-api.md)** - Discount codes for purchases
- **[System Routes](./docs/system-api.md)** - Health checks and API info

## 🔒 Access Levels

| Level | Description | Features |
|-------|-------------|----------|
| **Public** | No authentication required | Health check, API info, course listing |
| **User** | Valid session required | Profile management, course enrollment |
| **Student** | Enrolled in specific course | Access course questions, classmates |
| **Admin** | Admin role required | Full system management, question creation |

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

## 🚀 Quick Start

1. **Authentication**: Start with user registration or login
2. **Course Access**: Browse or enroll in courses
3. **Question Practice**: Access course questions for learning
4. **Admin Features**: Create courses and questions (admin only)

## 📖 Detailed Documentation

Each feature has its own detailed documentation file:

- **[Authentication API](./docs/auth-api.md)** - Sign up, sign in, session management
- **[Users API](./docs/users-api.md)** - User profiles, statistics, admin management
- **[Courses API](./docs/courses-api.md)** - Course CRUD, enrollment, statistics
- **[Questions API](./docs/questions-api.md)** - Question bank with explanations
- **[Packages API](./docs/packages-api.md)** - Question packages for purchase
- **[Bundles & Purchases API](./docs/bundles-and-purchases-api.md)** - Package bundles and purchase management
- **[Referral Codes API](./docs/referral-codes-api.md)** - Discount codes for purchases
- **[System API](./docs/system-api.md)** - Health checks and system info

---

*Last updated: November 21, 2025*