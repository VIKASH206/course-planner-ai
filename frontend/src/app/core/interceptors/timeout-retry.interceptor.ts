import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, retry, timeout, throwError, timer } from 'rxjs';

/**
 * HTTP Timeout and Retry Interceptor
 * 
 * Features:
 * - 30 second timeout for all requests (good for mobile networks)
 * - Retry failed requests up to 2 times
 * - Skip retry for authentication errors (401, 403)
 * - Better error handling for mobile/slow networks
 */
export const timeoutRetryInterceptor: HttpInterceptorFn = (req, next) => {
  // Timeout configuration
  const TIMEOUT_MS = 30000; // 30 seconds
  const MAX_RETRIES = 2;
  
  return next(req).pipe(
    // Set timeout
    timeout(TIMEOUT_MS),
    
    // Retry logic - skip for auth errors
    retry({
      count: MAX_RETRIES,
      delay: (error: HttpErrorResponse, retryCount: number) => {
        // Don't retry authentication errors
        if (error.status === 401 || error.status === 403) {
          return throwError(() => error);
        }
        
        // Exponential backoff: 1s, 2s, 4s
        const delayMs = Math.pow(2, retryCount) * 1000;
        console.log(`Retrying request (attempt ${retryCount + 1}/${MAX_RETRIES}) after ${delayMs}ms...`);
        
        // Return Observable instead of Promise
        return timer(delayMs);
      }
    }),
    
    // Error handling
    catchError((error: any) => {
      let errorMessage = 'An error occurred';
      
      if (error instanceof HttpErrorResponse) {
        // HTTP error response
        if (error.error instanceof ErrorEvent) {
          // Client-side error
          errorMessage = `Error: ${error.error.message}`;
        } else {
          // Server-side error
          errorMessage = `Server error: ${error.status} - ${error.message}`;
        }
      } else if (error.name === 'TimeoutError') {
        // Timeout error
        errorMessage = 'Request timeout. Please check your internet connection and try again.';
        console.error('Request timed out after 30 seconds');
      }
      
      console.error('HTTP Error:', errorMessage);
      return throwError(() => new Error(errorMessage));
    })
  );
};
