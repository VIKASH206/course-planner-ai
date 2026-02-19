import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth-backend.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Use the backend auth service's signal-based authentication
  if (authService.isLoggedIn()) {
    return true;
  } else {
    // Redirect to signup for new users
    router.navigate(['/auth/signup']);
    return false;
  }
};

export const guestGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Use the backend auth service's signal-based authentication
  if (!authService.isLoggedIn()) {
    return true;
  } else {
    // Redirect to dashboard if already authenticated
    const currentUser = authService.currentUser();
    if (currentUser?.role === 'ADMIN') {
      router.navigate(['/admin/dashboard'], { replaceUrl: true });
    } else {
      router.navigate(['/dashboard'], { replaceUrl: true });
    }
    return false;
  }
};