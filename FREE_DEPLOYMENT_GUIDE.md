# 🚀 FREE DEPLOYMENT GUIDE - Course Planner AI

Deploy your complete project (Frontend + Backend + Database) for **FREE** and get a working link!

## 📋 What You'll Get
- ✅ **Frontend URL**: `https://your-app.vercel.app`
- ✅ **Backend URL**: `https://your-api.onrender.com`
- ✅ **Database**: MongoDB Atlas (Already configured)
- ✅ **100% FREE** - No credit card required

---

## 🗄️ STEP 1: Database (MongoDB Atlas) - Already Done! ✅

Your MongoDB is already configured in `application.properties`. No changes needed!

---

## 🔧 STEP 2: Deploy Backend (Render - FREE)

### A. Create Render Account
1. Go to: https://render.com
2. Sign up with GitHub (recommended)
3. Verify your email

### B. Deploy Backend
1. **Click "New +" → "Web Service"**
2. **Connect Repository:**
   - Connect your GitHub account
   - Select `course-planner-ai` repository
   - Click "Connect"

3. **Configure Service:**
   ```
   Name: course-planner-backend
   Region: Singapore (or closest to you)
   Branch: main
   Root Directory: backend
   Runtime: Java
   Build Command: ./mvnw clean package -DskipTests
   Start Command: java -jar target/*.jar
   Instance Type: Free
   ```

4. **Add Environment Variables** (Click "Advanced" → "Add Environment Variable"):
   ```
   MONGODB_URI = mongodb+srv://deepakkr1462006:vikashkr206@cluster0.e3oqnh8.mongodb.net/courseplannerDB?retryWrites=true&w=majority&appName=Cluster0
   
   GEMINI_API_KEY = AIzaSyC_dVEs1TovR-b3Dmt1hyeFjFG9s5xgCBk
   
   EMAIL_USERNAME = deepakkr1462006@gmail.com
   
   EMAIL_PASSWORD = vwxxmbemjworusez
   
   JWT_SECRET = MySecretKey123456789MySecretKey123456789
   
   PORT = 8080
   
   SPRING_PROFILES_ACTIVE = prod
   ```

5. **Click "Create Web Service"**
6. **Wait 5-10 minutes** for deployment
7. **Copy Backend URL**: `https://course-planner-backend-xxxx.onrender.com`

### C. Verify Backend
Visit: `https://your-backend-url.onrender.com/api/courses`
Should see: `{"success":true,"data":[...]}`

---

## 🎨 STEP 3: Deploy Frontend (Vercel - FREE)

### A. Update Frontend Config
1. **Update `frontend/src/environments/environment.prod.ts`:**
   ```typescript
   export const environment = {
     production: true,
     apiUrl: 'https://your-backend-url.onrender.com/api', // ⚠️ Replace with your Render URL
     googleClientId: '66536367598-atunenteev5ii6fb0bangm1ac2raogkj.apps.googleusercontent.com',
     enablePWA: true,
     enableAnalytics: true,
     enableDebugMode: false,
     version: '1.0.0',
     appName: 'Course Planner AI',
     openAIKey: ''
   };
   ```

2. **Commit changes:**
   ```bash
   git add .
   git commit -m "Update production API URL"
   git push
   ```

### B. Deploy to Vercel
1. **Go to**: https://vercel.com
2. **Sign up** with GitHub
3. **Click "Add New..." → "Project"**
4. **Import your repository**: `course-planner-ai`
5. **Configure Build Settings:**
   ```
   Framework Preset: Angular
   Root Directory: frontend
   Build Command: npm run build -- --configuration production
   Output Directory: dist/course-planner-frontend/browser
   Install Command: npm install
   ```

6. **Add Environment Variables** (Optional):
   ```
   NODE_ENV = production
   ```

7. **Click "Deploy"**
8. **Wait 3-5 minutes**
9. **Copy Frontend URL**: `https://course-planner-ai-xxxx.vercel.app`

### C. Configure Google OAuth (Optional)
1. Go to: https://console.cloud.google.com/apis/credentials
2. Add Vercel URL to "Authorized JavaScript origins":
   - `https://your-app.vercel.app`
3. Add to "Authorized redirect URIs":
   - `https://your-app.vercel.app/auth/callback`

---

## 🔧 STEP 4: Update Backend CORS

After frontend deployment, update backend CORS:

1. **Edit `backend/src/main/java/com/courseplanner/config/WebConfig.java`:**
   ```java
   @Override
   public void addCorsMappings(CorsRegistry registry) {
       registry.addMapping("/**")
               .allowedOrigins(
                   "http://localhost:4200",
                   "https://your-app.vercel.app"  // Add your Vercel URL
               )
               .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
               .allowedHeaders("*")
               .allowCredentials(true)
               .maxAge(3600);
   }
   ```

2. **Commit and push:**
   ```bash
   git add .
   git commit -m "Update CORS for production"
   git push
   ```

3. **Render will auto-redeploy** (takes 5 minutes)

---

## ✅ STEP 5: Test Your Deployment

### Test Checklist:
1. **Visit Frontend URL**: `https://your-app.vercel.app`
2. **Test Features:**
   - [ ] Login/Signup works
   - [ ] Dashboard loads
   - [ ] Courses display
   - [ ] Enroll in course
   - [ ] Quiz works
   - [ ] PDF viewer works
   - [ ] Admin login (if admin user exists)

3. **Check Backend Health:**
   - Visit: `https://your-backend-url.onrender.com/api/courses`
   - Should return JSON with courses

4. **Check Browser Console:**
   - Open DevTools (F12)
   - Look for errors
   - Verify API calls go to Render URL

---

## ⚠️ IMPORTANT NOTES

### Render Free Tier Limitations:
- ⏰ **Sleeps after 15 minutes of inactivity**
- 🚀 **First request takes 30-60 seconds** (cold start)
- 💾 **500 hours/month free** (enough for testing)
- 🔄 **Auto-deploys on git push**

### Vercel Free Tier:
- ✅ **Unlimited deployments**
- ✅ **Instant updates**
- ✅ **No sleep time**
- ✅ **100GB bandwidth/month**

### Keep Backend Awake (Optional):
Use a free uptime monitor:
1. **UptimeRobot**: https://uptimerobot.com
2. Add your backend URL
3. Ping every 5 minutes
4. Prevents cold starts

---

## 🐛 Troubleshooting

### Backend Issues:

**❌ Build Failed:**
```bash
# Fix: Check Render logs
# Solution: Verify Maven wrapper exists
chmod +x backend/mvnw
git add .
git commit -m "Fix Maven wrapper permissions"
git push
```

**❌ Database Connection Failed:**
```bash
# Solution: Verify MONGODB_URI is correct
# Check MongoDB Atlas → Network Access → Allow 0.0.0.0/0
```

**❌ 503 Service Unavailable:**
```bash
# Solution: Wait 60 seconds (cold start)
# Or: Set up UptimeRobot to keep it awake
```

### Frontend Issues:

**❌ API Calls Failing:**
```typescript
// Solution: Update environment.prod.ts with correct backend URL
apiUrl: 'https://your-actual-backend.onrender.com/api'
```

**❌ CORS Error:**
```bash
# Solution: Update backend WebConfig with Vercel URL
# Push changes, Render auto-redeploys
```

**❌ Build Failed:**
```bash
# Solution: Clear Vercel cache
# Go to Vercel → Settings → Clear Build Cache
# Redeploy
```

---

## 🎉 SUCCESS!

Your app is now live at:
- **Frontend**: `https://your-app.vercel.app`
- **Backend**: `https://your-backend.onrender.com`

Share the frontend link with anyone!

---

## 📱 Alternative: Deploy Everything on Railway (Single Platform)

If you prefer one platform for everything:

### Railway (FREE)
1. **Go to**: https://railway.app
2. **Sign up** with GitHub
3. **New Project** → **Deploy from GitHub**
4. **Add MongoDB** (or use existing Atlas)
5. **Add Backend Service**:
   ```
   Root: backend
   Build: ./mvnw clean package -DskipTests
   Start: java -jar target/*.jar
   Add all environment variables
   ```
6. **Add Frontend Service**:
   ```
   Root: frontend
   Build: npm install && npm run build
   Start: (Railway auto-detects)
   ```
7. **Get URLs** for both services
8. **Update environment.prod.ts** with backend URL
9. **Redeploy frontend**

Railway gives you:
- ✅ $5 free credits/month
- ✅ No sleep time
- ✅ Faster than Render
- ✅ Better for production

---

## 💡 Tips for Free Deployment

1. **Use GitHub** for auto-deployments
2. **Monitor logs** on Render/Vercel dashboards
3. **Set up alerts** for failures
4. **Keep repository updated**
5. **Use environment variables** for secrets
6. **Enable HTTPS** (automatic on Vercel/Render)
7. **Add custom domain** (optional, free on both)

---

## 📞 Need Help?

If deployment fails:
1. Check Render/Vercel deployment logs
2. Verify environment variables
3. Test backend URL independently
4. Check browser console errors
5. Ensure MongoDB Atlas allows all IPs (0.0.0.0/0)

---

**Deployment Time**: 20-30 minutes total
**Cost**: $0.00 (100% FREE)
**Result**: Live working app with shareable link! 🎉
