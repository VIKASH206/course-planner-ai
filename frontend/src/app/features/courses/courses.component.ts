import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

// Angular Material Imports
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { ApiService } from '../../core/services/api.service';
import { MultiRoleAIService } from './multi-role-ai.service';
import { NotificationService } from '../../core/services/notification.service';
import { AuthService } from '../../core/services/auth-backend.service';
import { Course } from '../../shared/models/course.interface';
import { User, UserRole } from '../../shared/models/user.interface';
import { EditCourseDialogComponent } from './edit-course-dialog.component';
import { CourseDetailComponent } from './course-detail/course-detail.component';

// Define UserRole as const for runtime usage
const USER_ROLES = {
  STUDENT: 'STUDENT',
  INSTRUCTOR: 'INSTRUCTOR', 
  GROUP_LEADER: 'GROUP_LEADER',
  ADMIN: 'ADMIN'
} as const;


@Component({
  selector: 'app-courses',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatSnackBarModule,
    MatMenuModule,
    MatBadgeModule,
    MatDialogModule,
    CourseDetailComponent
  ],
  templateUrl: './courses.component.html',
  styleUrl: './courses.component.scss'
})
export class CoursesComponent implements OnInit {
  courses = signal<Course[]>([]);
  filteredCourses = signal<Course[]>([]);
  
  // AI Recommendations
  aiRecommendedCourses = signal<any[]>([]);
  loadingRecommendations = signal(true);
  noCoursesForInterests = signal(false); // Track when user interests don't match any courses
  
  // User Profile Data for AI Context
  userProfile = signal<any>(null);
  userInterests = signal<string[]>([]);
  userSkills = signal<string[]>([]);
  completedCourses = signal<any[]>([]);
  
  // Multi-role support - Use real logged-in user from AuthService
  currentUser = signal<User | null>(null);
  
  uiConfig = signal<any>({});
  
  loadingCourses = false;
  creatingCourse = false;
  selectedCourse: Course | null = null;
  isEditing = false;
  showCreateModal = false;
  
  // Course Detail Modal
  selectedCourseForDetail: any = null;
  showCourseDetail = false;
  
  // New properties for filter and navigation
  selectedTabIndex = 0;
  searchQuery = '';
  selectedCategory = '';
  selectedDifficulty = '';
  selectedDuration = '';
  
  filters = {
    search: '',
    category: '',
    difficulty: '',
    sortBy: 'title'
  };
  
  courseForm: FormGroup;

  constructor(
    private apiService: ApiService,
    private multiRoleAIService: MultiRoleAIService,
    private authService: AuthService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private notificationService: NotificationService,
    private dialog: MatDialog
  ) {
    this.courseForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      category: ['', Validators.required],
      difficulty: ['', Validators.required],
      estimatedTime: [''],
      price: [0],
      tags: ['']
    });
  }

  ngOnInit() {
    console.log('🚀 CoursesComponent initialized!');
    
    // Load real user from AuthService
    const loggedInUser = this.authService.currentUser();
    if (loggedInUser) {
      // Convert AuthUser to User with proper defaults
      const user: User = {
        id: loggedInUser.id || '',
        email: loggedInUser.email || '',
        firstName: loggedInUser.firstName || '',
        lastName: loggedInUser.lastName || '',
        role: 'student', // Default role
        profile: {
          academicLevel: 'beginner',
          interests: [],
          weakAreas: [],
          strongAreas: [],
          learningGoals: []
        },
        preferences: {
          preferredLearningStyle: 'visual',
          studyTime: 'flexible',
          courseDuration: 'medium',
          difficultyPreference: 'gradual',
          emailNotifications: true,
          pushNotifications: false,
          weeklyProgress: true,
          courseRecommendations: true,
          theme: 'light',
          language: 'en'
        },
        stats: {
          totalCourses: 0,
          completedCourses: 0,
          inProgressCourses: 0,
          totalStudyHours: 0,
          currentStreak: 0,
          longestStreak: 0
        },
        createdAt: loggedInUser.createdAt ? new Date(loggedInUser.createdAt) : new Date(),
        lastLoginAt: loggedInUser.lastLogin ? new Date(loggedInUser.lastLogin) : new Date()
      };
      
      this.currentUser.set(user);
      console.log('✅ Loaded real user:', loggedInUser.email, 'ID:', loggedInUser.id);
    } else {
      console.error('❌ No logged-in user found! Redirecting to login...');
      // Redirect to login if no user is logged in
      return;
    }
    
    this.initializeUserConfig();
    
    // Load user profile first
    this.loadUserProfile();
    
    // Load courses and generate recommendations
    this.loadCoursesAndGenerateRecommendations();
  }

  private initializeUserConfig() {
    const user = this.currentUser();
    if (!user) {
      console.error('❌ No user found in initializeUserConfig');
      return;
    }
    
    const config = this.multiRoleAIService.getRoleUIConfig(user.role || 'student');
    this.uiConfig.set(config);
    console.log('User role:', user.role, 'UI Config:', config);
  }

  // New unified method to load courses and generate recommendations
  loadCoursesAndGenerateRecommendations() {
    this.loadingCourses = true;
    this.loadingRecommendations.set(true);
    this.noCoursesForInterests.set(false); // Reset flag when reloading
    
    console.log('🔄 Loading courses from backend API...');
    console.log('📊 BEFORE API CALL - aiRecommendedCourses length:', this.aiRecommendedCourses().length);
    
    this.apiService.getBrowseCourses({ page: 0, size: 100 }).subscribe({
      next: (response: any) => {
        console.log('✅ Backend response:', response);
        
        if (response.success && response.data) {
          const coursesData = response.data.courses || response.data.content || response.data;
          
          if (Array.isArray(coursesData) && coursesData.length > 0) {
            console.log(`✅ Loaded ${coursesData.length} courses from backend!`);
            this.courses.set(coursesData);
            this.filteredCourses.set(coursesData);
            
            // Generate recommendations after courses are loaded
            console.log('⏭️ Calling generatePersonalizedRecommendations...');
            this.generatePersonalizedRecommendations();
          } else {
            console.error('❌ Invalid courses data format or empty:', coursesData);
            this.courses.set([]);
            this.filteredCourses.set([]);
            this.aiRecommendedCourses.set([]);
            this.loadingRecommendations.set(false);
          }
        } else {
          console.error('❌ Invalid response format:', response);
          this.courses.set([]);
          this.filteredCourses.set([]);
          this.aiRecommendedCourses.set([]);
          this.loadingRecommendations.set(false);
        }
        
        this.loadingCourses = false;
        console.log('📊 AFTER API CALL - aiRecommendedCourses length:', this.aiRecommendedCourses().length);
      },
      error: (error) => {
        console.error('❌ Error loading courses from backend:', error);
        
        // Show user-friendly error message based on status
        if (error.status === 403) {
          this.snackBar.open('Access Forbidden: Unable to load courses. Please log in.', 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
          console.error('403 Forbidden - User may not have proper authentication');
        } else if (error.status === 401) {
          this.snackBar.open('Session expired. Please log in again.', 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        } else if (error.status === 0) {
          this.snackBar.open('Backend server is not responding. Please check if it\'s running.', 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        } else {
          this.snackBar.open(`Error loading courses: ${error.message || 'Unknown error'}`, 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
        
        this.courses.set([]);
        this.filteredCourses.set([]);
        this.aiRecommendedCourses.set([]);
        this.loadingCourses = false;
        this.loadingRecommendations.set(false);
      }
    });
  }

  private loadCourses() {
    this.loadingCourses = true;
    
    // FIXED: Load real courses from backend instead of mock AI service
    console.log('🔄 Loading courses from backend API...');
    this.loadRegularCourses();
    
    /* OLD CODE - Using mock AI service (commented out)
    // Use multi-role AI service for personalized recommendations
    this.multiRoleAIService.getCourseRecommendations(this.currentUser()).subscribe({
      next: (aiCourses: Course[]) => {
        console.log('AI-recommended courses for', this.currentUser().role, ':', aiCourses);
        this.courses.set(aiCourses);
        this.filteredCourses.set(aiCourses);
        this.loadingCourses = false;
        console.log('Enrolled courses:', this.getEnrolledCourses());
        console.log('Available courses:', this.getAvailableCourses());
      },
      error: (error: any) => {
        console.error('Error loading AI courses:', error);
        // Fallback to regular API
        this.loadRegularCourses();
      }
    });
    */
  }

  private loadRegularCourses() {
    // Load ALL courses from backend browse courses API
    console.log('📡 Loading all courses from backend /api/courses...');
    
    this.apiService.getBrowseCourses({ page: 0, size: 100 }).subscribe({
      next: (response: any) => {
        console.log('✅ Backend response:', response);
        
        if (response.success && response.data) {
          const coursesData = response.data.courses || response.data.content || response.data;
          
          if (Array.isArray(coursesData)) {
            console.log(`✅ Loaded ${coursesData.length} courses from backend!`);
            this.courses.set(coursesData);
            this.filteredCourses.set(coursesData);
            
            // Load AI recommendations after courses are loaded (non-blocking)
            this.loadAIRecommendations();
          } else {
            console.error('❌ Invalid courses data format:', coursesData);
            this.courses.set([]);
            this.filteredCourses.set([]);
          }
        } else {
          console.error('❌ Invalid response format:', response);
          this.courses.set([]);
          this.filteredCourses.set([]);
        }
        
        this.loadingCourses = false;
      },
      error: (error) => {
        console.error('❌ Error loading courses from backend:', error);
        this.courses.set([]);
        this.filteredCourses.set([]);
        this.loadingCourses = false;
      }
    });
  }

  // Role switching for demo purposes
  switchRole(role: string) {
    const user = this.currentUser();
    if (!user) return;
    
    const updatedUser = { ...user, role: role as UserRole };
    this.currentUser.set(updatedUser);
    this.initializeUserConfig();
    this.loadCourses(); // Reload courses with new role-specific recommendations
    
    this.snackBar.open(`Switched to ${role} mode`, 'OK', {
      duration: 2000,
      panelClass: ['info-snackbar']
    });
  }

  // Load user profile to understand interests, skills, and completed courses
  loadUserProfile() {
    const user = this.currentUser();
    if (!user || !user.id) {
      console.error('❌ No user found in loadUserProfile');
      return;
    }
    
    const userId = user.id;
    console.log('👤 Loading user profile for:', userId);
    
    this.apiService.getUserProfile(userId).subscribe({
      next: (response: any) => {
        if (response.success && response.data) {
          this.userProfile.set(response.data);
          this.userInterests.set(response.data.interests || user.profile?.interests || []);
          this.userSkills.set(response.data.skills || user.profile?.strongAreas || []);
          this.completedCourses.set(response.data.enrolledCourses?.filter((c: any) => c.progress === 100) || []);
          
          console.log('✅ User Profile loaded:', {
            interests: this.userInterests(),
            skills: this.userSkills(),
            completedCount: this.completedCourses().length
          });
        } else {
          console.warn('⚠️ Empty user profile response, using fallback...');
          // Set default from currentUser
          const interests = user.profile?.interests || [];
          const skills = user.profile?.strongAreas || [];
          
          this.userInterests.set(interests);
          this.userSkills.set(skills);
          this.completedCourses.set([]);
          
          console.log('📋 Fallback profile:', { interests, skills });
        }
      },
      error: (error: any) => {
        console.warn('⚠️ Could not load user profile from API:', error);
        // Set default from currentUser
        const interests = user.profile?.interests || [];
        const skills = user.profile?.strongAreas || [];
        
        this.userInterests.set(interests);
        this.userSkills.set(skills);
        this.completedCourses.set([]);
        
        console.log('📋 Fallback profile (error):', { interests, skills });
      }
    });
  }

  // Generate personalized recommendations directly from loaded courses
  private generatePersonalizedRecommendations() {
    console.log('🎯 ===== GENERATING RECOMMENDATIONS =====');
    console.log('📊 User Interests:', this.userInterests());
    console.log('📊 User Skills:', this.userSkills());
    
    const allCourses = this.courses();
    console.log('📚 Total Courses Available:', allCourses.length);
    console.log('📝 First 3 courses:', allCourses.slice(0, 3).map(c => c.title));
    
    if (allCourses.length === 0) {
      console.error('❌ CRITICAL: No courses available for recommendations!');
      this.loadingRecommendations.set(false);
      this.aiRecommendedCourses.set([]);
      this.noCoursesForInterests.set(false);
      return;
    }
    
    // Wrap in try-catch to ensure it never blocks course display
    try {
      // Filter courses based on user profile (interests + skills)
      console.log('🔍 Starting filterByUserProfile...');
      const filteredCourses = this.filterByUserProfile(allCourses);
      console.log('✅ Filtered courses returned:', filteredCourses.length);
      console.log('📝 Filtered course titles:', filteredCourses.map(c => c.title));
      
      if (filteredCourses.length === 0) {
        console.log('🚧 No courses match user interests - showing Coming Soon message');
        this.aiRecommendedCourses.set([]);
        this.loadingRecommendations.set(false);
        // noCoursesForInterests is already set to true in filterByUserProfile
        return;
      }
      
      // ALWAYS create recommendations from filtered courses
      const recommendations = filteredCourses.map((course, index) => ({
        ...course,
        aiSuggested: true,
        relevanceScore: 90 - (index * 5),
        reason: this.generateSmartReason(course)
      }));
      
      console.log('✅ Created', recommendations.length, 'recommendation objects');
      
      // Set recommendations IMMEDIATELY
      this.aiRecommendedCourses.set(recommendations);
      console.log(`✅ SET ${recommendations.length} recommendations to aiRecommendedCourses signal!`);
      console.log('📋 Recommended courses:', recommendations.map(c => c.title));
      console.log('🔍 Verify aiRecommendedCourses():', this.aiRecommendedCourses().length);
      
      // 📸 FETCH IMAGES FROM PIXABAY for all recommendations (async - non-blocking)
      this.fetchImagesForRecommendations(recommendations);
      
      // 💾 SAVE RECOMMENDATIONS TO DATABASE (async - non-blocking)
      this.saveRecommendationsToDatabase(recommendations);
      
      // Set loading to false AFTER setting recommendations
      this.loadingRecommendations.set(false);
      console.log('✅ Loading recommendations set to FALSE');
      console.log('🎯 ===== RECOMMENDATIONS COMPLETE =====');
    } catch (error) {
      console.error('❌ Error generating recommendations (non-blocking):', error);
      this.loadingRecommendations.set(false);
      this.aiRecommendedCourses.set([]);
      // Don't block - courses will still display
    }
  }

  /**
   * � Fetch images from Pixabay for all recommended courses
   * This adds imageUrl to each recommendation
   */
  private fetchImagesForRecommendations(recommendations: any[]) {
    console.log('📸 Fetching images from Pixabay for recommendations...');
    
    // Extract course names for batch image fetching
    const courseNames = recommendations.map(rec => rec.title);
    
    // Fetch all images in one batch request
    this.apiService.getCourseImagesBatch(courseNames).subscribe({
      next: (imagesData: any[]) => {
        console.log('✅ Received images from Pixabay:', imagesData.length);
        
        // Match images with recommendations
        imagesData.forEach((imageData: any) => {
          const recommendation = recommendations.find(
            rec => rec.title === imageData.courseName
          );
          
          if (recommendation && imageData.imageUrl) {
            recommendation.imageUrl = imageData.imageUrl;
            recommendation.thumbnail = imageData.imageUrl; // Also set thumbnail
            
            console.log(`📸 Image added for: ${recommendation.title}`);
          }
        });
        
        // Update the recommendations with images
        this.aiRecommendedCourses.set([...recommendations]);
        console.log('✅ All course images loaded!');
      },
      error: (error: any) => {
        console.error('❌ Error fetching images:', error);
        // Continue without images - not a critical failure
      }
    });
  }

  /**
   * �💾 Save AI-recommended courses to user_courses collection in database
   * This stores personalized recommendations for the user
   */
  private saveRecommendationsToDatabase(recommendations: any[]) {
    const user = this.currentUser();
    if (!user || !user.id) {
      console.warn('⚠️ No user found, cannot save recommendations');
      return;
    }

    console.log('💾 Saving recommendations to database...');
    
    // Prepare recommendations data to save
    const recommendationsToSave = recommendations.map(rec => ({
      userId: user.id,
      courseId: rec.id,
      title: rec.title,
      description: rec.description,
      category: rec.category,
      difficulty: rec.difficulty,
      aiSuggested: true,
      relevanceScore: rec.relevanceScore,
      reason: rec.reason,
      recommendedAt: new Date().toISOString(),
      interests: this.userInterests(),
      skills: this.userSkills()
    }));

    // Call API to save recommendations to user_courses collection
    this.apiService.saveUserCourseRecommendations(user.id, recommendationsToSave).subscribe({
      next: (response: any) => {
        if (response.success) {
          console.log(`✅ Saved ${recommendationsToSave.length} recommendations to database!`);
        } else {
          console.error('❌ Failed to save recommendations:', response.message);
        }
      },
      error: (error: any) => {
        console.error('❌ Error saving recommendations to database:', error);
        // Don't show error to user - this is background operation
      }
    });
  }

  // Load AI Recommendations (OLD - BACKUP)
  loadAIRecommendations() {
    this.loadingRecommendations.set(true);
    const user = this.currentUser();
    if (!user || !user.id) {
      console.error('❌ No user found in loadAIRecommendations');
      this.loadingRecommendations.set(false);
      return;
    }
    
    const userId = user.id;
    
    console.log('🤖 Loading AI recommendations for user:', userId);
    console.log('📊 User Interests:', this.userInterests());
    console.log('📊 User Skills:', this.userSkills());
    
    this.apiService.getPersonalizedRecommendations(userId).subscribe({
      next: (response: any) => {
        console.log('✅ AI Recommendations API Response:', response);
        
        if (response.success && response.data && Array.isArray(response.data)) {
          let recommendations = response.data.map((rec: any) => ({
            id: rec.id || rec.course?.id,
            title: rec.title || rec.course?.title,
            description: rec.description || rec.course?.description,
            instructor: rec.instructor || rec.course?.instructor,
            category: rec.category || rec.course?.category,
            difficulty: rec.difficulty || rec.course?.difficulty,
            duration: rec.duration || rec.course?.duration || `${rec.estimatedTime || rec.course?.estimatedTime || 0} hours`,
            estimatedTime: (rec.estimatedTime || rec.course?.estimatedTime)?.toString(),
            lessons: rec.totalLessons || rec.course?.totalLessons || 0,
            thumbnail: rec.imageUrl || rec.course?.imageUrl || 'https://via.placeholder.com/400x300/667eea/ffffff?text=AI+Recommended',
            rating: rec.rating || rec.course?.rating || 4.5,
            studentsCount: rec.studentsCount || rec.course?.studentsCount || 0,
            tags: rec.tags || rec.course?.tags || [],
            aiSuggested: true,
            relevanceScore: rec.relevanceScore || 85,
            reason: rec.reason || this.generateSmartReason(rec)
          }));
          
          // 🎯 FILTER based on user interests and skills
          recommendations = this.filterByUserProfile(recommendations);
          
          this.aiRecommendedCourses.set(recommendations);
          console.log(`✅ Loaded ${recommendations.length} personalized AI recommendations for user's interests`);
        } else {
          console.warn('⚠️ No AI recommendations found');
          // Fallback: Load courses based on user interests
          this.loadInterestBasedCourses();
        }
        this.loadingRecommendations.set(false);
      },
      error: (error: any) => {
        // Silently handle API errors - use fallback
        console.warn('⚠️ AI recommendation API unavailable, using interest-based courses');
        this.loadingRecommendations.set(false);
        // Fallback: Load courses based on user interests
        this.loadInterestBasedCourses();
      }
    });
  }

  // Filter recommendations based on user profile with SMART MATCHING
  private filterByUserProfile(courses: any[]): any[] {
    const interests = this.userInterests().map(i => i.toLowerCase());
    const skills = this.userSkills().map(s => s.toLowerCase());
    
    console.log('🔍 Filtering courses by profile:', { interests, skills, totalCourses: courses.length });
    console.log('📚 All course categories:', [...new Set(courses.map(c => c.category))]);
    
    // ALWAYS return at least 6 courses for recommendations
    if (courses.length === 0) {
      console.warn('⚠️ No courses available!');
      return [];
    }
    
    if (interests.length === 0 && skills.length === 0) {
      console.log('⚠️ No interests/skills found, returning top 6 popular courses');
      return courses.slice(0, 6); // Return first 6 if no profile data
    }
    
    // Interest keyword mapping for better matching
    const interestMap: { [key: string]: string[] } = {
      'iot': ['iot', 'internet of things', 'embedded', 'sensor', 'arduino', 'raspberry'],
      'ai': ['ai', 'artificial intelligence', 'machine learning', 'deep learning', 'neural'],
      'ml': ['machine learning', 'ai', 'data science', 'neural', 'tensorflow'],
      'web development': ['web', 'html', 'css', 'javascript', 'react', 'angular', 'frontend', 'backend'],
      'mobile': ['mobile', 'android', 'ios', 'flutter', 'react native'],
      'data science': ['data', 'analytics', 'python', 'statistics', 'visualization'],
      'cloud': ['cloud', 'aws', 'azure', 'gcp', 'devops', 'kubernetes'],
      'cybersecurity': ['security', 'cyber', 'hacking', 'encryption', 'network security'],
      'blockchain': ['blockchain', 'crypto', 'ethereum', 'smart contract', 'web3'],
      'game development': ['game', 'unity', 'unreal', '3d', 'gaming'],
      'devops': ['devops', 'ci/cd', 'docker', 'kubernetes', 'jenkins'],
      'database': ['database', 'sql', 'mongodb', 'postgresql', 'mysql'],
      'ar/vr': ['ar', 'vr', 'augmented reality', 'virtual reality', 'arkit', 'arcore', 'mixed reality', 'xr']
    };
    
    // Expand interests using keyword mapping
    const expandedInterests = interests.flatMap(interest => {
      const mapped = interestMap[interest];
      return mapped ? [...mapped, interest] : [interest];
    });
    
    console.log('✨ Expanded interests:', expandedInterests);
    
    const matchedCourses = courses.filter(course => {
      const category = course.category?.toLowerCase() || '';
      const title = course.title?.toLowerCase() || '';
      const description = course.description?.toLowerCase() || '';
      const tags = course.tags?.map((t: string) => t.toLowerCase()) || [];
      
      // Check if course matches user interests (with expanded keywords)
      const matchesInterest = expandedInterests.some(interest => 
        category.includes(interest) || 
        title.includes(interest) ||
        description.includes(interest) ||
        tags.some((tag: string) => tag.includes(interest))
      );
      
      // If user has interests, ONLY match by interests (ignore skills)
      if (interests.length > 0) {
        if (matchesInterest) {
          console.log('✅ Course matched:', course.title, '| Category:', category);
        }
        return matchesInterest;
      }
      
      // If no interests, then match by skills
      const buildsOnSkills = skills.length > 0 && skills.some(skill => 
        title.includes(skill) || 
        category.includes(skill) ||
        description.includes(skill) ||
        tags.some((tag: string) => tag.includes(skill))
      );
      
      if (buildsOnSkills) {
        console.log('✅ Course matched by skill:', course.title, '| Category:', category);
      }
      
      return buildsOnSkills;
    });
    
    console.log(`📊 Matched ${matchedCourses.length} courses out of ${courses.length}`);
    
    // Check if user has interests but NO matching courses found
    if (matchedCourses.length === 0 && interests.length > 0) {
      console.log('🚧 No courses found for user interests - showing Coming Soon message');
      this.noCoursesForInterests.set(true);
      return [];
    }
    
    // Reset the flag if we found matches
    this.noCoursesForInterests.set(false);
    
    // Return only matched courses (no padding to 6)
    console.log(`✅ Returning ${matchedCourses.length} matched courses`);
    return matchedCourses;
  }

  // Fallback: Load courses from all courses based on interests
  private loadInterestBasedCourses() {
    console.log('🔄 Loading interest-based courses as fallback...');
    
    const allCourses = this.courses();
    console.log('📚 All courses available:', allCourses.length);
    
    if (allCourses.length === 0) {
      console.log('⏳ Waiting for courses to load...');
      // Retry after courses are loaded
      setTimeout(() => this.loadInterestBasedCourses(), 1000);
      return;
    }
    
    // If user has interests, filter by them
    if (this.userInterests().length > 0) {
      const filteredCourses = this.filterByUserProfile(allCourses);
      console.log('✅ Filtered by interests:', filteredCourses.length, 'courses');
      
      if (filteredCourses.length > 0) {
        const recommendations = filteredCourses.map((course, index) => ({
          ...course,
          aiSuggested: true,
          relevanceScore: 90 - (index * 5),
          reason: this.generateSmartReason(course)
        }));
        
        this.aiRecommendedCourses.set(recommendations);
        this.loadingRecommendations.set(false);
        console.log(`✅ Loaded ${recommendations.length} interest-based recommendations`);
        return;
      }
    }
    
    // If no interests or no matches, show top courses
    console.log('📌 No interests or matches, showing popular courses...');
    const topCourses = allCourses.slice(0, 6).map((course, index) => ({
      ...course,
      aiSuggested: true,
      relevanceScore: 85 - (index * 3),
      reason: '✨ Popular course - Great for getting started with learning'
    }));
    
    this.aiRecommendedCourses.set(topCourses);
    this.loadingRecommendations.set(false);
    console.log(`✅ Loaded ${topCourses.length} popular courses as recommendations`);
  }

  // Generate smart reasons based on course content AND user profile
  private generateSmartReason(course: any): string {
    const category = course.category?.toLowerCase() || '';
    const title = course.title?.toLowerCase() || '';
    const difficulty = course.difficulty?.toLowerCase() || '';
    
    // Get user context
    const interests = this.userInterests();
    const skills = this.userSkills();
    const completed = this.completedCourses();
    const userProfile = this.userProfile();
    
    // Check completed courses for progression suggestions
    const completedTitles = completed.map((c: any) => c.title?.toLowerCase() || '');
    
    // HTML → CSS progression
    if (title.includes('css') && completedTitles.some(t => t.includes('html'))) {
      return '🌐 You studied HTML — Next try CSS to style your websites beautifully';
    }
    
    // CSS → JavaScript progression
    if (title.includes('javascript') && (
        completedTitles.some(t => t.includes('css')) || 
        completedTitles.some(t => t.includes('html'))
    )) {
      return '⚡ You know HTML & CSS — Now add interactivity with JavaScript';
    }
    
    // JavaScript → Framework progression
    if ((title.includes('react') || title.includes('angular') || title.includes('vue')) && 
        completedTitles.some(t => t.includes('javascript'))) {
      return '🚀 You mastered JavaScript — Build modern apps with frameworks like React/Angular';
    }
    
    // Python → Data Science progression
    if (title.includes('data') && completedTitles.some(t => t.includes('python'))) {
      return '📊 You know Python — Perfect time to dive into Data Science and Analytics';
    }
    
    // Interest-based recommendations with GOAL context
    if (interests.length > 0) {
      const userInterestsLower = interests.map(i => i.toLowerCase());
      const userGoal = userProfile?.goals?.toLowerCase() || '';
      
      // IoT interest and goal
      if (userInterestsLower.some(i => i.includes('iot') || i.includes('internet of things')) &&
          (category.includes('iot') || category.includes('internet of things') || title.includes('iot') || title.includes('embedded'))) {
        if (userGoal.includes('professor') || userGoal.includes('teacher')) {
          return difficulty === 'beginner'
            ? '🎓 Perfect start for your IoT Professor journey — Build strong foundations'
            : '📡 Advanced IoT concepts to master — Essential for becoming an IoT expert';
        }
        return '📡 Matches your IoT interest — Learn embedded systems and smart devices';
      }
      
      // AI/ML interest
      if (userInterestsLower.some(i => i.includes('ai') || i.includes('machine learning')) &&
          (category.includes('ai') || category.includes('machine learning') || title.includes('ai'))) {
        if (userGoal.includes('professor') || userGoal.includes('researcher')) {
          return '🤖 Essential for AI research — Deep understanding of ML algorithms';
        }
        return difficulty === 'beginner'
          ? '🤖 You\'re interested in AI — Start with Machine Learning basics'
          : '🧠 You love AI — Take your machine learning skills to the next level';
      }
      
      // Web Development interest
      if (userInterestsLower.some(i => i.includes('web')) && category.includes('web')) {
        return '💻 Matches your Web Development interest — Perfect for your learning path';
      }
      
      // Mobile Development interest
      if (userInterestsLower.some(i => i.includes('mobile')) && category.includes('mobile')) {
        return '📱 Aligns with your Mobile Development interest — Build amazing apps';
      }
      
      // Data Science interest
      if (userInterestsLower.some(i => i.includes('data')) && category.includes('data')) {
        return '📊 Aligns with your Data Science interest — Expand your analytical skills';
      }
      
      // Cloud Computing interest
      if (userInterestsLower.some(i => i.includes('cloud')) && category.includes('cloud')) {
        return '☁️ Matches your Cloud Computing interest — Master scalable infrastructure';
      }
      
      // Cybersecurity interest
      if (userInterestsLower.some(i => i.includes('security') || i.includes('cyber')) && 
          (category.includes('security') || category.includes('cyber'))) {
        return '🔒 Perfect for your Cybersecurity interest — Protect systems and networks';
      }
      
      // Blockchain interest
      if (userInterestsLower.some(i => i.includes('blockchain')) && category.includes('blockchain')) {
        return '⛓️ Blockchain expertise — Build decentralized applications';
      }
      
      // Game Development interest
      if (userInterestsLower.some(i => i.includes('game')) && category.includes('game')) {
        return '🎮 Game Development path — Create immersive gaming experiences';
      }
    }
    
    // Skill-based recommendations
    if (skills.length > 0) {
      const userSkillsLower = skills.map(s => s.toLowerCase());
      
      // Has HTML skill, recommend CSS
      if (userSkillsLower.includes('html') && title.includes('css')) {
        return '🎨 Build on your HTML skills — Learn CSS for beautiful designs';
      }
      
      // Has CSS skill, recommend JavaScript
      if (userSkillsLower.includes('css') && title.includes('javascript')) {
        return '⚡ You know CSS — Add dynamic behavior with JavaScript';
      }
      
      // Has Java skill, recommend advanced Java
      if (userSkillsLower.includes('java') && title.includes('java') && difficulty !== 'beginner') {
        return '☕ Level up your Java expertise — Advanced concepts await';
      }
    }
    
    // Category-based fallbacks
    if (category.includes('ai') || category.includes('artificial intelligence') || title.includes('ai')) {
      return difficulty === 'beginner' 
        ? '🤖 Start your AI journey — Machine Learning fundamentals'
        : '🧠 Advanced AI concepts — Take your skills to the next level';
    }
    
    if (category.includes('web') || title.includes('html') || title.includes('css')) {
      if (title.includes('html')) return '🌐 Foundation of the web — Start with HTML';
      if (title.includes('css')) return '🎨 Make websites beautiful — Learn CSS styling';
      if (title.includes('javascript')) return '⚡ Add interactivity — JavaScript essentials';
      return '💻 Perfect for web development journey';
    }
    
    if (category.includes('data') || title.includes('python') || title.includes('data')) {
      return '📊 Data-driven decision making — Build analytical skills';
    }
    
    // Default
    return '✨ Recommended based on your learning profile and goals';
  }

  // Get example reason for recommendation
  getExampleReason(course: any): string {
    const title = course.title?.toLowerCase() || '';
    
    if (title.includes('html')) return '"You studied HTML - Next try CSS"';
    if (title.includes('css')) return '"You know HTML - Learn CSS to make beautiful websites"';
    if (title.includes('javascript')) return '"You studied CSS - Now add interactivity with JavaScript"';
    if (title.includes('react') || title.includes('angular') || title.includes('vue')) return '"You know JavaScript - Build modern apps with frameworks"';
    if (title.includes('python')) return '"You\'re interested in Programming - Start with Python"';
    if (title.includes('ai') || title.includes('machine learning')) return '"You\'re interested in AI - Start Machine Learning"';
    return '"Perfect next step in your learning journey"';
  }

  applyFilters() {
    const courses = this.courses();
    let filtered = courses.filter(course => {
      const matchesSearch = !this.filters.search || 
        course.title.toLowerCase().includes(this.filters.search.toLowerCase());
      const matchesCategory = !this.filters.category || course.category === this.filters.category;
      const matchesDifficulty = !this.filters.difficulty || course.difficulty === this.filters.difficulty;
      
      return matchesSearch && matchesCategory && matchesDifficulty;
    });

    this.filteredCourses.set(filtered);
  }

  getEnrolledCourses(): Course[] {
    return this.filteredCourses().filter(course => course.isEnrolled);
  }

  getAvailableCourses(): Course[] {
    return this.filteredCourses().filter(course => !course.isEnrolled);
  }

  getEnrolledCoursesCount(): number {
    return this.courses().filter(course => course.isEnrolled).length;
  }

  getInProgressCoursesCount(): number {
    return this.courses().filter(course => course.isEnrolled && (course.progress || 0) > 0 && (course.progress || 0) < 100).length;
  }

  // Role-based course filtering
  getCoursesForRole(): Course[] {
    const courses = this.filteredCourses();
    const user = this.currentUser();
    if (!user) return courses;
    
    const userRole = user.role || 'student';
    const config = this.uiConfig();

    if (config?.features.includes('browseAll')) {
      return courses; // Show all courses
    }

    switch (userRole) {
      case 'student':
        return courses.filter(course => 
          course.instructor !== user.id
        );
      case 'instructor':
        return courses.filter(course => 
          course.instructor === user.id ||
          !course.instructor
        );
      case 'group_leader':
        return courses; // Group leaders see all courses for team management
      default:
        return courses;
    }
  }

  // Role-based course actions
  getCourseActions(course: Course): string[] {
    const user = this.currentUser();
    if (!user) return ['preview'];
    
    const userRole = user.role || 'student';
    const isEnrolled = course.isEnrolled || false;
    const isOwner = course.instructor === user.id;

    switch (userRole) {
      case 'student':
        return isEnrolled ? ['continue', 'unenroll'] : ['enroll', 'preview'];
      case 'instructor':
        return isOwner ? ['edit', 'analytics', 'manage'] : ['preview', 'duplicate'];
      case 'group_leader':
        return ['assign', 'analytics', 'preview', isEnrolled ? 'continue' : 'enroll'];
      default:
        return ['preview'];
    }
  }

  // Check if user is enrolled in a course
  isEnrolled(courseId: string): boolean {
    const course = this.courses().find(c => c.id === courseId);
    return course?.isEnrolled || false;
  }

  // Enroll/unenroll methods
  unenrollFromCourse(course: Course) {
    const currentCourses = this.courses();
    const updatedCourses = currentCourses.map(c => 
      c.id === course.id ? { ...c, isEnrolled: false, progress: 0 } : c
    );
    this.courses.set(updatedCourses);
    this.filteredCourses.set(updatedCourses);
    
    this.snackBar.open(`Unenrolled from ${course.title}`, 'OK', {
      duration: 2000,
      panelClass: ['info-snackbar']
    });
  }

  // Enhanced course action handlers
  handleCourseAction(course: Course, action: string) {
    const user = this.currentUser();
    if (!user) return;
    
    console.log(`${user.role || 'student'} performing ${action} on course:`, course.title);
    
    switch (action) {
      case 'enroll':
        this.enrollInCourse(course);
        break;
      case 'continue':
        this.continueCourse(course);
        break;
      case 'unenroll':
        this.unenrollFromCourse(course);
        break;
      case 'edit':
        this.editCourse(course);
        break;
      case 'analytics':
        this.viewAnalytics(course);
        break;
      case 'assign':
        this.assignToTeam(course);
        break;
      case 'duplicate':
        this.duplicateCourse(course);
        break;
      case 'preview':
        this.previewCourse(course);
        break;
      default:
        console.log('Unknown action:', action);
    }
  }

  private continueCourse(course: Course) {
    this.snackBar.open(`Continuing course: ${course.title}`, 'OK', {
      duration: 2000,
      panelClass: ['success-snackbar']
    });
  }

  private editCourse(course: Course) {
    const dialogRef = this.dialog.open(EditCourseDialogComponent, {
      width: '700px',
      maxWidth: '90vw',
      data: { course },
      disableClose: false,
      autoFocus: true
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result && course.id) {
        this.updateCourse(course.id, result);
      }
    });
  }

  private updateCourse(courseId: string, courseData: any): void {
    this.apiService.updateCourse(courseId, courseData).subscribe({
      next: (response: any) => {
        if (response.status === 'success' && response.data) {
          // Update the course in the local array
          const currentCourses = this.courses();
          const index = currentCourses.findIndex(c => c.id === courseId);
          if (index !== -1) {
            currentCourses[index] = { ...currentCourses[index], ...response.data };
            this.courses.set([...currentCourses]);
            this.applyFilters();
          }
          
          this.snackBar.open(`Course "${courseData.title}" updated successfully!`, 'OK', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
        }
      },
      error: (error: any) => {
        console.error('Error updating course:', error);
        this.snackBar.open('Failed to update course. Please try again.', 'OK', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  openCreateCourseDialog(): void {
    const dialogRef = this.dialog.open(EditCourseDialogComponent, {
      width: '700px',
      maxWidth: '90vw',
      data: { course: null },
      disableClose: false,
      autoFocus: true
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.createNewCourse(result);
      }
    });
  }

  private createNewCourse(courseData: any): void {
    this.creatingCourse = true;
    
    const user = this.currentUser();
    if (!user || !user.id) {
      console.error('❌ No user found in createNewCourse');
      this.creatingCourse = false;
      return;
    }
    
    const newCourse = {
      ...courseData,
      userId: user.id,
      instructor: courseData.instructor || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'Unknown',
      isEnrolled: false,
      progress: 0,
      studentsCount: courseData.studentsCount || 0,
      rating: courseData.rating || 0,
      totalLessons: courseData.totalLessons || 1,
      aiRecommendation: null
    };

    this.apiService.createCourse(newCourse).subscribe({
      next: (response: any) => {
        this.creatingCourse = false;
        if (response.status === 'success' && response.data) {
          const currentCourses = this.courses();
          this.courses.set([...currentCourses, response.data]);
          this.applyFilters();
          
          this.snackBar.open(`Course "${courseData.title}" created successfully!`, 'OK', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
        }
      },
      error: (error: any) => {
        this.creatingCourse = false;
        console.error('Error creating course:', error);
        this.snackBar.open('Failed to create course. Please try again.', 'OK', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  private viewAnalytics(course: Course) {
    this.snackBar.open(`Viewing analytics for: ${course.title}`, 'OK', {
      duration: 2000,
      panelClass: ['info-snackbar']
    });
  }

  private assignToTeam(course: Course) {
    this.snackBar.open(`Assigning ${course.title} to team members`, 'OK', {
      duration: 2000,
      panelClass: ['info-snackbar']
    });
  }

  private duplicateCourse(course: Course) {
    const duplicated = { ...course, id: Date.now().toString(), title: `${course.title} (Copy)` };
    const currentCourses = this.courses();
    this.courses.set([...currentCourses, duplicated]);
    this.filteredCourses.set(this.courses());
    
    this.snackBar.open(`Duplicated course: ${course.title}`, 'OK', {
      duration: 2000,
      panelClass: ['success-snackbar']
    });
  }

  private previewCourse(course: Course) {
    this.snackBar.open(`Previewing course: ${course.title}`, 'OK', {
      duration: 2000,
      panelClass: ['info-snackbar']
    });
  }

  getCompletedCoursesCount(): number {
    return this.courses().filter(course => course.isEnrolled && (course.progress || 0) === 100).length;
  }

  getCourseIcon(category: string): string {
    const icons: { [key: string]: string } = {
      'Programming': 'code',
      'Data Science': 'analytics',
      'Frontend Development': 'web',
      'Backend Development': 'storage',
      'Cloud Computing': 'cloud',
      'Computer Science': 'computer',
      'Web Development': 'language',
      'Mobile Development': 'phone_android'
    };
    return icons[category] || 'school';
  }

  // View course details
  viewCourseDetails(course: Course) {
    console.log('📖 Opening course details:', course.title);
    this.selectedCourseForDetail = course;
    this.showCourseDetail = true;
  }

  closeCourseDetail() {
    this.showCourseDetail = false;
    this.selectedCourseForDetail = null;
  }

  // Handle image loading errors - fallback to placeholder
  onImageError(event: any, course: any) {
    console.warn('⚠️ Failed to load image for:', course.title);
    // Set to null to show fallback gradient
    course.imageUrl = null;
    event.target.style.display = 'none';
  }

  enrollInCourse(course: Course, event?: Event) {
    // Stop event propagation if event is provided
    if (event) {
      event.stopPropagation();
    }
    
    const user = this.currentUser();
    if (!user || !user.id) {
      this.snackBar.open('❌ Please log in to enroll in courses', 'OK', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }
    
    if (!course.id) {
      this.snackBar.open('❌ Invalid course ID', 'OK', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }
    
    console.log('🎯 Enrolling user:', user.id, 'in course:', course.id, course.title);
    
    // Call the actual API to enroll
    this.apiService.enrollInCourse(course.id, user.id).subscribe({
      next: (response: any) => {
        console.log('✅ Enrollment API response:', response);
        
        if (response.success || response.status === 'success') {
          // AI-powered enrollment with personalized messaging
          const enrollmentMessage = this.getPersonalizedEnrollmentMessage(course);
          
          this.snackBar.open(
            `🎉 ${enrollmentMessage}`, 
            'View Analytics', 
            {
              duration: 5000,
              panelClass: ['success-snackbar']
            }
          );
          
          // Update local state
          course.isEnrolled = true;
          course.progress = 0;
          course.completedLessons = 0;
          course.enrolledDate = new Date();
          
          // Update the courses list
          const currentCourses = this.courses();
          const index = currentCourses.findIndex(c => c.id === course.id);
          if (index !== -1) {
            currentCourses[index] = { ...course };
            this.courses.set([...currentCourses]);
          }
          this.applyFilters();
          
          console.log('✅ Enrolled in course:', course.title);
        } else {
          this.snackBar.open('❌ ' + (response.message || 'Enrollment failed'), 'OK', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      },
      error: (error) => {
        console.error('❌ Enrollment error:', error);
        
        let errorMessage = 'Failed to enroll in course';
        
        // Handle different error types
        if (error.status === 403) {
          errorMessage = 'Access forbidden. Please log in to enroll.';
        } else if (error.status === 401) {
          errorMessage = 'Unauthorized. Please log in again.';
        } else if (error.status === 400) {
          // Bad request - might be already enrolled or validation error
          errorMessage = error?.error?.message || 'You may already be enrolled in this course.';
        } else if (error.status === 0) {
          errorMessage = 'Cannot connect to server. Please check if the backend is running.';
        } else if (error?.error?.message) {
          errorMessage = error.error.message;
        } else if (error?.message) {
          errorMessage = error.message;
        }
        
        this.snackBar.open('❌ ' + errorMessage, 'OK', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }
  
  private getPersonalizedEnrollmentMessage(course: Course): string {
    const messages = {
      'python-data-science': 'Perfect choice! Python + Java = Full-Stack Power',
      'spring-boot-microservices': 'Excellent! Building on your Java foundation',
      'react-fullstack': 'Smart move! Frontend + Backend = Complete Developer',
      'aws-cloud-java': 'Great decision! Taking Java to the cloud level',
      'algorithms-data-structures': 'Brilliant! Strengthening your core skills'
    };
    
    return messages[course.id as keyof typeof messages] || 'Welcome to your learning journey!';
  }

  createCourse() {
    if (this.courseForm.valid) {
      this.creatingCourse = true;
      const formData = this.courseForm.value;
      
      const newCourse: Partial<Course> = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        difficulty: formData.difficulty,
        duration: formData.estimatedTime || 'TBD',
        lessons: 0,
        tags: formData.tags ? formData.tags.split(',').map((tag: string) => tag.trim()) : [],
        instructor: 'You',
        price: formData.price || undefined
      };

      this.apiService.createCourse(newCourse).subscribe({
        next: (response) => {
          const currentCourses = this.courses();
          this.courses.set([...currentCourses, response.data]);
          this.applyFilters();
          this.creatingCourse = false;
          this.courseForm.reset();
          this.notificationService.showSuccess(`Course "${response.data.title}" created successfully!`, 3000);
        },
        error: (error) => {
          console.error('Error creating course:', error);
          this.creatingCourse = false;
          this.notificationService.showError('Error creating course. Please try again.', 3000);
        }
      });
    }
  }

  trackCourse(index: number, course: Course): string {
    return course.id || index.toString();
  }

  // New methods for updated UI
  onSearch() {
    this.applyFiltersNew();
  }

  onFilterChange() {
    this.applyFiltersNew();
  }

  private applyFiltersNew() {
    const courses = this.courses();
    let filtered = courses.filter(course => {
      const matchesSearch = !this.searchQuery || 
        course.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        course.instructor?.toLowerCase().includes(this.searchQuery.toLowerCase());
      
      const matchesCategory = !this.selectedCategory || course.category === this.selectedCategory;
      const matchesDifficulty = !this.selectedDifficulty || course.difficulty === this.selectedDifficulty;
      
      let matchesDuration = true;
      if (this.selectedDuration) {
        const duration = course.duration || 0;
        const durationNum = typeof duration === 'string' ? parseInt(duration) : duration;
        
        if (this.selectedDuration === '0-10') {
          matchesDuration = durationNum < 10;
        } else if (this.selectedDuration === '10-20') {
          matchesDuration = durationNum >= 10 && durationNum < 20;
        } else if (this.selectedDuration === '20-50') {
          matchesDuration = durationNum >= 20 && durationNum < 50;
        } else if (this.selectedDuration === '50+') {
          matchesDuration = durationNum >= 50;
        }
      }
      
      return matchesSearch && matchesCategory && matchesDifficulty && matchesDuration;
    });

    this.filteredCourses.set(filtered);
  }

  openCourseDetail(course: Course) {
    // Import and open the course detail dialog
    import('./course-detail-dialog/course-detail-dialog.component').then(m => {
      const dialogRef = this.dialog.open(m.CourseDetailDialogComponent, {
        width: '900px',
        maxWidth: '95vw',
        maxHeight: '90vh',
        data: { course },
        panelClass: 'course-detail-dialog'
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result?.action === 'enrolled' || result?.action === 'unenrolled') {
          // Refresh courses after enrollment/unenrollment
          this.loadCourses();
        }
      });
    });
  }
}
