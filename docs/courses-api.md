# 🎓 Courses API

Course management, enrollment system, and administration.

## Base URL
```
http://localhost:8000/api/courses
```

## Public Routes

### Get All Courses
```http
GET /api/courses
```
**Access:** Public (optional authentication for enrollment status)

**Query Parameters:**
- `page` (number, optional) - Page number (default: 1)
- `limit` (number, optional) - Items per page (default: 10, max: 100)
- `search` (string, optional) - Search in title and description

**Response (200):**
```json
{
  "courses": [
    {
      "id": "uuid",
      "title": "JavaScript Fundamentals",
      "description": "Learn the basics of JavaScript",
      "createdAt": "2025-10-01T10:00:00.000Z",
      "updatedAt": "2025-10-01T10:00:00.000Z",
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

---

### Get Course by ID
```http
GET /api/courses/:id
```
**Access:** Public (optional authentication for detailed enrollment info)

**Parameters:**
- `id` (UUID) - Course ID

**Response (200):**
```json
{
  "course": {
    "id": "uuid",
    "title": "JavaScript Fundamentals",
    "description": "Learn the basics of JavaScript",
    "createdAt": "2025-10-01T10:00:00.000Z",
    "updatedAt": "2025-10-01T10:00:00.000Z",
    "enrollmentCount": 15,
    "userEnrollment": {
      "status": "APPROVED",
      "enrolledAt": "2025-10-01T11:00:00.000Z"
    },
    "enrolledUsers": [
      {
        "id": "uuid",
        "name": "John Doe",
        "email": "john@example.com",
        "image": null,
        "enrolledAt": "2025-10-01T11:00:00.000Z"
      }
    ]
  }
}
```

## Protected Routes (Authentication Required)

### Enroll in Course
```http
POST /api/courses/:id/enroll
```
**Access:** Authenticated users

**Parameters:**
- `id` (UUID) - Course ID

**Response (201):**
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
    "enrolledAt": "2025-10-01T11:00:00.000Z"
  }
}
```

---

### Unenroll from Course
```http
DELETE /api/courses/:id/unenroll
```
**Access:** Authenticated users

**Parameters:**
- `id` (UUID) - Course ID

**Response (200):**
```json
{
  "message": "Successfully unenrolled from course"
}
```

---

### Get Course Students
```http
GET /api/courses/:id/students
```
**Access:** Enrolled users or admin

**Parameters:**
- `id` (UUID) - Course ID

**Response (200):**
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
      "enrolledAt": "2025-10-01T11:00:00.000Z",
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

---

### Get User's Courses
```http
GET /api/courses/user/:userId
```
**Access:** Own courses or admin

**Parameters:**
- `userId` (UUID) - User ID

**Response (200):**
```json
{
  "courses": [
    {
      "enrollmentId": "uuid",
      "status": "APPROVED",
      "enrolledAt": "2025-10-01T11:00:00.000Z",
      "course": {
        "id": "uuid",
        "title": "JavaScript Fundamentals",
        "description": "Learn JavaScript basics",
        "createdAt": "2025-10-01T10:00:00.000Z",
        "updatedAt": "2025-10-01T10:00:00.000Z"
      }
    }
  ],
  "totalEnrollments": 3,
  "approvedEnrollments": 2,
  "pendingEnrollments": 1
}
```

## Admin Routes (Admin Role Required)

### Create Course
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

**Response (201):**
```json
{
  "message": "Course created successfully",
  "course": {
    "id": "uuid",
    "title": "React Development",
    "description": "Build modern web applications with React",
    "createdAt": "2025-10-01T10:00:00.000Z",
    "updatedAt": "2025-10-01T10:00:00.000Z",
    "enrollmentCount": 0
  }
}
```

---

### Update Course
```http
PUT /api/courses/:id
```
**Access:** Admin only

**Parameters:**
- `id` (UUID) - Course ID

**Request Body:**
```json
{
  "title": "Advanced React Development",
  "description": "Master React with advanced patterns and hooks"
}
```

**Response (200):**
```json
{
  "message": "Course updated successfully",
  "course": {
    "id": "uuid",
    "title": "Advanced React Development",
    "description": "Master React with advanced patterns and hooks",
    "updatedAt": "2025-10-01T12:00:00.000Z"
  }
}
```

---

### Delete Course
```http
DELETE /api/courses/:id
```
**Access:** Admin only
**Note:** Cannot delete courses with existing enrollments

**Parameters:**
- `id` (UUID) - Course ID

**Response (200):**
```json
{
  "message": "Course deleted successfully"
}
```

---

### Get Course Statistics
```http
GET /api/courses/stats
```
**Access:** Admin only

**Response (200):**
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

---

### Manage Enrollment Status
```http
PUT /api/courses/enrollments/:enrollmentId
```
**Access:** Admin only

**Parameters:**
- `enrollmentId` (UUID) - Enrollment ID

**Request Body:**
```json
{
  "status": "APPROVED"
}
```

**Valid statuses:** `PENDING`, `APPROVED`, `REJECTED`

**Response (200):**
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
    "updatedAt": "2025-10-01T12:00:00.000Z"
  }
}
```

## Enrollment Status Types

| Status | Description |
|--------|-------------|
| `PENDING` | Enrollment request submitted, awaiting approval |
| `APPROVED` | Enrollment approved, user has access to course |
| `REJECTED` | Enrollment request denied |

## Error Responses

### Course Not Found (404)
```json
{
  "message": "Course not found"
}
```

### Already Enrolled (409)
```json
{
  "message": "User is already enrolled in this course"
}
```

### Not Enrolled (403)
```json
{
  "message": "Access denied. You must be enrolled in this course."
}
```

### Cannot Delete Course (409)
```json
{
  "message": "Cannot delete course with existing enrollments"
}
```

## Testing Examples

### Get All Courses
```bash
curl -X GET "http://localhost:8000/api/courses?search=javascript&limit=5"
```

### Enroll in Course
```bash
curl -X POST http://localhost:8000/api/courses/COURSE_ID/enroll \
  -H "Cookie: better-auth.session_token=YOUR_SESSION_TOKEN"
```

### Create Course (Admin)
```bash
curl -X POST http://localhost:8000/api/courses \
  -H "Content-Type: application/json" \
  -H "Cookie: better-auth.session_token=ADMIN_SESSION_TOKEN" \
  -d '{"title":"React Development","description":"Build modern web applications with React"}'
```