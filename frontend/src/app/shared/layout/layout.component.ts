import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, RouterModule } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { ThemeToggleComponent } from '../components/theme-toggle/theme-toggle.component';
import { FloatingChatButtonComponent } from '../components/floating-chat-button/floating-chat-button.component';
import { AuthService } from '../../core/services/auth-backend.service';

interface MenuItem {
  label: string;
  route: string;
  icon: string;
  badge?: number;
  isActive?: boolean;
}

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterModule,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatTooltipModule,
    ThemeToggleComponent,
    FloatingChatButtonComponent
  ],
  styles: [`
    .badge {
      background-color: #ff4444;
      color: white;
      border-radius: 12px;
      padding: 2px 6px;
      font-size: 11px;
      font-weight: bold;
      margin-left: auto;
      min-width: 18px;
      text-align: center;
    }
    
    .nav-item {
      display: flex !important;
      align-items: center !important;
    }
  `],
  template: `
    <div class="app-layout">
      <mat-sidenav-container class="sidenav-container">
        
        <!-- Sidebar -->
        <mat-sidenav 
          #drawer 
          class="sidenav"
          [mode]="isMobile() ? 'over' : 'side'"
          [opened]="!isMobile()"
          [fixedInViewport]="isMobile()"
          [class.mobile-sidenav]="isMobile()"
          [class.tablet-sidenav]="isTablet()"
          [class.small-phone-sidenav]="isSmallPhone()"
          fixedTopGap="0">
          
          <!-- Sidebar Header -->
          <div class="sidenav-header">
            <div class="logo-container">
              <div class="logo">
                <mat-icon class="logo-icon">school</mat-icon>
                <span class="logo-text">Course Planner AI</span>
              </div>
            </div>
          </div>

          <!-- Navigation Menu -->
          <nav class="nav-menu">
            <mat-nav-list>
              @for (item of menuItems(); track item.route) {
                <a mat-list-item 
                   [routerLink]="item.route" 
                   routerLinkActive="active-link"
                   class="nav-item"
                   [matTooltip]="isMobile() ? '' : item.label"
                   matTooltipPosition="right"
                   (click)="onMenuItemClick()">
                  <mat-icon matListItemIcon>
                    {{ item.icon }}
                  </mat-icon>
                  <span matListItemTitle>{{ item.label }}</span>
                  <span *ngIf="item.badge" class="badge">{{ item.badge }}</span>
                </a>
              }
              
              <!-- Browse Courses -->
              <a mat-list-item 
                 [routerLink]="['/browse-courses']" 
                 routerLinkActive="active-link"
                 class="nav-item"
                 [matTooltip]="isMobile() ? '' : 'Browse Courses'"
                 matTooltipPosition="right"
                 (click)="onMenuItemClick()">
                <mat-icon matListItemIcon>search</mat-icon>
                <span matListItemTitle>Browse Courses</span>
              </a>
              
              <!-- My Courses -->
              <a mat-list-item 
                 [routerLink]="['/my-courses']" 
                 routerLinkActive="active-link"
                 class="nav-item"
                 [matTooltip]="isMobile() ? '' : 'My Courses'"
                 matTooltipPosition="right"
                 (click)="onMenuItemClick()">
                <mat-icon matListItemIcon>bookmark</mat-icon>
                <span matListItemTitle>My Courses</span>
              </a>
            </mat-nav-list>
          </nav>

          <!-- Sidebar Footer -->
          <div class="sidenav-footer">
            <div class="user-info">
              <div class="user-avatar">
                <div class="avatar-circle">
                  <span class="avatar-text">{{ getUserInitials() }}</span>
                </div>
              </div>
              <div class="user-details" *ngIf="!isMobile()">
                <div class="user-name">{{ currentUser().name }}</div>
                <div class="user-level">Level {{ currentUser().level }}</div>
              </div>
            </div>
          </div>
        </mat-sidenav>

        <!-- Main Content -->
        <mat-sidenav-content class="main-content">
          
          <!-- Top Toolbar -->
          <mat-toolbar class="toolbar" color="primary">
            <button mat-icon-button 
                    (click)="drawer.toggle()"
                    class="menu-button">
              <mat-icon>menu</mat-icon>
            </button>
            
            <span class="toolbar-spacer"></span>
            
            <!-- Theme Toggle - Compact on mobile -->
            <app-theme-toggle 
              [showMenu]="!isSmallPhone()" 
              [variant]="isMobile() ? 'compact' : 'normal'">
            </app-theme-toggle>
            
            <!-- User Menu -->
            <button mat-icon-button 
                    [matMenuTriggerFor]="userMenu"
                    [class.mobile-icon-button]="isMobile()">
              <div class="toolbar-avatar" [class.mobile-avatar]="isMobile()">
                <span>{{ getUserInitials() }}</span>
              </div>
            </button>
            
            <mat-menu #userMenu="matMenu" class="user-dropdown">
              <a mat-menu-item routerLink="/profile">
                <mat-icon>person</mat-icon>
                <span>Profile</span>
              </a>
              <a mat-menu-item routerLink="/analytics">
                <mat-icon>analytics</mat-icon>
                <span>Analytics</span>
              </a>
              <mat-divider></mat-divider>
              <div class="theme-menu-item">
                <span class="menu-label">
                  <mat-icon>palette</mat-icon>
                  Theme
                </span>
                <app-theme-toggle [showMenu]="true" variant="compact"></app-theme-toggle>
              </div>
              <mat-divider></mat-divider>
              <button mat-menu-item (click)="logout()">
                <mat-icon>logout</mat-icon>
                <span>Logout</span>
              </button>
            </mat-menu>
          </mat-toolbar>

          <!-- Page Content -->
          <div class="page-content">
            <router-outlet></router-outlet>
          </div>
          
          <!-- Global Floating Chat Button (Available on all pages) -->
          <app-floating-chat-button></app-floating-chat-button>
        </mat-sidenav-content>
      </mat-sidenav-container>
    </div>
  `,
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent {
  private breakpointObserver = inject(BreakpointObserver);
  private router = inject(Router);
  private authService = inject(AuthService);

  // Responsive state
  isMobile = computed(() => {
    return this.breakpointObserver.isMatched(['(max-width: 768px)']);
  });

  isTablet = computed(() => {
    return this.breakpointObserver.isMatched(['(min-width: 769px) and (max-width: 1024px)']);
  });

  isSmallPhone = computed(() => {
    return this.breakpointObserver.isMatched(['(max-width: 480px)']);
  });

  isLandscape = computed(() => {
    return this.breakpointObserver.isMatched(['(orientation: landscape)']);
  });

  // Get current user from auth service
  currentUser = computed(() => {
    const user = this.authService.currentUser();
    if (user) {
      return {
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || 'User',
        level: user.level || 1,
        avatar: null,
        initials: this.authService.userInitials()
      };
    }
    return {
      name: 'Guest',
      level: 1,
      avatar: null,
      initials: 'G'
    };
  });

  // Navigation menu items
  menuItems = signal<MenuItem[]>([
    {
      label: 'Dashboard',
      route: '/dashboard',
      icon: 'dashboard'
    },
    {
      label: 'Courses',
      route: '/courses',
      icon: 'school'
    },
    {
      label: 'Tasks & Calendar',
      route: '/tasks',
      icon: 'assignment'
    },
    {
      label: 'AI Chat',
      route: '/chat',
      icon: 'chat'
    },
    {
      label: 'Forum',
      route: '/forum',
      icon: 'forum'
    },
    {
      label: 'Analytics',
      route: '/analytics',
      icon: 'analytics'
    },
    {
      label: 'Gamification',
      route: '/gamification',
      icon: 'emoji_events'
    },
    {
      label: 'Profile',
      route: '/profile',
      icon: 'person'
    }
  ]);

  onMenuItemClick() {
    // Close mobile menu when item clicked
    if (this.isMobile()) {
      // The drawer will be closed automatically
    }
  }

  getUserInitials(): string {
    const name = this.currentUser().name;
    return name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  }

  clearAuth() {
    console.log('🚨 Layout clearAuth called - using nuclear logout');
    this.authService.logout();
  }

  logout() {
    console.log('🚨 Layout logout called - using nuclear logout');
    // Use the nuclear logout function
    try {
      localStorage.clear();
      sessionStorage.clear();
      
      // Clear cookies
      document.cookie.split(";").forEach(function(c) { 
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
      });
      
      console.log('☢️ Nuclear logout from layout - everything cleared');
      
      // Force redirect to login (use relative path for deployed site)
      window.location.href = '/auth/login';
      
    } catch (error) {
      console.error('❌ Layout logout error:', error);
      // Fallback
      if ((window as any).nuclearLogout) {
        (window as any).nuclearLogout();
      }
    }
  }
}
