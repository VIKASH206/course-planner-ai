import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Course, 
  CourseDetailsResponse, 
  ApiResponse,
  ProgressUpdateRequest,
  PaginatedResponse
} from '../models/course.models';

@Injectable({
  providedIn: 'root'
})
export class EnhancedCourseService {
  private readonly baseUrl = `${environment.apiUrl}/user-courses`;

  constructor(private http: HttpClient) {}

  // Enhanced Course Management
  getCourseDetails(courseId: string, userId: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/${courseId}/details/${userId}`);
  }

  startOrContinueCourse(courseId: string, userId: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/${courseId}/start/${userId}`, {});
  }

  markCourseComplete(courseId: string, userId: string): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.baseUrl}/${courseId}/complete/${userId}`, {});
  }
  
  getCourseProgress(courseId: string, userId: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/${courseId}/progress/${userId}`);
  }

  // Get all courses (existing functionality)
  getCourses(): Observable<ApiResponse<Course[]>> {
    return this.http.get<ApiResponse<Course[]>>(`${environment.apiUrl}/courses`);
  }
  
  // Get single course by ID
  getCourseById(courseId: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${environment.apiUrl}/courses/${courseId}`);
  }
  
  // Get course content (modules and lessons)
  getCourseContent(courseId: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${environment.apiUrl}/courses/${courseId}/content`);
  }

  // Get courses by user
  getCoursesByUser(userId: string): Observable<ApiResponse<Course[]>> {
    return this.http.get<ApiResponse<Course[]>>(`${this.baseUrl}/user/${userId}`);
  }

  // Search courses
  searchCourses(query: string, category?: string): Observable<ApiResponse<Course[]>> {
    let params = new HttpParams().set('query', query);
    if (category) {
      params = params.set('category', category);
    }
    return this.http.get<ApiResponse<Course[]>>(`${this.baseUrl}/search`, { params });
  }

  // Course CRUD operations
  createCourse(course: Course): Observable<ApiResponse<Course>> {
    return this.http.post<ApiResponse<Course>>(this.baseUrl, course);
  }

  updateCourse(courseId: string, course: Course): Observable<ApiResponse<Course>> {
    return this.http.put<ApiResponse<Course>>(`${this.baseUrl}/${courseId}`, course);
  }

  deleteCourse(courseId: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}/${courseId}`);
  }

  // Enrollment
  enrollInCourse(courseId: string, userId: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/${courseId}/enroll/${userId}`, {});
  }

  unenrollFromCourse(courseId: string, userId: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}/${courseId}/enroll/${userId}`);
  }
}