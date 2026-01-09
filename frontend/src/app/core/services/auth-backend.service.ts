import { Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { BackendApiService, User, SignupRequest, LoginRequest } from './backend-api.service';
import { environment } from '../../../environments/environment';

export interface AuthUser extends User {
  // Additional auth-specific properties if needed
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly USER_KEY = 'course-planner-user';

  // Auth state signals
  private _currentUser = signal<AuthUser | null>(this.getStoredUser());
  private _isLoggedIn = signal<boolean>(!!this.getStoredUser());
  private _isLoading = signal<boolean>(false);

  // Public readonly signals
  currentUser = this._currentUser.asReadonly();
  isLoggedIn = this._isLoggedIn.asReadonly();
  isLoading = this._isLoading.asReadonly();

  // Computed properties
  userFullName = computed(() => {
    const user = this._currentUser();
    if (!user) return '';
    const firstName = user.firstName || '';
    const lastName = user.lastName || '';
    return `${firstName} ${lastName}`.trim() || user.username;
  });

  userInitials = computed(() => {
    const user = this._currentUser();
    if (!user) return '';
    
    if (user.firstName && user.lastName) {
      return (user.firstName.charAt(0) + user.lastName.charAt(0)).toUpperCase();
    } else if (user.username) {
      return user.username.substring(0, 2).toUpperCase();
    }
    return 'U';
  });

  userLevel = computed(() => {
    const user = this._currentUser();
    return user?.level || 1;
  });

  constructor(
    private router: Router,
    private backendApi: BackendApiService,
    private http: HttpClient
  ) {}

  /**
   * Register new user
   */
  signup(signupData: SignupRequest): Observable<AuthUser> {
    this._isLoading.set(true);

    return this.backendApi.signup(signupData).pipe(
      map(response => {
        if (response.success) {
          const user = response.data as AuthUser;
          // Don't automatically log in after signup - let user go to login page
          // this.setAuthData(user);
          return user;
        } else {
          throw new Error(response.message);
        }
      }),
      tap(() => this._isLoading.set(false)),
      catchError(error => {
        this._isLoading.set(false);
        return throwError(() => error);
      })
    );
  }

  /**
   * Login user with backend authentication
   */
  login(credentials: LoginRequest): Observable<AuthUser> {
    this._isLoading.set(true);

    return this.backendApi.login(credentials).pipe(
      map(response => {
        if (response.success) {
          const user = response.data as AuthUser;
          this.setAuthData(user);
          return user;
        } else {
          throw new Error(response.message);
        }
      }),
      tap(() => this._isLoading.set(false)),
      catchError(error => {
        this._isLoading.set(false);
        return throwError(() => error);
      })
    );
  }

  /**
   * Login with Google - Backend integration
   */
  loginWithGoogle(googleData: any): Observable<AuthUser> {
    this._isLoading.set(true);

    const googleAuthRequest = {
      googleToken: googleData.credential || '',
      email: googleData.email,
      firstName: googleData.given_name || googleData.name?.split(' ')[0] || 'User',
      lastName: googleData.family_name || googleData.name?.split(' ').slice(1).join(' ') || '',
      profilePicture: googleData.picture || '',
      googleId: googleData.sub || googleData.id
    };

    return this.http.post<any>(`${environment.apiUrl}/auth/google`, googleAuthRequest, { withCredentials: true }).pipe(
      map(response => {
        if (response.success) {
          // Backend returns userId, email, username, firstName, lastName, role, profilePicture
          const userData = response.data;
          const user: AuthUser = {
            id: userData.userId,
            username: userData.username,
            email: userData.email,
            firstName: userData.firstName,
            lastName: userData.lastName,
            profilePicture: userData.profilePicture,
            bio: '',
            role: userData.role,
            totalScore: 0,
            level: 1,
            completedCourses: 0,
            completedTasks: 0,
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString()
          };
          
          this.setAuthData(user);
          console.log('✅ Google login successful, user data set:', user);
          return user;
        } else {
          throw new Error(response.message);
        }
      }),
      tap(() => this._isLoading.set(false)),
      catchError(error => {
        this._isLoading.set(false);
        console.error('Google login error:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get current user profile from backend
   */
  refreshUserProfile(): Observable<AuthUser> {
    const currentUser = this._currentUser();
    if (!currentUser?.id) {
      return throwError(() => new Error('No user logged in'));
    }

    return this.backendApi.getUserProfile(currentUser.id).pipe(
      map(response => {
        if (response.success) {
          const user = response.data as AuthUser;
          this.setAuthData(user);
          return user;
        } else {
          throw new Error(response.message);
        }
      }),
      catchError(error => {
        console.error('Failed to refresh user profile:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Update user profile
   */
  updateProfile(updates: Partial<User>): Observable<AuthUser> {
    const currentUser = this._currentUser();
    if (!currentUser?.id) {
      return throwError(() => new Error('No user logged in'));
    }

    return this.backendApi.updateProfile(currentUser.id, updates).pipe(
      map(response => {
        if (response.success) {
          const user = response.data as AuthUser;
          this.setAuthData(user);
          return user;
        } else {
          throw new Error(response.message);
        }
      }),
      catchError(error => {
        console.error('Failed to update profile:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Check if username is available
   */
  checkUsernameAvailability(username: string): Observable<boolean> {
    return this.backendApi.checkUsername(username).pipe(
      map(response => {
        if (response.success) {
          return !response.data; // API returns true if exists, we want availability
        } else {
          throw new Error(response.message);
        }
      }),
      catchError(error => {
        console.error('Failed to check username:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Check if email is available
   */
  checkEmailAvailability(email: string): Observable<boolean> {
    return this.backendApi.checkEmail(email).pipe(
      map(response => {
        if (response.success) {
          return !response.data; // API returns true if exists, we want availability
        } else {
          throw new Error(response.message);
        }
      }),
      catchError(error => {
        console.error('Failed to check email:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Logout user - AGGRESSIVE CLEAR
   */
  logout(): void {
    console.log('🚨 AuthService AGGRESSIVE logout called');
    
    // Clear everything
    localStorage.clear();
    sessionStorage.clear();
    
    // Reset signals
    this._currentUser.set(null);
    this._isLoggedIn.set(false);
    
    console.log('🗑️ All data cleared, forcing page reload...');
    
    // Force complete page reload to login
    window.location.replace('/auth/login');
  }

  /**
   * Get current user ID
   */
  getCurrentUserId(): string | null {
    return this._currentUser()?.id || null;
  }

  /**
   * Check if user has specific role (for future use)
   */
  hasRole(role: string): boolean {
    const user = this._currentUser();
    return user?.level !== undefined && user.level > 0; // Simple role check based on level
  }

  /**
   * Set authentication data
   * Uses session cookies from backend - no tokens needed
   */
  private setAuthData(user: AuthUser): void {
    console.log('Setting auth data for user:', user);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    
    // Save role separately for quick access by guards
    const userRole = user.role || 'STUDENT'; // Default to STUDENT if role is undefined
    localStorage.setItem('userRole', userRole);
    console.log('✅ User role saved to localStorage:', userRole);
    
    this._currentUser.set(user);
    this._isLoggedIn.set(true);
    console.log('Auth data set. Current user:', this._currentUser());
  }

  /**
   * Clear authentication data
   */
  private clearAuthData(): void {
    localStorage.removeItem(this.USER_KEY);
    
    this._currentUser.set(null);
    this._isLoggedIn.set(false);
  }

  /**
   * Get stored user from localStorage
   */
  private getStoredUser(): AuthUser | null {
    try {
      const userData = localStorage.getItem(this.USER_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error parsing stored user data:', error);
      return null;
    }
  }


}