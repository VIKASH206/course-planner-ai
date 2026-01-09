import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../../../core/services/auth-backend.service';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const currentUser = authService.currentUser();
  
  console.log('Admin Guard - Current User:', currentUser);
  console.log('Admin Guard - Is Logged In:', authService.isLoggedIn());

  // Check if user is logged in
  if (!authService.isLoggedIn() || !currentUser) {
    console.warn('Admin Guard: User not logged in, redirecting to login');
    router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }

  // Get role from localStorage for immediate check
  const storedRole = localStorage.getItem('userRole');
  const userRole = storedRole || currentUser.role;

  // Check if user has admin role
  if (userRole !== 'ADMIN') {
    console.warn('Admin Guard: User does not have ADMIN role, role is:', userRole);
    // Redirect students to student dashboard
    router.navigate(['/dashboard'], { replaceUrl: true });
    return false;
  }

  console.log('Admin Guard: Access granted');
  return true;
};
