import { Component, OnInit, signal, computed, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatSliderModule } from '@angular/material/slider';
import { MatExpansionModule } from '@angular/material/expansion';

import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { Course } from '../../../shared/models/course.interface';
import { CourseDetailDialogComponent } from '../course-detail-dialog/course-detail-dialog.component';
import { AIChatbotComponent } from '../ai-chatbot.component';

@Component({
  selector: 'app-browse-courses',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatBadgeModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatDialogModule,
    MatPaginatorModule,
    MatButtonToggleModule,
    MatSliderModule,
    MatExpansionModule
  ],
  templateUrl: './browse-courses.component.html',
  styleUrl: './browse-courses.component.scss'
})
export class BrowseCoursesComponent implements OnInit {
  // Expose Math for template
  Math = Math;
  
  // Signals for reactive state
  courses = signal<Course[]>([]);
  aiRecommendedCourses = signal<any[]>([]);
  popularCourses = signal<Course[]>([]);
  newCourses = signal<Course[]>([]);
  loading = signal(true);
  loadingRecommendations = signal(true);
  loadingMore = signal(false);
  
  // User Profile Data for AI Context
  userProfile = signal<any>(null);
  userInterests = signal<string[]>([]);
  userSkills = signal<string[]>([]);
  completedCourses = signal<any[]>([]);
  
  // Filters
  searchQuery = signal('');
  selectedCategory = signal('');
  selectedDifficulty = signal('');
  selectedDuration = signal('');
  sortBy = signal('newest');
  
  // Pagination
  pageSize = signal(50);  // Increased from 12 to show more courses per page
  currentPage = signal(0);
  
  // Infinite Scroll
  useInfiniteScroll = signal(false);
  displayedCoursesCount = signal(12);
  
  // View Mode
  viewMode = signal<'grid' | 'list'>('grid');
  
  // Get actual logged-in user ID from AuthService (no fallback - must be logged in)
  currentUserId = this.authService.currentUser()?.id || '';
  
  // Filter options
  categories = ['AI & Machine Learning', 'Web Development', 'Mobile Development', 'Data Science', 
                'Machine Learning', 'DevOps', 'Cloud Computing', 'Cybersecurity', 'Design', 'Business',
                'Programming', 'Database', 'Networking', 'Game Development', 'Blockchain'];
  difficulties = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
  durations = [
    { label: 'Short (< 10 hours)', value: 'short', min: 0, max: 10 },
    { label: 'Medium (10-30 hours)', value: 'medium', min: 10, max: 30 },
    { label: 'Long (> 30 hours)', value: 'long', min: 30, max: 999 }
  ];
  sortOptions = [
    { label: 'Newest First', value: 'newest' },
    { label: 'Most Popular', value: 'popular' },
    { label: 'AI Recommended', value: 'ai-recommended' },
    { label: 'Highest Rated', value: 'rating' },
    { label: 'A-Z', value: 'alphabetical' }
  ];
  
  // Computed filtered courses
  filteredCourses = computed(() => {
    let filtered = this.courses();
    
    // Apply search filter
    if (this.searchQuery()) {
      const query = this.searchQuery().toLowerCase();
      filtered = filtered.filter(c => 
        c.title.toLowerCase().includes(query) || 
        c.description.toLowerCase().includes(query) ||
        c.instructor.toLowerCase().includes(query) ||
        c.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    // Apply category filter
    if (this.selectedCategory()) {
      filtered = filtered.filter(c => c.category === this.selectedCategory());
    }
    
    // Apply difficulty filter
    if (this.selectedDifficulty()) {
      filtered = filtered.filter(c => c.difficulty === this.selectedDifficulty());
    }
    
    // Apply duration filter
    if (this.selectedDuration()) {
      const duration = this.durations.find(d => d.value === this.selectedDuration());
      if (duration) {
        filtered = filtered.filter(c => {
          const hours = c.estimatedTime ? parseInt(c.estimatedTime) : 0;
          return hours >= duration.min && hours <= duration.max;
        });
      }
    }
    
    // Apply sorting
    filtered = this.applySorting(filtered);
    
    return filtered;
  });
  
  // Total courses count (computed from filtered courses)
  totalCourses = computed(() => this.filteredCourses().length);
  
  // Paginated courses for display
  paginatedCourses = computed(() => {
    const filtered = this.filteredCourses();
    
    if (this.useInfiniteScroll()) {
      // Return courses up to displayedCoursesCount for infinite scroll
      return filtered.slice(0, this.displayedCoursesCount());
    } else {
      // Return paginated courses
      const start = this.currentPage() * this.pageSize();
      const end = start + this.pageSize();
      return filtered.slice(start, end);
    }
  });
  
  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    console.log('🏗️ CONSTRUCTOR called - BrowseCoursesComponent is being created!');
    console.log('🔗 ApiService in constructor:', this.apiService ? 'Available' : 'NOT AVAILABLE');
    console.log('👤 Current User ID:', this.currentUserId);
  }
  
  ngOnInit() {
    console.log('🚀 ngOnInit() called - Browse Courses Component initialized!');
    
    // Load user profile and AI recommendations first (higher priority)
    this.loadUserProfile();
    this.loadAIRecommendations();
    
    // Then load all courses
    this.loadCourses();
  }
  
  // Scroll event listener for infinite scroll
  @HostListener('window:scroll')
  onScroll() {
    if (!this.useInfiniteScroll() || this.loadingMore()) return;
    
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    // Load more when user scrolls to bottom
    if (windowHeight + scrollTop >= documentHeight - 100) {
      this.loadMoreCourses();
    }
  }
  
  // 🧪 DIRECT API TEST METHOD
  testDirectAPI() {
    console.log('🧪 TEST DIRECT API BUTTON CLICKED!');
    alert('Testing Direct API Call! Check Console & Network tabs!');
    
    fetch('http://localhost:8081/api/courses?page=1&size=100')
      .then(res => {
        console.log('✅ Fetch Response Status:', res.status);
        return res.json();
      })
      .then(data => {
        console.log('✅ Fetch Data:', data);
        alert(`SUCCESS! Got ${data?.data?.courses?.length || 0} courses!`);
      })
      .catch(err => {
        console.error('❌ Fetch Error:', err);
        alert(`ERROR: ${err.message}`);
      });
  }
  
  loadCourses() {
    console.log('🎬 loadCourses() STARTED!');
    
    this.loading.set(true);
    
    // Connect to real backend Browse Courses API
    const params = {
      page: this.currentPage(),
      size: 100, // Load all courses initially for client-side filtering
      sortBy: this.sortBy()
    };
    
    console.log('📤 Request params:', params);
    
    this.apiService.getBrowseCourses(params).subscribe({
      next: (response: any) => {
        console.log('📥 Browse Courses API Response:', response);
        console.log('✅ Response type:', typeof response);
        console.log('✅ Response.success:', response.success);
        console.log('✅ Response.data:', response.data);
        
        if (response.success && response.data) {
          // Handle paginated response from backend
          const coursesData = response.data.courses || response.data.content || response.data;
          
          console.log('📊 Courses data type:', typeof coursesData);
          console.log('📊 Is array:', Array.isArray(coursesData));
          console.log('📊 Courses data length:', coursesData?.length || 0);
          
          if (Array.isArray(coursesData) && coursesData.length > 0) {
            console.log('📊 First course:', coursesData[0]);
          
            const formattedCourses = coursesData.map((course: any) => ({
              id: course.id,
              title: course.title,
              description: course.description,
              instructor: course.instructor,
              category: course.category,
              difficulty: course.difficulty,
              duration: course.duration || `${course.estimatedTime || 0} hours`,
              estimatedTime: course.estimatedTime?.toString() || course.duration,
              lessons: course.totalLessons || 0,
              thumbnail: course.imageUrl || 'https://via.placeholder.com/400x300/667eea/ffffff?text=' + encodeURIComponent(course.title.substring(0, 20)),
              rating: course.rating || 4.5,
              studentsCount: course.studentsCount || 0,
              tags: course.tags || [],
              createdAt: new Date(course.createdAt || Date.now()),
              isEnrolled: false,
              isTrending: course.isTrending || false,
              isFeatured: course.isFeatured || false,
              popularityScore: course.popularityScore || 0
            }));
            
            this.courses.set(formattedCourses);
            
            console.log('🔍 AFTER SET - this.courses().length:', this.courses().length);
            console.log('🔍 AFTER SET - filteredCourses().length:', this.filteredCourses().length);
            console.log('🔍 AFTER SET - paginatedCourses().length:', this.paginatedCourses().length);
            
            // Set popular courses (top rated)
            const sortedByPopularity = [...formattedCourses].sort((a, b) => 
              (b.popularityScore || 0) - (a.popularityScore || 0)
            );
            this.popularCourses.set(sortedByPopularity.slice(0, 6));
            
            // Set new courses (recently created)
            const sortedByDate = [...formattedCourses].sort((a, b) => 
              new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
            );
            this.newCourses.set(sortedByDate.slice(0, 6));
            
            console.log(`✅ Successfully loaded ${formattedCourses.length} courses from backend!`);
            console.log('📋 Course titles:', formattedCourses.map((course: any) => course.title).slice(0, 5));
          } else {
            console.warn('⚠️ coursesData is not an array or is empty');
            console.warn('coursesData:', coursesData);
            this.courses.set([]);
          }
        } else {
          console.warn('⚠️ No courses found in response');
          console.warn('Response structure:', JSON.stringify(response, null, 2));
          this.courses.set([]);
        }
        this.loading.set(false);
      },
      error: (error: any) => {
        console.error('❌ Error loading browse courses:', error);
        console.error('❌ Error status:', error.status);
        console.error('❌ Error message:', error.message);
        console.error('❌ Full error:', JSON.stringify(error, null, 2));
        this.loading.set(false);
        this.snackBar.open('Failed to load courses from backend', 'OK', { duration: 3000 });
        
        // Fallback to old API
        console.log('🔄 Trying fallback API...');
        this.loadCoursesFromOldAPI();
      }
    });
  }
  
  // Fallback method using old API
  private loadCoursesFromOldAPI() {
    this.apiService.getCourses().subscribe({
      next: (response: any) => {
        if (response.data) {
          const coursesData = response.data.map((course: any) => ({
            ...course,
            createdAt: new Date(course.createdAt || Date.now()),
            studentsCount: course.studentsEnrolled || Math.floor(Math.random() * 1000) + 50,
            rating: course.rating || (Math.random() * 2 + 3).toFixed(1)
          }));
          this.courses.set(coursesData);
          
          // Set popular courses (top rated)
          const sortedByPopularity = [...coursesData].sort((a, b) => 
            (b.studentsCount || 0) - (a.studentsCount || 0)
          );
          this.popularCourses.set(sortedByPopularity.slice(0, 6));
          
          // Set new courses (recently created)
          const sortedByDate = [...coursesData].sort((a, b) => 
            new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
          );
          this.newCourses.set(sortedByDate.slice(0, 6));
        }
        this.loading.set(false);
      },
      error: (error: any) => {
        console.error('Error loading courses:', error);
        this.loading.set(false);
        this.snackBar.open('Failed to load courses', 'OK', { duration: 3000 });
      }
    });
  }
  
  // Load user profile to understand interests, skills, and completed courses
  loadUserProfile() {
    console.log('👤 Loading user profile for:', this.currentUserId);
    
    this.apiService.getUserProfile(this.currentUserId).subscribe({
      next: (response: any) => {
        if (response.success && response.data) {
          this.userProfile.set(response.data);
          this.userInterests.set(response.data.interests || []);
          this.userSkills.set(response.data.skills || []);
          this.completedCourses.set(response.data.enrolledCourses?.filter((c: any) => c.progress === 100) || []);
          
          console.log('✅ User Profile loaded:', {
            interests: this.userInterests(),
            skills: this.userSkills(),
            completedCount: this.completedCourses().length
          });
        }
      },
      error: (error: any) => {
        console.warn('⚠️ Could not load user profile:', error);
        // Set default interests if profile fails
        this.userInterests.set(['Web Development', 'Programming']);
        this.userSkills.set(['HTML', 'CSS']);
      }
    });
  }
  
  loadAIRecommendations() {
    this.loadingRecommendations.set(true);
    
    console.log('🤖 Loading AI recommendations for user:', this.currentUserId);
    
    // Call real backend AI recommendation API
    this.apiService.getPersonalizedRecommendations(this.currentUserId).subscribe({
      next: (response: any) => {
        console.log('✅ AI Recommendations API Response:', response);
        
        // Backend returns recommendations directly in data field as an array
        if (response.success && response.data && Array.isArray(response.data)) {
          const recommendations = response.data.map((rec: any) => ({
            // Handle both nested course object and flat structure
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
          
          this.aiRecommendedCourses.set(recommendations);
          console.log(`✅ Loaded ${recommendations.length} AI recommendations:`, recommendations);
        } else if (response.success && response.data && response.data.recommendations) {
          // Fallback: handle nested structure if it exists
          const recommendations = response.data.recommendations.map((rec: any) => ({
            id: rec.course?.id || rec.id,
            title: rec.course?.title || rec.title,
            description: rec.course?.description || rec.description,
            instructor: rec.course?.instructor || rec.instructor,
            category: rec.course?.category || rec.category,
            difficulty: rec.course?.difficulty || rec.difficulty,
            duration: rec.course?.duration || rec.duration || `${rec.course?.estimatedTime || rec.estimatedTime || 0} hours`,
            estimatedTime: (rec.course?.estimatedTime || rec.estimatedTime)?.toString(),
            lessons: rec.course?.totalLessons || rec.totalLessons || 0,
            thumbnail: rec.course?.imageUrl || rec.imageUrl || 'https://via.placeholder.com/400x300/667eea/ffffff?text=AI+Recommended',
            rating: rec.course?.rating || rec.rating || 4.5,
            studentsCount: rec.course?.studentsCount || rec.studentsCount || 0,
            tags: rec.course?.tags || rec.tags || [],
            aiSuggested: true,
            relevanceScore: rec.relevanceScore || 85,
            reason: rec.reason || this.generateSmartReason(rec.course || rec)
          }));
          
          this.aiRecommendedCourses.set(recommendations);
          console.log(`✅ Loaded ${recommendations.length} AI recommendations (nested):`, recommendations);
        } else {
          console.warn('⚠️ No AI recommendations found, loading smart fallback');
          this.loadSmartFallbackRecommendations();
        }
        this.loadingRecommendations.set(false);
      },
      error: (error: any) => {
        // Silently handle API errors - use fallback recommendations
        console.warn('⚠️ AI recommendation API unavailable, using smart fallback');
        this.loadingRecommendations.set(false);
        this.loadSmartFallbackRecommendations();
      }
    });
  }
  
  // Generate smart reasons based on course content
  private generateSmartReason(course: any): string {
    const category = course.category?.toLowerCase() || '';
    const title = course.title?.toLowerCase() || '';
    const difficulty = course.difficulty?.toLowerCase() || '';
    
    // AI/ML courses
    if (category.includes('ai') || category.includes('artificial intelligence') || title.includes('ai')) {
      if (difficulty === 'beginner') {
        return '🤖 You are interested in AI - Start with Machine Learning basics';
      } else {
        return '🧠 Ready for advanced AI? Take your machine learning skills to the next level';
      }
    }
    
    // Web Development courses
    if (category.includes('web') || title.includes('html') || title.includes('css')) {
      if (title.includes('html')) {
        return '🌐 You studied HTML - Next try CSS for styling';
      } else if (title.includes('css')) {
        return '🎨 You know HTML - Learn CSS to make beautiful websites';
      } else if (title.includes('javascript')) {
        return '⚡ You know HTML & CSS - Add interactivity with JavaScript';
      } else if (title.includes('react') || title.includes('angular')) {
        return '🚀 You know basics - Build modern apps with frameworks';
      } else {
        return '💻 Perfect next step in your web development journey';
      }
    }
    
    // Data Science courses
    if (category.includes('data') || title.includes('python') || title.includes('data')) {
      return '📊 Build on your Python skills with Data Science and Analytics';
    }
    
    // Mobile Development
    if (category.includes('mobile') || title.includes('android') || title.includes('ios')) {
      return '📱 Great for expanding into mobile app development';
    }
    
    // Database courses
    if (category.includes('database') || title.includes('sql') || title.includes('mongodb')) {
      return '💾 Essential database skills for backend development';
    }
    
    // Cloud & DevOps
    if (category.includes('cloud') || category.includes('devops')) {
      return '☁️ Master cloud technologies for modern deployment';
    }
    
    // Based on difficulty level
    if (difficulty === 'beginner') {
      return '🎯 Perfect starting point for beginners';
    } else if (difficulty === 'intermediate') {
      return '📈 Great next step to advance your skills';
    } else if (difficulty === 'advanced' || difficulty === 'expert') {
      return '🏆 Challenge yourself with advanced concepts';
    }
    
    return '✨ Recommended based on your learning profile and goals';
  }
  
  // Smart fallback recommendations when AI service is unavailable
  private loadSmartFallbackRecommendations() {
    console.log('📊 Generating smart fallback recommendations...');
    
    // Generate intelligent fallback recommendations based on course content
    const fallbackRecommendations = this.courses().slice(0, 6).map((course, index) => {
      return {
        ...course,
        aiSuggested: true,
        relevanceScore: 90 - (index * 5), // Decreasing scores for variety
        reason: this.generateSmartReason(course)
      };
    });
    
    this.aiRecommendedCourses.set(fallbackRecommendations);
    console.log('✅ Loaded smart fallback recommendations:', fallbackRecommendations);
  }
  
  loadMoreCourses() {
    if (this.displayedCoursesCount() >= this.filteredCourses().length) {
      return; // All courses already loaded
    }
    
    this.loadingMore.set(true);
    
    // Simulate loading delay
    setTimeout(() => {
      this.displayedCoursesCount.set(this.displayedCoursesCount() + 12);
      this.loadingMore.set(false);
    }, 500);
  }
  
  applySorting(courses: Course[]): Course[] {
    const sorted = [...courses];
    
    switch (this.sortBy()) {
      case 'newest':
        return sorted.sort((a, b) => 
          new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
        );
      case 'popular':
        return sorted.sort((a, b) => 
          (b.studentsCount || 0) - (a.studentsCount || 0)
        );
      case 'rating':
        return sorted.sort((a, b) => 
          (parseFloat(b.rating?.toString() || '0')) - (parseFloat(a.rating?.toString() || '0'))
        );
      case 'alphabetical':
        return sorted.sort((a, b) => 
          a.title.localeCompare(b.title)
        );
      case 'ai-recommended':
        // Prioritize AI recommended courses
        return sorted.sort((a, b) => {
          if (a.aiRecommended && !b.aiRecommended) return -1;
          if (!a.aiRecommended && b.aiRecommended) return 1;
          return 0;
        });
      default:
        return sorted;
    }
  }
  
  clearFilters() {
    this.searchQuery.set('');
    this.selectedCategory.set('');
    this.selectedDifficulty.set('');
    this.selectedDuration.set('');
    this.sortBy.set('newest');
    this.currentPage.set(0);
    this.displayedCoursesCount.set(12);
  }
  
  onPageChange(event: PageEvent) {
    this.currentPage.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  
  toggleScrollMode() {
    this.useInfiniteScroll.set(!this.useInfiniteScroll());
    this.currentPage.set(0);
    this.displayedCoursesCount.set(12);
  }
  
  viewCourseDetails(course: Course) {
    const dialogRef = this.dialog.open(CourseDetailDialogComponent, {
      width: '900px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      data: { course, userId: this.currentUserId },
      panelClass: 'course-detail-dialog'
    });
    
    dialogRef.afterClosed().subscribe(result => {
      if (result?.action === 'enrolled' || result?.action === 'unenrolled') {
        this.loadCourses(); // Refresh courses
      }
    });
  }
  
  enrollInCourse(course: Course, event: Event) {
    event.stopPropagation();
    
    console.log('🎯 Enroll button clicked!', {
      courseId: course.id,
      courseTitle: course.title,
      userId: this.currentUserId,
      course: course
    });
    
    if (!course.id) {
      console.error('❌ Course ID is missing!', course);
      this.snackBar.open('Error: Course ID is missing', 'OK', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }
    
    if (!this.currentUserId) {
      console.error('❌ User ID is missing!');
      this.snackBar.open('Please log in to enroll in courses', 'OK', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }
    
    console.log('📡 Sending enrollment request to API...');
    
    this.apiService.enrollInCourse(course.id, this.currentUserId).subscribe({
      next: (response: any) => {
        console.log('✅ Enrollment successful!', response);
        this.snackBar.open(`Successfully enrolled! Starting course...`, 'OK', {
          duration: 2000,
          panelClass: ['success-snackbar']
        });
        
        // Navigate to course page after enrollment
        setTimeout(() => {
          this.router.navigate(['/course', course.id]);
        }, 500);
      },
      error: (error: any) => {
        console.error('❌ Enrollment error:', error);
        this.snackBar.open(error.error?.message || 'Failed to enroll in course', 'OK', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }
  
  openAIChatbot(selectedCourse?: Course) {
    const dialogRef = this.dialog.open(AIChatbotComponent, {
      width: '90vw',
      maxWidth: '1000px',
      height: '85vh',
      maxHeight: '85vh',
      panelClass: 'ai-chatbot-dialog',
      data: { 
        context: 'browse-courses',
        selectedCourse: selectedCourse, // Pass selected course if provided
        pageContext: {
          page: 'browse-courses',
          visibleCourses: this.filteredCourses().slice(0, 10), // Pass first 10 visible courses
          appliedFilters: {
            category: this.selectedCategory(),
            level: this.selectedDifficulty(),
            search: this.searchQuery()
          },
          userInterests: this.userInterests()
        }
      }
    });
  }
  
  openAIChatbotWithCourse(course: Course, event: Event) {
    event.stopPropagation(); // Prevent card click
    this.openAIChatbot(course);
  }
  
  getCourseIcon(category: string): string {
    const icons: { [key: string]: string } = {
      'Programming': 'code',
      'Web Development': 'web',
      'Mobile Development': 'phone_android',
      'Data Science': 'analytics',
      'Machine Learning': 'psychology',
      'AI & Machine Learning': 'psychology',
      'DevOps': 'settings',
      'Cloud Computing': 'cloud',
      'Cybersecurity': 'security',
      'Design': 'palette',
      'Business': 'business',
      'Database': 'storage',
      'Networking': 'lan',
      'Game Development': 'sports_esports',
      'Blockchain': 'link'
    };
    return icons[category] || 'school';
  }
  
  getDifficultyColor(difficulty: string): string {
    const colors: { [key: string]: string } = {
      'Beginner': 'success',
      'Intermediate': 'primary',
      'Advanced': 'warn',
      'Expert': 'accent'
    };
    return colors[difficulty] || 'primary';
  }
  
  getDifficultyIcon(difficulty: string): string {
    const icons: { [key: string]: string } = {
      'Beginner': 'eco',
      'Intermediate': 'trending_up',
      'Advanced': 'military_tech',
      'Expert': 'workspace_premium'
    };
    return icons[difficulty] || 'signal_cellular_alt';
  }
  
  /**
   * Get beautiful gradient background for course category
   */
  getCategoryGradient(category: string): string {
    const gradients: { [key: string]: string } = {
      'Programming': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'Web Development': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'Mobile Development': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'Data Science': 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'Machine Learning': 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      'AI': 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
      'Artificial Intelligence': 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      'DevOps': 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
      'Cloud Computing': 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
      'Cybersecurity': 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)',
      'Design': 'linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)',
      'Business': 'linear-gradient(135deg, #fdcbf1 0%, #e6dee9 100%)',
      'Database': 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)',
      'Networking': 'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)',
      'Game Development': 'linear-gradient(135deg, #f77062 0%, #fe5196 100%)',
      'Blockchain': 'linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)',
      'Technology': 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)'
    };
    
    return gradients[category] || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
  }
  
  /**
   * Get example reason for recommendation
   */
  getExampleReason(course: any): string {
    const category = course.category?.toLowerCase() || '';
    const title = course.title?.toLowerCase() || '';
    
    if (title.includes('html')) {
      return '"You studied HTML - Next try CSS"';
    } else if (title.includes('css')) {
      return '"You know HTML - Learn CSS to make beautiful websites"';
    } else if (title.includes('javascript')) {
      return '"You studied CSS - Now add interactivity with JavaScript"';
    } else if (title.includes('react') || title.includes('angular') || title.includes('vue')) {
      return '"You know JavaScript - Build modern apps with frameworks"';
    } else if (title.includes('python')) {
      return '"You\'re interested in Programming - Start with Python"';
    } else if (category.includes('ai') || category.includes('machine learning')) {
      return '"You\'re interested in AI - Start Machine Learning"';
    } else if (category.includes('data')) {
      return '"You know Python - Next level: Data Science"';
    } else {
      return '"Perfect next step in your learning journey"';
    }
  }
  
  /**
   * Get emoji icon for course category
   */
  getCategoryEmoji(category: string): string {
    const emojis: { [key: string]: string } = {
      'Programming': '💻',
      'Web Development': '🌐',
      'Mobile Development': '📱',
      'Data Science': '📊',
      'Machine Learning': '🤖',
      'AI': '🧠',
      'Artificial Intelligence': '🧠',
      'DevOps': '⚙️',
      'Cloud Computing': '☁️',
      'Cybersecurity': '🔒',
      'Design': '🎨',
      'Business': '💼',
      'Database': '🗄️',
      'Networking': '🌐',
      'Game Development': '🎮',
      'Blockchain': '⛓️',
      'Technology': '🔧',
      'Marketing': '📢',
      'Finance': '💰',
      'Healthcare': '🏥',
      'Education': '🎓'
    };
    
    return emojis[category] || '📚';
  }
  
  /**
   * Get course image URL - generates beautiful images based on category
   * Using multiple sources with fallbacks
   * IMPORTANT: Always use course TITLE for seed to ensure same image across all pages
   */
  getCourseImage(course: any): string {
    const width = 400;
    const height = 300;
    
    // Option 1: Use course's own imageUrl if available
    if (course.imageUrl) return course.imageUrl;
    if (course.thumbnail) return course.thumbnail;
    
    // Option 2: Use Lorem Picsum with seed for consistent images
    // ONLY use title for seed - ensures same course = same image on all pages
    const seed = this.hashCode(course.title || 'default');
    
    // Try Lorem Picsum first (most reliable)
    return `https://picsum.photos/seed/${seed}/${width}/${height}`;
    
    // If that fails, error handler will show gradient fallback
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
  handleImageError(event: any, course: any): void {
    console.log('Image failed to load for:', course.title, '- Using gradient fallback');
    
    // Category-based gradient colors
    const gradients: { [key: string]: string } = {
      'Programming': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'Web Development': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'Mobile Development': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'Data Science': 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'Machine Learning': 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      'AI': 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
      'Artificial Intelligence': 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      'DevOps': 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
      'Cloud Computing': 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
      'Cybersecurity': 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)',
      'Design': 'linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)',
      'Business': 'linear-gradient(135deg, #fdcbf1 0%, #e6dee9 100%)',
      'Database': 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)',
      'Networking': 'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)',
      'Game Development': 'linear-gradient(135deg, #f77062 0%, #fe5196 100%)',
      'Blockchain': 'linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)',
      'Technology': 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)'
    };
    
    const gradient = gradients[course.category] || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    
    // Hide broken image
    event.target.style.display = 'none';
    
    // Style the parent container
    const parent = event.target.parentElement;
    parent.style.background = gradient;
    parent.style.display = 'flex';
    parent.style.alignItems = 'center';
    parent.style.justifyContent = 'center';
    
    // Add icon if not exists (check to avoid duplicates)
    if (!parent.querySelector('.fallback-icon')) {
      const iconContainer = document.createElement('div');
      iconContainer.className = 'fallback-icon flex flex-col items-center justify-center';
      
      const icon = document.createElement('mat-icon');
      icon.className = 'text-8xl text-white opacity-90';
      icon.textContent = this.getCourseIcon(course.category);
      
      const text = document.createElement('div');
      text.className = 'text-white text-sm mt-2 font-semibold opacity-75';
      text.textContent = course.category;
      
      iconContainer.appendChild(icon);
      iconContainer.appendChild(text);
      parent.appendChild(iconContainer);
    }
  }

  /**
   * Navigate to course content viewer if enrolled
   */
  viewCourseContent(course: Course, event: Event) {
    event.stopPropagation();
    
    if (!this.currentUserId) {
      this.snackBar.open('Please log in to view course content', 'OK', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    if (!course.id) {
      this.snackBar.open('Course ID is missing', 'OK', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    // Check if user is enrolled
    this.apiService.checkEnrollmentStatus(course.id, this.currentUserId).subscribe({
      next: (response: any) => {
        if (response.data?.isEnrolled) {
          // Navigate to course viewer
          this.router.navigate(['/course-viewer', course.id]);
        } else {
          this.snackBar.open('Please enroll in this course first', 'OK', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      },
      error: (error: any) => {
        console.error('Error checking enrollment:', error);
        this.snackBar.open('Failed to check enrollment status', 'OK', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }
}
