import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../../../environments/environment';
import { AuthService } from '../../../../core/services/auth-backend.service';

interface UserAnalytics {
  totalUsers: number;
  adminUsers: number;
  studentUsers: number;
  onboardedUsers: number;
  pendingOnboarding: number;
  growthRate: string;
  activeToday: number;
}

interface InterestAnalytics {
  totalInterests: number;
  enabledInterests: number;
  disabledInterests: number;
  topInterests: { [key: string]: number };
}

interface GoalAnalytics {
  totalGoals: number;
  enabledGoals: number;
  disabledGoals: number;
  topGoals: { [key: string]: number };
}

interface RecommendationAnalytics {
  usersWithRecommendations: number;
  totalRecommendationsGenerated: number;
  averageRecommendationsPerUser: number;
}

interface SystemHealth {
  status: string;
  uptime: string;
  lastUpdated: string;
}

@Component({
  selector: 'app-admin-analytics',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-4 bg-gradient-to-br from-blue-50 to-purple-50 min-h-screen">
      <div class="max-w-7xl mx-auto">
        
        <!-- Header -->
        <div class="mb-4 bg-white p-4 rounded-lg shadow border-l-4 border-blue-600">
          <h1 class="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-2">
            📊 Analytics Dashboard
          </h1>
          <p class="text-sm text-gray-600 mb-3">Admin Analytics - Course Planner AI</p>
          <button (click)="loadAnalytics()" class="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all shadow">
            🔄 Refresh Data
          </button>
        </div>

        <!-- Loading State -->
        <div *ngIf="loading" class="bg-white p-8 rounded-lg shadow-xl text-center border-2 border-blue-400">
          <div class="text-4xl mb-3 animate-bounce">⏳</div>
          <p class="text-xl font-bold text-blue-600">Loading Analytics...</p>
          <p class="text-gray-600 mt-2 text-sm">Please wait...</p>
        </div>

        <!-- Error State -->
        <div *ngIf="error && !loading" class="bg-red-50 border-2 border-red-500 p-6 rounded-lg shadow-lg">
          <div class="text-3xl mb-2 text-center">❌</div>
          <p class="font-bold text-red-900 text-xl mb-2 text-center">Error Occurred!</p>
          <p class="text-red-700 text-sm mb-4 text-center">{{ error }}</p>
          <div class="text-center">
            <button (click)="loadAnalytics()" class="px-6 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transform hover:scale-105 transition-all shadow">
              🔄 Try Again
            </button>
          </div>
          <div class="mt-4 p-3 bg-yellow-100 border border-yellow-500 rounded">
            <p class="text-yellow-900 font-semibold text-sm">💡 Tips:</p>
            <ul class="list-disc list-inside text-yellow-800 mt-1 text-xs">
              <li>Check backend is running (localhost:8080)</li>
              <li>Verify admin login (F12 → localStorage → adminToken)</li>
            </ul>
          </div>
        </div>

        <!-- Success State -->
        <div *ngIf="!loading && !error">
          
          <!-- Debug Panel -->
          <div class="bg-gradient-to-r from-yellow-100 to-orange-100 border-2 border-yellow-500 p-4 rounded-lg mb-4 shadow">
            <h2 class="text-lg font-bold text-yellow-900 mb-3 flex items-center gap-2">
              <span class="text-2xl">🔍</span>
              Debug Information
            </h2>
            <div class="space-y-2 bg-white p-3 rounded">
              <p class="text-sm"><strong class="text-green-700">Component:</strong> <span class="text-green-600 font-semibold">✅ Loaded!</span></p>
              <p class="text-sm"><strong class="text-blue-700">Data:</strong> <span class="font-semibold" [class.text-green-600]="userAnalytics" [class.text-red-600]="!userAnalytics">{{ userAnalytics ? '✅ Received' : '❌ Not Received' }}</span></p>
              <p class="text-sm"><strong class="text-purple-700">Total Users:</strong> <span class="text-purple-600 font-semibold">{{ userAnalytics?.totalUsers || 0 }}</span></p>
              <div class="mt-3 pt-3 border-t border-gray-300">
                <p class="text-xs font-semibold text-gray-700 mb-2">📄 Raw Response:</p>
                <pre class="bg-gray-900 text-green-400 p-2 rounded text-xs overflow-auto max-h-32 font-mono">{{ userAnalytics | json }}</pre>
              </div>
            </div>
          </div>

          <!-- Stats Cards -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            
            <div class="bg-gradient-to-br from-blue-500 to-blue-700 p-4 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all">
              <div class="text-4xl mb-2 text-center">👥</div>
              <h3 class="text-sm font-bold text-white text-center mb-2">Total Users</h3>
              <p class="text-3xl font-bold text-white text-center mb-2">{{ userAnalytics?.totalUsers || 0 }}</p>
              <div class="bg-blue-800 bg-opacity-50 p-2 rounded">
                <p class="text-xs text-blue-100 text-center">Students: <span class="font-semibold text-white">{{ userAnalytics?.studentUsers || 0 }}</span></p>
              </div>
            </div>

            <div class="bg-gradient-to-br from-green-500 to-green-700 p-4 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all">
              <div class="text-4xl mb-2 text-center">🎨</div>
              <h3 class="text-sm font-bold text-white text-center mb-2">Active Interests</h3>
              <p class="text-3xl font-bold text-white text-center mb-2">{{ interestAnalytics?.totalInterests || 0 }}</p>
              <div class="bg-green-800 bg-opacity-50 p-2 rounded">
                <p class="text-xs text-green-100 text-center">Enabled: <span class="font-semibold text-white">{{ interestAnalytics?.enabledInterests || 0 }}</span></p>
              </div>
            </div>

            <div class="bg-gradient-to-br from-purple-500 to-purple-700 p-4 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all">
              <div class="text-4xl mb-2 text-center">🎯</div>
              <h3 class="text-sm font-bold text-white text-center mb-2">Active Goals</h3>
              <p class="text-3xl font-bold text-white text-center mb-2">{{ goalAnalytics?.totalGoals || 0 }}</p>
              <div class="bg-purple-800 bg-opacity-50 p-2 rounded">
                <p class="text-xs text-purple-100 text-center">Enabled: <span class="font-semibold text-white">{{ goalAnalytics?.enabledGoals || 0 }}</span></p>
              </div>
            </div>

            <div class="bg-gradient-to-br from-pink-500 to-pink-700 p-4 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all">
              <div class="text-4xl mb-2 text-center">🤖</div>
              <h3 class="text-sm font-bold text-white text-center mb-2">AI Recommendations</h3>
              <p class="text-3xl font-bold text-white text-center mb-2">{{ recommendationAnalytics?.totalRecommendationsGenerated || 0 }}</p>
              <div class="bg-pink-800 bg-opacity-50 p-2 rounded">
                <p class="text-xs text-pink-100 text-center">Users: <span class="font-semibold text-white">{{ recommendationAnalytics?.usersWithRecommendations || 0 }}</span></p>
              </div>
            </div>

          </div>

          <!-- Top Lists -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div class="bg-white p-4 rounded-lg shadow-lg border-t-4 border-blue-500">
              <h3 class="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span class="text-2xl">🎨</span>
                Top Interests
              </h3>
              <div class="space-y-2">
                <div *ngFor="let interest of getTopInterests(); let i = index" 
                     class="flex justify-between items-center p-3 bg-gradient-to-r from-blue-100 to-blue-200 hover:from-blue-200 hover:to-blue-300 rounded-lg transform hover:scale-105 transition-all">
                  <div class="flex items-center gap-2">
                    <span class="text-sm font-bold text-blue-700 bg-blue-300 w-8 h-8 flex items-center justify-center rounded-full">{{ i + 1 }}</span>
                    <span class="font-semibold text-sm text-gray-800">{{ interest.name }}</span>
                  </div>
                  <span class="font-bold text-lg text-blue-700 bg-blue-300 px-3 py-1 rounded-full">{{ interest.count }}</span>
                </div>
                <div *ngIf="getTopInterests().length === 0" class="text-center py-4 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300">
                  <p class="text-sm text-gray-500">📭 No data available</p>
                </div>
              </div>
            </div>

            <div class="bg-white p-4 rounded-lg shadow-lg border-t-4 border-green-500">
              <h3 class="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span class="text-2xl">🎯</span>
                Top Goals
              </h3>
              <div class="space-y-2">
                <div *ngFor="let goal of getTopGoals(); let i = index" 
                     class="flex justify-between items-center p-3 bg-gradient-to-r from-green-100 to-green-200 hover:from-green-200 hover:to-green-300 rounded-lg transform hover:scale-105 transition-all">
                  <div class="flex items-center gap-2">
                    <span class="text-sm font-bold text-green-700 bg-green-300 w-8 h-8 flex items-center justify-center rounded-full">{{ i + 1 }}</span>
                    <span class="font-semibold text-sm text-gray-800">{{ goal.name }}</span>
                  </div>
                  <span class="font-bold text-lg text-green-700 bg-green-300 px-3 py-1 rounded-full">{{ goal.count }}</span>
                </div>
                <div *ngIf="getTopGoals().length === 0" class="text-center py-4 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300">
                  <p class="text-sm text-gray-500">📭 No data available</p>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  `
})
export class AdminAnalyticsComponent implements OnInit {
  userAnalytics: UserAnalytics | null = null;
  interestAnalytics: InterestAnalytics | null = null;
  goalAnalytics: GoalAnalytics | null = null;
  recommendationAnalytics: RecommendationAnalytics | null = null;
  systemHealth: SystemHealth | null = null;
  loading = false;
  error: string | null = null;

  private http = inject(HttpClient);
  private router = inject(Router);
  private authService = inject(AuthService);

  ngOnInit(): void {
    // Check if user is admin before loading
    const currentUser = this.authService.currentUser();
    if (!currentUser || currentUser.role !== 'ADMIN') {
      console.error('Not authorized as admin:', currentUser);
      this.error = 'Not authorized. Please log in as an admin user.';
      this.router.navigate(['/auth/login']);
      return;
    }
    this.loadAnalytics();
  }

  loadAnalytics(): void {
    this.loading = true;
    this.error = null;

    const apiUrl = environment.apiUrl || 'http://localhost:8080/api';
    const url = `${apiUrl}/admin/analytics/overview`;
    
    console.log('Loading analytics from:', url);

    // Use withCredentials to send session cookies
    this.http.get<any>(url, { withCredentials: true }).subscribe({
      next: (response) => {
        console.log('Analytics API Response:', response);
        if (response.success && response.data) {
          this.userAnalytics = response.data.users;
          this.interestAnalytics = response.data.interests;
          this.goalAnalytics = response.data.goals;
          this.recommendationAnalytics = response.data.recommendations;
          this.systemHealth = response.data.systemHealth;
          console.log('Data loaded:', this.userAnalytics);
        } else {
          console.warn('API response success is false or no data');
          this.error = response.message || 'No data available';
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Failed to load analytics:', error);
        
        // If 404, use mock data instead of showing error
        if (error.status === 404) {
          console.warn('Analytics endpoint not implemented, using mock data');
          this.loadMockData();
          return;
        }
        
        // Handle different error types
        if (error.status === 403) {
          this.error = 'Access Forbidden: You must be logged in as an admin. Please log in again.';
          // Clear auth and redirect to login
          setTimeout(() => {
            this.router.navigate(['/auth/login'], { queryParams: { returnUrl: '/admin/analytics' } });
          }, 2000);
        } else if (error.status === 401) {
          this.error = 'Unauthorized: Your session has expired. Please log in again.';
          setTimeout(() => {
            this.router.navigate(['/auth/login'], { queryParams: { returnUrl: '/admin/analytics' } });
          }, 2000);
        } else {
          this.error = `Failed: ${error.status} ${error.statusText}`;
        }
        
        this.loading = false;
      }
    });
  }

  private loadMockData(): void {
    // Mock data for development/demo
    this.userAnalytics = {
      totalUsers: 0,
      adminUsers: 0,
      studentUsers: 0,
      onboardedUsers: 0,
      pendingOnboarding: 0,
      growthRate: '0%',
      activeToday: 0
    };

    this.interestAnalytics = {
      totalInterests: 0,
      enabledInterests: 0,
      disabledInterests: 0,
      topInterests: {}
    };

    this.goalAnalytics = {
      totalGoals: 0,
      enabledGoals: 0,
      disabledGoals: 0,
      topGoals: {}
    };

    this.recommendationAnalytics = {
      usersWithRecommendations: 0,
      totalRecommendationsGenerated: 0,
      averageRecommendationsPerUser: 0
    };

    this.systemHealth = {
      status: 'Healthy',
      uptime: '0 days',
      lastUpdated: new Date().toISOString()
    };

    this.loading = false;
    this.error = null;
  }

  getTopInterests(): Array<{name: string, count: number}> {
    if (!this.interestAnalytics || !this.interestAnalytics.topInterests) {
      return [];
    }
    return Object.entries(this.interestAnalytics.topInterests)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  getTopGoals(): Array<{name: string, count: number}> {
    if (!this.goalAnalytics || !this.goalAnalytics.topGoals) {
      return [];
    }
    return Object.entries(this.goalAnalytics.topGoals)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }
}
