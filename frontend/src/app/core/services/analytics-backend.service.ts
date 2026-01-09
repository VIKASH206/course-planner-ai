import { Injectable, signal } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { BackendApiService, Analytics } from './backend-api.service';
import { AuthService } from './auth-backend.service';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  // Reactive state for analytics
  private _todayAnalytics = signal<Analytics | null>(null);
  private _weeklyAnalytics = signal<Analytics[] | null>(null);
  private _monthlyAnalytics = signal<Analytics[] | null>(null);
  private _summaryAnalytics = signal<any | null>(null);
  private _detailedAnalytics = signal<any | null>(null);
  private _streakDays = signal<number>(0);
  private _isLoading = signal<boolean>(false);

  // Public readonly signals
  todayAnalytics = this._todayAnalytics.asReadonly();
  weeklyAnalytics = this._weeklyAnalytics.asReadonly();
  monthlyAnalytics = this._monthlyAnalytics.asReadonly();
  summaryAnalytics = this._summaryAnalytics.asReadonly();
  detailedAnalytics = this._detailedAnalytics.asReadonly();
  streakDays = this._streakDays.asReadonly();
  isLoading = this._isLoading.asReadonly();

  constructor(
    private backendApi: BackendApiService,
    private authService: AuthService
  ) {}

  /**
   * Get today's analytics for a user
   */
  getTodayAnalytics(userId?: string): Observable<Analytics> {
    const currentUserId = userId || this.authService.getCurrentUserId();
    if (!currentUserId) {
      return throwError(() => new Error('No user logged in'));
    }

    this._isLoading.set(true);

    return this.backendApi.getTodayAnalytics(currentUserId).pipe(
      map(response => {
        if (response.success) {
          const analytics = response.data;
          this._todayAnalytics.set(analytics);
          return analytics;
        } else {
          throw new Error(response.message);
        }
      }),
      catchError(error => {
        console.error('Failed to get today analytics:', error);
        return throwError(() => error);
      }),
      tap(() => this._isLoading.set(false))
    );
  }

  /**
   * Get weekly analytics for a user
   */
  getWeeklyAnalytics(userId?: string): Observable<Analytics[]> {
    const currentUserId = userId || this.authService.getCurrentUserId();
    if (!currentUserId) {
      return throwError(() => new Error('No user logged in'));
    }

    this._isLoading.set(true);

    return this.backendApi.getWeeklyAnalytics(currentUserId).pipe(
      map(response => {
        if (response.success) {
          const analytics = response.data;
          this._weeklyAnalytics.set(analytics);
          return analytics;
        } else {
          throw new Error(response.message);
        }
      }),
      catchError(error => {
        console.error('Failed to get weekly analytics:', error);
        return throwError(() => error);
      }),
      tap(() => this._isLoading.set(false))
    );
  }

  /**
   * Get monthly analytics for a user
   */
  getMonthlyAnalytics(userId?: string): Observable<Analytics[]> {
    const currentUserId = userId || this.authService.getCurrentUserId();
    if (!currentUserId) {
      return throwError(() => new Error('No user logged in'));
    }

    this._isLoading.set(true);

    return this.backendApi.getMonthlyAnalytics(currentUserId).pipe(
      map(response => {
        if (response.success) {
          const analytics = response.data;
          this._monthlyAnalytics.set(analytics);
          return analytics;
        } else {
          throw new Error(response.message);
        }
      }),
      catchError(error => {
        console.error('Failed to get monthly analytics:', error);
        return throwError(() => error);
      }),
      tap(() => this._isLoading.set(false))
    );
  }

  /**
   * Get analytics summary
   */
  getAnalyticsSummary(userId?: string): Observable<any> {
    const currentUserId = userId || this.authService.getCurrentUserId();
    if (!currentUserId) {
      return throwError(() => new Error('No user logged in'));
    }

    return this.backendApi.getProgressSummary(currentUserId).pipe(
      map(response => {
        if (response.success) {
          const summary = response.data;
          this._summaryAnalytics.set(summary);
          return summary;
        } else {
          throw new Error(response.message);
        }
      }),
      catchError(error => {
        console.error('Failed to get analytics summary:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get detailed analytics
   */
  getDetailedAnalytics(userId?: string): Observable<any> {
    const currentUserId = userId || this.authService.getCurrentUserId();
    if (!currentUserId) {
      return throwError(() => new Error('No user logged in'));
    }

    return this.backendApi.getDetailedAnalytics(currentUserId).pipe(
      map(response => {
        if (response.success) {
          const detailed = response.data;
          this._detailedAnalytics.set(detailed);
          return detailed;
        } else {
          throw new Error(response.message);
        }
      }),
      catchError(error => {
        console.error('Failed to get detailed analytics:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get weak and strong areas analysis
   */
  getAreasAnalysis(userId?: string): Observable<any> {
    const currentUserId = userId || this.authService.getCurrentUserId();
    if (!currentUserId) {
      return throwError(() => new Error('No user logged in'));
    }

    return this.backendApi.getAreasAnalysis(currentUserId).pipe(
      map(response => {
        if (response.success) {
          return response.data;
        } else {
          throw new Error(response.message);
        }
      }),
      catchError(error => {
        console.error('Failed to get areas analysis:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get current streak
   */
  getCurrentStreak(userId?: string): Observable<number> {
    const currentUserId = userId || this.authService.getCurrentUserId();
    if (!currentUserId) {
      return throwError(() => new Error('No user logged in'));
    }

    return this.backendApi.getUserStreak(currentUserId).pipe(
      map(response => {
        if (response.success) {
          const streak = response.data;
          this._streakDays.set(streak);
          return streak;
        } else {
          throw new Error(response.message);
        }
      }),
      catchError(error => {
        console.error('Failed to get current streak:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Refresh all analytics data
   */
  refreshAnalytics(userId?: string): Observable<void> {
    const currentUserId = userId || this.authService.getCurrentUserId();
    if (!currentUserId) {
      return throwError(() => new Error('No user logged in'));
    }

    this._isLoading.set(true);

    return new Observable<void>(subscriber => {
      Promise.all([
        this.getTodayAnalytics(currentUserId).toPromise(),
        this.getWeeklyAnalytics(currentUserId).toPromise(),
        this.getMonthlyAnalytics(currentUserId).toPromise(),
        this.getAnalyticsSummary(currentUserId).toPromise(),
        this.getCurrentStreak(currentUserId).toPromise()
      ]).then(() => {
        this._isLoading.set(false);
        subscriber.next();
        subscriber.complete();
      }).catch(error => {
        this._isLoading.set(false);
        subscriber.error(error);
      });
    });
  }

  /**
   * Calculate completion rate for today
   */
  getTodayCompletionRate(): number {
    const today = this._todayAnalytics();
    if (!today) return 0;
    
    const total = today.totalTasksToday;
    if (total === 0) return 0;
    
    return Math.round((today.completedTasksToday / total) * 100);
  }

  /**
   * Get productivity trend (comparing current period with previous)
   */
  getProductivityTrend(): { trend: 'up' | 'down' | 'stable'; percentage: number } {
    const today = this._todayAnalytics();
    const weekly = this._weeklyAnalytics();
    
    if (!today || !weekly || weekly.length === 0) {
      return { trend: 'stable', percentage: 0 };
    }

    const todayRate = this.getTodayCompletionRate();
    const weeklyRates = weekly.map(day => {
      const total = day.totalTasksToday;
      return total > 0 ? Math.round((day.completedTasksToday / total) * 100) : 0;
    });
    const weeklyAverage = Math.round(weeklyRates.reduce((sum, rate) => sum + rate, 0) / weeklyRates.length);
    
    if (todayRate > weeklyAverage + 10) {
      return { trend: 'up', percentage: todayRate - weeklyAverage };
    } else if (todayRate < weeklyAverage - 10) {
      return { trend: 'down', percentage: weeklyAverage - todayRate };
    } else {
      return { trend: 'stable', percentage: 0 };
    }
  }

  /**
   * Get study time trends
   */
  getStudyTimeTrends(): { dailyAverage: number; weeklyTotal: number; improvement: number } {
    const weekly = this._weeklyAnalytics();
    const monthly = this._monthlyAnalytics();
    
    if (!weekly || !monthly || weekly.length === 0 || monthly.length === 0) {
      return { dailyAverage: 0, weeklyTotal: 0, improvement: 0 };
    }

    const weeklyTotal = weekly.reduce((sum, day) => sum + day.studyTimeMinutes, 0);
    const dailyAverage = Math.round(weeklyTotal / 7);
    const monthlyTotal = monthly.reduce((sum, day) => sum + day.studyTimeMinutes, 0);
    const monthlyDailyAverage = Math.round(monthlyTotal / 30);
    const improvement = dailyAverage - monthlyDailyAverage;

    return {
      dailyAverage,
      weeklyTotal,
      improvement
    };
  }

  /**
   * Get engagement statistics
   */
  getEngagementStats(): { streakDays: number; totalPoints: number; averageDaily: number } {
    const today = this._todayAnalytics();
    const weekly = this._weeklyAnalytics();
    const streak = this._streakDays();
    
    if (!today || !weekly || weekly.length === 0) {
      return { streakDays: streak, totalPoints: 0, averageDaily: 0 };
    }

    const totalPoints = weekly.reduce((sum, day) => sum + day.pointsEarned, 0);
    const averageDaily = Math.round(totalPoints / 7);

    return {
      streakDays: streak,
      totalPoints,
      averageDaily
    };
  }

  /**
   * Get performance insights
   */
  getPerformanceInsights(): string[] {
    const insights: string[] = [];
    const productivity = this.getProductivityTrend();
    const studyTrends = this.getStudyTimeTrends();
    const engagement = this.getEngagementStats();
    const today = this._todayAnalytics();

    // Productivity insights
    if (productivity.trend === 'up') {
      insights.push(`Great job! Your productivity is up ${productivity.percentage}% compared to your weekly average.`);
    } else if (productivity.trend === 'down') {
      insights.push(`Your productivity is down ${productivity.percentage}%. Consider taking a break or adjusting your study plan.`);
    }

    // Study time insights
    if (studyTrends.improvement > 0) {
      insights.push(`You're studying ${studyTrends.improvement} minutes more per day than your monthly average.`);
    } else if (studyTrends.improvement < -10) {
      insights.push(`Consider increasing your daily study time. You're ${Math.abs(studyTrends.improvement)} minutes below your average.`);
    }

    // Engagement insights
    if (engagement.streakDays >= 7) {
      insights.push(`Amazing! You're on a ${engagement.streakDays}-day study streak. Keep it up!`);
    } else if (engagement.streakDays === 0) {
      insights.push('Start a new study streak today by completing at least one task.');
    }

    // Points insights
    if (today && today.pointsEarned > engagement.averageDaily) {
      insights.push(`You've earned ${today.pointsEarned} points today, above your daily average of ${engagement.averageDaily}!`);
    }

    // Course progress insights
    if (today && today.coursesWorkedOn > 3) {
      insights.push(`You're staying busy with ${today.coursesWorkedOn} different courses today. Great variety!`);
    } else if (today && today.coursesWorkedOn === 0) {
      insights.push('Consider working on at least one course today to maintain momentum.');
    }

    return insights.slice(0, 3); // Return top 3 insights
  }

  /**
   * Get analytics for chart display
   */
  getChartData(): { labels: string[]; data: number[]; type: 'completion' | 'study-time' | 'points' } {
    const weekly = this._weeklyAnalytics();
    if (!weekly || weekly.length === 0) {
      return { labels: [], data: [], type: 'completion' };
    }

    const labels = weekly.map(day => {
      const date = new Date(day.date);
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    });

    const completionData = weekly.map(day => {
      const total = day.totalTasksToday;
      return total > 0 ? Math.round((day.completedTasksToday / total) * 100) : 0;
    });

    return {
      labels,
      data: completionData,
      type: 'completion'
    };
  }

  /**
   * Get study time chart data
   */
  getStudyTimeChartData(): { labels: string[]; data: number[] } {
    const weekly = this._weeklyAnalytics();
    if (!weekly || weekly.length === 0) {
      return { labels: [], data: [] };
    }

    const labels = weekly.map(day => {
      const date = new Date(day.date);
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    });

    const data = weekly.map(day => Math.round(day.studyTimeMinutes / 60 * 10) / 10); // Convert to hours with 1 decimal

    return { labels, data };
  }

  /**
   * Reset analytics state (useful for logout)
   */
  resetState(): void {
    this._todayAnalytics.set(null);
    this._weeklyAnalytics.set(null);
    this._monthlyAnalytics.set(null);
    this._summaryAnalytics.set(null);
    this._detailedAnalytics.set(null);
    this._streakDays.set(0);
    this._isLoading.set(false);
  }
}