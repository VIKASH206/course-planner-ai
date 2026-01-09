import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, delay } from 'rxjs/operators';

import { Course } from '../../shared/models/course.interface';
import { User, UserRole } from '../../shared/models/user.interface';

export interface RoleUIConfig {
  primaryColor: string;
  features: string[];
  navigation: string[];
  actions: {
    label: string;
    action: string;
    icon: string;
    primary?: boolean;
  }[];
  dashboard: {
    widgets: string[];
    metrics: string[];
  };
}

@Injectable({
  providedIn: 'root'
})
export class MultiRoleAIService {

  constructor() { }

  /**
   * Get personalized course recommendations based on user role and profile
   */
  getCourseRecommendations(user: User): Observable<Course[]> {
    switch (user.role) {
      case 'student':
        return this.getStudentRecommendations();
      case 'instructor':
        return this.getInstructorRecommendations();
      case 'group_leader':
        return this.getGroupLeaderRecommendations();
      default:
        return this.getDefaultRecommendations();
    }
  }

  /**
   * Get role-specific UI configuration
   */
  getRoleUIConfig(role: UserRole): RoleUIConfig {
    const configs = {
      'student': {
        primaryColor: '#2196F3',
        features: ['enroll', 'progress', 'certificates', 'study-plan'],
        navigation: ['My Learning', 'Browse Courses', 'Progress', 'Certificates'],
        actions: [
          { label: 'Enroll', action: 'enroll', icon: 'add_circle', primary: true },
          { label: 'Preview', action: 'preview', icon: 'visibility' },
          { label: 'Continue', action: 'continue', icon: 'play_arrow', primary: true }
        ],
        dashboard: {
          widgets: ['progress', 'recent-courses', 'recommendations', 'achievements'],
          metrics: ['completion-rate', 'study-time', 'streak', 'certificates']
        }
      },
      'instructor': {
        primaryColor: '#4CAF50',
        features: ['create', 'analytics', 'student-management', 'content-library'],
        navigation: ['My Courses', 'Create Content', 'Analytics', 'Students'],
        actions: [
          { label: 'Create Course', action: 'create', icon: 'add', primary: true },
          { label: 'Edit', action: 'edit', icon: 'edit', primary: true },
          { label: 'Analytics', action: 'analytics', icon: 'analytics' }
        ],
        dashboard: {
          widgets: ['course-performance', 'student-progress', 'recent-activity', 'revenue'],
          metrics: ['total-students', 'course-rating', 'completion-rate', 'engagement']
        }
      },
      'group_leader': {
        primaryColor: '#FF9800',
        features: ['team-management', 'assign-courses', 'team-analytics', 'progress-tracking'],
        navigation: ['Team Overview', 'Learning Paths', 'Team Analytics', 'Course Library'],
        actions: [
          { label: 'Assign to Team', action: 'assign', icon: 'group_add', primary: true },
          { label: 'Team Analytics', action: 'analytics', icon: 'insights' }
        ],
        dashboard: {
          widgets: ['team-progress', 'skill-gaps', 'learning-paths', 'team-performance'],
          metrics: ['team-completion', 'skill-coverage', 'engagement-rate', 'productivity-gain']
        }
      },
      'admin': {
        primaryColor: '#9C27B0',
        features: ['user-management', 'system-analytics', 'content-moderation', 'platform-settings'],
        navigation: ['Dashboard', 'Users', 'Content', 'Analytics', 'Settings'],
        actions: [
          { label: 'Manage Users', action: 'manage-users', icon: 'people', primary: true }
        ],
        dashboard: {
          widgets: ['platform-overview', 'user-activity', 'content-stats', 'system-health'],
          metrics: ['total-users', 'course-catalog', 'engagement-rate', 'platform-growth']
        }
      }
    };

    return configs[role] || configs['student'];
  }

  /**
   * Student-specific course recommendations
   */
  private getStudentRecommendations(): Observable<Course[]> {
    const studentCourses: Course[] = [
      {
        id: '1',
        title: 'Introduction to Machine Learning',
        description: 'Perfect for beginners looking to enter the AI field. Based on your interest in technology.',
        category: 'Technology',
        difficulty: 'Beginner',
        duration: '40 hours',
        lessons: 25,
        estimatedTime: '40 hours',
        price: 99.99,
        rating: 4.8,
        studentsEnrolled: 15420,
        tags: ['Machine Learning', 'AI', 'Python', 'Data Science'],
        isEnrolled: false,
        progress: 0,
        instructor: 'Dr. Sarah Chen'
      },
      {
        id: '2',
        title: 'Digital Marketing Fundamentals',
        description: 'Learn modern marketing strategies tailored for your entrepreneurial interests.',
        category: 'Business',
        difficulty: 'Intermediate',
        duration: '30 hours',
        lessons: 18,
        estimatedTime: '30 hours',
        price: 79.99,
        rating: 4.6,
        studentsEnrolled: 8930,
        tags: ['Digital Marketing', 'SEO', 'Social Media', 'Analytics'],
        isEnrolled: true,
        progress: 35,
        instructor: 'Mark Johnson'
      }
    ];

    return of(studentCourses).pipe(delay(800));
  }

  /**
   * Instructor-specific course recommendations
   */
  private getInstructorRecommendations(): Observable<Course[]> {
    const instructorCourses: Course[] = [
      {
        id: '4',
        title: 'Course Creation Mastery',
        description: 'Learn to create engaging, high-quality courses that students love and complete.',
        category: 'Education',
        difficulty: 'Intermediate',
        duration: '25 hours',
        lessons: 15,
        estimatedTime: '25 hours',
        price: 149.99,
        rating: 4.9,
        studentsEnrolled: 3200,
        tags: ['Course Creation', 'Instructional Design', 'Video Production', 'Student Engagement'],
        isEnrolled: false,
        progress: 0,
        instructor: 'Emma Thompson'
      },
      {
        id: '5',
        title: 'Educational Technology Tools',
        description: 'Master the latest EdTech tools to enhance your teaching and student engagement.',
        category: 'Technology',
        difficulty: 'Beginner',
        duration: '20 hours',
        lessons: 12,
        estimatedTime: '20 hours',
        price: 89.99,
        rating: 4.7,
        studentsEnrolled: 5600,
        tags: ['EdTech', 'Teaching Tools', 'Online Learning', 'Student Engagement'],
        isEnrolled: true,
        progress: 60,
        instructor: 'Tech Education Team'
      }
    ];

    return of(instructorCourses).pipe(delay(600));
  }

  /**
   * Group Leader-specific course recommendations
   */
  private getGroupLeaderRecommendations(): Observable<Course[]> {
    const groupLeaderCourses: Course[] = [
      {
        id: '6',
        title: 'Team Learning & Development Strategy',
        description: 'Design and implement effective learning programs for your team\'s professional growth.',
        category: 'Leadership',
        difficulty: 'Advanced',
        duration: '35 hours',
        lessons: 20,
        estimatedTime: '35 hours',
        price: 199.99,
        rating: 4.8,
        studentsEnrolled: 2100,
        tags: ['Team Development', 'Learning Strategy', 'Leadership', 'Performance Management'],
        isEnrolled: false,
        progress: 0,
        instructor: 'Leadership Institute'
      },
      {
        id: '7',
        title: 'Data-Driven Team Management',
        description: 'Use analytics and data to make informed decisions about your team\'s learning and performance.',
        category: 'Analytics',
        difficulty: 'Intermediate',
        duration: '28 hours',
        lessons: 16,
        estimatedTime: '28 hours',
        price: 159.99,
        rating: 4.6,
        studentsEnrolled: 1800,
        tags: ['Team Analytics', 'Data Analysis', 'Performance Metrics', 'Decision Making'],
        isEnrolled: true,
        progress: 25,
        instructor: 'Data Leadership Team'
      }
    ];

    return of(groupLeaderCourses).pipe(delay(700));
  }

  /**
   * Default recommendations for unknown roles
   */
  private getDefaultRecommendations(): Observable<Course[]> {
    const defaultCourses: Course[] = [
      {
        id: '8',
        title: 'Professional Development Essentials',
        description: 'Core skills every professional needs to succeed in today\'s workplace.',
        category: 'Professional Development',
        difficulty: 'Beginner',
        duration: '15 hours',
        lessons: 10,
        estimatedTime: '15 hours',
        price: 59.99,
        rating: 4.5,
        studentsEnrolled: 25000,
        tags: ['Professional Skills', 'Communication', 'Time Management', 'Career Development'],
        isEnrolled: false,
        progress: 0,
        instructor: 'Career Development Team'
      }
    ];

    return of(defaultCourses).pipe(delay(400));
  }
}