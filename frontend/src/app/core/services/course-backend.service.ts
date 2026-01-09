import { Injectable, signal } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { BackendApiService, Course } from './backend-api.service';
import { AuthService } from './auth-backend.service';

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  // Reactive state for courses
  private _courses = signal<Course[]>([]);
  private _activeCourses = signal<Course[]>([]);
  private _completedCourses = signal<Course[]>([]);
  private _isLoading = signal<boolean>(false);

  // Public readonly signals
  courses = this._courses.asReadonly();
  activeCourses = this._activeCourses.asReadonly();
  completedCourses = this._completedCourses.asReadonly();
  isLoading = this._isLoading.asReadonly();

  constructor(
    private backendApi: BackendApiService,
    private authService: AuthService
  ) {}

  /**
   * Load all user courses
   */
  loadUserCourses(userId?: string): Observable<Course[]> {
    const currentUserId = userId || this.authService.getCurrentUserId();
    if (!currentUserId) {
      return throwError(() => new Error('No user logged in'));
    }

    this._isLoading.set(true);

    return this.backendApi.getUserCourses(currentUserId).pipe(
      map(response => {
        if (response.success) {
          const courses = response.data;
          this._courses.set(courses);
          
          // Separate active and completed courses
          this._activeCourses.set(courses.filter(course => course.isActive && !course.isCompleted));
          this._completedCourses.set(courses.filter(course => course.isCompleted));
          
          return courses;
        } else {
          throw new Error(response.message);
        }
      }),
      tap(() => this._isLoading.set(false)),
      catchError(error => {
        this._isLoading.set(false);
        console.error('Failed to load user courses:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Create a new course
   */
  createCourse(courseData: Partial<Course>): Observable<Course> {
    const currentUserId = this.authService.getCurrentUserId();
    if (!currentUserId) {
      return throwError(() => new Error('No user logged in'));
    }

    const newCourse = {
      ...courseData,
      userId: currentUserId
    };

    return this.backendApi.createCourse(newCourse).pipe(
      map(response => {
        if (response.success) {
          const course = response.data;
          
          // Update local state
          const currentCourses = this._courses();
          this._courses.set([...currentCourses, course]);
          
          if (course.isActive) {
            const currentActive = this._activeCourses();
            this._activeCourses.set([...currentActive, course]);
          }
          
          return course;
        } else {
          throw new Error(response.message);
        }
      }),
      catchError(error => {
        console.error('Failed to create course:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Update course details
   */
  updateCourse(courseId: string, updates: Partial<Course>): Observable<Course> {
    return this.backendApi.updateCourse(courseId, updates).pipe(
      map(response => {
        if (response.success) {
          const updatedCourse = response.data;
          this.updateCourseInState(updatedCourse);
          return updatedCourse;
        } else {
          throw new Error(response.message);
        }
      }),
      catchError(error => {
        console.error('Failed to update course:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Update course progress
   */
  updateCourseProgress(courseId: string, progress: number): Observable<Course> {
    return this.backendApi.updateCourseProgress(courseId, progress).pipe(
      map(response => {
        if (response.success) {
          const updatedCourse = response.data;
          this.updateCourseInState(updatedCourse);
          
          // If course is newly completed, refresh user profile to update stats
          if (updatedCourse.isCompleted) {
            this.authService.refreshUserProfile().subscribe();
          }
          
          return updatedCourse;
        } else {
          throw new Error(response.message);
        }
      }),
      catchError(error => {
        console.error('Failed to update course progress:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Delete a course
   */
  deleteCourse(courseId: string): Observable<void> {
    return this.backendApi.deleteCourse(courseId).pipe(
      map(response => {
        if (response.success) {
          this.removeCourseFromState(courseId);
        } else {
          throw new Error(response.message);
        }
      }),
      catchError(error => {
        console.error('Failed to delete course:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Search courses
   */
  searchCourses(query: string): Observable<Course[]> {
    return this.backendApi.searchCourses(query).pipe(
      map(response => {
        if (response.success) {
          return response.data;
        } else {
          throw new Error(response.message);
        }
      }),
      catchError(error => {
        console.error('Failed to search courses:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get courses by category
   */
  getCoursesByCategory(category: string): Observable<Course[]> {
    return this.backendApi.getCoursesByCategory(category).pipe(
      map(response => {
        if (response.success) {
          return response.data;
        } else {
          throw new Error(response.message);
        }
      }),
      catchError(error => {
        console.error('Failed to get courses by category:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get courses by difficulty
   */
  getCoursesByDifficulty(difficulty: string): Observable<Course[]> {
    return this.backendApi.getCoursesByDifficulty(difficulty).pipe(
      map(response => {
        if (response.success) {
          return response.data;
        } else {
          throw new Error(response.message);
        }
      }),
      catchError(error => {
        console.error('Failed to get courses by difficulty:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get a single course by ID
   */
  getCourse(courseId: string): Observable<Course> {
    return this.backendApi.getCourse(courseId).pipe(
      map(response => {
        if (response.success) {
          return response.data;
        } else {
          throw new Error(response.message);
        }
      }),
      catchError(error => {
        console.error('Failed to get course:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get course progress statistics
   */
  getCourseStats(userId?: string): { total: number; completed: number; inProgress: number; averageProgress: number } {
    const courses = this._courses();
    const total = courses.length;
    const completed = courses.filter(course => course.isCompleted).length;
    const inProgress = courses.filter(course => !course.isCompleted && course.progressPercentage > 0).length;
    const averageProgress = courses.length > 0 
      ? courses.reduce((sum, course) => sum + course.progressPercentage, 0) / courses.length 
      : 0;

    return {
      total,
      completed,
      inProgress,
      averageProgress: Math.round(averageProgress)
    };
  }

  /**
   * Get courses grouped by category
   */
  getCoursesByCategories(): { [category: string]: Course[] } {
    const courses = this._courses();
    return courses.reduce((grouped, course) => {
      const category = course.category || 'Uncategorized';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(course);
      return grouped;
    }, {} as { [category: string]: Course[] });
  }

  /**
   * Update course in local state
   */
  private updateCourseInState(updatedCourse: Course): void {
    // Update in main courses array
    const courses = this._courses();
    const courseIndex = courses.findIndex(c => c.id === updatedCourse.id);
    if (courseIndex !== -1) {
      const updatedCourses = [...courses];
      updatedCourses[courseIndex] = updatedCourse;
      this._courses.set(updatedCourses);
    }

    // Update active courses
    const activeCourses = this._activeCourses();
    const activeIndex = activeCourses.findIndex(c => c.id === updatedCourse.id);
    if (updatedCourse.isActive && !updatedCourse.isCompleted) {
      if (activeIndex === -1) {
        this._activeCourses.set([...activeCourses, updatedCourse]);
      } else {
        const updatedActive = [...activeCourses];
        updatedActive[activeIndex] = updatedCourse;
        this._activeCourses.set(updatedActive);
      }
    } else if (activeIndex !== -1) {
      const updatedActive = activeCourses.filter(c => c.id !== updatedCourse.id);
      this._activeCourses.set(updatedActive);
    }

    // Update completed courses
    const completedCourses = this._completedCourses();
    const completedIndex = completedCourses.findIndex(c => c.id === updatedCourse.id);
    if (updatedCourse.isCompleted) {
      if (completedIndex === -1) {
        this._completedCourses.set([...completedCourses, updatedCourse]);
      } else {
        const updatedCompleted = [...completedCourses];
        updatedCompleted[completedIndex] = updatedCourse;
        this._completedCourses.set(updatedCompleted);
      }
    } else if (completedIndex !== -1) {
      const updatedCompleted = completedCourses.filter(c => c.id !== updatedCourse.id);
      this._completedCourses.set(updatedCompleted);
    }
  }

  /**
   * Remove course from local state
   */
  private removeCourseFromState(courseId: string): void {
    const courses = this._courses().filter(c => c.id !== courseId);
    const activeCourses = this._activeCourses().filter(c => c.id !== courseId);
    const completedCourses = this._completedCourses().filter(c => c.id !== courseId);

    this._courses.set(courses);
    this._activeCourses.set(activeCourses);
    this._completedCourses.set(completedCourses);
  }

  /**
   * Reset state (useful for logout)
   */
  resetState(): void {
    this._courses.set([]);
    this._activeCourses.set([]);
    this._completedCourses.set([]);
    this._isLoading.set(false);
  }
}