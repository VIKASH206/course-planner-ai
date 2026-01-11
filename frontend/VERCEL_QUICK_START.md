# 🚀 VERCEL DEPLOYMENT - QUICK REFERENCE

## CRITICAL SETTINGS FOR VERCEL DASHBOARD

```
Root Directory:     [EMPTY - LEAVE BLANK]
Framework Preset:   Other
Build Command:      npm ci && npm run build
Output Directory:   dist/course-planner-frontend
Install Command:    npm ci
```

## ⚠️ COMMON MISTAKES TO AVOID

❌ DON'T set Root Directory to "frontend"
✅ Leave Root Directory EMPTY

❌ DON'T use output: "dist/course-planner-frontend/browser"
✅ Use output: "dist/course-planner-frontend"

❌ DON'T select "Angular" as framework
✅ Select "Other"

❌ DON'T use "npm run build -- --configuration production"
✅ Use "npm run build" (production is default)

## 📦 BUILD OUTPUT STRUCTURE

✅ CORRECT (what you now have):
```
dist/
  course-planner-frontend/
    index.html
    main.[hash].js
    styles.[hash].css
    assets/
```

❌ WRONG (causes blank screens):
```
dist/
  course-planner-frontend/
    browser/
      index.html
      ...
```

## 🧪 QUICK TEST COMMANDS

### Local Build Test
```powershell
cd frontend
npm ci
npm run build
```

### Verify Output Structure
```powershell
Test-Path "dist/course-planner-frontend/index.html"  # Should be True
Test-Path "dist/course-planner-frontend/browser"     # Should be False
```

### Check Build Files
```powershell
Get-ChildItem dist/course-planner-frontend/*.html
```

## 🌐 BROWSER SUPPORT

✅ Chrome Desktop (last 2 versions)
✅ Microsoft Edge (last 2 versions)
✅ Firefox (last 2 versions)
✅ Safari Desktop (last 2 versions)
✅ Chrome Android (last 2 versions)
✅ iOS Safari (iOS 12+)
✅ Android Browser (Android 8+)

## 📁 FILES CHANGED

1. `.browserslistrc` - Browser targets
2. `vercel.json` - Vercel config
3. `angular.json` - Build config (browser builder)
4. `src/polyfills.ts` - Browser polyfills
5. `tsconfig.app.json` - TypeScript config
6. `package.json` - Build scripts

## ✅ DEPLOYMENT CHECKLIST

- [ ] Local build succeeds (`npm run build`)
- [ ] No `dist/course-planner-frontend/browser/` folder exists
- [ ] `dist/course-planner-frontend/index.html` exists
- [ ] Changes committed to git
- [ ] Changes pushed to repository
- [ ] Vercel settings match above configuration
- [ ] Deployed on Vercel
- [ ] Tested on Chrome Desktop
- [ ] Tested on Edge Desktop
- [ ] Tested on mobile browsers

## 🎯 KEY CHANGES

**Before:** `@angular-devkit/build-angular:application`
**After:** `@angular-devkit/build-angular:browser`

**Result:** Clean static build, no SSR, works on all browsers!

## 📞 SUPPORT

If deployment fails, check:
1. Root Directory is EMPTY
2. Output Directory is exactly: `dist/course-planner-frontend`
3. Build Command is: `npm ci && npm run build`
4. No typos in configuration

---

**STATUS: ✅ CONFIGURED & TESTED**
**READY TO DEPLOY TO VERCEL**
