# Frontend Improvements for Backend Wake-Up Handling

## 🎯 Overview

This guide provides Angular code improvements to handle Render backend wake-up delays gracefully.

---

## 1️⃣ API Service with Retry Logic

Update your API service to handle 503 errors and retry automatically.

### File: `src/app/core/services/api.service.ts`

```typescript
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Observable, throwError, timer } from 'rxjs';
import { catchError, retryWhen, mergeMap, finalize } from 'rxjs/operators';
import { environment } from '@environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiUrl; // e.g., 'https://your-backend.onrender.com/api'
  
  // Signal to track server wake-up state
  isServerWakingUp = signal(false);

  constructor(private http: HttpClient) {}

  /**
   * GET request with automatic retry for 503 errors
   */
  get<T>(endpoint: string, options?: any): Observable<T> {
    return this.http.get<T>(`${this.apiUrl}${endpoint}`, options).pipe(
      retryWhen(errors =>
        errors.pipe(
          mergeMap((error: HttpErrorResponse, index) => {
            // Retry up to 3 times for 503 errors (server waking up)
            if (error.status === 503 && index < 3) {
              this.isServerWakingUp.set(true);
              console.warn(`Backend waking up... Retry ${index + 1}/3 in 10 seconds`);
              
              // Wait 10 seconds before retrying
              return timer(10000);
            }
            
            // Don't retry for other errors
            return throwError(() => error);
          }),
          finalize(() => {
            this.isServerWakingUp.set(false);
          })
        )
      ),
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * POST request with automatic retry
   */
  post<T>(endpoint: string, body: any, options?: any): Observable<T> {
    return this.http.post<T>(`${this.apiUrl}${endpoint}`, body, options).pipe(
      retryWhen(errors =>
        errors.pipe(
          mergeMap((error: HttpErrorResponse, index) => {
            if (error.status === 503 && index < 2) { // Only retry POST once
              this.isServerWakingUp.set(true);
              return timer(10000);
            }
            return throwError(() => error);
          }),
          finalize(() => this.isServerWakingUp.set(false))
        )
      ),
      catchError(this.handleError.bind(this))
    );
  }

  private handleError(error: HttpErrorResponse) {
    if (error.status === 503) {
      console.warn('Backend is waking up from sleep (Render free tier)...');
    } else if (error.status === 0) {
      console.error('Network error - backend might be down');
    } else {
      console.error(`Backend error: ${error.status} - ${error.message}`);
    }
    
    return throwError(() => error);
  }
}
```

---

## 2️⃣ HTTP Interceptor for Global Handling

Add an interceptor to show user-friendly messages when backend is waking up.

### File: `src/app/core/interceptors/wake-up.interceptor.ts`

```typescript
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable()
export class WakeUpInterceptor implements HttpInterceptor {
  private hasShownWakeUpMessage = false;

  constructor(private snackBar: MatSnackBar) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 503 && !this.hasShownWakeUpMessage) {
          this.hasShownWakeUpMessage = true;
          
          this.snackBar.open(
            '⏰ Server is waking up from sleep, please wait...',
            'OK',
            { 
              duration: 10000,
              horizontalPosition: 'center',
              verticalPosition: 'top',
              panelClass: 'warning-snackbar'
            }
          );
          
          // Reset flag after 30 seconds
          setTimeout(() => {
            this.hasShownWakeUpMessage = false;
          }, 30000);
        }
        
        return throwError(() => error);
      })
    );
  }
}
```

### Register Interceptor in `app.config.ts`:

```typescript
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { WakeUpInterceptor } from '@core/interceptors/wake-up.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    // ... other providers
    provideHttpClient(
      withInterceptors([WakeUpInterceptor])
    )
  ]
};
```

---

## 3️⃣ Loading Component with Wake-Up Message

Create a reusable loading component that shows wake-up status.

### File: `src/app/shared/components/server-loading/server-loading.component.ts`

```typescript
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ApiService } from '@core/services/api.service';

@Component({
  selector: 'app-server-loading',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule],
  template: `
    <div class="loading-container">
      <mat-spinner diameter="50"></mat-spinner>
      
      @if (apiService.isServerWakingUp()) {
        <div class="wake-up-message">
          <h3>⏰ Server is Waking Up</h3>
          <p>This may take up to 60 seconds on the first request.</p>
          <small>Render free tier puts apps to sleep after 15 minutes of inactivity.</small>
        </div>
      } @else {
        <p class="normal-loading">Loading...</p>
      }
    </div>
  `,
  styles: [`
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem 1.5rem;
      min-height: 200px;
    }

    .wake-up-message {
      margin-top: 1.5rem;
      text-align: center;
      animation: fadeIn 0.5s ease-in;
    }

    .wake-up-message h3 {
      color: #ff9800;
      font-size: 1.25rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
    }

    .wake-up-message p {
      color: #666;
      margin: 0.5rem 0;
      font-size: 0.95rem;
    }

    .wake-up-message small {
      color: #999;
      font-size: 0.8rem;
      display: block;
      margin-top: 0.75rem;
    }

    .normal-loading {
      margin-top: 1rem;
      color: #666;
      font-size: 1rem;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* Dark mode support */
    @media (prefers-color-scheme: dark) {
      .wake-up-message h3 {
        color: #ffb74d;
      }
      .wake-up-message p {
        color: #b0b0b0;
      }
      .wake-up-message small {
        color: #808080;
      }
      .normal-loading {
        color: #b0b0b0;
      }
    }
  `]
})
export class ServerLoadingComponent {
  apiService = inject(ApiService);
}
```

### Usage in Your Components:

```typescript
// dashboard.component.ts
import { ServerLoadingComponent } from '@shared/components/server-loading/server-loading.component';

@Component({
  // ...
  imports: [ServerLoadingComponent],
  template: `
    @if (isLoading) {
      <app-server-loading />
    } @else {
      <!-- Your content -->
    }
  `
})
export class DashboardComponent {}
```

---

## 4️⃣ Environment Configuration

Update your environment files to point to Render backend.

### File: `src/environments/environment.prod.ts`

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://your-backend.onrender.com/api',
  
  // Timeouts for Render free tier
  apiTimeout: 60000, // 60 seconds for cold starts
  retryAttempts: 3,
  retryDelay: 10000 // 10 seconds between retries
};
```

### File: `src/environments/environment.ts`

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api',
  
  // Local timeouts
  apiTimeout: 30000,
  retryAttempts: 1,
  retryDelay: 5000
};
```

---

## 5️⃣ Global CSS for Snackbar Styling

Add custom styling for wake-up notification snackbar.

### File: `src/styles.scss`

```scss
// Warning snackbar for server wake-up
.warning-snackbar {
  background-color: #ff9800 !important;
  color: white !important;
  font-weight: 500;
  
  .mat-simple-snackbar-action {
    color: white !important;
  }
}

// Optional: Info snackbar
.info-snackbar {
  background-color: #2196f3 !important;
  color: white !important;
}

// Optional: Success snackbar
.success-snackbar {
  background-color: #4caf50 !important;
  color: white !important;
}
```

---

## 6️⃣ Dashboard Component Example

Example of using the loading component in your dashboard.

### File: `src/app/features/dashboard/dashboard.component.ts`

```typescript
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '@core/services/api.service';
import { ServerLoadingComponent } from '@shared/components/server-loading/server-loading.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ServerLoadingComponent],
  template: `
    <div class="dashboard-container">
      <h1>Student Dashboard</h1>
      
      @if (isLoading()) {
        <app-server-loading />
      } @else if (error()) {
        <div class="error-message">
          <p>Failed to load dashboard data.</p>
          <button (click)="loadDashboard()">Retry</button>
        </div>
      } @else {
        <!-- Your dashboard content -->
        <div class="dashboard-content">
          <!-- ... -->
        </div>
      }
    </div>
  `
})
export class DashboardComponent implements OnInit {
  private apiService = inject(ApiService);
  
  isLoading = signal(true);
  error = signal<string | null>(null);
  dashboardData = signal<any>(null);

  ngOnInit() {
    this.loadDashboard();
  }

  loadDashboard() {
    this.isLoading.set(true);
    this.error.set(null);
    
    this.apiService.get('/dashboard').subscribe({
      next: (data) => {
        this.dashboardData.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set(err.message);
        this.isLoading.set(false);
      }
    });
  }
}
```

---

## 7️⃣ Testing the Implementation

### Local Testing:

1. Start your Angular dev server:
   ```bash
   ng serve
   ```

2. Stop your backend temporarily to simulate 503 errors

3. Try loading a page - you should see the wake-up message

### Production Testing:

1. Deploy both frontend and backend

2. Wait 15 minutes for Render backend to sleep

3. Load your app - first request will show wake-up message

4. Subsequent requests should be fast

---

## 📊 Expected User Experience

### Before Implementation:
- ❌ Long wait (30-60s) with no feedback
- ❌ Page appears frozen
- ❌ User confusion

### After Implementation:
- ✅ Clear "Server is waking up" message
- ✅ Progress spinner shows activity
- ✅ Automatic retry (no user action needed)
- ✅ Professional user experience

---

## 🎯 Key Benefits

1. **User-Friendly:** Clear communication about delays
2. **Automatic:** No manual refresh needed
3. **Resilient:** Handles cold starts gracefully
4. **Professional:** Looks polished, not broken

---

## 📝 Optional: Add to Package.json

For production builds, you might want to add environment-specific builds:

```json
{
  "scripts": {
    "build:prod": "ng build --configuration production",
    "build:render": "ng build --configuration production --base-href /",
    "start:prod": "ng serve --configuration production"
  }
}
```

---

## ✅ Checklist

- [ ] Update `ApiService` with retry logic
- [ ] Add `WakeUpInterceptor`
- [ ] Create `ServerLoadingComponent`
- [ ] Update environment files
- [ ] Add custom snackbar CSS
- [ ] Test locally
- [ ] Deploy and verify on Render
- [ ] Configure UptimeRobot monitoring

---

## 🔗 Related Files

- [RENDER_HEALTH_CHECK_SETUP.md](./RENDER_HEALTH_CHECK_SETUP.md) - Backend health check setup
- Backend: `HealthCheckController.java` - Health check endpoints
- Backend: `SecurityConfig.java` - Security configuration
