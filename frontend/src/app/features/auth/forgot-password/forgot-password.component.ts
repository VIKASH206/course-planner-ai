import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { ThemeToggleComponent } from '../../../shared/components/theme-toggle/theme-toggle.component';
import { NotificationService } from '../../../core/services/notification.service';
import { BackendApiService } from '../../../core/services/backend-api.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    ThemeToggleComponent
  ],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss'
})
export class ForgotPasswordComponent implements OnInit {
  forgotPasswordForm!: FormGroup;
  isLoading = signal(false);
  emailSent = signal(false);

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private notificationService: NotificationService,
    private backendApi: BackendApiService
  ) {}

  ngOnInit() {
    this.createForm();
  }

  private createForm() {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit() {
    if (this.forgotPasswordForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.isLoading.set(true);

    const email = this.forgotPasswordForm.value.email;

    this.backendApi.forgotPassword({ email }).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        if (response.success && response.data.emailExists) {
          // Email exists, show success message
          this.emailSent.set(true);
          this.notificationService.showSuccess('Password reset link has been sent to your email!', 3000);
        } else {
          // This case shouldn't happen if backend is working correctly
          this.notificationService.showError('Failed to send reset link. Please try again.', 3000);
        }
      },
      error: (error) => {
        this.isLoading.set(false);
        // Check if it's a 404 error (email not found)
        if (error.status === 404 || error.error?.message?.includes('not found')) {
          this.notificationService.showError('Email not found. Please signup first!', 4000);
        } else {
          this.notificationService.showError(error.error?.message || 'Failed to send reset link. Please try again.', 3000);
        }
      }
    });
  }

  private markFormGroupTouched() {
    Object.keys(this.forgotPasswordForm.controls).forEach(key => {
      const control = this.forgotPasswordForm.get(key);
      control?.markAsTouched();
    });
  }

  // Getters for form validation
  get email() { return this.forgotPasswordForm.get('email'); }

  getErrorMessage(field: string): string {
    const control = this.forgotPasswordForm.get(field);
    if (control?.hasError('required')) {
      return 'Email is required';
    }
    if (control?.hasError('email')) {
      return 'Please enter a valid email address';
    }
    return '';
  }
}