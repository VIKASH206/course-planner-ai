import { Injectable, inject } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

/**
 * Session-based Authentication Interceptor
 * No JWT tokens - relies on HTTP session cookies sent automatically by browser
 */
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private router = inject(Router);

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // For session-based auth, browser automatically sends session cookies
    // We need to ensure credentials are included in requests
    const authReq = req.clone({
      withCredentials: true  // This ensures cookies are sent with requests
    });

    // Handle the request and catch auth errors
    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        // Silently handle AI recommendation API errors (fallback is handled in components)
        if (error.url?.includes('/api/ai/recommendations/') && error.status === 500) {
          // Don't log error - components have smart fallback logic
          return throwError(() => error);
        }
        
        // If unauthorized, redirect to login (optional)
        if (error.status === 401) {
          console.warn('Unauthorized access - session may have expired');
          // Optionally redirect to login
          // this.router.navigate(['/login']);
        }
        return throwError(() => error);
      })
    );
  }
}