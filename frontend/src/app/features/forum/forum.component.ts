import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatListModule } from '@angular/material/list';
import { MatToolbarModule } from '@angular/material/toolbar';
import { NotificationService } from '../../core/services/notification.service';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ApiService } from '../../core/services/api.service';
import { CreateGroupDialogComponent } from './create-group-dialog.component';
import { CreateThreadDialogComponent } from './create-thread-dialog.component';
import { AuthService } from '../../core/services/auth-backend.service';

interface ForumGroup {
  id: string;
  name: string;
  description: string;
  category: string;
  memberCount: number;
  threadCount: number;
  lastActivity: Date;
  isPrivate: boolean;
  moderators: string[];
  tags: string[];
  avatar?: string;
}

interface ForumThread {
  id: string;
  title: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
    role: 'student' | 'instructor' | 'moderator' | 'admin';
  };
  groupId: string;
  createdAt: Date;
  updatedAt: Date;
  replyCount: number;
  viewCount: number;
  isPinned: boolean;
  isLocked: boolean;
  tags: string[];
  lastReply?: {
    author: string;
    timestamp: Date;
  };
}

interface ForumReply {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
    role: 'student' | 'instructor' | 'moderator' | 'admin';
  };
  threadId: string;
  createdAt: Date;
  updatedAt: Date;
  likes: number;
  isAccepted: boolean;
  attachments: string[];
}

@Component({
  selector: 'app-forum',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatDividerModule,
    MatMenuModule,
    MatTooltipModule,
    MatBadgeModule,
    MatSnackBarModule,
    MatDialogModule,
    MatExpansionModule,
    MatListModule,
    MatToolbarModule,
    MatSidenavModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './forum.component.html',
  styleUrls: ['./forum.component.scss']
})
export class ForumComponent implements OnInit {
  private apiService = inject(ApiService);
  private snackBar = inject(MatSnackBar);
  private notificationService = inject(NotificationService);
  private dialog = inject(MatDialog);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);

  // Computed user properties
  currentUser = this.authService.currentUser;
  currentUserId = computed(() => this.currentUser()?.id || 'guest');

  // Signals for reactive state
  currentView = signal<'groups' | 'threads' | 'popular'>('groups');
  searchQuery = signal('');
  selectedCategory = signal<string>('All');
  selectedGroup = signal<ForumGroup | null>(null);
  sortBy = signal('recent');
  userReputation = signal(0);

  forumGroups = signal<ForumGroup[]>([]);

  forumThreads = signal<ForumThread[]>([]);

  categories = signal(['All', 'Programming', 'Data Science', 'Design', 'Business', 'Languages', 'Career']);

  // Computed properties
  filteredGroups = computed(() => {
    const groups = this.forumGroups();
    const category = this.selectedCategory();
    const query = this.searchQuery().toLowerCase();

    return groups.filter(group => {
      const matchesCategory = category === 'All' || group.category === category;
      const matchesSearch = !query || 
        group.name.toLowerCase().includes(query) || 
        group.description.toLowerCase().includes(query) ||
        group.tags.some(tag => tag.toLowerCase().includes(query));
      
      return matchesCategory && matchesSearch;
    });
  });

  filteredThreads = computed(() => {
    const threads = this.forumThreads();
    const query = this.searchQuery().toLowerCase();

    let filtered = threads.filter(thread => {
      return !query || 
        thread.title.toLowerCase().includes(query) || 
        thread.content.toLowerCase().includes(query) ||
        thread.tags.some(tag => tag.toLowerCase().includes(query));
    });

    // Sort threads
    const sortBy = this.sortBy();
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return b.viewCount - a.viewCount;
        case 'replies':
          return b.replyCount - a.replyCount;
        case 'views':
          return b.viewCount - a.viewCount;
        default: // recent
          return b.updatedAt.getTime() - a.updatedAt.getTime();
      }
    });

    return filtered;
  });

  myGroups = computed(() => {
    // Show only user's joined groups
    return this.forumGroups().filter(group => group.memberCount > 0); // Filter based on actual membership
  });

  ngOnInit() {
    this.loadForumData();
  }

  private loadForumData() {
    // Load forum groups from API
    this.apiService.getForumGroups().subscribe({
      next: (response: any) => {
        const groups = (response.data || []).map((group: any) => ({
          ...group,
          createdAt: group.createdAt ? new Date(group.createdAt) : new Date(),
          lastActivity: group.lastActivity ? new Date(group.lastActivity) : new Date(),
          updatedAt: group.updatedAt ? new Date(group.updatedAt) : new Date()
        }));
        this.forumGroups.set(groups);
      },
      error: (error: any) => {
        console.error('Error loading forum groups:', error);
      }
    });

    // Load forum threads from API
    this.apiService.getForumThreads().subscribe({
      next: (response: any) => {
        console.log('Forum threads response:', response);
        const threads = (response.data || []).map((thread: any) => ({
          ...thread,
          createdAt: thread.createdAt ? new Date(thread.createdAt) : new Date(),
          updatedAt: thread.updatedAt ? new Date(thread.updatedAt) : new Date(),
          // Map backend fields to frontend author object
          author: {
            id: thread.authorId || thread.author?.id || 'unknown',
            name: thread.authorName || thread.author?.name || 'Anonymous',
            role: thread.authorRole || thread.author?.role || 'student',
            avatar: thread.authorAvatar || thread.author?.avatar || ''
          }
        }));
        console.log('Processed threads:', threads);
        this.forumThreads.set(threads);
      },
      error: (error: any) => {
        console.error('Error loading forum threads:', error);
      }
    });

    // Load user reputation from API
    const userId = this.currentUserId();
    if (userId && userId !== 'guest') {
      this.apiService.getUserReputation(userId).subscribe({
        next: (response: any) => {
          console.log('User reputation response:', response);
          if (response.success && response.data) {
            this.userReputation.set(response.data.totalReputation || 0);
          }
        },
        error: (error: any) => {
          console.error('Error loading user reputation:', error);
          this.userReputation.set(0);
        }
      });
    }
  }

  setView(view: 'groups' | 'threads' | 'popular') {
    this.currentView.set(view);
  }

  selectCategory(category: string) {
    this.selectedCategory.set(category);
  }

  searchForum() {
    // Implementation for forum search
    const query = this.searchQuery();
    console.log('Searching for:', query);
  }

  createGroup() {
    const dialogRef = this.dialog.open(CreateGroupDialogComponent, {
      width: '600px',
      maxWidth: '90vw',
      disableClose: false,
      autoFocus: true,
      restoreFocus: true,
      panelClass: 'create-group-dialog-container',
      id: 'create-group-dialog-' + Date.now() // Unique ID for each dialog
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Creating group with data:', result);
        this.apiService.createForumGroup(result).subscribe({
          next: (response: any) => {
            console.log('✅ Group created successfully:', response);
            this.notificationService.showSuccess('Study group created successfully!', 3000);
            this.loadForumData(); // Refresh the list
          },
          error: (error: any) => {
            console.error('❌ Error creating group:', error);
            this.notificationService.showError('Failed to create group', 3000);
          }
        });
      }
    });
  }

  createThread() {
    const dialogRef = this.dialog.open(CreateThreadDialogComponent, {
      width: '650px',
      maxWidth: '90vw',
      disableClose: false,
      autoFocus: true,
      restoreFocus: true,
      panelClass: 'create-thread-dialog-container',
      id: 'create-thread-dialog-' + Date.now(),
      data: {
        groups: this.forumGroups(),
        selectedGroup: this.selectedGroup()
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Creating thread with data:', result);
        
        // Transform data to match backend model
        const threadData = {
          title: result.title,
          content: result.content,
          groupId: result.groupId,
          tags: result.tags || [],
          authorId: result.author?.id,
          authorName: result.author?.name,
          authorRole: result.author?.role,
          authorAvatar: result.author?.avatar
        };
        
        console.log('Sending thread data to backend:', threadData);
        
        this.apiService.createForumThread(threadData).subscribe({
          next: (response: any) => {
            console.log('✅ Thread created successfully:', response);
            this.notificationService.showSuccess('Discussion thread created successfully!', 3000);
            this.loadForumData(); // Refresh the list
          },
          error: (error: any) => {
            console.error('❌ Error creating thread:', error);
            this.notificationService.showError('Failed to create thread', 3000);
          }
        });
      }
    });
  }

  joinGroup(group?: ForumGroup) {
    // Implementation for joining a group
    const selectedGroup = group || this.selectedGroup();
    if (!selectedGroup) {
      this.notificationService.showWarning('Please select a group first', 3000);
      return;
    }
    
    const userId = this.currentUserId();
    const user = this.currentUser();
    const userName = user ? (user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.username) : 'User';
    
    if (userId === 'guest') {
      this.notificationService.showWarning('Please login to join groups', 3000);
      return;
    }
    
    this.apiService.joinGroup(selectedGroup.id, userId, userName).subscribe({
      next: (response: any) => {
        console.log('✅ Joined group successfully:', response);
        this.notificationService.showSuccess(`Joined ${selectedGroup.name} successfully!`, 3000);
        this.loadForumData(); // Refresh the data
      },
      error: (error: any) => {
        console.error('❌ Error joining group:', error);
        this.notificationService.showError('Failed to join group', 3000);
      }
    });
  }

  selectGroup(group: ForumGroup) {
    this.selectedGroup.set(group);
    // Navigate to group details or filter threads by group
    this.setView('threads');
  }

  openThread(thread: ForumThread) {
    // Navigate to thread detail page
    this.router.navigate(['/forum/thread', thread.id]);
  }

  onSortChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.sortBy.set(target.value);
  }

  sortThreads() {
    // Sorting is handled by computed property
  }

  getGroupInitials(name: string): string {
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
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
    return classes[role as keyof typeof classes] || classes.student;
  }

  getActiveThreadsCount(): number {
    return this.forumThreads().length;
  }

  getUserPostsCount(): number {
    // Count threads created by current user
    const userId = this.currentUserId();
    if (!userId || userId === 'guest') return 0;
    
    return this.forumThreads().filter(thread => 
      thread.author?.id === userId
    ).length;
  }

  formatTime(timestamp: Date | string | number): string {
    if (!timestamp) return 'Just now';
    
    // Convert to Date object if it's a string or number
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Just now';
    }
    
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
    return date.toLocaleDateString();
  }
}
