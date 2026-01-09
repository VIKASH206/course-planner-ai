import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../core/services/auth-backend.service';
import { NotificationService } from '../../core/services/notification.service';

interface ProfileData {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  role: string;
  bio?: string;
  profilePhoto?: string;
  coverPhoto?: string;
  level?: number;
}

interface ProfileStats {
  coursesCompleted: number;
  tasksCompleted: number;
  xpPoints: number;
  studyHours: number;
}

interface RecentActivity {
  icon: string;
  description: string;
  timestamp: Date;
  color: string;
}
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earnedDate: Date;
  category: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatChipsModule,
    MatProgressBarModule,
    MatDividerModule,
    MatMenuModule,
    MatTooltipModule,
    MatBadgeModule,
    MatSnackBarModule,
    MatDialogModule,
    ThemeToggleComponent
  ],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-indigo-900 dark:to-purple-900 p-6">
      <div class="max-w-6xl mx-auto">
        
        <!-- Profile Header -->
        <div class="relative mb-8">
          <!-- Cover Image -->
          <div class="h-48 md:h-64 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl shadow-xl relative overflow-hidden">
            <div class="absolute inset-0 bg-black/20"></div>
            <div class="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
            
            <!-- Edit Cover Button -->
            <button mat-fab 
                    color="primary" 
                    class="absolute top-4 right-4 bg-white/20 backdrop-blur-sm hover:bg-white/30"
                    matTooltip="Change cover">
              <mat-icon>photo_camera</mat-icon>
            </button>
          </div>
          
          <!-- Profile Info -->
          <div class="relative -mt-20 px-6">
            <div class="flex flex-col md:flex-row items-center md:items-end gap-6">
              
              <!-- Avatar -->
              <div class="relative">
                <div class="w-32 h-32 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 p-1 shadow-xl">
                  <div class="w-full h-full rounded-full bg-white flex items-center justify-center text-4xl font-bold text-gray-700">
                    @if (profile().avatar) {
                      <img [src]="profile().avatar" [alt]="profile().name" class="w-full h-full rounded-full object-cover">
                    } @else {
                      {{ getInitials(profile().name) }}
                    }
                  </div>
                </div>
                
                <!-- Avatar Upload Button -->
                <button mat-mini-fab 
                        color="accent"
                        class="absolute -bottom-2 -right-2"
                        matTooltip="Change avatar"
                        (click)="uploadAvatar()">
                  <mat-icon>edit</mat-icon>
                </button>
              </div>
              
              <!-- User Info -->
              <div class="flex-1 text-center md:text-left">
                <h1 class="text-3xl md:text-4xl font-bold text-white mb-2 drop-shadow-lg">
                  {{ profile().name }}
                </h1>
                <p class="text-white/90 text-lg mb-4 drop-shadow">
                  {{ profile().bio || 'Learning enthusiast on a journey of growth' }}
                </p>
                
                <!-- Stats -->
                <div class="flex flex-wrap gap-4 justify-center md:justify-start">
                  <div class="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                    <div class="text-white font-bold">{{ profile().studyStats.level }}</div>
                    <div class="text-white/80 text-sm">Level</div>
                  </div>
                  <div class="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                    <div class="text-white font-bold">{{ profile().studyStats.totalXP }}</div>
                    <div class="text-white/80 text-sm">XP</div>
                  </div>
                  <div class="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                    <div class="text-white font-bold">{{ profile().studyStats.currentStreak }}</div>
                    <div class="text-white/80 text-sm">Day Streak</div>
                  </div>
                </div>
              </div>
              
              <!-- Action Buttons -->
              <div class="flex gap-3">
                <button mat-raised-button color="primary" (click)="editProfile()">
                  <mat-icon>edit</mat-icon>
                  Edit Profile
                </button>
                <button mat-icon-button [matMenuTriggerFor]="profileMenu">
                  <mat-icon>more_vert</mat-icon>
                </button>
                
                <mat-menu #profileMenu="matMenu">
                  <button mat-menu-item (click)="exportData()">
                    <mat-icon>download</mat-icon>
                    Export Data
                  </button>
                  <button mat-menu-item (click)="shareProfile()">
                    <mat-icon>share</mat-icon>
                    Share Profile
                  </button>
                  <mat-divider></mat-divider>
                  <button mat-menu-item color="warn" (click)="deleteAccount()">
                    <mat-icon>delete</mat-icon>
                    Delete Account
                  </button>
                </mat-menu>
              </div>
            </div>
          </div>
        </div>

        <!-- Profile Tabs -->
        <mat-tab-group mat-stretch-tabs="false" class="profile-tabs">
          
          <!-- Overview Tab -->
          <mat-tab label="Overview">
            <div class="pt-6">
              <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                <!-- Study Progress -->
                <mat-card class="animate-slide-in-up">
                  <mat-card-header>
                    <mat-card-title class="flex items-center gap-2">
                      <mat-icon class="text-blue-600">trending_up</mat-icon>
                      Study Progress
                    </mat-card-title>
                  </mat-card-header>
                  <mat-card-content>
                    <div class="space-y-4">
                      <div>
                        <div class="flex justify-between text-sm text-gray-600 mb-1">
                          <span>Level {{ profile().studyStats.level }}</span>
                          <span>{{ profile().studyStats.totalXP }} XP</span>
                        </div>
                        <mat-progress-bar mode="determinate" [value]="getXPProgress()" class="mb-2"></mat-progress-bar>
                        <div class="text-xs text-gray-500">{{ getXPToNextLevel() }} XP to next level</div>
                      </div>
                      
                      <div class="grid grid-cols-2 gap-4 text-center">
                        <div class="bg-blue-50 p-3 rounded-lg">
                          <div class="text-2xl font-bold text-blue-600">{{ profile().studyStats.totalHours }}</div>
                          <div class="text-sm text-gray-600">Hours Studied</div>
                        </div>
                        <div class="bg-green-50 p-3 rounded-lg">
                          <div class="text-2xl font-bold text-green-600">{{ profile().studyStats.completedCourses }}</div>
                          <div class="text-sm text-gray-600">Courses Done</div>
                        </div>
                      </div>
                    </div>
                  </mat-card-content>
                </mat-card>

                <!-- Current Goals -->
                <mat-card class="animate-slide-in-up animate-delay-200">
                  <mat-card-header>
                    <mat-card-title class="flex items-center gap-2">
                      <mat-icon class="text-purple-600">flag</mat-icon>
                      Current Goals
                    </mat-card-title>
                  </mat-card-header>
                  <mat-card-content>
                    @if (profile().studyGoal) {
                      <div class="bg-purple-50 p-4 rounded-lg mb-4">
                        <div class="font-medium text-purple-900 mb-2">{{ profile().studyGoal }}</div>
                        <mat-progress-bar mode="determinate" value="65" color="accent"></mat-progress-bar>
                        <div class="text-sm text-purple-600 mt-1">65% Complete</div>
                      </div>
                    } @else {
                      <div class="text-center py-6">
                        <mat-icon class="text-4xl text-gray-400 mb-2">flag</mat-icon>
                        <div class="text-gray-500">Set your study goal</div>
                        <button mat-button color="primary" (click)="setGoal()">Add Goal</button>
                      </div>
                    }
                    
                    <button mat-stroked-button class="w-full" (click)="manageGoals()">
                      <mat-icon>add</mat-icon>
                      Manage Goals
                    </button>
                  </mat-card-content>
                </mat-card>

                <!-- Recent Activity -->
                <mat-card class="animate-slide-in-up animate-delay-400">
                  <mat-card-header>
                    <mat-card-title class="flex items-center gap-2">
                      <mat-icon class="text-green-600">history</mat-icon>
                      Recent Activity
                    </mat-card-title>
                  </mat-card-header>
                  <mat-card-content>
                    <div class="space-y-3">
                      @for (activity of recentActivity(); track activity.id) {
                        <div class="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                          <mat-icon [class]="getActivityIconClass(activity.type)">
                            {{ activity.icon }}
                          </mat-icon>
                          <div class="flex-1">
                            <div class="text-sm font-medium">{{ activity.title }}</div>
                            <div class="text-xs text-gray-500">{{ formatTime(activity.timestamp) }}</div>
                          </div>
                        </div>
                      } @empty {
                        <div class="text-center text-gray-500 py-4">
                          <mat-icon class="text-2xl mb-2">history</mat-icon>
                          <div class="text-sm">No recent activity</div>
                        </div>
                      }
                    </div>
                  </mat-card-content>
                </mat-card>
              </div>
              
              <!-- Achievements Section -->
              <div class="mt-8">
                <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">Latest Achievements</h2>
                <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  @for (achievement of recentAchievements(); track achievement.id) {
                    <mat-card class="achievement-card hover:shadow-lg transition-all duration-300 cursor-pointer"
                             [ngClass]="'rarity-' + achievement.rarity"
                             (click)="viewAchievement(achievement)">
                      <mat-card-content class="text-center">
                        <div class="achievement-icon mb-3">
                          <mat-icon class="text-4xl">{{ achievement.icon }}</mat-icon>
                        </div>
                        <h3 class="font-bold text-sm mb-1">{{ achievement.title }}</h3>
                        <p class="text-xs text-gray-600 mb-2">{{ achievement.description }}</p>
                        <div class="text-xs text-gray-500">{{ formatDate(achievement.earnedDate) }}</div>
                      </mat-card-content>
                    </mat-card>
                  }
                </div>
              </div>
            </div>
          </mat-tab>

          <!-- Settings Tab -->
          <mat-tab label="Settings">
            <div class="pt-6 max-w-4xl">
              @if (settingsForm) {
                <form [formGroup]="settingsForm" class="space-y-8">
                  
                  <!-- Personal Information -->
                  <mat-card>
                    <mat-card-header>
                      <mat-card-title>Personal Information</mat-card-title>
                    </mat-card-header>
                    <mat-card-content class="space-y-4">
                      <div class="grid md:grid-cols-2 gap-4">
                        <mat-form-field appearance="outline">
                          <mat-label>Full Name</mat-label>
                          <input matInput formControlName="name">
                        </mat-form-field>
                        
                        <mat-form-field appearance="outline">
                          <mat-label>Email</mat-label>
                          <input matInput type="email" formControlName="email">
                        </mat-form-field>
                      </div>
                      
                      <mat-form-field appearance="outline" class="w-full">
                        <mat-label>Bio</mat-label>
                        <textarea matInput rows="3" formControlName="bio" 
                                  placeholder="Tell us about yourself..."></textarea>
                      </mat-form-field>
                      
                      <div class="grid md:grid-cols-2 gap-4">
                        <mat-form-field appearance="outline">
                          <mat-label>Study Goal</mat-label>
                          <input matInput formControlName="studyGoal" 
                                 placeholder="What are you learning?">
                        </mat-form-field>
                        
                        <mat-form-field appearance="outline">
                          <mat-label>Timezone</mat-label>
                          <mat-select formControlName="timezone">
                            <mat-option value="UTC-8">Pacific Time (UTC-8)</mat-option>
                            <mat-option value="UTC-5">Eastern Time (UTC-5)</mat-option>
                            <mat-option value="UTC+0">GMT (UTC+0)</mat-option>
                            <mat-option value="UTC+1">Central European Time (UTC+1)</mat-option>
                          </mat-select>
                        </mat-form-field>
                      </div>
                    </mat-card-content>
                  </mat-card>

                  <!-- Preferences -->
                  <mat-card>
                    <mat-card-header>
                      <mat-card-title>Study Preferences</mat-card-title>
                    </mat-card-header>
                    <mat-card-content class="space-y-4">
                      <div class="grid md:grid-cols-3 gap-4">
                        <div class="theme-preference-item">
                          <label class="preference-label">Theme</label>
                          <app-theme-toggle [showMenu]="true" variant="normal"></app-theme-toggle>
                        </div>
                        
                        <mat-form-field appearance="outline">
                          <mat-label>Study Mode</mat-label>
                          <mat-select formControlName="studyMode">
                            <mat-option value="focused">Focused</mat-option>
                            <mat-option value="relaxed">Relaxed</mat-option>
                          </mat-select>
                        </mat-form-field>
                        
                        <mat-form-field appearance="outline">
                          <mat-label>Difficulty Level</mat-label>
                          <mat-select formControlName="difficulty">
                            <mat-option value="beginner">Beginner</mat-option>
                            <mat-option value="intermediate">Intermediate</mat-option>
                            <mat-option value="advanced">Advanced</mat-option>
                          </mat-select>
                        </mat-form-field>
                      </div>
                    </mat-card-content>
                  </mat-card>

                  <!-- Notifications -->
                  <mat-card>
                    <mat-card-header>
                      <mat-card-title>Notification Settings</mat-card-title>
                    </mat-card-header>
                    <mat-card-content class="space-y-4">
                      <div class="space-y-3">
                        <div class="flex items-center justify-between">
                          <div>
                            <div class="font-medium">Email Notifications</div>
                            <div class="text-sm text-gray-600">Receive updates via email</div>
                          </div>
                          <mat-slide-toggle formControlName="emailNotifications"></mat-slide-toggle>
                        </div>
                        
                        <mat-divider></mat-divider>
                        
                        <div class="flex items-center justify-between">
                          <div>
                            <div class="font-medium">Push Notifications</div>
                            <div class="text-sm text-gray-600">Get browser notifications</div>
                          </div>
                          <mat-slide-toggle formControlName="pushNotifications"></mat-slide-toggle>
                        </div>
                        
                        <mat-divider></mat-divider>
                        
                        <div class="flex items-center justify-between">
                          <div>
                            <div class="font-medium">Study Reminders</div>
                            <div class="text-sm text-gray-600">Daily study reminders</div>
                          </div>
                          <mat-slide-toggle formControlName="studyReminders"></mat-slide-toggle>
                        </div>
                        
                        <mat-divider></mat-divider>
                        
                        <div class="flex items-center justify-between">
                          <div>
                            <div class="font-medium">Achievement Notifications</div>
                            <div class="text-sm text-gray-600">When you earn new badges</div>
                          </div>
                          <mat-slide-toggle formControlName="achievementNotifications"></mat-slide-toggle>
                        </div>
                      </div>
                    </mat-card-content>
                  </mat-card>

                  <!-- Action Buttons -->
                  <div class="flex gap-4 justify-end">
                    <button mat-button (click)="resetSettings()">Reset</button>
                    <button mat-raised-button color="primary" 
                            (click)="saveSettings()"
                            [disabled]="settingsForm.invalid">
                      Save Changes
                    </button>
                  </div>
                </form>
              }
            </div>
          </mat-tab>

          <!-- Achievements Tab -->
          <mat-tab label="Achievements">
            <div class="pt-6">
              <div class="mb-6">
                <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">Your Achievements</h2>
                <p class="text-gray-600 dark:text-gray-400">Unlock badges by completing courses and reaching milestones</p>
              </div>
              
              <div class="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                @for (achievement of allAchievements(); track achievement.id) {
                  <mat-card class="achievement-card hover:shadow-lg transition-all duration-300 cursor-pointer"
                           [ngClass]="'rarity-' + achievement.rarity"
                           (click)="viewAchievement(achievement)">
                    <mat-card-content class="text-center">
                      <div class="achievement-icon mb-3">
                        <mat-icon class="text-4xl">{{ achievement.icon }}</mat-icon>
                      </div>
                      <h3 class="font-bold text-sm mb-1">{{ achievement.title }}</h3>
                      <p class="text-xs text-gray-600 mb-2">{{ achievement.description }}</p>
                      <mat-chip class="text-xs">{{ achievement.category }}</mat-chip>
                      <div class="text-xs text-gray-500 mt-2">{{ formatDate(achievement.earnedDate) }}</div>
                    </mat-card-content>
                  </mat-card>
                } @empty {
                  <div class="col-span-full text-center py-12">
                    <mat-icon class="text-6xl text-gray-400 mb-4">emoji_events</mat-icon>
                    <h3 class="text-xl font-medium text-gray-500 mb-2">No achievements yet</h3>
                    <p class="text-gray-400 mb-4">Start learning to earn your first badge!</p>
                  </div>
                }
              </div>
            </div>
          </mat-tab>
        </mat-tab-group>
      </div>
    </div>
  `,
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  private apiService = inject(ApiService);
  private snackBar = inject(MatSnackBar);
  private notificationService = inject(NotificationService);
  private dialog = inject(MatDialog);

  // Signals for reactive state
  profile = signal<UserProfile>({
    id: '',
    name: '',
    email: '',
    bio: '',
    studyGoal: '',
    timezone: 'UTC',
    language: 'en',
    notifications: {
      email: true,
      push: true,
      studyReminders: true,
      achievements: true
    },
    studyStats: {
      totalHours: 0,
      completedCourses: 0,
      currentStreak: 0,
      totalXP: 0,
      level: 1
    },
    preferences: {
      theme: 'auto',
      studyMode: 'focused',
      difficulty: 'beginner'
    }
  });

  recentActivity = signal<any[]>([]);

  recentAchievements = signal<Achievement[]>([]);

  allAchievements = computed(() => this.recentAchievements());

  settingsForm: FormGroup;

  constructor() {
    this.settingsForm = this.fb.group({
      name: [this.profile().name, [Validators.required]],
      email: [this.profile().email, [Validators.required, Validators.email]],
      bio: [this.profile().bio],
      studyGoal: [this.profile().studyGoal],
      timezone: [this.profile().timezone],
      theme: [this.profile().preferences.theme],
      studyMode: [this.profile().preferences.studyMode],
      difficulty: [this.profile().preferences.difficulty],
      emailNotifications: [this.profile().notifications.email],
      pushNotifications: [this.profile().notifications.push],
      studyReminders: [this.profile().notifications.studyReminders],
      achievementNotifications: [this.profile().notifications.achievements]
    });
  }

  ngOnInit() {
    this.loadProfile();
  }

  private loadProfile() {
    // Load profile data from API
    this.apiService.getCurrentUser().subscribe({
      next: (response) => {
        const user = response.data;
        if (user) {
          // Update profile with real user data
          this.profile.update(profile => ({
            ...profile,
            id: user.id || '',
            name: `${user.firstName} ${user.lastName}`,
            email: user.email,
            bio: user.preferences?.bio || '',
            studyGoal: user.preferences?.studyGoal || '',
            timezone: user.preferences?.timezone || 'UTC',
            language: user.preferences?.language || 'en'
          }));
          
          // Update form with real data
          this.settingsForm.patchValue({
            name: `${user.firstName} ${user.lastName}`,
            email: user.email,
            bio: user.preferences?.bio || '',
            studyGoal: user.preferences?.studyGoal || ''
          });
        }
      },
      error: (error) => {
        console.error('Error loading profile:', error);
        // Profile remains with default empty values
      }
    });
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  getXPProgress(): number {
    const currentXP = this.profile().studyStats.totalXP;
    const level = this.profile().studyStats.level;
    const xpForCurrentLevel = level * 500; // Example calculation
    const xpForNextLevel = (level + 1) * 500;
    return ((currentXP - xpForCurrentLevel) / (xpForNextLevel - xpForCurrentLevel)) * 100;
  }

  getXPToNextLevel(): number {
    const currentXP = this.profile().studyStats.totalXP;
    const level = this.profile().studyStats.level;
    const xpForNextLevel = (level + 1) * 500;
    return xpForNextLevel - currentXP;
  }

  getActivityIconClass(type: string): string {
    const classes = {
      'course': 'text-blue-600',
      'achievement': 'text-yellow-600', 
      'task': 'text-green-600',
      'default': 'text-gray-600'
    };
    return classes[type as keyof typeof classes] || classes.default;
  }

  uploadAvatar() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (file) {
        // Handle avatar upload
        this.notificationService.showSuccess('Avatar updated successfully!', 3000);
      }
    };
    input.click();
  }

  editProfile() {
    // Implementation for editing profile
  }

  exportData() {
    const data = {
      profile: this.profile(),
      achievements: this.allAchievements(),
      exportDate: new Date()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'profile-data.json';
    a.click();
    window.URL.revokeObjectURL(url);
  }

  shareProfile() {
    if (navigator.share) {
      navigator.share({
        title: `${this.profile().name}'s Study Profile`,
        text: `Check out my learning journey!`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      this.notificationService.showSuccess('Profile link copied to clipboard!', 3000);
    }
  }

  deleteAccount() {
    // Implementation for account deletion with confirmation
    this.notificationService.showWarning('Account deletion would be implemented here', 3000);
  }

  setGoal() {
    // Implementation for setting study goal
  }

  manageGoals() {
    // Implementation for managing goals
  }

  viewAchievement(achievement: Achievement) {
    // Implementation for viewing achievement details
    this.notificationService.showInfo(`Viewing ${achievement.title}`, 2000);
  }

  saveSettings() {
    if (this.settingsForm.valid) {
      const formValue = this.settingsForm.value;
      
      // Update profile with form values
      this.profile.update(profile => ({
        ...profile,
        name: formValue.name,
        email: formValue.email,
        bio: formValue.bio,
        studyGoal: formValue.studyGoal,
        timezone: formValue.timezone,
        preferences: {
          theme: formValue.theme,
          studyMode: formValue.studyMode,
          difficulty: formValue.difficulty
        },
        notifications: {
          email: formValue.emailNotifications,
          push: formValue.pushNotifications,
          studyReminders: formValue.studyReminders,
          achievements: formValue.achievementNotifications
        }
      }));

      this.notificationService.showSuccess('Settings saved successfully!', 3000);
    }
  }

  resetSettings() {
    this.settingsForm.reset({
      name: this.profile().name,
      email: this.profile().email,
      bio: this.profile().bio,
      studyGoal: this.profile().studyGoal,
      timezone: this.profile().timezone,
      theme: this.profile().preferences.theme,
      studyMode: this.profile().preferences.studyMode,
      difficulty: this.profile().preferences.difficulty,
      emailNotifications: this.profile().notifications.email,
      pushNotifications: this.profile().notifications.push,
      studyReminders: this.profile().notifications.studyReminders,
      achievementNotifications: this.profile().notifications.achievements
    });
  }

  formatTime(timestamp: Date): string {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return timestamp.toLocaleDateString();
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  }
}
