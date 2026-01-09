# 🎓 Course Planner AI

A comprehensive AI-powered course management platform with intelligent recommendations, interactive quizzes, and real-time analytics.

## ✨ Features

### Student Features
- 📚 Browse and enroll in courses
- 🎯 Interactive quizzes with instant feedback
- 📄 PDF course materials with inline viewer
- 🤖 AI-powered course recommendations
- 📊 Personal dashboard with progress tracking
- 💬 AI chat assistant
- 🏆 Gamification with XP and badges
- 📱 Fully responsive (Desktop, Tablet, Mobile)

### Admin Features
- 👥 User management
- 📚 Course content management
- 📝 Quiz creation with explanations
- 📄 PDF upload for course materials
- 📊 Analytics and reporting
- 🤖 AI system monitoring
- 📱 Responsive admin dashboard

## 🛠️ Tech Stack

### Frontend
- **Framework:** Angular 18
- **Language:** TypeScript
- **Styling:** Tailwind CSS, Angular Material
- **State Management:** Angular Signals
- **HTTP Client:** RxJS

### Backend
- **Framework:** Spring Boot 3.2.12
- **Language:** Java 17
- **Database:** MongoDB Atlas
- **Security:** Spring Security, JWT
- **APIs:** Google Gemini AI, Gmail SMTP

## 🚀 Quick Start (Development)

### Prerequisites
- Node.js 20+
- Java 17+
- Maven 3.9+
- MongoDB Atlas account

### Backend Setup
```bash
cd backend
./mvnw clean install
./mvnw spring-boot:run
```

### Frontend Setup
```bash
cd frontend
npm install
ng serve
```

Visit: `http://localhost:4200`

## 🌐 Deployment

See [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) for detailed deployment instructions.

### Quick Deploy (Production)

#### Windows
```powershell
.\deploy.ps1
```

#### Linux/Mac
```bash
chmod +x deploy.sh
./deploy.sh
```

## 📋 Environment Variables

### Backend
```properties
MONGODB_URI=your_mongodb_connection_string
GEMINI_API_KEY=your_gemini_api_key
EMAIL_USERNAME=your_gmail_address
EMAIL_PASSWORD=your_gmail_app_password
JWT_SECRET=your_jwt_secret
PORT=8080
```

### Frontend
Update `environment.prod.ts`:
```typescript
apiUrl: 'https://your-backend-url.com/api'
```

## 🔐 Security Features
- JWT-based authentication
- Role-based access control (ADMIN, STUDENT)
- Password encryption with BCrypt
- CORS configuration
- Secure email with app passwords
- XSS protection

## 📱 Responsive Design
- ✅ Desktop (1024px+)
- ✅ Tablet (640px - 1024px)
- ✅ Mobile (320px+)
- ✅ Touch-optimized controls

## 🎯 Key Functionality

### Quiz System
- Multiple choice questions
- Instant answer validation
- Color-coded feedback (green/red)
- Detailed explanations
- Progress tracking

### PDF Management
- Admin upload with validation (10MB max)
- Inline PDF viewer (iframe)
- Download functionality
- Multiple PDFs per lesson

### AI Integration
- Course recommendations
- Content generation
- Student assistance chatbot
- Analytics insights

## 📊 Database Collections
- users
- courses
- enrolledCourses
- tasks
- aiLogs
- gamificationStats

## 🤝 API Endpoints

### Authentication
- POST `/api/auth/signup` - User registration
- POST `/api/auth/login` - User login
- POST `/api/auth/google` - Google OAuth

### Courses
- GET `/api/courses` - Browse courses
- GET `/api/courses/{id}` - Course details
- POST `/api/courses` - Create course (Admin)
- PUT `/api/courses/{id}` - Update course (Admin)

### Enrollments
- POST `/api/enrollments/enroll` - Enroll in course
- GET `/api/enrollments/user/{userId}` - User's enrolled courses

### Dashboard
- GET `/api/dashboard/stats` - Dashboard statistics

## 🐛 Troubleshooting

### Backend won't start
- Check MongoDB connection string
- Verify Java 17 is installed
- Ensure port 8080 is available

### Frontend build fails
- Clear `node_modules` and reinstall: `npm ci`
- Check Node.js version: `node --version`
- Clear Angular cache: `ng cache clean`

### API calls failing
- Check CORS configuration
- Verify backend URL in environment files
- Check browser console for errors

## 📄 License
MIT License - Feel free to use this project for learning and development.

## 👨‍💻 Developer
Course Planner AI - Built with ❤️ using Angular & Spring Boot

## 📞 Support
For issues and questions:
1. Check [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)
2. Review environment variable configuration
3. Check backend logs for errors
4. Verify database connectivity

---

**Version:** 1.0.0  
**Last Updated:** January 2026
