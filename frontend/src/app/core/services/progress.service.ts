import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  UserProgress,
  ProgressUpdateRequest,
  ApiResponse
} from '../models/course.models';

@Injectable({
  providedIn: 'root'
})
export class ProgressService {
  private readonly baseUrl = `${environment.apiUrl}/api/progress`;

  constructor(private http: HttpClient) {}

  // Get course progress
  getCourseProgress(courseId: string, userId: string): Observable<ApiResponse<UserProgress>> {
    return this.http.get<ApiResponse<UserProgress>>(`${this.baseUrl}/course/${courseId}/user/${userId}`);
  }

  // Get module progress
  getModuleProgress(moduleId: string, userId: string): Observable<ApiResponse<UserProgress>> {
    return this.http.get<ApiResponse<UserProgress>>(`${this.baseUrl}/module/${moduleId}/user/${userId}`);
  }

  // Update topic progress
  updateTopicProgress(topicId: string, userId: string, progressData: ProgressUpdateRequest): Observable<ApiResponse<UserProgress>> {
    return this.http.put<ApiResponse<UserProgress>>(`${this.baseUrl}/topic/${topicId}/user/${userId}`, progressData);
  }

  // Get learning analytics
  getLearningAnalytics(userId: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/analytics/${userId}`);
  }

  // Get performance feedback
  getPerformanceFeedback(userId: string, courseId: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/feedback/${userId}/course/${courseId}`);
  }

  // Set learning goals
  setLearningGoals(userId: string, goals: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/goals/${userId}`, goals);
  }

  // Get time statistics
  getTimeStatistics(userId: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/stats/time/${userId}`);
  }

  // Get progress overview for all courses
  getAllCoursesProgress(userId: string): Observable<ApiResponse<UserProgress[]>> {
    return this.http.get<ApiResponse<UserProgress[]>>(`${this.baseUrl}/user/${userId}/courses`);
  }

  // Get detailed course statistics
  getCourseStatistics(courseId: string, userId: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/course/${courseId}/user/${userId}/stats`);
  }
}