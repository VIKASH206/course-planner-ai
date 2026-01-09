import { inject } from '@angular/core';
import { Router, CanActivateFn, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth-backend.service';

/**
 * Role-based guard that ensures users can only access routes matching their role.
 * Expects route data to contain 'expectedRole' property ('ADMIN' or 'STUDENT')
 * Reads actual role from localStorage for immediate verification
 * Redirects to appropriate dashboard if role mismatch detected
 */
export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Check authentication first
  if (!authService.isLoggedIn()) {
    console.warn('RoleGuard: User not logged in, redirecting to login');
    router.navigate(['/auth/login']);
    return false;
  }

  // Get expected role from route data
  const expectedRole = route.data['expectedRole'] as string;
  
  // Get actual role from localStorage (immediate check, no delay)
  const storedRole = localStorage.getItem('userRole');
  const currentUser = authService.currentUser();
  const actualRole = storedRole || currentUser?.role;

  console.log('RoleGuard Check:', {
    expectedRole,
    actualRole,
    url: state.url
  });

  // If no role found, redirect to login
  if (!actualRole) {
    console.warn('RoleGuard: No role found, redirecting to login');
    router.navigate(['/auth/login']);
    return false;
  }

  // Check if roles match
  if (actualRole !== expectedRole) {
    console.warn(`RoleGuard: Role mismatch! Expected: ${expectedRole}, Actual: ${actualRole}`);
    
    // Redirect to correct dashboard based on actual role
    if (actualRole === 'ADMIN') {
      console.log('RoleGuard: Redirecting to admin dashboard');
      router.navigate(['/admin/dashboard'], { replaceUrl: true });
    } else {
      console.log('RoleGuard: Redirecting to student dashboard');
      router.navigate(['/dashboard'], { replaceUrl: true });
    }
    
    return false;
  }

  console.log('RoleGuard: Access granted');
  return true;
};
