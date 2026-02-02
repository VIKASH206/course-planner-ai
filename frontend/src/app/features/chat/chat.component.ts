import { Component, OnInit, OnDestroy, signal, inject, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subject, takeUntil } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth-backend.service';
import { trigger, transition, style, animate } from '@angular/animations';

interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  type: 'text' | 'admin';
  showMeetAdmin?: boolean;
  intent?: string;
}

interface IntentPattern {
  intent: string;
  keywords: string[];
  examples: string[];
}

const INTENT_PATTERNS: IntentPattern[] = [
  {
    intent: 'course_search',
    keywords: ['show courses', 'find course', 'list courses', 'browse courses', 'available courses', 'search course'],
    examples: ['Show AI courses', 'Which courses are available?', 'Find Python courses']
  },
  {
    intent: 'course_recommendation',
    keywords: ['recommend', 'suggest course', 'what should i learn', 'best course', 'next course', 'which course'],
    examples: ['Suggest next course', 'What should I learn after Python?', 'Best course for me']
  },
  {
    intent: 'plan_create',
    keywords: ['create plan', 'make plan', 'schedule', 'study plan', 'weekly plan', 'monthly plan'],
    examples: ['Make me a 4-week AI plan', 'Create study schedule', 'Plan my week']
  },
  {
    intent: 'plan_update',
    keywords: ['update plan', 'reschedule', 'missed lesson', 'change schedule', 'modify plan'],
    examples: ['I missed yesterday\'s lesson', 'Reschedule my tasks', 'Update my plan']
  },
  {
    intent: 'progress_check',
    keywords: ['progress', 'completion', 'how much completed', 'my status', 'track progress'],
    examples: ['How much I\'ve completed?', 'My progress in ML', 'Show my progress']
  },
  {
    intent: 'quiz_help',
    keywords: ['quiz', 'test me', 'questions', 'practice', 'exam', 'assessment'],
    examples: ['Give me a quiz on JavaScript', 'Test my knowledge', 'Quiz questions']
  },
  {
    intent: 'feedback',
    keywords: ['feedback', 'performance', 'how am i doing', 'improvement', 'tips', 'weak areas'],
    examples: ['How was my performance?', 'Give me improvement tips', 'My weak areas']
  },
  {
    intent: 'motivation',
    keywords: ['motivate', 'encourage', 'badge', 'achievement', 'inspire me', 'boost'],
    examples: ['Motivate me', 'Give me a badge update', 'I need encouragement']
  },
  {
    intent: 'general_help',
    keywords: ['help', 'how to', 'what is', 'explain', 'faq', 'guide', 'tutorial'],
    examples: ['How to enroll in a course?', 'What is AI Planner?', 'Help me']
  }
];

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTooltipModule
  ],
  animations: [
    trigger('messageAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ],
  template: `
    <div class="chat-container">
      <!-- Animated Background -->
      <div class="animated-bg">
        <div class="gradient-orb orb-1"></div>
        <div class="gradient-orb orb-2"></div>
        <div class="gradient-orb orb-3"></div>
        <div class="gradient-orb orb-4"></div>
      </div>

      <div class="chat-wrapper">
        <!-- Modern Header with Glassmorphism -->
        <div class="chat-header">
          <div class="header-content">
            <div class="ai-avatar-large">
              <span class="avatar-emoji">🤖</span>
              <span class="status-dot"></span>
            </div>
            <div class="header-text">
              <h1 class="header-title">AI Study Assistant</h1>
              <p class="header-subtitle">
                <span class="status-indicator">●</span>
                Online - Ready to help you learn!
              </p>
            </div>
          </div>
        </div>

        <!-- Chat Messages Area -->
        <div class="chat-messages" #chatContainer>
          <!-- Welcome Screen -->
          <div *ngIf="messages().length === 0" class="welcome-screen">
            <div class="welcome-content">
              <div class="welcome-avatar">
                <span class="welcome-emoji">🎓</span>
              </div>
              <h2 class="welcome-title">Welcome to Your AI Study Companion!</h2>
              <p class="welcome-text">
                I'm your smart AI Study Assistant. I can help you find courses, create study plans, track progress, generate quizzes, and much more!
              </p>
              
              <!-- Quick Action Cards -->
              <div class="quick-actions">
                <button class="quick-action-card" (click)="sendQuickPrompt('Show me available AI courses')">
                  <span class="action-icon">📚</span>
                  <span class="action-text">Find Courses</span>
                </button>
                <button class="quick-action-card" (click)="sendQuickPrompt('Create a study plan for me')">
                  <span class="action-icon">�</span>
                  <span class="action-text">Create Plan</span>
                </button>
                <button class="quick-action-card" (click)="sendQuickPrompt('Show my progress')">
                  <span class="action-icon">📊</span>
                  <span class="action-text">My Progress</span>
                </button>
                <button class="quick-action-card" (click)="sendQuickPrompt('Give me a quiz')">
                  <span class="action-icon">🎯</span>
                  <span class="action-text">Take Quiz</span>
                </button>
                <button class="quick-action-card" (click)="sendQuickPrompt('Suggest what to learn next')">
                  <span class="action-icon">🤔</span>
                  <span class="action-text">Recommendations</span>
                </button>
                <button class="quick-action-card" (click)="sendQuickPrompt('Motivate me to study')">
                  <span class="action-icon">⭐</span>
                  <span class="action-text">Motivation</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Messages -->
          <div *ngIf="messages().length > 0" class="messages-list">
            <div *ngFor="let message of messages(); let i = index" 
                 class="message-wrapper"
                 [@messageAnimation]>
              
              <!-- User Message -->
              <div *ngIf="message.sender === 'user'" class="message user-message">
                <div class="message-bubble user-bubble">
                  <!-- Intent Badge -->
                  <div *ngIf="message.intent" class="intent-badge">
                    <span class="intent-icon">{{ getIntentIcon(message.intent) }}</span>
                    <span class="intent-text">{{ getIntentLabel(message.intent) }}</span>
                  </div>
                  <p class="message-text">{{ removeMarkdown(message.content) }}</p>
                  <span class="message-time">{{ formatTime(message.timestamp) }}</span>
                </div>
                <div class="user-avatar">
                  <span class="avatar-icon">👤</span>
                </div>
              </div>

              <!-- AI Message -->
              <div *ngIf="message.sender === 'ai'" class="message ai-message">
                <div class="ai-avatar">
                  <span class="avatar-emoji">🤖</span>
                </div>
                <div class="message-bubble ai-bubble">
                  <p class="message-text">{{ removeMarkdown(message.content) }}</p>
                  
                  <!-- Meet Admin Button -->
                  <div *ngIf="message.showMeetAdmin" class="admin-action">
                    <button mat-raised-button class="admin-button" (click)="contactAdmin()">
                      <mat-icon>support_agent</mat-icon>
                      <span>Contact Support</span>
                    </button>
                  </div>
                  
                  <span class="message-time">{{ formatTime(message.timestamp) }}</span>
                </div>
              </div>
            </div>

            <!-- Typing Indicator -->
            <div *ngIf="isTyping()" class="message ai-message" [@messageAnimation]>
              <div class="ai-avatar">
                <span class="avatar-emoji">🤖</span>
              </div>
              <div class="message-bubble ai-bubble typing-bubble">
                <div class="typing-indicator">
                  <span class="typing-dot"></span>
                  <span class="typing-dot"></span>
                  <span class="typing-dot"></span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Modern Input Area -->
        <div class="chat-input-area">
          <form (ngSubmit)="sendMessage()" class="input-form">
            <div class="input-wrapper">
              <button type="button" 
                      mat-icon-button 
                      class="attach-button"
                      matTooltip="Attach file">
                <mat-icon>attach_file</mat-icon>
              </button>
              
              <textarea class="message-input"
                       [formControl]="messageControl"
                       rows="1"
                       placeholder="Type your message here..."
                       (keydown)="onEnterKey($event)"
                       #messageInput></textarea>
              
              <button type="submit" 
                      class="send-button"
                      [disabled]="messageControl.invalid || isTyping()"
                      [class.sending]="isTyping()">
                <mat-icon *ngIf="!isTyping()">send</mat-icon>
                <mat-spinner *ngIf="isTyping()" diameter="24"></mat-spinner>
              </button>
            </div>
            
            <!-- Suggestions Pills (only show when empty) -->
            <div *ngIf="!messageControl.value" class="suggestion-pills">
              <button type="button" 
                      class="suggestion-pill" 
                      *ngFor="let suggestion of suggestions"
                      (click)="sendQuickPrompt(suggestion)">
                {{ suggestion }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .chat-container {
      position: relative;
      width: 100%;
      height: 100vh;
      overflow: hidden;
    }

    /* Animated Background */
    .animated-bg {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;
      z-index: 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      pointer-events: none;
    }

    .gradient-orb {
      position: absolute;
      border-radius: 50%;
      filter: blur(20px);
      opacity: 0.85;
      animation: float 15s ease-in-out infinite;
      will-change: transform;
      pointer-events: none;
      mix-blend-mode: screen;
    }

    .orb-1 {
      width: 300px;
      height: 300px;
      background: radial-gradient(circle, rgba(240, 147, 251, 0.9) 0%, rgba(245, 87, 108, 0.8) 100%);
      top: 15%;
      left: 15%;
      animation-delay: 0s;
    }

    .orb-2 {
      width: 350px;
      height: 350px;
      background: radial-gradient(circle, rgba(79, 172, 254, 0.9) 0%, rgba(0, 242, 254, 0.8) 100%);
      bottom: 15%;
      right: 15%;
      animation-delay: 5s;
    }

    .orb-3 {
      width: 280px;
      height: 280px;
      background: radial-gradient(circle, rgba(67, 233, 123, 0.9) 0%, rgba(56, 249, 215, 0.8) 100%);
      top: 45%;
      left: 35%;
      animation-delay: 10s;
    }

    .orb-4 {
      width: 300px;
      height: 300px;
      background: radial-gradient(circle, rgba(250, 112, 154, 0.9) 0%, rgba(254, 225, 64, 0.8) 100%);
      top: 25%;
      right: 25%;
      animation-delay: 7s;
    }

    @keyframes float {
      0%, 100% { 
        transform: translate(0, 0) scale(1);
        opacity: 0.7;
      }
      25% { 
        transform: translate(30px, -40px) scale(1.1);
        opacity: 0.9;
      }
      50% { 
        transform: translate(-20px, 20px) scale(0.95);
        opacity: 0.8;
      }
      75% { 
        transform: translate(40px, 30px) scale(1.05);
        opacity: 0.85;
      }
    }

    /* Chat Wrapper */
    .chat-wrapper {
      position: relative;
      z-index: 1;
      max-width: 1200px;
      margin: 0 auto;
      height: 100vh;
      display: flex;
      flex-direction: column;
      padding: 20px;
    }

    /* Header with Glassmorphism */
    .chat-header {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(20px);
      border-radius: 24px 24px 0 0;
      border: 1px solid rgba(255, 255, 255, 0.2);
      padding: 24px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    }

    .header-content {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .ai-avatar-large {
      position: relative;
      width: 60px;
      height: 60px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
      animation: pulse 2s ease-in-out infinite;
    }

    @keyframes pulse {
      0%, 100% { box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4); }
      50% { box-shadow: 0 8px 32px rgba(102, 126, 234, 0.6); }
    }

    .avatar-emoji {
      font-size: 32px;
    }

    .status-dot {
      position: absolute;
      bottom: 2px;
      right: 2px;
      width: 14px;
      height: 14px;
      background: #4ade80;
      border: 3px solid white;
      border-radius: 50%;
      animation: blink 2s ease-in-out infinite;
    }

    @keyframes blink {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }

    .header-text {
      flex: 1;
    }

    .header-title {
      font-size: 24px;
      font-weight: 700;
      color: white;
      margin: 0;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .header-subtitle {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.9);
      margin: 4px 0 0 0;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .status-indicator {
      color: #4ade80;
      font-size: 12px;
      animation: blink 2s ease-in-out infinite;
    }

    /* Messages Area */
    .chat-messages {
      flex: 1;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border-left: 1px solid rgba(255, 255, 255, 0.2);
      border-right: 1px solid rgba(255, 255, 255, 0.2);
      overflow-y: auto;
      overflow-x: hidden;
      padding: 24px;
      scroll-behavior: smooth;
    }

    /* Welcome Screen */
    .welcome-screen {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
    }

    .welcome-content {
      text-align: center;
      max-width: 600px;
    }

    .welcome-avatar {
      width: 120px;
      height: 120px;
      margin: 0 auto 24px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 20px 60px rgba(102, 126, 234, 0.3);
      animation: bounce 2s ease-in-out infinite;
    }

    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }

    .welcome-emoji {
      font-size: 60px;
    }

    .welcome-title {
      font-size: 32px;
      font-weight: 700;
      color: #1f2937;
      margin: 0 0 16px 0;
    }

    .welcome-text {
      font-size: 16px;
      color: #6b7280;
      margin: 0 0 32px 0;
      line-height: 1.6;
    }

    /* Quick Actions */
    .quick-actions {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 16px;
    }

    .quick-action-card {
      background: white;
      border: 2px solid #e5e7eb;
      border-radius: 16px;
      padding: 20px;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
    }

    .quick-action-card:hover {
      border-color: #667eea;
      transform: translateY(-4px);
      box-shadow: 0 12px 24px rgba(102, 126, 234, 0.2);
    }

    .action-icon {
      font-size: 40px;
    }

    .action-text {
      font-size: 14px;
      font-weight: 600;
      color: #374151;
    }

    /* Messages List */
    .messages-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .message {
      display: flex;
      gap: 12px;
      animation: slideIn 0.3s ease-out;
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .user-message {
      flex-direction: row-reverse;
    }

    .ai-message {
      flex-direction: row;
    }

    /* Avatars */
    .ai-avatar, .user-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .ai-avatar {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    }

    .user-avatar {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      box-shadow: 0 4px 12px rgba(245, 87, 108, 0.3);
    }

    .avatar-icon {
      font-size: 24px;
    }

    /* Message Bubbles */
    .message-bubble {
      max-width: 70%;
      padding: 16px 20px;
      border-radius: 20px;
      position: relative;
    }

    /* Intent Badge */
    .intent-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(10px);
      border-radius: 12px;
      padding: 4px 10px;
      margin-bottom: 8px;
      font-size: 11px;
      font-weight: 600;
      opacity: 0.9;
    }

    .user-bubble .intent-badge {
      background: rgba(255, 255, 255, 0.25);
      color: rgba(255, 255, 255, 0.95);
    }

    .ai-bubble .intent-badge {
      background: rgba(102, 126, 234, 0.1);
      color: #667eea;
    }

    .intent-icon {
      font-size: 14px;
      line-height: 1;
    }

    .intent-text {
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .user-bubble {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-bottom-right-radius: 4px;
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    }

    .ai-bubble {
      background: white;
      color: #1f2937;
      border-bottom-left-radius: 4px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
      border: 1px solid #e5e7eb;
    }

    .message-text {
      margin: 0;
      line-height: 1.6;
      white-space: pre-wrap;
      word-wrap: break-word;
    }

    .message-time {
      display: block;
      font-size: 11px;
      margin-top: 8px;
      opacity: 0.7;
    }

    /* Admin Button */
    .admin-action {
      margin-top: 12px;
    }

    .admin-button {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%) !important;
      color: white !important;
      border-radius: 12px !important;
      padding: 8px 16px !important;
      font-weight: 600 !important;
      transition: all 0.3s ease !important;
    }

    .admin-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 16px rgba(245, 87, 108, 0.3) !important;
    }

    /* Typing Indicator */
    .typing-bubble {
      padding: 16px 24px !important;
    }

    .typing-indicator {
      display: flex;
      gap: 6px;
    }

    .typing-dot {
      width: 8px;
      height: 8px;
      background: #667eea;
      border-radius: 50%;
      animation: typing 1.4s ease-in-out infinite;
    }

    .typing-dot:nth-child(2) {
      animation-delay: 0.2s;
    }

    .typing-dot:nth-child(3) {
      animation-delay: 0.4s;
    }

    @keyframes typing {
      0%, 60%, 100% { transform: translateY(0); }
      30% { transform: translateY(-10px); }
    }

    /* Input Area */
    .chat-input-area {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border-radius: 0 0 24px 24px;
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-top: none;
      padding: 20px;
      box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.06);
    }

    .input-form {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .input-wrapper {
      display: flex;
      align-items: flex-end;
      gap: 12px;
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 24px;
      padding: 8px 12px;
      transition: all 0.3s ease;
    }

    .input-wrapper:focus-within {
      border-color: #667eea;
      box-shadow: none;
    }

    .attach-button {
      color: #6b7280;
    }

    .message-input {
      flex: 1;
      border: none !important;
      outline: none !important;
      resize: none;
      font-size: 15px;
      line-height: 1.6;
      padding: 8px;
      max-height: 120px;
      font-family: inherit;
      color: #000;
      font-weight: 500;
      box-shadow: none !important;
    }

    .message-input::placeholder {
      color: #9ca3af;
    }

    .send-button {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      border: none;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    }

    .send-button:hover:not(:disabled) {
      transform: scale(1.1);
      box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
    }

    .send-button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .send-button.sending {
      animation: rotate 1s linear infinite;
    }

    @keyframes rotate {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    /* Suggestion Pills */
    .suggestion-pills {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .suggestion-pill {
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 20px;
      padding: 8px 16px;
      font-size: 13px;
      color: #6b7280;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .suggestion-pill:hover {
      border-color: #667eea;
      color: #667eea;
      background: rgba(102, 126, 234, 0.05);
    }

    /* Scrollbar Styling */
    .chat-messages::-webkit-scrollbar {
      width: 8px;
    }

    .chat-messages::-webkit-scrollbar-track {
      background: transparent;
    }

    .chat-messages::-webkit-scrollbar-thumb {
      background: rgba(102, 126, 234, 0.3);
      border-radius: 4px;
    }

    .chat-messages::-webkit-scrollbar-thumb:hover {
      background: rgba(102, 126, 234, 0.5);
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .chat-wrapper {
        padding: 0;
      }

      .chat-header {
        border-radius: 0;
        padding: 16px;
      }

      .chat-messages {
        padding: 16px;
      }

      .chat-input-area {
        border-radius: 0;
        padding: 16px;
      }

      .message-bubble {
        max-width: 85%;
      }

      .quick-actions {
        grid-template-columns: repeat(2, 1fr);
      }

      .header-title {
        font-size: 20px;
      }

      .ai-avatar-large {
        width: 50px;
        height: 50px;
      }

      .avatar-emoji {
        font-size: 26px;
      }
    }
  `]
})
export class ChatComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('chatContainer') private chatContainer!: ElementRef;
  @ViewChild('messageInput') private messageInput!: ElementRef;

  private destroy$ = new Subject<void>();
  private snackBar = inject(MatSnackBar);
  private apiService = inject(ApiService);
  private authService = inject(AuthService);
  private shouldScrollToBottom = false;

  // Signals for reactive state management
  messages = signal<ChatMessage[]>([]);
  isTyping = signal<boolean>(false);

  messageControl = new FormControl('', [Validators.required]);

  // Quick suggestion pills - contextual based on intent
  suggestions = [
    'Show available courses',
    'My progress status',
    'Create study plan',
    'Give me a quiz'
  ];

  ngOnInit() {
    // Auto-focus on input
    setTimeout(() => {
      if (this.messageInput) {
        this.messageInput.nativeElement.focus();
      }
    }, 500);
    
    // Add welcome message
    this.addWelcomeMessage();
  }

  addWelcomeMessage() {
    const welcomeMsg: ChatMessage = {
      id: 'welcome_' + Date.now(),
      content: `👋 Hello! I'm your AI Study Assistant for the Course Planner System.\n\n🎯 I can help you with:\n• Finding & recommending courses\n• Creating personalized study plans\n• Tracking your progress\n• Generating quizzes & tests\n• Providing motivation & tips\n• Answering any study-related questions\n\nWhat would you like to do today?`,
      sender: 'ai',
      timestamp: new Date(),
      type: 'text'
    };
    this.messages.set([welcomeMsg]);
  }

  /**
   * Remove markdown formatting (** for bold) from text
   */
  removeMarkdown(text: string): string {
    if (!text) return '';
    return text.replace(/\*\*/g, '');
  }

  /**
   * Detect user intent from message
   */
  detectIntent(message: string): string {
    const lowerMessage = message.toLowerCase();
    
    for (const pattern of INTENT_PATTERNS) {
      for (const keyword of pattern.keywords) {
        if (lowerMessage.includes(keyword.toLowerCase())) {
          return pattern.intent;
        }
      }
    }
    
    return 'general_help';
  }

  /**
   * Get contextual response based on intent
   */
  getContextualPrompt(intent: string): string {
    const prompts: { [key: string]: string } = {
      'course_search': 'I want to find courses',
      'course_recommendation': 'Suggest courses for me based on my interests',
      'plan_create': 'Help me create a personalized study plan',
      'plan_update': 'I need to update my study schedule',
      'progress_check': 'Show me my learning progress',
      'quiz_help': 'Generate a quiz to test my knowledge',
      'feedback': 'Give me feedback on my performance',
      'motivation': 'I need some motivation to continue learning',
      'general_help': 'Help me understand how to use the platform'
    };
    
    return prompts[intent] || 'General study assistance';
  }

  ngAfterViewChecked() {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  scrollToBottom(): void {
    try {
      if (this.chatContainer) {
        this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
      }
    } catch (err) {
      console.error('Error scrolling to bottom:', err);
    }
  }

  sendMessage() {
    if (this.messageControl.invalid || this.isTyping()) {
      return;
    }

    const messageText = this.messageControl.value?.trim();
    if (!messageText) return;

    // Detect intent from user message
    const detectedIntent = this.detectIntent(messageText);
    const contextualPrompt = this.getContextualPrompt(detectedIntent);

    // Add user message with intent
    const userMessage: ChatMessage = {
      id: 'user_' + Date.now(),
      content: messageText,
      sender: 'user',
      timestamp: new Date(),
      type: 'text',
      intent: detectedIntent
    };

    this.messages.update(msgs => [...msgs, userMessage]);
    this.messageControl.setValue('');
    this.shouldScrollToBottom = true;
    this.isTyping.set(true);

    // Log detected intent for debugging
    console.log(`🧠 Detected Intent: ${detectedIntent}`);
    console.log(`📝 Contextual Prompt: ${contextualPrompt}`);

    // Get actual logged-in user ID
    const userId = this.authService.getCurrentUserId() || undefined;
    console.log(`👤 User ID: ${userId}`);

    // Send to AI service with detected intent and context
    this.apiService.sendAIMessage(messageText, contextualPrompt, userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.isTyping.set(false);
          
          const aiMessage: ChatMessage = {
            id: 'ai_' + Date.now(),
            content: response.data.response,
            sender: 'ai',
            timestamp: new Date(),
            type: response.data.showMeetAdmin ? 'admin' : 'text',
            showMeetAdmin: response.data.showMeetAdmin,
            intent: detectedIntent
          };

          this.messages.update(msgs => [...msgs, aiMessage]);
          this.shouldScrollToBottom = true;
          
          // Update suggestions based on last intent
          this.updateSuggestions(detectedIntent);
        },
        error: (error: any) => {
          this.isTyping.set(false);
          console.error('Error sending message:', error);
          
          const errorMessage: ChatMessage = {
            id: 'error_' + Date.now(),
            content: '😔 Sorry, I encountered an error. Please try again or contact support.',
            sender: 'ai',
            timestamp: new Date(),
            type: 'text'
          };

          this.messages.update(msgs => [...msgs, errorMessage]);
          this.shouldScrollToBottom = true;
        }
      });
  }

  /**
   * Update suggestion pills based on conversation context
   */
  updateSuggestions(lastIntent: string) {
    const suggestionMap: { [key: string]: string[] } = {
      'course_search': ['Recommend courses for me', 'Create study plan', 'Show my progress'],
      'course_recommendation': ['Show course details', 'Enroll in course', 'Create plan'],
      'plan_create': ['View my plan', 'Update schedule', 'Set reminders'],
      'plan_update': ['Show updated plan', 'My progress', 'Upcoming tasks'],
      'progress_check': ['Show weak areas', 'Take a quiz', 'Get improvement tips'],
      'quiz_help': ['Show results', 'Explain answers', 'Take another quiz'],
      'feedback': ['Show my badges', 'Motivate me', 'Set new goals'],
      'motivation': ['Continue learning', 'Take quiz', 'View achievements'],
      'general_help': ['Show courses', 'Create plan', 'Check progress']
    };

    this.suggestions = suggestionMap[lastIntent] || [
      'Show available courses',
      'My progress status',
      'Create study plan',
      'Give me a quiz'
    ];
  }

  sendQuickPrompt(prompt: string) {
    this.messageControl.setValue(prompt);
    this.sendMessage();
  }

  onEnterKey(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  contactAdmin() {
    this.snackBar.open(
      '💬 Connecting you to support team... This feature will open a live chat with our admin.',
      'Close',
      { 
        duration: 5000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: ['modern-snackbar']
      }
    );
  }

  formatTime(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(date);
  }

  /**
   * Get icon for detected intent
   */
  getIntentIcon(intent: string): string {
    const iconMap: { [key: string]: string } = {
      'course_search': '🔍',
      'course_recommendation': '💡',
      'plan_create': '📅',
      'plan_update': '🔄',
      'progress_check': '📊',
      'quiz_help': '🎯',
      'feedback': '📈',
      'motivation': '⭐',
      'general_help': '❓'
    };
    return iconMap[intent] || '💬';
  }

  /**
   * Get label for detected intent
   */
  getIntentLabel(intent: string): string {
    const labelMap: { [key: string]: string } = {
      'course_search': 'Course Search',
      'course_recommendation': 'Recommendation',
      'plan_create': 'Create Plan',
      'plan_update': 'Update Plan',
      'progress_check': 'Progress',
      'quiz_help': 'Quiz',
      'feedback': 'Feedback',
      'motivation': 'Motivation',
      'general_help': 'Help'
    };
    return labelMap[intent] || 'General';
  }
}