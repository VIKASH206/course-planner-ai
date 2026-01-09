import { Component, Inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { ApiService } from '../../../core/services/api.service';
import { Course } from '../../../shared/models/course.interface';

@Component({
  selector: 'app-course-detail-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatChipsModule,
    MatProgressBarModule,
    MatDividerModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './course-detail-dialog.component.html',
  styleUrl: './course-detail-dialog.component.scss'
})
export class CourseDetailDialogComponent implements OnInit {
  course: Course;
  userId: string;
  
  aiSummary = signal<any>(null);
  relatedCourses = signal<Course[]>([]);
  loadingSummary = signal(false);
  loadingRelated = signal(false);
  enrolling = signal(false);
  
  // Mock syllabus data
  syllabus = [
    {
      module: 'Introduction',
      topics: ['Getting Started', 'Setup Environment', 'Basic Concepts'],
      duration: '2 hours'
    },
    {
      module: 'Core Concepts',
      topics: ['Fundamentals', 'Best Practices', 'Hands-on Projects'],
      duration: '8 hours'
    },
    {
      module: 'Advanced Topics',
      topics: ['Advanced Techniques', 'Real-world Applications', 'Case Studies'],
      duration: '6 hours'
    },
    {
      module: 'Final Project',
      topics: ['Project Planning', 'Implementation', 'Review & Feedback'],
      duration: '4 hours'
    }
  ];
  
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { course: Course, userId: string },
    private dialogRef: MatDialogRef<CourseDetailDialogComponent>,
    private apiService: ApiService,
    private snackBar: MatSnackBar
  ) {
    this.course = data.course;
    this.userId = data.userId;
  }
  
  ngOnInit() {
    this.loadAISummary();
    this.loadRelatedCourses();
  }
  
  loadAISummary() {
    this.loadingSummary.set(true);
    
    // Call real backend API for AI summary
    this.apiService.getCourseSummary(this.course.id!).subscribe({
      next: (response: any) => {
        if (response.data) {
          this.aiSummary.set({
            summary: response.data.summary || `${this.course.title} is a comprehensive course designed to help you master ${this.course.category}.`,
            keyPoints: response.data.keyPoints || [
              `Master ${this.course.category} fundamentals`,
              'Work on practical projects',
              'Learn industry best practices',
              'Get hands-on experience'
            ],
            learningOutcomes: response.data.learningOutcomes || [
              'Understand core concepts',
              'Build real-world applications',
              'Apply knowledge practically',
              'Gain industry-relevant skills'
            ],
            estimatedCompletionDays: Math.ceil((parseInt(this.course.estimatedTime || '20')) / 2),
            recommendedFor: [
              `${this.course.difficulty} level learners`,
              `Professionals interested in ${this.course.category}`,
              'Career switchers and upstarters'
            ]
          });
        }
        this.loadingSummary.set(false);
      },
      error: (error: any) => {
        console.error('Error loading AI summary:', error);
        // Fallback to default summary
        this.aiSummary.set({
          summary: `${this.course.title} is a comprehensive course designed to help you master ${this.course.category}. This ${this.course.difficulty?.toLowerCase()}-level course provides hands-on experience through practical projects and real-world examples.`,
          keyPoints: [
            `Master ${this.course.category} fundamentals`,
            'Work on practical projects',
            'Learn industry best practices',
            'Get hands-on experience'
          ],
          learningOutcomes: [
            'Understand core concepts',
            'Build real-world applications',
            'Apply knowledge practically',
            'Gain industry-relevant skills'
          ],
          estimatedCompletionDays: Math.ceil((parseInt(this.course.estimatedTime || '20')) / 2),
          recommendedFor: [
            `${this.course.difficulty} level learners`,
            `Professionals interested in ${this.course.category}`,
            'Career switchers and upstarters'
          ]
        });
        this.loadingSummary.set(false);
      }
    });
  }
  
  loadRelatedCourses() {
    this.loadingRelated.set(true);
    
    // Call real backend API for related courses
    this.apiService.getRelatedCourses(this.course.id!).subscribe({
      next: (response: any) => {
        if (response.data) {
          const related = response.data
            .filter((c: Course) => c.id !== this.course.id)
            .slice(0, 3);
          this.relatedCourses.set(related);
        }
        this.loadingRelated.set(false);
      },
      error: (error: any) => {
        console.error('Error loading related courses:', error);
        // Fallback: filter from all courses by category
        this.apiService.getCourses().subscribe({
          next: (coursesResponse: any) => {
            if (coursesResponse.data) {
              const related = coursesResponse.data
                .filter((c: Course) => 
                  c.id !== this.course.id && 
                  c.category === this.course.category
                )
                .slice(0, 3);
              this.relatedCourses.set(related);
            }
            this.loadingRelated.set(false);
          },
          error: () => {
            this.loadingRelated.set(false);
          }
        });
      }
    });
  }
  
  enrollInCourse() {
    this.enrolling.set(true);
    
    // Call real backend API for enrollment
    this.apiService.enrollInCourse(this.course.id!, this.userId).subscribe({
      next: (response: any) => {
        this.enrolling.set(false);
        this.snackBar.open(`Successfully enrolled in ${this.course.title}!`, 'OK', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        this.dialogRef.close({ action: 'enrolled', courseId: this.course.id });
      },
      error: (error: any) => {
        console.error('Enrollment error:', error);
        this.enrolling.set(false);
        this.snackBar.open('Failed to enroll in course. Please try again.', 'OK', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }
  
  unenrollFromCourse() {
    this.enrolling.set(true);
    
    // Call real backend API for unenrollment
    this.apiService.unenrollFromCourse(this.course.id!, this.userId).subscribe({
      next: (response: any) => {
        this.enrolling.set(false);
        this.snackBar.open(`Successfully unenrolled from ${this.course.title}`, 'OK', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        this.dialogRef.close({ action: 'unenrolled', courseId: this.course.id });
      },
      error: (error: any) => {
        console.error('Unenrollment error:', error);
        this.enrolling.set(false);
        this.snackBar.open('Failed to unenroll from course. Please try again.', 'OK', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }
  
  close() {
    this.dialogRef.close();
  }
}
