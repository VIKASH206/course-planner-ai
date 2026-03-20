import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../core/services/auth-backend.service';
import { NotificationService } from '../../../core/services/notification.service';
import { BackendApiService } from '../../../core/services/backend-api.service';
import { getFirebaseApp } from '../../../core/config/firebase.config';
import { GoogleAuthProvider, getAuth, signInWithPopup } from 'firebase/auth';

interface Role {
  value: string;
  display: string;
}

interface PasswordStrength {
  score: number;
  feedback: string;
  color: string;
}

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {
  signupForm!: FormGroup;
  hidePassword = signal(true);
  hideConfirmPassword = signal(true);
  isLoading = signal(false);

  roles: Role[] = [
    { value: 'student', display: 'Student' },
    { value: 'administrator', display: 'Administrator' }
  ];

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private notificationService: NotificationService,
    private authService: AuthService,
    private backendApi: BackendApiService,
    private router: Router
  ) {}

  ngOnInit() {
    this.createForm();
  }


  private createForm() {
    this.signupForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      lastName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      username: [''], // Username will be auto-generated from email
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8), this.passwordValidator]],
      confirmPassword: ['', [Validators.required]],
      role: ['', [Validators.required]],
      institution: [''],
      acceptTerms: [false, [Validators.requiredTrue]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  // Custom password validator
  private passwordValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.value;
    if (!password) return null;

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumeric = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    const minLength = password.length >= 8;

    if (!minLength || !hasUpperCase || !hasLowerCase || !hasNumeric || !hasSpecial) {
      return {
        passwordRequirements: {
          minLength,
          hasUpperCase,
          hasLowerCase,
          hasNumeric,
          hasSpecial
        }
      };
    }

    return null;
  }

  // Custom password match validator
  private passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    
    if (password && confirmPassword && password !== confirmPassword) {
      return { passwordMismatch: true };
    }
    
    return null;
  }

  // Password strength calculator
  passwordStrength(): PasswordStrength {
    const password = this.password?.value || '';
    if (!password) return { score: 0, feedback: 'Enter a password', color: 'text-gray-500 dark:text-gray-400' };

    let score = 0;
    const feedback: string[] = [];

    // Length check
    if (password.length >= 8) score++;
    else feedback.push('8+ characters');

    // Uppercase check
    if (/[A-Z]/.test(password)) score++;
    else feedback.push('uppercase letter');

    // Lowercase check
    if (/[a-z]/.test(password)) score++;
    else feedback.push('lowercase letter');

    // Number check
    if (/[0-9]/.test(password)) score++;
    else feedback.push('number');

    // Special character check
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score++;
    else feedback.push('special character');

    const strengthLevels = [
      { feedback: 'Very Weak', color: 'text-red-600 dark:text-red-400' },
      { feedback: 'Weak', color: 'text-red-500 dark:text-red-400' },
      { feedback: 'Fair', color: 'text-yellow-500 dark:text-yellow-400' },
      { feedback: 'Good', color: 'text-blue-500 dark:text-blue-400' },
      { feedback: 'Strong', color: 'text-green-500 dark:text-green-400' },
      { feedback: 'Very Strong', color: 'text-green-600 dark:text-green-500' }
    ];

    return {
      score,
      feedback: feedback.length > 0 ? `Missing: ${feedback.join(', ')}` : strengthLevels[score].feedback,
      color: strengthLevels[score].color
    };
  }

  togglePasswordVisibility() {
    this.hidePassword.set(!this.hidePassword());
  }

  toggleConfirmPasswordVisibility() {
    this.hideConfirmPassword.set(!this.hideConfirmPassword());
  }

  toggleTerms() {
    const currentValue = this.acceptTerms?.value;
    this.acceptTerms?.setValue(!currentValue);
    this.acceptTerms?.markAsTouched();
  }

  onSubmit() {
    if (this.signupForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.isLoading.set(true);
    const formData = this.signupForm.value;
    
    // Auto-generate username from email if not provided
    if (!formData.username || formData.username.trim() === '') {
      formData.username = formData.email.split('@')[0];
    }
    
    // Use the auth service for registration
    this.authService.signup(formData).subscribe({
      next: (user: any) => {
        this.isLoading.set(false);
        
        // Show success message with email verification info
        this.notificationService.showSuccess(
          '✅ Account created! Please check your email for verification link.',
          5000
        );
        
        // Navigate to login page after successful registration
        setTimeout(() => {
          this.router.navigate(['/auth/login'], {
            queryParams: { registered: 'true', email: formData.email }
          });
        }, 2000);
      },
      error: (error: any) => {
        this.isLoading.set(false);
        this.notificationService.showError(error.message || 'Registration failed. Please try again.', 3000);
        console.error('Registration error:', error);
      }
    });
  }

  socialLogin(provider: string) {
    if (provider === 'Google') {
      this.authenticateWithGoogle();
      return;
    }

    this.snackBar.open(`${provider} login coming soon!`, 'Close', {
      duration: 2000
    });
  }



  private authenticateWithGoogle() {
    this.isLoading.set(true);
    try {
      if (!environment.firebase?.apiKey || !environment.firebase?.projectId) {
        throw new Error('Firebase is not configured. Please set frontend environment firebase keys.');
      }

      const app = getFirebaseApp(environment.firebase);
      const auth = getAuth(app);
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });

      signInWithPopup(auth, provider)
        .then(async (credential) => {
          const firebaseUser = credential.user;
          const idToken = await firebaseUser.getIdToken();

          this.authService.loginWithGoogle(firebaseUser, idToken).subscribe({
            next: (user: any) => {
              this.isLoading.set(false);

              this.snackBar.open(`Welcome, ${user.firstName}!`, 'Close', {
                duration: 3000,
                panelClass: ['success-snackbar']
              });

              if (user.role === 'ADMIN') {
                window.location.href = '/admin/dashboard';
              } else {
                this.backendApi.checkOnboardingStatus(user.id).subscribe({
                  next: (response: any) => {
                    if (response.success && response.data === false) {
                      window.location.href = '/onboarding';
                    } else {
                      window.location.href = '/dashboard';
                    }
                  },
                  error: () => {
                    window.location.href = '/dashboard';
                  }
                });
              }
            },
            error: (error: any) => {
              this.isLoading.set(false);
              console.error('❌ Google login error:', error);
              this.snackBar.open(error.message || 'Google login failed. Please try again.', 'Close', {
                duration: 4000,
                panelClass: ['error-snackbar']
              });
            }
          });
        })
        .catch((error) => {
          this.isLoading.set(false);
          console.error('❌ Firebase popup failed:', error);
          this.snackBar.open('Google sign-in failed. Please try again.', 'Close', {
            duration: 4000,
            panelClass: ['error-snackbar']
          });
        });
    } catch (error) {
      this.isLoading.set(false);
      console.error('❌ Error starting Google Sign-In:', error);
      this.snackBar.open('Failed to start Google sign-in. Please try again.', 'Close', {
        duration: 4000,
        panelClass: ['error-snackbar']
      });
    }
  }

  private markFormGroupTouched() {
    Object.keys(this.signupForm.controls).forEach(key => {
      this.signupForm.get(key)?.markAsTouched();
    });
  }

  // Getters for form validation
  get firstName() { return this.signupForm.get('firstName'); }
  get lastName() { return this.signupForm.get('lastName'); }
  get username() { return this.signupForm.get('username'); }
  get email() { return this.signupForm.get('email'); }
  get password() { return this.signupForm.get('password'); }
  get confirmPassword() { return this.signupForm.get('confirmPassword'); }
  get role() { return this.signupForm.get('role'); }
  get institution() { return this.signupForm.get('institution'); }
  get acceptTerms() { return this.signupForm.get('acceptTerms'); }

  getErrorMessage(field: string): string {
    const control = this.signupForm.get(field);
    if (control?.hasError('required')) {
      return `${this.getFieldName(field)} is required`;
    }
    if (control?.hasError('requiredTrue')) {
      return 'You must accept the terms and conditions';
    }
    if (control?.hasError('email')) {
      return 'Please enter a valid email address';
    }
    if (control?.hasError('minlength')) {
      const requiredLength = control.errors?.['minlength']?.requiredLength;
      return `${this.getFieldName(field)} must be at least ${requiredLength} characters long`;
    }
    if (control?.hasError('maxlength')) {
      const maxLength = control.errors?.['maxlength']?.requiredLength;
      return `${this.getFieldName(field)} must be no more than ${maxLength} characters long`;
    }
    if (field === 'password' && control?.hasError('passwordRequirements')) {
      return 'Password must contain uppercase, lowercase, number, and special character';
    }
    if (field === 'confirmPassword' && this.signupForm.hasError('passwordMismatch')) {
      return 'Passwords do not match';
    }
    return '';
  }

  private getFieldName(field: string): string {
    const fieldNames: { [key: string]: string } = {
      firstName: 'First name',
      lastName: 'Last name',
      username: 'Username',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm password',
      role: 'Role',
      institution: 'Institution',
      acceptTerms: 'Terms and conditions'
    };
    return fieldNames[field] || field;
  }
}