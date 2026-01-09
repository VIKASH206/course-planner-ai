import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { environment } from '../../../environments/environment';

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
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.scss']
})
export class AnalyticsComponent implements OnInit {
  userAnalytics: UserAnalytics | null = null;
  interestAnalytics: InterestAnalytics | null = null;
  goalAnalytics: GoalAnalytics | null = null;
  recommendationAnalytics: RecommendationAnalytics | null = null;
  systemHealth: SystemHealth | null = null;
  loading = false;
  error: string | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadAnalytics();
  }

  loadAnalytics(): void {
    this.loading = true;
    this.error = null;

    const apiUrl = environment.apiUrl || 'http://localhost:8080/api';
    
    // Get userId from localStorage (using the correct key)
    const userStr = localStorage.getItem('course-planner-user');
    if (!userStr) {
      this.error = 'User not found. Please login again.';
      this.loading = false;
      return;
    }
    
    try {
      const user = JSON.parse(userStr);
      const userId = user.id;
      
      if (!userId) {
        this.error = 'Invalid user data. Please login again.';
        this.loading = false;
        return;
      }
      
      // Use student analytics endpoint with userId
      const url = `${apiUrl}/users/analytics/${userId}`;
      
      console.log('Loading student analytics from:', url);
      console.log('User ID:', userId);

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
            console.log('Analytics data loaded successfully:', {
              users: this.userAnalytics,
              interests: this.interestAnalytics,
              goals: this.goalAnalytics,
              recommendations: this.recommendationAnalytics
            });
          } else {
            console.warn('API response success is false or no data:', response);
            this.error = response.message || 'No data available';
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Failed to load analytics:', error);
          console.error('Error details:', {
            status: error.status,
            statusText: error.statusText,
            message: error.message,
            error: error.error
          });
          this.error = `Failed to load analytics data: ${error.status} ${error.statusText}`;
          this.loading = false;
        }
      });
    } catch (error) {
      console.error('Error parsing user data:', error);
      this.error = 'Invalid user data. Please login again.';
      this.loading = false;
    }
  }

  getOnboardingRate(): number {
    if (!this.userAnalytics || this.userAnalytics.totalUsers === 0) {
      return 0;
    }
    return Math.round((this.userAnalytics.onboardedUsers / this.userAnalytics.totalUsers) * 100);
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
