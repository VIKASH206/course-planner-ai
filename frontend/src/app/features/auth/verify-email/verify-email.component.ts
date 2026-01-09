import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500 p-4">
      <div class="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
        <!-- Success State -->
        <div *ngIf="verificationStatus === 'success'" class="text-center">
          <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
            <svg class="h-10 w-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          
          <h2 class="text-2xl font-bold text-gray-800 mb-2">Email Verified! ✅</h2>
          <p class="text-gray-600 mb-6">
            Your email has been successfully verified. You can now login to your account.
          </p>
          
          <button 
            (click)="goToLogin()" 
            class="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:shadow-lg transition-all duration-200">
            Go to Login
          </button>
        </div>
        
        <!-- Error State -->
        <div *ngIf="verificationStatus === 'error'" class="text-center">
          <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
            <svg class="h-10 w-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </div>
          
          <h2 class="text-2xl font-bold text-gray-800 mb-2">Verification Failed ❌</h2>
          <p class="text-gray-600 mb-6">{{ errorMessage }}</p>
          
          <div class="space-y-3">
            <button 
              (click)="resendVerification()" 
              [disabled]="isResending"
              class="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
              {{ isResending ? 'Sending...' : 'Resend Verification Email' }}
            </button>
            
            <button 
              (click)="goToLogin()" 
              class="w-full bg-gray-200 text-gray-800 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition-all duration-200">
              Go to Login
            </button>
          </div>
        </div>
        
        <!-- Loading State -->
        <div *ngIf="verificationStatus === 'loading'" class="text-center">
          <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-4">
            <svg class="animate-spin h-10 w-10 text-blue-600" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          
          <h2 class="text-2xl font-bold text-gray-800 mb-2">Verifying Email...</h2>
          <p class="text-gray-600">Please wait while we verify your email address.</p>
        </div>
        
        <!-- Resend Success Message -->
        <div *ngIf="resendSuccess" class="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p class="text-green-800 text-sm text-center">
            ✅ Verification email sent! Please check your inbox.
          </p>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class VerifyEmailComponent implements OnInit {
  verificationStatus: 'loading' | 'success' | 'error' = 'loading';
  errorMessage = '';
  isResending = false;
  resendSuccess = false;
  email = '';
  token = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Get email and token from query params
    this.route.queryParams.subscribe(params => {
      this.email = params['email'] || '';
      this.token = params['token'] || '';
      
      if (this.email && this.token) {
        this.verifyEmail();
      } else {
        this.verificationStatus = 'error';
        this.errorMessage = 'Invalid verification link. Please check your email for the correct link.';
      }
    });
  }

  verifyEmail() {
    this.verificationStatus = 'loading';
    
    this.authService.verifyEmail(this.email, this.token).subscribe({
      next: (response) => {
        this.verificationStatus = 'success';
      },
      error: (error) => {
        this.verificationStatus = 'error';
        this.errorMessage = error.message || 'Verification failed. The link may have expired.';
      }
    });
  }

  resendVerification() {
    if (!this.email) {
      return;
    }
    
    this.isResending = true;
    this.resendSuccess = false;
    
    this.authService.resendVerificationEmail(this.email).subscribe({
      next: (response) => {
        this.isResending = false;
        this.resendSuccess = true;
      },
      error: (error) => {
        this.isResending = false;
        this.errorMessage = error.message || 'Failed to resend verification email.';
      }
    });
  }

  goToLogin() {
    this.router.navigate(['/auth/login']);
  }
}
