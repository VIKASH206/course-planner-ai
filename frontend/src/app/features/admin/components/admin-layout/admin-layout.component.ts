import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth-backend.service';

interface MenuItem {
  icon: string;
  label: string;
  route: string;
  description: string;
}

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="flex h-screen bg-gray-100">
      <!-- Sidebar -->
      <aside class="w-64 bg-gradient-to-b from-indigo-900 to-indigo-800 text-white flex flex-col shadow-2xl transition-all duration-300"
             [class.hidden]="!sidebarOpen()">
        <!-- Logo & Title -->
        <div class="p-6 border-b border-indigo-700">
          <div class="flex items-center space-x-3">
            <div class="bg-white rounded-lg p-2">
              <svg class="w-8 h-8 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path>
              </svg>
            </div>
            <div>
              <h1 class="text-xl font-bold">Admin Panel</h1>
              <p class="text-xs text-indigo-300">Course Planner AI</p>
            </div>
          </div>
        </div>

        <!-- Navigation Menu -->
        <nav class="flex-1 overflow-y-auto p-4 space-y-2">
          @for (item of menuItems; track item.route) {
            <a [routerLink]="[item.route]"
               routerLinkActive="bg-indigo-700 shadow-lg"
               class="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-indigo-700 transition-all duration-200 group">
              <span class="text-2xl group-hover:scale-110 transition-transform">{{item.icon}}</span>
              <div class="flex-1">
                <div class="font-medium">{{item.label}}</div>
                <div class="text-xs text-indigo-300 group-hover:text-white">{{item.description}}</div>
              </div>
            </a>
          }
        </nav>

        <!-- User Profile Section -->
        <div class="p-4 border-t border-indigo-700">
          <div class="flex items-center space-x-3 mb-3">
            <div class="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-lg font-bold">
              {{userInitials()}}
            </div>
            <div class="flex-1">
              <div class="text-sm font-medium">{{currentUser()?.firstName}} {{currentUser()?.lastName}}</div>
              <div class="text-xs text-indigo-300">Administrator</div>
            </div>
          </div>
          <button (click)="logout()"
                  class="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium">
            Logout
          </button>
        </div>
      </aside>

      <!-- Main Content Area -->
      <div class="flex-1 flex flex-col overflow-hidden">
        <!-- Top Header -->
        <header class="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <button (click)="toggleSidebar()"
                      class="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <svg class="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                </svg>
              </button>
              <h2 class="text-2xl font-bold text-gray-800">{{pageTitle()}}</h2>
            </div>
            
            <div class="flex items-center space-x-4">
              <!-- Notifications Badge -->
              <div class="relative">
                <button class="p-2 rounded-lg hover:bg-gray-100 relative">
                  <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                  </svg>
                  <span class="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">3</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        <!-- Page Content -->
        <main class="flex-1 overflow-auto p-6 bg-gray-50">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100vh;
    }
  `]
})
export class AdminLayoutComponent {
  sidebarOpen = signal(true);
  currentUser = this.authService.currentUser;
  userInitials = this.authService.userInitials;
  
  pageTitle = signal('Dashboard');

  menuItems: MenuItem[] = [
    {
      icon: '📊',
      label: 'Dashboard',
      route: '/admin/dashboard',
      description: 'Overview & Stats'
    },
    {
      icon: '🎯',
      label: 'Interests',
      route: '/admin/interests',
      description: 'Manage Topics'
    },
    {
      icon: '🎓',
      label: 'Goals',
      route: '/admin/goals',
      description: 'Career Paths'
    },
    {
      icon: '📚',
      label: 'Subjects',
      route: '/admin/subjects',
      description: 'Course Content'
    },
    {
      icon: '🎬',
      label: 'Courses',
      route: '/admin/courses',
      description: 'Browse Courses'
    },
    {
      icon: '🤖',
      label: 'AI Rules',
      route: '/admin/ai-rules',
      description: 'Recommendation Logic'
    },
    {
      icon: '📈',
      label: 'Analytics',
      route: '/admin/analytics',
      description: 'Trends & Insights'
    }
  ];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  toggleSidebar() {
    this.sidebarOpen.update(val => !val);
  }

  isMobile(): boolean {
    return window.innerWidth < 1024;
  }

  logout() {
    this.authService.logout();
  }
}
