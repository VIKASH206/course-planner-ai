import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ChatMessage,
  AIRecommendation,
  Quiz,
  ApiResponse
} from '../models/course.models';

@Injectable({
  providedIn: 'root'
})
export class AIService {
  private readonly baseUrl = `${environment.apiUrl}/api/ai`;

  constructor(private http: HttpClient) {}

  // AI Course Chatbot
  chatWithAI(courseId: string, message: string, userId: string): Observable<ApiResponse<ChatMessage>> {
    return this.http.post<ApiResponse<ChatMessage>>(`${this.baseUrl}/chat/course/${courseId}`, {
      message: message,
      userId: userId
    });
  }

  // Get AI next topic suggestion
  getNextTopicSuggestion(userId: string, courseId: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/suggest/next-topic/${userId}/course/${courseId}`);
  }

  // Generate AI quiz from topic
  generateQuizFromTopic(topicId: string, questionCount: number = 5, difficulty: string = 'MEDIUM'): Observable<ApiResponse<Quiz>> {
    return this.http.post<ApiResponse<Quiz>>(`${this.baseUrl}/generate/quiz/topic/${topicId}`, null, {
      params: new HttpParams()
        .set('questionCount', questionCount.toString())
        .set('difficulty', difficulty)
    });
  }

  // Generate AI flashcards
  generateFlashcards(content: string, topicId?: string): Observable<ApiResponse<any>> {
    const body: any = { content: content };
    if (topicId) {
      body.topicId = topicId;
    }
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/generate/flashcards`, body);
  }

  // Get AI performance feedback
  getPerformanceFeedback(userId: string, courseId: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/feedback/performance/${userId}/course/${courseId}`);
  }

  // Get AI performance analysis
  getPerformanceAnalysis(userId: string, courseId: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/analyze/performance/${userId}/course/${courseId}`);
  }

  // Generate AI topic summary
  generateTopicSummary(topicId: string): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(`${this.baseUrl}/generate/summary/topic/${topicId}`, {});
  }

  // Get AI learning path recommendations
  getLearningPathRecommendations(userId: string, courseId: string): Observable<ApiResponse<AIRecommendation[]>> {
    return this.http.get<ApiResponse<AIRecommendation[]>>(`${this.baseUrl}/recommend/path/${userId}/course/${courseId}`);
  }

  // Get personalized study plan
  getPersonalizedStudyPlan(userId: string, courseId: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/study-plan/${userId}/course/${courseId}`, {});
  }

  // Get AI-powered content recommendations
  getContentRecommendations(userId: string, topicId: string): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(`${this.baseUrl}/recommend/content/${userId}/topic/${topicId}`);
  }

  // Get AI difficulty assessment
  getDifficultyAssessment(userId: string, courseId: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/assess/difficulty/${userId}/course/${courseId}`);
  }

  // Get AI study session recommendations
  getStudySessionRecommendations(userId: string): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(`${this.baseUrl}/recommend/study-session/${userId}`);
  }
}