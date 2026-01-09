import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Angular Material Imports
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatListModule } from '@angular/material/list';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

// Services and Models
import { EnhancedCourseService } from '../../core/services/enhanced-course.service';
import { ModuleService } from '../../core/services/module.service';
import { TopicService } from '../../core/services/topic.service';
import { NoteService } from '../../core/services/note.service';
import { ProgressService } from '../../core/services/progress.service';
import { AIService } from '../../core/services/ai.service';
import {
  CourseDetailsResponse,
  Module,
  Topic,
  Note,
  UserProgress,
  AIRecommendation
} from '../../core/models/course.models';

@Component({
  selector: 'app-course-detail',
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
    MatTabsModule,
    MatExpansionModule,
    MatListModule,
    MatBadgeModule,
    MatMenuModule,
    MatSnackBarModule,
    MatDialogModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './course-detail.component.html',
  styleUrl: './course-detail.component.scss'
})
export class CourseDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  
  private courseService = inject(EnhancedCourseService);
  private moduleService = inject(ModuleService);
  private topicService = inject(TopicService);
  private noteService = inject(NoteService);
  private progressService = inject(ProgressService);
  private aiService = inject(AIService);

  // Signals for reactive state management
  courseDetails = signal<CourseDetailsResponse | null>(null);
  modules = signal<Module[]>([]);
  currentTopic = signal<Topic | null>(null);
  notes = signal<Note[]>([]);
  aiRecommendations = signal<AIRecommendation[]>([]);
  
  loading = signal(true);
  loadingTopic = signal(false);
  loadingAI = signal(false);
  
  courseId = signal<string>('');
  private userIdSignal = signal<string>('user123'); // TODO: Get from auth service
  selectedModuleIndex = signal<number>(0);
  selectedTopicIndex = signal<number>(0);

  // Helper method to get userId
  private userId(): string {
    return this.userIdSignal();
  }

  // Computed properties
  currentModule = computed(() => {
    const modules = this.modules();
    const index = this.selectedModuleIndex();
    return modules[index] || null;
  });

  overallProgress = computed(() => {
    const details = this.courseDetails();
    return details?.currentProgress?.progressPercentage || 0;
  });

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.courseId.set(id);
        this.loadCourseDetails();
      }
    });
  }

  private loadCourseDetails(): void {
    this.loading.set(true);
    console.log('🔍 Loading course with ID:', this.courseId());
    
    // Get course by ID using browse API
    this.courseService.getCourseById(this.courseId()).subscribe({
      next: (response) => {
        console.log('✅ Course loaded:', response);
        if (response.success && response.data) {
          const course = response.data;
          
          // Get course content to show modules
          this.courseService.getCourseContent(this.courseId()).subscribe({
            next: (contentResponse) => {
              console.log('✅ Course content loaded:', contentResponse);
              const modules = contentResponse.data?.modules || [];
              console.log('📚 Modules found:', modules.length);
              
              // Create course details object
              const details = {
                course: course,
                modules: modules.map((m: any, index: number) => ({
                  id: m.id || `module-${index}`,
                  title: m.title,
                  description: m.description,
                  orderIndex: m.orderIndex || index,
                  lessons: m.lessons || []
                })),
                currentProgress: {
                  progressPercentage: 0
                },
                aiRecommendations: [],
                upcomingDeadlines: [],
                recentActivity: []
              };
              
              this.courseDetails.set(details as any);
              this.modules.set(details.modules);
              this.loading.set(false);
              
              // Show info if no modules
              if (modules.length === 0) {
                setTimeout(() => {
                  this.snackBar.open('📚 Course content is being prepared. Modules will be added soon!', 'OK', { duration: 5000 });
                }, 500);
              }
            },
            error: (err) => {
              console.error('❌ Error loading course content:', err);
              // Still show course info even if modules fail
              const details = {
                course: course,
                modules: [],
                currentProgress: { progressPercentage: 0 },
                aiRecommendations: [],
                upcomingDeadlines: [],
                recentActivity: []
              };
              this.courseDetails.set(details as any);
              this.modules.set([]);
              this.loading.set(false);
            }
          });
        } else {
          console.error('❌ No course data in response');
          this.snackBar.open('Course not found.', 'Close', { duration: 5000 });
          this.loading.set(false);
        }
      },
      error: (error) => {
        console.error('Error loading course details:', error);
        this.snackBar.open('Unable to load course details. Please try again.', 'Close', { duration: 5000 });
        this.loading.set(false);
      }
    });
  }

  private loadAIRecommendations(): void {
    this.loadingAI.set(true);
    
    this.aiService.getLearningPathRecommendations(this.userId(), this.courseId()).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.aiRecommendations.set(response.data);
        }
        this.loadingAI.set(false);
      },
      error: (error) => {
        console.error('Error loading AI recommendations:', error);
        this.loadingAI.set(false);
      }
    });
  }

  onModuleSelect(moduleIndex: number): void {
    this.selectedModuleIndex.set(moduleIndex);
    this.selectedTopicIndex.set(0);
    
    const module = this.modules()[moduleIndex];
    if (!module) {
      this.snackBar.open('Module not found', 'Close', { duration: 3000 });
      return;
    }
    
    this.loadModuleTopics();
  }

  private loadModuleTopics(): void {
    const currentModule = this.currentModule();
    if (!currentModule?.id) {
      this.snackBar.open('Coming Soon! Topics will be available shortly.', 'Close', { duration: 3000 });
      return;
    }

    this.topicService.getModuleTopics(currentModule.id).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          // Store topics in the current module
          this.modules.update(modules => {
            const updatedModules = [...modules];
            const moduleIndex = this.selectedModuleIndex();
            if (updatedModules[moduleIndex]) {
              (updatedModules[moduleIndex] as any).topics = response.data;
            }
            return updatedModules;
          });
          
          // Show message if no topics
          if (!response.data || response.data.length === 0) {
            this.snackBar.open('Coming Soon! Topics will be added soon.', 'Close', { duration: 3000 });
          }
        }
      },
      error: (error) => {
        console.error('Error loading module topics:', error);
        this.snackBar.open('Coming Soon! Topics are being prepared.', 'Close', { duration: 3000 });
      }
    });
  }

  onTopicSelect(topicIndex: number): void {
    this.selectedTopicIndex.set(topicIndex);
    this.loadTopicDetails();
  }

  private loadTopicDetails(): void {
    const currentModule = this.currentModule();
    const topics = (currentModule as any)?.topics || [];
    const topic = topics[this.selectedTopicIndex()];
    
    if (!topic?.id) return;

    this.loadingTopic.set(true);
    
    this.topicService.getTopic(topic.id).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.currentTopic.set(response.data);
          this.loadTopicNotes(response.data.id!);
        }
        this.loadingTopic.set(false);
      },
      error: (error) => {
        console.error('Error loading topic details:', error);
        this.loadingTopic.set(false);
      }
    });
  }

  private loadTopicNotes(topicId: string): void {
    this.noteService.getTopicNotes(topicId, this.userId()).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.notes.set(response.data);
        }
      },
      error: (error) => {
        console.error('Error loading notes:', error);
      }
    });
  }

  startOrContinueCourse(): void {
    // Navigate to the new course viewer page
    const courseId = this.courseId();
    if (courseId) {
      this.router.navigate(['/course-viewer', courseId]);
    } else {
      this.snackBar.open('Course ID not found', 'Close', { duration: 3000 });
    }
  }

  completeTopic(): void {
    const topic = this.currentTopic();
    if (!topic?.id) return;

    this.topicService.completeTopic(topic.id, this.userId()).subscribe({
      next: (response) => {
        if (response.success) {
          this.snackBar.open('Topic completed!', 'Close', { duration: 3000 });
          this.loadCourseDetails(); // Refresh progress
          this.moveToNextTopic();
        }
      },
      error: (error) => {
        console.error('Error completing topic:', error);
        this.snackBar.open('Error completing topic', 'Close', { duration: 3000 });
      }
    });
  }

  private moveToNextTopic(): void {
    const currentModule = this.currentModule();
    const topics = (currentModule as any)?.topics || [];
    const currentTopicIndex = this.selectedTopicIndex();
    
    if (currentTopicIndex < topics.length - 1) {
      // Move to next topic in current module
      this.onTopicSelect(currentTopicIndex + 1);
    } else {
      // Move to first topic of next module
      const modules = this.modules();
      const currentModuleIndex = this.selectedModuleIndex();
      
      if (currentModuleIndex < modules.length - 1) {
        this.onModuleSelect(currentModuleIndex + 1);
      } else {
        // Course completed
        this.snackBar.open('Congratulations! Course completed!', 'Close', { duration: 5000 });
      }
    }
  }

  bookmarkTopic(): void {
    const topic = this.currentTopic();
    if (!topic?.id) {
      this.snackBar.open('Coming Soon! Bookmark feature will be available shortly.', 'Close', { duration: 3000 });
      return;
    }

    const isBookmarked = (topic as any).isBookmarked || false;
    
    this.topicService.bookmarkTopic(topic.id, this.userId(), !isBookmarked).subscribe({
      next: (response) => {
        if (response.success) {
          this.currentTopic.update(t => {
            if (t) {
              (t as any).isBookmarked = !isBookmarked;
            }
            return t;
          });
          
          const message = !isBookmarked ? 'Topic bookmarked!' : 'Bookmark removed!';
          this.snackBar.open(message, 'Close', { duration: 2000 });
        }
      },
      error: (error) => {
        console.error('Error bookmarking topic:', error);
        this.snackBar.open('Error updating bookmark', 'Close', { duration: 3000 });
      }
    });
  }

  generateQuiz(): void {
    const topic = this.currentTopic();
    if (!topic?.id) {
      this.snackBar.open('Coming Soon! Quiz feature will be available shortly.', 'Close', { duration: 3000 });
      return;
    }

    this.aiService.generateQuizFromTopic(topic.id, 5, 'MEDIUM').subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.snackBar.open('Quiz generated successfully!', 'Close', { duration: 3000 });
          // Navigate to quiz or show quiz modal
        }
      },
      error: (error) => {
        console.error('Error generating quiz:', error);
        this.snackBar.open('Error generating quiz', 'Close', { duration: 3000 });
      }
    });
  }

  openAIChat(): void {
    // Open AI chat dialog/component
    this.router.navigate(['/chat'], { 
      queryParams: { courseId: this.courseId() }
    });
  }

  openNotes(): void {
    // Open notes management dialog/component
    this.router.navigate(['/notes'], { 
      queryParams: { 
        courseId: this.courseId(),
        topicId: this.currentTopic()?.id 
      }
    });
  }

  openForum(): void {
    // Open course forum
    this.router.navigate(['/forum'], { 
      queryParams: { courseId: this.courseId() }
    });
  }

  getDifficultyColor(difficulty?: string): string {
    switch (difficulty) {
      case 'EASY': return 'success';
      case 'MEDIUM': return 'warn';
      case 'HARD': return 'accent';
      default: return 'primary';
    }
  }

  getTopicIcon(type: string): string {
    switch (type) {
      case 'LESSON': return 'school';
      case 'EXERCISE': return 'fitness_center';
      case 'QUIZ': return 'quiz';
      case 'PROJECT': return 'build';
      case 'READING': return 'menu_book';
      case 'VIDEO': return 'play_circle';
      default: return 'article';
    }
  }
}