import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';

import { ApiService, Course } from '../../../core/services/api.service';
import { CourseDetailDialogComponent } from '../course-detail-dialog/course-detail-dialog.component';

interface EnrolledCourse extends Course {
  progress: number;
  enrolledDate: Date;
  lastAccessedDate?: Date;
  completedLessons: number;
  totalLessons: number;
}

@Component({
  selector: 'app-my-courses',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatChipsModule,
    MatTabsModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatMenuModule
  ],
  templateUrl: './my-courses.component.html',
  styleUrl: './my-courses.component.scss'
})
export class MyCoursesComponent implements OnInit {
  enrolledCourses = signal<EnrolledCourse[]>([]);
  loading = signal(true);
  
  // Filter signals
  selectedTab = signal<'all' | 'in-progress' | 'completed'>('all');
  
  // Computed filtered courses
  filteredCourses = computed(() => {
    const courses = this.enrolledCourses();
    const tab = this.selectedTab();
    
    switch (tab) {
      case 'in-progress':
        return courses.filter(course => course.progress > 0 && course.progress < 100);
      case 'completed':
        return courses.filter(course => course.progress === 100);
      default:
        return courses;
    }
  });
  
  // Statistics
  stats = computed(() => {
    const courses = this.enrolledCourses();
    const totalCourses = courses.length;
    const completedCourses = courses.filter(c => c.progress === 100).length;
    const inProgressCourses = courses.filter(c => c.progress > 0 && c.progress < 100).length;
    const notStartedCourses = courses.filter(c => c.progress === 0).length;
    const totalProgress = totalCourses > 0 
      ? Math.round(courses.reduce((sum, c) => sum + c.progress, 0) / totalCourses)
      : 0;
    
    const totalStudyTime = courses.reduce((sum, c) => {
      const hours = parseInt(c.estimatedTime || '0');
      return sum + hours;
    }, 0);
    
    const completedStudyTime = courses
      .filter(c => c.progress === 100)
      .reduce((sum, c) => {
        const hours = parseInt(c.estimatedTime || '0');
        return sum + hours;
      }, 0);
    
    return {
      totalCourses,
      completedCourses,
      inProgressCourses,
      notStartedCourses,
      totalProgress,
      totalStudyTime,
      completedStudyTime
    };
  });
  
  constructor(
    private apiService: ApiService,
    private dialog: MatDialog
  ) {}
  
  ngOnInit() {
    this.loadEnrolledCourses();
  }
  
  loadEnrolledCourses() {
    this.loading.set(true);
    
    // Get current user ID from auth service
    const currentUser = this.apiService['authService'].currentUser();
    const userId = currentUser?.id;
    
    if (!userId) {
      console.error('No user ID found');
      this.loading.set(false);
      this.enrolledCourses.set([]);
      return;
    }
    
    console.log('📚 Loading enrolled courses for user:', userId);
    
    // Call real backend API to get enrolled courses with thumbnails
    this.apiService.getEnrolledCourses(userId).subscribe({
      next: (response: any) => {
        console.log('📦 Enrollments response:', response);
        if (response.data) {
          // Transform enrollments to enrolled courses with proper thumbnail mapping
          const enrolledCourses: EnrolledCourse[] = response.data.map((enrollment: any) => ({
            id: enrollment.courseId,
            title: enrollment.courseTitle,
            description: enrollment.courseDescription || 'No description available',
            instructor: enrollment.courseInstructor || 'Unknown Instructor',
            category: enrollment.courseCategory || 'General',
            difficulty: enrollment.courseDifficulty || 'Beginner',
            duration: enrollment.courseDuration || '20 hours',
            lessons: enrollment.totalLessons || 0,
            thumbnail: enrollment.courseThumbnail, // Map courseThumbnail from backend
            progress: enrollment.progressPercentage || 0,
            enrolledDate: new Date(enrollment.enrolledAt),
            lastAccessedDate: enrollment.lastAccessedAt ? new Date(enrollment.lastAccessedAt) : undefined,
            completedLessons: enrollment.completedLessons || 0,
            totalLessons: enrollment.totalLessons || 0,
            estimatedTime: enrollment.estimatedTime || enrollment.courseDuration || '20 hours',
            rating: enrollment.courseRating || 4.5,
            isEnrolled: true
          }));
          
          console.log('✅ Processed enrolled courses:', enrolledCourses);
          console.log('🖼️ Thumbnails:', enrolledCourses.map(c => ({ title: c.title, thumbnail: c.thumbnail })));
          this.enrolledCourses.set(enrolledCourses);
        }
        this.loading.set(false);
      },
      error: (error: any) => {
        console.error('Error loading enrolled courses:', error);
        this.loading.set(false);
        // Set empty array on error
        this.enrolledCourses.set([]);
      }
    });
  }
  
  openCourseDetails(course: EnrolledCourse) {
    const dialogRef = this.dialog.open(CourseDetailDialogComponent, {
      width: '900px',
      maxWidth: '95vw',
      data: {
        course,
        userId: 'user-123' // Replace with actual user ID
      },
      panelClass: 'course-detail-dialog-container'
    });
    
    dialogRef.afterClosed().subscribe(result => {
      if (result?.action === 'unenrolled') {
        // Refresh the list after unenrollment
        this.loadEnrolledCourses();
      }
    });
  }
  
  continueCourse(course: EnrolledCourse) {
    // Navigate to course content - implement navigation logic
    console.log('Continue course:', course.title);
  }
  
  onTabChange(index: number) {
    const tabs: ('all' | 'in-progress' | 'completed')[] = ['all', 'in-progress', 'completed'];
    this.selectedTab.set(tabs[index]);
  }
  
  getProgressColor(progress: number): string {
    if (progress === 0) return 'accent';
    if (progress === 100) return 'primary';
    return 'warn';
  }
  
  getProgressStatus(progress: number): string {
    if (progress === 0) return 'Not Started';
    if (progress === 100) return 'Completed';
    return 'In Progress';
  }
  
  formatDate(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return `${Math.floor(days / 30)} months ago`;
  }
}
