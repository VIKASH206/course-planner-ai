import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Badge,
  UserBadge,
  ApiResponse
} from '../models/course.models';

@Injectable({
  providedIn: 'root'
})
export class BadgeService {
  private readonly baseUrl = `${environment.apiUrl}/api/badges`;

  constructor(private http: HttpClient) {}

  // Get all available badges
  getAllBadges(): Observable<ApiResponse<Badge[]>> {
    return this.http.get<ApiResponse<Badge[]>>(this.baseUrl);
  }

  // Get user's badges
  getUserBadges(userId: string): Observable<ApiResponse<UserBadge[]>> {
    return this.http.get<ApiResponse<UserBadge[]>>(`${this.baseUrl}/user/${userId}`);
  }

  // Check for new badges (after completing activities)
  checkForNewBadges(userId: string): Observable<ApiResponse<UserBadge[]>> {
    return this.http.post<ApiResponse<UserBadge[]>>(`${this.baseUrl}/check/${userId}`, {});
  }

  // Get badge leaderboard
  getBadgeLeaderboard(): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(`${this.baseUrl}/leaderboard`);
  }

  // Get badges by category
  getBadgesByCategory(category: string): Observable<ApiResponse<Badge[]>> {
    return this.http.get<ApiResponse<Badge[]>>(`${this.baseUrl}/category/${category}`);
  }

  // Update badge display preference
  updateBadgeDisplay(userBadgeId: string, isDisplayed: boolean): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.baseUrl}/user-badges/${userBadgeId}/display`, null, {
      params: new HttpParams().set('isDisplayed', isDisplayed.toString())
    });
  }

  // Get badge details
  getBadge(badgeId: string): Observable<ApiResponse<Badge>> {
    return this.http.get<ApiResponse<Badge>>(`${this.baseUrl}/${badgeId}`);
  }

  // Get user's progress towards badges
  getUserBadgeProgress(userId: string): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(`${this.baseUrl}/user/${userId}/progress`);
  }
}