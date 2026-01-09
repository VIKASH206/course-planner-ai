import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface User {
  id?: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: string;
  preferences?: any;
  createdAt?: Date;
  lastLoginAt?: Date;
}

export interface Course {
  id?: string;
  title: string;
  description: string;
  instructor: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  lessons: number;
  progress?: number;
  thumbnail?: string;
  price?: number;
  rating?: number;
  reviews?: number;
  tags?: string[];
  createdAt?: Date;
  updatedAt?: Date;
  totalLessons?: number;
  completedLessons?: number;
  estimatedTime?: string;
  enrolledDate?: Date;
  isEnrolled?: boolean;
  studentsCount?: number;
  objectives?: string[];
  prerequisites?: string[];
}

export interface Task {
  id?: string;
  title: string;
  description?: string;
  dueDate?: Date;
  priority: 'Low' | 'Medium' | 'High';
  status: 'Pending' | 'In Progress' | 'Completed';
  courseId?: string;
  assignedBy?: string;
  createdAt?: Date;
  completedAt?: Date;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: 'success' | 'error';
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  // Mock data for frontend-only operation
  private mockCourses: Course[] = [
    {
      id: '1',
      title: 'Introduction to Web Development',
      description: 'Learn the basics of HTML, CSS, and JavaScript',
      instructor: 'John Smith',
      category: 'Web Development',
      difficulty: 'Beginner',
      duration: '8 weeks',
      lessons: 24,
      progress: 0,
      thumbnail: 'https://via.placeholder.com/300x200?text=Web+Dev',
      price: 99,
      rating: 4.5,
      reviews: 127,
      tags: ['HTML', 'CSS', 'JavaScript'],
      totalLessons: 24,
      completedLessons: 0,
      estimatedTime: '2-3 hours/week',
      isEnrolled: false,
      studentsCount: 1250,
      objectives: [
        'Build responsive websites',
        'Understand modern web technologies',
        'Create interactive user interfaces'
      ],
      prerequisites: ['Basic computer skills'],
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-03-01')
    }
  ];

  private mockTasks: Task[] = [
    {
      id: '1',
      title: 'Complete HTML Basics Module',
      description: 'Finish all lessons in the HTML fundamentals section',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      priority: 'High',
      status: 'Pending',
      courseId: '1',
      assignedBy: 'System',
      createdAt: new Date()
    }
  ];

  constructor() {}

  // Frontend-only methods
  getCourses(): Observable<ApiResponse<Course[]>> {
    return of({
      data: this.mockCourses,
      message: 'Courses retrieved (frontend-only)',
      status: 'success' as const,
      meta: {
        total: this.mockCourses.length,
        page: 1,
        limit: 10,
        totalPages: 1
      }
    }).pipe(delay(500));
  }

  getTasks(): Observable<ApiResponse<Task[]>> {
    return of({
      data: this.mockTasks,
      message: 'Tasks retrieved (frontend-only)',
      status: 'success' as const,
      meta: {
        total: this.mockTasks.length,
        page: 1,
        limit: 10,
        totalPages: 1
      }
    }).pipe(delay(400));
  }

  sendMessage(message: string): Observable<ApiResponse<any>> {
    const responses = [
      'That\'s a great question! Let me help you with that.',
      'I understand you\'re working on this topic. Here are some suggestions...',
      'Based on your learning progress, I recommend focusing on...'
    ];

    const randomResponse = responses[Math.floor(Math.random() * responses.length)];

    return of({
      data: {
        message: randomResponse,
        timestamp: new Date(),
        type: 'ai_response'
      },
      message: 'AI response generated (frontend-only)',
      status: 'success' as const
    }).pipe(delay(1500));
  }
}