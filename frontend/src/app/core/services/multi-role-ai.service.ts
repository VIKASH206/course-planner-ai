import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { Course } from '../../shared/models/course.interface';
import { User, UserRole, AIRecommendationContext } from '../../shared/models/user.interface';

export interface RoleBasedRecommendation {
  role: UserRole;
  primaryAction: string;
  secondaryAction?: string;
  recommendationReason: string;
  learningPath?: string;
  priority: 'high' | 'medium' | 'low';
  tags: string[];
}

@Injectable({
  providedIn: 'root'
})
export class MultiRoleAIService {

  /**
   * Get role-specific course recommendations
   */
  getCourseRecommendations(user: User): Observable<Course[]> {
    const context = this.buildRecommendationContext(user);
    
    switch (user.role) {
      case 'student':
        return this.getStudentRecommendations(context);
      case 'instructor':
        return this.getInstructorRecommendations(context);
      case 'group_leader':
        return this.getGroupLeaderRecommendations(context);
      default:
        return this.getGenericRecommendations(context);
    }
  }

  /**
   * Student-focused recommendations
   */
  private getStudentRecommendations(context: AIRecommendationContext): Observable<Course[]> {
    const studentCourses: Course[] = [
      {
        id: 'python-data-science-student',
        title: '🐍 Python Data Science Bootcamp',
        description: 'Perfect for students! Start with basics and progress to advanced data analysis. Includes university-level projects and peer collaboration.',
        instructor: 'Dr. Sarah Chen',
        category: 'Data Science',
        difficulty: 'Beginner',
        duration: '12 weeks',
        lessons: 36,
        progress: 0,
        price: 99,
        rating: 4.8,
        reviews: 1250,
        tags: ['Python', 'Data Science', 'Student-Friendly', 'Projects'],
        isEnrolled: false,
        studentsCount: 5420,
        totalLessons: 36,
        completedLessons: 0,
        estimatedTime: '8-10 hours/week',
        objectives: ['Master Python fundamentals', 'Learn pandas & numpy', 'Build data visualization dashboards', 'Complete capstone project'],
        prerequisites: ['Basic programming knowledge'],
        aiRecommendation: {
          role: 'student',
          primaryAction: 'Enroll Now',
          secondaryAction: 'Add to Wishlist',
          recommendationReason: 'Based on your Java foundation, Python is the perfect next step for data science career path. High job market demand!',
          learningPath: 'Python → Data Analysis → Machine Learning → AI Engineer',
          priority: 'high',
          tags: ['Career-Boost', 'High-Demand', 'Beginner-Friendly']
        }
      },
      {
        id: 'web-dev-student',
        title: '🌐 Full-Stack Web Development',
        description: 'Complete web development course designed for students. Build real projects for your portfolio while learning industry-standard technologies.',
        instructor: 'Alex Martinez',
        category: 'Web Development',
        difficulty: 'Beginner',
        duration: '16 weeks',
        lessons: 48,
        progress: 0,
        price: 149,
        rating: 4.7,
        reviews: 980,
        tags: ['HTML', 'CSS', 'JavaScript', 'React', 'Portfolio'],
        isEnrolled: false,
        studentsCount: 3200,
        totalLessons: 48,
        completedLessons: 0,
        estimatedTime: '10-12 hours/week',
        objectives: ['Build responsive websites', 'Master React.js', 'Create REST APIs', 'Deploy to cloud'],
        prerequisites: ['Basic computer skills'],
        aiRecommendation: {
          role: 'student',
          primaryAction: 'Start Free Trial',
          secondaryAction: 'View Syllabus',
          recommendationReason: 'Complement your Java backend skills with frontend development. Perfect for building complete applications and impressive portfolio!',
          learningPath: 'Frontend → Full-Stack → Software Engineer',
          priority: 'high',
          tags: ['Portfolio-Builder', 'Complete-Skillset', 'Industry-Ready']
        }
      },
      {
        id: 'algorithms-interview-prep',
        title: '🧠 Algorithm Mastery for Interviews',
        description: 'Student-focused algorithm course with emphasis on technical interview preparation. Practice with real company questions and peer coding sessions.',
        instructor: 'Dr. Michael Zhang',
        category: 'Computer Science',
        difficulty: 'Intermediate',
        duration: '10 weeks',
        lessons: 30,
        progress: 0,
        price: 129,
        rating: 4.9,
        reviews: 2100,
        tags: ['Algorithms', 'Interview Prep', 'FAANG', 'Practice'],
        isEnrolled: false,
        studentsCount: 8900,
        totalLessons: 30,
        completedLessons: 0,
        estimatedTime: '8-10 hours/week',
        objectives: ['Master sorting algorithms', 'Solve dynamic programming', 'Ace coding interviews', 'Join study groups'],
        prerequisites: ['Java or Python knowledge'],
        aiRecommendation: {
          role: 'student',
          primaryAction: 'Join Cohort',
          secondaryAction: 'Free Practice',
          recommendationReason: 'Essential for landing internships and entry-level positions. Your Java foundation makes this course highly accessible!',
          learningPath: 'Algorithms → System Design → Senior Developer',
          priority: 'high',
          tags: ['Career-Critical', 'Interview-Success', 'Peer-Learning']
        }
      }
    ];

    return of(studentCourses).pipe(delay(600));
  }

  /**
   * Instructor-focused recommendations
   */
  private getInstructorRecommendations(context: AIRecommendationContext): Observable<Course[]> {
    const instructorCourses: Course[] = [
      {
        id: 'course-creation-mastery',
        title: '🎓 Course Creation & Online Teaching',
        description: 'Learn how to create engaging online courses, build your teaching brand, and monetize your expertise. Includes AI-powered content creation tools.',
        instructor: 'Jennifer Wilson',
        category: 'Education Technology',
        difficulty: 'Intermediate',
        duration: '8 weeks',
        lessons: 24,
        progress: 0,
        price: 199,
        rating: 4.9,
        reviews: 450,
        tags: ['Course Creation', 'Online Teaching', 'Monetization', 'AI Tools'],
        isEnrolled: false,
        studentsCount: 1200,
        totalLessons: 24,
        completedLessons: 0,
        estimatedTime: '6-8 hours/week',
        objectives: ['Design compelling curricula', 'Master video production', 'Build student communities', 'Scale your teaching business'],
        prerequisites: ['Subject matter expertise'],
        aiRecommendation: {
          role: 'instructor',
          primaryAction: 'Start Creating',
          secondaryAction: 'View Success Stories',
          recommendationReason: 'Transform your Java expertise into a profitable online course. High demand for programming instructors in the market!',
          learningPath: 'Course Creator → Education Entrepreneur → Online Education Leader',
          priority: 'high',
          tags: ['Monetize-Skills', 'Business-Growth', 'Market-Opportunity']
        }
      },
      {
        id: 'advanced-java-spring-instructor',
        title: '⚡ Advanced Spring Framework Deep Dive',
        description: 'Master advanced Spring concepts to teach enterprise-level Java development. Includes latest Spring Boot 3.0 features and microservices architecture.',
        instructor: 'Robert Thompson',
        category: 'Backend Development',
        difficulty: 'Advanced',
        duration: '14 weeks',
        lessons: 42,
        progress: 0,
        price: 299,
        rating: 4.8,
        reviews: 320,
        tags: ['Spring Framework', 'Enterprise Java', 'Microservices', 'Advanced'],
        isEnrolled: false,
        studentsCount: 890,
        totalLessons: 42,
        completedLessons: 0,
        estimatedTime: '10-12 hours/week',
        objectives: ['Master Spring Security', 'Design microservice architectures', 'Implement reactive programming', 'Teach enterprise patterns'],
        prerequisites: ['Strong Java foundation'],
        aiRecommendation: {
          role: 'instructor',
          primaryAction: 'Expand Expertise',
          secondaryAction: 'Preview Content',
          recommendationReason: 'Stay ahead of the curve with latest Spring technologies. Your students will benefit from cutting-edge enterprise knowledge!',
          learningPath: 'Advanced Java → Enterprise Architect → Technical Leader',
          priority: 'medium',
          tags: ['Stay-Current', 'Enterprise-Focus', 'Competitive-Edge']
        }
      }
    ];

    return of(instructorCourses).pipe(delay(600));
  }

  /**
   * Group Leader-focused recommendations
   */
  private getGroupLeaderRecommendations(context: AIRecommendationContext): Observable<Course[]> {
    const groupLeaderCourses: Course[] = [
      {
        id: 'team-java-bootcamp',
        title: '👥 Java Team Development Bootcamp',
        description: 'Comprehensive Java course designed for teams. Includes collaborative coding exercises, peer reviews, and project management integration.',
        instructor: 'Team Learning Institute',
        category: 'Team Programming',
        difficulty: 'Beginner',
        duration: '12 weeks',
        lessons: 36,
        progress: 0,
        price: 499, // Team pricing
        rating: 4.8,
        reviews: 150,
        tags: ['Team Learning', 'Java', 'Collaboration', 'Project-Based'],
        isEnrolled: false,
        studentsCount: 450, // teams, not individuals
        totalLessons: 36,
        completedLessons: 0,
        estimatedTime: '6-8 hours/week per member',
        objectives: ['Synchronized team learning', 'Collaborative coding practices', 'Shared project delivery', 'Team skill assessment'],
        prerequisites: ['Team of 3-15 members'],
        aiRecommendation: {
          role: 'group_leader',
          primaryAction: 'Enroll Team',
          secondaryAction: 'Request Demo',
          recommendationReason: 'Perfect for upskilling your entire team in Java. Includes team dashboards, progress tracking, and collaborative projects!',
          learningPath: 'Team Java → Advanced Projects → Enterprise Development',
          priority: 'high',
          tags: ['Team-Focused', 'Collaborative', 'Progress-Tracking']
        }
      },
      {
        id: 'agile-team-management',
        title: '🚀 Agile Team Leadership & Development',
        description: 'Learn to lead technical teams effectively while managing learning initiatives. Combines leadership skills with technical team development.',
        instructor: 'Leadership Academy',
        category: 'Leadership',
        difficulty: 'Intermediate',
        duration: '10 weeks',
        lessons: 30,
        progress: 0,
        price: 399,
        rating: 4.7,
        reviews: 280,
        tags: ['Leadership', 'Agile', 'Team Management', 'Professional Development'],
        isEnrolled: false,
        studentsCount: 650,
        totalLessons: 30,
        completedLessons: 0,
        estimatedTime: '5-7 hours/week',
        objectives: ['Lead technical teams', 'Implement agile practices', 'Manage skill development', 'Drive team performance'],
        prerequisites: ['Team leadership experience'],
        aiRecommendation: {
          role: 'group_leader',
          primaryAction: 'Develop Leadership',
          secondaryAction: 'Assessment Tool',
          recommendationReason: 'Enhance your technical leadership skills while managing your team\'s Java learning journey. Perfect combination of tech and management!',
          learningPath: 'Team Leader → Technical Manager → Engineering Director',
          priority: 'medium',
          tags: ['Leadership-Growth', 'Career-Advancement', 'Team-Performance']
        }
      }
    ];

    return of(groupLeaderCourses).pipe(delay(600));
  }

  /**
   * Generic recommendations for unknown roles
   */
  private getGenericRecommendations(context: AIRecommendationContext): Observable<Course[]> {
    // Return a mix of popular courses for all roles
    return of([]).pipe(delay(400));
  }

  /**
   * Build recommendation context from user data
   */
  private buildRecommendationContext(user: User): AIRecommendationContext {
    return {
      userRole: user.role,
      completedCourses: [], // Would come from user's course history
      currentCourses: [], // Would come from user's active courses
      skillLevel: user.profile.academicLevel || 'beginner',
      interests: user.profile.interests || [],
      weakAreas: user.profile.weakAreas || [],
      learningGoals: user.profile.learningGoals || [],
      timeAvailable: 8, // Default hours per week
      preferredDifficulty: user.preferences.difficultyPreference || 'gradual',
      
      // Add role-specific contexts based on user role
      ...(user.role === 'group_leader' && {
        teamContext: {
          teamSize: user.profile.teamSize || 5,
          teamSkillLevel: user.profile.teamSkillLevel || 'mixed',
          sharedGoals: ['Java Development', 'Team Collaboration']
        }
      }),
      
      ...(user.role === 'instructor' && {
        instructorContext: {
          teachingSubjects: user.profile.teachingSubjects || ['Programming'],
          experienceLevel: user.profile.yearsExperience ? 
            (user.profile.yearsExperience > 5 ? 'expert' : 'intermediate') : 'beginner',
          marketDemand: ['Java', 'Python', 'Web Development'] // Would come from market analysis
        }
      })
    };
  }

  /**
   * Get role-specific UI configuration
   */
  getRoleUIConfig(role: UserRole): any {
    const configs: Record<UserRole, any> = {
      student: {
        primaryColor: 'blue',
        dashboardLayout: 'learning-focused',
        featuredSections: ['My Courses', 'Recommendations', 'Progress'],
        actionButtons: ['Enroll', 'Wishlist', 'Preview'],
        showPricing: true,
        showRatings: true,
        showCareerPath: true
      },
      instructor: {
        primaryColor: 'green',
        dashboardLayout: 'creation-focused',
        featuredSections: ['Course Analytics', 'Content Creation', 'Student Feedback'],
        actionButtons: ['Create Similar', 'Collaborate', 'Analyze Trends'],
        showPricing: false,
        showRatings: true,
        showCareerPath: false
      },
      group_leader: {
        primaryColor: 'purple',
        dashboardLayout: 'team-focused',
        featuredSections: ['Team Progress', 'Assignments', 'Collaboration'],
        actionButtons: ['Assign to Team', 'Create Group', 'Track Progress'],
        showPricing: true,
        showRatings: true,
        showCareerPath: false
      },
      admin: {
        primaryColor: 'red',
        dashboardLayout: 'admin-focused',
        featuredSections: ['System Analytics', 'User Management', 'Course Approval'],
        actionButtons: ['Approve', 'Manage', 'Analytics'],
        showPricing: false,
        showRatings: false,
        showCareerPath: false
      }
    };

    return configs[role] || configs.student;
  }
}