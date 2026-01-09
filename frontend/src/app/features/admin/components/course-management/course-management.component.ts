import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';
import { CourseContentManagerComponent } from '../course-content-manager/course-content-manager.component';

interface BrowseCourse {
  id?: string;
  title: string;
  description: string;
  instructor: string;
  category: string;
  level: string;
  difficulty: string;
  duration: number;
  imageUrl: string;
  rating?: number;
  enrolled?: number;
  isFeatured?: boolean;
  isTrending?: boolean;
  isNew?: boolean;
  isPublished?: boolean;
  isComingSoon?: boolean;
  comingSoonDate?: string;
  courseRequestId?: string;
  trackInAI?: boolean;
  tags?: string[];
  syllabus?: string[];
  prerequisites?: string[];
  learningOutcomes?: string[];
  price?: number;
}

@Component({
  selector: 'app-course-management',
  standalone: true,
  imports: [CommonModule, FormsModule, CourseContentManagerComponent],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold text-gray-800">Course Management</h1>
          <p class="text-gray-600 mt-1">Create and manage courses with content</p>
        </div>
        <button 
          (click)="showAddForm()"
          class="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors flex items-center space-x-2">
          <span>➕</span>
          <span>Add New Course</span>
        </button>
      </div>

      <!-- Add/Edit Form -->
      @if (isFormVisible()) {
        <div class="bg-white rounded-xl shadow-lg p-6 border border-gray-200" id="courseForm">
          <h2 class="text-xl font-bold text-gray-800 mb-4">
            {{ editingCourse() ? 'Edit Course' : 'Add New Course' }}
          </h2>
          
          <form (ngSubmit)="saveCourse()" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Title -->
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">Course Title *</label>
                <input 
                  type="text" 
                  [(ngModel)]="formData.title" 
                  name="title"
                  required
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 bg-white"
                  placeholder="Enter course title">
              </div>

              <!-- Description -->
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea 
                  [(ngModel)]="formData.description" 
                  name="description"
                  required
                  rows="3"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 bg-white"
                  placeholder="Enter course description"></textarea>
              </div>

              <!-- Instructor -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Instructor Name *</label>
                <input 
                  type="text" 
                  [(ngModel)]="formData.instructor" 
                  name="instructor"
                  required
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 bg-white"
                  placeholder="Instructor name">
              </div>

              <!-- Category -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                <select 
                  [(ngModel)]="formData.category" 
                  name="category"
                  required
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 bg-white">
                  <option value="">Select Category</option>
                  <option value="Programming">Programming</option>
                  <option value="AI & ML">AI & ML</option>
                  <option value="Web Development">Web Development</option>
                  <option value="Data Science">Data Science</option>
                  <option value="Cloud Computing">Cloud Computing</option>
                  <option value="Mobile Development">Mobile Development</option>
                  <option value="DevOps">DevOps</option>
                  <option value="Cybersecurity">Cybersecurity</option>
                  <option value="Design">Design</option>
                  <option value="Business">Business</option>
                </select>
              </div>

              <!-- Level -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Level *</label>
                <select 
                  [(ngModel)]="formData.level" 
                  name="level"
                  required
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 bg-white">
                  <option value="">Select Level</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              <!-- Difficulty -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                <select 
                  [(ngModel)]="formData.difficulty" 
                  name="difficulty"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 bg-white">
                  <option value="">Select Difficulty</option>
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>

              <!-- Duration -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Duration (hours) *</label>
                <input 
                  type="number" 
                  [(ngModel)]="formData.duration" 
                  name="duration"
                  required
                  min="1"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 bg-white"
                  placeholder="e.g., 40">
              </div>

              <!-- Price -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                <input 
                  type="number" 
                  [(ngModel)]="formData.price" 
                  name="price"
                  min="0"
                  step="0.01"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 bg-white"
                  placeholder="0.00 (Free)">
              </div>

              <!-- Image URL -->
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">Image URL *</label>
                <input 
                  type="text" 
                  [(ngModel)]="formData.imageUrl" 
                  name="imageUrl"
                  required
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 bg-white"
                  placeholder="https://example.com/image.jpg">
              </div>

              <!-- Tags -->
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
                <input 
                  type="text" 
                  [(ngModel)]="tagsInput" 
                  name="tags"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 bg-white"
                  placeholder="JavaScript, React, Frontend">
              </div>

              <!-- Featured, Trending, New, Published -->
              <div class="md:col-span-2 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <label class="flex items-center space-x-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    [(ngModel)]="formData.isPublished" 
                    name="isPublished"
                    class="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500">
                  <span class="text-sm text-gray-700">Published (visible to students)</span>
                </label>
                <label class="flex items-center space-x-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    [(ngModel)]="formData.isFeatured" 
                    name="isFeatured"
                    class="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500">
                  <span class="text-sm text-gray-700">Featured</span>
                </label>
                <label class="flex items-center space-x-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    [(ngModel)]="formData.isTrending" 
                    name="isTrending"
                    class="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500">
                  <span class="text-sm text-gray-700">Trending</span>
                </label>
                <label class="flex items-center space-x-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    [(ngModel)]="formData.isNew" 
                    name="isNew"
                    class="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500">
                  <span class="text-sm text-gray-700">New</span>
                </label>
                <label class="flex items-center space-x-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    [(ngModel)]="formData.isComingSoon" 
                    name="isComingSoon"
                    class="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500">
                  <span class="text-sm text-gray-700">Coming Soon</span>
                </label>
              </div>

              <!-- Coming Soon Date (shown only if isComingSoon is checked) -->
              @if (formData.isComingSoon) {
                <div class="md:col-span-2">
                  <label class="block text-sm font-medium text-gray-700 mb-1">Expected Release Date</label>
                  <input 
                    type="date" 
                    [(ngModel)]="comingSoonDateInput" 
                    name="comingSoonDate"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 bg-white"
                    placeholder="Select release date">
                </div>
              }

              <!-- AI Tracking -->
              <div class="md:col-span-2">
                <label class="flex items-center space-x-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    [(ngModel)]="formData.trackInAI" 
                    name="trackInAI"
                    class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500">
                  <span class="text-sm text-gray-700">🤖 Track in AI Recommendation Logs (Enable AI-powered recommendations for this course)</span>
                </label>
              </div>

              <!-- Course Request Link -->
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">📝 Link to Course Request (Optional)</label>
                <select 
                  [(ngModel)]="formData.courseRequestId" 
                  name="courseRequestId"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 bg-white">
                  <option value="">Not linked to any request</option>
                  @for (request of courseRequests(); track request.id) {
                    <option [value]="request.id">
                      {{ request.interest }} - {{ request.level }} (Requested by {{ request.requestedBy }} users)
                    </option>
                  }
                </select>
                <p class="text-xs text-gray-500 mt-1">Link this course to a student course request to fulfill their learning needs</p>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex justify-end space-x-3 pt-4 border-t">
              <button 
                type="button"
                (click)="cancelForm()"
                class="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 font-medium">
                Cancel
              </button>
              <button 
                type="submit"
                [disabled]="isSaving()"
                class="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors disabled:opacity-50 font-medium">
                {{ isSaving() ? 'Saving...' : 'Save Course' }}
              </button>
            </div>
          </form>
        </div>
      }

      <!-- Courses List -->
      <div class="bg-white rounded-xl shadow-lg overflow-hidden">
        <div class="p-6 border-b border-gray-200">
          <h2 class="text-xl font-bold text-gray-800">All Courses</h2>
        </div>

        @if (isLoading()) {
          <div class="p-8 text-center">
            <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-indigo-600"></div>
            <p class="mt-4 text-gray-600">Loading courses...</p>
          </div>
        } @else if (courses().length === 0) {
          <div class="p-8 text-center text-gray-500">
            <div class="text-5xl mb-4">📚</div>
            <p>No courses found. Add your first course to get started!</p>
          </div>
        } @else {
          <div class="overflow-x-auto shadow-md rounded-lg">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gradient-to-r from-indigo-600 to-purple-600">
                <tr>
                  <th class="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Course</th>
                  <th class="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Category</th>
                  <th class="px-6 py-4 text-center text-xs font-bold text-white uppercase tracking-wider">Level</th>
                  <th class="px-6 py-4 text-center text-xs font-bold text-white uppercase tracking-wider">Duration</th>
                  <th class="px-6 py-4 text-center text-xs font-bold text-white uppercase tracking-wider">Status</th>
                  <th class="px-6 py-4 text-center text-xs font-bold text-white uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                @for (course of courses(); track course.id) {
                  <tr class="hover:bg-indigo-50 transition-all duration-200">
                    <td class="px-6 py-5">
                      <div class="flex items-center gap-4">
                        <img 
                          [src]="course.imageUrl || 'https://via.placeholder.com/100x100/4F46E5/FFFFFF?text=Course'" 
                          [alt]="course.title" 
                          class="w-20 h-20 rounded-xl object-cover shadow-md border-2 border-indigo-100"
                          (error)="$any($event.target).src='https://via.placeholder.com/100x100/4F46E5/FFFFFF?text=Course'">
                        <div class="flex-1 min-w-0">
                          <div class="font-bold text-gray-900 text-base mb-1 truncate">{{course.title}}</div>
                          <div class="text-sm text-gray-600">
                            <span class="text-indigo-600">👤</span> {{course.instructor}}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td class="px-6 py-5">
                      <span class="inline-flex items-center px-4 py-2 text-xs font-bold rounded-full bg-indigo-100 text-indigo-800 shadow-sm">
                        {{course.category}}
                      </span>
                    </td>
                    <td class="px-6 py-5 text-center">
                      <span class="inline-flex items-center px-4 py-2 text-sm font-semibold bg-gradient-to-r from-blue-100 to-blue-200 text-blue-900 rounded-lg shadow-sm">
                        {{course.level || 'Not Set'}}
                      </span>
                    </td>
                    <td class="px-6 py-5 text-center">
                      <span class="inline-flex items-center px-4 py-2 text-sm font-bold bg-gradient-to-r from-green-100 to-green-200 text-green-900 rounded-lg shadow-sm">
                        ⏱️ {{course.duration}}h
                      </span>
                    </td>
                    <td class="px-6 py-5">
                      <div class="flex flex-wrap gap-2 justify-center">
                        @if (course.isComingSoon) {
                          <span class="inline-flex items-center px-3 py-1.5 text-xs font-bold rounded-full bg-purple-200 text-purple-900 shadow-sm">
                            🚀 Coming Soon
                          </span>
                        }
                        @if (course.trackInAI) {
                          <span class="inline-flex items-center px-3 py-1.5 text-xs font-bold rounded-full bg-blue-200 text-blue-900 shadow-sm">
                            🤖 AI Tracked
                          </span>
                        }
                        @if (course.courseRequestId) {
                          <span class="inline-flex items-center px-3 py-1.5 text-xs font-bold rounded-full bg-pink-200 text-pink-900 shadow-sm">
                            📝 Request Linked
                          </span>
                        }
                        @if (course.isFeatured) {
                          <span class="inline-flex items-center px-3 py-1.5 text-xs font-bold rounded-full bg-yellow-200 text-yellow-900 shadow-sm">
                            ⭐ Featured
                          </span>
                        }
                        @if (course.isTrending) {
                          <span class="inline-flex items-center px-3 py-1.5 text-xs font-bold rounded-full bg-red-200 text-red-900 shadow-sm">
                            🔥 Trending
                          </span>
                        }
                        @if (course.isNew) {
                          <span class="inline-flex items-center px-3 py-1.5 text-xs font-bold rounded-full bg-green-200 text-green-900 shadow-sm">
                            ✨ New
                          </span>
                        }
                        @if (!course.isFeatured && !course.isTrending && !course.isNew && !course.isComingSoon) {
                          @if (course.isPublished === false) {
                            <span class="inline-flex items-center px-3 py-1.5 text-xs font-bold rounded-full bg-gray-200 text-gray-700 shadow-sm">
                              ⭕ Inactive
                            </span>
                          } @else {
                            <span class="inline-flex items-center px-3 py-1.5 text-xs font-bold rounded-full bg-green-200 text-green-900 shadow-sm">
                              ✅ Active
                            </span>
                          }
                        }
                      </div>
                    </td>
                    <td class="px-6 py-5">
                      <div class="flex items-center justify-center gap-2">
                        <button 
                          (click)="editCourse(course)"
                          class="inline-flex items-center px-3 py-2 text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200">
                          <span class="mr-1">✏️</span> Edit
                        </button>
                        <button 
                          (click)="manageContent(course)"
                          class="inline-flex items-center px-3 py-2 text-xs font-bold text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200">
                          <span class="mr-1">📚</span> Content
                        </button>
                        <button 
                          (click)="deleteCourse(course.id!)"
                          class="inline-flex items-center px-3 py-2 text-xs font-bold text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200">
                          <span class="mr-1">🗑️</span> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>

      <!-- Course Content Manager Modal -->
      @if (showContentManager()) {
        <app-course-content-manager
          [courseId]="selectedCourse()!.id!"
          [courseTitle]="selectedCourse()!.title"
          [onClose]="closeContentManager.bind(this)">
        </app-course-content-manager>
      }
    </div>
  `,
  styles: []
})
export class CourseManagementComponent implements OnInit {
  courses = signal<BrowseCourse[]>([]);
  courseRequests = signal<any[]>([]);
  isFormVisible = signal(false);
  editingCourse = signal<BrowseCourse | null>(null);
  isLoading = signal(false);
  isSaving = signal(false);
  showContentManager = signal(false);
  selectedCourse = signal<BrowseCourse | null>(null);
  tagsInput = '';
  comingSoonDateInput = '';

  formData: BrowseCourse = this.getEmptyFormData();

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.loadCourses();
    this.loadCourseRequests();
  }

  loadCourses() {
    this.isLoading.set(true);
    this.adminService.getAllCourses().subscribe({
      next: (courses) => {
        console.log('📚 Loaded courses in Course Management:', courses);
        courses.forEach(c => {
          console.log(`Course: "${c.title}" - isComingSoon: ${c.isComingSoon}, comingSoonDate: ${c.comingSoonDate}`);
        });
        this.courses.set(courses);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load courses', err);
        this.isLoading.set(false);
        alert('Failed to load courses. Please try again.');
      }
    });
  }

  loadCourseRequests() {
    this.adminService.getCourseRequests().subscribe({
      next: (requests) => {
        this.courseRequests.set(requests);
      },
      error: (err) => {
        console.error('Failed to load course requests', err);
      }
    });
  }

  showAddForm() {
    this.formData = this.getEmptyFormData();
    this.tagsInput = '';
    this.comingSoonDateInput = '';
    this.editingCourse.set(null);
    this.isFormVisible.set(true);
  }

  editCourse(course: BrowseCourse) {
    console.log('📝 Editing course:', course);
    this.formData = { ...course };
    this.tagsInput = course.tags?.join(', ') || '';
    this.comingSoonDateInput = course.comingSoonDate || '';
    this.editingCourse.set(course);
    this.isFormVisible.set(true);
    
    // Scroll to form after a brief delay to ensure DOM update
    setTimeout(() => {
      const formElement = document.getElementById('courseForm');
      if (formElement) {
        formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 100);
  }

  saveCourse() {
    this.isSaving.set(true);
    
    // Parse tags
    if (this.tagsInput.trim()) {
      this.formData.tags = this.tagsInput.split(',').map(t => t.trim()).filter(t => t);
    }

    // Set coming soon date if provided - convert to LocalDateTime format
    if (this.comingSoonDateInput) {
      // Convert date (YYYY-MM-DD) to LocalDateTime format (YYYY-MM-DDTHH:mm:ss)
      this.formData.comingSoonDate = this.comingSoonDateInput + 'T00:00:00';
    }

    // Ensure duration is set and not 0
    if (!this.formData.duration || this.formData.duration === 0) {
      alert('Please enter a valid duration (hours)');
      this.isSaving.set(false);
      return;
    }

    // Ensure isPublished is set
    if (this.formData.isPublished === undefined) {
      this.formData.isPublished = true;
    }
    
    // Ensure trackInAI is set
    if (this.formData.trackInAI === undefined) {
      this.formData.trackInAI = true;
    }

    console.log('Saving course data:', this.formData);

    const editing = this.editingCourse();
    const observable = editing
      ? this.adminService.updateCourse(editing.id!, this.formData)
      : this.adminService.createCourse(this.formData);

    observable.subscribe({
      next: (savedCourse) => {
        console.log('✅ Course saved successfully:', savedCourse);
        this.isSaving.set(false);
        this.isFormVisible.set(false);
        
        // Update courses list immediately
        const editing = this.editingCourse();
        if (editing) {
          // Update existing course in the list
          const currentCourses = this.courses();
          const updatedCourses = currentCourses.map(c => 
            c.id === editing.id ? savedCourse : c
          );
          this.courses.set(updatedCourses);
        } else {
          // Add new course to the list
          this.courses.set([savedCourse, ...this.courses()]);
        }
        
        alert(editing ? 'Course updated successfully!' : 'Course created successfully!');
      },
      error: (err) => {
        console.error('Failed to save course - Full error:', err);
        console.error('Error status:', err.status);
        console.error('Error message:', err.error);
        this.isSaving.set(false);
        
        let errorMsg = 'Failed to save course. ';
        if (err.error?.message) {
          errorMsg += err.error.message;
        } else if (err.message) {
          errorMsg += err.message;
        } else {
          errorMsg += 'Please check all required fields and try again.';
        }
        alert(errorMsg);
      }
    });
  }

  cancelForm() {
    this.isFormVisible.set(false);
    this.editingCourse.set(null);
  }

  deleteCourse(id: string) {
    if (confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      this.adminService.deleteCourse(id).subscribe({
        next: () => {
          console.log('✅ Course deleted successfully');
          // Remove from list immediately without reloading
          const currentCourses = this.courses();
          const updatedCourses = currentCourses.filter(c => c.id !== id);
          this.courses.set(updatedCourses);
          alert('Course deleted successfully!');
        },
        error: (err) => {
          console.error('Failed to delete course', err);
          alert('Failed to delete course. Please try again.');
        }
      });
    }
  }

  manageContent(course: BrowseCourse) {
    console.log('📚 Opening content manager for:', course.title);
    this.selectedCourse.set(course);
    this.showContentManager.set(true);
  }

  closeContentManager() {
    this.showContentManager.set(false);
    this.selectedCourse.set(null);
  }

  private getEmptyFormData(): BrowseCourse {
    return {
      title: '',
      description: '',
      instructor: '',
      category: '',
      level: '',
      difficulty: '',
      duration: 0,
      imageUrl: '',
      rating: 0,
      enrolled: 0,
      isPublished: true, // Published by default
      isFeatured: false,
      isTrending: false,
      isNew: false,
      isComingSoon: false,
      trackInAI: true, // Track in AI by default
      tags: [],
      syllabus: [],
      prerequisites: [],
      learningOutcomes: [],
      price: 0
    };
  }
}
