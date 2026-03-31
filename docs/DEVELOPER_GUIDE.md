# Developer Guide

How to develop, test, and deploy the Online Exam System.

---

## Prerequisites

### Required Software

| Software | Version | Purpose |
|----------|---------|---------|
| Java | 21+ | Backend runtime |
| Node.js | 20+ | Frontend runtime |
| Git | Any | Version control |
| PostgreSQL | 14+ | Database (or Supabase) |

### Optional Software

| Software | Purpose |
|----------|---------|
| Docker | Containerization |
| Docker Compose | Local development |
| Railway CLI | Deployment |
| Vercel CLI | Deployment |

---

## Project Structure

```
online-exam-system/
├── examserver/              # Backend (Spring Boot)
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/       # Java source code
│   │   │   └── resources/  # Configuration files
│   │   └── test/           # Test files
│   ├── pom.xml             # Maven configuration
│   ├── mvnw                # Maven wrapper (Unix)
│   ├── mvnw.cmd            # Maven wrapper (Windows)
│   ├── .env                # Environment variables
│   └── Dockerfile          # Docker configuration
├── online-exam-frontend/    # Frontend (React)
│   ├── src/                # React source code
│   ├── public/             # Static files
│   ├── package.json        # NPM configuration
│   ├── vite.config.js      # Vite configuration
│   ├── tailwind.config.js  # Tailwind configuration
│   └── Dockerfile          # Docker configuration
├── docs/                    # Documentation
├── docker-compose.yml       # Docker Compose
└── README.md                # Main README
```

---

## Setting Up Development Environment

### Step 1: Clone Repository

```bash
git clone https://github.com/Srijitadasgupta2003/online-exam-system.git
cd online-exam-system
```

### Step 2: Set Up Database

**Option A: Supabase (Recommended)**
1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Copy connection details

**Option B: Local PostgreSQL**
```bash
# Install PostgreSQL
sudo apt-get install postgresql

# Create database
psql -U postgres
CREATE DATABASE examhub;
CREATE USER examhub WITH PASSWORD 'password';
GRANT ALL PRIVILEGES ON DATABASE examhub TO examhub;
```

### Step 3: Configure Backend

```bash
cd examserver
cp .env.example .env
```

Edit `.env` file:
```env
DB_URL=jdbc:postgresql://localhost:5432/examhub
DB_USERNAME=examhub
DB_PASSWORD=password
JWT_SECRET=your-secret-key-here
ADMIN_REGISTRATION_CODE=your-admin-code
CORS_ALLOWED_ORIGINS=http://localhost:5173
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
```

### Step 4: Configure Frontend

```bash
cd online-exam-frontend
```

Create `.env` file:
```env
VITE_API_BASE_URL=http://localhost:8080/api/v1
```

### Step 5: Install Dependencies

**Backend:**
```bash
cd examserver
./mvnw install
```

**Frontend:**
```bash
cd online-exam-frontend
npm install
```

---

## Running Locally

### Option 1: Separate Terminals

**Terminal 1 — Backend:**
```bash
cd examserver
./mvnw spring-boot:run
```

**Terminal 2 — Frontend:**
```bash
cd online-exam-frontend
npm run dev
```

### Option 2: Docker Compose

```bash
docker-compose up --build
```

### Access Application

- Frontend: http://localhost:5173 (or http://localhost:3000 with Docker)
- Backend: http://localhost:8080
- API Docs: http://localhost:8080/api/v1

---

## Code Structure

### Backend Architecture

```
Controller → Service → Repository → Database
    ↓           ↓           ↓
  Request   Business    Database
  Handling    Logic      Access
```

### Frontend Architecture

```
Component → Context → API → Backend
    ↓          ↓      ↓
   UI       State   HTTP
  Render   Mgmt   Request
```

### Adding New Features

**Backend:**
1. Create Entity in `domain/entity/`
2. Create DTO in `domain/dto/`
3. Create Repository in `repository/`
4. Create Service in `service/`
5. Create Controller in `controller/`
6. Update `SecurityConfig` if needed

**Frontend:**
1. Create Component in `components/`
2. Create Page in `pages/`
3. Add Route in `App.jsx`
4. Add API call in `api/axios.js`
5. Update Context if needed

---

## Testing

### Running Tests

**Backend:**
```bash
cd examserver
./mvnw test
```

**Frontend:**
```bash
cd online-exam-frontend
npm test
```

### Writing Tests

**Backend Test Example:**
```java
@SpringBootTest
class CourseServiceTest {
    @Autowired
    private CourseService courseService;

    @Test
    void createCourse() {
        // Test implementation
    }
}
```

**Frontend Test Example:**
```javascript
import { render, screen } from '@testing-library/react';
import Login from './Login';

test('renders login form', () => {
    render(<Login />);
    expect(screen.getByText('Sign In')).toBeInTheDocument();
});
```

---

## Building for Production

### Backend

```bash
cd examserver
./mvnw clean package -DskipTests
```

Output: `target/examserver-0.0.1-SNAPSHOT.jar`

### Frontend

```bash
cd online-exam-frontend
npm run build
```

Output: `dist/` folder

---

## Deployment

### Backend (Railway)

1. Push code to GitHub
2. Go to [railway.app](https://railway.app)
3. Create new project → Deploy from GitHub
4. Select your repository
5. Set Root Directory: `examserver`
6. Add environment variables:
   ```
   DB_URL=your-supabase-url
   DB_USERNAME=your-username
   DB_PASSWORD=your-password
   JWT_SECRET=your-secret
   ADMIN_REGISTRATION_CODE=your-code
   CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app
   MAIL_USERNAME=your-email
   MAIL_PASSWORD=your-password
   ```
7. Deploy

### Frontend (Vercel)

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Set Root Directory: `online-exam-frontend`
5. Add environment variable:
   ```
   VITE_API_BASE_URL=https://your-backend.railway.app/api/v1
   ```
6. Deploy

---

## Troubleshooting

### Common Issues

**Backend won't start:**
- Check `.env` file exists and has correct values
- Verify database connection
- Check port 8080 is available
- Check Java version (21+)

**Frontend won't start:**
- Check `node_modules` exists
- Verify Node.js version (20+)
- Check port 5173 is available
- Verify `.env` file

**Login fails:**
- Check JWT_SECRET is set
- Verify user exists in database
- Check CORS configuration
- Verify API URL is correct

**Database errors:**
- Check database connection
- Verify tables exist
- Check user permissions
- Review Hibernate logs

---

## Performance Optimization

### Backend

1. **Use JOIN FETCH** — Prevents N+1 queries
2. **Pagination** — Use Pageable for large lists
3. **Connection Pooling** — HikariCP configured
4. **Lazy Loading** — Use FetchType.LAZY

### Frontend

1. **Code Splitting** — React.lazy() for routes
2. **Image Optimization** — Compress images
3. **Bundle Size** — Remove unused dependencies
4. **CSS Purging** — Tailwind removes unused CSS

---

## Security Best Practices

1. **JWT Tokens** — Short expiration (24 hours)
2. **Password Hashing** — BCrypt
3. **Input Validation** — @Valid annotation
4. **CORS** — Configure allowed origins
5. **HTTPS** — Use in production
6. **SQL Injection** — Use parameterized queries
7. **XSS** — Sanitize user input

---

## Contributing

### Workflow

1. Fork repository
2. Create feature branch: `git checkout -b feature/your-feature`
3. Make changes
4. Test changes
5. Commit: `git commit -m 'Add your feature'`
6. Push: `git push origin feature/your-feature`
7. Create pull request

### Code Style

- Use consistent naming conventions
- Add comments for complex logic
- Follow existing code patterns
- Write tests for new features
- Update documentation

### Commit Messages

Format: `type: description`

Types:
- `feat` — New feature
- `fix` — Bug fix
- `docs` — Documentation
- `style` — Code style
- `refactor` — Code refactoring
- `test` — Adding tests
- `chore` — Maintenance

Example: `feat: add certificate download feature`

---

## Future Enhancements

### Short Term (1-3 months)

1. Add comprehensive unit tests
2. Add integration tests
3. Add Swagger API documentation
4. Add health check endpoint
5. Add structured logging

### Medium Term (3-6 months)

1. Add WebSocket support for real-time updates
2. Add file upload for course materials
3. Add video conferencing integration
4. Add analytics dashboard

### Long Term (6+ months)

1. Add mobile app (React Native)
2. Add AI-powered exam generation
3. Add plagiarism detection
4. Add adaptive testing

---

## Support

### Getting Help

1. Check this guide
2. Check `docs/` folder
3. Check GitHub issues
4. Contact system administrator

### Reporting Issues

Include:
- Steps to reproduce
- Expected behavior
- Actual behavior
- Error messages
- Environment info

---

## Resources

### Documentation

- [Spring Boot Docs](https://spring.io/projects/spring-boot)
- [React Docs](https://react.dev)
- [Tailwind CSS Docs](https://tailwindcss.com)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)

### Tools

- [Maven](https://maven.apache.org)
- [npm](https://www.npmjs.com)
- [Git](https://git-scm.com)
- [Docker](https://www.docker.com)

### Platforms

- [Railway](https://railway.app)
- [Vercel](https://vercel.com)
- [Supabase](https://supabase.com)
- [GitHub](https://github.com)

---

## Conclusion

This developer guide covers everything needed to develop, test, and deploy the Online Exam System. For questions not covered here, refer to the official documentation or contact the development team.
