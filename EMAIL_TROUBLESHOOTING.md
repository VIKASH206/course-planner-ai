# Email Troubleshooting Guide

## Current Status
- ✅ Email service is ENABLED
- ✅ Gmail SMTP configured
- ✅ Frontend URL set correctly
- ⚠️ Emails not reaching inbox

## Why Emails Might Not Be Working

### 1. Gmail App Password Issue
Current password: `vwxxmbemjworusez`

**Fix:**
1. Go to: https://myaccount.google.com/apppasswords
2. Login with: deepakkr1462006@gmail.com
3. Generate NEW App Password for "Mail"
4. Copy the 16-character password
5. Update in Render Environment Variables:
   - Go to: https://dashboard.render.com
   - Select: course-planner-ai service
   - Environment → EMAIL_PASSWORD → Update with new password
   - Save and redeploy

### 2. Check Render Logs
1. Go to Render dashboard
2. Select backend service
3. Click "Logs" tab
4. Search for: "Password reset email"
5. Look for errors like:
   - "Authentication failed"
   - "SMTP timeout"
   - "Connection refused"

### 3. Test Email Sending

**Method 1: Use Postman/Thunder Client**
```
POST https://course-planner-ai.onrender.com/api/auth/forgot-password
Content-Type: application/json

{
  "email": "test@example.com"
}
```

Watch Render logs for email sending status.

**Method 2: Frontend Test**
1. Open: https://course-planner-ai-sigma.vercel.app
2. Click "Forgot Password"
3. Enter email
4. Submit
5. Check email (including SPAM folder)
6. Wait 5 minutes (free tier can be slow)

## Email Delivery Checklist

### For Password Reset Emails:
- [x] SMTP settings configured
- [x] Frontend URL set
- [x] Email service enabled
- [ ] Gmail App Password valid
- [ ] Emails reaching inbox
- [ ] Links working correctly

### For Verification Emails:
- [x] Email service enabled
- [x] Verification NOT required for login
- [ ] Emails reaching inbox

## Quick Fixes

### Fix 1: Update Gmail App Password
```properties
# In Render Environment Variables
EMAIL_PASSWORD=<new-16-char-password>
```

### Fix 2: Enable Gmail Less Secure Apps (Not Recommended)
1. Go to: https://myaccount.google.com/lesssecureapps
2. Turn ON "Allow less secure apps"
3. Try sending email again

### Fix 3: Use Different Email Provider (Alternative)

If Gmail continues to have issues, consider:
- SendGrid (free tier: 100 emails/day)
- Mailgun (free tier: 100 emails/day)
- Amazon SES (very cheap)

**SendGrid Setup:**
```properties
spring.mail.host=smtp.sendgrid.net
spring.mail.port=587
spring.mail.username=apikey
spring.mail.password=<your-sendgrid-api-key>
```

## Current Email Flow

### Password Reset:
1. User clicks "Forgot Password"
2. Enters email
3. Backend generates reset token
4. Email sent with link: `https://course-planner-ai-sigma.vercel.app/auth/reset-password?token=xxx&email=yyy`
5. User clicks link
6. Resets password

### Email Verification:
1. User signs up
2. Account created (email NOT verified)
3. Email sent with verification link
4. User can LOGIN WITHOUT verification ✅
5. Clicking link marks email as verified (optional)

## Testing Recommendations

1. **Check SPAM folder first**
2. **Wait 5 minutes** (free tier delays)
3. **Check Render logs** for errors
4. **Regenerate Gmail App Password** if needed
5. **Consider alternative email provider** for production

## Support

If emails still not working after trying all fixes:
1. Check Render logs for specific errors
2. Verify Gmail account is not blocked
3. Consider switching to SendGrid/Mailgun
4. Users can still use app (verification optional)

---

**Note:** App is fully functional without email verification. Users can:
- Signup and login immediately
- Use all features
- Email is nice-to-have, not required
