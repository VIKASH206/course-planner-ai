# Render Deployment - Health Check Setup

## ✅ Health Check Endpoints Created

Your Spring Boot backend now has the following **public health check endpoints** that work without authentication:

### Available Endpoints:

1. **`GET /health`** (Recommended for UptimeRobot)
   - Returns: Plain text `"OK"`
   - Status: `200 OK`
   - Fast, lightweight, no database access

2. **`GET /health/detailed`**
   - Returns: JSON with detailed status
   ```json
   {
     "status": "UP",
     "service": "Course Planner Backend",
     "timestamp": 1234567890,
     "message": "Service is running"
   }
   ```

3. **`GET /`** (Root endpoint)
   - Returns: JSON status
   - Prevents 503 errors on root URL
   ```json
   {
     "status": "UP",
     "message": "Course Planner API is running"
   }
   ```

4. **`GET /api/health`**
   - Alternative health endpoint under `/api`
   - Returns: Plain text `"OK"`

---

## 🔧 UptimeRobot Configuration

### Setup Instructions:

1. **Login to UptimeRobot** (https://uptimerobot.com)

2. **Add New Monitor:**
   - Monitor Type: `HTTP(s)`
   - Friendly Name: `Course Planner Backend`
   - URL: `https://your-app.onrender.com/health`
   - Monitoring Interval: `5 minutes` (free tier)

3. **Advanced Settings:**
   - HTTP Method: `GET`
   - Expected Status Codes: `200`
   - Timeout: `30 seconds`

4. **Alerts (Optional):**
   - Enable email/SMS notifications
   - Get notified if service is down

### Why This Works:

- **Render Free Tier** puts apps to sleep after 15 minutes of inactivity
- **UptimeRobot** pings every 5 minutes, keeping your backend awake
- **No Authentication Required** - health endpoint is completely public
- **Fast Response** - no database queries, returns immediately

---

## 🚀 Render Deployment Checklist

### Before Deploying:

1. ✅ Health check endpoint created (`HealthCheckController.java`)
2. ✅ Spring Security updated to allow public access
3. ✅ CORS configured for health checks (`origins = "*"`)
4. ✅ Multiple endpoint options available

### Deploy to Render:

```bash
# 1. Commit changes
git add .
git commit -m "Add health check endpoint for monitoring"

# 2. Push to GitHub
git push origin main

# 3. Render will auto-deploy (if connected to GitHub)
```

### After Deployment:

1. **Test Health Endpoint:**
   ```bash
   curl https://your-app.onrender.com/health
   # Expected: "OK"
   
   curl https://your-app.onrender.com/health/detailed
   # Expected: JSON with status "UP"
   ```

2. **Verify in Browser:**
   - Visit: `https://your-app.onrender.com/health`
   - Should see: `OK` (plain text)

3. **Configure UptimeRobot:**
   - Add monitor with `/health` endpoint
   - Set 5-minute interval

---

## 🛠️ Troubleshooting

### If Health Check Returns 503:

1. **Check Render Logs:**
   - Go to Render Dashboard → Your Service → Logs
   - Look for startup errors

2. **Verify Application Started:**
   - Check if Spring Boot finished initialization
   - Look for "Started CoursePlannerApplication" in logs

3. **Test Root Endpoint:**
   - Try: `https://your-app.onrender.com/`
   - Should return JSON status

### If UptimeRobot Shows "Down":

1. **Check Response Time:**
   - Render free tier can be slow during cold starts
   - First request after sleep can take 30-60 seconds
   - Increase UptimeRobot timeout to 30 seconds

2. **Verify HTTPS:**
   - UptimeRobot URL must use `https://` (not `http://`)
   - Render provides SSL by default

3. **Check Expected Status:**
   - UptimeRobot should expect `200` status code
   - Not `301`, `302`, or other redirects

---

## 📱 Frontend Handling (Optional Improvements)

### Angular API Service Improvements

Add timeout handling and retry logic for slow backend wake-up:

```typescript
// src/app/core/services/api.service.ts
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError, timer } from 'rxjs';
import { catchError, retry, retryWhen, mergeMap, finalize } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'https://your-backend.onrender.com/api';
  private isWakingUp = false;

  constructor(private http: HttpClient) {}

  get<T>(endpoint: string): Observable<T> {
    return this.http.get<T>(`${this.apiUrl}${endpoint}`, {
      // Increase timeout for cold starts
      headers: { 'X-Request-Timeout': '60000' }
    }).pipe(
      // Retry logic for 503 errors (backend waking up)
      retryWhen(errors =>
        errors.pipe(
          mergeMap((error, index) => {
            if (error.status === 503 && index < 3) {
              this.isWakingUp = true;
              // Wait 10 seconds before retrying
              return timer(10000);
            }
            return throwError(() => error);
          }),
          finalize(() => this.isWakingUp = false)
        )
      ),
      catchError(this.handleError)
    );
  }

  isServerWakingUp(): boolean {
    return this.isWakingUp;
  }

  private handleError(error: HttpErrorResponse) {
    if (error.status === 503) {
      console.warn('Backend is waking up from sleep...');
    }
    return throwError(() => error);
  }
}
```

### Loading Component with Wake-Up Message

```typescript
// src/app/shared/components/loading/loading.component.ts
import { Component, inject } from '@angular/core';
import { ApiService } from '@core/services/api.service';

@Component({
  selector: 'app-loading',
  template: `
    <div class="loading-container">
      <mat-spinner></mat-spinner>
      <p *ngIf="apiService.isServerWakingUp()" class="wake-up-message">
        ⏰ Server is waking up from sleep, please wait...
        <br>
        <small>This may take up to 60 seconds on the first request</small>
      </p>
      <p *ngIf="!apiService.isServerWakingUp()">
        Loading...
      </p>
    </div>
  `,
  styles: [`
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2rem;
    }
    .wake-up-message {
      margin-top: 1rem;
      text-align: center;
      color: #ff9800;
      font-weight: 500;
    }
    small {
      color: #666;
      font-size: 0.875rem;
    }
  `]
})
export class LoadingComponent {
  apiService = inject(ApiService);
}
```

### HTTP Interceptor for Global Wake-Up Detection

```typescript
// src/app/core/interceptors/wake-up.interceptor.ts
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, delay, retry } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable()
export class WakeUpInterceptor implements HttpInterceptor {
  constructor(private snackBar: MatSnackBar) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 503) {
          this.snackBar.open(
            'Server is waking up, retrying...',
            'OK',
            { duration: 5000, panelClass: 'warning-snackbar' }
          );
        }
        return throwError(() => error);
      })
    );
  }
}
```

---

## 📊 Monitoring Best Practices

### Recommended Setup:

1. **UptimeRobot:**
   - Monitor `/health` endpoint
   - 5-minute intervals
   - Email alerts on downtime

2. **Render Metrics:**
   - Monitor RAM usage
   - Check response times
   - Review error logs

3. **Frontend Monitoring:**
   - Add timeout handling (60 seconds for cold starts)
   - Show "Server waking up" message
   - Implement retry logic for 503 errors

### Expected Behavior:

- **Normal Response Time:** 100-500ms
- **Cold Start (First Request):** 30-60 seconds
- **With UptimeRobot Pinging:** Backend stays warm, <500ms response

---

## 🎯 Expected Results

### After Setup:

✅ Backend stays awake with 5-minute pings  
✅ UptimeRobot shows "UP" status consistently  
✅ No more 503 errors on mobile  
✅ Root URL (`/`) returns proper response  
✅ Health endpoint works without authentication  
✅ Frontend handles slow cold starts gracefully  

### Performance Improvements:

- **Before:** 30-60 second wait on first mobile request
- **After:** <500ms response (backend always warm)

---

## 🔗 Useful Links

- **UptimeRobot:** https://uptimerobot.com
- **Render Dashboard:** https://dashboard.render.com
- **Spring Boot Actuator Docs:** https://docs.spring.io/spring-boot/docs/current/reference/html/actuator.html
- **Render Health Checks:** https://render.com/docs/health-checks

---

## 📝 Notes

- Health check endpoints are **stateless** and **fast**
- No database queries = instant response
- Works even when Spring Security is enabled
- Perfect for monitoring and keeping Render free tier awake
- CORS allows requests from any origin for health checks
