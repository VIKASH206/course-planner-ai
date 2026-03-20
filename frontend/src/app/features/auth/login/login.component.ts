import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/services/auth-backend.service';
import { BackendApiService } from '../../../core/services/backend-api.service';
import { environment } from '../../../../environments/environment';
import { AuthService as MainAuthService } from '../../../core/services/auth.service';
import { getFirebaseApp } from '../../../core/config/firebase.config';
import { GoogleAuthProvider, getAuth, signInWithPopup } from 'firebase/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'] // ✅ corrected (plural)
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  hidePassword = signal(true);
  isLoading = signal(false);
  showResendButton = signal(false);
  resendEmail = signal('');
  serverStatus = signal<'checking' | 'ready' | 'starting'>('checking');

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private mainAuthService: MainAuthService,
    private backendApi: BackendApiService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.createForm();

    // Pre-warm Render backend (free tier sleeps after inactivity)
    this.pingBackend();

    // Redirect if already logged in - role-based redirect with replaceUrl
    if (this.authService.isLoggedIn()) {
      const currentUser = this.authService.currentUser();
      if (currentUser?.role === 'ADMIN') {
        this.router.navigate(['/admin/dashboard'], { replaceUrl: true });
      } else {
        this.router.navigate(['/dashboard'], { replaceUrl: true });
      }
      return;
    }
    
    // Check for registration success message
    this.route.queryParams.subscribe(params => {
      if (params['registered'] === 'true') {
        this.snackBar.open(
          '✅ Registration successful! Please verify your email before logging in.',
          'Close',
          { duration: 5000, panelClass: ['success-snackbar'] }
        );
      }
    });
  }

  private createForm() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]], // Use email for login
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  private pingBackend() {
    this.serverStatus.set('checking');
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s max
    fetch(`${environment.apiUrl}/ai/health`, { signal: controller.signal })
      .then(() => { clearTimeout(timeoutId); this.serverStatus.set('ready'); })
      .catch(() => {
        clearTimeout(timeoutId);
        // Server is sleeping on Render free tier - show wake-up message, retry once
        this.serverStatus.set('starting');
        setTimeout(() => {
          const c2 = new AbortController();
          const t2 = setTimeout(() => c2.abort(), 20000);
          fetch(`${environment.apiUrl}/ai/health`, { signal: c2.signal })
            .then(() => { clearTimeout(t2); this.serverStatus.set('ready'); })
            .catch(() => { clearTimeout(t2); this.serverStatus.set('ready'); });
        }, 15000);
      });
  }

  togglePasswordVisibility() {
    this.hidePassword.set(!this.hidePassword());
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.isLoading.set(true);
    const { email, password, rememberMe } = this.loginForm.value;

    // Use backend authentication
    this.authService.login({ email, password }).subscribe({
      next: (user: any) => {
        this.isLoading.set(false);
        this.showResendButton.set(false);
        this.snackBar.open(`Welcome back, ${user.firstName}!`, 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        
        // Role-based redirect: Admins go to admin dashboard, students go to regular dashboard
        if (user.role === 'ADMIN') {
          this.router.navigate(['/admin/dashboard']);
        } else {
          // Check if user has completed onboarding
          this.backendApi.checkOnboardingStatus(user.id).subscribe({
            next: (response: any) => {
              if (response.success && response.data === false) {
                // User hasn't completed onboarding, redirect to onboarding
                this.router.navigate(['/onboarding']);
              } else {
                // User has completed onboarding, go to dashboard
                this.router.navigate(['/dashboard']);
              }
            },
            error: () => {
              // If check fails, just go to dashboard
              this.router.navigate(['/dashboard']);
            }
          });
        }
      },
      error: (error: any) => {
        this.isLoading.set(false);
        let errorMessage = error.message || 'Login failed. Please check your credentials.';
        
        // Render free-tier cold start / network timeout
        if (
          errorMessage.toLowerCase().includes('timeout') ||
          errorMessage.toLowerCase().includes('timed out') ||
          errorMessage.toLowerCase().includes('server error: 0') ||
          errorMessage.toLowerCase().includes('unknown error') ||
          errorMessage.toLowerCase().includes('http failure') ||
          errorMessage.toLowerCase().includes('503') ||
          errorMessage.toLowerCase().includes('504')
        ) {
          errorMessage = '⏳ Server is starting up (this takes ~30 sec on first use). Please wait a moment and try again.';
          this.snackBar.open(errorMessage, 'Try Again', {
            duration: 8000,
            panelClass: ['error-snackbar']
          });
        } else if (errorMessage.includes('Email not verified') || errorMessage.includes('verify')) {
          // Check if it's an email verification error
          this.showResendButton.set(true);
          this.resendEmail.set(email);
          this.snackBar.open('❌ ' + errorMessage, 'Close', {
            duration: 6000,
            panelClass: ['error-snackbar']
          });
        } else {
          this.snackBar.open(errorMessage, 'Close', {
            duration: 4000,
            panelClass: ['error-snackbar']
          });
        }
        console.error('Login error:', error);
      }
    });
  }
  
  resendVerification() {
    const email = this.resendEmail();
    if (!email) return;
    
    this.mainAuthService.resendVerificationEmail(email).subscribe({
      next: () => {
        this.snackBar.open(
          '✅ Verification email sent! Please check your inbox.',
          'Close',
          { duration: 4000, panelClass: ['success-snackbar'] }
        );
        this.showResendButton.set(false);
      },
      error: (error) => {
        this.snackBar.open(
          '❌ Failed to send verification email. Please try again.',
          'Close',
          { duration: 4000, panelClass: ['error-snackbar'] }
        );
      }
    });
  }

  private authenticateWithGoogle() {
    this.isLoading.set(true);
    console.log('🔐 Firebase Google Sign-In started');

    try {
      if (typeof window === 'undefined') {
        throw new Error('Google sign-in is only available in browser');
      }

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
              console.log('✅ Backend response received, user:', user);
              this.isLoading.set(false);

              this.snackBar.open(`Welcome, ${user.firstName}!`, 'Close', {
                duration: 3000,
                panelClass: ['success-snackbar']
              });

              if (user.role === 'ADMIN') {
                this.router.navigate(['/admin/dashboard'], { replaceUrl: true });
              } else {
                this.backendApi.checkOnboardingStatus(user.id).subscribe({
                  next: (response: any) => {
                    if (response.success && response.data === false) {
                      this.router.navigate(['/onboarding'], { replaceUrl: true });
                    } else {
                      this.router.navigate(['/dashboard'], { replaceUrl: true });
                    }
                  },
                  error: () => {
                    this.router.navigate(['/dashboard'], { replaceUrl: true });
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

  socialLogin(provider: string) {
    if (provider === 'Google') {
      this.authenticateWithGoogle();
      return;
    }

    // Mock social login for other providers
    this.snackBar.open(`${provider} login coming soon!`, 'Close', {
      duration: 2000
    });
  }

  private markFormGroupTouched() {
    Object.keys(this.loginForm.controls).forEach(key => {
      this.loginForm.get(key)?.markAsTouched();
    });
  }

  // Getters for form validation
  get email() { return this.loginForm.get('email'); }
  get password() { return this.loginForm.get('password'); }

  getErrorMessage(field: string): string {
    const control = this.loginForm.get(field);
    if (control?.hasError('required')) {
      return `${this.getFieldName(field)} is required`;
    }
    if (control?.hasError('email')) {
      return 'Please enter a valid email address';
    }
    if (control?.hasError('minlength')) {
      const requiredLength = control.errors?.['minlength']?.requiredLength;
      return `Password must be at least ${requiredLength} characters long`;
    }
    return '';
  }

  private getFieldName(field: string): string {
    const fieldNames: { [key: string]: string } = {
      email: 'Email',
      password: 'Password'
    };
    return fieldNames[field] || field;
  }
}
