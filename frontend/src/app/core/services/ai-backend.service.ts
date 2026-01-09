import { Injectable, signal } from '@angular/core';
import { Observable, throwError, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { BackendApiService, QuizRequest, ChatRequest } from './backend-api.service';
import { AuthService } from './auth-backend.service';

@Injectable({
  providedIn: 'root'
})
export class AiService {
  // Reactive state for AI features
  private _isGenerating = signal<boolean>(false);
  private _lastStudyPath = signal<string | null>(null);
  private _lastQuiz = signal<string | null>(null);
  private _lastSummary = signal<string | null>(null);
  private _lastChatResponse = signal<string | null>(null);

  // Public readonly signals
  isGenerating = this._isGenerating.asReadonly();
  lastStudyPath = this._lastStudyPath.asReadonly();
  lastQuiz = this._lastQuiz.asReadonly();
  lastSummary = this._lastSummary.asReadonly();
  lastChatResponse = this._lastChatResponse.asReadonly();

  constructor(
    private backendApi: BackendApiService,
    private authService: AuthService
  ) {}

  /**
   * Generate a study path for a user
   */
  generateStudyPath(userId?: string): Observable<string> {
    const currentUserId = userId || this.authService.getCurrentUserId();
    if (!currentUserId) {
      return throwError(() => new Error('No user logged in'));
    }

    this._isGenerating.set(true);

    return this.backendApi.generateStudyPath(currentUserId).pipe(
      map(response => {
        if (response.success) {
          const studyPath = response.data;
          this._lastStudyPath.set(studyPath);
          return studyPath;
        } else {
          throw new Error(response.message);
        }
      }),
      catchError(error => {
        console.error('Failed to generate study path:', error);
        return throwError(() => error);
      }),
      tap(() => this._isGenerating.set(false))
    );
  }

  /**
   * Generate a quiz for content
   */
  generateQuiz(content: string, numberOfQuestions: number = 5): Observable<string> {
    this._isGenerating.set(true);

    const request: QuizRequest = {
      content,
      numberOfQuestions
    };

    return this.backendApi.generateQuiz(request).pipe(
      map(response => {
        if (response.success) {
          const quiz = response.data;
          this._lastQuiz.set(quiz);
          return quiz;
        } else {
          throw new Error(response.message);
        }
      }),
      catchError(error => {
        console.error('Failed to generate quiz:', error);
        return throwError(() => error);
      }),
      tap(() => this._isGenerating.set(false))
    );
  }

  /**
   * Summarize content
   */
  summarizeContent(content: string): Observable<string> {
    this._isGenerating.set(true);

    return this.backendApi.summarizeContent(content).pipe(
      map(response => {
        if (response.success) {
          const summary = response.data;
          this._lastSummary.set(summary);
          return summary;
        } else {
          throw new Error(response.message);
        }
      }),
      catchError(error => {
        console.error('Failed to summarize content:', error);
        return throwError(() => error);
      }),
      tap(() => this._isGenerating.set(false))
    );
  }

  /**
   * Get smart reminders for a user
   */
  getSmartReminders(userId?: string): Observable<string> {
    const currentUserId = userId || this.authService.getCurrentUserId();
    if (!currentUserId) {
      return throwError(() => new Error('No user logged in'));
    }

    return this.backendApi.getSmartReminders(currentUserId).pipe(
      map(response => {
        if (response.success) {
          return response.data;
        } else {
          throw new Error(response.message);
        }
      }),
      catchError(error => {
        console.error('Failed to get smart reminders:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Chat with AI
   */
  aiChat(message: string, context?: string): Observable<string> {
    const currentUserId = this.authService.getCurrentUserId();
    if (!currentUserId) {
      return throwError(() => new Error('No user logged in'));
    }

    this._isGenerating.set(true);

    const request: ChatRequest = {
      message,
      context,
      userId: currentUserId
    };

    return this.backendApi.aiChat(request).pipe(
      map(response => {
        if (response.success) {
          const chatResponse = response.data;
          this._lastChatResponse.set(chatResponse);
          return chatResponse;
        } else {
          throw new Error(response.message);
        }
      }),
      catchError(error => {
        console.error('Failed to chat with AI:', error);
        return throwError(() => error);
      }),
      tap(() => this._isGenerating.set(false))
    );
  }

  /**
   * Generate study tips based on weak and strong areas
   */
  generateStudyTips(weakAreas: string, strongAreas?: string): Observable<string> {
    this._isGenerating.set(true);

    return this.backendApi.generateStudyTips(weakAreas, strongAreas).pipe(
      map(response => {
        if (response.success) {
          return response.data;
        } else {
          throw new Error(response.message);
        }
      }),
      catchError(error => {
        console.error('Failed to generate study tips:', error);
        return throwError(() => error);
      }),
      tap(() => this._isGenerating.set(false))
    );
  }

  /**
   * Analyze progress data
   */
  analyzeProgress(progressData: string): Observable<string> {
    this._isGenerating.set(true);

    return this.backendApi.analyzeProgress(progressData).pipe(
      map(response => {
        if (response.success) {
          return response.data;
        } else {
          throw new Error(response.message);
        }
      }),
      catchError(error => {
        console.error('Failed to analyze progress:', error);
        return throwError(() => error);
      }),
      tap(() => this._isGenerating.set(false))
    );
  }

  /**
   * Utility methods for AI features
   */

  /**
   * Check if AI is currently processing
   */
  isAiProcessing(): boolean {
    return this._isGenerating();
  }

  /**
   * Get quick study tips (mock implementation using generateStudyTips)
   */
  getQuickStudyTips(): Observable<string[]> {
    const currentUser = this.authService.currentUser();
    if (!currentUser) {
      return of([
        'Review your notes regularly for better retention',
        'Take breaks every 25-30 minutes while studying',
        'Practice active recall by testing yourself',
        'Use spaced repetition for long-term memory',
        'Study in a quiet, well-lit environment'
      ]);
    }

    // Use user's completed tasks as strong areas and pending as weak areas
    const weakAreas = 'general study areas';
    return this.generateStudyTips(weakAreas).pipe(
      map(tips => {
        // Parse the AI response into individual tips
        return tips.split('\n')
          .filter(tip => tip.trim().length > 0)
          .slice(0, 5);
      }),
      catchError(() => {
        // Return default tips if AI fails
        return of([
          'Review your notes regularly for better retention',
          'Take breaks every 25-30 minutes while studying',
          'Practice active recall by testing yourself',
          'Use spaced repetition for long-term memory',
          'Study in a quiet, well-lit environment'
        ]);
      })
    );
  }

  /**
   * Parse quiz content from AI response
   */
  parseQuizFromResponse(quizResponse: string): any {
    try {
      // Try to parse as JSON first
      return JSON.parse(quizResponse);
    } catch {
      // If not JSON, parse as structured text
      const lines = quizResponse.split('\n').filter(line => line.trim());
      const questions: any[] = [];
      let currentQuestion: any = null;

      for (const line of lines) {
        if (line.match(/^\d+\./)) {
          // New question
          if (currentQuestion) {
            questions.push(currentQuestion);
          }
          currentQuestion = {
            question: line.replace(/^\d+\.\s*/, ''),
            options: [] as string[],
            correctAnswer: '' as string
          };
        } else if (line.match(/^[A-D]\)/)) {
          // Answer option
          if (currentQuestion) {
            currentQuestion.options.push(line.replace(/^[A-D]\)\s*/, ''));
          }
        } else if (line.toLowerCase().includes('answer:')) {
          // Correct answer
          if (currentQuestion) {
            currentQuestion.correctAnswer = line.replace(/.*answer:\s*/i, '');
          }
        }
      }

      if (currentQuestion) {
        questions.push(currentQuestion);
      }

      return {
        questions,
        topic: 'Generated Quiz',
        difficulty: 'medium'
      };
    }
  }

  /**
   * Format quiz results for display
   */
  formatQuizResults(quiz: any, answers: any[]): any {
    if (!quiz || !quiz.questions || !answers) {
      return null;
    }

    const results = quiz.questions.map((question: any, index: number) => {
      const userAnswer = answers[index];
      const correctAnswer = question.correctAnswer || question.answer;
      const isCorrect = userAnswer === correctAnswer;

      return {
        question: question.question,
        userAnswer,
        correctAnswer,
        isCorrect,
        explanation: question.explanation
      };
    });

    const correctCount = results.filter((r: any) => r.isCorrect).length;
    const totalQuestions = results.length;
    const score = Math.round((correctCount / totalQuestions) * 100);

    return {
      results,
      score,
      correctCount,
      totalQuestions,
      feedback: this.getScoreFeedback(score)
    };
  }

  /**
   * Get feedback based on quiz score
   */
  private getScoreFeedback(score: number): string {
    if (score >= 90) return 'Excellent! You have mastered this topic.';
    if (score >= 80) return 'Great job! You have a good understanding.';
    if (score >= 70) return 'Good work! Review the areas you missed.';
    if (score >= 60) return 'Fair performance. Consider more study time.';
    return 'Keep practicing! Review the material and try again.';
  }

  /**
   * Reset AI state (useful for logout)
   */
  resetState(): void {
    this._isGenerating.set(false);
    this._lastStudyPath.set(null);
    this._lastQuiz.set(null);
    this._lastSummary.set(null);
    this._lastChatResponse.set(null);
  }
}