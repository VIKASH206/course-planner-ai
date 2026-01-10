# SendGrid Email Setup Guide

## Why SendGrid?
- ✅ Works better on Render free tier
- ✅ Free: 100 emails/day
- ✅ No timeout issues
- ✅ Better delivery rates
- ✅ Email tracking & analytics

## Step-by-Step Setup

### 1. Create SendGrid Account
1. Go to: https://signup.sendgrid.com/
2. Sign up (free account)
3. Verify your email
4. Complete setup wizard

### 2. Generate API Key
1. Login to SendGrid dashboard
2. Go to: **Settings** → **API Keys**
3. Click **"Create API Key"**
4. Name: `Course Planner AI`
5. Permissions: **"Full Access"** or **"Mail Send"**
6. Click **"Create & View"**
7. **COPY THE API KEY** (shown only once!)
   - Format: `SG.xxxxx-xxxxx-xxxxx`

### 3. Verify Sender Identity
1. Go to: **Settings** → **Sender Authentication**
2. Click **"Verify a Single Sender"**
3. Fill form:
   - From Name: `Course Planner AI`
   - From Email: `deepakkr1462006@gmail.com` (or any email)
   - Reply To: Same as above
4. Submit
5. **Check email and click verification link**

### 4. Update Render Environment Variables

Go to Render dashboard and UPDATE these variables:

```
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=SG.your-api-key-here
EMAIL_USERNAME=apikey
EMAIL_PASSWORD=<leave as is, not used>
```

OR add new variables:

```properties
# SendGrid Configuration
spring.mail.host=smtp.sendgrid.net
spring.mail.port=587
spring.mail.username=apikey
spring.mail.password=SG.your-actual-api-key-here
```

### 5. Test Email Sending

After Render redeploys:
1. Open app: https://course-planner-ai-sigma.vercel.app
2. Try "Forgot Password"
3. Check email (should arrive in 10-30 seconds)
4. Check SendGrid dashboard for delivery stats

## Configuration Comparison

### Gmail (Current - Not Working)
```properties
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=deepakkr1462006@gmail.com
spring.mail.password=vwxxmbemjworusez
```

### SendGrid (Recommended)
```properties
spring.mail.host=smtp.sendgrid.net
spring.mail.port=587
spring.mail.username=apikey
spring.mail.password=SG.your-api-key-here
```

## Quick Setup Commands

After getting SendGrid API key, update in Render:

1. **Option 1: Update existing variables**
   - EMAIL_USERNAME → `apikey`
   - EMAIL_PASSWORD → `SG.your-sendgrid-api-key`

2. **Option 2: Add SENDGRID_API_KEY**
   - Add new variable: `SENDGRID_API_KEY`
   - Value: Your SendGrid API key

## Troubleshooting

### SendGrid API Key Not Working
- Make sure you copied the full key (starts with `SG.`)
- Key should have "Mail Send" permissions
- Verify sender email in SendGrid dashboard

### Emails Still Not Arriving
- Check SendGrid dashboard → Activity
- Look for delivery status
- Check email spam folder
- Verify sender authentication completed

### Rate Limits
- Free tier: 100 emails/day
- Track usage in SendGrid dashboard
- Upgrade if needed (paid plans available)

## Benefits of SendGrid

1. **Reliability**: 99.9% uptime
2. **Speed**: Emails delivered in seconds
3. **Analytics**: Track opens, clicks, bounces
4. **Templates**: Use email templates
5. **No Timeouts**: Works on any cloud platform
6. **Better Deliverability**: Less likely to go to spam

## Next Steps

1. ✅ Create SendGrid account
2. ✅ Generate API key
3. ✅ Verify sender email
4. ✅ Update Render environment variables
5. ✅ Test forgot password
6. ✅ Test email verification

---

**Support:**
- SendGrid Docs: https://docs.sendgrid.com/
- SendGrid Dashboard: https://app.sendgrid.com/
