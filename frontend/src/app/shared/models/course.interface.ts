export interface Course {
  id?: string;
  title: string;
  description: string;
  instructor: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  lessons: number;
  progress?: number;
  thumbnail?: string;
  imageUrl?: string;  // Course cover image URL
  price?: number;
  rating?: number;
  reviews?: number;
  studentsEnrolled?: number;
  tags?: string[];
  createdAt?: Date;
  updatedAt?: Date;
  totalLessons?: number;
  completedLessons?: number;
  estimatedTime?: string;
  enrolledDate?: Date;
  isEnrolled?: boolean;
  studentsCount?: number;
  objectives?: string[];
  prerequisites?: string[];
  
  // Additional properties for UI
  aiRecommended?: boolean;
  enrolledStudents?: number;
  
  // AI Recommendation specific properties
  aiRecommendation?: {
    role: 'student' | 'instructor' | 'group_leader' | 'admin';
    primaryAction: string;
    secondaryAction?: string;
    recommendationReason: string;
    learningPath?: string;
    priority: 'high' | 'medium' | 'low';
    tags: string[];
  };
}