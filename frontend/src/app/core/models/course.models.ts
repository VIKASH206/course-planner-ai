// Enhanced Course Models for Frontend
// Corresponds to the backend models created

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
  price?: number;
  rating?: number;
  reviews?: number;
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
  
  // Enhanced fields
  moduleIds?: string[];
  currentModuleId?: string;
  currentTopicId?: string;
  overallProgress?: number;
  lastAccessedAt?: Date;
  aiRecommendations?: string[];
}

export interface Module {
topics: any;
  id?: string;
  courseId: string;
  title: string;
  description: string;
  orderIndex: number;
  estimatedDuration: number; // in minutes
  objectives?: string[];
  prerequisites?: string[];
  isOptional: boolean;
  tags?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Topic {
  id?: string;
  moduleId: string;
  title: string;
  description: string;
  content: string;
  topicType: 'LESSON' | 'EXERCISE' | 'QUIZ' | 'PROJECT' | 'READING' | 'VIDEO';
  orderIndex: number;
  estimatedDuration: number; // in minutes
  
  // Content and resources
  videoUrl?: string;
  attachments?: TopicAttachment[];
  externalLinks?: ExternalLink[];
  
  // Learning objectives
  learningObjectives?: string[];
  keyPoints?: string[];
  
  // Completion requirements
  isOptional: boolean;
  minTimeRequirement?: number; // minimum time to spend
  completionCriteria?: string;
  
  tags?: string[];
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
  
  createdAt?: Date;
  updatedAt?: Date;
}

export interface TopicAttachment {
  id?: string;
  filename: string;
  fileType: string;
  fileSize: number;
  uploadedAt?: Date;
  downloadUrl?: string;
}

export interface ExternalLink {
  title: string;
  url: string;
  description?: string;
  linkType: 'RESOURCE' | 'REFERENCE' | 'TOOL' | 'DOCUMENTATION';
}

export interface Note {
  id?: string;
  userId: string;
  courseId: string;
  topicId?: string;
  title: string;
  content: string;
  noteType: 'PERSONAL' | 'HIGHLIGHT' | 'QUESTION' | 'SUMMARY';
  
  // Sharing and collaboration
  isPublic: boolean;
  sharedWith?: string[]; // user IDs
  
  // Organization
  tags?: string[];
  color?: string; // for UI organization
  isPinned?: boolean;
  
  // Attachments
  attachments?: NoteAttachment[];
  
  // Timestamps
  createdAt?: Date;
  updatedAt?: Date;
  lastViewedAt?: Date;
}

export interface NoteAttachment {
  id?: string;
  filename: string;
  fileType: string;
  fileSize: number;
  uploadedAt?: Date;
}

export interface Quiz {
  id?: string;
  courseId: string;
  topicId?: string;
  title: string;
  description?: string;
  quizType: 'PRACTICE' | 'ASSESSMENT' | 'FINAL' | 'SELF_CHECK';
  
  // Quiz configuration
  timeLimit?: number; // in minutes
  maxAttempts?: number;
  passingScore?: number; // percentage
  showCorrectAnswers: boolean;
  randomizeQuestions: boolean;
  randomizeOptions: boolean;
  
  // Questions
  questions: QuizQuestion[];
  
  // AI-generated metadata
  isAIGenerated: boolean;
  aiPrompt?: string;
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
  
  tags?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface QuizQuestion {
  id?: string;
  questionText: string;
  questionType: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'FILL_BLANK' | 'SHORT_ANSWER' | 'ESSAY';
  
  // Options for multiple choice
  options?: QuizOption[];
  
  // Correct answers
  correctAnswers: string[];
  explanation?: string;
  
  // Scoring
  points: number;
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
  
  // Metadata
  tags?: string[];
  orderIndex: number;
}

export interface QuizOption {
  id?: string;
  text: string;
  isCorrect: boolean;
  orderIndex: number;
}

export interface QuizAttempt {
  id?: string;
  userId: string;
  quizId: string;
  startTime: Date;
  endTime?: Date;
  submittedAt?: Date;
  
  // Answers and scoring
  answers: { [questionId: string]: string[] };
  score?: number;
  percentage?: number;
  
  // Status
  status: 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED' | 'TIMED_OUT';
  timeSpent?: number; // in minutes
  
  // Feedback
  feedback?: QuizFeedback;
}

export interface QuizFeedback {
  overallFeedback: string;
  questionFeedback: { [questionId: string]: string };
  strengthAreas: string[];
  improvementAreas: string[];
  recommendations: string[];
}

export interface UserProgress {
  id?: string;
  userId: string;
  courseId: string;
  moduleId?: string;
  topicId?: string;
  
  // Progress tracking
  progressPercentage: number;
  isCompleted: boolean;
  timeSpentMinutes: number;
  
  // Engagement metrics
  lastAccessedAt?: Date;
  accessCount: number;
  completedAt?: Date;
  
  // Performance data
  averageScore?: number;
  bestScore?: number;
  attemptCount: number;
  
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Forum {
  id?: string;
  courseId: string;
  title: string;
  description?: string;
  category: 'GENERAL' | 'Q_AND_A' | 'STUDY_GROUP' | 'ANNOUNCEMENTS' | 'PROJECTS';
  
  // Permissions and moderation
  isModerated: boolean;
  allowAnonymous: boolean;
  
  // Statistics
  postCount?: number;
  memberCount?: number;
  
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ForumPost {
  id?: string;
  forumId: string;
  userId: string;
  parentPostId?: string; // for replies
  
  // Content
  title?: string;
  content: string;
  postType: 'QUESTION' | 'ANSWER' | 'DISCUSSION' | 'ANNOUNCEMENT' | 'REPLY';
  
  // Engagement
  likeCount: number;
  replyCount: number;
  viewCount: number;
  isLikedByCurrentUser?: boolean;
  
  // Status and moderation
  isAnswered?: boolean; // for questions
  isAcceptedAnswer?: boolean; // for answers
  isFeatured: boolean;
  isPinned: boolean;
  
  // Organization
  tags?: string[];
  
  // Timestamps
  createdAt?: Date;
  updatedAt?: Date;
  lastActivityAt?: Date;
}

export interface Badge {
  id?: string;
  name: string;
  description: string;
  category: 'PROGRESS' | 'PERFORMANCE' | 'ENGAGEMENT' | 'SPECIAL' | 'COLLABORATION';
  
  // Visual properties
  iconUrl?: string;
  color?: string;
  rarity: 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  
  // Requirements
  requirements?: BadgeRequirement[];
  
  // Statistics
  totalEarned?: number;
  
  createdAt?: Date;
  updatedAt?: Date;
}

export interface BadgeRequirement {
  type: 'COURSE_COMPLETION' | 'QUIZ_SCORE' | 'TIME_SPENT' | 'FORUM_PARTICIPATION' | 'STREAK';
  value: number;
  description: string;
}

export interface UserBadge {
  id?: string;
  userId: string;
  badgeId: string;
  courseId?: string; // optional - if badge is course-specific
  
  // Context
  earnedAt: Date;
  isDisplayed: boolean;
  earnedFor?: string; // description
  relatedEntityId?: string;
}

export interface Reminder {
  id?: string;
  userId: string;
  courseId?: string;
  topicId?: string;
  
  // Content
  title: string;
  description?: string;
  reminderType: 'DEADLINE' | 'STUDY_SESSION' | 'QUIZ' | 'REVIEW' | 'CUSTOM';
  
  // Scheduling
  reminderDateTime: Date;
  isRecurring: boolean;
  recurringPattern?: RecurringPattern;
  
  // Status
  isCompleted: boolean;
  completedAt?: Date;
  snoozeCount: number;
  
  // Notification preferences
  emailNotification: boolean;
  pushNotification: boolean;
  
  createdAt?: Date;
  updatedAt?: Date;
}

export interface RecurringPattern {
  type: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  interval: number; // every N days/weeks/months
  daysOfWeek?: number[]; // for weekly patterns (0=Sunday, 1=Monday, etc.)
  endDate?: Date;
}

// API Response types
export interface CourseDetailsResponse {
  course: Course;
  modules: Module[];
  currentProgress: UserProgress;
  aiRecommendations: string[];
  upcomingDeadlines: Reminder[];
  recentActivity: ActivityItem[];
}

export interface ActivityItem {
  type: 'PROGRESS_UPDATE' | 'QUIZ_COMPLETED' | 'NOTE_CREATED' | 'FORUM_POST' | 'BADGE_EARNED';
  title: string;
  description?: string;
  timestamp: Date;
  relatedEntityId?: string;
}

export interface ProgressUpdateRequest {
  progressPercentage: number;
  timeSpentMinutes: number;
  isCompleted?: boolean;
}

export interface NoteRequest {
  userId: string;
  courseId: string;
  topicId?: string;
  title: string;
  content: string;
  noteType: 'PERSONAL' | 'HIGHLIGHT' | 'QUESTION' | 'SUMMARY';
  tags?: string[];
  isPublic?: boolean;
}

export interface ReminderRequest {
  userId: string;
  courseId?: string;
  topicId?: string;
  title: string;
  description?: string;
  reminderType: 'DEADLINE' | 'STUDY_SESSION' | 'QUIZ' | 'REVIEW' | 'CUSTOM';
  reminderDateTime: Date;
  isRecurring?: boolean;
  recurringPattern?: RecurringPattern;
  emailNotification?: boolean;
  pushNotification?: boolean;
}

// AI-related interfaces
export interface AIRecommendation {
  type: 'NEXT_TOPIC' | 'REVIEW_TOPIC' | 'PRACTICE_QUIZ' | 'STUDY_BREAK' | 'RESOURCE';
  title: string;
  description: string;
  confidence: number; // 0-1 scale
  reasoning?: string;
  actionUrl?: string;
}

export interface ChatMessage {
  id?: string;
  message: string;
  response?: string;
  timestamp: Date;
  isFromUser: boolean;
  courseId?: string;
  topicId?: string;
}

export interface QuizGenerationRequest {
  topicId?: string;
  content?: string;
  questionCount: number;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  questionTypes?: string[];
}

// Utility types for API responses
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}