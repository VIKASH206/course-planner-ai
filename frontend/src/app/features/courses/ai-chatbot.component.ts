import { Component, OnInit, signal, inject, ViewChild, ElementRef, AfterViewChecked, Inject, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

// Angular Material Imports
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

// Services and Models
import { AIService } from '../../core/services/ai.service';
import { EnhancedCourseService } from '../../core/services/enhanced-course.service';
import { AuthService } from '../../core/services/auth.service';
import {
  ChatMessage,
  Course,
  ApiResponse
} from '../../core/models/course.models';

@Component({
  selector: 'app-ai-chatbot',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatSnackBarModule
  ],
  templateUrl: './ai-chatbot.component.html',
  styleUrl: './ai-chatbot.component.scss'
})
export class AIChatbotComponent implements OnInit, AfterViewChecked {
  @ViewChild('chatContainer') private chatContainer!: ElementRef;
  @ViewChild('messageInput') private messageInput!: ElementRef;

  private route = inject(ActivatedRoute);
  private snackBar = inject(MatSnackBar);
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  
  private aiService = inject(AIService);
  private courseService = inject(EnhancedCourseService);

  // Signals for reactive state management
  messages = signal<ChatMessage[]>([]);
  currentCourse = signal<Course | null>(null);
  selectedCourseForComparison = signal<Course | null>(null); // For comparison feature
  isLoading = signal(false);
  isTyping = signal(false);
  
  courseId = signal<string | null>(null);
  userId = signal<string>('');
  
  // Page context for Browse Courses
  pageContext = signal<{
    page: 'browse-courses' | 'course-detail' | 'general',
    visibleCourses?: Course[],
    appliedFilters?: { category?: string, level?: string, search?: string },
    userInterests?: string[]
  }>({ page: 'general' });

  chatForm: FormGroup;
  
  // Quick suggestions - dynamic based on context
  quickSuggestions = signal<string[]>([
    "Explain this topic in simple terms",
    "What are the key concepts I should focus on?",
    "Can you give me some practice questions?",
    "How does this relate to real-world applications?",
    "What should I study next?",
    "I'm having trouble understanding this concept"
  ]);

  constructor(@Optional() @Inject(MAT_DIALOG_DATA) public dialogData: any) {
    this.chatForm = this.fb.group({
      message: ['', [Validators.required, Validators.minLength(1)]]
    });
    
    // Set page context if provided from Browse Courses
    if (dialogData?.pageContext) {
      this.pageContext.set(dialogData.pageContext);
    }
    
    // Set selected course if provided from Browse Courses
    if (dialogData?.selectedCourse) {
      this.currentCourse.set(dialogData.selectedCourse);
      this.courseId.set(dialogData.selectedCourse.id || null);
    }
  }

  ngOnInit(): void {
    // Always use logged-in user ID so backend can personalize by profile/interests.
    const loggedInUserId = this.authService.currentUser()?.id;
    if (loggedInUserId) {
      this.userId.set(loggedInUserId);
    }

    this.route.queryParams.subscribe(params => {
      const courseId = params['courseId'];
      if (courseId) {
        this.courseId.set(courseId);
        this.loadCourseInfo();
        this.initializeChat();
      } else {
        this.initializeGeneralChat();
      }
    });
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  private loadCourseInfo(): void {
    const courseId = this.courseId();
    if (!courseId) return;

    this.courseService.getCourseDetails(courseId, this.userId()).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.currentCourse.set(response.data.course);
        }
      },
      error: (error) => {
        console.error('Error loading course info:', error);
      }
    });
  }

  private initializeChat(): void {
    const course = this.currentCourse();
    const welcomeMessage: ChatMessage = {
      id: 'welcome',
      message: course 
        ? `Hi! I'm your AI assistant for "${course.title}". How can I help you with your learning today?`
        : "Hi! I'm your AI learning assistant. How can I help you today?",
      response: '',
      timestamp: new Date(),
      isFromUser: false,
      courseId: this.courseId() || undefined
    };
    
    this.messages.set([welcomeMessage]);
  }

  private initializeGeneralChat(): void {
    const context = this.pageContext();
    let welcomeText = "Hi! I'm your AI learning assistant. I can help you with course questions, study tips, and learning guidance. What would you like to know?";
    
    if (context.page === 'browse-courses') {
      if (this.currentCourse()) {
        // Course is already selected - provide detailed and professional help
        const course = this.currentCourse()!;
        welcomeText = `You selected "${course.title}".\n\n`;
        welcomeText += `I can help you evaluate:\n`;
        welcomeText += `• Suitability for your current skill level\n`;
        welcomeText += `• Prerequisites and expected outcomes\n`;
        welcomeText += `• Comparison with related courses\n`;
        welcomeText += `• Recommended next learning path\n\n`;
        welcomeText += `Ask your question and I will provide a clear, professional recommendation.`;
        
        this.quickSuggestions.set([
          "Is this course suitable for my level?",
          "What prerequisites should I complete first?",
          "Compare this with similar courses",
          "What should I study after this course?",
          "How much time should I plan per week?",
          "What skills will I gain on completion?"
        ]);
      } else {
        // No course selected - clear and professional prompt
        welcomeText = "I can help you choose the right course based on your goals and current level.\n\n";
        welcomeText += "Ask me to:\n";
        welcomeText += "• Recommend courses by interest\n";
        welcomeText += "• Compare two options\n";
        welcomeText += "• Build a beginner-to-advanced learning path";
        
        this.quickSuggestions.set([
          "Recommend a course for my interests",
          "Show beginner-friendly options",
          "Help me filter by topic and difficulty",
          "Create a learning path for my career goal"
        ]);
      }
    }
    
    const welcomeMessage: ChatMessage = {
      id: 'welcome-general',
      message: welcomeText,
      response: '',
      timestamp: new Date(),
      isFromUser: false
    };
    
    this.messages.set([welcomeMessage]);
  }

  sendMessage(): void {
    if (this.chatForm.invalid || this.isLoading()) return;

    const messageText = this.chatForm.get('message')?.value.trim();
    if (!messageText) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      message: messageText,
      response: '',
      timestamp: new Date(),
      isFromUser: true,
      courseId: this.courseId() || undefined
    };

    this.messages.update(messages => [...messages, userMessage]);
    this.chatForm.reset();
    this.isLoading.set(true);
    this.isTyping.set(true);

    // Send to AI service
    const courseId = this.courseId();
    if (courseId) {
      this.aiService.chatWithAI(courseId, messageText, this.userId()).subscribe({
        next: (response) => this.handleAIResponse(response, userMessage.id!),
        error: (error) => this.handleError(error, userMessage.id!)
      });
    } else {
      // General chat without specific course context
      this.handleGeneralChat(messageText, userMessage.id!);
    }
  }

  private handleAIResponse(response: ApiResponse<ChatMessage>, userMessageId: string): void {
    this.isLoading.set(false);
    this.isTyping.set(false);

    if (response.success && response.data) {
      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        message: response.data.response || 'I apologize, but I could not generate a response.',
        response: '',
        timestamp: new Date(),
        isFromUser: false,
        courseId: this.courseId() || undefined
      };

      this.messages.update(messages => [...messages, aiMessage]);
    } else {
      this.handleError(new Error(response.message || 'Unknown error'), userMessageId);
    }
  }

  private handleGeneralChat(message: string, userMessageId: string): void {
    const context = this.buildGeneralAIContext();
    const userId = this.userId() || undefined;

    this.aiService.chatGeneral(message, context, userId, 'auto').subscribe({
      next: (response) => {
        this.isLoading.set(false);
        this.isTyping.set(false);

        if (!response?.success || !response.data) {
          this.handleError(new Error(response?.message || 'AI response unavailable'), userMessageId);
          return;
        }

        const payload = response.data as any;
        const aiText = typeof payload?.message === 'string' ? payload.message : '';

        if (!aiText) {
          this.handleError(new Error('Empty AI response'), userMessageId);
          return;
        }

        const aiMessage: ChatMessage = {
          id: `ai-${Date.now()}`,
          message: aiText,
          response: '',
          timestamp: new Date(),
          isFromUser: false,
          courseId: this.courseId() || undefined
        };

        this.messages.update(messages => [...messages, aiMessage]);
      },
      error: (error) => this.handleError(error, userMessageId)
    });
  }

  private buildGeneralAIContext(): string {
    const context = this.pageContext();
    const selectedCourse = this.currentCourse();

    const filters = context.appliedFilters
      ? `category=${context.appliedFilters.category || 'all'}, level=${context.appliedFilters.level || 'all'}, search=${context.appliedFilters.search || 'none'}`
      : 'none';

    const visibleCourses = (context.visibleCourses || [])
      .slice(0, 8)
      .map(c => `${c.title} (${c.category}, ${c.difficulty})`)
      .join('; ');

    const interests = (context.userInterests || []).join(', ') || 'not provided';

    return [
      `Page: ${context.page}`,
      selectedCourse ? `Selected Course: ${selectedCourse.title} | ${selectedCourse.category} | ${selectedCourse.difficulty}` : 'Selected Course: none',
      `Applied Filters: ${filters}`,
      `User Interests: ${interests}`,
      `Visible Courses: ${visibleCourses || 'none'}`,
      'Answer with practical and professional course guidance based on this context only.',
      'Use concise bullet points, avoid emojis, and never reveal internal identifiers.'
    ].join('\n');
  }
  
  private handleError(error: any, userMessageId: string): void {
    console.error('Error sending message to AI:', error);
    this.isLoading.set(false);
    this.isTyping.set(false);

    const errorMessage: ChatMessage = {
      id: `error-${Date.now()}`,
      message: "I'm sorry, I encountered an error processing your message. Please try again.",
      response: '',
      timestamp: new Date(),
      isFromUser: false,
      courseId: this.courseId() || undefined
    };

    this.messages.update(messages => [...messages, errorMessage]);
    this.snackBar.open('Error communicating with AI assistant', 'Close', { duration: 3000 });
  }

  sendQuickSuggestion(suggestion: string): void {
    this.chatForm.patchValue({ message: suggestion });
    this.sendMessage();
  }

  private scrollToBottom(): void {
    try {
      if (this.chatContainer) {
        this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
      }
    } catch (err) {
      console.error('Error scrolling to bottom:', err);
    }
  }

  clearChat(): void {
    if (this.courseId()) {
      this.initializeChat();
    } else {
      this.initializeGeneralChat();
    }
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  formatTimestamp(timestamp: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(timestamp));
  }

  trackMessage(index: number, message: ChatMessage): string {
    return message.id || index.toString();
  }
}