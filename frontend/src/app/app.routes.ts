import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  // Auth routes (without layout) - for guests only
  {
    path: 'auth',
    canActivate: [guestGuard],
    children: [
      {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login.component').then(c => c.LoginComponent)
      },
      {
        path: 'signup',
        loadComponent: () => import('./features/auth/signup/signup.component').then(c => c.SignupComponent)
      },
      {
        path: 'callback',
        loadComponent: () => import('./features/auth/callback/callback.component').then(c => c.CallbackComponent)
      },
      {
        path: 'forgot-password',
        loadComponent: () => import('./features/auth/forgot-password/forgot-password.component').then(c => c.ForgotPasswordComponent)
      },
      {
        path: 'reset-password',
        loadComponent: () => import('./features/auth/reset-password/reset-password.component').then(c => c.ResetPasswordComponent)
      },
      {
        path: 'verify-email',
        loadComponent: () => import('./features/auth/verify-email/verify-email.component').then(c => c.VerifyEmailComponent)
      },
      {
        path: 'logout',
        loadComponent: () => import('./features/auth/logout/logout.component').then(c => c.LogoutComponent)
      },
      {
        path: '',
        redirectTo: 'signup',
        pathMatch: 'full'
      }
    ]
  },
  
  // Onboarding route (without layout) - requires authentication
  {
    path: 'onboarding',
    canActivate: [authGuard],
    loadComponent: () => import('./features/auth/onboarding/onboarding.component').then(c => c.OnboardingComponent)
  },
  
  // Main app routes (with layout) - requires authentication
  {
    path: '',
    loadComponent: () => import('./shared/layout/layout.component').then(c => c.LayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(c => c.DashboardComponent),
        canActivate: [roleGuard],
        data: { expectedRole: 'STUDENT' }
      },
      {
        path: 'courses',
        loadComponent: () => import('./features/courses/courses.component').then(c => c.CoursesComponent)
      },
      {
        path: 'my-courses',
        loadComponent: () => import('./features/courses/my-courses.component').then(c => c.MyCoursesComponent)
      },
      {
        path: 'browse-courses',
        loadComponent: () => import('./features/courses/browse-courses/browse-courses.component').then(c => c.BrowseCoursesComponent)
      },
      {
        path: 'course/:id',
        loadComponent: () => import('./features/courses/course-detail.component').then(c => c.CourseDetailComponent)
      },
      {
        path: 'course-viewer/:id',
        loadComponent: () => import('./features/courses/course-viewer/course-viewer.component').then(c => c.CourseViewerComponent)
      },
      {
        path: 'ai-assistant',
        loadComponent: () => import('./features/courses/ai-chatbot.component').then(c => c.AIChatbotComponent)
      },
      {
        path: 'tasks',
        loadComponent: () => import('./features/tasks/tasks.component').then(c => c.TasksComponent)
      },
      {
        path: 'calendar',
        loadComponent: () => import('./features/tasks/tasks.component').then(c => c.TasksComponent) // Same component handles calendar
      },
      {
        path: 'chat',
        loadComponent: () => import('./features/chat/chat.component').then(c => c.ChatComponent)
      },
      {
        path: 'ai-chat',
        redirectTo: 'chat',
        pathMatch: 'full'
      },
      {
        path: 'profile',
        loadComponent: () => import('./features/profile/profile.component').then(c => c.ProfileComponent)
      },
      {
        path: 'forum',
        loadComponent: () => import('./features/forum/forum.component').then(c => c.ForumComponent)
      },
      {
        path: 'forum/thread/:id',
        loadComponent: () => import('./features/forum/thread-detail.component').then(c => c.ThreadDetailComponent)
      },
      {
        path: 'analytics',
        loadComponent: () => import('./features/analytics/analytics.component').then(c => c.AnalyticsComponent)
      },
      {
        path: 'gamification',
        loadComponent: () => import('./features/gamification/gamification.component').then(c => c.GamificationComponent)
      },
      {
        path: 'achievements',
        redirectTo: 'gamification',
        pathMatch: 'full'
      },
      {
        path: 'leaderboard',
        redirectTo: 'gamification',
        pathMatch: 'full'
      },
      {
        path: 'settings',
        redirectTo: 'profile',
        pathMatch: 'full'
      }
    ]
  },
  
  // Admin routes (separate layout with admin guard)
  {
    path: 'admin',
    loadComponent: () => import('./features/admin/components/new-admin-layout/new-admin-layout.component').then(c => c.NewAdminLayoutComponent),
    loadChildren: () => import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES)
  },
  
  // Fallback route - redirect to signup for new users
  {
    path: '**',
    redirectTo: 'auth/signup'
  }
];
