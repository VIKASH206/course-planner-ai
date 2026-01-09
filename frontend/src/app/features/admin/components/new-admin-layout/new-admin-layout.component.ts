import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth-backend.service';

interface MenuItem {
  path: string;
  label: string;
  icon: string;
  action?: () => void;
}

@Component({
  selector: 'app-new-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="admin-layout">
      <!-- Sidebar -->
      <aside class="admin-sidebar" [class.hidden]="!sidebarOpen()">
        <div class="admin-brand">
          <h1>Course Planner AI</h1>
          <p class="admin-tag">Admin Panel</p>
        </div>
        
        <nav class="admin-nav">
          @for (item of menuItems; track item.path) {
            @if (item.action) {
              <button (click)="item.action!()" class="nav-item nav-button">
                <i class="icon">{{ item.icon }}</i>
                <span>{{ item.label }}</span>
              </button>
            } @else {
              <a 
                [routerLink]="item.path" 
                routerLinkActive="active"
                [routerLinkActiveOptions]="{exact: item.path === '/admin/dashboard'}"
                class="nav-item">
                <i class="icon">{{ item.icon }}</i>
                <span>{{ item.label }}</span>
              </a>
            }
          }
        </nav>

        <!-- Admin Profile in Sidebar Footer -->
        <div class="sidebar-footer">
          <div class="admin-profile-mini">
            <div class="profile-avatar">
              {{ getAdminInitials() }}
            </div>
            <div class="profile-info">
              <div class="profile-name">{{ getAdminName() }}</div>
              <div class="profile-role">Administrator</div>
            </div>
          </div>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="admin-main" [class.full-width]="!sidebarOpen()">
        <!-- Top Navbar -->
        <header class="admin-navbar">
          <div class="navbar-left">
            <button (click)="toggleSidebar()" class="menu-toggle-btn" title="Toggle Sidebar">
              <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>
            <h2 class="page-title">{{ getPageTitle() }}</h2>
          </div>
          <div class="navbar-right">
            <!-- Notifications -->
            <button class="icon-button" title="Notifications">
              <span class="notification-icon">🔔</span>
              <span class="notification-badge">3</span>
            </button>
            
            <!-- Admin Profile -->
            <div class="admin-profile">
              <div class="profile-avatar-nav">{{ getAdminInitials() }}</div>
              <div class="profile-details">
                <div class="profile-name-nav">{{ getAdminName() }}</div>
                <div class="profile-email">{{ getAdminEmail() }}</div>
              </div>
            </div>
          </div>
        </header>

        <!-- Page Content -->
        <div class="admin-content">
          <router-outlet></router-outlet>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .admin-layout {
      display: flex;
      height: 100vh;
      overflow: hidden;
    }

    /* ========== SIDEBAR ========== */
    .admin-sidebar {
      width: 280px;
      background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);
      color: white;
      display: flex;
      flex-direction: column;
      box-shadow: 2px 0 12px rgba(0, 0, 0, 0.15);
      position: fixed;
      left: 0;
      top: 0;
      bottom: 0;
      z-index: 100;
      transition: transform 0.3s ease;
    }

    .admin-sidebar.hidden {
      transform: translateX(-100%);
    }

    .admin-brand {
      padding: 1.5rem 1.5rem 1rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .admin-brand h1 {
      font-size: 1.4rem;
      font-weight: 700;
      margin: 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .admin-tag {
      font-size: 0.75rem;
      color: #94a3b8;
      margin: 0.25rem 0 0 0;
      font-weight: 500;
      letter-spacing: 0.5px;
    }

    .admin-nav {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      padding: 1rem 0.75rem;
      overflow-y: auto;
    }

    .nav-item, .nav-button {
      display: flex;
      align-items: center;
      gap: 0.875rem;
      padding: 0.875rem 1rem;
      color: #cbd5e1;
      text-decoration: none;
      border-radius: 0.5rem;
      transition: all 0.2s;
      font-size: 0.9rem;
      font-weight: 500;
      border: none;
      background: none;
      width: 100%;
      text-align: left;
      cursor: pointer;
    }

    .nav-item:hover, .nav-button:hover {
      background: rgba(255, 255, 255, 0.08);
      color: white;
      transform: translateX(2px);
    }

    .nav-item.active {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    }

    .icon {
      font-size: 1.25rem;
      width: 24px;
      text-align: center;
    }

    .sidebar-footer {
      padding: 1rem;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      margin-top: auto;
    }

    .admin-profile-mini {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 0.5rem;
    }

    .profile-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 1rem;
      color: white;
    }

    .profile-info {
      flex: 1;
      min-width: 0;
    }

    .profile-name {
      font-size: 0.875rem;
      font-weight: 600;
      color: white;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .profile-role {
      font-size: 0.75rem;
      color: #94a3b8;
    }

    /* ========== MAIN CONTENT ========== */
    .admin-main {
      flex: 1;
      margin-left: 280px;
      display: flex;
      flex-direction: column;
      background: #f8fafc;
      overflow: hidden;
      transition: margin-left 0.3s ease;
    }

    .admin-main.full-width {
      margin-left: 0;
    }

    /* ========== NAVBAR ========== */
    .admin-navbar {
      background: white;
      padding: 1rem 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      height: 70px;
    }

    .navbar-left {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .menu-toggle-btn {
      background: none;
      border: none;
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 0.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #334155;
      transition: all 0.2s;
    }

    .menu-toggle-btn:hover {
      background: #f1f5f9;
      color: #0f172a;
    }

    .menu-toggle-btn svg {
      display: block;
    }

    .page-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: #1e293b;
      margin: 0;
    }

    .navbar-right {
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }

    .icon-button {
      position: relative;
      background: none;
      border: none;
      cursor: pointer;
      font-size: 1.5rem;
      padding: 0.5rem;
      border-radius: 0.5rem;
      transition: all 0.2s;
    }

    .icon-button:hover {
      background: #f1f5f9;
    }

    .notification-icon {
      display: block;
    }

    .notification-badge {
      position: absolute;
      top: 0.25rem;
      right: 0.25rem;
      background: #ef4444;
      color: white;
      font-size: 0.625rem;
      font-weight: 700;
      padding: 0.125rem 0.375rem;
      border-radius: 9999px;
      min-width: 18px;
      text-align: center;
    }

    .admin-profile {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.5rem 1rem;
      background: #f8fafc;
      border-radius: 0.5rem;
    }

    .profile-avatar-nav {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      color: white;
    }

    .profile-details {
      display: flex;
      flex-direction: column;
    }

    .profile-name-nav {
      font-size: 0.875rem;
      font-weight: 600;
      color: #1e293b;
    }

    .profile-email {
      font-size: 0.75rem;
      color: #64748b;
    }

    /* ========== CONTENT AREA ========== */
    .admin-content {
      flex: 1;
      overflow-y: auto;
      padding: 2rem;
    }

    /* ========== SCROLLBAR ========== */
    .admin-nav::-webkit-scrollbar,
    .admin-content::-webkit-scrollbar {
      width: 6px;
    }

    .admin-nav::-webkit-scrollbar-track {
      background: rgba(255, 255, 255, 0.05);
    }

    .admin-nav::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.2);
      border-radius: 3px;
    }

    .admin-content::-webkit-scrollbar-track {
      background: #f1f5f9;
    }

    .admin-content::-webkit-scrollbar-thumb {
      background: #cbd5e1;
      border-radius: 3px;
    }

    /* ========== RESPONSIVE ========== */
    @media (max-width: 1024px) {
      .admin-sidebar {
        width: 240px;
      }
      .admin-main {
        margin-left: 240px;
      }
    }
  `]
})
export class NewAdminLayoutComponent {
  sidebarOpen = signal(true);
  
  // Menu Items with Course Requests added
  menuItems: MenuItem[] = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/admin/users', label: 'User Management', icon: '👥' },
    { path: '/admin/courses', label: 'Course Management', icon: '📚' },
    { path: '/admin/course-requests', label: 'Course Requests', icon: '📝' },
    { path: '/admin/interests', label: 'Interests & Categories', icon: '🎯' },
    { path: '/admin/ai-rules', label: 'AI Rules', icon: '🤖' },
    { path: '/admin/ai-logs', label: 'AI Recommendation Logs', icon: '📋' },
    { path: '/admin/coming-soon', label: 'Coming Soon Courses', icon: '⏳' },
    { path: '/admin/analytics', label: 'Analytics & Reports', icon: '📈' },
    { path: '/admin/settings', label: 'Settings', icon: '⚙️' },
    { path: '', label: 'Logout', icon: '🚪', action: () => this.logout() }
  ];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  getAdminName(): string {
    const user = this.authService.currentUser();
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`.trim();
    }
    return user?.email?.split('@')[0] || 'Admin';
  }

  getAdminEmail(): string {
    const user = this.authService.currentUser();
    return user?.email || 'admin@courseplanner.ai';
  }

  getAdminInitials(): string {
    const name = this.getAdminName();
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  getPageTitle(): string {
    const url = this.router.url;
    if (url.includes('/dashboard')) return 'Dashboard';
    if (url.includes('/users')) return 'User Management';
    if (url.includes('/courses') && !url.includes('/course-requests')) return 'Course Management';
    if (url.includes('/course-requests')) return 'Course Requests';
    if (url.includes('/interests')) return 'Interests & Categories';
    if (url.includes('/ai-rules')) return 'AI Rules Configuration';
    if (url.includes('/ai-logs')) return 'AI Recommendation Logs';
    if (url.includes('/coming-soon')) return 'Coming Soon Courses';
    if (url.includes('/analytics')) return 'Analytics & Reports';
    if (url.includes('/settings')) return 'Settings';
    return 'Admin Panel';
  }

  toggleSidebar(): void {
    this.sidebarOpen.update(val => !val);
  }

  logout(): void {
    if (confirm('Are you sure you want to logout?')) {
      this.authService.logout();
      this.router.navigate(['/auth/login']);
    }
  }
}
