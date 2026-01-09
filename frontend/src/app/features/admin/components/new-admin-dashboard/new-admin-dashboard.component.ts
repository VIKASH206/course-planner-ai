import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../core/services/auth-backend.service';
import { AdminService } from '../../../admin/services/admin.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';

interface StatCard {
  icon: string;
  title: string;
  value: string | number;
  route: string;
  gradient: string;
}

interface QuickAction {
  icon: string;
  label: string;
  route: string;
  gradient: string;
}

interface RecentActivity {
  id: string;
  icon: string;
  action: string;
  time: string;
  color: string;
  type: 'user' | 'course' | 'ai-rule' | 'ai-recommendation' | 'coming-soon';
}

interface AIHealth {
  status: 'Active' | 'Down' | 'Warning';
  lastRun: string;
  errorCount: number;
}

@Component({
  selector: 'app-new-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen p-2 sm:p-4 md:p-6 bg-gradient-to-br from-purple-50 to-pink-50">
      <!-- Welcome Section -->
      <div class="max-w-7xl mx-auto">
        <div class="mb-3 sm:mb-4 bg-white p-3 sm:p-4 rounded-lg shadow border-l-4 border-purple-600">
          <h1 class="text-xl sm:text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-1 sm:mb-2">👋 Welcome, Admin!</h1>
          <p class="text-xs sm:text-sm text-gray-600">Here's what's happening with your platform today.</p>
        </div>

      <!-- AI Health Indicator -->
      <div class="mb-3 sm:mb-4 bg-white rounded-lg shadow-lg p-3 sm:p-4 border-t-4 border-blue-500 hover:shadow-xl transition-all duration-300">
        <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 sm:gap-4">
          <div class="flex items-center gap-3 sm:gap-4">
            <span class="text-2xl sm:text-3xl">🤖</span>
            <div>
              <h3 class="text-base sm:text-lg font-bold text-gray-800">AI System Status</h3>
              <p class="text-xs sm:text-sm text-gray-600">Real-time health monitoring</p>
            </div>
          </div>
          <div class="flex items-center gap-3 sm:gap-4 md:gap-6 w-full md:w-auto">
            <div class="text-center flex-1 md:flex-initial">
              <div class="flex items-center gap-2 mb-1 justify-center">
                <span class="w-2 h-2 sm:w-3 sm:h-3 rounded-full" [class.bg-green-500]="aiHealth.status === 'Active'" [class.bg-red-500]="aiHealth.status === 'Down'" [class.bg-yellow-500]="aiHealth.status === 'Warning'"></span>
                <span class="font-bold text-sm sm:text-lg" [class.text-green-600]="aiHealth.status === 'Active'" [class.text-red-600]="aiHealth.status === 'Down'" [class.text-yellow-600]="aiHealth.status === 'Warning'">
                  {{ aiHealth.status }}
                </span>
              </div>
              <p class="text-xs text-gray-500">Status</p>
            </div>
            <div class="text-center border-l pl-3 sm:pl-6 flex-1 md:flex-initial">
              <p class="font-bold text-sm sm:text-lg text-gray-800">{{ aiHealth.lastRun }}</p>
              <p class="text-xs text-gray-500">Last Run</p>
            </div>
            <div class="text-center border-l pl-3 sm:pl-6 flex-1 md:flex-initial">
              <p class="font-bold text-sm sm:text-lg" [class.text-green-600]="aiHealth.errorCount === 0" [class.text-red-600]="aiHealth.errorCount > 0">
                {{ aiHealth.errorCount }}
              </p>
              <p class="text-xs text-gray-500">Errors</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-3 sm:mb-4">
        <!-- Total Users -->
        <div 
          (click)="navigateTo('/admin/users')"
          class="bg-gradient-to-br from-blue-500 to-blue-700 p-3 sm:p-4 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all cursor-pointer">
          <div class="text-3xl sm:text-4xl mb-2 text-center">👥</div>
          <h3 class="text-xs sm:text-sm font-bold text-white text-center mb-2">Total Users</h3>
          <p class="text-2xl sm:text-3xl font-bold text-white text-center mb-2">{{ statsCards[0].value }}</p>
          <div class="bg-blue-800 bg-opacity-50 p-2 rounded">
            <p class="text-xs text-blue-100 text-center">Click to view details</p>
          </div>
        </div>
        
        <!-- Active Users -->
        <div 
          (click)="navigateTo('/admin/users')"
          class="bg-gradient-to-br from-green-500 to-green-700 p-3 sm:p-4 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all cursor-pointer">
          <div class="text-3xl sm:text-4xl mb-2 text-center">✅</div>
          <h3 class="text-xs sm:text-sm font-bold text-white text-center mb-2">Active Users</h3>
          <p class="text-2xl sm:text-3xl font-bold text-white text-center mb-2">{{ statsCards[1].value }}</p>
          <div class="bg-green-800 bg-opacity-50 p-2 rounded">
            <p class="text-xs text-green-100 text-center">Click to view details</p>
          </div>
        </div>
        
        <!-- Total Courses -->
        <div 
          (click)="navigateTo('/admin/courses')"
          class="bg-gradient-to-br from-purple-500 to-purple-700 p-3 sm:p-4 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all cursor-pointer">
          <div class="text-3xl sm:text-4xl mb-2 text-center">📚</div>
          <h3 class="text-xs sm:text-sm font-bold text-white text-center mb-2">Total Courses</h3>
          <p class="text-2xl sm:text-3xl font-bold text-white text-center mb-2">{{ statsCards[2].value }}</p>
          <div class="bg-purple-800 bg-opacity-50 p-2 rounded">
            <p class="text-xs text-purple-100 text-center">Click to view details</p>
          </div>
        </div>
        
        <!-- Available Courses -->
        <div 
          (click)="navigateTo('/admin/courses')"
          class="bg-gradient-to-br from-pink-500 to-pink-700 p-3 sm:p-4 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all cursor-pointer">
          <div class="text-3xl sm:text-4xl mb-2 text-center">🎓</div>
          <h3 class="text-xs sm:text-sm font-bold text-white text-center mb-2">Available Courses</h3>
          <p class="text-2xl sm:text-3xl font-bold text-white text-center mb-2">{{ statsCards[3].value }}</p>
          <div class="bg-pink-800 bg-opacity-50 p-2 rounded">
            <p class="text-xs text-pink-100 text-center">Click to view details</p>
          </div>
        </div>
        
        <!-- Coming Soon -->
        <div 
          (click)="navigateTo('/admin/coming-soon')"
          class="bg-gradient-to-br from-orange-500 to-orange-700 p-3 sm:p-4 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all cursor-pointer">
          <div class="text-3xl sm:text-4xl mb-2 text-center">🚀</div>
          <h3 class="text-xs sm:text-sm font-bold text-white text-center mb-2">Coming Soon Courses</h3>
          <p class="text-2xl sm:text-3xl font-bold text-white text-center mb-2">{{ statsCards[4].value }}</p>
          <div class="bg-orange-800 bg-opacity-50 p-2 rounded">
            <p class="text-xs text-orange-100 text-center">Click to view details</p>
          </div>
        </div>
        
        <!-- AI Recommendations -->
        <div 
          (click)="navigateTo('/admin/ai-logs')"
          class="bg-gradient-to-br from-cyan-500 to-cyan-700 p-3 sm:p-4 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all cursor-pointer">
          <div class="text-3xl sm:text-4xl mb-2 text-center">🤖</div>
          <h3 class="text-xs sm:text-sm font-bold text-white text-center mb-2">AI Recommendations (Today)</h3>
          <p class="text-2xl sm:text-3xl font-bold text-white text-center mb-2">{{ statsCards[5].value }}</p>
          <div class="bg-cyan-800 bg-opacity-50 p-2 rounded">
            <p class="text-xs text-cyan-100 text-center">Click to view details</p>
          </div>
        </div>
      </div>

      <!-- Content Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
        <!-- Quick Actions -->
        <div class="bg-white rounded-lg shadow-lg p-3 sm:p-4 border-t-4 border-purple-500">
          <h3 class="text-base sm:text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
            <span class="text-xl sm:text-2xl">⚡</span>
            Quick Actions
          </h3>
          <div class="grid grid-cols-2 gap-2 sm:gap-3">
            <button
              (click)="navigateTo('/admin/users')"
              class="bg-gradient-to-br from-purple-600 to-purple-800 flex flex-col items-center justify-center p-3 sm:p-4 rounded-lg hover:shadow-lg transform hover:scale-105 transition-all">
              <span class="text-2xl sm:text-3xl mb-1 sm:mb-2">➕</span>
              <span class="text-white font-semibold text-center text-xs sm:text-sm">Add User</span>
            </button>
            <button
              (click)="navigateTo('/admin/courses')"
              class="bg-gradient-to-br from-blue-600 to-cyan-600 flex flex-col items-center justify-center p-3 sm:p-4 rounded-lg hover:shadow-lg transform hover:scale-105 transition-all">
              <span class="text-2xl sm:text-3xl mb-1 sm:mb-2">📚</span>
              <span class="text-white font-semibold text-center text-xs sm:text-sm">Add Course</span>
            </button>
            <button
              (click)="navigateTo('/admin/course-requests')"
              class="bg-gradient-to-br from-green-600 to-teal-600 flex flex-col items-center justify-center p-3 sm:p-4 rounded-lg hover:shadow-lg transform hover:scale-105 transition-all">
              <span class="text-2xl sm:text-3xl mb-1 sm:mb-2">📝</span>
              <span class="text-white font-semibold text-center text-xs sm:text-sm">Course Requests</span>
            </button>
            <button
              (click)="navigateTo('/admin/analytics')"
              class="bg-gradient-to-br from-pink-600 to-orange-500 flex flex-col items-center justify-center p-3 sm:p-4 rounded-lg hover:shadow-lg transform hover:scale-105 transition-all">
              <span class="text-2xl sm:text-3xl mb-1 sm:mb-2">📈</span>
              <span class="text-white font-semibold text-center text-xs sm:text-sm">View Analytics</span>
            </button>
          </div>
        </div>

        <!-- Recent Activities -->
        <div class="bg-white rounded-lg shadow-lg p-3 sm:p-4 border-t-4 border-pink-500">
          <h3 class="text-base sm:text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
            <span class="text-xl sm:text-2xl">📋</span>
            Recent Activities
          </h3>
          @if (recentActivities.length === 0) {
            <div class="text-center py-4 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300">
              <p class="text-xs sm:text-sm text-gray-500">📭 No recent activities</p>
              <p class="text-xs text-gray-400 mt-1">Activity will appear here</p>
            </div>
          } @else {
            <div class="space-y-2 max-h-64 sm:max-h-80 overflow-y-auto custom-scrollbar">
              @for (activity of recentActivities; track activity.id) {
                <div class="flex items-start p-2 sm:p-3 rounded-lg hover:bg-gray-50 transition-colors border-l-4" [style.border-color]="activity.color">
                  <div class="text-base sm:text-xl mr-2 sm:mr-3 w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center rounded-full flex-shrink-0" [style.background]="activity.color + '20'">
                    <span>{{ activity.icon }}</span>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-gray-800 font-medium text-xs sm:text-sm mb-1 truncate">{{ activity.action }}</p>
                    <span class="text-xs text-gray-500">{{ activity.time }}</span>
                  </div>
                </div>
              }
            </div>
          }
        </div>
      </div>
      </div>
    </div>
  `,
  styles: [`
    /* Base Animations */
    .animate-fade-in {
      animation: fadeIn 0.6s ease-out;
    }

    .animate-slide-up {
      animation: slideUp 0.6s ease-out forwards;
      opacity: 0;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* Glass Effect */
    .glass-card {
      backdrop-filter: blur(10px);
    }

    /* Hover Effects */
    .stat-card:hover .stat-icon {
      transform: scale(1.1) rotate(5deg);
      transition: transform 0.3s ease;
    }

    .action-btn {
      position: relative;
      overflow: hidden;
    }

    .action-btn::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
      transition: left 0.5s;
    }

    .action-btn:hover::before {
      left: 100%;
    }

    /* Custom Scrollbar */
    .custom-scrollbar::-webkit-scrollbar {
      width: 4px;
    }

    .custom-scrollbar::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 10px;
    }

    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 10px;
    }

    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
    }

    /* Activity Animation */
    .activity-item {
      animation: fadeIn 0.3s ease-out;
    }

    /* Gradient Text */
    .gradient-text {
      -webkit-background-clip: text !important;
      background-clip: text !important;
    }

    /* Responsive Touch Optimization */
    @media (max-width: 640px) {
      .transform.hover\\:scale-105:active {
        transform: scale(0.98);
      }
      
      /* Better tap targets on mobile */
      button, a {
        min-height: 44px;
        min-width: 44px;
      }
    }

    /* Tablet Optimizations */
    @media (min-width: 641px) and (max-width: 1024px) {
      .grid {
        gap: 1rem;
      }
    }

    /* Prevent text selection on interactive elements */
    button, .cursor-pointer {
      user-select: none;
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
    }

    /* Smooth scrolling */
    html {
      scroll-behavior: smooth;
    }
  `]
})
export class NewAdminDashboardComponent implements OnInit {
  constructor(
    private router: Router,
    private authService: AuthService,
    private adminService: AdminService,
    private http: HttpClient
  ) {}

  // Stat Cards - Will be populated from backend
  statsCards: StatCard[] = [
    { icon: '👥', title: 'Total Users', value: 0, route: '/admin/users', gradient: 'linear-gradient(to br, #3b82f6, #1e40af)' },
    { icon: '✅', title: 'Active Users', value: 0, route: '/admin/users', gradient: 'linear-gradient(to br, #10b981, #047857)' },
    { icon: '📚', title: 'Total Courses', value: 0, route: '/admin/courses', gradient: 'linear-gradient(to br, #8b5cf6, #6d28d9)' },
    { icon: '🎓', title: 'Available Courses', value: 0, route: '/admin/courses', gradient: 'linear-gradient(to br, #ec4899, #be185d)' },
    { icon: '🚀', title: 'Coming Soon Courses', value: 0, route: '/admin/coming-soon', gradient: 'linear-gradient(to br, #f59e0b, #d97706)' },
    { icon: '🤖', title: 'AI Recommendations (Today)', value: 0, route: '/admin/ai-logs', gradient: 'linear-gradient(to br, #06b6d4, #0e7490)' }
  ];

  quickActions: QuickAction[] = [
    { icon: '➕', label: 'Add User', route: '/admin/users', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    { icon: '📚', label: 'Add Course', route: '/admin/courses', gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
    { icon: '📝', label: 'Course Requests', route: '/admin/course-requests', gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' },
    { icon: '📈', label: 'View Analytics', route: '/admin/analytics', gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' }
  ];

  // Recent Activities - Will be populated from backend (last 10)
  recentActivities: RecentActivity[] = [];

  // AI Health Status - Will be populated from backend
  aiHealth: AIHealth = {
    status: 'Active',
    lastRun: 'N/A',
    errorCount: 0
  };

  ngOnInit(): void {
    // DOUBLE SAFETY CHECK: Verify user role on component load
    const storedRole = localStorage.getItem('userRole');
    const currentUser = this.authService.currentUser();
    const userRole = storedRole || currentUser?.role;
    
    console.log('Admin Dashboard ngOnInit - Role check:', {
      storedRole,
      userRole,
      isLoggedIn: this.authService.isLoggedIn()
    });
    
    // If user is NOT ADMIN, immediately redirect to student dashboard
    if (userRole !== 'ADMIN') {
      console.warn('⚠️ NON-ADMIN user detected in Admin Dashboard! Redirecting to /dashboard');
      this.router.navigate(['/dashboard'], { replaceUrl: true });
      return;
    }
    
    // If user is not logged in, redirect to login
    if (!this.authService.isLoggedIn()) {
      console.warn('⚠️ No valid user found in Admin Dashboard! Redirecting to login');
      this.router.navigate(['/auth/login']);
      return;
    }
    
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    // Fetch dashboard statistics from backend
    this.adminService.getDashboardStats().subscribe({
      next: (stats: any) => {
        console.log('✅ Dashboard stats loaded:', stats);
        this.statsCards[0].value = stats.totalUsers || 0;
        this.statsCards[1].value = stats.activeUsers || 0;
        this.statsCards[2].value = stats.totalCourses || 0;
        this.statsCards[3].value = stats.availableCourses || 0;
        this.statsCards[4].value = stats.comingSoonCourses || 0;
        this.statsCards[5].value = stats.aiRecommendationsToday || 0;
      },
      error: (error) => {
        console.error('❌ Failed to load dashboard stats:', error);
        // Keep default zeros on error
      }
    });

    // Fetch AI health status (if endpoint exists)
    this.loadAIHealthStatus();
    
    // Fetch recent activities
    this.loadRecentActivities();
  }

  loadAIHealthStatus(): void {
    // Try to get AI health status from backend
    this.http.get<any>(`${environment.apiUrl}/admin/ai/health`).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.aiHealth = {
            status: response.data.status || 'Active',
            lastRun: response.data.lastRun || 'N/A',
            errorCount: response.data.errorCount || 0
          };
        }
      },
      error: () => {
        // Keep default values if endpoint doesn't exist
        console.log('ℹ️ AI health endpoint not available, using defaults');
      }
    });
  }

  loadRecentActivities(): void {
    // Try to get recent activities from backend
    this.http.get<any>(`${environment.apiUrl}/admin/activities/recent?limit=10`).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.recentActivities = response.data.map((activity: any) => ({
            id: activity.id,
            icon: this.getActivityIcon(activity.type),
            action: activity.description,
            time: this.formatTime(activity.timestamp),
            color: this.getActivityColor(activity.type),
            type: activity.type
          }));
        }
      },
      error: () => {
        // If endpoint doesn't exist, show sample data or empty
        console.log('ℹ️ Recent activities endpoint not available');
        this.recentActivities = [];
      }
    });
  }

  getActivityIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'user': '👤',
      'course': '📚',
      'ai-rule': '🤖',
      'ai-recommendation': '💡',
      'coming-soon': '🚀'
    };
    return icons[type] || '📋';
  }

  getActivityColor(type: string): string {
    const colors: { [key: string]: string } = {
      'user': '#3b82f6',
      'course': '#8b5cf6',
      'ai-rule': '#06b6d4',
      'ai-recommendation': '#10b981',
      'coming-soon': '#f59e0b'
    };
    return colors[type] || '#6b7280';
  }

  formatTime(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }
}
