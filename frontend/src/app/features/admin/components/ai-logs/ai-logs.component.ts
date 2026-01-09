import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';

interface AILog {
  id: string;
  userId: string;
  username: string;
  interest?: string;
  level: string;
  recommendedCourses: string;
  status: string;
  createdAt: string;
}

@Component({
  selector: 'app-ai-logs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen p-4 bg-gradient-to-br from-purple-50 to-pink-50">
      <div class="max-w-7xl mx-auto">
        <!-- Header with Search -->
        <div class="mb-4 bg-white p-4 rounded-lg shadow border-l-4 border-purple-600">
          <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 class="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-2">🤖 AI Recommendation Logs</h1>
              <p class="text-sm text-gray-600">View all AI-generated course recommendations</p>
            </div>
            <div class="relative">
              <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
              <input 
                type="text" 
                [(ngModel)]="searchTerm" 
                (input)="filterLogs()"
                placeholder="Search by user name or email..."
                class="pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 outline-none w-full lg:w-80 text-sm">
            </div>
          </div>
        </div>

        <!-- Filters -->
        <div class="bg-white rounded-lg shadow-lg p-4 mb-4 relative z-10">
          <div class="flex gap-4 items-center flex-wrap">
            <div class="flex items-center gap-2 relative">
              <select [(ngModel)]="filterStatus" (change)="filterLogs()" class="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 outline-none text-sm bg-white cursor-pointer hover:border-purple-400 transition-colors relative z-20 min-w-[150px]">
                <option value="">All Status</option>
                <option value="Success">Success</option>
                <option value="Coming Soon">Coming Soon</option>
              </select>
            </div>
            <div class="flex items-center gap-2 relative">
              <select [(ngModel)]="filterInterest" (change)="filterLogs()" class="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 outline-none text-sm bg-white cursor-pointer hover:border-purple-400 transition-colors relative z-20 min-w-[150px]">
                <option value="">All Interests</option>
                @for (interest of uniqueInterests; track interest) {
                  <option [value]="interest">{{ interest }}</option>
                }
              </select>
            </div>
            <button (click)="resetFilters()" class="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transform hover:scale-105 transition-all">
              Reset Filters
            </button>
          </div>
        </div>

        <!-- Logs Table -->
        <div class="bg-white rounded-lg shadow-lg border-t-4 border-purple-500 overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gradient-to-r from-purple-50 to-pink-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">User</th>
                  <th class="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Interest</th>
                  <th class="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Level</th>
                  <th class="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Recommended Courses</th>
                  <th class="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Status</th>
                  <th class="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Date & Time</th>
                </tr>
              </thead>
              <tbody>
                @for (log of filteredLogs(); track log.id) {
                  <tr class="border-b hover:bg-purple-50 transition-colors">
                    <td class="px-6 py-4">
                      <div class="flex flex-col">
                        <span class="font-semibold text-gray-800 text-sm">{{ log.username }}</span>
                        <span class="text-xs text-gray-500">{{ log.userId }}</span>
                      </div>
                    </td>
                    <td class="px-6 py-4">
                      <span class="px-3 py-1 bg-gradient-to-r from-purple-100 to-purple-200 text-purple-700 rounded-full text-xs font-semibold">
                        {{ log.interest || 'N/A' }}
                      </span>
                    </td>
                    <td class="px-6 py-4">
                      <span class="px-3 py-1 rounded-full text-xs font-semibold" 
                            [class.bg-green-100]="log.level === 'Basic' || log.level === 'Beginner'"
                            [class.text-green-700]="log.level === 'Basic' || log.level === 'Beginner'"
                            [class.bg-yellow-100]="log.level === 'Intermediate'"
                            [class.text-yellow-700]="log.level === 'Intermediate'"
                            [class.bg-red-100]="log.level === 'Advanced'"
                            [class.text-red-700]="log.level === 'Advanced'">
                        {{ log.level }}
                      </span>
                    </td>
                    <td class="px-6 py-4">
                      <span class="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                        {{ log.recommendedCourses }}
                      </span>
                    </td>
                    <td class="px-6 py-4">
                      <span class="px-3 py-1 rounded-full text-xs font-semibold"
                            [class.bg-green-100]="log.status === 'Success'"
                            [class.text-green-700]="log.status === 'Success'"
                            [class.bg-orange-100]="log.status === 'Coming Soon'"
                            [class.text-orange-700]="log.status === 'Coming Soon'">
                        {{ log.status }}
                      </span>
                    </td>
                    <td class="px-6 py-4 text-gray-600 text-sm">{{ formatDate(log.createdAt) }}</td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="6" class="p-8">
                      <div class="text-center py-4 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300">
                        <span class="text-4xl mb-2 block">📋</span>
                        <p class="text-sm text-gray-500 font-medium">No logs found</p>
                        <p class="text-xs text-gray-400 mt-1">AI recommendations will appear here</p>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .ai-logs-container {
      max-width: 1400px;
      margin: 0 auto;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .page-title {
      font-size: 2rem;
      font-weight: 700;
      color: #1e293b;
      margin: 0 0 0.25rem 0;
    }

    .page-subtitle {
      color: #64748b;
      margin: 0;
    }

    .search-box {
      display: flex;
      align-items: center;
      background: white;
      border: 2px solid #e2e8f0;
      border-radius: 10px;
      padding: 0.625rem 1rem;
      min-width: 300px;
    }

    .search-box:focus-within {
      border-color: #667eea;
    }

    .search-input {
      border: none;
      outline: none;
      flex: 1;
      margin-left: 0.5rem;
    }

    .filters-bar {
      display: flex;
      gap: 1rem;
      margin-bottom: 1.5rem;
      padding: 1rem;
      background: white;
      border-radius: 10px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    }

    .filter-select {
      padding: 0.5rem 1rem;
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      outline: none;
      min-width: 180px;
    }

    .btn-reset {
      padding: 0.5rem 1.25rem;
      background: #f1f5f9;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      margin-left: auto;
    }

    .btn-reset:hover {
      background: #e2e8f0;
    }

    .table-container {
      background: white;
      border-radius: 10px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
      overflow-x: auto;
    }

    .logs-table {
      width: 100%;
      border-collapse: collapse;
    }

    .logs-table thead {
      background: #f8fafc;
      border-bottom: 2px solid #e2e8f0;
    }

    .logs-table th {
      padding: 1rem 1.25rem;
      text-align: left;
      font-size: 0.875rem;
      font-weight: 700;
      color: #475569;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .logs-table td {
      padding: 1.25rem;
      border-bottom: 1px solid #f1f5f9;
      font-size: 0.9rem;
      color: #334155;
    }

    .logs-table tbody tr:hover {
      background: #fafbfc;
    }

    .user-info {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .user-email {
      font-size: 0.8rem;
      color: #94a3b8;
    }

    .badge {
      padding: 0.375rem 0.875rem;
      border-radius: 6px;
      font-size: 0.75rem;
      font-weight: 600;
      display: inline-block;
    }

    .badge-interest {
      background: #ede9fe;
      color: #7c3aed;
    }

    .badge-level {
      background: #dbeafe;
      color: #2563eb;
    }

    .courses-list {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .course-tag {
      padding: 0.25rem 0.625rem;
      background: #f1f5f9;
      border-radius: 4px;
      font-size: 0.8rem;
      color: #475569;
    }

    .status-badge {
      padding: 0.375rem 0.875rem;
      border-radius: 6px;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
    }

    .status-success {
      background: #dcfce7;
      color: #16a34a;
    }

    .status-coming {
      background: #fef3c7;
      color: #d97706;
    }

    .timestamp {
      color: #64748b;
      font-size: 0.85rem;
    }

    .no-data {
      text-align: center;
      padding: 4rem 0;
      color: #94a3b8;
      font-size: 1.1rem;
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
export class AILogsComponent implements OnInit {
  allLogs: AILog[] = [];
  availableInterests: string[] = [];

  filteredLogs = signal<AILog[]>([]);
  searchTerm: string = '';
  filterStatus: string = '';
  filterInterest: string = '';
  isLoading = signal(false);

  get uniqueInterests(): string[] {
    return this.availableInterests;
  }

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadLogs();
  }

  loadLogs(): void {
    this.isLoading.set(true);
    this.adminService.getAllAILogs().subscribe({
      next: (response) => {
        this.allLogs = response.logs || [];
        this.availableInterests = response.availableInterests || [];
        this.filterLogs();
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Failed to load AI logs:', error);
        this.isLoading.set(false);
        alert('Failed to load AI recommendation logs. Please try again.');
      }
    });
  }

  filterLogs(): void {
    let filtered = [...this.allLogs];

    if (this.searchTerm) {
      const search = this.searchTerm.toLowerCase();
      filtered = filtered.filter(log =>
        log.username?.toLowerCase().includes(search) ||
        log.userId?.toLowerCase().includes(search)
      );
    }

    if (this.filterStatus) {
      filtered = filtered.filter(log => log.status === this.filterStatus);
    }

    if (this.filterInterest) {
      filtered = filtered.filter(log => log.interest === this.filterInterest);
    }

    this.filteredLogs.set(filtered);
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.filterStatus = '';
    this.filterInterest = '';
    this.filterLogs();
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
