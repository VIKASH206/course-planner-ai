import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AdminService } from '../../services/admin.service';

interface ComingSoonCourse {
  id?: string;
  title?: string;
  interest?: string;
  category?: string;
  level: string;
  instructor?: string;
  duration?: number;
  requestedBy?: number;
  status?: 'Pending' | 'In Progress' | 'Ready';
  requestedDate?: string;
  lastRequestedDate?: string;
  comingSoonDate?: string;
  imageUrl?: string;
  description?: string;
  isComingSoon?: boolean;
}

interface ComingSoonStats {
  totalRequests: number;
  pending: number;
  inProgress: number;
  ready: number;
}

@Component({
  selector: 'app-coming-soon-courses',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen p-4 bg-gradient-to-br from-purple-50 to-pink-50">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="mb-4 bg-white p-4 rounded-lg shadow border-l-4 border-purple-600">
          <h1 class="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-2">🏆 Coming Soon Courses</h1>
          <p class="text-sm text-gray-600">Manage requested courses that are not yet available</p>
        </div>

        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div class="bg-gradient-to-br from-orange-500 to-orange-700 p-4 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all">
            <div class="text-4xl mb-2 text-center">⏳</div>
            <h3 class="text-sm font-bold text-white text-center mb-2">Total Requests</h3>
            <p class="text-3xl font-bold text-white text-center mb-2">{{ getTotalRequests() }}</p>
            <div class="bg-orange-800 bg-opacity-50 p-2 rounded">
              <p class="text-xs text-orange-100 text-center">All courses</p>
            </div>
          </div>
          <div class="bg-gradient-to-br from-yellow-500 to-yellow-700 p-4 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all">
            <div class="text-4xl mb-2 text-center">📝</div>
            <h3 class="text-sm font-bold text-white text-center mb-2">Pending</h3>
            <p class="text-3xl font-bold text-white text-center mb-2">{{ getPendingCount() }}</p>
            <div class="bg-yellow-800 bg-opacity-50 p-2 rounded">
              <p class="text-xs text-yellow-100 text-center">Awaiting work</p>
            </div>
          </div>
          <div class="bg-gradient-to-br from-blue-500 to-blue-700 p-4 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all">
            <div class="text-4xl mb-2 text-center">🔨</div>
            <h3 class="text-sm font-bold text-white text-center mb-2">In Progress</h3>
            <p class="text-3xl font-bold text-white text-center mb-2">{{ getInProgressCount() }}</p>
            <div class="bg-blue-800 bg-opacity-50 p-2 rounded">
              <p class="text-xs text-blue-100 text-center">Being created</p>
            </div>
          </div>
          <div class="bg-gradient-to-br from-green-500 to-green-700 p-4 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all">
            <div class="text-4xl mb-2 text-center">✅</div>
            <h3 class="text-sm font-bold text-white text-center mb-2">Ready</h3>
            <p class="text-3xl font-bold text-white text-center mb-2">{{ getReadyCount() }}</p>
            <div class="bg-green-800 bg-opacity-50 p-2 rounded">
              <p class="text-xs text-green-100 text-center">Ready to publish</p>
            </div>
          </div>
        </div>

        <!-- Courses Table -->
        <div class="bg-white rounded-lg shadow-lg border-t-4 border-purple-500 overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gradient-to-r from-purple-50 to-pink-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Interest</th>
                  <th class="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Level</th>
                  <th class="px-6 py-3 text-center text-xs font-bold text-gray-700 uppercase">Requested By (Users)</th>
                  <th class="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Status</th>
                  <th class="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Requested Date</th>
                  <th class="px-6 py-3 text-center text-xs font-bold text-gray-700 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (course of comingSoonCourses(); track $index) {
                  <tr class="border-b hover:bg-purple-50 transition-colors">
                    <td class="px-6 py-4">
                      <span class="px-3 py-1 bg-gradient-to-r from-purple-100 to-purple-200 text-purple-700 rounded-full text-xs font-semibold">
                        {{ course.interest || course.title }}
                      </span>
                    </td>
                    <td class="px-6 py-4">
                      <span class="px-3 py-1 rounded-full text-xs font-semibold" 
                            [class.bg-green-100]="course.level === 'Beginner'"
                            [class.text-green-700]="course.level === 'Beginner'"
                            [class.bg-yellow-100]="course.level === 'Intermediate'"
                            [class.text-yellow-700]="course.level === 'Intermediate'"
                            [class.bg-red-100]="course.level === 'Advanced'"
                            [class.text-red-700]="course.level === 'Advanced'">
                        {{ course.level }}
                      </span>
                    </td>
                    <td class="px-6 py-4">
                      <div class="flex items-center justify-center gap-2">
                        @if (course.requestedBy && course.requestedBy > 0) {
                          <span class="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-bold">{{ course.requestedBy }}</span>
                          <span class="text-sm text-gray-600">users</span>
                        } @else {
                          <span class="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-semibold">N/A</span>
                        }
                      </div>
                    </td>
                    <td class="px-6 py-4">
                      @if (course.status === 'Pending' || !course.status) {
                        <span class="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold uppercase bg-yellow-100 text-yellow-800 border border-yellow-300 shadow-sm">
                          ⏳ Pending
                        </span>
                      } @else if (course.status === 'In Progress') {
                        <span class="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold uppercase bg-blue-100 text-blue-800 border border-blue-300 shadow-sm">
                          🔨 In Progress
                        </span>
                      } @else if (course.status === 'Ready') {
                        <span class="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold uppercase bg-green-100 text-green-800 border border-green-300 shadow-sm">
                          ✅ Ready
                        </span>
                      } @else {
                        <span class="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold uppercase bg-gray-100 text-gray-800 border border-gray-300 shadow-sm">
                          {{ course.status }}
                        </span>
                      }
                    </td>
                    <td class="px-6 py-4 text-gray-600 text-sm">{{ course.requestedDate }}</td>
                    <td class="px-6 py-4">
                      <div class="flex items-center justify-center gap-2 flex-wrap">
                        @if (course.requestedBy !== undefined && course.requestedBy > 0) {
                          <!-- This is a course request -->
                          @if (course.status === 'Ready') {
                            <button (click)="markAsAvailable(course)" class="px-3 py-1 bg-green-100 hover:bg-green-200 rounded-lg transition-colors text-xs font-semibold text-green-700">
                              ✅ Mark Available
                            </button>
                          }
                          @if (course.status === 'Pending') {
                            <button (click)="updateStatus(course, 'In Progress')" class="px-3 py-1 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors text-xs font-semibold text-blue-700">
                              🔨 Start Working
                            </button>
                          }
                          @if (course.status === 'In Progress') {
                            <button (click)="updateStatus(course, 'Ready')" class="px-3 py-1 bg-green-100 hover:bg-green-200 rounded-lg transition-colors text-xs font-semibold text-green-700">
                              ✅ Mark Ready
                            </button>
                          }
                          <button (click)="createCourse(course)" class="px-3 py-1 bg-purple-100 hover:bg-purple-200 rounded-lg transition-colors text-xs font-semibold text-purple-700">
                            ➕ Create Course
                          </button>
                        } @else {
                          <!-- This is an actual course marked as coming soon -->
                          <button (click)="editActualCourse(course)" class="px-3 py-1 bg-indigo-100 hover:bg-indigo-200 rounded-lg transition-colors text-xs font-semibold text-indigo-700">
                            ✏️ Edit Course
                          </button>
                          <button (click)="publishCourse(course)" class="px-3 py-1 bg-green-100 hover:bg-green-200 rounded-lg transition-colors text-xs font-semibold text-green-700">
                            🚀 Publish Now
                          </button>
                        }
                      </div>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="6" class="p-8">
                      <div class="text-center py-4 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300">
                        <span class="text-4xl mb-2 block">✅</span>
                        <p class="text-sm text-gray-500 font-medium">No coming soon courses!</p>
                        <p class="text-xs text-gray-400 mt-1">All requested courses are available.</p>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>

        <!-- Info Box -->
        <div class="mt-4 bg-white rounded-lg shadow-lg p-4 border-l-4 border-blue-500">
          <div class="flex items-start gap-3">
            <div class="text-3xl">💡</div>
            <div>
              <h4 class="text-lg font-bold text-gray-800 mb-2">How it works:</h4>
              <ul class="space-y-1 text-sm text-gray-600">
                <li>• <strong class="text-gray-800">Pending:</strong> Course request received, not yet being worked on</li>
                <li>• <strong class="text-gray-800">In Progress:</strong> Course is being created/prepared</li>
                <li>• <strong class="text-gray-800">Ready:</strong> Course is ready to be published</li>
                <li>• <strong class="text-gray-800">Mark Available:</strong> Publishes the course and removes from this list</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .coming-soon-container {
      max-width: 1400px;
      margin: 0 auto;
    }

    .page-header {
      margin-bottom: 2rem;
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

    .stats-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .stat-card {
      background: white;
      padding: 1.5rem;
      border-radius: 10px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .stat-icon {
      font-size: 2.5rem;
    }

    .stat-value {
      font-size: 2rem;
      font-weight: 700;
      color: #1e293b;
    }

    .stat-label {
      font-size: 0.875rem;
      color: #64748b;
    }

    .table-container {
      background: white;
      border-radius: 10px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
      overflow-x: auto;
      margin-bottom: 2rem;
    }

    .courses-table {
      width: 100%;
      border-collapse: collapse;
    }

    .courses-table thead {
      background: #f8fafc;
      border-bottom: 2px solid #e2e8f0;
    }

    .courses-table th {
      padding: 1rem 1.25rem;
      text-align: left;
      font-size: 0.875rem;
      font-weight: 700;
      color: #475569;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .courses-table td {
      padding: 1.25rem;
      border-bottom: 1px solid #f1f5f9;
      font-size: 0.9rem;
      color: #334155;
    }

    .courses-table tbody tr:hover {
      background: #fafbfc;
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

    .requested-count {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .count-badge {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 0.375rem 0.75rem;
      border-radius: 6px;
      font-weight: 700;
      font-size: 1rem;
    }

    .count-label {
      color: #64748b;
      font-size: 0.85rem;
    }

    .status-badge {
      padding: 0.375rem 0.875rem;
      border-radius: 6px;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
    }

    .status-pending {
      background: #fef3c7;
      color: #d97706;
    }

    .status-progress {
      background: #dbeafe;
      color: #2563eb;
    }

    .status-ready {
      background: #dcfce7;
      color: #16a34a;
    }

    .action-buttons {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .btn-action {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 6px;
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      white-space: nowrap;
    }

    .btn-available {
      background: #dcfce7;
      color: #16a34a;
    }

    .btn-available:hover {
      background: #bbf7d0;
    }

    .btn-progress {
      background: #dbeafe;
      color: #2563eb;
    }

    .btn-progress:hover {
      background: #bfdbfe;
    }

    .btn-ready {
      background: #dcfce7;
      color: #16a34a;
    }

    .btn-ready:hover {
      background: #bbf7d0;
    }

    .btn-create {
      background: #ede9fe;
      color: #7c3aed;
    }

    .btn-create:hover {
      background: #ddd6fe;
    }

    .no-data {
      text-align: center;
      padding: 4rem 0;
    }

    .no-data-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }

    .no-data-icon {
      font-size: 4rem;
      opacity: 0.5;
    }

    .no-data-content p {
      color: #94a3b8;
      font-size: 1rem;
      margin: 0;
    }

    .info-box {
      background: linear-gradient(135deg, #667eea20 0%, #764ba220 100%);
      border: 2px solid #667eea40;
      border-radius: 10px;
      padding: 1.5rem;
      display: flex;
      gap: 1rem;
    }

    .info-icon {
      font-size: 2rem;
    }

    .info-box h4 {
      margin: 0 0 0.75rem 0;
      color: #1e293b;
      font-size: 1.1rem;
    }

    .info-box ul {
      margin: 0;
      padding-left: 1.25rem;
      color: #475569;
    }

    .info-box li {
      margin-bottom: 0.5rem;
    }

    .info-box strong {
      color: #1e293b;
    }
  `]
})
export class ComingSoonCoursesComponent implements OnInit {
  comingSoonCourses = signal<ComingSoonCourse[]>([]);
  stats = signal<ComingSoonStats>({
    totalRequests: 0,
    pending: 0,
    inProgress: 0,
    ready: 0
  });
  loading = signal<boolean>(true);

  constructor(
    private router: Router,
    private adminService: AdminService
  ) {}

  ngOnInit(): void {
    this.loadStats();
    this.loadComingSoonCourses();
  }

  loadStats(): void {
    this.adminService.getComingSoonStats().subscribe({
      next: (stats) => {
        console.log('📊 Coming Soon Stats:', stats);
        this.stats.set(stats);
      },
      error: (error) => {
        console.error('❌ Error loading stats:', error);
      }
    });
  }

  loadComingSoonCourses(): void {
    this.loading.set(true);
    
    // Load both course requests and actual coming soon courses
    this.adminService.getAllComingSoonCourses().subscribe({
      next: (courseRequests) => {
        console.log('📚 Course Requests:', courseRequests);
        
        // Load actual courses marked as coming soon
        this.adminService.getAllCourses().subscribe({
          next: (allCourses) => {
            console.log('📚 All Courses Loaded:', allCourses.length, 'courses');
            console.log('📚 All Courses Data:', allCourses);
            
            // Filter courses that are marked as coming soon
            const comingSoonCourses = allCourses.filter(course => {
              console.log(`Course "${course.title}" - isComingSoon:`, course.isComingSoon);
              return course.isComingSoon === true;
            });
            console.log('🔜 Coming Soon Courses Found:', comingSoonCourses.length, 'courses');
            console.log('🔜 Coming Soon Courses Data:', comingSoonCourses);
            
            // Format course requests
            const formattedRequests = courseRequests.map(course => ({
              ...course,
              interest: course.interest,
              status: course.status || 'Pending',
              requestedDate: course.lastRequestedDate ? 
                new Date(course.lastRequestedDate).toLocaleDateString() : 
                new Date().toLocaleDateString()
            }));
            console.log('📋 Formatted Course Requests:', formattedRequests.length);
            
            // Format actual coming soon courses
            const formattedCourses = comingSoonCourses.map(course => ({
              ...course,
              interest: course.title,
              level: course.level,
              requestedBy: 0,
              status: 'Ready' as const,
              requestedDate: course.comingSoonDate ? 
                new Date(course.comingSoonDate).toLocaleDateString() : 
                new Date().toLocaleDateString()
            }));
            console.log('📋 Formatted Coming Soon Courses:', formattedCourses.length);
            
            // Combine both lists
            const combined = [...formattedRequests, ...formattedCourses];
            console.log('✅ Total Combined Courses:', combined.length);
            console.log('✅ Combined Data:', combined);
            this.comingSoonCourses.set(combined);
            this.loading.set(false);
          },
          error: (error) => {
            console.error('❌ Error loading courses:', error);
            // Still show course requests even if courses fail to load
            const formattedRequests = courseRequests.map(course => ({
              ...course,
              status: course.status || 'Pending',
              requestedDate: course.lastRequestedDate ? 
                new Date(course.lastRequestedDate).toLocaleDateString() : 
                new Date().toLocaleDateString()
            }));
            this.comingSoonCourses.set(formattedRequests);
            this.loading.set(false);
          }
        });
      },
      error: (error) => {
        console.error('❌ Error loading coming soon courses:', error);
        this.loading.set(false);
      }
    });
  }

  getTotalRequests(): number {
    return this.stats().totalRequests;
  }

  getPendingCount(): number {
    return this.stats().pending;
  }

  getInProgressCount(): number {
    return this.stats().inProgress;
  }

  getReadyCount(): number {
    return this.stats().ready;
  }

  updateStatus(course: ComingSoonCourse, newStatus: 'In Progress' | 'Ready'): void {
    const statusMap = {
      'In Progress': 'plan',
      'Ready': 'ready'
    };

    const action = statusMap[newStatus];
    const apiCall = action === 'plan' ? 
      this.adminService.markComingSoonAsPlanned(course.id!) :
      this.adminService.markComingSoonAsReady(course.id!);

    apiCall.subscribe({
      next: (updated) => {
        console.log('✅ Status updated:', updated);
        course.status = newStatus;
        alert(`Status updated to: ${newStatus}`);
        this.loadStats(); // Refresh stats
      },
      error: (error) => {
        console.error('❌ Error updating status:', error);
        alert('Failed to update status');
      }
    });
  }

  markAsAvailable(course: ComingSoonCourse): void {
    if (confirm(`Mark "${course.interest || course.title} - ${course.level}" as available?`)) {
      this.adminService.deleteComingSoonCourse(course.id!).subscribe({
        next: () => {
          console.log('✅ Course marked as available');
          // Remove from local list
          const courses = this.comingSoonCourses();
          this.comingSoonCourses.set(courses.filter(c => c.id !== course.id));
          alert('Course marked as available and removed from coming soon list!');
          this.loadStats(); // Refresh stats
        },
        error: (error) => {
          console.error('❌ Error marking as available:', error);
          alert('Failed to mark course as available');
        }
      });
    }
  }

  createCourse(course: ComingSoonCourse): void {
    // Redirect to course creation page with pre-filled data
    this.router.navigate(['/admin/courses'], { 
      queryParams: { 
        interest: course.interest, 
        level: course.level 
      } 
    });
  }

  editActualCourse(course: ComingSoonCourse): void {
    // Redirect to course management page to edit this course
    this.router.navigate(['/admin/courses'], {
      queryParams: {
        edit: course.id
      }
    });
  }

  publishCourse(course: ComingSoonCourse): void {
    if (confirm(`Publish "${course.title}"? This will make it visible to students and remove from coming soon.`)) {
      // Update the course to set isComingSoon = false and isPublished = true
      const updateData = {
        ...course,
        isComingSoon: false,
        isPublished: true
      };

      this.adminService.updateCourse(course.id!, updateData).subscribe({
        next: () => {
          console.log('✅ Course published successfully');
          // Remove from local list
          const courses = this.comingSoonCourses();
          this.comingSoonCourses.set(courses.filter(c => c.id !== course.id));
          alert('Course published successfully!');
          this.loadStats();
          this.loadComingSoonCourses();
        },
        error: (error) => {
          console.error('❌ Error publishing course:', error);
          alert('Failed to publish course');
        }
      });
    }
  }
}
