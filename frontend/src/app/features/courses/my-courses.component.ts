import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BackendApiService } from '../../core/services/backend-api.service';
import { AuthService } from '../../core/services/auth-backend.service';

interface EnrolledCourse {
  id: string;
  courseId: string;
  courseTitle: string;
  courseCategory: string;
  courseDifficulty: string;
  courseThumbnail?: string;
  courseImageUrl?: string;  // Alternative field name
  progressPercentage: number;
  isCompleted: boolean;
  enrolledAt: Date;
  completedAt?: Date;
}

@Component({
  selector: 'app-my-courses',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatChipsModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 p-6">
      <div class="max-w-7xl mx-auto">
        
        <!-- Header -->
        <div class="bg-white rounded-xl shadow-lg p-6 mb-6 border-l-4 border-purple-600">
          <h1 class="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-2">
            📚 My Enrolled Courses
          </h1>
          <p class="text-gray-600">Track your learning progress and continue where you left off</p>
        </div>

        <!-- Loading State -->
        <div *ngIf="isLoading()" class="flex justify-center items-center py-20">
          <mat-spinner diameter="60"></mat-spinner>
        </div>

        <!-- Stats Summary -->
        <div *ngIf="!isLoading() && enrolledCourses().length > 0" class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div class="bg-gradient-to-br from-blue-500 to-blue-700 p-6 rounded-xl shadow-lg text-white">
            <div class="text-4xl mb-2">📖</div>
            <div class="text-3xl font-bold">{{ enrolledCourses().length }}</div>
            <div class="text-sm opacity-90">Total Enrolled</div>
          </div>
          
          <div class="bg-gradient-to-br from-green-500 to-green-700 p-6 rounded-xl shadow-lg text-white">
            <div class="text-4xl mb-2">✅</div>
            <div class="text-3xl font-bold">{{ completedCoursesCount() }}</div>
            <div class="text-sm opacity-90">Completed</div>
          </div>
          
          <div class="bg-gradient-to-br from-orange-500 to-orange-700 p-6 rounded-xl shadow-lg text-white">
            <div class="text-4xl mb-2">📈</div>
            <div class="text-3xl font-bold">{{ inProgressCoursesCount() }}</div>
            <div class="text-sm opacity-90">In Progress</div>
          </div>
          
          <div class="bg-gradient-to-br from-purple-500 to-purple-700 p-6 rounded-xl shadow-lg text-white">
            <div class="text-4xl mb-2">⭐</div>
            <div class="text-3xl font-bold">{{ averageProgress() }}%</div>
            <div class="text-sm opacity-90">Avg Progress</div>
          </div>
        </div>

        <!-- Empty State -->
        <div *ngIf="!isLoading() && enrolledCourses().length === 0" 
             class="bg-white rounded-xl shadow-lg p-12 text-center border-2 border-dashed border-gray-300">
          <div class="text-6xl mb-4">📚</div>
          <h2 class="text-2xl font-bold text-gray-800 mb-3">No Enrolled Courses Yet</h2>
          <p class="text-gray-600 mb-6">Start your learning journey by enrolling in courses!</p>
          <button mat-raised-button color="primary" routerLink="/courses" class="!px-8 !py-3">
            <mat-icon>school</mat-icon>
            Browse Courses
          </button>
        </div>

        <!-- Courses Grid -->
        <div *ngIf="!isLoading() && enrolledCourses().length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div *ngFor="let course of enrolledCourses()" 
               class="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transform hover:scale-105 transition-all duration-300 border-t-4"
               [ngClass]="{
                 'border-green-500': course.isCompleted,
                 'border-blue-500': !course.isCompleted && course.progressPercentage > 0,
                 'border-gray-300': course.progressPercentage === 0
               }">
            
            <!-- Course Image/Thumbnail -->
            <div class="relative h-48 overflow-hidden">
              <!-- Always show image with automatic fallback -->
              <img [src]="getCourseImage(course)" 
                   [alt]="course.courseTitle"
                   class="w-full h-full object-cover"
                   loading="lazy"
                   (error)="handleImageError($event, course)">
              
              <!-- Completed Badge -->
              <div *ngIf="course.isCompleted" class="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                ✓ Completed
              </div>
              
              <!-- Progress Badge -->
              <div *ngIf="!course.isCompleted && course.progressPercentage > 0" class="absolute top-4 right-4 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                {{ course.progressPercentage }}%
              </div>
            </div>
            
            <!-- Course Header -->
            <div class="p-6 bg-gradient-to-br from-purple-50 to-blue-50">
              <h3 class="text-xl font-bold text-gray-900 mb-3">{{ course.courseTitle }}</h3>
              
              <div class="flex items-center gap-2 text-sm text-gray-600 mb-4">
                <span class="px-3 py-1 bg-purple-200 text-purple-800 rounded-full font-semibold">
                  {{ course.courseCategory }}
                </span>
                <span class="px-3 py-1 bg-blue-200 text-blue-800 rounded-full font-semibold">
                  {{ course.courseDifficulty }}
                </span>
              </div>

              <!-- Progress Bar -->
              <div class="mb-2">
                <div class="flex justify-between items-center mb-1">
                  <span class="text-sm font-semibold text-gray-700">Progress</span>
                  <span class="text-sm font-bold" [ngClass]="{
                    'text-green-600': course.progressPercentage === 100,
                    'text-blue-600': course.progressPercentage > 0 && course.progressPercentage < 100,
                    'text-gray-500': course.progressPercentage === 0
                  }">
                    {{ course.progressPercentage }}%
                  </span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div class="h-3 rounded-full transition-all duration-500" 
                       [style.width.%]="course.progressPercentage"
                       [ngClass]="{
                         'bg-gradient-to-r from-green-500 to-green-600': course.progressPercentage === 100,
                         'bg-gradient-to-r from-blue-500 to-purple-600': course.progressPercentage > 0 && course.progressPercentage < 100,
                         'bg-gray-300': course.progressPercentage === 0
                       }">
                  </div>
                </div>
              </div>

              <!-- Enrollment Date -->
              <p class="text-xs text-gray-500 mt-3">
                Enrolled: {{ formatDate(course.enrolledAt) }}
              </p>
              <p *ngIf="course.completedAt" class="text-xs text-green-600 font-semibold">
                Completed: {{ formatDate(course.completedAt) }}
              </p>
            </div>

            <!-- Action Buttons -->
            <div class="p-4 bg-gray-50 flex gap-3">
              <button mat-raised-button color="primary" 
                      (click)="openCourse(course.courseId)"
                      class="flex-1">
                <mat-icon>{{ course.progressPercentage > 0 ? 'play_arrow' : 'school' }}</mat-icon>
                {{ course.progressPercentage > 0 ? 'Continue' : 'Start Learning' }}
              </button>
              
              <button mat-stroked-button color="accent" 
                      (click)="viewProgress(course.courseId)">
                <mat-icon>analytics</mat-icon>
                Progress
              </button>
            </div>

            <!-- Tips -->
            <div *ngIf="!course.isCompleted && course.progressPercentage < 100" 
                 class="px-4 pb-4 pt-2">
              <div class="bg-blue-50 border-l-4 border-blue-500 p-3 rounded text-xs text-blue-800">
                <strong>💡 Tip:</strong> Complete topics to reach 100% and earn rewards!
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class MyCoursesComponent implements OnInit {
  private backendApi = inject(BackendApiService);
  private authService = inject(AuthService);
  private router = inject(Router);

  isLoading = signal(false);
  enrolledCourses = signal<EnrolledCourse[]>([]);

  completedCoursesCount = signal(0);
  inProgressCoursesCount = signal(0);
  averageProgress = signal(0);

  ngOnInit() {
    this.loadEnrolledCourses();
  }

  private loadEnrolledCourses() {
    this.isLoading.set(true);
    const userId = this.authService.getCurrentUserId();
    
    console.log('🔍 Loading enrolled courses for user:', userId);
    
    if (!userId) {
      console.error('❌ No user ID found');
      this.isLoading.set(false);
      return;
    }

    this.backendApi.getUserEnrolledCourses(userId).subscribe({
      next: (response) => {
        console.log('✅ Enrolled courses API response:', response);
        console.log('📊 Response data:', response.data);
        console.log('📈 Number of courses:', response.data?.length);
        
        if (response.success && response.data) {
          const courses = response.data as EnrolledCourse[];
          console.log('📚 Setting courses:', courses);
          this.enrolledCourses.set(courses);
          this.calculateStats(courses);
        } else {
          console.warn('⚠️ No data in response or success=false');
        }
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('❌ Error loading enrolled courses:', error);
        console.error('🔥 Error details:', error.error);
        console.error('🌐 Error status:', error.status);
        this.isLoading.set(false);
      }
    });
  }

  private calculateStats(courses: EnrolledCourse[]) {
    const completed = courses.filter(c => c.isCompleted).length;
    const inProgress = courses.filter(c => !c.isCompleted && c.progressPercentage > 0).length;
    const totalProgress = courses.reduce((sum, c) => sum + c.progressPercentage, 0);
    const avgProgress = courses.length > 0 ? Math.round(totalProgress / courses.length) : 0;

    this.completedCoursesCount.set(completed);
    this.inProgressCoursesCount.set(inProgress);
    this.averageProgress.set(avgProgress);
  }

  openCourse(courseId: string) {
    this.router.navigate(['/course', courseId]);
  }

  viewProgress(courseId: string) {
    this.router.navigate(['/course', courseId]);
  }

  formatDate(date: Date | string | undefined): string {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }

  getCategoryIcon(category: string | undefined): string {
    if (!category) return '📚';
    
    const categoryLower = category.toLowerCase();
    
    if (categoryLower.includes('data') || categoryLower.includes('science')) return '📊';
    if (categoryLower.includes('machine') || categoryLower.includes('learning') || categoryLower.includes('ai')) return '🤖';
    if (categoryLower.includes('web') || categoryLower.includes('frontend')) return '🌐';
    if (categoryLower.includes('backend') || categoryLower.includes('server')) return '⚙️';
    if (categoryLower.includes('mobile') || categoryLower.includes('app')) return '📱';
    if (categoryLower.includes('database') || categoryLower.includes('sql')) return '🗄️';
    if (categoryLower.includes('cloud') || categoryLower.includes('aws') || categoryLower.includes('azure')) return '☁️';
    if (categoryLower.includes('security') || categoryLower.includes('cyber')) return '🔒';
    if (categoryLower.includes('devops') || categoryLower.includes('deployment')) return '🚀';
    if (categoryLower.includes('design') || categoryLower.includes('ui') || categoryLower.includes('ux')) return '🎨';
    if (categoryLower.includes('python')) return '🐍';
    if (categoryLower.includes('java')) return '☕';
    if (categoryLower.includes('javascript') || categoryLower.includes('js')) return '⚡';
    
    return '📚';
  }

  /**
   * Get course image URL - generates beautiful images based on category
   * Same logic as browse-courses for consistency
   * IMPORTANT: Always use course TITLE for seed to ensure same image across all pages
   */
  getCourseImage(course: EnrolledCourse): string {
    const width = 400;
    const height = 300;
    
    // Priority 1: Use course's own thumbnail/imageUrl if available from database
    if (course.courseThumbnail) {
      console.log('Using courseThumbnail for:', course.courseTitle, '→', course.courseThumbnail);
      return course.courseThumbnail;
    }
    if (course.courseImageUrl) {
      console.log('Using courseImageUrl for:', course.courseTitle, '→', course.courseImageUrl);
      return course.courseImageUrl;
    }
    
    // Priority 2: Generate consistent image using ONLY course title as seed
    // This ensures the same course shows the same image on all pages (courses, browse-courses, my-courses)
    const seed = this.hashCode(course.courseTitle || 'default');
    console.log('Generating image for:', course.courseTitle, '→ seed:', seed);
    
    // Use Lorem Picsum with seed for consistent, beautiful images
    return `https://picsum.photos/seed/${seed}/${width}/${height}`;
  }
  
  /**
   * Generate hash code from string for consistent image selection
   */
  private hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }
  
  /**
   * Handle image loading errors - fallback to beautiful gradient with icon
   */
  handleImageError(event: any, course: EnrolledCourse): void {
    console.log('Image failed to load for:', course.courseTitle, '- Using gradient fallback');
    
    // Category-based gradient colors
    const gradients: { [key: string]: string } = {
      'Programming': 'from-blue-500 via-indigo-600 to-purple-600',
      'Web Development': 'from-green-500 via-teal-600 to-blue-600',
      'Data Science': 'from-purple-500 via-pink-600 to-red-600',
      'Database Management': 'from-yellow-500 via-orange-600 to-red-600',
      'Mobile Development': 'from-cyan-500 via-blue-600 to-indigo-600',
      'AI': 'from-violet-500 via-purple-600 to-pink-600',
      'Machine Learning': 'from-fuchsia-500 via-purple-600 to-indigo-600'
    };
    
    const gradient = gradients[course.courseCategory] || 'from-purple-500 via-blue-600 to-pink-600';
    
    // Create gradient fallback div
    const img = event.target;
    const container = img.parentElement;
    
    // Hide the broken image
    img.style.display = 'none';
    
    // Create beautiful gradient background
    const fallbackDiv = document.createElement('div');
    fallbackDiv.className = `absolute inset-0 bg-gradient-to-br ${gradient} flex items-center justify-center`;
    fallbackDiv.innerHTML = `
      <div class="text-white text-center p-4">
        <div class="text-6xl mb-2">${this.getCategoryIcon(course.courseCategory)}</div>
        <div class="text-sm font-semibold opacity-90">${course.courseCategory || 'Course'}</div>
      </div>
    `;
    
    container.appendChild(fallbackDiv);
  }
  
  // Keep old method for backward compatibility
  onImageError(event: any, course: EnrolledCourse) {
    this.handleImageError(event, course);
  }
}
