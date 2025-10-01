# ❓ Questions API

Question bank management with rich answer explanations for enhanced learning.

## Base URL
```
http://localhost:8000/api
```

## Course Question Routes

### Get Course Questions
```http
GET /api/courses/:id/questions
```
**Access:** Authenticated (enrolled users or admins)

**Parameters:**
- `id` (UUID) - Course ID

**Query Parameters:**
- `page` (number, optional) - Page number (default: 1)
- `limit` (number, optional) - Items per page (default: 10, max: 100)
- `search` (string, optional) - Search term for question text

**Response (200):**
```json
{
  "course": {
    "id": "course-uuid",
    "title": "Introduction to Programming"
  },
  "questions": [
    {
      "id": "question-uuid",
      "text": "What is a variable in programming?",
      "createdAt": "2025-10-01T10:00:00.000Z",
      "updatedAt": "2025-10-01T10:00:00.000Z",
      "course": {
        "id": "course-uuid",
        "title": "Introduction to Programming"
      },
      "answers": [
        {
          "id": "answer-uuid-1",
          "text": "A container for storing data values"
          // Note: isCorrect and explanation only visible to admins
        },
        {
          "id": "answer-uuid-2", 
          "text": "A type of function"
        }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

**Admin Response (includes isCorrect and explanation):**
```json
{
  "questions": [
    {
      "id": "question-uuid",
      "text": "What is a variable in programming?",
      "explanation": "A variable is a fundamental concept in programming that acts as a named container for storing and manipulating data values.",
      "answers": [
        {
          "id": "answer-uuid-1",
          "text": "A container for storing data values",
          "isCorrect": true
        },
        {
          "id": "answer-uuid-2",
          "text": "A type of function", 
          "isCorrect": false
        }
      ]
    }
  ]
}
```

---

### Create Question
```http
POST /api/courses/:id/questions
```
**Access:** Admin only

**Parameters:**
- `id` (UUID) - Course ID

**Request Body:**
```json
{
  "text": "What is a variable in programming?",
  "explanation": "A variable is a fundamental concept in programming that acts as a named container for storing and manipulating data values.",
  "answers": [
    {
      "text": "A container for storing data values",
      "isCorrect": true
    },
    {
      "text": "A type of function",
      "isCorrect": false
    },
    {
      "text": "A programming language",
      "isCorrect": false
    }
  ]
}
```

**Validation Rules:**
- **Question text:** 10-1000 characters (required)
- **Question explanation:** 0-1000 characters (optional)
- **Answers:** 2-6 answers required
- **At least 1 correct answer** required
- **Answer text:** 1-500 characters each (required)

**Response (201):**
```json
{
  "message": "Question created successfully",
  "question": {
    "id": "question-uuid",
    "text": "What is a variable in programming?",
    "explanation": "A variable is a fundamental concept in programming that acts as a named container for storing and manipulating data values.",
    "courseId": "course-uuid",
    "createdAt": "2025-10-01T10:00:00.000Z",
    "updatedAt": "2025-10-01T10:00:00.000Z",
    "answers": [
      {
        "id": "answer-uuid-1",
        "text": "A container for storing data values",
        "isCorrect": true
      },
      {
        "id": "answer-uuid-2",
        "text": "A type of function",
        "isCorrect": false
      }
    ]
  }
}
```

---

### Get Course Question Statistics
```http
GET /api/courses/:id/questions/stats
```
**Access:** Admin only

**Parameters:**
- `id` (UUID) - Course ID

**Response (200):**
```json
{
  "course": {
    "id": "course-uuid",
    "title": "Introduction to Programming"
  },
  "stats": {
    "totalQuestions": 25,
    "questionsWithMultipleCorrectAnswers": 3,
    "averageAnswersPerQuestion": 3.8,
    "questionsCreatedThisWeek": 5,
    "questionsCreatedThisMonth": 15
  }
}
```

## Individual Question Routes

### Get Question by ID
```http
GET /api/questions/:id
```
**Access:** Authenticated users

**Parameters:**
- `id` (UUID) - Question ID

**Response (200):**
```json
{
  "question": {
    "id": "question-uuid",
    "text": "What is a variable in programming?",
    "courseId": "course-uuid",
    "createdAt": "2025-10-01T10:00:00.000Z",
    "updatedAt": "2025-10-01T10:00:00.000Z",
    "course": {
      "id": "course-uuid",
      "title": "Introduction to Programming"
    },
    "answers": [
      {
        "id": "answer-uuid-1",
        "text": "A container for storing data values"
        // isCorrect and explanation only for admins
      }
    ]
  }
}
```

---

### Update Question
```http
PUT /api/questions/:id
```
**Access:** Admin only

**Parameters:**
- `id` (UUID) - Question ID

**Request Body:**
```json
{
  "text": "What is a variable in programming? (Updated)",
  "explanation": "Updated explanation: A variable is a named storage location in memory that can hold different types of data values during program execution.",
  "answers": [
    {
      "text": "A container for storing data values",
      "isCorrect": true
    },
    {
      "text": "A type of function",
      "isCorrect": false
    }
  ]
}
```

**Response (200):**
```json
{
  "message": "Question updated successfully",
  "question": {
    "id": "question-uuid",
    "text": "What is a variable in programming? (Updated)",
    "explanation": "Updated explanation: A variable is a named storage location in memory that can hold different types of data values during program execution.",
    "courseId": "course-uuid",
    "updatedAt": "2025-10-01T12:00:00.000Z",
    "answers": [
      {
        "id": "answer-uuid-1",
        "text": "A container for storing data values",
        "isCorrect": true
      }
    ]
  }
}
```

---

### Delete Question
```http
DELETE /api/questions/:id
```
**Access:** Admin only

**Parameters:**
- `id` (UUID) - Question ID

**Response (200):**
```json
{
  "message": "Question deleted successfully"
}
```

## Question Explanation Feature

### 🆕 Enhanced Learning with Single Explanations

The question system now supports a single detailed explanation per question that applies to the entire question context:

**For Admins:**
- ✅ Can add one explanation when creating/editing questions
- ✅ Can see explanations and correct answers for all questions
- ✅ Can use explanations to provide comprehensive learning context

**For Students:**
- ❌ Explanations are hidden during normal viewing
- ✅ Can be shown explanations in practice/quiz mode (frontend choice)
- ✅ Enhanced learning when explanations are revealed after answering

### Explanation Structure

**New Structure (Question-level):**
- **Single explanation per question** that provides context for the entire question
- **Explains the concept** being tested, not individual answer choices
- **More educational approach** focusing on learning the underlying concept

**Benefits:**
- **Simplified content creation** - one explanation covers the whole question
- **Better learning focus** - explains the concept rather than individual choices
- **Cleaner data structure** - explanation tied to the question, not scattered across answers
- **More maintainable** - easier to update and manage explanations

### Example Usage Patterns

1. **Study Mode**: Show question explanation after student answers to provide learning context
2. **Quiz Mode**: Hide explanations until quiz completion, then show for learning reinforcement
3. **Review Mode**: Show all explanations to help students understand concepts
4. **Admin Preview**: Always show explanations for content quality review

### Content Guidelines

**Question Explanations should:**
- Explain the underlying concept being tested
- Provide educational context for the topic
- Help students understand the "why" behind the correct answer
- Be concise but comprehensive (max 1000 characters)
- Focus on learning rather than just correctness

## Permission Matrix

| Action | Student | Enrolled Student | Admin |
|--------|---------|------------------|-------|
| View questions | ❌ | ✅ | ✅ |
| See correct answers | ❌ | ❌ | ✅ |
| See explanations | ❌ | ❌ | ✅ |
| Create questions | ❌ | ❌ | ✅ |
| Edit questions | ❌ | ❌ | ✅ |
| Delete questions | ❌ | ❌ | ✅ |
| View statistics | ❌ | ❌ | ✅ |

## Error Responses

### Course Not Found (404)
```json
{
  "message": "Course not found"
}
```

### Question Not Found (404)
```json
{
  "message": "Question not found"
}
```

### Access Denied (403)
```json
{
  "message": "Access denied. You must be enrolled in this course."
}
```

### Admin Required (403)
```json
{
  "message": "Access denied. Admin privileges required."
}
```

### Validation Error (400)
```json
{
  "message": "Validation error",
  "details": [
    {
      "field": "text",
      "message": "Question text must be between 10-1000 characters"
    },
    {
      "field": "answers",
      "message": "At least one answer must be marked as correct"
    }
  ]
}
```

## Testing Examples

### Get Course Questions (Student)
```bash
curl -X GET "http://localhost:8000/api/courses/COURSE_ID/questions?page=1&limit=5" \
  -H "Cookie: better-auth.session_token=STUDENT_SESSION_TOKEN"
```

### Create Question with Explanation (Admin)
```bash
curl -X POST http://localhost:8000/api/courses/COURSE_ID/questions \
  -H "Content-Type: application/json" \
  -H "Cookie: better-auth.session_token=ADMIN_SESSION_TOKEN" \
  -d '{
    "text": "What is a variable in programming?",
    "explanation": "A variable is a fundamental concept in programming that acts as a named container for storing and manipulating data values of different types during program execution.",
    "answers": [
      {
        "text": "A container for storing data values",
        "isCorrect": true
      },
      {
        "text": "A type of function",
        "isCorrect": false
      }
    ]
  }'
```

### Update Question (Admin)
```bash
curl -X PUT http://localhost:8000/api/questions/QUESTION_ID \
  -H "Content-Type: application/json" \
  -H "Cookie: better-auth.session_token=ADMIN_SESSION_TOKEN" \
  -d '{
    "text": "Updated question text",
    "explanation": "Updated explanation that provides comprehensive context",
    "answers": [
      {
        "text": "Updated answer",
        "isCorrect": true
      }
    ]
  }'
```

### Get Question Statistics (Admin)
```bash
curl -X GET "http://localhost:8000/api/courses/COURSE_ID/questions/stats" \
  -H "Cookie: better-auth.session_token=ADMIN_SESSION_TOKEN"
```