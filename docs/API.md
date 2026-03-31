# API Documentation

Complete reference for the Online Exam System REST API.

## Base URL
```
http://localhost:8080/api/v1
```

## Authentication

All endpoints except login and register require JWT authentication.

**Header:**
```
Authorization: Bearer <your-jwt-token>
```

**Obtain token:**
```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123"}'
```

---

## Endpoints

### Authentication

#### POST /auth/register
Register a new user.

**Request:**
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "STUDENT",
  "adminCode": null
}
```

**Response (201):**
```json
{
  "id": 1,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "fullName": "John Doe",
  "email": "john@example.com",
  "role": "STUDENT"
}
```

**Errors:**
- 400: Validation error
- 409: Email already exists
- 401: Invalid admin code

---

#### POST /auth/login
Login with email and password.

**Request:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "id": 1,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "fullName": "John Doe",
  "email": "john@example.com",
  "role": "STUDENT"
}
```

**Errors:**
- 401: Invalid credentials

---

### Courses

#### GET /courses
Get all active courses (public).

**Headers:** None required

**Response (200):**
```json
[
  {
    "id": 1,
    "title": "Java Fundamentals",
    "description": "Learn Java from scratch",
    "price": 99.99,
    "active": true
  }
]
```

---

#### POST /courses
Create a new course (admin only).

**Headers:** `Authorization: Bearer <admin-token>`

**Request:**
```json
{
  "title": "Java Fundamentals",
  "description": "Learn Java from scratch",
  "price": 99.99,
  "active": false
}
```

**Response (201):**
```json
{
  "id": 1,
  "title": "Java Fundamentals",
  "description": "Learn Java from scratch",
  "price": 99.99,
  "active": false
}
```

---

#### PUT /courses/{id}
Update a course (admin only).

**Headers:** `Authorization: Bearer <admin-token>`

**Request:**
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "price": 149.99,
  "active": true
}
```

---

#### DELETE /courses/{id}
Archive a course (admin only).

**Headers:** `Authorization: Bearer <admin-token>`

**Response (204):** No content

---

### Exams

#### GET /exams/course/{courseId}
Get all exams for a course.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
[
  {
    "id": 1,
    "title": "Java Basics Quiz",
    "description": "Test your Java knowledge",
    "maxMarks": 100,
    "passMarks": 40,
    "duration": 30,
    "examType": "MCQ",
    "active": true,
    "courseId": 1,
    "courseTitle": "Java Fundamentals"
  }
]
```

---

#### POST /exams/course/{courseId}
Create a new exam (admin only).

**Headers:** `Authorization: Bearer <admin-token>`

**Request:**
```json
{
  "title": "Java Basics Quiz",
  "description": "Test your Java knowledge",
  "maxMarks": 100,
  "passMarks": 40,
  "duration": 30,
  "examType": "MCQ"
}
```

---

#### PATCH /exams/{id}/status
Publish or unpublish an exam (admin only).

**Headers:** `Authorization: Bearer <admin-token>`

**Request:**
```json
{
  "active": true
}
```

---

### Questions

#### GET /questions/exam/{examId}
Get all questions for an exam.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
[
  {
    "id": 1,
    "content": "What is Java?",
    "option1": "A programming language",
    "option2": "A coffee brand",
    "option3": "An island",
    "option4": "A car",
    "marks": 25
  }
]
```

**Note:** `correctOption` is NOT included in the response for security.

---

#### POST /questions/exam/{examId}
Add a question to an exam (admin only).

**Headers:** `Authorization: Bearer <admin-token>`

**Request (MCQ):**
```json
{
  "content": "What is Java?",
  "option1": "A programming language",
  "option2": "A coffee brand",
  "option3": "An island",
  "option4": "A car",
  "correctOption": "1"
}
```

**Request (Subjective):**
```json
{
  "content": "Explain polymorphism in Java.",
  "option1": null,
  "option2": null,
  "option3": null,
  "option4": null,
  "correctOption": null
}
```

---

### Enrollments

#### POST /enrollments/course/{courseId}
Enroll in a course (student only).

**Headers:** `Authorization: Bearer <student-token>`

**Request:**
```json
{
  "paymentMode": "UPI",
  "transactionReference": "TXN123456"
}
```

**Response (201):**
```json
{
  "id": 1,
  "courseId": 1,
  "courseTitle": "Java Fundamentals",
  "description": "Learn Java from scratch",
  "studentName": "John Doe",
  "status": "PENDING",
  "paymentMode": "UPI",
  "transactionReference": "TXN123456",
  "enrollmentDate": "2026-03-25T10:30:00"
}
```

---

#### GET /enrollments/user/{userId}
Get enrollments for a user.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
[
  {
    "id": 1,
    "courseId": 1,
    "courseTitle": "Java Fundamentals",
    "description": "Learn Java from scratch",
    "studentName": "John Doe",
    "status": "PAID",
    "paymentMode": "UPI",
    "transactionReference": "TXN123456",
    "enrollmentDate": "2026-03-25T10:30:00"
  }
]
```

---

#### PATCH /enrollments/{id}/status
Approve or reject enrollment (admin only).

**Headers:** `Authorization: Bearer <admin-token>`

**Request:**
```json
{
  "status": "PAID",
  "adminRemarks": "Payment verified"
}
```

---

### Submissions

#### POST /submissions/start
Start an exam (student only).

**Headers:** `Authorization: Bearer <student-token>`

**Request:**
```json
{
  "examId": 1
}
```

---

#### POST /submissions/save-answer
Save an answer during exam (student only).

**Headers:** `Authorization: Bearer <student-token>`

**Request (MCQ):**
```json
{
  "examId": 1,
  "questionId": 1,
  "selectedOption": "2",
  "subjectiveText": null
}
```

**Request (Subjective):**
```json
{
  "examId": 1,
  "questionId": 1,
  "selectedOption": null,
  "subjectiveText": "Polymorphism is..."
}
```

---

#### POST /submissions/submit/{examId}
Submit an exam (student only).

**Headers:** `Authorization: Bearer <student-token>`

**Response (201):**
```json
{
  "examId": 1,
  "examTitle": "Java Basics Quiz",
  "totalMarks": 100,
  "marksObtained": 85.0,
  "correctAnswers": 4,
  "attemptedQuestions": 5,
  "status": "PASSED"
}
```

---

#### GET /submissions/my-results
Get all submissions for current user (student only).

**Headers:** `Authorization: Bearer <student-token>`

**Response (200):**
```json
[
  {
    "id": 1,
    "examId": 1,
    "examTitle": "Java Basics Quiz",
    "courseTitle": "Java Fundamentals",
    "studentName": "John Doe",
    "status": "PASSED",
    "totalMarksAwarded": 85.0,
    "maxMarks": 100,
    "attemptNumber": 1,
    "submittedAt": "2026-03-25T11:00:00"
  }
]
```

---

#### GET /submissions/{id}
Get detailed submission with answers.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "id": 1,
  "examTitle": "Java Basics Quiz",
  "studentName": "John Doe",
  "totalMarksAwarded": 85.0,
  "examMaxMarks": 100,
  "status": "PASSED",
  "attemptNumber": 1,
  "submittedAt": "2026-03-25T11:00:00",
  "answers": [
    {
      "answerId": 1,
      "questionContent": "What is Java?",
      "selectedOption": "1",
      "subjectiveText": null,
      "correctAnswer": "1",
      "marksAwarded": 25.0,
      "maxQuestionMarks": 25.0
    }
  ]
}
```

---

### Certificates

#### GET /certificates/course/{courseId}
Download course certificate (student only).

**Headers:** `Authorization: Bearer <student-token>`

**Response (200):** PDF file (application/pdf)

---

### Admin Endpoints

#### GET /admin/students
Get all students (admin only).

**Headers:** `Authorization: Bearer <admin-token>`

**Query Parameters:**
- `page` (default: 0)
- `size` (default: 50)

**Response (200):**
```json
{
  "content": [
    {
      "id": 1,
      "fullName": "John Doe",
      "email": "john@example.com",
      "role": "STUDENT"
    }
  ],
  "totalElements": 100,
  "totalPages": 2,
  "currentPage": 0
}
```

---

#### GET /admin/students/{studentId}/submissions
Get all submissions for a student (admin only).

**Headers:** `Authorization: Bearer <admin-token>`

**Response (200):**
```json
[
  {
    "id": 1,
    "examId": 1,
    "examTitle": "Java Basics Quiz",
    "courseTitle": "Java Fundamentals",
    "studentName": "John Doe",
    "status": "PASSED",
    "totalMarksAwarded": 85.0,
    "maxMarks": 100
  }
]
```

---

## Error Responses

All endpoints return errors in this format:

```json
{
  "timestamp": "2026-03-25T10:30:00",
  "status": 400,
  "error": "Validation Failed",
  "errors": {
    "title": "Title must be between 3 and 100 characters"
  }
}
```

### Common Error Codes

| Code | Meaning |
|------|---------|
| 400 | Bad Request - Validation error |
| 401 | Unauthorized - Invalid or missing token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 409 | Conflict - Duplicate resource |
| 500 | Internal Server Error - Server error |

---

## Rate Limiting

Currently no rate limiting is implemented. For production, consider adding rate limiting to:
- `/api/v1/auth/login` — Prevent brute force attacks
- `/api/v1/auth/register` — Prevent spam registrations
- `/api/v1/submissions` — Prevent exam abuse

---

## Pagination

Endpoints that return lists support pagination:

**Query Parameters:**
- `page` — Page number (default: 0)
- `size` — Items per page (default: 20)

**Example:**
```bash
GET /api/v1/admin/students?page=0&size=50
```

**Response:**
```json
{
  "content": [...],
  "totalElements": 100,
  "totalPages": 2,
  "currentPage": 0
}
```
