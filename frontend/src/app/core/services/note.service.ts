import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Note,
  NoteRequest,
  ApiResponse
} from '../models/course.models';

@Injectable({
  providedIn: 'root'
})
export class NoteService {
  private readonly baseUrl = `${environment.apiUrl}/api/notes`;

  constructor(private http: HttpClient) {}

  // Get course notes
  getCourseNotes(courseId: string, userId: string): Observable<ApiResponse<Note[]>> {
    return this.http.get<ApiResponse<Note[]>>(`${this.baseUrl}/course/${courseId}/user/${userId}`);
  }

  // Get topic notes
  getTopicNotes(topicId: string, userId: string): Observable<ApiResponse<Note[]>> {
    return this.http.get<ApiResponse<Note[]>>(`${this.baseUrl}/topic/${topicId}/user/${userId}`);
  }

  // Get shared notes
  getSharedNotes(courseId: string): Observable<ApiResponse<Note[]>> {
    return this.http.get<ApiResponse<Note[]>>(`${this.baseUrl}/course/${courseId}/shared`);
  }

  // Search notes
  searchNotes(courseId: string, userId: string, query: string): Observable<ApiResponse<Note[]>> {
    return this.http.get<ApiResponse<Note[]>>(`${this.baseUrl}/course/${courseId}/user/${userId}/search`, {
      params: new HttpParams().set('query', query)
    });
  }

  // Create note
  createNote(noteRequest: NoteRequest): Observable<ApiResponse<Note>> {
    return this.http.post<ApiResponse<Note>>(this.baseUrl, noteRequest);
  }

  // Update note
  updateNote(noteId: string, noteRequest: NoteRequest): Observable<ApiResponse<Note>> {
    return this.http.put<ApiResponse<Note>>(`${this.baseUrl}/${noteId}`, noteRequest);
  }

  // Delete note
  deleteNote(noteId: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}/${noteId}`);
  }

  // Share note
  shareNote(noteId: string, userIds: string[]): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/${noteId}/share`, userIds);
  }

  // Add attachment to note
  addAttachment(noteId: string, file: File): Observable<ApiResponse<any>> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/${noteId}/attachments`, formData);
  }

  // Pin/unpin note
  pinNote(noteId: string, pinned: boolean): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.baseUrl}/${noteId}/pin`, null, {
      params: new HttpParams().set('pinned', pinned.toString())
    });
  }
}