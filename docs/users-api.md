# 👥 Users API

User management, profiles, and administrative functions.

## Base URL
```
http://localhost:8000/api/users
```

## Public Routes

### Get User Statistics
```http
GET /api/users/stats
```
**Access:** Public

**Response (200):**
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

## Protected Routes (Authentication Required)

### Get Current User
```http
GET /api/users/me
```
**Access:** Authenticated users

**Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": null,
    "banned": false,
    "image": null,
    "createdAt": "2025-10-01T10:00:00.000Z"
  }
}
```

---

### Get User Profile
```http
GET /api/users/:id/profile
```
**Access:** Authenticated users

**Parameters:**
- `id` (UUID) - User ID

**Response (200):**
```json
{
  "profile": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "image": null,
    "role": null,
    "createdAt": "2025-10-01T10:00:00.000Z"
  }
}
```

---

### Update User Profile
```http
PUT /api/users/:id/profile
```
**Access:** Authenticated users (own profile only)

**Parameters:**
- `id` (UUID) - User ID

**Request Body:**
```json
{
  "name": "John Smith",
  "image": "https://example.com/avatar.jpg"
}
```

**Response (200):**
```json
{
  "message": "Profile updated successfully",
  "user": {
    "id": "uuid",
    "name": "John Smith",
    "email": "john@example.com",
    "image": "https://example.com/avatar.jpg"
  }
}
```

## Admin Routes (Admin Role Required)

### Get All Users
```http
GET /api/users
```
**Access:** Admin only

**Query Parameters:**
- `page` (number, optional) - Page number (default: 1)
- `limit` (number, optional) - Items per page (default: 10, max: 100)
- `search` (string, optional) - Search by name or email

**Response (200):**
```json
{
  "users": [
    {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "role": null,
      "banned": false,
      "createdAt": "2025-10-01T10:00:00.000Z"
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

---

### Get User by ID
```http
GET /api/users/:id
```
**Access:** Admin only

**Parameters:**
- `id` (UUID) - User ID

**Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": null,
    "banned": false,
    "banReason": null,
    "banExpires": null,
    "createdAt": "2025-10-01T10:00:00.000Z"
  }
}
```

---

### Check If Current User is Admin
```http
GET /api/users/is-admin
```
**Access:** Authenticated users

**Response (200):**
```json
{
  "isAdmin": true
}
```

---

### Create User
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

**Response (201):**
```json
{
  "message": "User created successfully",
  "user": {
    "id": "uuid",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "admin",
    "banned": false
  }
}
```

---

### Update User
```http
PUT /api/users/:id
```
**Access:** Admin only

**Parameters:**
- `id` (UUID) - User ID

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

**Response (200):**
```json
{
  "message": "User updated successfully",
  "user": {
    "id": "uuid",
    "name": "Updated Name",
    "role": "admin",
    "banned": true,
    "banReason": "Violation of terms",
    "banExpires": "2025-12-31T00:00:00.000Z"
  }
}
```

---

### Delete User
```http
DELETE /api/users/:id
```
**Access:** Admin only

**Parameters:**
- `id` (UUID) - User ID

**Response (200):**
```json
{
  "message": "User deleted successfully"
}
```

---

### Create Admin User
```http
POST /api/users/create-admin
```
**Access:** Admin only

**Description:** Allows existing admins to create new admin users with full credentials.

**Request Body:**
```json
{
  "name": "Admin User",
  "email": "admin@example.com",
  "password": "SecurePassword123!"
}
```

**Response (201):**
```json
{
  "message": "Admin user created successfully",
  "user": {
    "id": "uuid",
    "name": "Admin User",
    "email": "admin@example.com",
    "role": "admin",
    "emailVerified": false,
    "createdAt": "2025-10-10T10:00:00.000Z"
  }
}
```

**Error Responses:**
```json
// User already exists (409)
{
  "message": "A user with this email already exists"
}

// Invalid credentials (400)
{
  "message": "Password does not meet requirements"
}
```

---

### Get All Admin Users
```http
GET /api/users/admins
```
**Access:** Admin only

**Description:** Retrieve a list of all users with admin privileges.

**Query Parameters:**
- `page` (number, optional) - Page number (default: 1)
- `limit` (number, optional) - Items per page (default: 10)

**Response (200):**
```json
{
  "adminUsers": [
    {
      "id": "uuid",
      "name": "Admin User",
      "email": "admin@example.com",
      "emailVerified": true,
      "image": null,
      "role": "admin",
      "banned": false,
      "createdAt": "2025-10-01T10:00:00.000Z",
      "updatedAt": "2025-10-01T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalPages": 1,
    "totalAdminUsers": 3
  }
}
```

---

### Revoke Admin Privileges
```http
PATCH /api/users/:id/revoke-admin
```
**Access:** Admin only

**Description:** Demote an admin user to a regular user. Includes safety checks to prevent system lockout.

**Parameters:**
- `id` (UUID) - User ID of the admin to demote

**Response (200):**
```json
{
  "message": "Admin privileges revoked successfully",
  "user": {
    "id": "uuid",
    "name": "Former Admin",
    "email": "former-admin@example.com",
    "role": "user",
    "updatedAt": "2025-10-10T10:00:00.000Z"
  }
}
```

**Error Responses:**
```json
// Cannot revoke own privileges (403)
{
  "message": "You cannot revoke your own admin privileges"
}

// Last admin protection (403)
{
  "message": "Cannot revoke admin privileges. At least one admin must remain."
}

// User is not an admin (400)
{
  "message": "User is not an admin"
}
```

## Error Responses

### User Not Found (404)
```json
{
  "message": "User not found"
}
```

### Insufficient Permissions (403)
```json
{
  "message": "Access denied. Admin privileges required."
}
```

### Email Already Exists (409)
```json
{
  "message": "Email already in use"
}
```

## Testing Examples

### Get Current User
```bash
curl -X GET http://localhost:8000/api/users/me \
  -H "Cookie: better-auth.session_token=YOUR_SESSION_TOKEN"
```

### Update Profile
```bash
curl -X PUT http://localhost:8000/api/users/USER_ID/profile \
  -H "Content-Type: application/json" \
  -H "Cookie: better-auth.session_token=YOUR_SESSION_TOKEN" \
  -d '{"name":"John Smith","image":"https://example.com/avatar.jpg"}'
```

### Create Admin User
```bash
curl -X POST http://localhost:8000/api/users/create-admin \
  -H "Content-Type: application/json" \
  -H "Cookie: better-auth.session_token=ADMIN_SESSION_TOKEN" \
  -d '{
    "name": "New Admin",
    "email": "newadmin@example.com",
    "password": "SecurePassword123!"
  }'
```

### Get All Admin Users
```bash
curl -X GET http://localhost:8000/api/users/admins \
  -H "Cookie: better-auth.session_token=ADMIN_SESSION_TOKEN"
```

### Revoke Admin Privileges
```bash
curl -X PATCH http://localhost:8000/api/users/USER_ID/revoke-admin \
  -H "Cookie: better-auth.session_token=ADMIN_SESSION_TOKEN"
```

### Get All Users (Admin)
```bash
curl -X GET "http://localhost:8000/api/users?page=1&limit=20" \
  -H "Cookie: better-auth.session_token=ADMIN_SESSION_TOKEN"
```