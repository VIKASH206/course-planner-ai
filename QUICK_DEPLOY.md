# ⚡ SUPER QUICK DEPLOY (5 Minutes!)

## 🎯 Step 1: Deploy Backend (3 minutes)

1. **Go to Render**: https://render.com/deploy
2. **Sign up with GitHub**
3. Click **"New +" → "Web Service"**
4. Select your repository: `course-planner-ai`
5. **Paste these settings:**
   ```
   Name: course-planner-backend
   Root Directory: backend
   Build Command: ./mvnw clean package -DskipTests
   Start Command: java -jar target/*.jar
   ```

6. **Click "Environment" and add:**
   ```
   MONGODB_URI = mongodb+srv://deepakkr1462006:vikashkr206@cluster0.e3oqnh8.mongodb.net/courseplannerDB
   GEMINI_API_KEY = AIzaSyC_dVEs1TovR-b3Dmt1hyeFjFG9s5xgCBk
   EMAIL_USERNAME = deepakkr1462006@gmail.com
   EMAIL_PASSWORD = vwxxmbemjworusez
   ```

7. **Click "Create Web Service"**
8. **COPY YOUR BACKEND URL**: `https://xxxxx.onrender.com`

---

## 🎨 Step 2: Deploy Frontend (2 minutes)

1. **Update `frontend/src/environments/environment.prod.ts`:**
   ```typescript
   apiUrl: 'https://xxxxx.onrender.com/api',  // Paste your backend URL
   ```

2. **Save and commit:**
   ```bash
   git add .
   git commit -m "production config"
   git push
   ```

3. **Go to Vercel**: https://vercel.com/new
4. **Sign up with GitHub**
5. **Import** your `course-planner-ai` repository
6. **Settings:**
   ```
   Root Directory: frontend
   Framework: Angular
   Build Command: npm run build -- --configuration production
   Output Directory: dist/course-planner-frontend/browser
   ```

7. **Click "Deploy"**
8. **DONE! Copy your URL**: `https://xxxxx.vercel.app`

---

## ✅ TEST IT!

Visit: `https://xxxxx.vercel.app`

Login with:
- Email: `admin@courseplannerdb.com`
- Password: `admin123`

---

## 🎉 THAT'S IT!

Your app is LIVE and working!

**Frontend**: `https://xxxxx.vercel.app` (Share this!)
**Backend**: `https://xxxxx.onrender.com`

---

## ⚠️ First Load Takes 60 Seconds

Render free tier sleeps after inactivity.
First request wakes it up (30-60 seconds).
After that, it's fast!

---

## 🚀 Make It Faster (Optional)

Use **UptimeRobot** to keep backend awake:
1. Go to: https://uptimerobot.com
2. Add your backend URL
3. Ping every 5 minutes
4. FREE forever!

---

**Total Time**: 5 minutes
**Total Cost**: $0.00
**Result**: Working live app! 🎉
