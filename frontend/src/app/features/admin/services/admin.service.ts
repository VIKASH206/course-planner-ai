import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { Interest, Goal, Subject, AIRule, DashboardStats, CompletionStats } from '../models/admin.interface';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private readonly apiUrl = `${environment.apiUrl}/admin`; // Fixed: removed duplicate /api

  // Signals for reactive state
  dashboardStats = signal<DashboardStats | null>(null);
  interests = signal<Interest[]>([]);
  goals = signal<Goal[]>([]);
  subjects = signal<Subject[]>([]);
  aiRules = signal<AIRule[]>([]);

  constructor(private http: HttpClient) {}

  // ============ Dashboard APIs ============
  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<ApiResponse<DashboardStats>>(`${this.apiUrl}/dashboard/stats`)
      .pipe(map(response => {
        this.dashboardStats.set(response.data);
        return response.data;
      }));
  }

  getInterestTrends(): Observable<{ [key: string]: number }> {
    return this.http.get<ApiResponse<{ [key: string]: number }>>(`${this.apiUrl}/dashboard/interest-trends`)
      .pipe(map(response => response.data));
  }

  getGoalStats(): Observable<{ [key: string]: number }> {
    return this.http.get<ApiResponse<{ [key: string]: number }>>(`${this.apiUrl}/dashboard/goal-stats`)
      .pipe(map(response => response.data));
  }

  getTopSubjects(): Observable<{ [key: string]: number }> {
    return this.http.get<ApiResponse<{ [key: string]: number }>>(`${this.apiUrl}/dashboard/top-subjects`)
      .pipe(map(response => response.data));
  }

  getCompletionRate(): Observable<CompletionStats> {
    return this.http.get<ApiResponse<CompletionStats>>(`${this.apiUrl}/dashboard/completion-rate`)
      .pipe(map(response => response.data));
  }

  // ============ Interest APIs ============
  getAllInterests(): Observable<Interest[]> {
    return this.http.get<ApiResponse<Interest[]>>(`${this.apiUrl}/interests`)
      .pipe(map(response => {
        this.interests.set(response.data);
        return response.data;
      }));
  }

  getInterestById(id: string): Observable<Interest> {
    return this.http.get<ApiResponse<Interest>>(`${this.apiUrl}/interests/${id}`)
      .pipe(map(response => response.data));
  }

  createInterest(interest: Interest): Observable<Interest> {
    return this.http.post<ApiResponse<Interest>>(`${this.apiUrl}/interests`, interest)
      .pipe(map(response => response.data));
  }

  updateInterest(id: string, interest: Interest): Observable<Interest> {
    return this.http.put<ApiResponse<Interest>>(`${this.apiUrl}/interests/${id}`, interest)
      .pipe(map(response => response.data));
  }

  deleteInterest(id: string): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/interests/${id}`)
      .pipe(map(() => {}));
  }

  toggleInterestStatus(id: string, enabled: boolean): Observable<Interest> {
    return this.http.patch<ApiResponse<Interest>>(`${this.apiUrl}/interests/${id}/toggle?enabled=${enabled}`, {})
      .pipe(map(response => response.data));
  }

  // ============ Goal APIs ============
  getAllGoals(): Observable<Goal[]> {
    return this.http.get<ApiResponse<Goal[]>>(`${this.apiUrl}/goals`)
      .pipe(map(response => {
        this.goals.set(response.data);
        return response.data;
      }));
  }

  getGoalById(id: string): Observable<Goal> {
    return this.http.get<ApiResponse<Goal>>(`${this.apiUrl}/goals/${id}`)
      .pipe(map(response => response.data));
  }

  createGoal(goal: Goal): Observable<Goal> {
    return this.http.post<ApiResponse<Goal>>(`${this.apiUrl}/goals`, goal)
      .pipe(map(response => response.data));
  }

  updateGoal(id: string, goal: Goal): Observable<Goal> {
    return this.http.put<ApiResponse<Goal>>(`${this.apiUrl}/goals/${id}`, goal)
      .pipe(map(response => response.data));
  }

  deleteGoal(id: string): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/goals/${id}`)
      .pipe(map(() => {}));
  }

  toggleGoalStatus(id: string, enabled: boolean): Observable<Goal> {
    return this.http.patch<ApiResponse<Goal>>(`${this.apiUrl}/goals/${id}/toggle?enabled=${enabled}`, {})
      .pipe(map(response => response.data));
  }

  // ============ Subject APIs ============
  getAllSubjects(): Observable<Subject[]> {
    return this.http.get<ApiResponse<Subject[]>>(`${this.apiUrl}/subjects`)
      .pipe(map(response => {
        this.subjects.set(response.data);
        return response.data;
      }));
  }

  getSubjectById(id: string): Observable<Subject> {
    return this.http.get<ApiResponse<Subject>>(`${this.apiUrl}/subjects/${id}`)
      .pipe(map(response => response.data));
  }

  createSubject(subject: Subject): Observable<Subject> {
    return this.http.post<ApiResponse<Subject>>(`${this.apiUrl}/subjects`, subject)
      .pipe(map(response => response.data));
  }

  updateSubject(id: string, subject: Subject): Observable<Subject> {
    return this.http.put<ApiResponse<Subject>>(`${this.apiUrl}/subjects/${id}`, subject)
      .pipe(map(response => response.data));
  }

  deleteSubject(id: string): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/subjects/${id}`)
      .pipe(map(() => {}));
  }

  toggleSubjectStatus(id: string, enabled: boolean): Observable<Subject> {
    return this.http.patch<ApiResponse<Subject>>(`${this.apiUrl}/subjects/${id}/toggle?enabled=${enabled}`, {})
      .pipe(map(response => response.data));
  }

  // ============ AI Rule APIs ============
  getAllAIRules(): Observable<AIRule[]> {
    return this.http.get<ApiResponse<AIRule[]>>(`${this.apiUrl}/ai-rules`)
      .pipe(map(response => {
        this.aiRules.set(response.data);
        return response.data;
      }));
  }

  getAIRuleById(id: string): Observable<AIRule> {
    return this.http.get<ApiResponse<AIRule>>(`${this.apiUrl}/ai-rules/${id}`)
      .pipe(map(response => response.data));
  }

  createAIRule(rule: AIRule): Observable<AIRule> {
    return this.http.post<ApiResponse<AIRule>>(`${this.apiUrl}/ai-rules`, rule)
      .pipe(map(response => response.data));
  }

  updateAIRule(id: string, rule: AIRule): Observable<AIRule> {
    return this.http.put<ApiResponse<AIRule>>(`${this.apiUrl}/ai-rules/${id}`, rule)
      .pipe(map(response => response.data));
  }

  deleteAIRule(id: string): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/ai-rules/${id}`)
      .pipe(map(() => {}));
  }

  toggleAIRuleStatus(id: string, enabled: boolean): Observable<AIRule> {
    return this.http.patch<ApiResponse<AIRule>>(`${this.apiUrl}/ai-rules/${id}/toggle?enabled=${enabled}`, {})
      .pipe(map(response => response.data));
  }

  // ============ Course APIs ============
  getAllCourses(): Observable<any[]> {
    // For admin panel, include unpublished courses
    // Add timestamp to prevent caching issues
    const timestamp = new Date().getTime();
    return this.http.get<ApiResponse<any[]>>(`${environment.apiUrl}/courses/all?includeUnpublished=true&_t=${timestamp}`)
      .pipe(map(response => response.data));
  }

  getCourseById(id: string): Observable<any> {
    return this.http.get<ApiResponse<any>>(`${environment.apiUrl}/courses/${id}`)
      .pipe(map(response => response.data));
  }

  createCourse(course: any): Observable<any> {
    return this.http.post<ApiResponse<any>>(`${environment.apiUrl}/courses`, course)
      .pipe(map(response => response.data));
  }

  updateCourse(id: string, course: any): Observable<any> {
    return this.http.put<ApiResponse<any>>(`${environment.apiUrl}/courses/${id}`, course)
      .pipe(map(response => response.data));
  }

  deleteCourse(id: string): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${environment.apiUrl}/courses/${id}`)
      .pipe(map(() => {}));
  }

  // ============ Course Requests APIs ============
  getCourseRequests(): Observable<any[]> {
    return this.http.get<ApiResponse<any[]>>(`${environment.apiUrl}/course-requests`)
      .pipe(map(response => response.data));
  }

  // ============ AI Recommendation Logs APIs ============
  getAllAILogs(search?: string, status?: string, interest?: string): Observable<any> {
    let params: any = {};
    if (search) params.search = search;
    if (status) params.status = status;
    if (interest) params.interest = interest;

    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/ai-recommendation-logs`, { params })
      .pipe(map(response => response.data));
  }

  getAILogStats(): Observable<any> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/ai-recommendation-logs/stats`)
      .pipe(map(response => response.data));
  }

  deleteAILog(id: string): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/ai-recommendation-logs/${id}`)
      .pipe(map(() => {}));
  }

  // ============ Coming Soon Courses APIs ============
  getComingSoonStats(): Observable<any> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/coming-soon/stats`)
      .pipe(map(response => response.data));
  }

  getAllComingSoonCourses(status?: string, level?: string): Observable<any[]> {
    let params: any = {};
    if (status) params.status = status;
    if (level) params.level = level;

    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/coming-soon`, { params })
      .pipe(map(response => response.data));
  }

  getComingSoonCourseById(id: string): Observable<any> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/coming-soon/${id}`)
      .pipe(map(response => response.data));
  }

  updateComingSoonStatus(id: string, status: string): Observable<any> {
    return this.http.put<ApiResponse<any>>(`${this.apiUrl}/coming-soon/${id}/status`, { status })
      .pipe(map(response => response.data));
  }

  markComingSoonAsPlanned(id: string): Observable<any> {
    return this.http.put<ApiResponse<any>>(`${this.apiUrl}/coming-soon/${id}/plan`, {})
      .pipe(map(response => response.data));
  }

  markComingSoonAsReady(id: string): Observable<any> {
    return this.http.put<ApiResponse<any>>(`${this.apiUrl}/coming-soon/${id}/ready`, {})
      .pipe(map(response => response.data));
  }

  deleteComingSoonCourse(id: string): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/coming-soon/${id}`)
      .pipe(map(() => {}));
  }

  createComingSoonCourse(data: any): Observable<any> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/coming-soon`, data)
      .pipe(map(response => response.data));
  }
}
