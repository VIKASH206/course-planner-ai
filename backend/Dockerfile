# Multi-stage build for Spring Boot backend
FROM maven:3.9-eclipse-temurin-17 AS build

# Set working directory
WORKDIR /app

# Copy pom.xml and download dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code
COPY src ./src

# Build the application
RUN mvn clean package -DskipTests

# Runtime stage
FROM eclipse-temurin:17-jre-alpine

# Set working directory
WORKDIR /app

# Copy jar from build stage
COPY --from=build /app/target/*.jar app.jar

# Expose port
EXPOSE 8080

# Set environment variables with defaults
ENV MONGODB_URI=${MONGODB_URI}
ENV GROQ_API_KEY=${GROQ_API_KEY}
ENV GROQ_API_URL=${GROQ_API_URL}
ENV GROQ_API_MODEL=${GROQ_API_MODEL}
ENV SENDGRID_API_KEY=${SENDGRID_API_KEY}
ENV FIREBASE_WEB_API_KEY=${FIREBASE_WEB_API_KEY}
ENV FIREBASE_PROJECT_ID=${FIREBASE_PROJECT_ID}
ENV FIREBASE_SERVICE_ACCOUNT_JSON=${FIREBASE_SERVICE_ACCOUNT_JSON}
ENV FRONTEND_URL=${FRONTEND_URL}
ENV JWT_SECRET=${JWT_SECRET}
ENV PORT=8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/api/courses || exit 1

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
