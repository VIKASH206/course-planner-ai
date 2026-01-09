#!/bin/bash

# 🚀 Quick Deployment Script for Course Planner AI

echo "🚀 Course Planner AI - Quick Deployment"
echo "========================================"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check environment
if [ -z "$MONGODB_URI" ]; then
    echo -e "${RED}❌ MONGODB_URI not set${NC}"
    exit 1
fi

if [ -z "$GEMINI_API_KEY" ]; then
    echo -e "${RED}❌ GEMINI_API_KEY not set${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Environment variables verified${NC}"

# Build Backend
echo -e "\n${YELLOW}📦 Building Backend...${NC}"
cd backend
./mvnw clean package -DskipTests
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Backend built successfully${NC}"
else
    echo -e "${RED}❌ Backend build failed${NC}"
    exit 1
fi

# Build Frontend
echo -e "\n${YELLOW}📦 Building Frontend...${NC}"
cd ../frontend
npm install
npm run build --configuration=production
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Frontend built successfully${NC}"
else
    echo -e "${RED}❌ Frontend build failed${NC}"
    exit 1
fi

cd ..
echo -e "\n${GREEN}🎉 Build completed successfully!${NC}"
echo -e "\n📂 Deployment artifacts:"
echo -e "  Backend: backend/target/*.jar"
echo -e "  Frontend: frontend/dist/course-planner-frontend/browser/"
