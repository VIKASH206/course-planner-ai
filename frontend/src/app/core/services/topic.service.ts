import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Topic,
  ApiResponse,
  ProgressUpdateRequest
} from '../models/course.models';

@Injectable({
  providedIn: 'root'
})
export class TopicService {
  private readonly baseUrl = `${environment.apiUrl}/api/topics`;

  constructor(private http: HttpClient) {}

  // Get topics for a module
  getModuleTopics(moduleId: string): Observable<ApiResponse<Topic[]>> {
    return this.http.get<ApiResponse<Topic[]>>(`${this.baseUrl}/module/${moduleId}`);
  }

  // Get topic details
  getTopic(topicId: string): Observable<ApiResponse<Topic>> {
    return this.http.get<ApiResponse<Topic>>(`${this.baseUrl}/${topicId}`);
  }

  // Update topic progress
  updateTopicProgress(topicId: string, userId: string, progress: number): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.baseUrl}/${topicId}/progress/${userId}`, null, {
      params: new HttpParams().set('progress', progress.toString())
    });
  }

  // Complete topic
  completeTopic(topicId: string, userId: string): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.baseUrl}/${topicId}/complete/${userId}`, {});
  }

  // Bookmark topic
  bookmarkTopic(topicId: string, userId: string, bookmarked: boolean): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.baseUrl}/${topicId}/bookmark/${userId}`, null, {
      params: new HttpParams().set('bookmarked', bookmarked.toString())
    });
  }

  // Get AI topic summary
  getTopicSummary(topicId: string): Observable<ApiResponse<string>> {
    return this.http.get<ApiResponse<string>>(`${this.baseUrl}/${topicId}/summary`);
  }

  // Get next suggested topic (AI)
  getNextSuggestedTopic(courseId: string, userId: string): Observable<ApiResponse<Topic>> {
    return this.http.get<ApiResponse<Topic>>(`${this.baseUrl}/course/${courseId}/next/${userId}`);
  }

  // Get bookmarked topics
  getBookmarkedTopics(courseId: string, userId: string): Observable<ApiResponse<Topic[]>> {
    return this.http.get<ApiResponse<Topic[]>>(`${this.baseUrl}/course/${courseId}/bookmarks/${userId}`);
  }

  // Topic CRUD operations
  createTopic(topic: Topic): Observable<ApiResponse<Topic>> {
    return this.http.post<ApiResponse<Topic>>(this.baseUrl, topic);
  }

  updateTopic(topicId: string, topic: Topic): Observable<ApiResponse<Topic>> {
    return this.http.put<ApiResponse<Topic>>(`${this.baseUrl}/${topicId}`, topic);
  }

  deleteTopic(topicId: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}/${topicId}`);
  }
}