import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatListModule } from '@angular/material/list';
import { ApiService } from '../../core/services/api.service';
import { NotificationService } from '../../core/services/notification.service';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  rarity: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'legendary';
  category: string;
  xpReward: number;
  requirements: string;
  earnedDate?: Date;
  isEarned: boolean;
  progress?: number;
  maxProgress?: number;
}

interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  avatar?: string;
  level: number;
  xp: number;
  badges: number;
  streak: number;
  hoursStudied: number;
  isCurrentUser?: boolean;
}

interface Quest {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly' | 'special';
  category: string;
  progress: number;
  maxProgress: number;
  xpReward: number;
  badgeReward?: Badge;
  deadline?: Date;
  isCompleted: boolean;
  difficulty: 'easy' | 'medium' | 'hard' | 'epic';
}

interface Reward {
  id: string;
  name: string;
  description: string;
  type: 'xp_boost' | 'badge' | 'theme' | 'avatar' | 'feature_unlock';
  cost: number;
  icon: string;
  isUnlocked: boolean;
  isPurchased: boolean;
}

@Component({
  selector: 'app-gamification',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatProgressBarModule,
    MatChipsModule,
    MatTooltipModule,
    MatBadgeModule,
    MatDividerModule,
    MatMenuModule,
    MatSnackBarModule,
    MatListModule
  ],
  templateUrl: './gamification.component.html',
  styleUrls: ['./gamification.component.scss']
})
export class GamificationComponent implements OnInit {
  private apiService = inject(ApiService);
  private snackBar = inject(MatSnackBar);
  private notificationService = inject(NotificationService);

  // Tab selection
  selectedTab = signal<string>('badges');

  // Current user stats
  currentUser = signal({
    name: '',
    level: 1,
    xp: 0,
    xpToNextLevel: 500
  });

  userStats = signal({
    totalBadges: 0,
    currentStreak: 0,
    globalRank: 0,
    studyHours: 0
  });

  // All badges with progress
  allBadges = signal<Badge[]>([]);

  // Leaderboard data
  leaderboard = signal<LeaderboardEntry[]>([]);

  // Active quests
  activeQuests = signal<Quest[]>([]);

  // Available rewards
  availableRewards = signal<Reward[]>([]);

  // Computed properties
  earnedBadges = computed(() => this.allBadges().filter(badge => badge.isEarned));
  topThree = computed(() => this.leaderboard().slice(0, 3));

  ngOnInit() {
    this.initializeAndLoadData();
  }

  private initializeAndLoadData() {
    // First, initialize default gamification data if needed
    this.apiService.initializeGamificationData().subscribe({
      next: () => {
        console.log('Gamification data initialized successfully');
        // Now load all gamification data
        this.loadGamificationData();
      },
      error: (error: any) => {
        console.warn('Error initializing gamification data (may already be initialized):', error);
        // Even if initialization fails, try to load data (it may already exist)
        this.loadGamificationData();
      }
    });
  }

  private loadGamificationData() {
    // Load user stats first
    console.log('🎮 Loading gamification data...');
    console.log('🔑 Current user ID:', this.apiService['authService'].getCurrentUserId());
    
    this.apiService.getUserGamificationStats().subscribe({
      next: (response: any) => {
        console.log('✅ Gamification stats response:', response);
        const stats = response.data;
        if (stats) {
          this.currentUser.set({
            name: stats.name || 'User',
            level: stats.level || 1,
            xp: stats.xp || 0,
            xpToNextLevel: stats.xpToNextLevel || 500
          });
          
          this.userStats.set({
            totalBadges: stats.badges || 0,
            currentStreak: stats.streak || 0,
            globalRank: typeof stats.rank === 'number' ? stats.rank : 0,
            studyHours: stats.hoursStudied || 0
          });
          console.log('📊 User stats updated:', this.userStats());
        }
      },
      error: (error: any) => {
        console.error('❌ Error loading user stats:', error);
        // Set default empty values - no dummy data
        this.currentUser.set({
          name: 'User',
          level: 1,
          xp: 0,
          xpToNextLevel: 500
        });
        
        this.userStats.set({
          totalBadges: 0,
          currentStreak: 0,
          globalRank: 0,
          studyHours: 0
        });
      }
    });

    // Load badges with progress
    this.apiService.getUserBadges().subscribe({
      next: (response: any) => {
        this.allBadges.set(response.data || []);
        if (!response.data || response.data.length === 0) {
          console.log('No badges available yet');
        }
      },
      error: (error: any) => {
        console.error('Error loading badges:', error);
        // No dummy data - keep empty
        this.allBadges.set([]);
      }
    });

    // Load leaderboard
    this.apiService.getLeaderboard(50).subscribe({
      next: (response: any) => {
        this.leaderboard.set(response.data || []);
        if (!response.data || response.data.length === 0) {
          console.log('No leaderboard data available yet');
        }
      },
      error: (error: any) => {
        console.error('Error loading leaderboard:', error);
        // No dummy data - keep empty
        this.leaderboard.set([]);
      }
    });

    // Load active quests
    this.apiService.getUserQuests().subscribe({
      next: (response: any) => {
        this.activeQuests.set(response.data || []);
        if (!response.data || response.data.length === 0) {
          console.log('No active quests available yet');
        }
      },
      error: (error: any) => {
        console.error('Error loading quests:', error);
        this.activeQuests.set([]);
      }
    });

    // Load available rewards
    this.apiService.getAvailableRewards().subscribe({
      next: (response: any) => {
        this.availableRewards.set(response.data || []);
        if (!response.data || response.data.length === 0) {
          console.log('No rewards available yet');
        }
      },
      error: (error: any) => {
        console.error('Error loading rewards:', error);
        this.availableRewards.set([]);
      }
    });

    // Update daily streak
    this.apiService.updateStreak().subscribe({
      next: (response: any) => {
        const streakData = response.data;
        if (streakData && streakData.updated) {
          this.userStats.update(stats => ({
            ...stats,
            currentStreak: streakData.currentStreak
          }));
          
          if (streakData.bonusXP > 0) {
            this.notificationService.showSuccess(
              `🔥 Streak milestone! +${streakData.bonusXP} XP bonus!`,
              3000
            );
          }
        }
      },
      error: (error: any) => {
        console.error('Error updating streak:', error);
      }
    });
  }

  getLevelProgress(): number {
    const user = this.currentUser();
    const currentLevelXP = (user.level - 1) * 500; // Calculate based on level
    const nextLevelXP = user.level * 500;
    return ((user.xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;
  }

  getXPToNextLevel(): number {
    return this.currentUser().xpToNextLevel;
  }

  getBadgeBackground(rarity: string): string {
    const colors = {
      'bronze': 'linear-gradient(135deg, #cd7f32, #b8860b)',
      'silver': 'linear-gradient(135deg, #c0c0c0, #a9a9a9)',
      'gold': 'linear-gradient(135deg, #ffd700, #ffb347)',
      'platinum': 'linear-gradient(135deg, #e5e4e2, #b8b8b8)',
      'diamond': 'linear-gradient(135deg, #b9f2ff, #89cff0)',
      'legendary': 'linear-gradient(135deg, #ff6b6b, #ff8e53, #ff6b95, #c44569)'
    };
    return colors[rarity as keyof typeof colors] || colors.bronze;
  }

  getPodiumHeight(rank: number): string {
    const heights = { 1: '120px', 2: '100px', 3: '80px' };
    return heights[rank as keyof typeof heights] || '60px';
  }

  getPodiumColor(rank: number): string {
    const colors = {
      1: 'linear-gradient(135deg, #ffd700, #ffb347)',
      2: 'linear-gradient(135deg, #c0c0c0, #a9a9a9)',
      3: 'linear-gradient(135deg, #cd7f32, #b8860b)'
    };
    return colors[rank as keyof typeof colors] || 'linear-gradient(135deg, #6b7280, #4b5563)';
  }

  getRankBadgeClass(rank: number): string {
    if (rank <= 3) return 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white';
    if (rank <= 10) return 'bg-gradient-to-r from-purple-400 to-indigo-500 text-white';
    return 'bg-gray-200 text-gray-700';
  }

  getRankClass(rank: number): string {
    if (rank === 1) return 'bg-yellow-500 text-white';
    if (rank === 2) return 'bg-gray-400 text-white';
    if (rank === 3) return 'bg-orange-600 text-white';
    return 'bg-gray-200 text-gray-700';
  }

  getQuestBorderClass(type: string): string {
    const classes = {
      'daily': 'border-blue-500 bg-blue-50',
      'weekly': 'border-purple-500 bg-purple-50',
      'monthly': 'border-green-500 bg-green-50',
      'special': 'border-pink-500 bg-pink-50'
    };
    return classes[type as keyof typeof classes] || 'border-gray-500 bg-white';
  }

  getDifficultyClass(difficulty: string): string {
    const classes = {
      'easy': 'bg-green-100 text-green-700',
      'medium': 'bg-yellow-100 text-yellow-700',
      'hard': 'bg-orange-100 text-orange-700',
      'epic': 'bg-red-100 text-red-700'
    };
    return classes[difficulty as keyof typeof classes] || 'bg-gray-100 text-gray-700';
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  viewBadgeDetails(badge: Badge) {
    this.notificationService.showInfo(`Viewing details for ${badge.name}`, 2000);
  }

  startQuest(quest: Quest) {
    this.notificationService.showInfo(`Started quest: ${quest.title}`, 2000);
  }

  canPurchase(reward: Reward): boolean {
    return this.currentUser().xp >= reward.cost && reward.isUnlocked && !reward.isPurchased;
  }

  purchaseReward(reward: Reward) {
    if (this.canPurchase(reward)) {
      // Purchase reward via API
      this.apiService.purchaseReward(reward.id).subscribe({
        next: (response: any) => {
          const result = response.data;
          if (result && result.success) {
            // Update local state
            this.currentUser.update(user => ({
              ...user,
              xp: result.remainingXP
            }));
            
            // Mark reward as purchased
            this.availableRewards.update(rewards => 
              rewards.map(r => r.id === reward.id ? { ...r, isPurchased: true } : r)
            );
            
            this.notificationService.showSuccess(
              `🎁 Successfully purchased ${result.rewardName}!`,
              3000
            );
          }
        },
        error: (error: any) => {
          console.error('Error purchasing reward:', error);
          this.notificationService.showError(
            error.error?.message || 'Failed to purchase reward'
          );
        }
      });
    }
  }

  getUnlockLevel(reward: Reward): number {
    // Calculate unlock level based on reward cost
    return Math.floor(reward.cost / 200) + 1;
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  }
}
