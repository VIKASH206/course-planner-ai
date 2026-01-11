# 🔧 Render Deployment Troubleshooting

## Current Issue: 500 Internal Server Error on /health

### Symptoms:
- ✅ UptimeRobot is monitoring: `https://course-planner-ai.onrender.com/health`
- ❌ Status: **DOWN** (0h 36m 51s)
- ❌ Response: **Whitelabel Error Page** with status=500
- ❌ Error: "There was an unexpected error (type=Internal Server Error, status=500)"

---

## 🔍 Root Cause Analysis

The Whitelabel Error Page means:
1. ✅ Render backend IS running
2. ✅ Request IS reaching the application
3. ❌ Either:
   - Old code is still deployed (without HealthCheckController)
   - New code failed to build/deploy
   - HealthCheckController not compiled into JAR

---

## 📋 Step-by-Step Fix

### Step 1: Check Render Deployment Status

1. **Go to Render Dashboard:**
   ```
   https://dashboard.render.com
   ```

2. **Find your service:**
   - Look for "course-planner-ai" or your backend service name
   - Click on it

3. **Check Latest Deployment:**
   - Look at "Events" or "Deploys" tab
   - Check if deployment is:
     - 🔵 **In Progress** → Wait for it to complete (2-5 min)
     - 🟢 **Live** → Check which commit is deployed
     - 🔴 **Failed** → Read error logs

4. **Verify Commit:**
   - Check if commit **f448cab** is deployed
   - Look for commit message: "Add health check endpoint..."

---

### Step 2: Check Render Logs

1. **Click "Logs" tab** in your Render service

2. **Look for these messages:**

   **✅ SUCCESS - You should see:**
   ```
   Started CoursePlannerApplication in X.XXX seconds
   Tomcat started on port(s): 8080 (http)
   ```

   **❌ ERROR - Check for:**
   ```
   BUILD FAILED
   Error: Cannot find HealthCheckController
   ClassNotFoundException
   404 on /health endpoint
   ```

3. **Search logs for "health":**
   - Press `Ctrl+F` and search "health"
   - Look for any errors related to HealthCheckController

---

### Step 3: Manual Redeploy (If Needed)

If Render hasn't picked up the latest code:

1. **In Render Dashboard:**
   - Go to your service
   - Click **"Manual Deploy"** button (top right)
   - Select **"Deploy latest commit"**
   - Click **"Deploy"**

2. **Wait for build to complete** (2-5 minutes)

3. **Monitor deployment logs:**
   - Watch for "BUILD SUCCEEDED"
   - Watch for "Started CoursePlannerApplication"

---

### Step 4: Verify Build Success

**After deployment completes, check:**

1. **Test health endpoint manually:**
   ```bash
   curl https://course-planner-ai.onrender.com/health
   ```
   
   **Expected:** `OK`
   
   **NOT Expected:** Whitelabel Error Page

2. **Test detailed health endpoint:**
   ```bash
   curl https://course-planner-ai.onrender.com/health/detailed
   ```
   
   **Expected:**
   ```json
   {
     "status": "UP",
     "service": "Course Planner Backend",
     "timestamp": 1736582229000,
     "message": "Service is running"
   }
   ```

3. **Test root endpoint:**
   ```bash
   curl https://course-planner-ai.onrender.com/
   ```
   
   **Expected:**
   ```json
   {
     "status": "UP",
     "message": "Course Planner API is running"
   }
   ```

---

## 🚨 Common Issues & Solutions

### Issue 1: Build Failed on Render

**Symptoms:**
- Render logs show "BUILD FAILED"
- Maven compilation errors

**Solution:**
```bash
# Rebuild locally first to ensure code compiles
cd backend
./mvnw clean package -DskipTests

# If successful, push again
git add .
git commit -m "Fix build issues"
git push origin main
```

---

### Issue 2: Old Code Still Deployed

**Symptoms:**
- Render shows "Live" but /health returns 500
- Logs don't mention HealthCheckController

**Solution:**
1. Go to Render Dashboard
2. Click **"Manual Deploy"**
3. Select **"Clear build cache & deploy"**
4. This forces a fresh build from scratch

---

### Issue 3: JAR Not Including HealthCheckController

**Symptoms:**
- Build succeeds but /health returns 404 or 500
- ClassNotFoundException in logs

**Solution:**
```bash
# Rebuild JAR with fresh compile
cd backend
./mvnw clean compile package -DskipTests

# Check if HealthCheckController is in JAR
jar tf target/course-planner-backend-1.0.0.jar | grep HealthCheckController
# Expected: com/courseplanner/controller/HealthCheckController.class

# If found, push again
git add target/
git commit -m "Update compiled JAR"
git push origin main
```

---

### Issue 4: Render Not Connected to GitHub

**Symptoms:**
- You pushed code but Render doesn't deploy automatically
- No new deployments showing in Render

**Solution:**

1. **Check GitHub Integration:**
   - Go to Render service settings
   - Check "Git" section
   - Verify GitHub repository is connected
   - Branch should be **main**

2. **Enable Auto-Deploy:**
   - Settings → "Build & Deploy"
   - Enable **"Auto-Deploy: Yes"**
   - Branch: **main**

3. **Reconnect GitHub (if needed):**
   - Settings → "Git"
   - Click "Disconnect"
   - Click "Connect Repository"
   - Select your repository
   - Select **main** branch

---

## 🎯 Quick Verification Checklist

After fixing, verify everything works:

- [ ] Render deployment status: **Live** ✅
- [ ] Render logs show: "Started CoursePlannerApplication" ✅
- [ ] `/health` returns: `OK` (not Whitelabel Error) ✅
- [ ] `/health/detailed` returns: JSON with status "UP" ✅
- [ ] `/` returns: JSON with "Course Planner API is running" ✅
- [ ] UptimeRobot status: **UP** (green) ✅
- [ ] Response time: < 1 second ✅

---

## 🔄 Force Fresh Deployment

If nothing else works, do a complete fresh deployment:

```bash
# 1. Clean everything locally
cd backend
./mvnw clean

# 2. Fresh compile and package
./mvnw compile package -DskipTests

# 3. Commit and push
cd ..
git add .
git commit -m "Force fresh deployment - health check endpoint"
git push origin main

# 4. In Render Dashboard:
#    - Click "Manual Deploy"
#    - Select "Clear build cache & deploy"
#    - Wait for deployment to complete (5-10 min)

# 5. Test endpoint
curl https://course-planner-ai.onrender.com/health
```

---

## 📞 What to Check Right Now

### Immediate Actions:

1. **Open Render Dashboard** ⚡
   - https://dashboard.render.com
   - Check deployment status
   - Is latest deployment complete?

2. **Read Render Logs** 📋
   - Click "Logs" tab
   - Check last 100 lines
   - Look for errors or "Started CoursePlannerApplication"

3. **Verify Commit** 🔍
   - Check which commit Render deployed
   - Should be: **f448cab** (Add health check endpoint...)
   - If not, trigger manual deploy

4. **Test Endpoint** 🧪
   ```bash
   curl https://course-planner-ai.onrender.com/health
   ```
   - Should return: `OK`
   - Currently returns: Whitelabel Error Page ❌

---

## 💡 Expected Timeline

- **If auto-deploy is working:**
  - GitHub push → 30 seconds → Render starts build
  - Build takes: 2-5 minutes
  - Total: ~3-6 minutes from push to live

- **If manual deploy needed:**
  - Manual deploy → Immediate build start
  - Build takes: 2-5 minutes
  - Total: ~2-5 minutes to live

---

## ✅ Success Indicators

**You'll know it's fixed when:**

1. **Render Dashboard shows:**
   - Status: **Live** (green dot)
   - Latest deploy: Commit **f448cab**
   - No errors in logs

2. **Testing shows:**
   ```bash
   $ curl https://course-planner-ai.onrender.com/health
   OK
   ```

3. **UptimeRobot shows:**
   - Status: **UP** (green)
   - Response time: < 1000ms
   - No more 500 errors

---

## 🎯 Next Steps After Fix

Once /health returns "OK":

1. ✅ UptimeRobot will automatically detect it's UP
2. ✅ Backend will stay awake (pinged every 5 min)
3. ✅ Mobile loading will be fast (< 2 seconds)
4. ✅ No more 503 DOWN errors

**Your backend will be live 24/7!** 🚀

---

**Last Updated:** January 11, 2026  
**Current Issue:** Whitelabel Error Page (500) on /health  
**Next Action:** Check Render deployment status and logs
