import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AIEnhancedContent {
  description: string;
  tags: string[];
  imageUrl: string;
  emoji: string;
  aiGenerated: boolean;
  timestamp: Date;
  title: string;
  category: string;
}

/**
 * Service for AI-powered course content generation
 */
@Injectable({
  providedIn: 'root'
})
export class AIContentService {
  private apiUrl = 'http://localhost:8081/api/ai';

  constructor(private http: HttpClient) {}

  /**
   * Generate AI-powered description for a course
   */
  generateDescription(title: string, category: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/generate-description`, {
      title,
      category
    });
  }

  /**
   * Generate AI-powered tags for a course
   */
  generateTags(title: string, category: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/generate-tags`, {
      title,
      category
    });
  }

  /**
   * Generate AI-powered image for a course
   */
  generateImage(category: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/generate-image`, {
      category
    });
  }

  /**
   * Complete AI enhancement - generates all content at once
   */
  enhanceCourse(title: string, category: string): Observable<AIEnhancedContent> {
    return this.http.post<AIEnhancedContent>(`${this.apiUrl}/enhance-course`, {
      title,
      category
    });
  }

  /**
   * Get available categories
   */
  getCategories(): Observable<any> {
    return this.http.get(`${this.apiUrl}/categories`);
  }
}
