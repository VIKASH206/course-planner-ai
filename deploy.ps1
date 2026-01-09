# 🚀 Quick Deployment Script for Course Planner AI (Windows)

Write-Host "`n🚀 Course Planner AI - Quick Deployment" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Check environment variables
$envVarsOk = $true

if (-not $env:MONGODB_URI) {
    Write-Host "❌ MONGODB_URI not set" -ForegroundColor Red
    $envVarsOk = $false
}

if (-not $env:GEMINI_API_KEY) {
    Write-Host "❌ GEMINI_API_KEY not set" -ForegroundColor Red
    $envVarsOk = $false
}

if ($envVarsOk) {
    Write-Host "✅ Environment variables verified" -ForegroundColor Green
} else {
    Write-Host "`n⚠️  Set environment variables first:" -ForegroundColor Yellow
    Write-Host '  $env:MONGODB_URI = "your-mongodb-uri"'
    Write-Host '  $env:GEMINI_API_KEY = "your-gemini-key"'
    Write-Host '  $env:EMAIL_USERNAME = "your-email"'
    Write-Host '  $env:EMAIL_PASSWORD = "your-password"'
    exit 1
}

# Build Backend
Write-Host "`n📦 Building Backend..." -ForegroundColor Yellow
Set-Location backend
& ./mvnw.cmd clean package -DskipTests
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Backend built successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Backend build failed" -ForegroundColor Red
    exit 1
}

# Build Frontend
Write-Host "`n📦 Building Frontend..." -ForegroundColor Yellow
Set-Location ../frontend
npm install
npm run build --configuration=production
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Frontend built successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Frontend build failed" -ForegroundColor Red
    exit 1
}

Set-Location ..
Write-Host "`n🎉 Build completed successfully!" -ForegroundColor Green
Write-Host "`n📂 Deployment artifacts:" -ForegroundColor Cyan
Write-Host "  Backend: backend/target/*.jar" -ForegroundColor White
Write-Host "  Frontend: frontend/dist/course-planner-frontend/browser/" -ForegroundColor White

Write-Host "`n🌐 Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Upload backend JAR to Railway/Render" -ForegroundColor White
Write-Host "  2. Deploy frontend to Vercel/Netlify" -ForegroundColor White
Write-Host "  3. Update environment.prod.ts with backend URL" -ForegroundColor White
Write-Host "  4. Test all features after deployment" -ForegroundColor White
