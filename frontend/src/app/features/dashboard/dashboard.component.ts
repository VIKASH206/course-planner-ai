import { Component, OnInit, signal, computed, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';
import { MatListModule } from '@angular/material/list';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';
import { ApiService, Course, Task, User } from '../../core/services/api.service';
import { AuthService, AuthUser } from '../../core/services/auth-backend.service';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

interface DashboardStats {
  totalCourses: number;
  completedCourses: number;
  activeTasks: number;
  completedTasks: number;
  studyStreakDays: number;
  totalStudyHours: number;
  xpPoints: number;
  currentLevel: number;
}

interface RecentActivity {
  id: string;
  type: 'course_started' | 'task_completed' | 'lesson_finished' | 'achievement_earned';
  title: string;
  description: string;
  timestamp: Date;
  icon: string;
  color: string;
}

interface QuickAction {
  label: string;
  icon: string;
  route: string;
  color: string;
  description: string;
}

interface AIRecommendation {
  id: string;
  type: 'course' | 'task' | 'study_plan';
  title: string;
  description: string;
  confidence: number;
  actionText: string;
  actionRoute?: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatChipsModule,
    MatBadgeModule,
    MatMenuModule,
    MatDividerModule,
    MatTooltipModule,
    MatTabsModule,
    MatListModule,
    MatGridListModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  private apiService = inject(ApiService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private routerSubscription?: Subscription;
  
  // Signals for reactive state
  isLoading = signal(false);
  currentUser = signal<AuthUser | null>(null);
  dashboardStats = signal<DashboardStats>({
    totalCourses: 0,
    completedCourses: 0,
    activeTasks: 0,
    completedTasks: 0,
    studyStreakDays: 0,
    totalStudyHours: 0,
    xpPoints: 0,
    currentLevel: 1
  });
  
  recentCourses = signal<Course[]>([]);
  upcomingTasks = signal<Task[]>([]);
  recentActivities = signal<RecentActivity[]>([]);
  aiRecommendations = signal<AIRecommendation[]>([]);
  
  // Computed values
  completionRate = computed(() => {
    const stats = this.dashboardStats();
    return stats.totalCourses > 0 ? (stats.completedCourses / stats.totalCourses) * 100 : 0;
  });
  
  taskCompletionRate = computed(() => {
    const stats = this.dashboardStats();
    const totalTasks = stats.activeTasks + stats.completedTasks;
    return totalTasks > 0 ? (stats.completedTasks / totalTasks) * 100 : 0;
  });
  
  nextLevelProgress = computed(() => {
    const stats = this.dashboardStats();
    const currentLevel = stats.currentLevel;
    const xpForCurrentLevel = (currentLevel - 1) * 1000;
    const xpForNextLevel = currentLevel * 1000;
    const currentXP = stats.xpPoints - xpForCurrentLevel;
    const xpNeeded = xpForNextLevel - xpForCurrentLevel;
    return Math.max(0, Math.min(100, (currentXP / xpNeeded) * 100));
  });
  
  // Quick actions
  quickActions: QuickAction[] = [
    {
      label: 'Browse Courses',
      icon: 'school',
      route: '/courses',
      color: 'primary',
      description: 'Explore new courses'
    },
    {
      label: 'View Tasks',
      icon: 'task_alt',
      route: '/tasks',
      color: 'accent',
      description: 'Manage your tasks'
    },
    {
      label: 'AI Chat',
      icon: 'smart_toy',
      route: '/chat',
      color: 'warn',
      description: 'Get AI assistance'
    },
    {
      label: 'Analytics',
      icon: 'analytics',
      route: '/analytics',
      color: 'primary',
      description: 'View detailed analytics'
    }
  ];
  
  ngOnInit() {
    // DOUBLE SAFETY CHECK: Verify user role on component load
    const storedRole = localStorage.getItem('userRole');
    const currentUser = this.authService.currentUser();
    const userRole = storedRole || currentUser?.role;
    
    console.log('Student Dashboard ngOnInit - Role check:', {
      storedRole,
      userRole,
      isLoggedIn: this.authService.isLoggedIn()
    });
    
    // If user is ADMIN, immediately redirect to admin dashboard
    if (userRole === 'ADMIN') {
      console.warn('⚠️ ADMIN user detected in Student Dashboard! Redirecting to /admin/dashboard');
      this.router.navigate(['/admin/dashboard'], { replaceUrl: true });
      return;
    }
    
    // If user is not STUDENT and not logged in, redirect to login
    if (!userRole || !this.authService.isLoggedIn()) {
      console.warn('⚠️ No valid user found in Student Dashboard! Redirecting to login');
      this.router.navigate(['/auth/login']);
      return;
    }
    
    // Set current user from auth service
    this.currentUser.set(this.authService.currentUser());
    this.loadDashboardData();
    
    // Subscribe to route changes to refresh data when navigating back to dashboard
    this.routerSubscription = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      if (event.url === '/dashboard' || event.urlAfterRedirects === '/dashboard') {
        console.log('Dashboard route activated, refreshing data...');
        this.loadDashboardData();
      }
    });
  }
  
  ngOnDestroy() {
    // Clean up subscription
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }
  
  private async loadDashboardData() {
    this.isLoading.set(true);
    
    try {
      await this.loadRealData();
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      // Set empty states when API fails
      this.currentUser.set(null);
      this.dashboardStats.set({
        totalCourses: 0,
        completedCourses: 0,
        activeTasks: 0,
        completedTasks: 0,
        studyStreakDays: 0,
        totalStudyHours: 0,
        xpPoints: 0,
        currentLevel: 1
      });
      this.recentCourses.set([]);
      this.upcomingTasks.set([]);
    } finally {
      this.isLoading.set(false);
    }
  }
  
  private async loadRealData() {
    // Get current user from auth service (already authenticated)
    const authUser = this.authService.currentUser();
    if (authUser) {
      this.currentUser.set(authUser);
    }

    try {
      // Load dashboard stats from API
      const statsResponse = await this.apiService.getDashboardStats().toPromise();
      console.log('Dashboard stats response:', statsResponse);
      if (statsResponse?.data) {
        console.log('Setting dashboard stats:', statsResponse.data);
        this.dashboardStats.set(statsResponse.data);
      }
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
      this.dashboardStats.set({
        totalCourses: 0,
        completedCourses: 0,
        activeTasks: 0,
        completedTasks: 0,
        studyStreakDays: 0,
        totalStudyHours: 0,
        xpPoints: 0,
        currentLevel: 1
      });
    }

    try {
      // Load recent courses
      const coursesResponse = await this.apiService.getCourses().toPromise();
      if (coursesResponse?.data) {
        // Handle both array and paginated response
        const courses = Array.isArray(coursesResponse.data) 
          ? coursesResponse.data 
          : ((coursesResponse.data as any).content || []);
        this.recentCourses.set(courses.slice(0, 5));
      }
    } catch (error) {
      console.error('Error loading courses:', error);
      this.recentCourses.set([]);
    }

    try {
      // Load upcoming tasks
      const tasksResponse = await this.apiService.getTasks().toPromise();
      if (tasksResponse?.data) {
        const upcomingTasks = tasksResponse.data
          .filter((task: any) => task.status !== 'COMPLETED')
          .slice(0, 5);
        this.upcomingTasks.set(upcomingTasks);
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
      this.upcomingTasks.set([]);
    }
  }
  
  getPriorityColor(priority: string): string {
    switch (priority) {
      case 'High': return 'warn';
      case 'Medium': return 'accent';
      case 'Low': return 'primary';
      default: return 'primary';
    }
  }
  
  getDifficultyColor(difficulty: string): string {
    switch (difficulty) {
      case 'Advanced': return 'warn';
      case 'Intermediate': return 'accent';
      case 'Beginner': return 'primary';
      default: return 'primary';
    }
  }
  
  refreshDashboard() {
    this.loadDashboardData();
  }

  logout() {
    console.log('🚨 Dashboard logout button clicked - using nuclear logout');
    
    // Use the same nuclear logout function that works from console
    try {
      // Clear all storage
      localStorage.clear();
      sessionStorage.clear();
      
      // Clear cookies
      document.cookie.split(";").forEach(function(c) { 
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
      });
      
      // Clear cache if supported
      if ('caches' in window) {
        (window as any).caches.keys().then(function(names: string[]) {
          names.forEach(function(name) {
            (window as any).caches.delete(name);
          });
        });
      }
      
      console.log('☢️ Nuclear logout from dashboard - everything cleared');
      console.log('🔄 Redirecting to login...');
      
      // Force redirect with page reload (use relative path for deployed site)
      window.location.href = '/auth/login';
      
    } catch (error) {
      console.error('❌ Logout error:', error);
      // Fallback - use window nuclear logout if available
      if ((window as any).nuclearLogout) {
        (window as any).nuclearLogout();
      }
    }
  }

  // Get current user from auth service
  getCurrentUser() {
    return this.authService.currentUser();
  }
}