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
  
  private aiService = inject(AIService);
  private courseService = inject(EnhancedCourseService);

  // Signals for reactive state management
  messages = signal<ChatMessage[]>([]);
  currentCourse = signal<Course | null>(null);
  selectedCourseForComparison = signal<Course | null>(null); // For comparison feature
  isLoading = signal(false);
  isTyping = signal(false);
  
  courseId = signal<string | null>(null);
  userId = signal<string>('user123'); // TODO: Get from auth service
  
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
        // Course is already selected - provide detailed help
        const course = this.currentCourse()!;
        welcomeText = `You've selected "${course.title}"! 🎯\n\nI can help you:\n\n`;
        welcomeText += `✅ Understand if this course is suitable for your level\n`;
        welcomeText += `✅ Learn about prerequisites\n`;
        welcomeText += `✅ Compare with other courses\n`;
        welcomeText += `✅ Suggest what to study next\n\n`;
        welcomeText += `What would you like to know?`;
        
        this.quickSuggestions.set([
          "Is this suitable for me?",
          "What are the prerequisites?",
          "Compare with another course",
          "What should I study after this?",
          "How long will it take?",
          "What will I learn?"
        ]);
      } else {
        // No course selected - simple, friendly prompt
        welcomeText = "Hi! I'm here to help you find the right course. 😊\n\n";
        welcomeText += "Select a course or tell me what interests you, and I'll guide you!\n\n";
        welcomeText += "You can also ask me to:\n";
        welcomeText += "🔍 Help with filters\n";
        welcomeText += "⚖️ Compare courses\n";
        welcomeText += "💡 Suggest courses for beginners";
        
        this.quickSuggestions.set([
          "What should I learn?",
          "Show beginner courses",
          "Help me filter by topic",
          "Suggest courses for my interest"
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
    const context = this.pageContext();
    
    // Handle Browse Courses context with intelligent responses
    if (context.page === 'browse-courses') {
      setTimeout(() => {
        const response = this.generateBrowseCoursesResponse(message, context);
        const aiMessage: ChatMessage = {
          id: `ai-${Date.now()}`,
          message: response,
          response: '',
          timestamp: new Date(),
          isFromUser: false
        };

        this.messages.update(messages => [...messages, aiMessage]);
        this.isLoading.set(false);
        this.isTyping.set(false);
      }, 1000);
    } else {
      // For general chat outside Browse Courses
      setTimeout(() => {
        const aiMessage: ChatMessage = {
          id: `ai-${Date.now()}`,
          message: "I'm here to help with your learning journey! For the best assistance, please visit the Browse Courses page or a specific course page where I can provide more targeted help.",
          response: '',
          timestamp: new Date(),
          isFromUser: false
        };

        this.messages.update(messages => [...messages, aiMessage]);
        this.isLoading.set(false);
        this.isTyping.set(false);
      }, 1000);
    }
  }
  
  private generateBrowseCoursesResponse(message: string, context: any): string {
    const lowerMessage = message.toLowerCase();
    
    // ============================================================
    // STEP 0: CHECK FOR OUT-OF-SCOPE QUESTIONS (HIGHEST PRIORITY)
    // ============================================================
    if (this.isOutOfScopeQuestion(lowerMessage)) {
      return "I can help you with courses and learning on this page 😊\n\n" +
             "This question looks a bit outside my scope here.\n" +
             "On the Browse Courses page, I can assist you with:\n" +
             "• Understanding courses\n" +
             "• Comparing courses\n" +
             "• Choosing the right level\n" +
             "• Deciding what to learn next\n\n" +
             "📌 Please ask a question related to courses, or select a course to continue.";
    }
    
    // ============================================================
    // STEP 1: CLASSIFY QUESTION TYPE
    // ============================================================
    const questionType = this.classifyQuestionType(lowerMessage, this.currentCourse());
    
    // ============================================================
    // CORE RULE 1 - Course Reference Check (HIGHEST PRIORITY)
    // ============================================================
    // If user refers to "this course", "the course", or asks course-specific question
    // WITHOUT selecting or naming a course, politely ask them to select one.
    // DO NOT give generic advice.
    
    const courseReferences = [
      'this course', 'the course', 'that course', 'this one', 'that one',
      'is it', 'will it', 'does it', 'can it', 'should i take it', 
      'should i enroll', 'worth it', 'is this'
    ];
    
    const courseSpecificQuestions = [
      'suitable for me', 'good for me', 'right for me', 'suitable for',
      'should i take', 'should i enroll', 'is this good', 'is this bad',
      'worth it', 'recommend this', 'how long', 'how much time',
      'what will i learn', 'what topics', 'prerequisites', 'prerequisite',
      'beginner friendly', 'difficulty', 'what next', 'after this',
      'what does it cover', 'who is it for', 'instructor'
    ];
    
    const hasCourseReference = courseReferences.some(ref => lowerMessage.includes(ref));
    const hasCourseSpecificQuestion = courseSpecificQuestions.some(q => lowerMessage.includes(q));
    
    // RULE 1: Ask for course selection if reference found but no course selected
    if ((hasCourseReference || hasCourseSpecificQuestion) && !this.currentCourse()) {
      return this.getVariedResponse('no-course-selected', 'course-reference', {});
    }
    
    // ============================================================
    // CORE RULE 2 - General Guidance Questions
    // ============================================================
    // If user asks general questions like "What should I learn next?" or "What should I start with?"
    // AND no course is mentioned, ask 2-3 short clarifying questions
    // DO NOT show generic introduction.
    
    // SPECIAL CASE: User references "my interest" without specifying it
    const hasMyInterestPlaceholder = /(?:for|in|about)\s+my\s+interest/i.test(lowerMessage) ||
                                      /my\s+interest/i.test(lowerMessage);
    
    if (hasMyInterestPlaceholder && !this.currentCourse()) {
      const variations = [
        "I'd love to help! 😊 Which topic are you interested in?\n\n" +
        "For example:\n" +
        "• AI / Machine Learning\n" +
        "• Web Development\n" +
        "• Data Science\n" +
        "• Mobile Apps\n" +
        "• Design\n\n" +
        "Just tell me your interest!",
        "Sure! 🎯 But first, could you tell me which topic interests you?\n\n" +
        "Some examples:\n" +
        "→ Programming (Java, Python, etc.)\n" +
        "→ AI & Machine Learning\n" +
        "→ Web Development\n" +
        "→ Cloud Computing\n\n" +
        "What would you like to learn?",
        "Happy to help! 💡 What topic are you interested in?\n\n" +
        "You can say:\n" +
        "✓ AI\n" +
        "✓ Java\n" +
        "✓ Web Development\n" +
        "✓ Data Science\n" +
        "✓ Or any other topic!\n\n" +
        "Let me know!"
      ];
      return variations[this.messages().length % variations.length];
    }
    
    // FIRST: Check if user has stated their interest (even without asking a question)
    const { hasInterest, interest } = this.hasStatedInterest(lowerMessage);
    
    if (hasInterest && !this.currentCourse()) {
      // User stated interest - acknowledge and ask next step
      return this.getVariedResponse('no-course-selected', 'interest-stated', { interest });
    }
    
    const generalGuidanceQuestions = [
      'what should i learn', 'what to learn', 'where to start', 'where should i start',
      'what should i start', 'recommend a course', 'suggest a course', 'help me choose'
    ];
    
    const hasGeneralQuestion = generalGuidanceQuestions.some(q => lowerMessage.includes(q));
    
    if (hasGeneralQuestion && !this.currentCourse()) {
      // No stated interest - ask clarifying questions
      return this.getVariedResponse('no-course-selected', 'general-question', {});
    }
    
    // ============================================================
    // SAFETY RULES: Never guess, never invent, never override
    // ============================================================
    
    // ============================================================
    // CORE RULE 3 - When Course Is Available
    // ============================================================
    // Respond based on QUESTION TYPE and vary response structure
    
    if (this.currentCourse()) {
      const course = this.currentCourse()!;
      const courseData = {
        courseName: course.title,
        category: course.category,
        level: course.difficulty,
        duration: course.estimatedTime || course.duration || 'varies',
        description: course.description
      };
      
      // DECISION-RELATED questions - Guide without deciding
      if (questionType === 'decision-related') {
        return this.getVariedResponse('decision-related', 'should-take', courseData);
      }
      
      // COMPARISON questions
      if (questionType === 'comparison' || lowerMessage.includes('compare') || lowerMessage.includes(' vs ')) {
        return this.getVariedResponse('comparison', 'need-second-course', courseData);
      }
      
      // COURSE-SPECIFIC questions - Suitability
      if (lowerMessage.includes('suitable') || lowerMessage.includes('good for') || 
          lowerMessage.includes('right for') || lowerMessage.includes('for me')) {
        
        const difficulty = course.difficulty?.toLowerCase() || 'beginner';
        let variationKey = 'suitability-beginner';
        
        if (difficulty.includes('intermediate')) {
          variationKey = 'suitability-intermediate';
        } else if (difficulty.includes('advanced') || difficulty.includes('expert')) {
          variationKey = 'suitability-advanced';
        }
        
        return this.getVariedResponse('course-specific', variationKey, courseData);
      }
      
      // Prerequisites
      if (lowerMessage.includes('prerequisite') || lowerMessage.includes('require') || 
          lowerMessage.includes('need to know') || lowerMessage.includes('before')) {
        const prereqs = course.prerequisites;
        if (prereqs && Array.isArray(prereqs) && prereqs.length > 0) {
          const prereqsList = prereqs.map(p => `• ${p}`).join('\n');
          return `Prerequisites for ${course.title}:\n\n${prereqsList}\n\n` +
                 `💡 Make sure you're comfortable with these before starting!`;
        } else {
          return `${course.title} has no specific prerequisites mentioned.\n\n` +
                 `✅ You can start right away!\n` +
                 `💡 Check the course description for recommended skills.`;
        }
      }
      
      // What's Next / Learning Path - Varied responses
      if (lowerMessage.includes('next') || lowerMessage.includes('after') || 
          lowerMessage.includes('then what') || lowerMessage.includes('follow up')) {
        const variations = [
          `After completing ${course.title}:\n\n🎯 Look for intermediate/advanced courses in ${course.category}\n🎯 Explore related topics that build on this foundation\n🎯 Practice by working on real projects\n\n💡 I can help you find related courses!`,
          `Next steps after ${course.title}:\n\n→ Progress to higher-level ${course.category} courses\n→ Apply what you learned in hands-on projects\n→ Explore complementary skills\n\n🌟 Want suggestions for follow-up courses?`,
          `Once you finish ${course.title}:\n\n✨ Move to advanced topics in ${course.category}\n✨ Build real projects to solidify learning\n✨ Branch into related areas\n\n💬 Need help finding what's next?`
        ];
        return variations[this.messages().length % variations.length];
      }
      
      // Duration/Time - Varied responses
      if (lowerMessage.includes('long') || lowerMessage.includes('time') || 
          lowerMessage.includes('duration') || lowerMessage.includes('hours')) {
        const time = course.estimatedTime || course.duration || 'not specified';
        const variations = [
          `${course.title} takes approximately ${time} hours.\n\n⏱️ Includes lectures, practice, and assignments\n💡 Learn at your own pace - no rush!`,
          `You'll need about ${time} hours for ${course.title}.\n\n📚 Covers all materials and exercises\n🎯 Flexible schedule - go at your speed!`,
          `Plan for ${time} hours to complete ${course.title}.\n\n⏰ Includes everything: lessons, practice, quizzes\n✨ Take your time to absorb the material!`
        ];
        return variations[this.messages().length % variations.length];
      }
      
      // What Will I Learn - Varied responses  
      if (lowerMessage.includes('learn') || lowerMessage.includes('topics') || 
          lowerMessage.includes('cover') || lowerMessage.includes('teach')) {
        const variations = [
          `${course.title}\n\n${course.description || 'Check the course page for detailed syllabus.'}\n\n📂 Category: ${course.category}\n📊 Level: ${course.difficulty}\n\n💡 Click the course to see full module details!`,
          `What's covered in ${course.title}:\n\n${course.description || 'See course page for full curriculum.'}\n\n🏷️ ${course.category} | ${course.difficulty}\n\n🔍 View the complete syllabus on the course page!`,
          `In ${course.title}, you'll explore:\n\n${course.description || 'Full details available on course page.'}\n\nCategory: ${course.category}\nDifficulty: ${course.difficulty}\n\n📖 Check course page for detailed breakdown!`
        ];
        return variations[this.messages().length % variations.length];
      }
    }
    
    // ============================================================
    // General Helpful Guidance (No Course Selected)
    // ============================================================
    if (lowerMessage.includes('filter') || lowerMessage.includes('category') || 
        lowerMessage.includes('find') || lowerMessage.includes('search')) {
      return "Use the filters to find courses:\n\n" +
             "🔍 Search by name or topic\n" +
             "📂 Category (AI, Web Dev, etc.)\n" +
             "📊 Level (Beginner/Intermediate/Advanced)\n\n" +
             "What are you looking for?";
    }
    
    // Beginner Guidance
    if (lowerMessage.includes('beginner') || lowerMessage.includes('new to') || 
        lowerMessage.includes('never done')) {
      return "For beginners:\n\n" +
             "✅ Use the Beginner filter\n" +
             "✅ Look for courses with clear descriptions\n" +
             "✅ Start with foundational topics\n\n" +
             "Which topic interests you?";
    }
    
    // Course Comparison (General)
    if (lowerMessage.includes('compare') || lowerMessage.includes('difference')) {
      return "To compare courses, I need:\n\n" +
             "📌 Names of both courses\n\n" +
             "Or select a course first, then ask me to compare!\n\n" +
             "I'll compare difficulty, duration, content, and suitability.";
    }
    
    // Learning Path
    if (lowerMessage.includes('path') || lowerMessage.includes('roadmap')) {
      return "Building a learning path? Great! 🎯\n\n" +
             "Tell me:\n" +
             "1️⃣ Your topic of interest\n" +
             "2️⃣ Your current level\n" +
             "3️⃣ Your goal\n\n" +
             "I'll suggest a step-by-step plan!";
    }
    
    // Difficulty/Level
    if (lowerMessage.includes('difficulty') || lowerMessage.includes('level') || 
        lowerMessage.includes('hard') || lowerMessage.includes('easy')) {
      return "Choose the right level:\n\n" +
             "📊 Beginner: No prior knowledge needed\n" +
             "📊 Intermediate: Basic experience required\n" +
             "📊 Advanced: Solid foundation needed\n\n" +
             "💡 Use the level filter to find courses at your skill level!";
    }
    
    // Default - Short, Clear, Supportive
    return "I'm here to help you choose! 😊\n\n" +
           "You can:\n" +
           "📌 Select a course and ask about it\n" +
           "📌 Ask for course suggestions\n" +
           "📌 Get help with filters\n\n" +
           "What interests you?";
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

  // ============================================================
  // QUESTION CLASSIFICATION
  // ============================================================
  
  // Detect if user has stated their interest (to avoid asking "What interests you?" again)
  private hasStatedInterest(message: string): { hasInterest: boolean; interest: string } {
    const interestPatterns = [
      // Flexible pattern for "in [topic]" at start (handles "in interested in X", "in X", etc.)
      /^(?:in\s+)?(?:interested?\s+)?in\s+([\w\s#+.-]+?)(?:\.|,|!|\?|$)/i,
      // "interested in..." (catches "interested in AI", "I'm interested in AI", "i interested in C++", etc.)
      /(?:^|\s)int(?:e)?r(?:e)?st(?:e)?d\s+in\s+([\w\s#+.-]+?)(?:\.|,|!|\?|$)/i,
      // "I am interested in...", "I'm interested in..."
      /(?:i am|i'm|i)\s+(?:int(?:e)?r(?:e)?st(?:e)?d?\s+in|want to learn|learning|study(?:ing)?)\s+([\w\s#+.-]+?)(?:\.|,|!|\?|$)/i,
      // "I want to learn...", "I'd like to learn..."
      /(?:i want|i'd like|i would like)\s+(?:to\s+)?(?:learn|study|know about|understand)\s+([\w\s#+.-]+?)(?:\.|,|!|\?|$)/i,
      // "Tell me about...", "Help me with..."
      /(?:tell me about|help me with|teach me|show me)\s+([\w\s#+.-]+?)(?:\.|,|!|\?|$)/i,
      // "course on/about/for/in..."
      /(?:course(?:s)? (?:on|about|for|in))\s+([\w\s#+.-]+?)(?:\.|,|!|\?|$)/i,
      // Direct statement: "AI", "web development", etc. after intro
      /(?:^|\s)(?:my interest is|interest in)\s+([\w\s#+.-]+?)(?:\.|,|!|\?|$)/i
    ];
    
    for (const pattern of interestPatterns) {
      const match = message.match(pattern);
      if (match && match[1]) {
        const interest = match[1].trim();
        
        // Validate the interest is meaningful and specific
        // Must be at least 2 characters and not a filler word
        if (!interest || interest.length < 2) {
          continue;
        }
        
        // Exclude common filler words and incomplete phrases
        const fillerWords = ['it', 'this', 'that', 'them', 'there', 'is', 'are', 'was', 'were', 'in', 'on', 'at'];
        if (fillerWords.includes(interest.toLowerCase())) {
          continue;
        }
        
        // Exclude placeholder phrases like "my interest", "this interest", etc.
        const placeholderPhrases = ['my interest', 'this interest', 'that interest', 'the interest', 'an interest', 'some interest'];
        if (placeholderPhrases.includes(interest.toLowerCase())) {
          continue;
        }
        
        // If interest contains only special characters or numbers, skip it
        if (!/[a-zA-Z]/.test(interest)) {
          continue;
        }
        
        // Valid interest found!
        return { hasInterest: true, interest };
      }
    }
    
    return { hasInterest: false, interest: '' };
  }
  
  // Check if question is out of scope for Browse Courses page
  private isOutOfScopeQuestion(message: string): boolean {
    // Keywords that indicate course-related questions (IN SCOPE)
    const courseRelatedKeywords = [
      'course', 'learn', 'study', 'teach', 'instructor', 'class', 'lesson',
      'tutorial', 'training', 'education', 'beginner', 'intermediate', 'advanced',
      'prerequisite', 'duration', 'time', 'hours', 'enroll', 'suitable',
      'difficulty', 'level', 'topic', 'subject', 'category', 'filter',
      'compare', 'recommend', 'suggest', 'next', 'start', 'programming',
      'development', 'design', 'science', 'business', 'skill', 'certificate',
      'what should i', 'where to start', 'how to', 'best for'
    ];
    
    // If message contains any course-related keyword, it's IN SCOPE
    if (courseRelatedKeywords.some(keyword => message.includes(keyword))) {
      return false;
    }
    
    // Common out-of-scope topics
    const outOfScopeKeywords = [
      'weather', 'news', 'joke', 'game', 'recipe', 'movie', 'song', 'music',
      'sports', 'politics', 'stock', 'crypto', 'bitcoin', 'price', 'buy', 'sell',
      'restaurant', 'food', 'travel', 'hotel', 'flight', 'book', 'ticket',
      'health', 'medicine', 'doctor', 'hospital', 'symptom', 'disease',
      'calculate', 'math problem', 'solve equation', 'translate',
      'write code for', 'debug this', 'fix my code', 'homework',
      'who is', 'who are', 'what is the capital', 'when was', 'where is'
    ];
    
    // If message contains out-of-scope keywords, it's OUT OF SCOPE
    if (outOfScopeKeywords.some(keyword => message.includes(keyword))) {
      return true;
    }
    
    // Generic conversational questions that are out of scope
    const genericConversational = [
      'hello', 'hi', 'hey', 'good morning', 'good evening', 'how are you',
      'what\'s up', 'thanks', 'thank you', 'bye', 'goodbye'
    ];
    
    // If ONLY generic greeting/thanks (and nothing else meaningful), IN SCOPE (for politeness)
    // But if it's a complex non-course question, OUT OF SCOPE
    const isOnlyGreeting = genericConversational.some(g => message.trim() === g);
    if (isOnlyGreeting) {
      return false; // Allow simple greetings
    }
    
    // If message is very short (< 3 words) and doesn't contain course keywords, might be out of scope
    const wordCount = message.trim().split(/\s+/).length;
    if (wordCount > 5 && !courseRelatedKeywords.some(kw => message.includes(kw))) {
      // Long message without course keywords - likely out of scope
      return true;
    }
    
    return false; // Default: assume in scope
  }
  
  private classifyQuestionType(message: string, course: Course | null): 
    'course-specific' | 'decision-related' | 'comparison' | 'general-guidance' {
    
    // Decision-related questions
    const decisionKeywords = [
      'should i', 'is it worth', 'is this worth', 'recommend', 'good choice',
      'right choice', 'make sense', 'good idea', 'better to', 'go for'
    ];
    if (decisionKeywords.some(kw => message.includes(kw))) {
      return 'decision-related';
    }
    
    // Comparison questions
    const comparisonKeywords = [
      'compare', 'comparison', ' vs ', 'versus', 'difference between',
      'better than', 'which one', 'or ', 'similar to'
    ];
    if (comparisonKeywords.some(kw => message.includes(kw))) {
      return 'comparison';
    }
    
    // Course-specific questions (when course is selected)
    const courseSpecificKeywords = [
      'prerequisite', 'duration', 'how long', 'what will i learn', 'topics',
      'cover', 'suitable', 'level', 'difficulty', 'beginner', 'instructor',
      'what next', 'after this'
    ];
    if (course && courseSpecificKeywords.some(kw => message.includes(kw))) {
      return 'course-specific';
    }
    
    // Default to general guidance
    return 'general-guidance';
  }

  // ============================================================
  // DYNAMIC RESPONSE VARIATIONS
  // ============================================================
  private getVariedResponse(type: string, key: string, data: any): string {
    const variations = this.getResponseVariations();
    const options = variations[type]?.[key];
    if (!options || options.length === 0) return '';
    
    // Use simple rotation based on message count for variation
    const index = this.messages().length % options.length;
    const template = options[index];
    
    // Replace placeholders with actual data
    return this.replacePlaceholders(template, data);
  }

  private replacePlaceholders(template: string, data: any): string {
    return template
      .replace(/\{courseName\}/g, data.courseName || '')
      .replace(/\{category\}/g, data.category || '')
      .replace(/\{level\}/g, data.level || '')
      .replace(/\{duration\}/g, data.duration || '')
      .replace(/\{description\}/g, data.description || '')
      .replace(/\{prerequisites\}/g, data.prerequisites || '')
      .replace(/\{interest\}/g, data.interest || '');
  }

  private getResponseVariations(): any {
    return {
      'no-course-selected': {
        'course-reference': [
          "I'd love to help! 😊 But I need to know which course you're asking about.\n\nPlease:\n📌 Click on a course card, OR\n📌 Tell me the course name\n\nThen I can help you understand if it's right for you!",
          "To give you accurate info, could you let me know which course caught your attention? 🎯\n\nYou can:\n• Click on any course card\n• Tell me the course name\n\nThen I'll share all the details you need!",
          "I see you're interested in a course! Which one are you curious about? 😊\n\nSelect a course from the list or mention its name, and I'll help you learn more about it!"
        ],
        'general-question': [
          "I can help you find the right course! 🎯\n\nQuick questions:\n1️⃣ What topic interests you?\n2️⃣ What's your current level?\n3️⃣ What's your goal?\n\nTell me about any of these!",
          "Let's find your perfect course! 💡\n\nTo suggest the best options:\n• What field interests you? (AI, web dev, design, etc.)\n• Are you a beginner or have some experience?\n• Learning for career or hobby?\n\nShare what you can!",
          "I'm here to guide you! 🌟\n\nHelp me understand:\n→ What do you want to learn?\n→ What's your background?\n→ What are you aiming to achieve?\n\nJust share a bit about yourself!"
        ],
        'interest-stated': [
          "Great! {interest} is an exciting field! 🎯\n\nTo help you find the perfect course:\n\n1️⃣ What's your current level?\n   • Complete beginner\n   • Some basics\n   • Intermediate\n\n2️⃣ What's your goal?\n   • Career change\n   • Skill upgrade\n   • Just exploring\n\nLet me know!",
          "Excellent choice! {interest} has great courses here! 💡\n\nA couple of quick questions:\n\n→ Are you new to {interest} or have some experience?\n→ Learning for work or personal growth?\n\nThis will help me point you to the right courses!",
          "Perfect! I can help you with {interest}! 🌟\n\nTo recommend the best fit:\n\n• What's your experience level in {interest}?\n  (Beginner / Intermediate / Advanced)\n\n• What do you want to achieve?\n  (Career / Project / Learning for fun)\n\nShare what you can!"
        ]
      },
      'course-specific': {
        'suitability-beginner': [
          "{courseName}\n\n✅ Perfect for beginners!\nNo prior experience needed. This course starts from the basics.\n\n⏱️ Duration: {duration} hours\n\n💡 You can dive right in!",
          "{courseName}\n\n🌱 Great starting point!\nDesigned for those new to the topic. Explained step-by-step.\n\n⏱️ Takes about {duration} hours\n\n💡 No worries if you're just starting out!",
          "{courseName}\n\n✨ Beginner-friendly!\nBuilt for newcomers with clear explanations.\n\n⏱️ Time: {duration} hours\n\n💡 Jump in confidently!"
        ],
        'suitability-intermediate': [
          "{courseName}\n\n📚 Intermediate level\nBest if you have some basics. Builds on what you know.\n\n⏱️ Duration: {duration} hours\n\n💡 Make sure you're comfortable with fundamentals!",
          "{courseName}\n\n📈 For those with foundation\nTakes your existing knowledge to the next level.\n\n⏱️ About {duration} hours\n\n💡 Some background will help you get the most out of it!",
          "{courseName}\n\n🎯 Intermediate challenge\nAssuming you've got the basics covered.\n\n⏱️ Time: {duration} hours\n\n💡 Review fundamentals if needed before starting!"
        ],
        'suitability-advanced': [
          "{courseName}\n\n🎓 Advanced level\nFor experienced learners. Dives deep into complex topics.\n\n⏱️ Duration: {duration} hours\n\n💡 Solid foundation recommended!",
          "{courseName}\n\n🚀 Expert territory\nCovers advanced concepts in depth.\n\n⏱️ Takes {duration} hours\n\n💡 Best for those with strong background!",
          "{courseName}\n\n💪 High-level content\nChallenging material for experienced learners.\n\n⏱️ Time: {duration} hours\n\n💡 Make sure you're ready for advanced topics!"
        ]
      },
      'decision-related': {
        'should-take': [
          "I can give you info to decide, but the choice is yours! 😊\n\n{courseName} is {level} level and covers {description}\n\nConsider:\n• Does it match your skill level?\n• Do you have {duration} hours to invest?\n• Does the content align with your goals?\n\nWhat matters most to you?",
          "That's your call to make! Here's what might help:\n\n{courseName} → {level} difficulty\n⏱️ {duration} hours\n📚 Covers: {description}\n\nThink about:\n→ Your current knowledge\n→ Time you can commit\n→ Your learning objectives\n\nWhat's your main concern?",
          "Only you know what's best for your journey! 🎯\n\nAbout {courseName}:\nLevel: {level}\nTime: {duration} hours\nFocus: {description}\n\nAsk yourself:\n• Am I ready for this level?\n• Can I dedicate the time?\n• Is this aligned with my goals?\n\nNeed clarity on anything specific?"
        ]
      },
      'comparison': {
        'need-second-course': [
          "To compare {courseName} with another course, please tell me:\n\n📌 The name of the second course\n\nOr I can suggest similar courses in {category}!\n\nWhich course interests you?",
          "I'd love to compare! But I need to know the other course.\n\nCurrent: {courseName} ({category})\nCompare with: ?\n\nJust give me the name, or I can suggest alternatives in {category}!",
          "Great idea to compare! 👍\n\nYou've selected: {courseName}\n\nWhich other course would you like to see alongside it? Or shall I suggest some in the {category} category?"
        ]
      }
    };
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