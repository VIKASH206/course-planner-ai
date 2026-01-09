import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Reminder,
  ReminderRequest,
  ApiResponse
} from '../models/course.models';

@Injectable({
  providedIn: 'root'
})
export class ReminderService {
  private readonly baseUrl = `${environment.apiUrl}/api/reminders`;

  constructor(private http: HttpClient) {}

  // Get user reminders
  getUserReminders(userId: string): Observable<ApiResponse<Reminder[]>> {
    return this.http.get<ApiResponse<Reminder[]>>(`${this.baseUrl}/user/${userId}`);
  }

  // Get due reminders
  getDueReminders(userId: string): Observable<ApiResponse<Reminder[]>> {
    return this.http.get<ApiResponse<Reminder[]>>(`${this.baseUrl}/user/${userId}/due`);
  }

  // Get upcoming reminders
  getUpcomingReminders(userId: string, hours: number = 24): Observable<ApiResponse<Reminder[]>> {
    return this.http.get<ApiResponse<Reminder[]>>(`${this.baseUrl}/user/${userId}/upcoming`, {
      params: new HttpParams().set('hours', hours.toString())
    });
  }

  // Create reminder
  createReminder(reminderRequest: ReminderRequest): Observable<ApiResponse<Reminder>> {
    return this.http.post<ApiResponse<Reminder>>(this.baseUrl, reminderRequest);
  }

  // Update reminder
  updateReminder(reminderId: string, reminderRequest: ReminderRequest): Observable<ApiResponse<Reminder>> {
    return this.http.put<ApiResponse<Reminder>>(`${this.baseUrl}/${reminderId}`, reminderRequest);
  }

  // Delete reminder
  deleteReminder(reminderId: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}/${reminderId}`);
  }

  // Complete reminder
  completeReminder(reminderId: string): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.baseUrl}/${reminderId}/complete`, {});
  }

  // Snooze reminder
  snoozeReminder(reminderId: string, minutes: number): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.baseUrl}/${reminderId}/snooze`, null, {
      params: new HttpParams().set('minutes', minutes.toString())
    });
  }

  // Get reminder details
  getReminder(reminderId: string): Observable<ApiResponse<Reminder>> {
    return this.http.get<ApiResponse<Reminder>>(`${this.baseUrl}/${reminderId}`);
  }
}