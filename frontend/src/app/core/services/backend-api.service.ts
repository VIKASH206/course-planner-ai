import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

// Updated interfaces to match backend DTOs
export interface User {
  id?: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profilePicture?: string;
  bio?: string;
  role?: string;
  totalScore: number;
  level: number;
  completedCourses: number;
  completedTasks: number;
  createdAt?: string;
  lastLogin?: string;
}

export interface Course {
  id?: string;
  title: string;
  description: string;
  tags?: string[];
  progressPercentage: number;
  userId: string;
  category?: string;
  difficulty?: string;
  estimatedHours?: number;
  createdAt?: string;
  updatedAt?: string;
  completedAt?: string;
  isCompleted: boolean;
  isActive: boolean;
}

export interface Task {
  id?: string;
  title: string;
  description?: string;
  deadline?: string;
  dueDate?: string; // Add dueDate for compatibility
  status: string;
  userId: string;
  courseId?: string;
  priority?: string;
  tags?: string[]; // Add tags array
  estimatedMinutes?: number;
  reminderTime?: string;
  createdAt?: string;
  updatedAt?: string;
  completedAt?: string;
  isCompleted?: boolean; // Make optional
  notes?: string;
}

export interface Analytics {
  id?: string;
  userId: string;
  date: string;
  completedTasksToday: number;
  totalTasksToday: number;
  studyTimeMinutes: number;
  coursesWorkedOn: number;
  completionRate: number;
  streakDays: number;
  pointsEarned: number;
  categoryProgress?: { [key: string]: number };
  subjectScores?: { [key: string]: number };
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface SignupRequest {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface LoginRequest {
  email?: string;
  username?: string;
  password: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetResponse {
  success: boolean;
  message: string;
  emailExists: boolean;
}

export interface ChatRequest {
  message: string;
  context?: string;
  userId: string;
}

export interface QuizRequest {
  content: string;
  numberOfQuestions: number;
}

export interface OnboardingRequest {
  userId: string;
  interests: string[];
  studyGoals: string[];
  careerGoal?: string;
  experienceLevel?: string;
  preferredLearningStyle?: string;
}

export interface AIAnalysisResponse {
  analysisText: string;
  recommendedCourses: string[];
  recommendedTopics: string[];
  learningPath: string;
  personalizedMessage: string;
  skills: string[];
  motivationalQuote: string;
}

@Injectable({
  providedIn: 'root'
})
export class BackendApiService {
  private readonly baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // User Management APIs
  signup(request: SignupRequest): Observable<ApiResponse<User>> {
    return this.http.post<ApiResponse<User>>(`${this.baseUrl}/users/signup`, request).pipe(
      catchError(error => {
        const errorMessage = error.error?.message || error.message || 'Signup failed';
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  login(request: LoginRequest): Observable<ApiResponse<User>> {
    return this.http.post<ApiResponse<User>>(`${this.baseUrl}/users/login`, request).pipe(
      catchError(error => {
        // Extract proper error message from backend response
        let errorMessage = 'Login failed';
        
        if (error.error?.message) {
          errorMessage = error.error.message;
        } else if (error.message) {
          errorMessage = error.message;
        } else if (error.statusText) {
          errorMessage = error.statusText;
        }
        
        console.error('Login error details:', error);
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  forgotPassword(request: PasswordResetRequest): Observable<ApiResponse<PasswordResetResponse>> {
    return this.http.post<ApiResponse<PasswordResetResponse>>(`${this.baseUrl}/auth/forgot-password`, request);
  }

  resetPassword(token: string, newPassword: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/auth/reset-password`, { 
      token, 
      newPassword 
    });
  }

  getUserProfile(userId: string): Observable<ApiResponse<User>> {
    return this.http.get<ApiResponse<User>>(`${this.baseUrl}/users/${userId}`);
  }

  updateProfile(userId: string, user: Partial<User>): Observable<ApiResponse<User>> {
    return this.http.put<ApiResponse<User>>(`${this.baseUrl}/users/${userId}`, user);
  }

  getLeaderboard(): Observable<ApiResponse<User[]>> {
    return this.http.get<ApiResponse<User[]>>(`${this.baseUrl}/users/leaderboard`);
  }

  checkUsername(username: string): Observable<ApiResponse<boolean>> {
    return this.http.get<ApiResponse<boolean>>(`${this.baseUrl}/users/check-username/${username}`);
  }

  checkEmail(email: string): Observable<ApiResponse<boolean>> {
    return this.http.get<ApiResponse<boolean>>(`${this.baseUrl}/users/check-email/${email}`);
  }

  // Onboarding APIs
  completeOnboarding(request: OnboardingRequest): Observable<ApiResponse<User>> {
    return this.http.post<ApiResponse<User>>(`${this.baseUrl}/users/onboarding`, request);
  }

  analyzeInterests(request: OnboardingRequest): Observable<ApiResponse<AIAnalysisResponse>> {
    return this.http.post<ApiResponse<AIAnalysisResponse>>(`${this.baseUrl}/users/analyze-interests`, request);
  }

  checkOnboardingStatus(userId: string): Observable<ApiResponse<boolean>> {
    return this.http.get<ApiResponse<boolean>>(`${this.baseUrl}/users/${userId}/onboarding-status`);
  }

  // Course Management APIs
  createCourse(course: Partial<Course>): Observable<ApiResponse<Course>> {
    return this.http.post<ApiResponse<Course>>(`${this.baseUrl}/courses`, course);
  }

  getUserCourses(userId: string): Observable<ApiResponse<Course[]>> {
    return this.http.get<ApiResponse<Course[]>>(`${this.baseUrl}/courses/user/${userId}`);
  }

  getActiveCourses(userId: string): Observable<ApiResponse<Course[]>> {
    return this.http.get<ApiResponse<Course[]>>(`${this.baseUrl}/courses/user/${userId}/active`);
  }

  getCompletedCourses(userId: string): Observable<ApiResponse<Course[]>> {
    return this.http.get<ApiResponse<Course[]>>(`${this.baseUrl}/courses/user/${userId}/completed`);
  }

  getCourse(courseId: string): Observable<ApiResponse<Course>> {
    return this.http.get<ApiResponse<Course>>(`${this.baseUrl}/courses/${courseId}`);
  }

  updateCourse(courseId: string, course: Partial<Course>): Observable<ApiResponse<Course>> {
    return this.http.put<ApiResponse<Course>>(`${this.baseUrl}/courses/${courseId}`, course);
  }

  updateCourseProgress(courseId: string, progress: number): Observable<ApiResponse<Course>> {
    const params = new HttpParams().set('progress', progress.toString());
    return this.http.put<ApiResponse<Course>>(`${this.baseUrl}/courses/${courseId}/progress`, null, { params });
  }

  deleteCourse(courseId: string): Observable<ApiResponse<string>> {
    return this.http.delete<ApiResponse<string>>(`${this.baseUrl}/courses/${courseId}`);
  }

  searchCourses(query: string): Observable<ApiResponse<Course[]>> {
    const params = new HttpParams().set('query', query);
    return this.http.get<ApiResponse<Course[]>>(`${this.baseUrl}/courses/search`, { params });
  }

  getCoursesByCategory(category: string): Observable<ApiResponse<Course[]>> {
    return this.http.get<ApiResponse<Course[]>>(`${this.baseUrl}/courses/category/${category}`);
  }

  getCoursesByDifficulty(difficulty: string): Observable<ApiResponse<Course[]>> {
    return this.http.get<ApiResponse<Course[]>>(`${this.baseUrl}/courses/difficulty/${difficulty}`);
  }

  // Task Management APIs
  createTask(task: Partial<Task>): Observable<ApiResponse<Task>> {
    return this.http.post<ApiResponse<Task>>(`${this.baseUrl}/tasks`, task);
  }

  getUserTasks(userId: string): Observable<ApiResponse<Task[]>> {
    return this.http.get<ApiResponse<Task[]>>(`${this.baseUrl}/tasks/user/${userId}`);
  }

  getTasksByStatus(userId: string, status: string): Observable<ApiResponse<Task[]>> {
    return this.http.get<ApiResponse<Task[]>>(`${this.baseUrl}/tasks/user/${userId}/status/${status}`);
  }

  getTasksByCourse(courseId: string): Observable<ApiResponse<Task[]>> {
    return this.http.get<ApiResponse<Task[]>>(`${this.baseUrl}/tasks/course/${courseId}`);
  }

  getTask(taskId: string): Observable<ApiResponse<Task>> {
    return this.http.get<ApiResponse<Task>>(`${this.baseUrl}/tasks/${taskId}`);
  }

  updateTask(taskId: string, task: Partial<Task>): Observable<ApiResponse<Task>> {
    return this.http.put<ApiResponse<Task>>(`${this.baseUrl}/tasks/${taskId}`, task);
  }

  completeTask(taskId: string): Observable<ApiResponse<Task>> {
    return this.http.put<ApiResponse<Task>>(`${this.baseUrl}/tasks/${taskId}/complete`, null);
  }

  updateTaskStatus(taskId: string, status: string): Observable<ApiResponse<Task>> {
    const params = new HttpParams().set('status', status);
    return this.http.put<ApiResponse<Task>>(`${this.baseUrl}/tasks/${taskId}/status`, null, { params });
  }

  deleteTask(taskId: string): Observable<ApiResponse<string>> {
    return this.http.delete<ApiResponse<string>>(`${this.baseUrl}/tasks/${taskId}`);
  }

  getTasksByDateRange(userId: string, startDate: string, endDate: string): Observable<ApiResponse<Task[]>> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
    return this.http.get<ApiResponse<Task[]>>(`${this.baseUrl}/tasks/user/${userId}/calendar`, { params });
  }

  getTasksByDate(userId: string, date: string): Observable<ApiResponse<Task[]>> {
    return this.http.get<ApiResponse<Task[]>>(`${this.baseUrl}/tasks/user/${userId}/date/${date}`);
  }

  getOverdueTasks(userId: string): Observable<ApiResponse<Task[]>> {
    return this.http.get<ApiResponse<Task[]>>(`${this.baseUrl}/tasks/user/${userId}/overdue`);
  }

  getUpcomingTasks(userId: string): Observable<ApiResponse<Task[]>> {
    return this.http.get<ApiResponse<Task[]>>(`${this.baseUrl}/tasks/user/${userId}/upcoming`);
  }

  getTasksByPriority(userId: string, priority: string): Observable<ApiResponse<Task[]>> {
    return this.http.get<ApiResponse<Task[]>>(`${this.baseUrl}/tasks/user/${userId}/priority/${priority}`);
  }

  // AI Features APIs
  generateStudyPath(userId: string): Observable<ApiResponse<string>> {
    return this.http.get<ApiResponse<string>>(`${this.baseUrl}/ai/study-path/${userId}`);
  }

  summarizeContent(content: string): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(`${this.baseUrl}/ai/summarize`, { content });
  }

  generateQuiz(request: QuizRequest): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(`${this.baseUrl}/ai/quiz`, request);
  }

  getSmartReminders(userId: string): Observable<ApiResponse<string>> {
    return this.http.get<ApiResponse<string>>(`${this.baseUrl}/ai/smart-reminders/${userId}`);
  }

  aiChat(request: ChatRequest): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(`${this.baseUrl}/ai/chat`, request);
  }

  generateStudyTips(weakAreas: string, strongAreas?: string): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(`${this.baseUrl}/ai/study-tips`, { weakAreas, strongAreas });
  }

  analyzeProgress(progressData: string): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(`${this.baseUrl}/ai/analyze-progress`, { progressData });
  }

  // Analytics APIs
  getTodayAnalytics(userId: string): Observable<ApiResponse<Analytics>> {
    return this.http.get<ApiResponse<Analytics>>(`${this.baseUrl}/analytics/today/${userId}`);
  }

  getWeeklyAnalytics(userId: string): Observable<ApiResponse<Analytics[]>> {
    return this.http.get<ApiResponse<Analytics[]>>(`${this.baseUrl}/analytics/weekly/${userId}`);
  }

  getMonthlyAnalytics(userId: string): Observable<ApiResponse<Analytics[]>> {
    return this.http.get<ApiResponse<Analytics[]>>(`${this.baseUrl}/analytics/monthly/${userId}`);
  }

  getProgressSummary(userId: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/analytics/summary/${userId}`);
  }

  getDetailedAnalytics(userId: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/analytics/detailed/${userId}`);
  }

  getAreasAnalysis(userId: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/analytics/areas-analysis/${userId}`);
  }

  getUserStreak(userId: string): Observable<ApiResponse<number>> {
    return this.http.get<ApiResponse<number>>(`${this.baseUrl}/analytics/streak/${userId}`);
  }

  // Gamification APIs
  getGamificationLeaderboard(): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(`${this.baseUrl}/gamification/leaderboard`);
  }

  getUserRank(userId: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/gamification/rank/${userId}`);
  }

  // Enrollment APIs
  getUserEnrolledCourses(userId: string): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(`${this.baseUrl}/enrollments/user/${userId}`);
  }
}