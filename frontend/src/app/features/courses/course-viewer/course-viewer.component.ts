import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

interface QuizQuestion {
  questionNumber: number;
  question: string;
  options: string[];
  correctAnswer?: number;
  marks: number;
  explanation?: string;
}

interface ContentLesson {
  id?: string;
  title: string;
  type: 'VIDEO' | 'NOTE' | 'QUIZ' | 'READING';
  orderIndex: number;
  videoUrl?: string;
  videoDuration?: number;
  textContent?: string;
  pdfUrl?: string;
  pdfFileName?: string;
  quizId?: string;
  attachments?: string[];
  quizQuestions?: QuizQuestion[];
}

interface ContentModule {
  id?: string;
  title: string;
  description: string;
  orderIndex: number;
  lessons: ContentLesson[];
}

interface CourseContent {
  id?: string;
  courseId: string;
  modules: ContentModule[];
}

@Component({
  selector: 'app-course-viewer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <div class="max-w-7xl mx-auto px-4 py-8">
        
        <!-- Course Header -->
        <div class="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <button 
            (click)="goBack()"
            class="mb-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium text-gray-700 transition-colors">
            ← Back to Courses
          </button>
          <h1 class="text-4xl font-bold text-gray-900">{{ courseTitle() }}</h1>
          <p class="text-gray-600 mt-2">Complete course with videos, notes, and quizzes</p>
        </div>

        @if (isLoading()) {
          <div class="bg-white rounded-2xl shadow-xl p-12 text-center">
            <div class="inline-block animate-spin rounded-full h-16 w-16 border-4 border-gray-300 border-t-indigo-600"></div>
            <p class="mt-4 text-gray-600 text-lg">Loading course content...</p>
          </div>
        } @else if (content().modules.length === 0) {
          <div class="bg-white rounded-2xl shadow-xl p-12 text-center">
            <div class="text-6xl mb-4">📚</div>
            <h2 class="text-2xl font-bold text-gray-800 mb-2">Content Coming Soon</h2>
            <p class="text-gray-600">The instructor is preparing amazing content for you!</p>
          </div>
        } @else {
          
          <div class="grid grid-cols-1 lg:grid-cols-5 gap-6">
            
            <!-- Left Sidebar - Modules & Lesson Types -->
            <div class="lg:col-span-1">
              <div class="bg-white rounded-2xl shadow-xl p-4 sticky top-4 space-y-6">
                
                <!-- Modules Section -->
                <div>
                  <h2 class="text-lg font-bold text-gray-800 mb-3">📑 Modules</h2>
                  <div class="space-y-2">
                    @for (module of content().modules; track module.id || $index) {
                      <button
                        (click)="selectModule($index)"
                        [class.bg-indigo-600]="selectedModuleIndex() === $index"
                        [class.text-white]="selectedModuleIndex() === $index"
                        [class.bg-gray-100]="selectedModuleIndex() !== $index"
                        [class.text-gray-700]="selectedModuleIndex() !== $index"
                        class="w-full text-left px-3 py-2 rounded-lg font-medium transition-all hover:shadow-md text-sm">
                        <div class="font-bold">Module {{ $index + 1 }}</div>
                        <div class="text-xs opacity-90 truncate">{{ module.title }}</div>
                      </button>
                    }
                  </div>
                </div>

                <!-- Lesson Type Filter -->
                @if (selectedModule()) {
                  <div class="border-t pt-4">
                    <h3 class="text-sm font-bold text-gray-700 mb-2">Filter by Type</h3>
                    <div class="space-y-1">
                      <button
                        (click)="filterLessonType('ALL')"
                        [class.bg-indigo-600]="selectedLessonType() === 'ALL'"
                        [class.text-white]="selectedLessonType() === 'ALL'"
                        [class.bg-gray-100]="selectedLessonType() !== 'ALL'"
                        [class.text-gray-700]="selectedLessonType() !== 'ALL'"
                        class="w-full text-left px-3 py-2 rounded-lg font-medium transition-all text-sm flex items-center justify-between">
                        <span>📚 All</span>
                        <span class="text-xs opacity-75">({{ selectedModule()!.lessons.length }})</span>
                      </button>
                      
                      @if (getVideoLessons().length > 0) {
                        <button
                          (click)="filterLessonType('VIDEO')"
                          [class.bg-indigo-600]="selectedLessonType() === 'VIDEO'"
                          [class.text-white]="selectedLessonType() === 'VIDEO'"
                          [class.bg-gray-100]="selectedLessonType() !== 'VIDEO'"
                          [class.text-gray-700]="selectedLessonType() !== 'VIDEO'"
                          class="w-full text-left px-3 py-2 rounded-lg font-medium transition-all text-sm flex items-center justify-between">
                          <span>🎥 Videos</span>
                          <span class="text-xs opacity-75">({{ getVideoLessons().length }})</span>
                        </button>
                      }
                      
                      @if (getNoteLessons().length > 0) {
                        <button
                          (click)="filterLessonType('NOTE')"
                          [class.bg-indigo-600]="selectedLessonType() === 'NOTE'"
                          [class.text-white]="selectedLessonType() === 'NOTE'"
                          [class.bg-gray-100]="selectedLessonType() !== 'NOTE'"
                          [class.text-gray-700]="selectedLessonType() !== 'NOTE'"
                          class="w-full text-left px-3 py-2 rounded-lg font-medium transition-all text-sm flex items-center justify-between">
                          <span>📝 Notes</span>
                          <span class="text-xs opacity-75">({{ getNoteLessons().length }})</span>
                        </button>
                      }
                      
                      @if (getQuizLessons().length > 0) {
                        <button
                          (click)="filterLessonType('QUIZ')"
                          [class.bg-indigo-600]="selectedLessonType() === 'QUIZ'"
                          [class.text-white]="selectedLessonType() === 'QUIZ'"
                          [class.bg-gray-100]="selectedLessonType() !== 'QUIZ'"
                          [class.text-gray-700]="selectedLessonType() !== 'QUIZ'"
                          class="w-full text-left px-3 py-2 rounded-lg font-medium transition-all text-sm flex items-center justify-between">
                          <span>❓ Quiz</span>
                          <span class="text-xs opacity-75">({{ getQuizLessons().length }})</span>
                        </button>
                      }
                    </div>
                  </div>
                }
              </div>
            </div>

            <!-- Main Content Area -->
            <div class="lg:col-span-4 space-y-6">
              
              @if (selectedModule()) {
                <!-- Module Header -->
                <div class="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl shadow-xl p-6">
                  <h2 class="text-3xl font-bold">{{ selectedModule()!.title }}</h2>
                  <p class="text-indigo-100 mt-2">{{ selectedModule()!.description }}</p>
                  <div class="flex gap-4 mt-4 text-sm">
                    <span class="bg-white bg-opacity-20 px-3 py-1 rounded-full">
                      📚 {{ getFilteredLessons().length }} {{ selectedLessonType() === 'ALL' ? 'Lessons' : selectedLessonType() + 's' }}
                    </span>
                  </div>
                </div>

                <!-- Lessons Grid/List based on filter -->
                <div class="space-y-4">
                  @for (lesson of getFilteredLessons(); track lesson.id || $index) {
                    <div class="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                      
                      <!-- Lesson Header -->
                      <div class="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                        <div class="flex items-center justify-between">
                          <h3 class="text-xl font-bold text-gray-800 flex items-center gap-3">
                            @if (lesson.type === 'VIDEO') {
                              <span class="text-2xl">🎥</span>
                            } @else if (lesson.type === 'NOTE' || lesson.type === 'READING') {
                              <span class="text-2xl">📝</span>
                            } @else if (lesson.type === 'QUIZ') {
                              <span class="text-2xl">❓</span>
                            }
                            {{ lesson.title }}
                          </h3>
                          <span class="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-semibold">
                            {{ lesson.type }}
                          </span>
                        </div>
                      </div>

                      <!-- Lesson Content -->
                      <div class="p-6">
                        
                        <!-- Video Content -->
                        @if (lesson.type === 'VIDEO') {
                          @if (lesson.videoUrl) {
                            <div class="space-y-4">
                              <div class="relative aspect-video rounded-lg overflow-hidden bg-gray-900">
                                @if (isYouTubeUrl(lesson.videoUrl)) {
                                  <iframe
                                    [src]="getYouTubeEmbedUrl(lesson.videoUrl)"
                                    class="absolute inset-0 w-full h-full"
                                    frameborder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowfullscreen>
                                  </iframe>
                                } @else {
                                  <video 
                                    [src]="lesson.videoUrl" 
                                    controls 
                                    class="absolute inset-0 w-full h-full">
                                    Your browser does not support the video tag.
                                  </video>
                                }
                              </div>
                              @if (lesson.videoDuration) {
                                <p class="text-sm text-gray-700 font-medium">
                                  ⏱️ Duration: {{ formatDuration(lesson.videoDuration) }}
                                </p>
                              }
                            </div>
                          } @else {
                            <div class="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-8 text-center">
                              <div class="text-6xl mb-4">🎬</div>
                              <p class="text-yellow-900 font-bold text-lg mb-2">Video content will be added soon!</p>
                              <p class="text-yellow-700">The instructor is preparing video content for this lesson.</p>
                            </div>
                          }
                        }

                        <!-- Text Content (Notes/Reading) -->
                        @if (lesson.type === 'NOTE' || lesson.type === 'READING') {
                          <div class="space-y-6">
                            @if (lesson.textContent) {
                              <div class="prose prose-lg max-w-none">
                                <div class="bg-white p-10 rounded-xl shadow-md">
                                  <div class="whitespace-pre-wrap font-sans text-gray-900 text-base leading-relaxed" [innerHTML]="lesson.textContent"></div>
                                </div>
                              </div>
                            }
                            
                            <!-- PDF Viewer and Attachments -->
                            @if (lesson.attachments && lesson.attachments.length > 0) {
                              <div class="space-y-4">
                                <h4 class="text-lg font-bold text-gray-800 flex items-center gap-2">
                                  <span class="text-2xl">📎</span>
                                  Attached Documents
                                </h4>
                                @for (attachment of lesson.attachments; track $index) {
                                  <div class="border-2 border-indigo-200 rounded-xl overflow-hidden bg-white shadow-lg">
                                    <!-- PDF Header -->
                                    <div class="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 border-b-2 border-indigo-200">
                                      <div class="flex items-center justify-between">
                                        <div class="flex items-center gap-3">
                                          <span class="text-3xl">📕</span>
                                          <div>
                                            <p class="font-bold text-gray-900 text-lg">{{ getFileName(attachment) }}</p>
                                            <p class="text-sm text-gray-600">PDF Document</p>
                                          </div>
                                        </div>
                                        <a 
                                          [href]="attachment" 
                                          download
                                          class="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg font-bold transition-all shadow-md hover:shadow-lg flex items-center gap-2">
                                          <span>⬇️</span>
                                          Download PDF
                                        </a>
                                      </div>
                                    </div>
                                    
                                    <!-- PDF Viewer -->
                                    <div class="relative bg-gray-100" style="height: 800px;">
                                      <iframe
                                        [src]="attachment"
                                        class="w-full h-full border-0"
                                        type="application/pdf">
                                        <p class="p-8 text-center text-gray-600">
                                          Your browser does not support PDF viewing. 
                                          <a [href]="attachment" download class="text-indigo-600 font-bold underline">Click here to download</a> the PDF instead.
                                        </p>
                                      </iframe>
                                    </div>
                                  </div>
                                }
                              </div>
                            }
                            
                            @if (!lesson.textContent && (!lesson.attachments || lesson.attachments.length === 0)) {
                              <div class="bg-blue-50 border-2 border-blue-200 rounded-lg p-8 text-center">
                                <div class="text-6xl mb-4">📖</div>
                                <p class="text-blue-900 font-bold text-lg mb-2">{{ lesson.type === 'NOTE' ? 'Notes' : 'Reading material' }} will be added soon!</p>
                                <p class="text-blue-700">The instructor is preparing written content for this lesson.</p>
                              </div>
                            }
                          </div>
                        }

                        <!-- Quiz Content -->
                        @if (lesson.type === 'QUIZ') {
                          @if (lesson.quizId && getQuizQuestions(lesson).length > 0) {
                            <div class="bg-white rounded-xl shadow-2xl overflow-hidden border-2 border-gray-200">
                              <!-- Quiz Header -->
                              <div class="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 text-white">
                                <div class="flex items-center gap-3">
                                  <div class="text-3xl">📝</div>
                                  <div>
                                    <h3 class="text-xl font-bold">{{ lesson.title }}</h3>
                                    <p class="text-purple-100 mt-0.5 text-sm">Total Questions: {{ getQuizQuestions(lesson).length }}</p>
                                  </div>
                                </div>
                              </div>

                              <div class="flex">
                                <!-- Left Sidebar - Question Numbers -->
                                <div class="w-40 bg-gray-50 border-r-2 border-gray-200 p-3">
                                  <div class="sticky top-4">
                                    <h4 class="font-bold text-gray-700 mb-2 flex items-center gap-2 text-sm">
                                      <span class="text-purple-600">❓</span>
                                      Quiz ({{ getQuizQuestions(lesson).length }})
                                    </h4>
                                    <div class="grid grid-cols-4 gap-1">
                                      @for (q of getQuizQuestions(lesson); track q.questionNumber) {
                                        <button
                                          (click)="selectQuestion($index)"
                                          [class.bg-purple-600]="currentQuestionIndex() === $index"
                                          [class.text-white]="currentQuestionIndex() === $index"
                                          [class.bg-green-100]="currentQuestionIndex() !== $index && isQuestionAnswered($index)"
                                          [class.text-green-700]="currentQuestionIndex() !== $index && isQuestionAnswered($index)"
                                          [class.border-green-500]="currentQuestionIndex() !== $index && isQuestionAnswered($index)"
                                          [class.bg-white]="currentQuestionIndex() !== $index && !isQuestionAnswered($index)"
                                          [class.text-gray-700]="currentQuestionIndex() !== $index && !isQuestionAnswered($index)"
                                          class="w-9 h-9 rounded-lg border-2 border-gray-300 font-bold hover:shadow-md transition-all text-sm">
                                          {{ q.questionNumber }}
                                        </button>
                                      }
                                    </div>
                                    
                                    @if (!showQuizResults()) {
                                      <button
                                        (click)="submitQuiz(lesson)"
                                        class="w-full mt-4 px-3 py-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg font-bold shadow-lg hover:shadow-xl transition-all text-sm">
                                        ✓ Submit Quiz
                                      </button>
                                    }
                                  </div>
                                </div>

                                <!-- Right Side - Question Content -->
                                <div class="flex-1 p-5">
                                  @if (!showQuizResults()) {
                                    <!-- Question Display -->
                                    @if (getCurrentQuestion(lesson); as currentQ) {
                                      <div class="mb-4">
                                        <div class="flex justify-between items-start mb-3">
                                          <h3 class="text-xs font-bold text-gray-500 uppercase tracking-wide">
                                            QUESTION {{ currentQ.questionNumber }}
                                          </h3>
                                          <span class="bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full text-xs font-bold">
                                            {{ currentQ.marks }} mark{{ currentQ.marks > 1 ? 's' : '' }}
                                          </span>
                                        </div>
                                        
                                        <div class="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
                                          <p class="text-gray-900 text-base leading-relaxed whitespace-pre-wrap">{{ currentQ.question }}</p>
                                        </div>

                                        <!-- Options -->
                                        <div class="space-y-3">
                                          @for (option of currentQ.options; track $index) {
                                            <label 
                                              [class]="getOptionClasses($index, currentQ, lesson)"
                                              class="flex items-center gap-3 p-4 rounded-lg transition-all">
                                              <div class="relative flex items-center justify-center w-5 h-5">
                                                <input 
                                                  type="radio" 
                                                  [name]="'question_' + currentQ.questionNumber"
                                                  [value]="$index"
                                                  [checked]="getSelectedAnswer(currentQuestionIndex()) === $index"
                                                  (change)="selectAnswer(currentQuestionIndex(), $index)"
                                                  [disabled]="isAnswerSubmitted(currentQuestionIndex())"
                                                  class="w-5 h-5 cursor-pointer">
                                              </div>
                                              <span class="flex-1 text-base font-medium">{{ option }}</span>
                                              @if (isAnswerSubmitted(currentQuestionIndex()) && currentQ.correctAnswer === $index) {
                                                <svg class="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                                                </svg>
                                              }
                                            </label>
                                          }
                                        </div>
                                        
                                        <!-- Feedback Message -->
                                        @if (isAnswerSubmitted(currentQuestionIndex())) {
                                          <div class="mt-4 p-4 rounded-lg" 
                                               [class.bg-green-50]="isAnswerCorrect(currentQuestionIndex(), lesson)"
                                               [class.border-green-200]="isAnswerCorrect(currentQuestionIndex(), lesson)"
                                               [class.bg-red-50]="!isAnswerCorrect(currentQuestionIndex(), lesson)"
                                               [class.border-red-200]="!isAnswerCorrect(currentQuestionIndex(), lesson)"
                                               class="border-2">
                                            <p class="font-bold mb-2"
                                               [class.text-green-700]="isAnswerCorrect(currentQuestionIndex(), lesson)"
                                               [class.text-red-700]="!isAnswerCorrect(currentQuestionIndex(), lesson)">
                                              {{ isAnswerCorrect(currentQuestionIndex(), lesson) ? 'Your submitted response was correct.' : 'Your submitted response was incorrect.' }}
                                            </p>
                                            <div class="bg-white bg-opacity-50 p-3 rounded">
                                              <p class="text-sm font-semibold text-gray-700 mb-1">Explanation</p>
                                              <p class="text-sm text-gray-800">{{ getQuestionExplanation(lesson) }}</p>
                                            </div>
                                          </div>
                                        }
                                      </div>

                                      <!-- Navigation -->
                                      <div class="flex justify-between mt-8 pt-6 border-t-2 border-gray-200">
                                        <button
                                          (click)="previousQuestion()"
                                          [disabled]="currentQuestionIndex() === 0"
                                          [class.opacity-50]="currentQuestionIndex() === 0"
                                          [class.cursor-not-allowed]="currentQuestionIndex() === 0"
                                          class="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-bold transition-colors disabled:hover:bg-gray-200">
                                          ← Previous
                                        </button>
                                        <button
                                          (click)="nextQuestion(lesson)"
                                          [disabled]="currentQuestionIndex() === getQuizQuestions(lesson).length - 1"
                                          [class.opacity-50]="currentQuestionIndex() === getQuizQuestions(lesson).length - 1"
                                          [class.cursor-not-allowed]="currentQuestionIndex() === getQuizQuestions(lesson).length - 1"
                                          class="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold transition-colors disabled:hover:bg-purple-600">
                                          Next →
                                        </button>
                                      </div>
                                    }
                                  } @else {
                                    <!-- Quiz Results -->
                                    <div class="text-center py-12">
                                      <div class="text-8xl mb-6">🎉</div>
                                      <h3 class="text-3xl font-bold text-gray-900 mb-4">Quiz Completed!</h3>
                                      <div class="bg-gradient-to-r from-purple-100 to-indigo-100 rounded-xl p-8 max-w-md mx-auto">
                                        <p class="text-gray-700 text-lg mb-2">You answered</p>
                                        <p class="text-5xl font-bold text-purple-600 mb-2">{{ quizAnswers().size }}</p>
                                        <p class="text-gray-700 text-lg">out of {{ getQuizQuestions(lesson).length }} questions</p>
                                      </div>
                                      <button
                                        (click)="resetQuiz()"
                                        class="mt-8 px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg font-bold shadow-lg hover:shadow-xl transition-all">
                                        ↻ Retake Quiz
                                      </button>
                                    </div>
                                  }
                                </div>
                              </div>
                            </div>
                          } @else {
                            <div class="bg-purple-50 border-2 border-purple-200 rounded-lg p-8 text-center">
                              <div class="text-6xl mb-3">❓</div>
                              <p class="text-purple-900 font-bold text-lg mb-2">Quiz will be available soon!</p>
                              <p class="text-purple-700">The instructor is preparing quiz questions for this lesson.</p>
                            </div>
                          }
                        }

                        <!-- PDF Attachments -->
                        @if (lesson.attachments && lesson.attachments.length > 0) {
                          <div class="mt-6 border-t pt-6">
                            <h4 class="font-bold text-gray-800 mb-3 flex items-center gap-2">
                              <span class="text-xl">📎</span>
                              Downloadable Materials
                            </h4>
                            <div class="space-y-2">
                              @for (attachment of lesson.attachments; track $index) {
                                <a 
                                  [href]="attachment" 
                                  target="_blank"
                                  download
                                  class="flex items-center justify-between p-4 bg-red-50 hover:bg-red-100 border-2 border-red-200 rounded-lg transition-colors group">
                                  <span class="flex items-center gap-3">
                                    <span class="text-2xl">📕</span>
                                    <span class="font-semibold text-gray-800">{{ getFileName(attachment) }}</span>
                                  </span>
                                  <span class="text-indigo-600 group-hover:text-indigo-800 font-bold">
                                    Download PDF →
                                  </span>
                                </a>
                              }
                            </div>
                          </div>
                        }

                      </div>
                    </div>
                  }
                </div>
              }

            </div>
          </div>
        }

      </div>
    </div>
  `,
  styles: []
})
export class CourseViewerComponent implements OnInit {
  courseId = '';
  courseTitle = signal('Course Content');
  content = signal<CourseContent>({ courseId: '', modules: [] });
  isLoading = signal(true);
  selectedModuleIndex = signal(0);
  selectedModule = signal<ContentModule | null>(null);
  selectedLessonType = signal<string>('ALL');
  
  // Quiz state
  currentQuestionIndex = signal(0);
  quizAnswers = signal<Map<number, number>>(new Map());
  submittedAnswers = signal<Set<number>>(new Set());
  showQuizResults = signal(false);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    this.courseId = this.route.snapshot.paramMap.get('id') || '';
    this.loadCourseContent();
  }

  loadCourseContent() {
    this.isLoading.set(true);
    
    console.log('🔍 Loading course with ID:', this.courseId);
    
    if (!this.courseId) {
      console.error('❌ No course ID found!');
      alert('Error: No course ID found in URL');
      this.isLoading.set(false);
      return;
    }
    
    // Load course info
    this.http.get<any>(`/api/courses/${this.courseId}`)
      .subscribe({
        next: (response) => {
          console.log('✅ Course info loaded:', response);
          if (response.data) {
            this.courseTitle.set(response.data.title);
          }
        },
        error: (err) => {
          console.error('❌ Failed to load course info:', err);
          alert(`Error loading course: ${err.error?.message || err.message || 'Unknown error'}`);
        }
      });

    // Load course content from public API
    this.http.get<any>(`/api/courses/${this.courseId}/content`)
      .subscribe({
        next: (response) => {
          console.log('📚 Loaded course content:', response);
          console.log('📚 Response data:', response.data);
          if (response.data && response.data.modules) {
            console.log('📚 Modules found:', response.data.modules.length);
            response.data.modules.forEach((module: any, idx: number) => {
              console.log(`📚 Module ${idx + 1}:`, module.title, '- Lessons:', module.lessons?.length || 0);
              if (module.lessons) {
                module.lessons.forEach((lesson: any, lessonIdx: number) => {
                  console.log(`  📝 Lesson ${lessonIdx + 1}:`, lesson.title, '- Type:', lesson.type);
                });
              }
            });
            this.content.set(response.data);
            if (response.data.modules.length > 0) {
              this.selectModule(0);
            }
          } else {
            console.warn('⚠️ No modules found in response');
          }
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('❌ Failed to load content:', err);
          console.error('❌ Error details:', err.error);
          alert(`Failed to load course content: ${err.error?.message || err.message || 'Unknown error'}\n\nPlease check:\n1. Backend is running on port 8080\n2. Course content exists in database\n3. Browser console for more details`);
          this.isLoading.set(false);
        }
      });
  }

  selectModule(index: number) {
    this.selectedModuleIndex.set(index);
    this.selectedModule.set(this.content().modules[index]);
    this.selectedLessonType.set('ALL'); // Reset filter when changing modules
  }

  filterLessonType(type: string) {
    this.selectedLessonType.set(type);
  }

  getFilteredLessons(): ContentLesson[] {
    const module = this.selectedModule();
    if (!module) return [];
    
    const type = this.selectedLessonType();
    if (type === 'ALL') return module.lessons;
    
    return module.lessons.filter(lesson => lesson.type === type);
  }

  getVideoLessons(): ContentLesson[] {
    const module = this.selectedModule();
    if (!module) return [];
    return module.lessons.filter(lesson => lesson.type === 'VIDEO');
  }

  getNoteLessons(): ContentLesson[] {
    const module = this.selectedModule();
    if (!module) return [];
    return module.lessons.filter(lesson => lesson.type === 'NOTE' || lesson.type === 'READING');
  }

  getQuizLessons(): ContentLesson[] {
    const module = this.selectedModule();
    if (!module) return [];
    return module.lessons.filter(lesson => lesson.type === 'QUIZ');
  }

  // Quiz Methods
  getQuizQuestions(lesson: ContentLesson): QuizQuestion[] {
    // If quiz questions are already parsed, return them
    if (lesson.quizQuestions && lesson.quizQuestions.length > 0) {
      return lesson.quizQuestions;
    }
    
    // Parse quiz from quizId field (temporary until we have proper quiz storage)
    if (lesson.quizId) {
      // Try to parse as JSON first
      try {
        const parsed = JSON.parse(lesson.quizId);
        if (Array.isArray(parsed)) {
          lesson.quizQuestions = parsed;
          return parsed;
        }
      } catch (e) {
        // Not JSON, treat as single question
      }
      
      // Create a sample question from the text
      lesson.quizQuestions = [{
        questionNumber: 1,
        question: lesson.quizId,
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        marks: 1
      }];
      return lesson.quizQuestions;
    }
    
    return [];
  }

  // Quiz Methods
  getCurrentQuestion(lesson: ContentLesson): QuizQuestion | null {
    const questions = this.getQuizQuestions(lesson);
    return questions[this.currentQuestionIndex()] || null;
  }

  selectQuestion(index: number) {
    this.currentQuestionIndex.set(index);
  }

  selectAnswer(questionIndex: number, optionIndex: number) {
    const answers = new Map(this.quizAnswers());
    answers.set(questionIndex, optionIndex);
    this.quizAnswers.set(answers);
    
    // Mark this question as submitted
    const submitted = new Set(this.submittedAnswers());
    submitted.add(questionIndex);
    this.submittedAnswers.set(submitted);
  }
  
  isAnswerSubmitted(questionIndex: number): boolean {
    return this.submittedAnswers().has(questionIndex);
  }
  
  isAnswerCorrect(questionIndex: number, lesson: ContentLesson): boolean {
    const questions = this.getQuizQuestions(lesson);
    const question = questions[questionIndex];
    const userAnswer = this.quizAnswers().get(questionIndex);
    
    console.log('🔍 Checking answer:', {
      questionIndex,
      questionNumber: question.questionNumber,
      userAnswer,
      correctAnswer: question.correctAnswer,
      userAnswerType: typeof userAnswer,
      correctAnswerType: typeof question.correctAnswer,
      isEqual: question.correctAnswer === userAnswer,
      isEqualLoose: question.correctAnswer == userAnswer
    });
    
    // Convert both to numbers to ensure proper comparison
    const correct = question.correctAnswer !== undefined && userAnswer !== undefined 
      && Number(question.correctAnswer) === Number(userAnswer);
    
    console.log('✅ Final result:', correct);
    return correct;
  }
  
  getQuestionExplanation(lesson: ContentLesson): string {
    const questions = this.getQuizQuestions(lesson);
    const currentIndex = this.currentQuestionIndex();
    const question = questions[currentIndex];
    
    // Return custom explanation if available, otherwise generate default
    if (question.explanation && question.explanation.trim()) {
      return question.explanation;
    }
    
    return question.correctAnswer !== undefined 
      ? `The correct answer is Option ${String.fromCharCode(65 + question.correctAnswer)}.`
      : 'No explanation available.';
  }
  
  getOptionClasses(optionIndex: number, question: QuizQuestion, lesson: ContentLesson): string {
    const currentIndex = this.currentQuestionIndex();
    const isSubmitted = this.isAnswerSubmitted(currentIndex);
    const selectedAnswer = this.getSelectedAnswer(currentIndex);
    const isSelected = selectedAnswer === optionIndex;
    const isCorrect = question.correctAnswer === optionIndex;
    
    if (!isSubmitted) {
      // Before submission - normal state
      if (isSelected) {
        return 'border-2 border-purple-500 bg-purple-50 cursor-pointer';
      }
      return 'border-2 border-gray-300 bg-white cursor-pointer hover:bg-purple-50 hover:border-purple-400';
    }
    
    // After submission - show correct/incorrect
    if (isSelected && isCorrect) {
      // User selected correct answer
      return 'border-2 border-green-500 bg-green-100 text-green-900 font-semibold cursor-not-allowed';
    } else if (isSelected && !isCorrect) {
      // User selected wrong answer
      return 'border-2 border-red-500 bg-red-100 text-red-900 font-semibold cursor-not-allowed';
    } else if (isCorrect) {
      // Show correct answer even if not selected
      return 'border-2 border-green-500 bg-green-50 text-green-800 cursor-not-allowed';
    }
    
    // Other options - disabled state
    return 'border-2 border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed opacity-60';
  }

  getSelectedAnswer(questionIndex: number): number | undefined {
    return this.quizAnswers().get(questionIndex);
  }

  isQuestionAnswered(questionIndex: number): boolean {
    return this.quizAnswers().has(questionIndex);
  }

  nextQuestion(lesson: ContentLesson) {
    const questions = this.getQuizQuestions(lesson);
    if (this.currentQuestionIndex() < questions.length - 1) {
      this.currentQuestionIndex.set(this.currentQuestionIndex() + 1);
    }
  }

  previousQuestion() {
    if (this.currentQuestionIndex() > 0) {
      this.currentQuestionIndex.set(this.currentQuestionIndex() - 1);
    }
  }

  submitQuiz(lesson: ContentLesson) {
    const questions = this.getQuizQuestions(lesson);
    const answered = this.quizAnswers().size;
    
    if (answered < questions.length) {
      if (!confirm(`You have answered ${answered} out of ${questions.length} questions. Submit anyway?`)) {
        return;
      }
    }
    
    this.showQuizResults.set(true);
  }

  resetQuiz() {
    this.currentQuestionIndex.set(0);
    this.quizAnswers.set(new Map());
    this.submittedAnswers.set(new Set());
    this.showQuizResults.set(false);
  }

  goBack() {
    this.router.navigate(['/courses']);
  }

  isYouTubeUrl(url: string): boolean {
    return url.includes('youtube.com') || url.includes('youtu.be');
  }

  getYouTubeEmbedUrl(url: string): SafeResourceUrl {
    let videoId = '';
    if (url.includes('youtube.com/watch?v=')) {
      videoId = url.split('v=')[1].split('&')[0];
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1].split('?')[0];
    }
    const embedUrl = `https://www.youtube.com/embed/${videoId}`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
  }

  formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  getFileName(url: string): string {
    const parts = url.split('/');
    const fileName = parts[parts.length - 1];
    return fileName.replace(/^\d+_/, '');
  }

  startQuiz(quizId: string) {
    // Navigate to quiz page
    console.log('Starting quiz:', quizId);
    // Navigate to quiz route
    this.router.navigate(['/quiz', quizId]);
  }
}
