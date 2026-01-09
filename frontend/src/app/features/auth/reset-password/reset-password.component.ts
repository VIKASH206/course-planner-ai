import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { NotificationService } from '../../../core/services/notification.service';
import { BackendApiService } from '../../../core/services/backend-api.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss'
})
export class ResetPasswordComponent implements OnInit {
  resetPasswordForm!: FormGroup;
  isLoading = signal(false);
  resetSuccess = signal(false);
  hidePassword = signal(true);
  hideConfirmPassword = signal(true);
  token: string = '';
  tokenValid = signal(true);

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private notificationService: NotificationService,
    private backendApi: BackendApiService
  ) {}

  ngOnInit() {
    // Get token from URL query params
    this.token = this.route.snapshot.queryParamMap.get('token') || '';
    
    if (!this.token) {
      this.tokenValid.set(false);
      this.notificationService.showError('Invalid reset link. Please request a new password reset.');
      setTimeout(() => {
        this.router.navigate(['/auth/forgot-password']);
      }, 3000);
      return;
    }

    this.createForm();
  }

  private createForm() {
    this.resetPasswordForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  private passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (!password || !confirmPassword) {
      return null;
    }

    return password.value === confirmPassword.value ? null : { passwordMismatch: true };
  }

  togglePasswordVisibility() {
    this.hidePassword.set(!this.hidePassword());
  }

  toggleConfirmPasswordVisibility() {
    this.hideConfirmPassword.set(!this.hideConfirmPassword());
  }

  onSubmit() {
    if (this.resetPasswordForm.invalid) {
      this.markFormGroupTouched(this.resetPasswordForm);
      
      // Check specifically for password mismatch
      if (this.resetPasswordForm.hasError('passwordMismatch')) {
        this.notificationService.showError('Passwords do not match! Please ensure both passwords are the same.');
        return;
      }
      
      // Check for other validation errors
      const passwordControl = this.resetPasswordForm.get('password');
      if (passwordControl?.hasError('required')) {
        this.notificationService.showError('Please enter a password');
        return;
      }
      if (passwordControl?.hasError('minlength')) {
        this.notificationService.showError('Password must be at least 6 characters long');
        return;
      }
      
      return;
    }

    if (!this.token) {
      this.notificationService.showError('Invalid reset token');
      return;
    }

    const { password } = this.resetPasswordForm.value;
    this.isLoading.set(true);

    this.backendApi.resetPassword(this.token, password).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        this.resetSuccess.set(true);
        this.notificationService.showSuccess('Password reset successful! Redirecting to login...');
        
        // Redirect to login after 2 seconds
        setTimeout(() => {
          this.router.navigate(['/auth/login']);
        }, 2000);
      },
      error: (error) => {
        this.isLoading.set(false);
        const errorMessage = error?.error?.message || 'Failed to reset password. Please try again.';
        this.notificationService.showError(errorMessage);
        
        // If token expired, redirect to forgot password
        if (errorMessage.includes('expired') || errorMessage.includes('Invalid')) {
          setTimeout(() => {
            this.router.navigate(['/auth/forgot-password']);
          }, 3000);
        }
      }
    });
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  getPasswordError(): string {
    const passwordControl = this.resetPasswordForm.get('password');
    if (passwordControl?.hasError('required')) {
      return 'Password is required';
    }
    if (passwordControl?.hasError('minlength')) {
      return 'Password must be at least 6 characters';
    }
    return '';
  }

  getConfirmPasswordError(): string {
    const confirmPasswordControl = this.resetPasswordForm.get('confirmPassword');
    if (confirmPasswordControl?.hasError('required')) {
      return 'Please confirm your password';
    }
    if (this.resetPasswordForm.hasError('passwordMismatch')) {
      return 'Passwords do not match';
    }
    return '';
  }
}
