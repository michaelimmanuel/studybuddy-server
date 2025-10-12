# 📦 Package Management API

Package management endpoints for creating and managing question packages that can be sold to users. All prices are in Indonesian Rupiah (IDR).

## Base URL
```
http://localhost:8000/api/packages
```

## 🔒 Authentication Required
All package endpoints require valid authentication. Admin privileges are required for package creation and management.

---

## 📚 Package Endpoints

### Get All Packages
```http
GET /api/packages
```

**Description:** Get all packages. Admins see all packages, users see only active packages.

**Access:** Authenticated users

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "package-uuid",
      "title": "Advanced Mathematics Package",
      "description": "Complete set of advanced math questions",
      "price": 299000,
      "isActive": true,
      "createdAt": "2023-01-01T12:00:00Z",
      "updatedAt": "2023-01-01T12:00:00Z",
      "createdBy": "admin-user-id",
      "packageQuestions": [
        {
          "id": "pq-uuid",
          "packageId": "package-uuid",
          "questionId": "question-uuid",
          "order": 1,
          "createdAt": "2023-01-01T12:00:00Z",
          "question": {
            "id": "question-uuid",
            "text": "What is 2+2?",
            "explanation": "Basic addition question",
            "course": {
              "id": "course-uuid",
              "title": "Mathematics"
            },
            "answers": [
              {
                "id": "answer-uuid",
                "text": "4",
                "isCorrect": true
              }
            ]
          }
        }
      ]
    }
  ]
}
```

### Get Package by ID
```http
GET /api/packages/:id
```

**Description:** Get a specific package by ID.

**Parameters:**
- `id` (URL parameter): Package UUID

**Access:** Authenticated users

**Response:** Same structure as single package in the array above

---

## 🛠️ Admin Only Endpoints

### Create Package
```http
POST /api/packages
```

**Description:** Create a new question package.

**Access:** Admin only

**Request Body:**
```json
{
  "title": "Advanced Mathematics Package",
  "description": "Complete set of advanced math questions",
  "price": 299000
}
```

**Validation Rules:**
- `title`: Required, 1-200 characters
- `description`: Optional, max 1000 characters
- `price`: Required, positive number (in IDR)

**Response:**
```json
{
  "success": true,
  "message": "Package created successfully",
  "data": {
    "id": "package-uuid",
    "title": "Advanced Mathematics Package",
    "description": "Complete set of advanced math questions",
    "price": 299000,
    "isActive": true,
    "createdAt": "2023-01-01T12:00:00Z",
    "updatedAt": "2023-01-01T12:00:00Z",
    "createdBy": "admin-user-id"
  }
}
```

### Update Package
```http
PUT /api/packages/:id
```

**Description:** Update an existing package.

**Parameters:**
- `id` (URL parameter): Package UUID

**Access:** Admin only

**Request Body:** (All fields optional)
```json
{
  "title": "Updated Package Title",
  "description": "Updated description",
  "price": 399000,
  "isActive": false
}
```

**Response:**
```json
{
  "success": true,
  "message": "Package updated successfully",
  "data": {
    "id": "package-uuid",
    "title": "Updated Package Title",
    "description": "Updated description",
    "price": 399000,
    "isActive": false,
    "createdAt": "2023-01-01T12:00:00Z",
    "updatedAt": "2023-01-01T13:00:00Z",
    "createdBy": "admin-user-id"
  }
}
```

### Delete Package
```http
DELETE /api/packages/:id
```

**Description:** Delete a package permanently.

**Parameters:**
- `id` (URL parameter): Package UUID

**Access:** Admin only

**Response:**
```json
{
  "success": true,
  "message": "Package deleted successfully"
}
```

---

## 📝 Package Question Management

### Add Questions to Package
```http
POST /api/packages/:packageId/questions
```

**Description:** Add questions to a package.

**Parameters:**
- `packageId` (URL parameter): Package UUID

**Access:** Admin only

**Request Body:**
```json
{
  "questionIds": [
    "question-uuid-1",
    "question-uuid-2",
    "question-uuid-3"
  ]
}
```

**Validation Rules:**
- `questionIds`: Required array of valid UUIDs
- Maximum 100 questions can be added at once
- Duplicate questions are skipped

**Response:**
```json
{
  "success": true,
  "message": "3 questions added to package",
  "data": {
    "packageId": "package-uuid",
    "questionsAdded": 3,
    "duplicatesSkipped": 0
  }
}
```

### Remove Questions from Package
```http
DELETE /api/packages/:packageId/questions
```

**Description:** Remove questions from a package.

**Parameters:**
- `packageId` (URL parameter): Package UUID

**Access:** Admin only

**Request Body:**
```json
{
  "questionIds": [
    "question-uuid-1",
    "question-uuid-2"
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "2 questions removed from package",
  "data": {
    "packageId": "package-uuid",
    "questionsRemoved": 2
  }
}
```

---

## 🚨 Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation error",
  "details": [
    {
      "field": "title",
      "message": "Title is required"
    }
  ]
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Access denied. Admin privileges required."
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Package not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## 💡 Usage Examples

### Creating a Package with Questions

1. **Create the package:**
```bash
curl -X POST http://localhost:8000/api/packages \
  -H "Content-Type: application/json" \
  -H "Cookie: better-auth.session_token=admin-token" \
  -d '{
    "title": "Calculus Basics",
    "description": "Introduction to calculus problems",
    "price": 199000
  }'
```

2. **Add questions to the package:**
```bash
curl -X POST http://localhost:8000/api/packages/package-uuid/questions \
  -H "Content-Type: application/json" \
  -H "Cookie: better-auth.session_token=admin-token" \
  -d '{
    "questionIds": [
      "question-1-uuid",
      "question-2-uuid",
      "question-3-uuid"
    ]
  }'
```

3. **Verify the package:**
```bash
curl -X GET http://localhost:8000/api/packages/package-uuid \
  -H "Cookie: better-auth.session_token=user-token"
```

---

## 📋 Package Question Order

Questions in a package are automatically ordered based on the order they're added. The `order` field in `PackageQuestion` starts from 1 and increments for each question added to the package.

## 🔄 Future Enhancements

The package system is designed to support future features like:
- User purchases (payment integration)
- Package categories and tags
- Package ratings and reviews
- Bulk package operations
- Package analytics and reporting