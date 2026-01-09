import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Quiz,
  QuizAttempt,
  QuizGenerationRequest,
  ApiResponse
} from '../models/course.models';

@Injectable({
  providedIn: 'root'
})
export class QuizService {
  private readonly baseUrl = `${environment.apiUrl}/api/quizzes`;

  constructor(private http: HttpClient) {}

  // Get course quizzes
  getCourseQuizzes(courseId: string): Observable<ApiResponse<Quiz[]>> {
    return this.http.get<ApiResponse<Quiz[]>>(`${this.baseUrl}/course/${courseId}`);
  }

  // Get quiz details
  getQuiz(quizId: string): Observable<ApiResponse<Quiz>> {
    return this.http.get<ApiResponse<Quiz>>(`${this.baseUrl}/${quizId}`);
  }

  // Start quiz attempt
  startQuizAttempt(quizId: string, userId: string): Observable<ApiResponse<QuizAttempt>> {
    return this.http.post<ApiResponse<QuizAttempt>>(`${this.baseUrl}/${quizId}/start/${userId}`, {});
  }

  // Submit quiz attempt
  submitQuizAttempt(attemptId: string, answers: { [questionId: string]: string[] }): Observable<ApiResponse<QuizAttempt>> {
    return this.http.post<ApiResponse<QuizAttempt>>(`${this.baseUrl}/attempts/${attemptId}/submit`, {
      answers: answers
    });
  }

  // Get quiz attempts
  getQuizAttempts(quizId: string, userId: string): Observable<ApiResponse<QuizAttempt[]>> {
    return this.http.get<ApiResponse<QuizAttempt[]>>(`${this.baseUrl}/${quizId}/attempts/${userId}`);
  }

  // Generate AI quiz from topic
  generateAIQuizFromTopic(topicId: string, questionCount: number = 5, difficulty: string = 'MEDIUM'): Observable<ApiResponse<Quiz>> {
    return this.http.post<ApiResponse<Quiz>>(`${this.baseUrl}/generate/topic/${topicId}`, null, {
      params: new HttpParams()
        .set('questionCount', questionCount.toString())
        .set('difficulty', difficulty)
    });
  }

  // Generate flashcards from notes
  generateFlashcards(noteContent: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/flashcards/generate`, {
      noteContent: noteContent
    });
  }

  // Get quiz analytics
  getQuizAnalytics(courseId: string, userId: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/course/${courseId}/analytics/${userId}`);
  }

  // Quiz CRUD operations
  createQuiz(quiz: Quiz): Observable<ApiResponse<Quiz>> {
    return this.http.post<ApiResponse<Quiz>>(this.baseUrl, quiz);
  }

  updateQuiz(quizId: string, quiz: Quiz): Observable<ApiResponse<Quiz>> {
    return this.http.put<ApiResponse<Quiz>>(`${this.baseUrl}/${quizId}`, quiz);
  }

  deleteQuiz(quizId: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}/${quizId}`);
  }
}