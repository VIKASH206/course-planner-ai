import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

interface Activity {
  id: string;
  username: string;
  userRole: string;
  actionType: string;
  actionDescription: string;
  targetType: string;
  targetName: string;
  timestamp: string;
}

@Component({
  selector: 'app-recent-activities',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white rounded-lg shadow-md p-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-2xl font-bold text-purple-700">
          📢 Recent Updates
        </h2>
        <button 
          (click)="loadActivities()"
          class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium">
          🔄 Refresh
        </button>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="text-center py-8">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-700"></div>
        <p class="mt-2 text-gray-600">Loading activities...</p>
      </div>

      <!-- Error State -->
      <div *ngIf="error && !loading" class="bg-red-50 border border-red-200 rounded-lg p-4">
        <p class="text-red-600">❌ {{ error }}</p>
      </div>

      <!-- Activities List -->
      <div *ngIf="!loading && !error" class="space-y-3">
        <div *ngIf="activities.length === 0" class="text-center py-8 text-gray-500">
          <p class="text-lg">📭 No recent updates</p>
          <p class="text-sm mt-2">Admin activities will appear here</p>
        </div>

        <div
          *ngFor="let activity of activities"
          class="border-l-4 bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-r-lg hover:shadow-md transition-shadow"
          [ngClass]="{
            'border-blue-500': activity.actionType.includes('INTEREST'),
            'border-green-500': activity.actionType.includes('GOAL'),
            'border-purple-500': activity.actionType.includes('COURSE'),
            'border-pink-500': activity.actionType.includes('CREATED'),
            'border-orange-500': activity.actionType.includes('UPDATED'),
            'border-red-500': activity.actionType.includes('DELETED')
          }">
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <p class="text-gray-800 font-medium">{{ activity.actionDescription }}</p>
              <div class="flex items-center gap-3 mt-2 text-sm text-gray-600">
                <span class="bg-purple-100 px-2 py-1 rounded-full text-purple-700">
                  👤 {{ activity.username }}
                </span>
                <span class="bg-pink-100 px-2 py-1 rounded-full text-pink-700">
                  {{ getActionIcon(activity.actionType) }} {{ formatActionType(activity.actionType) }}
                </span>
                <span class="text-gray-500">
                  🕐 {{ formatTimestamp(activity.timestamp) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Show More Button -->
      <div *ngIf="activities.length >= 20 && !loading" class="mt-4 text-center">
        <button
          class="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all font-medium">
          📜 Load More
        </button>
      </div>
    </div>
  `,
  styles: []
})
export class RecentActivitiesComponent implements OnInit {
  activities: Activity[] = [];
  loading = false;
  error = '';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadActivities();
  }

  loadActivities() {
    this.loading = true;
    this.error = '';

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    this.http.get<any>(`${environment.apiUrl}/activities/student/recent`, { headers })
      .subscribe({
        next: (response) => {
          this.loading = false;
          if (response.success) {
            this.activities = response.data || [];
          } else {
            this.error = response.message || 'Failed to load activities';
          }
        },
        error: (err) => {
          this.loading = false;
          this.error = 'Failed to load activities. Please try again.';
          console.error('Error loading activities:', err);
        }
      });
  }

  formatActionType(actionType: string): string {
    return actionType.replace(/_/g, ' ').toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  getActionIcon(actionType: string): string {
    if (actionType.includes('CREATED')) return '✨';
    if (actionType.includes('UPDATED')) return '✏️';
    if (actionType.includes('DELETED')) return '🗑️';
    if (actionType.includes('INTEREST')) return '💡';
    if (actionType.includes('GOAL')) return '🎯';
    if (actionType.includes('COURSE')) return '📚';
    return '📌';
  }

  formatTimestamp(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  }
}
