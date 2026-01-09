import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth-backend.service';

@Component({
  selector: 'app-logout',
  standalone: true,
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-100">
      <div class="text-center">
        <h2 class="text-2xl font-bold mb-4">Logging out...</h2>
        <p>You are being logged out and redirected to signup.</p>
      </div>
    </div>
  `
})
export class LogoutComponent implements OnInit {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    // Clear ALL auth-related data from localStorage
    localStorage.removeItem('course-planner-token');
    localStorage.removeItem('course-planner-user');
    
    // Also clear any other potential auth keys
    Object.keys(localStorage).forEach(key => {
      if (key.includes('course-planner') || key.includes('auth') || key.includes('user')) {
        localStorage.removeItem(key);
      }
    });
    
    // Clear auth state in service
    this.authService.logout();
    
    // Show logout message and redirect
    console.log('User logged out successfully');
    setTimeout(() => {
      // Force navigation to login page
      window.location.href = '/auth/login';
    }, 500);
  }
}