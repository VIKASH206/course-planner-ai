import { Injectable, signal } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { BackendApiService } from './backend-api.service';
import { AuthService } from './auth-backend.service';

@Injectable({
  providedIn: 'root'
})
export class GamificationService {
  // Reactive state for gamification
  private _leaderboard = signal<any[]>([]);
  private _userRank = signal<any | null>(null);
  private _userPoints = signal<number>(0);
  private _userLevel = signal<number>(1);
  private _achievements = signal<any[]>([]);
  private _isLoading = signal<boolean>(false);

  // Public readonly signals
  leaderboard = this._leaderboard.asReadonly();
  userRank = this._userRank.asReadonly();
  userPoints = this._userPoints.asReadonly();
  userLevel = this._userLevel.asReadonly();
  achievements = this._achievements.asReadonly();
  isLoading = this._isLoading.asReadonly();

  constructor(
    private backendApi: BackendApiService,
    private authService: AuthService
  ) {}

  /**
   * Get gamification leaderboard
   */
  getLeaderboard(): Observable<any[]> {
    this._isLoading.set(true);

    return this.backendApi.getGamificationLeaderboard().pipe(
      map(response => {
        if (response.success) {
          const leaderboard = response.data;
          this._leaderboard.set(leaderboard);
          return leaderboard;
        } else {
          throw new Error(response.message);
        }
      }),
      catchError(error => {
        console.error('Failed to get leaderboard:', error);
        return throwError(() => error);
      }),
      tap(() => this._isLoading.set(false))
    );
  }

  /**
   * Get user's rank and gamification stats
   */
  getUserRank(userId?: string): Observable<any> {
    const currentUserId = userId || this.authService.getCurrentUserId();
    if (!currentUserId) {
      return throwError(() => new Error('No user logged in'));
    }

    return this.backendApi.getUserRank(currentUserId).pipe(
      map(response => {
        if (response.success) {
          const userRank = response.data;
          this._userRank.set(userRank);
          
          // Update local state with user's gamification info
          if (userRank) {
            this._userPoints.set(userRank.points || 0);
            this._userLevel.set(userRank.level || 1);
          }
          
          return userRank;
        } else {
          throw new Error(response.message);
        }
      }),
      catchError(error => {
        console.error('Failed to get user rank:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Refresh all gamification data
   */
  refreshGamificationData(userId?: string): Observable<void> {
    const currentUserId = userId || this.authService.getCurrentUserId();
    if (!currentUserId) {
      return throwError(() => new Error('No user logged in'));
    }

    this._isLoading.set(true);

    return new Observable<void>(subscriber => {
      Promise.all([
        this.getLeaderboard().toPromise(),
        this.getUserRank(currentUserId).toPromise()
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
   * Calculate level from points
   */
  calculateLevel(points: number): number {
    // Level calculation: every 100 points = 1 level
    return Math.floor(points / 100) + 1;
  }

  /**
   * Calculate points needed for next level
   */
  getPointsToNextLevel(currentPoints: number): { needed: number; total: number; percentage: number } {
    const currentLevel = this.calculateLevel(currentPoints);
    const pointsForCurrentLevel = (currentLevel - 1) * 100;
    const pointsForNextLevel = currentLevel * 100;
    const pointsInCurrentLevel = currentPoints - pointsForCurrentLevel;
    
    return {
      needed: pointsForNextLevel - currentPoints,
      total: 100, // Points needed per level
      percentage: Math.round((pointsInCurrentLevel / 100) * 100)
    };
  }

  /**
   * Get achievement progress
   */
  getAchievementProgress(): any[] {
    const userRank = this._userRank();
    const currentUser = this.authService.currentUser();
    
    if (!userRank || !currentUser) {
      return this.getDefaultAchievements();
    }

    // Mock achievement data based on user stats
    const achievements = [
      {
        id: 'first-task',
        name: 'First Steps',
        description: 'Complete your first task',
        icon: '🎯',
        completed: (currentUser.completedTasks || 0) >= 1,
        progress: Math.min((currentUser.completedTasks || 0), 1),
        total: 1
      },
      {
        id: 'task-master',
        name: 'Task Master',
        description: 'Complete 10 tasks',
        icon: '✅',
        completed: (currentUser.completedTasks || 0) >= 10,
        progress: Math.min((currentUser.completedTasks || 0), 10),
        total: 10
      },
      {
        id: 'streak-starter',
        name: 'Streak Starter',
        description: 'Maintain a 7-day study streak',
        icon: '🔥',
        completed: false, // Would need streak data from analytics
        progress: 0,
        total: 7
      },
      {
        id: 'course-explorer',
        name: 'Course Explorer',
        description: 'Complete 3 courses',
        icon: '📚',
        completed: (currentUser.completedCourses || 0) >= 3,
        progress: Math.min((currentUser.completedCourses || 0), 3),
        total: 3
      },
      {
        id: 'point-collector',
        name: 'Point Collector',
        description: 'Earn 500 points',
        icon: '⭐',
        completed: (userRank.points || 0) >= 500,
        progress: Math.min((userRank.points || 0), 500),
        total: 500
      },
      {
        id: 'level-up',
        name: 'Level Up',
        description: 'Reach level 5',
        icon: '🆙',
        completed: (userRank.level || 1) >= 5,
        progress: Math.min((userRank.level || 1), 5),
        total: 5
      }
    ];

    this._achievements.set(achievements);
    return achievements;
  }

  /**
   * Get default achievements when no user data is available
   */
  private getDefaultAchievements(): any[] {
    return [
      {
        id: 'first-task',
        name: 'First Steps',
        description: 'Complete your first task',
        icon: '🎯',
        completed: false,
        progress: 0,
        total: 1
      },
      {
        id: 'task-master',
        name: 'Task Master',
        description: 'Complete 10 tasks',
        icon: '✅',
        completed: false,
        progress: 0,
        total: 10
      },
      {
        id: 'streak-starter',
        name: 'Streak Starter',
        description: 'Maintain a 7-day study streak',
        icon: '🔥',
        completed: false,
        progress: 0,
        total: 7
      },
      {
        id: 'course-explorer',
        name: 'Course Explorer',
        description: 'Enroll in 3 courses',
        icon: '📚',
        completed: false,
        progress: 0,
        total: 3
      },
      {
        id: 'point-collector',
        name: 'Point Collector',
        description: 'Earn 500 points',
        icon: '⭐',
        completed: false,
        progress: 0,
        total: 500
      },
      {
        id: 'level-up',
        name: 'Level Up',
        description: 'Reach level 5',
        icon: '🆙',
        completed: false,
        progress: 0,
        total: 5
      }
    ];
  }

  /**
   * Get user's position in leaderboard
   */
  getUserPosition(): number {
    const leaderboard = this._leaderboard();
    const currentUserId = this.authService.getCurrentUserId();
    
    if (!currentUserId || leaderboard.length === 0) {
      return 0;
    }

    const userIndex = leaderboard.findIndex(user => user.id === currentUserId);
    return userIndex >= 0 ? userIndex + 1 : 0;
  }

  /**
   * Get gamification stats summary
   */
  getGamificationStats(): { 
    level: number; 
    points: number; 
    rank: number; 
    nextLevelProgress: number;
    achievementsCompleted: number;
    totalAchievements: number;
  } {
    const userRank = this._userRank();
    const achievements = this.getAchievementProgress();
    const level = userRank?.level || 1;
    const points = userRank?.points || 0;
    const rank = this.getUserPosition();
    const nextLevelInfo = this.getPointsToNextLevel(points);
    const completedAchievements = achievements.filter(a => a.completed).length;

    return {
      level,
      points,
      rank,
      nextLevelProgress: nextLevelInfo.percentage,
      achievementsCompleted: completedAchievements,
      totalAchievements: achievements.length
    };
  }

  /**
   * Get motivational messages based on user progress
   */
  getMotivationalMessages(): string[] {
    const stats = this.getGamificationStats();
    const messages: string[] = [];

    // Level-based messages
    if (stats.level >= 10) {
      messages.push('🏆 You\'re a learning champion! Keep reaching for the stars!');
    } else if (stats.level >= 5) {
      messages.push('🚀 Great progress! You\'re becoming a study expert!');
    } else if (stats.level >= 2) {
      messages.push('📈 Nice work! You\'re building momentum!');
    } else {
      messages.push('🌱 Every expert was once a beginner. You\'ve got this!');
    }

    // Achievement-based messages
    if (stats.achievementsCompleted === stats.totalAchievements) {
      messages.push('🎖️ Achievement master! You\'ve completed all achievements!');
    } else if (stats.achievementsCompleted >= stats.totalAchievements * 0.8) {
      messages.push('🏅 Almost there! Just a few more achievements to go!');
    } else if (stats.achievementsCompleted >= stats.totalAchievements * 0.5) {
      messages.push('⭐ Halfway through your achievements! Keep it up!');
    }

    // Rank-based messages
    if (stats.rank <= 3 && stats.rank > 0) {
      messages.push('👑 You\'re in the top 3! Incredible dedication!');
    } else if (stats.rank <= 10 && stats.rank > 0) {
      messages.push('🥇 Top 10! Your hard work is paying off!');
    }

    // Next level progress
    if (stats.nextLevelProgress >= 80) {
      messages.push('🔥 So close to leveling up! Push through!');
    }

    return messages.slice(0, 2); // Return top 2 messages
  }

  /**
   * Get leaderboard position info
   */
  getLeaderboardInfo(): { 
    userPosition: number; 
    totalUsers: number; 
    percentile: number;
    topUsers: any[];
  } {
    const leaderboard = this._leaderboard();
    const userPosition = this.getUserPosition();
    const totalUsers = leaderboard.length;
    const percentile = totalUsers > 0 ? Math.round(((totalUsers - userPosition + 1) / totalUsers) * 100) : 0;
    const topUsers = leaderboard.slice(0, 5); // Top 5 users

    return {
      userPosition,
      totalUsers,
      percentile,
      topUsers
    };
  }

  /**
   * Reset gamification state (useful for logout)
   */
  resetState(): void {
    this._leaderboard.set([]);
    this._userRank.set(null);
    this._userPoints.set(0);
    this._userLevel.set(1);
    this._achievements.set([]);
    this._isLoading.set(false);
  }
}