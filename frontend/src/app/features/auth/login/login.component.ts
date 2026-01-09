import { Component, OnInit, AfterViewInit, signal, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
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
import { ThemeToggleComponent } from '../../../shared/components/theme-toggle/theme-toggle.component';
import { environment } from '../../../../environments/environment';
import { AuthService as MainAuthService } from '../../../core/services/auth.service';

// Declare Google Identity Services
declare const google: any;

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
    MatSnackBarModule,
    ThemeToggleComponent
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'] // ✅ corrected (plural)
})
export class LoginComponent implements OnInit, AfterViewInit {
  loginForm!: FormGroup;
  hidePassword = signal(true);
  isLoading = signal(false);
  googleButtonRendered = false;
  showResendButton = signal(false);
  resendEmail = signal('');

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private mainAuthService: MainAuthService,
    private backendApi: BackendApiService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    this.createForm();

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

  ngAfterViewInit() {
    // Initialize Google Sign-In after view is fully loaded
    if (isPlatformBrowser(this.platformId)) {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        this.initializeGoogleSignIn();
      }, 500);
    }
  }

  private createForm() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]], // Use email for login
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
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
        const errorMessage = error.message || 'Login failed. Please check your credentials.';
        
        // Check if it's an email verification error
        if (errorMessage.includes('Email not verified') || errorMessage.includes('verify')) {
          this.showResendButton.set(true);
          this.resendEmail.set(email);
          this.snackBar.open(
            '❌ ' + errorMessage,
            'Close',
            { duration: 6000, panelClass: ['error-snackbar'] }
          );
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

  initializeGoogleSignIn() {
    // Wait for Google Identity Services script to load
    const checkGoogleLoaded = setInterval(() => {
      if (typeof google !== 'undefined' && google.accounts) {
        clearInterval(checkGoogleLoaded);
        this.setupGoogleSignIn();
      }
    }, 100);

    // Timeout after 10 seconds
    setTimeout(() => clearInterval(checkGoogleLoaded), 10000);
  }

  setupGoogleSignIn() {
    try {
      google.accounts.id.initialize({
        client_id: environment.googleClientId,
        callback: this.handleGoogleSignIn.bind(this),
        auto_select: false,
        cancel_on_tap_outside: true,
        ux_mode: 'popup'  // Force popup mode for account picker
      });

      // Render the button if container exists
      const buttonContainer = document.getElementById('googleSignInButton');
      if (buttonContainer && !this.googleButtonRendered) {
        // Clear any existing content
        buttonContainer.innerHTML = '';
        
        google.accounts.id.renderButton(
          buttonContainer,
          {
            theme: 'outline',
            size: 'large',
            width: buttonContainer.offsetWidth || 350,
            text: 'continue_with',
            shape: 'rectangular',
            logo_alignment: 'left'
          }
        );
        this.googleButtonRendered = true;
        console.log('✅ Google Sign-In button rendered successfully');
      }
      
      // Also enable One Tap prompt
      google.accounts.id.prompt((notification: any) => {
        console.log('One Tap notification:', notification);
      });
    } catch (error) {
      console.error('Error setting up Google Sign-In:', error);
    }
  }

  handleGoogleSignIn(response: any) {
    this.isLoading.set(true);
    console.log('🔐 Google Sign-In response received');

    try {
      // Decode JWT to get user info
      const payload = this.parseJwt(response.credential);
      console.log('📧 Google user data:', payload);

      // Call backend with Google data
      this.authService.loginWithGoogle(payload).subscribe({
        next: (user: any) => {
          console.log('✅ Backend response received, user:', user);
          this.isLoading.set(false);
          
          this.snackBar.open(`Welcome, ${user.firstName}!`, 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });

          console.log('🚀 Navigating to dashboard, user role:', user.role);

          // Role-based redirect with replaceUrl to prevent back button issues
          if (user.role === 'ADMIN') {
            console.log('👑 Admin user, redirecting to admin dashboard');
            this.router.navigate(['/admin/dashboard'], { replaceUrl: true });
          } else {
            console.log('👤 Student user, checking onboarding status');
            // Check onboarding status for new users
            this.backendApi.checkOnboardingStatus(user.id).subscribe({
              next: (response: any) => {
                if (response.success && response.data === false) {
                  console.log('📝 User needs onboarding, redirecting to onboarding');
                  this.router.navigate(['/onboarding'], { replaceUrl: true });
                } else {
                  console.log('🏠 User completed onboarding, redirecting to dashboard');
                  this.router.navigate(['/dashboard'], { replaceUrl: true });
                }
              },
              error: () => {
                console.log('⚠️ Onboarding check failed, defaulting to dashboard');
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
    } catch (error) {
      this.isLoading.set(false);
      console.error('❌ Error processing Google Sign-In:', error);
      this.snackBar.open('Failed to process Google Sign-In. Please try again.', 'Close', {
        duration: 4000,
        panelClass: ['error-snackbar']
      });
    }
  }

  parseJwt(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error parsing JWT:', error);
      return null;
    }
  }

  socialLogin(provider: string) {
    if (provider === 'Google') {
      // Trigger Google Sign-In popup
      if (typeof google !== 'undefined' && google.accounts) {
        google.accounts.id.prompt();
      } else {
        this.snackBar.open('Google Sign-In not loaded. Please refresh the page.', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
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
