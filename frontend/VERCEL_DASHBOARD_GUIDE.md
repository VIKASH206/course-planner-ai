# 🚀 VERCEL DASHBOARD CONFIGURATION GUIDE

## ✅ STEP 1: Import Project

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **"Import Git Repository"**
3. Select: `VIKASH206/course-planner-ai`
4. Click **"Import"**

---

## ⚙️ STEP 2: Configure Project Settings

### **CRITICAL SETTINGS** ⚠️

Copy these settings EXACTLY:

```
┌─────────────────────────────────────────────────┐
│  PROJECT SETTINGS                               │
├─────────────────────────────────────────────────┤
│                                                 │
│  Framework Preset:    [Other]                   │
│                       ↑ Select "Other"          │
│                                                 │
│  Root Directory:      [                    ]    │
│                       ↑ LEAVE EMPTY!            │
│                                                 │
│  Build Command:       npm ci && npm run build   │
│                       ↑ Override default        │
│                                                 │
│  Output Directory:    dist/course-planner-frontend
│                       ↑ NO /browser suffix!     │
│                                                 │
│  Install Command:     npm ci                    │
│                       ↑ Override default        │
│                                                 │
└─────────────────────────────────────────────────┘
```

### **EXACT VALUES:**

| Field | Value | Notes |
|-------|-------|-------|
| **Framework Preset** | `Other` | Do NOT select Angular |
| **Root Directory** | `[EMPTY]` | **LEAVE BLANK** - Most common mistake! |
| **Build Command** | `npm ci && npm run build` | Installs deps + builds |
| **Output Directory** | `dist/course-planner-frontend` | NO `/browser` |
| **Install Command** | `npm ci` | Use clean install |

---

## 🎯 STEP 3: Environment Variables (Optional)

If you need backend API URL:

```
Name:  API_URL
Value: https://your-backend-url.com
```

Click **"Add"** for each variable.

---

## 🚀 STEP 4: Deploy

1. Click **"Deploy"** button
2. Wait 2-3 minutes for build
3. Watch the build logs

### **Expected Build Output:**

```
Running "npm ci"
...
Running "npm run build"
✔ Browser application bundle generation complete.
✔ Copying assets complete.
✔ Index html generation complete.

Build at: [timestamp] - Time: ~70s

Deployment completed!
```

---

## ✅ STEP 5: Verify Deployment

### **1. Check Deployment URL**
You'll get a URL like: `https://course-planner-ai-xyz.vercel.app`

### **2. Test All Browsers:**

| Browser | Test |
|---------|------|
| ✅ Chrome Desktop | Visit URL |
| ✅ Edge Desktop | Visit URL |
| ✅ Firefox Desktop | Visit URL |
| ✅ Safari Desktop | Visit URL |
| ✅ Chrome Mobile | Visit URL |
| ✅ Safari iOS | Visit URL |

### **3. Test SPA Routing:**
- Navigate to `/dashboard`
- Refresh page (F5)
- Should NOT show 404 ✅

### **4. Check Console:**
- Open DevTools (F12)
- Check for errors
- Should be clean ✅

---

## 🔧 TROUBLESHOOTING

### **Problem: Build fails with "Cannot find module"**

**Solution:** Check Root Directory is EMPTY
```
Root Directory: [                    ]
                ↑ Must be blank!
```

---

### **Problem: Blank screen on deployment**

**Causes & Solutions:**

1. **Wrong Output Directory**
   ```
   ❌ dist/course-planner-frontend/browser
   ✅ dist/course-planner-frontend
   ```

2. **Wrong Root Directory**
   ```
   ❌ frontend
   ✅ [EMPTY]
   ```

3. **Check Build Logs:**
   - Click on deployment
   - View "Build Logs"
   - Look for errors

---

### **Problem: 404 on page refresh**

**Solution:** Already fixed in `vercel.json`!

But if you see this, verify:
1. `vercel.json` is in `frontend/` folder ✅
2. Routes configuration is present ✅

---

### **Problem: Edge/Mobile still not working**

**Check:**
1. Clear browser cache
2. Hard refresh (Ctrl+Shift+R)
3. Check console for errors
4. Verify `.browserslistrc` was deployed

---

## 📱 MOBILE TESTING COMMANDS

### **Test on physical device:**

1. Get deployment URL from Vercel
2. Open on mobile browser
3. Test navigation
4. Test page refresh

### **Test with DevTools:**

Chrome/Edge:
1. Press F12
2. Click device toolbar (Ctrl+Shift+M)
3. Select device (iPhone, Galaxy, etc.)
4. Test app

---

## 🎉 SUCCESS INDICATORS

### ✅ **Build Successful**
```
✔ Browser application bundle generation complete.
Build at: [timestamp]
Deployment completed!
```

### ✅ **App Loads**
- Homepage visible
- No blank screen
- Styles render correctly

### ✅ **All Browsers Work**
- Chrome ✅
- Edge ✅
- Firefox ✅
- Safari ✅
- Mobile ✅

### ✅ **Routing Works**
- Navigation works
- Page refresh works
- No 404 errors

---

## 📊 BUILD SETTINGS RECAP

```yaml
# vercel.json (auto-detected)
version: 2
buildCommand: "npm ci && npm run build"
outputDirectory: "dist/course-planner-frontend"
framework: null

# Vercel Dashboard
root_directory: ""              # EMPTY!
framework_preset: "Other"
build_command: "npm ci && npm run build"
output_directory: "dist/course-planner-frontend"
install_command: "npm ci"
```

---

## 🔗 NEXT STEPS AFTER DEPLOYMENT

1. **Add Custom Domain** (optional)
   - Go to Project Settings
   - Click "Domains"
   - Add your domain

2. **Setup Environment Variables** (if needed)
   - Project Settings → Environment Variables
   - Add backend URL, API keys, etc.

3. **Enable Analytics** (optional)
   - Project Settings → Analytics
   - Enable Web Analytics

4. **Setup GitHub Integration**
   - Auto-deploy on push ✅ (already active)
   - Preview deployments for PRs

---

## 📝 DEPLOYMENT CHECKLIST

Before you click Deploy:

- [ ] Framework Preset = "Other"
- [ ] Root Directory = EMPTY
- [ ] Build Command = `npm ci && npm run build`
- [ ] Output Directory = `dist/course-planner-frontend`
- [ ] No `/browser` in output path
- [ ] Environment variables added (if needed)

After deployment:

- [ ] Build completed successfully
- [ ] Homepage loads
- [ ] Tested on Chrome
- [ ] Tested on Edge
- [ ] Tested on mobile
- [ ] Navigation works
- [ ] Page refresh works
- [ ] No console errors

---

## 🆘 SUPPORT

If issues persist:

1. **Check Build Logs** in Vercel dashboard
2. **Compare with working config:**
   - Framework: Other
   - Root: EMPTY
   - Output: `dist/course-planner-frontend`

3. **Verify files:**
   ```powershell
   git log --oneline -1
   # Should show recent commit
   ```

4. **Rebuild:**
   - Go to Deployments
   - Click ⋯ menu
   - Select "Redeploy"

---

**Your code is pushed to GitHub ✅**
**Configuration is correct ✅**
**Ready to deploy on Vercel ✅**

🚀 **GO TO VERCEL NOW AND CLICK DEPLOY!**
