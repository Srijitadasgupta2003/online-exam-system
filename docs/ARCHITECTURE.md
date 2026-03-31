# Architecture Documentation

System design and technical architecture of the Online Exam System.

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                         │
├─────────────────────────────────────────────────────────────┤
│  React Frontend (Vite + Tailwind CSS)                       │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐       │
│  │  Auth   │  │ Student │  │  Admin  │  │  Course │       │
│  │  Pages  │  │Dashboard│  │Dashboard│  │  Pages  │       │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘       │
│         │            │            │            │             │
│         └────────────┴────────────┴────────────┘             │
│                          │                                   │
│                    Axios (HTTP)                              │
└──────────────────────────┼──────────────────────────────────┘
                           │
                           │ JWT Bearer Token
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                       SERVER LAYER                          │
├─────────────────────────────────────────────────────────────┤
│  Spring Boot Application                                    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │  Controllers│  │  Services   │  │Repositories │        │
│  │  (REST API) │  │ (Business)  │  │  (JPA/Hib)  │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
│         │               │               │                  │
│         └───────────────┴───────────────┘                  │
│                          │                                  │
│                    ┌─────┴─────┐                            │
│                    │   JWT     │                            │
│                    │ Security  │                            │
│                    └───────────┘                            │
└──────────────────────────┼──────────────────────────────────┘
                           │
                           │ JDBC
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                      DATABASE LAYER                         │
├─────────────────────────────────────────────────────────────┤
│  PostgreSQL (Supabase)                                      │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐       │
│  │  Users  │  │ Courses │  │  Exams  │  │Questions│       │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘       │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐       │
│  │Enroll- │  │Submis- │  │Student │  │Certifi-│       │
│  │ ments  │  │ sions  │  │Answers │  │ cates  │       │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘       │
└─────────────────────────────────────────────────────────────┘
```

---

## Database Schema

### Entity Relationship Diagram

```
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│    USERS     │       │   COURSES    │       │    EXAMS     │
├──────────────┤       ├──────────────┤       ├──────────────┤
│ id           │       │ id           │       │ id           │
│ fullName     │       │ title        │◄──────┤ courseId     │
│ email        │       │ description  │       │ title        │
│ password     │       │ price        │       │ description  │
│ role         │       │ active       │       │ maxMarks     │
│ createdAt    │       │ archived     │       │ passMarks    │
└──────┬───────┘       │ createdAt    │       │ duration     │
       │               └──────┬───────┘       │ examType     │
       │                      │               │ active       │
       │                      │               │ archived     │
       │                      │               └──────┬───────┘
       │                      │                      │
       │                      │                      │
       ▼                      ▼                      ▼
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│ ENROLLMENTS  │       │   EXAMS      │       │  QUESTIONS   │
├──────────────┤       ├──────────────┤       ├──────────────┤
│ id           │       │ id           │       │ id           │
│ userId       │       │ courseId     │       │ examId       │
│ courseId     │       │ title        │       │ content      │
│ status       │       │ ...          │       │ option1-4    │
│ paymentMode  │       └──────────────┘       │ correctOption│
│ transaction  │                              │ marks        │
│ failedAttemp │                              └──────┬───────┘
│ archived     │                                     │
└──────────────┘                                     │
                                                     │
                                                     ▼
                                              ┌──────────────┐
                                              │EXAM_SUBMISSIONS│
                                              ├──────────────┤
                                              │ id           │
                                              │ userId       │
                                              │ examId       │
                                              │ status       │
                                              │ totalMarks   │
                                              │ attempt      │
                                              │ archived     │
                                              └──────┬───────┘
                                                     │
                                                     ▼
                                              ┌──────────────┐
                                              │STUDENT_ANSWERS│
                                              ├──────────────┤
                                              │ id           │
                                              │ submissionId │
                                              │ questionId   │
                                              │ selectedOpt  │
                                              │ subjectiveTxt│
                                              │ marksAwarded │
                                              └──────────────┘
```

### Table Relationships

```
USERS (1) ──────── (N) ENROLLMENTS
                    │
                    └──── (N) COURSES

COURSES (1) ──────── (N) EXAMS
                    │
                    └──── (N) ENROLLMENTS

EXAMS (1) ──────── (N) QUESTIONS
                  │
                  └──── (N) EXAM_SUBMISSIONS

EXAM_SUBMISSIONS (1) ──────── (N) STUDENT_ANSWERS

QUESTIONS (1) ──────── (N) STUDENT_ANSWERS

USERS (1) ──────── (N) EXAM_SUBMISSIONS

EXAM_SUBMISSIONS (1) ──────── (0..1) CERTIFICATES
```

---

## Security Architecture

### Authentication Flow

```
┌─────────┐     ┌─────────┐     ┌─────────┐
│ Client  │────>│ Server  │────>│Database │
└─────────┘     └─────────┘     └─────────┘
     │               │               │
     │  Login Request│               │
     │──────────────>│               │
     │               │ Verify Creds  │
     │               │──────────────>│
     │               │               │
     │               │ Generate JWT  │
     │               │<──────────────│
     │               │               │
     │  JWT Token    │               │
     │<──────────────│               │
     │               │               │
     │  Auth Request │               │
     │──────────────>│               │
     │               │ Validate JWT  │
     │               │──────────┐    │
     │               │          │    │
     │  Response     │          │    │
     │<──────────────│<─────────┘    │
     │               │               │
```

### JWT Token Structure

```
Header:
{
  "alg": "HS256",
  "typ": "JWT"
}

Payload:
{
  "sub": "user@example.com",
  "iat": 1711272000,
  "exp": 1711358400
}

Signature:
HMACSHA256(
  base64(header) + "." + base64(payload),
  secret_key
)
```

### Role-Based Access Control

```
PUBLIC:
  - /api/v1/auth/**
  - /api/v1/courses (GET)

STUDENT:
  - /api/v1/enrollments/**
  - /api/v1/submissions/**
  - /api/v1/certificates/**
  - /api/v1/exams/**
  - /api/v1/questions/**

ADMIN:
  - /api/v1/admin/**
  - /api/v1/courses (POST, PUT, DELETE)
  - /api/v1/exams (POST, DELETE, PATCH)
  - /api/v1/questions (POST, DELETE)
  - /api/v1/enrollments (PATCH, DELETE)
```

---

## Component Architecture

### Frontend Structure

```
src/
├── api/
│   └── axios.js              # HTTP client configuration
├── components/
│   ├── layout/
│   │   ├── Sidebar.jsx       # Admin sidebar navigation
│   │   └── ThemeToggle.jsx   # Dark mode toggle
│   └── student/
│       └── CourseCard.jsx    # Course card component
├── context/
│   └── AuthContext.jsx       # Authentication state
├── pages/
│   ├── auth/
│   │   ├── Login.jsx         # Login page
│   │   ├── Register.jsx      # Registration page
│   │   ├── ForgotPassword.jsx
│   │   └── ResetPassword.jsx
│   ├── student/
│   │   ├── Dashboard.jsx     # Student dashboard
│   │   ├── CourseExams.jsx   # Course exam list
│   │   └── TakeExam.jsx      # Exam taking interface
│   └── admin/
│       ├── AdminDashboard.jsx
│       ├── CourseManagement.jsx
│       ├── PendingEnrollments.jsx
│       ├── StudentDirectory.jsx
│       ├── SubjectiveGrading.jsx
│       ├── TransactionHistory.jsx
│       ├── LockedStudents.jsx
│       ├── ArchivedItems.jsx
│       └── QRCodeSettings.jsx
└── App.jsx                   # Main application router
```

### Backend Structure

```
examserver/
├── src/main/java/com/examhub/examserver/
│   ├── config/
│   │   ├── SecurityConfig.java
│   │   └── JwtFilter.java
│   ├── controller/
│   │   ├── AuthController.java
│   │   ├── CourseController.java
│   │   ├── ExamController.java
│   │   ├── QuestionController.java
│   │   ├── EnrollmentController.java
│   │   ├── SubmissionController.java
│   │   ├── CertificateController.java
│   │   ├── AdminController.java
│   │   └── GlobalExceptionHandler.java
│   ├── domain/
│   │   ├── entity/
│   │   │   ├── User.java
│   │   │   ├── Course.java
│   │   │   ├── Exam.java
│   │   │   ├── Question.java
│   │   │   ├── Enrollment.java
│   │   │   ├── ExamSubmission.java
│   │   │   └── StudentAnswer.java
│   │   ├── dto/
│   │   │   ├── auth/
│   │   │   ├── admin/
│   │   │   ├── student/
│   │   │   └── response/
│   │   ├── enums/
│   │   │   ├── Role.java
│   │   │   ├── EnrollmentStatus.java
│   │   │   ├── SubmissionStatus.java
│   │   │   └── ExamType.java
│   │   └── mapper/
│   │       ├── CourseMapper.java
│   │       ├── ExamMapper.java
│   │       ├── QuestionMapper.java
│   │       ├── EnrollmentMapper.java
│   │       └── SubmissionMapper.java
│   ├── repository/
│   │   ├── UserRepo.java
│   │   ├── CourseRepo.java
│   │   ├── ExamRepo.java
│   │   ├── QuestionRepo.java
│   │   ├── EnrollmentRepo.java
│   │   ├── ExamSubmissionRepo.java
│   │   └── StudentAnswerRepo.java
│   ├── service/
│   │   ├── AuthService.java
│   │   ├── CourseService.java
│   │   ├── ExamService.java
│   │   ├── QuestionService.java
│   │   ├── EnrollmentService.java
│   │   ├── SubmissionService.java
│   │   └── CertificateService.java
│   └── security/
│       ├── JwtService.java
│       └── CustomUserDetailsService.java
└── src/main/resources/
    └── application.properties
```

---

## Data Flow Diagrams

### Student Exam Taking Flow

```
┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐
│ Student │     │Frontend │     │ Backend │     │Database │
└─────────┘     └─────────┘     └─────────┘     └─────────┘
     │               │               │               │
     │  Click        │               │               │
     │  "Start Exam" │               │               │
     │──────────────>│               │               │
     │               │ POST /start   │               │
     │               │──────────────>│               │
     │               │               │ Check enroll  │
     │               │               │──────────────>│
     │               │               │               │
     │               │               │ Create subm   │
     │               │               │──────────────>│
     │               │               │               │
     │               │  Success      │               │
     │               │<──────────────│               │
     │               │               │               │
     │  Exam UI      │               │               │
     │<──────────────│               │               │
     │               │               │               │
     │  Answer Q1    │               │               │
     │  Save & Next  │               │               │
     │──────────────>│               │               │
     │               │ POST /save    │               │
     │               │──────────────>│               │
     │               │               │ Save answer   │
     │               │               │──────────────>│
     │               │               │               │
     │               │  Saved        │               │
     │               │<──────────────│               │
     │               │               │               │
     │  ... repeat for all questions  │               │
     │               │               │               │
     │  Submit Exam  │               │               │
     │──────────────>│               │               │
     │               │ POST /submit  │               │
     │               │──────────────>│               │
     │               │               │ Grade answers │
     │               │               │──────────────>│
     │               │               │               │
     │               │               │ Update status │
     │               │               │──────────────>│
     │               │               │               │
     │               │  Result       │               │
     │               │<──────────────│               │
     │               │               │               │
     │  Show Result  │               │               │
     │<──────────────│               │               │
```

---

## Deployment Architecture

### Production Deployment

```
┌─────────────────────────────────────────────────────────────┐
│                        INTERNET                              │
└──────────────────────────┬──────────────────────────────────┘
                           │
           ┌───────────────┴───────────────┐
           │                               │
    ┌──────┴──────┐                 ┌──────┴──────┐
    │   Vercel    │                 │   Railway   │
    │ (Frontend)  │                 │  (Backend)  │
    │             │                 │             │
    │ React App   │                 │ Spring Boot │
    │ + Vite      │                 │ + Maven     │
    │ + Tailwind  │                 │ + JWT       │
    └──────┬──────┘                 └──────┬──────┘
           │                               │
           │          ┌────────────────────┘
           │          │
           └──────────┼──────────────────────────┐
                      │                          │
                      ▼                          ▼
               ┌───────────┐              ┌───────────┐
               │   CORS    │              │   JWT     │
               │ Config    │              │ Security  │
               └───────────┘              └───────────┘
                                           │
                                           │
                                           ▼
                                    ┌───────────────┐
                                    │   Supabase    │
                                    │ (PostgreSQL)  │
                                    └───────────────┘
```

---

## Performance Considerations

### Database Optimization

1. **Indexes:** Primary keys auto-indexed, foreign keys indexed
2. **JOIN FETCH:** Used to prevent N+1 queries
3. **Pagination:** Implemented for large data sets
4. **Connection Pooling:** HikariCP with optimized settings

### Frontend Optimization

1. **Code Splitting:** React Router lazy loading
2. **Image Optimization:** Vite image optimization
3. **Bundle Size:** ~362KB (gzipped: ~108KB)
4. **CSS Purging:** Tailwind CSS purges unused styles

---

## Scalability Considerations

### Horizontal Scaling

1. **Stateless Backend:** JWT-based auth allows horizontal scaling
2. **Database Connection Pooling:** Can handle multiple concurrent connections
3. **CDN:** Vercel provides global CDN for frontend

### Vertical Scaling

1. **Memory:** Spring Boot uses ~200-500MB
2. **CPU:** Single-threaded request handling
3. **Database:** Supabase handles connection pooling

---

## Monitoring and Logging

### Current Status

- **Logging:** Console logging only
- **Monitoring:** No monitoring configured
- **Alerting:** No alerting configured

### Recommendations for Production

1. **Structured Logging:** Use SLF4J with JSON format
2. **APM:** Integrate with New Relic or Datadog
3. **Health Checks:** Add `/actuator/health` endpoint
4. **Metrics:** Add Prometheus metrics endpoint
5. **Alerting:** Configure alerts for errors and performance

---

## Future Improvements

### Short Term

1. Add comprehensive unit tests
2. Add integration tests
3. Add API documentation (Swagger)
4. Add health check endpoint

### Long Term

1. Add WebSocket support for real-time updates
2. Add file upload for course materials
3. Add video conferencing integration
4. Add analytics dashboard
5. Add mobile app (React Native)

---

## Conclusion

The Online Exam System is a well-architected full-stack application that follows modern best practices. It's suitable for:
- **Educational institutions** — Conduct online exams
- **Corporate training** — Employee assessment
- **Certification bodies** — Issue certificates
- **Learning platforms** — Course-based learning
