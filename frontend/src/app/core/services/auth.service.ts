import { Injectable, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { delay, map, catchError } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: string;
  level?: number;
  experience?: number;
  preferences?: {
    theme?: string;
    language?: string;
    notifications?: boolean;
  };
  profile?: {
    bio?: string;
    phone?: string;
    location?: string;
    university?: string;
    department?: string;
    major?: string;
    year?: string;
    dateOfBirth?: Date;
    gender?: string;
    website?: string;
    linkedin?: string;
    twitter?: string;
    github?: string;
    skills?: string[];
    interests?: string[];
    languages?: string[];
    emergencyContact?: string;
    emergencyPhone?: string;
  };
  createdAt: string;
  lastLoginAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  user: AuthUser;
}

export interface SocialLoginResponse {
  token: string;
  refreshToken: string;
  user: AuthUser;
  provider: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'course-planner-token';
  private readonly REFRESH_TOKEN_KEY = 'course-planner-refresh-token';
  private readonly USER_KEY = 'course-planner-user';
  
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  // Auth state signals
  private _currentUser = signal<AuthUser | null>(this.getStoredUser());
  private _isLoggedIn = signal<boolean>(!!this.getStoredToken());
  private _isLoading = signal<boolean>(false);

  // Public readonly signals
  currentUser = this._currentUser.asReadonly();
  isLoggedIn = this._isLoggedIn.asReadonly();
  isLoading = this._isLoading.asReadonly();

  // Computed properties
  userFullName = computed(() => {
    const user = this._currentUser();
    return user ? `${user.firstName} ${user.lastName}` : '';
  });

  userInitials = computed(() => {
    const user = this._currentUser();
    if (!user) return '';
    const firstInitial = user.firstName?.charAt(0) || '';
    const lastInitial = user.lastName?.charAt(0) || '';
    return (firstInitial + lastInitial).toUpperCase();
  });

  userLevel = computed(() => {
    const user = this._currentUser();
    return user?.level || 1;
  });

  constructor(private router: Router) {
    // Initialize auth state from storage
    this.initializeAuthState();
  }

  /**
   * Helper method to capitalize words
   */
  private capitalizeWord(word: string): string {
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }

  /**
   * Generate a consistent user ID from email
   */
  private generateUserId(email: string): string {
    // Simple hash function for consistent ID generation
    let hash = 0;
    for (let i = 0; i < email.length; i++) {
      const char = email.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString();
  }

  /**
   * Try to infer university from email domain
   */
  private inferUniversity(email: string): string {
    const domain = email.split('@')[1];
    if (!domain) return '';
    
    // Common educational domains
    const eduDomains: { [key: string]: string } = {
      'gmail.com': '',
      'yahoo.com': '',
      'outlook.com': '',
      'hotmail.com': '',
      'edu': 'University',
      'ac.in': 'Indian Institute',
      'iiit.ac.in': 'IIIT',
      'iit.ac.in': 'IIT',
      'nit.ac.in': 'NIT'
    };
    
    // Check for exact matches first
    if (eduDomains[domain]) {
      return eduDomains[domain];
    }
    
    // Check for partial matches
    for (const [key, value] of Object.entries(eduDomains)) {
      if (domain.includes(key) && value) {
        return value;
      }
    }
    
    return '';
  }

  /**
   * Login user - Calls backend API
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    this._isLoading.set(true);

    // Use /api/auth/login for proper Spring Security session authentication
    return this.http.post<any>(`${this.apiUrl}/auth/login`, credentials, { withCredentials: true }).pipe(
      map(response => {
        // Backend returns: { success: true, message: "...", data: { userId, email, firstName, lastName, role, ... } }
        const userData = response.data;
        
        // Generate tokens (backend should ideally provide these)
        const loginResponse: LoginResponse = {
          token: 'mock-jwt-token-' + Date.now(),
          refreshToken: 'mock-refresh-token-' + Date.now(),
          user: {
            id: userData.userId,
            email: userData.email,
            firstName: userData.firstName || userData.username || 'User',
            lastName: userData.lastName || '',
            avatar: userData.profilePicture || `https://ui-avatars.com/api/?name=${userData.firstName || userData.username || 'User'}&background=4285f4&color=fff&size=150`,
            role: userData.role || 'STUDENT',
            level: 1,
            experience: 0,
            preferences: {
              theme: 'light',
              language: 'en',
              notifications: true
            },
            profile: {
              bio: '',
              university: '',
              major: '',
              year: '1'
            },
            createdAt: new Date().toISOString(),
            lastLoginAt: new Date().toISOString()
          }
        };
        
        this._isLoading.set(false);
        return loginResponse;
      }),
      catchError(error => {
        this._isLoading.set(false);
        console.error('Login error:', error);
        return throwError(() => new Error(error.error?.message || 'Login failed'));
      })
    );
  }

  /**
   * Register user - Frontend only (no backend)
   */
  register(userData: any): Observable<LoginResponse> {
    this._isLoading.set(true);

    // Use provided names or enhance from email
    const firstName = userData.firstName || this.capitalizeWord(userData.email.split('@')[0].split(/[._-]/)[0] || 'User');
    const lastName = userData.lastName || '';

    // Simulate API call with delay
    return of({
      token: 'mock-jwt-token-' + Date.now(),
      refreshToken: 'mock-refresh-token-' + Date.now(),
      user: {
        id: this.generateUserId(userData.email),
        email: userData.email,
        firstName: firstName,
        lastName: lastName,
        avatar: `https://ui-avatars.com/api/?name=${firstName}+${lastName}&background=4285f4&color=fff&size=150`,
        role: userData.role || 'student',
        level: 1,
        experience: 0,
        preferences: {
          theme: 'light',
          language: 'en',
          notifications: true
        },
        profile: {
          bio: `Welcome to Course Planner AI! I'm ${firstName}${lastName ? ' ' + lastName : ''} and I'm excited to start my learning journey.`,
          university: userData.institution || this.inferUniversity(userData.email),
          major: '',
          year: '1'
        },
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString()
      }
    }).pipe(
      delay(1000) // Simulate network delay
    );
  }

  /**
   * Social login - Frontend only
   */
  socialLogin(provider: string, token: string, userData: any): Observable<SocialLoginResponse> {
    this._isLoading.set(true);

    return of({
      token: 'mock-jwt-token-' + Date.now(),
      refreshToken: 'mock-refresh-token-' + Date.now(),
      provider: provider,
      user: {
        id: userData.id || Date.now().toString(),
        email: userData.email,
        firstName: userData.givenName || userData.name?.split(' ')[0] || 'User',
        lastName: userData.familyName || userData.name?.split(' ').slice(1).join(' ') || '',
        avatar: userData.imageUrl || userData.picture || `https://ui-avatars.com/api/?name=${userData.name}&background=4285f4&color=fff&size=150`,
        role: 'student',
        level: 1,
        experience: 0,
        preferences: {
          theme: 'light',
          language: 'en',
          notifications: true
        },
        profile: {
          bio: `Signed up with ${provider}`,
          university: '',
          major: '',
          year: '1'
        },
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString()
      }
    }).pipe(
      delay(1000) // Simulate network delay
    );
  }

  /**
   * Login with Google - Backend integration
   */
  loginWithGoogle(googleData: any): Observable<LoginResponse> {
    this._isLoading.set(true);

    const googleAuthRequest = {
      googleToken: googleData.credential,
      email: googleData.email,
      firstName: googleData.given_name || googleData.name?.split(' ')[0] || 'User',
      lastName: googleData.family_name || googleData.name?.split(' ').slice(1).join(' ') || '',
      profilePicture: googleData.picture || '',
      googleId: googleData.sub || googleData.id
    };

    return this.http.post<any>(`${this.apiUrl}/auth/google`, googleAuthRequest, { withCredentials: true }).pipe(
      map(response => {
        // Backend returns: { success: true, message: "...", data: { userId, email, firstName, lastName, role, ... } }
        const userData = response.data;
        
        const loginResponse: LoginResponse = {
          token: 'mock-jwt-token-' + Date.now(),
          refreshToken: 'mock-refresh-token-' + Date.now(),
          user: {
            id: userData.userId,
            email: userData.email,
            firstName: userData.firstName || 'User',
            lastName: userData.lastName || '',
            avatar: userData.profilePicture || googleData.picture || `https://ui-avatars.com/api/?name=${userData.firstName}&background=4285f4&color=fff&size=150`,
            role: userData.role || 'STUDENT',
            level: 1,
            experience: 0,
            preferences: {
              theme: 'light',
              language: 'en',
              notifications: true
            },
            profile: {
              bio: '',
              university: '',
              major: '',
              year: '1'
            },
            createdAt: new Date().toISOString(),
            lastLoginAt: new Date().toISOString()
          }
        };
        
        this._isLoading.set(false);
        return loginResponse;
      }),
      catchError(error => {
        this._isLoading.set(false);
        console.error('Google login error:', error);
        return throwError(() => new Error(error.error?.message || 'Google login failed'));
      })
    );
  }

  /**
   * Logout user
   */
  logout(): void {
    this._isLoading.set(true);
    
    // Clear storage
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    
    // Reset state
    this._currentUser.set(null);
    this._isLoggedIn.set(false);
    this._isLoading.set(false);
    
    // Redirect to login
    this.router.navigate(['/auth/login']);
  }

  /**
   * Get current user profile - Frontend only
   */
  getCurrentUser(): Observable<AuthUser> {
    const user = this._currentUser();
    if (user) {
      return of(user).pipe(delay(300));
    }
    return throwError(() => new Error('No user logged in'));
  }

  /**
   * Update user profile - Frontend only
   */
  updateProfile(userData: Partial<AuthUser>): Observable<AuthUser> {
    const currentUser = this._currentUser();
    if (!currentUser) {
      return throwError(() => new Error('No user logged in'));
    }

    const updatedUser = { ...currentUser, ...userData };
    
    // Update storage and state
    localStorage.setItem(this.USER_KEY, JSON.stringify(updatedUser));
    this._currentUser.set(updatedUser);
    
    return of(updatedUser).pipe(delay(500));
  }

  /**
   * Reset password - Frontend only (simulation)
   */
  resetPassword(email: string): Observable<any> {
    // Simulate password reset
    return of({ message: `Password reset link sent to ${email} (simulated)` }).pipe(
      delay(1000)
    );
  }

  /**
   * Change password - Frontend only (simulation)
   */
  changePassword(currentPassword: string, newPassword: string): Observable<any> {
    // Simulate password change
    return of({ message: 'Password changed successfully (simulated)' }).pipe(
      delay(1000)
    );
  }
  
  /**
   * Verify email with token
   */
  verifyEmail(email: string, token: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/verify-email?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}`, {}).pipe(
      map(response => response.data),
      catchError(error => {
        console.error('Email verification error:', error);
        return throwError(() => new Error(error.error?.message || 'Email verification failed'));
      })
    );
  }
  
  /**
   * Resend verification email
   */
  resendVerificationEmail(email: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/resend-verification?email=${encodeURIComponent(email)}`, {}).pipe(
      map(response => response.data),
      catchError(error => {
        console.error('Resend verification error:', error);
        return throwError(() => new Error(error.error?.message || 'Failed to send verification email'));
      })
    );
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this._isLoggedIn();
  }

  /**
   * Get stored token
   */
  getToken(): string | null {
    return this.getStoredToken();
  }

  /**
   * Set authentication data after successful login
   */
  setAuthData(response: LoginResponse | SocialLoginResponse): void {
    // Store tokens and user data
    localStorage.setItem(this.TOKEN_KEY, response.token);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, response.refreshToken);
    localStorage.setItem(this.USER_KEY, JSON.stringify(response.user));
    
    // Update state
    this._currentUser.set(response.user);
    this._isLoggedIn.set(true);
    this._isLoading.set(false);
  }

  // Private helper methods
  private initializeAuthState(): void {
    const token = this.getStoredToken();
    const user = this.getStoredUser();
    
    this._isLoggedIn.set(!!token);
    this._currentUser.set(user);
  }

  private getStoredToken(): string | null {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(this.TOKEN_KEY);
    }
    return null;
  }

  private getStoredUser(): AuthUser | null {
    if (typeof localStorage !== 'undefined') {
      const userStr = localStorage.getItem(this.USER_KEY);
      return userStr ? JSON.parse(userStr) : null;
    }
    return null;
  }
}