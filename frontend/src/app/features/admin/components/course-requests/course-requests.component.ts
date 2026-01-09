import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';

interface CourseRequest {
  id: string;
  interest: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  requestedBy: number;
  lastRequestedDate: string;
  status: 'Pending' | 'Planned';
}

@Component({
  selector: 'app-course-requests',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen p-4 bg-gradient-to-br from-purple-50 to-pink-50">
      <div class="max-w-7xl mx-auto">
      <!-- Page Header -->
      <div class="mb-4 bg-white p-4 rounded-lg shadow border-l-4 border-purple-600">
        <h1 class="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-2">📝 Course Requests</h1>
        <p class="text-sm text-gray-600">Track what courses users want but are not available yet</p>
      </div>

      <!-- Stats Summary -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <div class="bg-gradient-to-br from-purple-500 to-purple-700 p-4 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all">
          <div class="text-4xl mb-2 text-center">📋</div>
          <h3 class="text-sm font-bold text-white text-center mb-2">Total Requests</h3>
          <p class="text-3xl font-bold text-white text-center mb-2">{{ getTotalRequests() }}</p>
          <div class="bg-purple-800 bg-opacity-50 p-2 rounded">
            <p class="text-xs text-purple-100 text-center">All time</p>
          </div>
        </div>
        <div class="bg-gradient-to-br from-yellow-500 to-yellow-700 p-4 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all">
          <div class="text-4xl mb-2 text-center">⏳</div>
          <h3 class="text-sm font-bold text-white text-center mb-2">Pending</h3>
          <p class="text-3xl font-bold text-white text-center mb-2">{{ getPendingCount() }}</p>
          <div class="bg-yellow-800 bg-opacity-50 p-2 rounded">
            <p class="text-xs text-yellow-100 text-center">Needs action</p>
          </div>
        </div>
        <div class="bg-gradient-to-br from-blue-500 to-blue-700 p-4 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all">
          <div class="text-4xl mb-2 text-center">📅</div>
          <h3 class="text-sm font-bold text-white text-center mb-2">Planned</h3>
          <p class="text-3xl font-bold text-white text-center mb-2">{{ getPlannedCount() }}</p>
          <div class="bg-blue-800 bg-opacity-50 p-2 rounded">
            <p class="text-xs text-blue-100 text-center">In progress</p>
          </div>
        </div>
        <div class="bg-gradient-to-br from-green-500 to-green-700 p-4 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all">
          <div class="text-4xl mb-2 text-center">👥</div>
          <h3 class="text-sm font-bold text-white text-center mb-2">Users Requesting</h3>
          <p class="text-3xl font-bold text-white text-center mb-2">{{ getTotalUsers() }}</p>
          <div class="bg-green-800 bg-opacity-50 p-2 rounded">
            <p class="text-xs text-green-100 text-center">Active users</p>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-lg shadow-lg p-4 mb-4 relative z-10">
        <div class="flex gap-4 items-center flex-wrap">
          <div class="flex items-center gap-2 relative">
            <select [(ngModel)]="filterStatus" (change)="applyFilters()" class="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 outline-none text-sm bg-white cursor-pointer hover:border-purple-400 transition-colors relative z-20 min-w-[150px]">
              <option value="">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Planned">Planned</option>
            </select>
          </div>
          <div class="flex items-center gap-2 relative">
            <select [(ngModel)]="filterLevel" (change)="applyFilters()" class="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 outline-none text-sm bg-white cursor-pointer hover:border-purple-400 transition-colors relative z-20 min-w-[150px]">
              <option value="">All Levels</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
          <button (click)="resetFilters()" class="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transform hover:scale-105 transition-all">
            Reset Filters
          </button>
        </div>
      </div>

      <!-- Requests Table -->
      <div class="bg-white rounded-lg shadow-lg border-t-4 border-purple-500 overflow-hidden">
        @if (filteredRequests().length === 0) {
          <div class="text-center py-8 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 m-4">
            <span class="text-4xl mb-2 block">📭</span>
            <p class="text-sm text-gray-500 font-medium">No course requests found</p>
            <p class="text-xs text-gray-400 mt-1">Users haven't requested any courses yet</p>
          </div>
        } @else {
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gradient-to-r from-purple-50 to-pink-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Interest</th>
                  <th class="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Level</th>
                  <th class="px-6 py-3 text-center text-xs font-bold text-gray-700 uppercase">Requested By</th>
                  <th class="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Last Requested</th>
                  <th class="px-6 py-3 text-center text-xs font-bold text-gray-700 uppercase">Status</th>
                  <th class="px-6 py-3 text-center text-xs font-bold text-gray-700 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (request of filteredRequests(); track request.id) {
                  <tr class="border-b hover:bg-purple-50 transition-colors">
                    <td class="px-6 py-4">
                      <span class="font-semibold text-gray-800">{{ request.interest }}</span>
                    </td>
                    <td class="px-6 py-4">
                      <span class="px-3 py-1 rounded-full text-sm font-semibold" 
                            [class.bg-green-100]="request.level === 'Beginner'"
                            [class.text-green-700]="request.level === 'Beginner'"
                            [class.bg-yellow-100]="request.level === 'Intermediate'"
                            [class.text-yellow-700]="request.level === 'Intermediate'"
                            [class.bg-red-100]="request.level === 'Advanced'"
                            [class.text-red-700]="request.level === 'Advanced'">
                        {{ request.level }}
                      </span>
                    </td>
                    <td class="px-6 py-4 text-center">
                      <span class="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 text-white font-bold">
                        {{ request.requestedBy }}
                      </span>
                      <span class="text-sm text-gray-600 ml-2">users</span>
                    </td>
                    <td class="px-6 py-4 text-gray-600">
                      {{ request.lastRequestedDate }}
                    </td>
                    <td class="px-6 py-4 text-center">
                      <span class="px-4 py-2 rounded-full text-sm font-bold"
                            [class.bg-yellow-100]="request.status === 'Pending'"
                            [class.text-yellow-700]="request.status === 'Pending'"
                            [class.bg-blue-100]="request.status === 'Planned'"
                            [class.text-blue-700]="request.status === 'Planned'">
                        {{ request.status }}
                      </span>
                    </td>
                    <td class="px-6 py-4">
                      <div class="flex gap-2 justify-center">
                        <button (click)="convertToCourse(request)" 
                                class="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg font-semibold transition-all transform hover:scale-105">
                          ✅ Create Course
                        </button>
                        @if (request.status === 'Pending') {
                          <button (click)="markAsPlanned(request)"
                                  class="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg font-semibold transition-all transform hover:scale-105">
                            📅 Mark Planned
                          </button>
                        }
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>
      </div>
    </div>
  `,
  styles: [`
    .animate-fade-in {
      animation: fadeIn 0.6s ease-out;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .glass-card {
      backdrop-filter: blur(10px);
    }

    /* Dropdown select styling */
    select {
      appearance: auto !important;
      -webkit-appearance: menulist !important;
      -moz-appearance: menulist !important;
      color: #1e293b !important;
      background-image: none !important;
    }

    select option {
      background: white;
      color: #1e293b;
      padding: 8px 12px;
      font-size: 14px;
    }

    select:focus option:checked,
    select option:hover {
      background: #f3e8ff;
      color: #7c3aed;
    }
  `]
})
export class CourseRequestsComponent implements OnInit {
  // Course requests data - will be populated from backend
  allRequests = signal<CourseRequest[]>([]);
  filteredRequests = signal<CourseRequest[]>([]);
  
  filterStatus: string = '';
  filterLevel: string = '';
  
  private apiUrl = `${environment.apiUrl}/course-requests`;

  constructor(
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.loadCourseRequests();
  }

  loadCourseRequests(): void {
    this.http.get<any>(this.apiUrl).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.allRequests.set(response.data);
          this.applyFilters();
        }
      },
      error: (error) => {
        console.error('Error loading course requests:', error);
        this.allRequests.set([]);
        this.applyFilters();
      }
    });
  }

  applyFilters(): void {
    let filtered = this.allRequests();

    if (this.filterStatus) {
      filtered = filtered.filter(r => r.status === this.filterStatus);
    }

    if (this.filterLevel) {
      filtered = filtered.filter(r => r.level === this.filterLevel);
    }

    this.filteredRequests.set(filtered);
  }

  resetFilters(): void {
    this.filterStatus = '';
    this.filterLevel = '';
    this.applyFilters();
  }

  getTotalRequests(): number {
    return this.allRequests().length;
  }

  getPendingCount(): number {
    return this.allRequests().filter(r => r.status === 'Pending').length;
  }

  getPlannedCount(): number {
    return this.allRequests().filter(r => r.status === 'Planned').length;
  }

  getTotalUsers(): number {
    return this.allRequests().reduce((sum, r) => sum + r.requestedBy, 0);
  }

  convertToCourse(request: CourseRequest): void {
    if (confirm(`Create a new course for "${request.interest}" - ${request.level}?`)) {
      // TODO: Navigate to course creation with pre-filled data
      this.router.navigate(['/admin/courses'], { 
        queryParams: { 
          interest: request.interest, 
          level: request.level 
        } 
      });
    }
  }

  markAsPlanned(request: CourseRequest): void {
    if (confirm(`Mark "${request.interest}" - ${request.level} as Planned?`)) {
      this.http.patch<any>(`${this.apiUrl}/${request.id}/mark-planned`, {}).subscribe({
        next: (response) => {
          if (response.success) {
            // Update local state
            const requests = this.allRequests();
            const index = requests.findIndex(r => r.id === request.id);
            if (index !== -1) {
              requests[index].status = 'Planned';
              this.allRequests.set([...requests]);
              this.applyFilters();
            }
          }
        },
        error: (error) => {
          console.error('Error marking as planned:', error);
          alert('Failed to update status. Please try again.');
        }
      });
    }
  }
}
