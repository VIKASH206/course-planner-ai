import { Component, OnInit, signal, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

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
  videoThumbnail?: string;
  videoDuration?: number;
  textContent?: string;
  pdfUrl?: string;
  pdfFileName?: string;
  quizId?: string;
  attachments?: string[];
  externalLinks?: Array<{title: string; url: string; description?: string}>;
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
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
}

@Component({
  selector: 'app-course-content-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[9999] p-0 backdrop-blur-sm" (click)="closeModal($event)" style="margin: 0; left: 0 !important;">
      <div class="bg-white rounded-none md:rounded-2xl shadow-2xl w-full h-full md:max-w-[98vw] md:max-h-[98vh] flex flex-col overflow-hidden" (click)="$event.stopPropagation()">
        <!-- Header -->
        <div class="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 text-white flex-shrink-0">
          <div class="flex justify-between items-center">
            <div>
              <h2 class="text-2xl font-bold">📚 Course Content Manager</h2>
              <p class="text-indigo-100 mt-1 text-sm">{{ courseTitle }}</p>
            </div>
            <button (click)="close()" class="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all">
              <span class="text-2xl">✕</span>
            </button>
          </div>
        </div>

        <!-- Content Area -->
        <div class="p-6 overflow-y-auto flex-1 bg-gray-50">
          
          <!-- Add Module Button -->
          <div class="mb-6 flex justify-between items-center">
            <button 
              (click)="addModule()"
              class="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center space-x-2">
              <span class="text-xl">➕</span>
              <span>Add New Module</span>
            </button>
            <div class="text-sm text-gray-600 font-medium">
              Total Modules: <span class="text-indigo-600 font-bold">{{ content().modules.length }}</span>
            </div>
          </div>

          <!-- Modules List -->
          @if (content().modules.length === 0) {
            <div class="text-center py-16 bg-white rounded-2xl shadow-lg border-2 border-dashed border-gray-300">
              <div class="text-8xl mb-6">📦</div>
              <p class="text-gray-600 text-xl font-medium">No modules yet. Add your first module to start building course content!</p>
              <p class="text-gray-500 text-sm mt-2">Click the "Add New Module" button above to get started</p>
            </div>
          } @else {
            <div class="space-y-6">
              @for (module of content().modules; track module.id || $index) {
                <div class="border-2 border-indigo-200 rounded-2xl overflow-hidden bg-white shadow-xl hover:shadow-2xl transition-shadow">
                  <!-- Module Header -->
                  <div class="bg-gradient-to-r from-indigo-100 to-purple-100 p-5 border-b-2 border-indigo-200">
                    <div class="flex justify-between items-start gap-4">
                      <div class="flex-1 space-y-3">
                        <div>
                          <label class="block text-xs font-bold text-indigo-900 mb-1.5 uppercase tracking-wide">Module {{ $index + 1 }} Title</label>
                          <input 
                            type="text" 
                            [(ngModel)]="module.title" 
                            placeholder="e.g., Introduction to JavaScript Basics"
                            class="w-full px-4 py-3 border-2 border-indigo-200 rounded-lg font-bold text-lg text-gray-900 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                        </div>
                        <div>
                          <label class="block text-xs font-bold text-indigo-900 mb-1.5 uppercase tracking-wide">Description</label>
                          <textarea 
                            [(ngModel)]="module.description" 
                            placeholder="Brief description of what students will learn in this module..."
                            rows="2"
                            class="w-full px-4 py-2.5 border-2 border-indigo-200 rounded-lg text-gray-700 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"></textarea>
                        </div>
                      </div>
                      <div class="flex flex-col gap-2">
                        <button 
                          (click)="addLesson(module)"
                          class="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-bold shadow-md hover:shadow-lg transition-all transform hover:scale-105 whitespace-nowrap">
                          ➕ Add Lesson
                        </button>
                        <button 
                          (click)="deleteModule($index)"
                          class="px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-lg font-bold shadow-md hover:shadow-lg transition-all transform hover:scale-105">
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  </div>

                  <!-- Lessons -->
                  <div class="p-4 space-y-3">
                    @if (module.lessons.length === 0) {
                      <p class="text-center text-gray-500 py-6 italic">No lessons yet. Click "Add Lesson" to create your first lesson.</p>
                    } @else {
                      @for (lesson of module.lessons; track lesson.id || $index) {
                        <div class="border-2 border-gray-200 rounded-xl p-5 bg-white hover:shadow-lg hover:border-indigo-300 transition-all">
                          <div class="space-y-3">
                            <!-- Lesson Type and Title Row -->
                            <div class="flex gap-2 items-start">
                              <select 
                                [(ngModel)]="lesson.type"
                                class="px-4 py-2.5 border-2 border-gray-300 rounded-lg text-sm font-semibold bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 min-w-[180px] appearance-none cursor-pointer hover:border-indigo-400 transition-colors"
                                style="background-image: url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'currentColor\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e'); background-repeat: no-repeat; background-position: right 0.5rem center; background-size: 1.5em 1.5em; padding-right: 2.5rem;">
                                <option value="VIDEO">🎥 Video</option>
                                <option value="NOTE">📝 Notes/Reading</option>
                                <option value="QUIZ">❓ Quiz</option>
                                <option value="READING">📖 Reading Material</option>
                              </select>
                              
                              <input 
                                type="text" 
                                [(ngModel)]="lesson.title" 
                                placeholder="Lesson Title"
                                class="flex-1 px-4 py-2.5 border-2 border-gray-300 rounded-lg font-medium text-gray-900 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                                
                              <button 
                                (click)="deleteLesson(module, $index)"
                                class="px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all">
                                🗑️
                              </button>
                            </div>

                            <!-- Conditional Fields Based on Type -->
                            @if (lesson.type === 'VIDEO') {
                              <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                                <div>
                                  <label class="block text-xs font-semibold text-gray-700 mb-1.5">Video URL</label>
                                  <input 
                                    type="url" 
                                    [(ngModel)]="lesson.videoUrl" 
                                    placeholder="https://youtube.com/watch?v=..."
                                    class="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg text-sm bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                                </div>
                                <div>
                                  <label class="block text-xs font-semibold text-gray-700 mb-1.5">Duration (seconds)</label>
                                  <input 
                                    type="number" 
                                    [(ngModel)]="lesson.videoDuration" 
                                    placeholder="600"
                                    class="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg text-sm bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                                </div>
                              </div>
                            }
                            
                            @if (lesson.type === 'NOTE' || lesson.type === 'READING') {
                              <div class="mt-3 space-y-3">
                                <div>
                                  <label class="block text-xs font-semibold text-gray-700 mb-1.5">Content (Markdown Supported)</label>
                                  <textarea 
                                    [(ngModel)]="lesson.textContent" 
                                    placeholder="Enter your notes or reading content here... You can use markdown formatting."
                                    rows="6"
                                    class="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-sm bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono resize-y"></textarea>
                                </div>
                                
                                <!-- PDF Upload Section -->
                                <div class="border-2 border-dashed border-indigo-300 rounded-lg p-4 bg-indigo-50">
                                  <label class="block text-sm font-bold text-indigo-900 mb-2">📎 Upload PDF Document</label>
                                  <input 
                                    type="file" 
                                    accept=".pdf,application/pdf"
                                    (change)="handleFileUpload($event, lesson)"
                                    class="block w-full text-sm text-gray-900 bg-white border-2 border-indigo-300 rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-l-lg file:border-0 file:text-sm file:font-bold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 file:cursor-pointer">
                                  <p class="text-xs text-gray-600 mt-2">📄 Upload PDF files for students to download (Max 10MB)</p>
                                  
                                  @if (lesson.attachments && lesson.attachments.length > 0) {
                                    <div class="mt-3 space-y-2">
                                      <p class="text-xs font-semibold text-gray-700">Uploaded Files:</p>
                                      @for (attachment of lesson.attachments; track $index) {
                                        <div class="flex items-center justify-between bg-white p-2 rounded border border-gray-200">
                                          <span class="text-sm text-gray-700 flex items-center gap-2">
                                            <span class="text-red-600">📕</span>
                                            {{ getFileName(attachment) }}
                                          </span>
                                          <button 
                                            (click)="removeAttachment(lesson, $index)"
                                            class="text-red-600 hover:text-red-800 text-xs font-bold px-2 py-1 rounded hover:bg-red-50">
                                            ✕ Remove
                                          </button>
                                        </div>
                                      }
                                    </div>
                                  }
                                </div>
                              </div>
                            }
                            
                            @if (lesson.type === 'QUIZ') {
                              <div class="mt-3 space-y-4">
                                <!-- Quiz Questions Builder -->
                                <div class="border-2 border-purple-300 rounded-lg p-4 bg-purple-50">
                                  <div class="flex justify-between items-center mb-3">
                                    <label class="block text-sm font-bold text-purple-900">📝 Quiz Questions</label>
                                    <button
                                      (click)="addQuizQuestion(lesson)"
                                      class="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold shadow-md transition-all">
                                      ➕ Add Question
                                    </button>
                                  </div>
                                  
                                  @if (!lesson.quizQuestions || lesson.quizQuestions.length === 0) {
                                    <p class="text-xs text-purple-700 text-center py-4 italic">No questions yet. Click "Add Question" to create quiz questions.</p>
                                  } @else {
                                    <div class="space-y-3 max-h-96 overflow-y-auto">
                                      @for (question of lesson.quizQuestions; track $index) {
                                        <div class="bg-white border-2 border-purple-200 rounded-lg p-3 space-y-2">
                                          <div class="flex justify-between items-start gap-2">
                                            <span class="bg-purple-600 text-white px-2 py-1 rounded text-xs font-bold">Q{{ $index + 1 }}</span>
                                            <button
                                              (click)="removeQuizQuestion(lesson, $index)"
                                              class="text-red-600 hover:text-red-800 text-xs font-bold px-2 py-1 rounded hover:bg-red-50">
                                              ✕
                                            </button>
                                          </div>
                                          
                                          <textarea
                                            [(ngModel)]="question.question"
                                            placeholder="Enter your question here..."
                                            rows="3"
                                            class="w-full px-3 py-2 border border-gray-300 rounded text-sm bg-white text-gray-900 focus:ring-2 focus:ring-purple-500 resize-none"></textarea>
                                          
                                          <div class="space-y-1">
                                            <label class="text-xs font-semibold text-gray-700">Options:</label>
                                            @for (option of [0,1,2,3]; track $index) {
                                              <div class="flex gap-2">
                                                <input
                                                  type="radio"
                                                  [name]="'correct_' + lesson.id + '_' + $index"
                                                  [checked]="question.correctAnswer === option"
                                                  (change)="setCorrectAnswer(question, option)"
                                                  class="mt-2 w-4 h-4 text-purple-600 cursor-pointer"
                                                  title="Mark as correct answer">
                                                <input
                                                  type="text"
                                                  [(ngModel)]="question.options[option]"
                                                  [placeholder]="'Option ' + ['A','B','C','D'][option]"
                                                  class="flex-1 px-3 py-1.5 border border-gray-300 rounded text-sm bg-white text-gray-900 focus:ring-2 focus:ring-purple-500">
                                              </div>
                                            }
                                          </div>
                                          
                                          <div class="flex gap-2 items-center">
                                            <label class="text-xs font-semibold text-gray-700">Marks:</label>
                                            <input
                                              type="number"
                                              [(ngModel)]="question.marks"
                                              min="1"
                                              placeholder="1"
                                              class="w-20 px-3 py-1.5 border border-gray-300 rounded text-sm bg-white text-gray-900 focus:ring-2 focus:ring-purple-500">
                                          </div>
                                          
                                          <div>
                                            <label class="text-xs font-semibold text-gray-700 block mb-1">Explanation (shown after answer):</label>
                                            <textarea
                                              [(ngModel)]="question.explanation"
                                              placeholder="Explain why this is the correct answer..."
                                              rows="2"
                                              class="w-full px-3 py-2 border border-gray-300 rounded text-sm bg-white text-gray-900 focus:ring-2 focus:ring-purple-500 resize-none"></textarea>
                                          </div>
                                        </div>
                                      }
                                    </div>
                                  }
                                </div>
                                
                                <!-- PDF Upload for Quiz -->
                                <div class="border-2 border-dashed border-purple-300 rounded-lg p-4 bg-purple-50">
                                  <label class="block text-sm font-bold text-purple-900 mb-2">📎 Upload Quiz PDF (Optional)</label>
                                  <input 
                                    type="file" 
                                    accept=".pdf,application/pdf"
                                    (change)="handleFileUpload($event, lesson)"
                                    class="block w-full text-sm text-gray-900 bg-white border-2 border-purple-300 rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-l-lg file:border-0 file:text-sm file:font-bold file:bg-purple-600 file:text-white hover:file:bg-purple-700 file:cursor-pointer">
                                  <p class="text-xs text-gray-600 mt-2">📄 Upload quiz questions or reference material as PDF</p>
                                  
                                  @if (lesson.attachments && lesson.attachments.length > 0) {
                                    <div class="mt-3 space-y-2">
                                      <p class="text-xs font-semibold text-gray-700">Uploaded Files:</p>
                                      @for (attachment of lesson.attachments; track $index) {
                                        <div class="flex items-center justify-between bg-white p-2 rounded border border-gray-200">
                                          <span class="text-sm text-gray-700 flex items-center gap-2">
                                            <span class="text-purple-600">📕</span>
                                            {{ getFileName(attachment) }}
                                          </span>
                                          <button 
                                            (click)="removeAttachment(lesson, $index)"
                                            class="text-red-600 hover:text-red-800 text-xs font-bold px-2 py-1 rounded hover:bg-red-50">
                                            ✕ Remove
                                          </button>
                                        </div>
                                      }
                                    </div>
                                  }
                                </div>
                              </div>
                            }
                          </div>
                        </div>
                      }
                    }
                  </div>
                </div>
              }
            </div>
          }
        </div>

        <!-- Footer -->
        <div class="border-t-2 border-gray-200 flex justify-end gap-3 flex-shrink-0 p-4">
          <button 
            (click)="close()"
            class="px-8 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-100 transition-colors text-gray-700 font-bold text-lg">
            Cancel
          </button>
          <button 
            (click)="saveContent()"
            [disabled]="isSaving()"
            class="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl transition-colors disabled:opacity-50 font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105">
            {{ isSaving() ? 'Saving...' : '💾 Save Content' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class CourseContentManagerComponent implements OnInit {
  @Input() courseId: string = '';
  @Input() courseTitle: string = '';
  @Input() onClose: () => void = () => {};
  
  content = signal<CourseContent>({ courseId: '', modules: [] });
  isSaving = signal(false);

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadContent();
    // Hide sidebar when modal opens
    document.body.style.overflow = 'hidden';
    const sidebar = document.querySelector('.sidebar') || document.querySelector('nav') || document.querySelector('aside');
    if (sidebar) {
      (sidebar as HTMLElement).style.display = 'none';
    }
  }

  loadContent() {
    if (!this.courseId) return;
    
    this.http.get<any>(`http://localhost:8080/api/admin/course-content/${this.courseId}`)
      .subscribe({
        next: (response) => {
          console.log('📚 Loaded course content:', response);
          if (response.data) {
            const contentData = response.data;
            contentData.courseId = this.courseId;
            if (!contentData.modules) contentData.modules = [];
            this.content.set(contentData);
          } else {
            this.content.set({ courseId: this.courseId, modules: [] });
          }
        },
        error: (err) => {
          console.error('Failed to load content:', err);
          this.content.set({ courseId: this.courseId, modules: [] });
        }
      });
  }

  addModule() {
    const currentContent = this.content();
    const newModule: ContentModule = {
      id: 'module_' + Date.now(),
      title: 'New Module',
      description: '',
      orderIndex: currentContent.modules.length + 1,
      lessons: []
    };
    currentContent.modules.push(newModule);
    this.content.set({ ...currentContent });
  }

  deleteModule(index: number) {
    if (confirm('Delete this module and all its lessons?')) {
      const currentContent = this.content();
      currentContent.modules.splice(index, 1);
      // Update order indices
      currentContent.modules.forEach((m, i) => m.orderIndex = i + 1);
      this.content.set({ ...currentContent });
    }
  }

  addLesson(module: ContentModule) {
    const newLesson: ContentLesson = {
      id: 'lesson_' + Date.now(),
      title: 'New Lesson',
      type: 'VIDEO',
      orderIndex: module.lessons.length + 1,
      attachments: [],
      externalLinks: []
    };
    module.lessons.push(newLesson);
    this.content.set({ ...this.content() });
  }

  deleteLesson(module: ContentModule, index: number) {
    if (confirm('Delete this lesson?')) {
      module.lessons.splice(index, 1);
      // Update order indices
      module.lessons.forEach((l, i) => l.orderIndex = i + 1);
      this.content.set({ ...this.content() });
    }
  }

  saveContent() {
    this.isSaving.set(true);
    const contentData = this.content();
    contentData.courseId = this.courseId;
    
    // Convert quiz questions to JSON string for storage
    contentData.modules.forEach(module => {
      module.lessons.forEach(lesson => {
        if (lesson.type === 'QUIZ' && lesson.quizQuestions && lesson.quizQuestions.length > 0) {
          // Store as JSON in quizId field
          lesson.quizId = JSON.stringify(lesson.quizQuestions);
        }
      });
    });
    
    console.log('💾 Saving content:', contentData);
    
    this.http.post<any>('http://localhost:8080/api/admin/course-content', contentData)
      .subscribe({
        next: (response) => {
          console.log('✅ Content saved successfully:', response);
          this.isSaving.set(false);
          alert('Course content saved successfully!');
          this.close();
        },
        error: (err) => {
          console.error('Failed to save content:', err);
          this.isSaving.set(false);
          alert('Failed to save content. Please try again.');
        }
      });
  }

  addQuizQuestion(lesson: ContentLesson) {
    if (!lesson.quizQuestions) {
      lesson.quizQuestions = [];
    }
    
    const newQuestion: QuizQuestion = {
      questionNumber: lesson.quizQuestions.length + 1,
      question: '',
      options: ['', '', '', ''],
      marks: 1
    };
    
    lesson.quizQuestions.push(newQuestion);
    this.content.set({ ...this.content() });
  }

  removeQuizQuestion(lesson: ContentLesson, index: number) {
    if (confirm('Remove this question?')) {
      lesson.quizQuestions?.splice(index, 1);
      // Update question numbers
      lesson.quizQuestions?.forEach((q, i) => q.questionNumber = i + 1);
      this.content.set({ ...this.content() });
    }
  }

  setCorrectAnswer(question: QuizQuestion, optionIndex: number) {
    question.correctAnswer = optionIndex;
    this.content.set({ ...this.content() });
  }

  close() {
    // Restore sidebar when modal closes
    document.body.style.overflow = '';
    const sidebar = document.querySelector('.sidebar') || document.querySelector('nav') || document.querySelector('aside');
    if (sidebar) {
      (sidebar as HTMLElement).style.display = '';
    }
    this.onClose();
  }

  closeModal(event: MouseEvent) {
    // Close modal when clicking outside
    if ((event.target as HTMLElement).classList.contains('fixed')) {
      this.close();
    }
  }

  handleFileUpload(event: any, lesson: ContentLesson) {
    const file = event.target.files[0];
    if (file) {
      // Check file type
      if (file.type !== 'application/pdf') {
        alert('Please upload only PDF files');
        event.target.value = '';
        return;
      }
      
      // Check file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        event.target.value = '';
        return;
      }
      
      // In real implementation, upload to server and get URL
      // For now, storing filename as placeholder
      const fileName = file.name;
      const fileUrl = `uploads/pdfs/${Date.now()}_${fileName}`;
      
      if (!lesson.attachments) {
        lesson.attachments = [];
      }
      lesson.attachments.push(fileUrl);
      
      console.log('📎 File uploaded:', fileName);
      alert(`File "${fileName}" uploaded successfully! (Note: In production, this will be uploaded to server)`);
      
      // Reset input
      event.target.value = '';
      
      // Update content signal
      this.content.set({ ...this.content() });
    }
  }

  removeAttachment(lesson: ContentLesson, index: number) {
    if (confirm('Remove this file?')) {
      lesson.attachments?.splice(index, 1);
      this.content.set({ ...this.content() });
    }
  }

  getFileName(url: string): string {
    const parts = url.split('/');
    const fileName = parts[parts.length - 1];
    // Remove timestamp prefix if exists
    return fileName.replace(/^\d+_/, '');
  }
}
