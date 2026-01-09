// Admin Module Interfaces
export interface Interest {
  id?: string;
  name: string;
  description: string;
  iconUrl?: string;
  enabled: boolean;
  orderIndex: number;
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: string;
}

export interface Goal {
  id?: string;
  name: string;
  description: string;
  iconUrl?: string;
  interestIds: string[];
  enabled: boolean;
  orderIndex: number;
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: string;
}

export interface Subject {
  id?: string;
  name: string;
  description: string;
  interestId: string;
  goalId: string;
  difficultyLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  durationWeeks: number;
  prerequisites: string[];
  roadmapOrder: number;
  thumbnailUrl?: string;
  enabled: boolean;
  instructor?: string;
  estimatedHours?: number;
  tags?: string[];
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: string;
}

export interface AIRule {
  id?: string;
  name: string;
  description: string;
  interestId: string;
  goalId: string;
  experienceLevel?: string;
  subjectIds: string[];
  subjectOrder: number[];
  priority: number;
  weight: number;
  enabled: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: string;
}

export interface DashboardStats {
  // Core Metrics (as per requirements)
  totalUsers: number;           // All registered users (students + admins)
  activeUsers: number;           // Users with accountStatus = 'ACTIVE'
  totalCourses: number;          // All courses in system
  availableCourses: number;      // Courses with isPublished = true
  comingSoonCourses: number;     // Courses with isPublished = false
  aiRecommendationsToday: number; // AI recommendations generated today
  
  // Legacy fields (for backward compatibility)
  activeUsersToday?: number;
  totalSubjects?: number;
  activeInterests?: number;
  totalGoals?: number;
  totalRules?: number;
  totalRecommendations?: number;
}

export interface CompletionStats {
  overallCompletionRate: number;
  averageTimeToComplete: string;
  completedCourses: number;
  inProgressCourses: number;
}
