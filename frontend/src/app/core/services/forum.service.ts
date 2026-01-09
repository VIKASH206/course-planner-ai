import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Forum,
  ForumPost,
  ApiResponse,
  PaginatedResponse
} from '../models/course.models';

@Injectable({
  providedIn: 'root'
})
export class ForumService {
  private readonly baseUrl = `${environment.apiUrl}/api/forums`;

  constructor(private http: HttpClient) {}

  // Get course forums
  getCourseForums(courseId: string): Observable<ApiResponse<Forum[]>> {
    return this.http.get<ApiResponse<Forum[]>>(`${this.baseUrl}/course/${courseId}`);
  }

  // Get forum details
  getForum(forumId: string): Observable<ApiResponse<Forum>> {
    return this.http.get<ApiResponse<Forum>>(`${this.baseUrl}/${forumId}`);
  }

  // Get forum posts (paginated)
  getForumPosts(forumId: string, page: number = 0, size: number = 20): Observable<ApiResponse<PaginatedResponse<ForumPost>>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<ApiResponse<PaginatedResponse<ForumPost>>>(`${this.baseUrl}/${forumId}/posts`, { params });
  }

  // Create forum
  createForum(forum: Forum): Observable<ApiResponse<Forum>> {
    return this.http.post<ApiResponse<Forum>>(this.baseUrl, forum);
  }

  // Create forum post
  createPost(forumId: string, post: Partial<ForumPost>): Observable<ApiResponse<ForumPost>> {
    return this.http.post<ApiResponse<ForumPost>>(`${this.baseUrl}/${forumId}/posts`, post);
  }

  // Reply to post
  replyToPost(postId: string, reply: Partial<ForumPost>): Observable<ApiResponse<ForumPost>> {
    return this.http.post<ApiResponse<ForumPost>>(`${this.baseUrl}/posts/${postId}/reply`, reply);
  }

  // Like/unlike post
  togglePostLike(postId: string, userId: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/posts/${postId}/like/${userId}`, {});
  }

  // Mark post as answer
  markPostAsAnswer(postId: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/posts/${postId}/mark-answer`, {});
  }

  // Search forum posts
  searchForumPosts(forumId: string, query: string): Observable<ApiResponse<ForumPost[]>> {
    return this.http.get<ApiResponse<ForumPost[]>>(`${this.baseUrl}/${forumId}/search`, {
      params: new HttpParams().set('query', query)
    });
  }

  // Get user's posts
  getUserPosts(userId: string): Observable<ApiResponse<ForumPost[]>> {
    return this.http.get<ApiResponse<ForumPost[]>>(`${this.baseUrl}/user/${userId}/posts`);
  }

  // Update forum
  updateForum(forumId: string, forum: Forum): Observable<ApiResponse<Forum>> {
    return this.http.put<ApiResponse<Forum>>(`${this.baseUrl}/${forumId}`, forum);
  }

  // Delete forum
  deleteForum(forumId: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}/${forumId}`);
  }

  // Update post
  updatePost(postId: string, post: Partial<ForumPost>): Observable<ApiResponse<ForumPost>> {
    return this.http.put<ApiResponse<ForumPost>>(`${this.baseUrl}/posts/${postId}`, post);
  }

  // Delete post
  deletePost(postId: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}/posts/${postId}`);
  }

  // Pin/unpin post
  togglePostPin(postId: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/posts/${postId}/pin`, {});
  }
}