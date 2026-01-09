# 🚀 Deployment Checklist

## ✅ Completed Cleanups
- [x] Removed backup files (*.backup.ts)
- [x] Deleted documentation files (development only)
- [x] Removed .dist folder
- [x] Cleaned Apache Maven folder
- [x] Deleted Postman collection files
- [x] Removed MongoDB fix scripts
- [x] Cleaned log and temp files

## ⚠️ CRITICAL - Before Deployment

### Backend (Spring Boot)
1. **Remove Sensitive Data from application.properties:**
   ```properties
   # Replace hardcoded values with environment variables:
   spring.data.mongodb.uri=${MONGODB_URI}
   gemini.api.key=${GEMINI_API_KEY}
   spring.mail.username=${EMAIL_USERNAME}
   spring.mail.password=${EMAIL_PASSWORD}
   ```

2. **Create application-prod.properties:**
   ```properties
   server.port=${PORT:8080}
   spring.data.mongodb.uri=${MONGODB_URI}
   gemini.api.key=${GEMINI_API_KEY}
   spring.mail.username=${EMAIL_USERNAME}
   spring.mail.password=${EMAIL_PASSWORD}
   ```

3. **Build Backend:**
   ```bash
   cd backend
   ./mvnw clean package -DskipTests
   ```

### Frontend (Angular)
1. **Update environment.prod.ts:**
   - Replace `https://your-backend-url.railway.app/api` with actual backend URL
   - Remove `openAIKey` (move to backend)

2. **Build Frontend:**
   ```bash
   cd frontend
   npm run build --configuration=production
   ```

## 🌐 Deployment Options

### Option 1: Railway (Recommended)
**Backend:**
- Connect GitHub repo
- Auto-detect Java/Maven
- Set environment variables
- Deploy from `backend` folder

**Frontend:**
- Deploy to Vercel/Netlify
- Or use Railway static site

### Option 2: Render
**Backend:**
- Create Web Service
- Build: `cd backend && ./mvnw clean package -DskipTests`
- Start: `java -jar target/*.jar`

**Frontend:**
- Create Static Site
- Build: `cd frontend && npm install && npm run build`
- Publish: `frontend/dist/course-planner-frontend/browser`

### Option 3: Docker (Production)
**Backend Dockerfile:**
```dockerfile
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
CMD ["java", "-jar", "app.jar"]
```

**Frontend Dockerfile:**
```dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build --configuration=production

FROM nginx:alpine
COPY --from=build /app/dist/course-planner-frontend/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
```

## 🔐 Environment Variables Required

### Backend
- `MONGODB_URI` - MongoDB Atlas connection string
- `GEMINI_API_KEY` - Google Gemini AI API key
- `EMAIL_USERNAME` - Gmail address
- `EMAIL_PASSWORD` - Gmail app password
- `JWT_SECRET` - JWT signing secret (generate new)
- `PORT` - Server port (default 8080)

### Frontend
- `BACKEND_API_URL` - Backend API endpoint

## 📋 Post-Deployment

1. **Test All Features:**
   - [ ] User authentication (login/signup)
   - [ ] Course browsing and enrollment
   - [ ] Quiz functionality
   - [ ] PDF uploads and viewing
   - [ ] AI recommendations
   - [ ] Admin dashboard
   - [ ] Student dashboard
   - [ ] Email notifications

2. **Monitor:**
   - [ ] Backend logs for errors
   - [ ] Database connections
   - [ ] API response times
   - [ ] Frontend console errors

3. **Security:**
   - [ ] Enable HTTPS
   - [ ] Configure CORS properly
   - [ ] Rate limiting
   - [ ] SQL/NoSQL injection protection

## 🛠️ Tech Stack
- **Frontend:** Angular 18, TypeScript, Tailwind CSS
- **Backend:** Java 17, Spring Boot 3.2.12
- **Database:** MongoDB Atlas
- **APIs:** Google Gemini AI, Gmail SMTP

## 📞 Support
If you face any issues during deployment, check:
1. Environment variables are set correctly
2. Database connection is active
3. API keys are valid
4. CORS is configured for production URLs
