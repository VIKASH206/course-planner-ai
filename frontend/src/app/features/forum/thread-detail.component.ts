import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { ApiService } from '../../core/services/api.service';
import { NotificationService } from '../../core/services/notification.service';
import { AuthService } from '../../core/services/auth-backend.service';

interface ThreadReply {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  authorRole: 'student' | 'instructor' | 'moderator' | 'admin';
  threadId: string;
  createdAt: Date;
  updatedAt: Date;
  upvotes: number;
  upvotedBy: string[];
  isAccepted: boolean;
}

interface ForumThread {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  authorRole: 'student' | 'instructor' | 'moderator' | 'admin';
  groupId: string;
  createdAt: Date;
  updatedAt: Date;
  replyCount: number;
  viewCount: number;
  isPinned: boolean;
  isLocked: boolean;
  tags: string[];
  lastReplyAuthor?: string;
  lastReplyTimestamp?: Date;
}

@Component({
  selector: 'app-thread-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatBadgeModule
  ],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4">
      <div class="max-w-5xl mx-auto">
        
        <!-- Back Button -->
        <button (click)="goBack()" class="mb-4 px-4 py-2 bg-white text-purple-600 border border-purple-600 rounded-lg hover:bg-purple-50 transition-all flex items-center gap-2 shadow">
          <mat-icon>arrow_back</mat-icon>
          Back to Forum
        </button>

        @if (loading()) {
          <div class="flex justify-center items-center py-20">
            <mat-spinner diameter="50"></mat-spinner>
          </div>
        } @else if (thread()) {
          <!-- Thread Header -->
          <div class="bg-white rounded-lg shadow-lg p-6 mb-6 border-l-4 border-purple-600">
            <div class="flex items-start gap-4 mb-4">
              <div class="w-16 h-16 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center flex-shrink-0">
                @if (thread()!.authorAvatar) {
                  <img [src]="thread()!.authorAvatar" [alt]="thread()!.authorName" class="w-full h-full rounded-full object-cover">
                } @else {
                  <span class="text-white font-bold text-lg">{{ getInitials(thread()!.authorName) }}</span>
                }
              </div>
              
              <div class="flex-1">
                <h1 class="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{{ thread()!.title }}</h1>
                
                <div class="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                  <div class="flex items-center gap-2">
                    <span class="font-semibold">{{ thread()!.authorName }}</span>
                    <span [class]="getRoleClass(thread()!.authorRole)" class="px-2 py-1 text-xs font-medium rounded">
                      {{ thread()!.authorRole }}
                    </span>
                  </div>
                  <span>•</span>
                  <span>{{ formatTime(thread()!.createdAt) }}</span>
                  <span>•</span>
                  <span>👁️ {{ thread()!.viewCount }} views</span>
                  <span>•</span>
                  <span>💬 {{ replies().length }} replies</span>
                </div>
              </div>
            </div>

            <!-- Thread Content -->
            <div class="prose max-w-none mb-4">
              <p class="text-gray-700 whitespace-pre-wrap">{{ thread()!.content }}</p>
            </div>

            <!-- Thread Tags -->
            @if (thread()!.tags && thread()!.tags.length > 0) {
              <div class="flex flex-wrap gap-2 mt-4">
                @for (tag of thread()!.tags; track tag) {
                  <span class="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                    #{{ tag }}
                  </span>
                }
              </div>
            }
          </div>

          <!-- Replies Section -->
          <div class="bg-white rounded-lg shadow-lg p-6">
            <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <mat-icon class="text-purple-600">forum</mat-icon>
              Replies ({{ replies().length }})
            </h2>

            <!-- Reply Form -->
            @if (!thread()!.isLocked) {
              <div class="mb-6 p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border-2 border-purple-300 shadow-lg">
                <h3 class="text-lg font-bold text-purple-900 mb-4 flex items-center gap-2">
                  <span class="text-2xl">💬</span>
                  Write your reply
                </h3>
                <form [formGroup]="replyForm" (ngSubmit)="submitReply()">
                  <div class="mb-4">
                    <textarea 
                      formControlName="content" 
                      rows="6" 
                      placeholder="Share your thoughts, answer questions, or provide helpful insights..."
                      class="w-full px-4 py-3 border-2 border-purple-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none resize-none text-gray-800 placeholder-gray-400 bg-white shadow-sm transition-all"
                      [class.border-red-500]="replyForm.get('content')?.hasError('required') && replyForm.get('content')?.touched">
                    </textarea>
                    @if (replyForm.get('content')?.hasError('required') && replyForm.get('content')?.touched) {
                      <p class="text-red-600 text-sm mt-1 flex items-center gap-1">
                        <mat-icon class="text-sm">error</mat-icon>
                        Reply content is required
                      </p>
                    }
                    @if (replyForm.get('content')?.hasError('minlength')) {
                      <p class="text-orange-600 text-sm mt-1 flex items-center gap-1">
                        <mat-icon class="text-sm">warning</mat-icon>
                        Reply must be at least 10 characters
                      </p>
                    }
                  </div>
                  
                  <div class="flex justify-between items-center">
                    <p class="text-sm text-gray-600">
                      <span class="font-semibold">Tip:</span> Be respectful and helpful in your replies
                    </p>
                    <div class="flex gap-3">
                      <button type="button" 
                              (click)="replyForm.reset()"
                              class="px-5 py-2.5 bg-white text-gray-700 border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all font-semibold shadow">
                        <span class="flex items-center gap-2">
                          <mat-icon class="text-lg">clear</mat-icon>
                          Clear
                        </span>
                      </button>
                      <button type="submit" 
                              [disabled]="replyForm.invalid || submittingReply()"
                              class="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all font-semibold shadow-lg transform hover:scale-105 disabled:transform-none">
                        <span class="flex items-center gap-2">
                          @if (submittingReply()) {
                            <mat-icon class="animate-spin text-lg">refresh</mat-icon>
                            Posting...
                          } @else {
                            <mat-icon class="text-lg">send</mat-icon>
                            Post Reply
                          }
                        </span>
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            } @else {
              <div class="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200 flex items-center gap-3">
                <mat-icon class="text-yellow-600">lock</mat-icon>
                <p class="text-yellow-800 font-medium">This thread is locked. No new replies can be added.</p>
              </div>
            }

            <!-- Replies List -->
            @if (replies().length > 0) {
              <div class="space-y-4">
                @for (reply of replies(); track reply.id) {
                  <div class="border-l-4 p-4 rounded-lg transition-all hover:shadow-md"
                       [class]="reply.isAccepted ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-gray-50'">
                    
                    <!-- Reply Header -->
                    <div class="flex items-start gap-3 mb-3">
                      <div class="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 flex items-center justify-center flex-shrink-0">
                        @if (reply.authorAvatar) {
                          <img [src]="reply.authorAvatar" [alt]="reply.authorName" class="w-full h-full rounded-full object-cover">
                        } @else {
                          <span class="text-white font-bold text-sm">{{ getInitials(reply.authorName) }}</span>
                        }
                      </div>
                      
                      <div class="flex-1">
                        <div class="flex items-center gap-2 mb-1">
                          <span class="font-semibold text-gray-900">{{ reply.authorName }}</span>
                          <span [class]="getRoleClass(reply.authorRole)" class="px-2 py-1 text-xs font-medium rounded">
                            {{ reply.authorRole }}
                          </span>
                          @if (reply.isAccepted) {
                            <span class="px-2 py-1 bg-green-500 text-white text-xs font-medium rounded flex items-center gap-1">
                              <mat-icon class="text-sm">check_circle</mat-icon>
                              Accepted Answer
                            </span>
                          }
                        </div>
                        <span class="text-xs text-gray-500">{{ formatTime(reply.createdAt) }}</span>
                      </div>
                    </div>

                    <!-- Reply Content -->
                    <div class="mb-3 ml-13">
                      <p class="text-gray-700 whitespace-pre-wrap">{{ reply.content }}</p>
                    </div>

                    <!-- Reply Actions -->
                    <div class="flex items-center gap-4 ml-13">
                      <button 
                        (click)="upvoteReply(reply)"
                        [disabled]="isUpvoted(reply)"
                        class="flex items-center gap-1 px-3 py-1 rounded-lg transition-all"
                        [class]="isUpvoted(reply) ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-purple-100'">
                        <mat-icon class="text-sm">thumb_up</mat-icon>
                        <span class="text-sm font-medium">{{ reply.upvotes }}</span>
                      </button>
                      
                      @if (!reply.isAccepted && thread()!.authorId === currentUserId()) {
                        <button 
                          (click)="markAsAccepted(reply)"
                          class="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-all">
                          <mat-icon class="text-sm">check_circle</mat-icon>
                          <span class="text-sm font-medium">Mark as Answer</span>
                        </button>
                      }
                    </div>
                  </div>
                }
              </div>
            } @else {
              <div class="text-center py-12">
                <mat-icon class="text-6xl text-gray-300 mb-4">chat_bubble_outline</mat-icon>
                <p class="text-gray-500 font-medium">No replies yet</p>
                <p class="text-gray-400 text-sm">Be the first to share your thoughts!</p>
              </div>
            }
          </div>
        } @else {
          <div class="bg-white rounded-lg shadow-lg p-8 text-center">
            <mat-icon class="text-6xl text-gray-300 mb-4">error_outline</mat-icon>
            <h2 class="text-xl font-bold text-gray-700 mb-2">Thread Not Found</h2>
            <p class="text-gray-500 mb-4">The discussion thread you're looking for doesn't exist or has been removed.</p>
            <button mat-raised-button color="primary" (click)="goBack()">
              Back to Forum
            </button>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    .prose {
      max-width: none;
    }

    ::ng-deep .mat-mdc-form-field {
      width: 100%;
    }

    ::ng-deep .mat-mdc-text-field-wrapper {
      background-color: white;
    }

    .ml-13 {
      margin-left: 3.25rem;
    }

    @keyframes spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }

    .animate-spin {
      animation: spin 1s linear infinite;
    }
  `]
})
export class ThreadDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private apiService = inject(ApiService);
  private notificationService = inject(NotificationService);
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  thread = signal<ForumThread | null>(null);
  replies = signal<ThreadReply[]>([]);
  loading = signal(true);
  submittingReply = signal(false);
  currentUserId = computed(() => this.authService.currentUser()?.id || 'guest');
  currentUserName = computed(() => {
    const user = this.authService.currentUser();
    if (!user) return 'Guest User';
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.username || 'Guest User';
  });
  currentUserRole = computed(() => this.authService.currentUser()?.role || 'student');

  replyForm: FormGroup;

  constructor() {
    this.replyForm = this.fb.group({
      content: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  ngOnInit() {
    const threadId = this.route.snapshot.paramMap.get('id');
    if (threadId) {
      this.loadThread(threadId);
      this.loadReplies(threadId);
      this.incrementViewCount(threadId);
    } else {
      this.loading.set(false);
    }
  }

  private loadThread(threadId: string) {
    this.apiService.getForumThreadById(threadId).subscribe({
      next: (response: any) => {
        if (response.success && response.data) {
          this.thread.set(response.data);
        } else {
          this.thread.set(null);
        }
        this.loading.set(false);
      },
      error: (error: any) => {
        console.error('Error loading thread:', error);
        this.thread.set(null);
        this.loading.set(false);
        this.notificationService.showError('Failed to load thread');
      }
    });
  }

  private loadReplies(threadId: string) {
    this.apiService.getThreadReplies(threadId).subscribe({
      next: (response: any) => {
        if (response.success && response.data) {
          this.replies.set(response.data);
        }
      },
      error: (error: any) => {
        console.error('Error loading replies:', error);
        this.notificationService.showError('Failed to load replies');
      }
    });
  }

  private incrementViewCount(threadId: string) {
    this.apiService.incrementThreadViews(threadId).subscribe({
      next: () => {
        // View count incremented successfully
      },
      error: (error: any) => {
        console.error('Error incrementing view count:', error);
      }
    });
  }

  submitReply() {
    if (this.replyForm.invalid || !this.thread()) {
      return;
    }

    this.submittingReply.set(true);
    const replyData = {
      threadId: this.thread()!.id,
      content: this.replyForm.value.content,
      authorId: this.currentUserId(),
      authorName: this.currentUserName(),
      authorRole: this.currentUserRole()
    };

    this.apiService.createThreadReply(this.thread()!.id, replyData).subscribe({
      next: (response: any) => {
        if (response.success && response.data) {
          this.replies.update(replies => [...replies, response.data]);
          this.replyForm.reset();
          this.notificationService.showSuccess('Reply posted successfully!');
          
          // Update thread reply count
          if (this.thread()) {
            this.thread.update(t => t ? { ...t, replyCount: t.replyCount + 1 } : null);
          }
        }
        this.submittingReply.set(false);
      },
      error: (error: any) => {
        console.error('Error posting reply:', error);
        this.notificationService.showError('Failed to post reply');
        this.submittingReply.set(false);
      }
    });
  }

  upvoteReply(reply: ThreadReply) {
    if (this.isUpvoted(reply)) {
      return;
    }

    this.apiService.upvoteReply(reply.id, this.currentUserId()).subscribe({
      next: (response: any) => {
        if (response.success && response.data) {
          this.replies.update(replies => 
            replies.map(r => r.id === reply.id ? response.data : r)
          );
          this.notificationService.showSuccess('Reply upvoted!');
        }
      },
      error: (error: any) => {
        console.error('Error upvoting reply:', error);
        this.notificationService.showError('Failed to upvote reply');
      }
    });
  }

  markAsAccepted(reply: ThreadReply) {
    // TODO: Implement mark as accepted API call
    this.notificationService.showInfo('Mark as accepted feature coming soon!');
  }

  isUpvoted(reply: ThreadReply): boolean {
    return reply.upvotedBy.includes(this.currentUserId());
  }

  goBack() {
    this.router.navigate(['/forum']);
  }

  getInitials(name: string): string {
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  }

  getRoleClass(role: string): string {
    const classes = {
      'student': 'bg-blue-100 text-blue-800',
      'instructor': 'bg-green-100 text-green-800',
      'moderator': 'bg-purple-100 text-purple-800',
      'admin': 'bg-red-100 text-red-800'
    };
    return classes[role as keyof typeof classes] || 'bg-gray-100 text-gray-800';
  }

  formatTime(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  }
}
