import { Routes } from '@angular/router';
import { adminGuard } from './guards/admin.guard';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./components/new-admin-dashboard/new-admin-dashboard.component')
      .then(m => m.NewAdminDashboardComponent)
  },
      {
        path: 'users',
        loadComponent: () => import('./components/user-management/user-management.component')
          .then(m => m.UserManagementComponent)
      },
      {
        path: 'courses',
        loadComponent: () => import('./components/course-management/course-management.component')
          .then(m => m.CourseManagementComponent)
      },
      {
        path: 'course-requests',
        loadComponent: () => import('./components/course-requests/course-requests.component')
          .then(m => m.CourseRequestsComponent)
      },
      {
        path: 'interests',
        loadComponent: () => import('./components/interest-management/interest-management.component')
          .then(m => m.InterestManagementComponent)
      },
      {
        path: 'ai-rules',
        loadComponent: () => import('./components/ai-rule-management/ai-rule-management.component')
          .then(m => m.AIRuleManagementComponent)
      },
      {
        path: 'ai-logs',
        loadComponent: () => import('./components/ai-logs/ai-logs.component')
          .then(m => m.AILogsComponent)
      },
      {
        path: 'coming-soon',
        loadComponent: () => import('./components/coming-soon-courses/coming-soon-courses.component')
          .then(m => m.ComingSoonCoursesComponent)
      },
      {
        path: 'analytics',
        loadComponent: () => import('./components/admin-analytics/admin-analytics.component')
          .then(m => m.AdminAnalyticsComponent)
      },
  {
    path: 'settings',
    loadComponent: () => import('./components/admin-settings/admin-settings.component')
      .then(m => m.AdminSettingsComponent)
  }
];
