export type UserRole = 'student' | 'instructor' | 'group_leader' | 'admin';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: UserRole;
  
  // Role-specific properties
  profile: UserProfile;
  preferences: UserPreferences;
  stats: UserStats;
  
  createdAt: Date;
  lastLoginAt: Date;
}

export interface UserProfile {
  // Common fields
  bio?: string;
  location?: string;
  timezone?: string;
  phone?: string;
  
  // Academic/University fields
  university?: string;
  department?: string;
  major?: string;
  year?: string;
  
  // Personal information
  dateOfBirth?: Date;
  gender?: string;
  
  // Social links
  website?: string;
  linkedin?: string;
  twitter?: string;
  github?: string;
  
  // Skills and interests
  skills?: string[];
  languages?: string[];
  
  // Emergency contact
  emergencyContact?: string;
  emergencyPhone?: string;
  
  // Student-specific
  academicLevel?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  interests?: string[];
  weakAreas?: string[];
  strongAreas?: string[];
  learningGoals?: string[];
  
  // Instructor-specific
  expertise?: string[];
  yearsExperience?: number;
  teachingSubjects?: string[];
  certifications?: string[];
  
  // Group Leader-specific
  teamSize?: number;
  teamSkillLevel?: 'mixed' | 'beginner' | 'intermediate' | 'advanced';
  organizationType?: 'company' | 'university' | 'bootcamp' | 'study_group';
  managementStyle?: 'collaborative' | 'directive' | 'mentoring';
}

export interface UserPreferences {
  // Learning preferences
  preferredLearningStyle?: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
  studyTime?: 'morning' | 'afternoon' | 'evening' | 'flexible';
  courseDuration?: 'short' | 'medium' | 'long' | 'any';
  difficultyPreference?: 'gradual' | 'challenging' | 'mixed';
  
  // Notification preferences
  emailNotifications: boolean;
  pushNotifications: boolean;
  weeklyProgress: boolean;
  courseRecommendations: boolean;
  
  // UI preferences
  theme: 'light' | 'dark' | 'auto';
  language: string;
  dashboardLayout?: 'compact' | 'detailed' | 'minimal';
}

export interface UserStats {
  // Common stats
  totalCourses: number;
  completedCourses: number;
  inProgressCourses: number;
  totalStudyHours: number;
  currentStreak: number;
  longestStreak: number;
  
  // Student-specific stats
  averageScore?: number;
  certificatesEarned?: number;
  skillsAcquired?: string[];
  
  // Instructor-specific stats
  coursesCreated?: number;
  totalStudents?: number;
  averageRating?: number;
  totalRevenue?: number;
  
  // Group Leader-specific stats
  teamsManaged?: number;
  membersLed?: number;
  groupCompletionRate?: number;
  collaborativeProjects?: number;
}

export interface AIRecommendationContext {
  userRole: UserRole;
  completedCourses: string[];
  currentCourses: string[];
  skillLevel: string;
  interests: string[];
  weakAreas: string[];
  learningGoals: string[];
  timeAvailable: number; // hours per week
  preferredDifficulty: string;
  
  // Role-specific context
  teamContext?: {
    teamSize: number;
    teamSkillLevel: string;
    sharedGoals: string[];
  };
  
  instructorContext?: {
    teachingSubjects: string[];
    experienceLevel: string;
    marketDemand: string[];
  };
}