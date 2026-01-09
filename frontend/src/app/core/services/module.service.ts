import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Module,
  ApiResponse
} from '../models/course.models';

@Injectable({
  providedIn: 'root'
})
export class ModuleService {
  private readonly baseUrl = `${environment.apiUrl}/api/modules`;

  constructor(private http: HttpClient) {}

  // Get modules for a course
  getCourseModules(courseId: string): Observable<ApiResponse<Module[]>> {
    return this.http.get<ApiResponse<Module[]>>(`${this.baseUrl}/course/${courseId}`);
  }
  
  // Get modules with user progress
  getModulesWithProgress(courseId: string, userId: string): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(`${this.baseUrl}/course/${courseId}/user/${userId}`);
  }

  // Get module details
  getModule(moduleId: string): Observable<ApiResponse<Module>> {
    return this.http.get<ApiResponse<Module>>(`${this.baseUrl}/${moduleId}`);
  }

  // Update module progress
  updateModuleProgress(moduleId: string, userId: string, progress: number): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.baseUrl}/${moduleId}/progress/${userId}`, null, {
      params: new HttpParams().set('progress', progress.toString())
    });
  }

  // Complete module
  completeModule(moduleId: string, userId: string): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.baseUrl}/${moduleId}/complete/${userId}`, {});
  }

  // Get next module for user
  getNextModule(courseId: string, userId: string): Observable<ApiResponse<Module>> {
    return this.http.get<ApiResponse<Module>>(`${this.baseUrl}/course/${courseId}/next/${userId}`);
  }

  // Module CRUD operations
  createModule(module: Module): Observable<ApiResponse<Module>> {
    return this.http.post<ApiResponse<Module>>(this.baseUrl, module);
  }

  updateModule(moduleId: string, module: Module): Observable<ApiResponse<Module>> {
    return this.http.put<ApiResponse<Module>>(`${this.baseUrl}/${moduleId}`, module);
  }

  deleteModule(moduleId: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}/${moduleId}`);
  }
}