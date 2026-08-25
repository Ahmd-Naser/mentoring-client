import { Routes } from '@angular/router';
import { guestGuard } from './core/guards/guest.guard';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'auth/login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent),
    canActivate: [guestGuard]
  },
  {
    path: 'auth/register',
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent),
    canActivate: [guestGuard]
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },
  {
    path: 'groups',
    loadComponent: () => import('./features/groups/groups-list/groups-list.component').then(m => m.GroupsListComponent),
    canActivate: [authGuard]
  },
  {
    // 🌟 مسار الملف الشخصي وإعدادات الحساب
    path: 'profile',
    loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [authGuard]
  },
  {
    path: 'groups/:id',
    loadComponent: () => import('./features/groups/group-details/group-details.component').then(m => m.GroupDetailsComponent),
    canActivate: [authGuard]
  },
  {
    // 🌟 مسار مساحة عمل وتتبع المسألة
    path: 'groups/:groupId/problems/:problemId',
    loadComponent: () => import('./features/groups/problem-workspace/problem-workspace.component').then(m => m.ProblemWorkspaceComponent),
    canActivate: [authGuard]
  },
  {
    path: 'problems',
    loadComponent: () => import('./features/problems/problems-list/problems-list.component').then(m => m.ProblemsListComponent),
    canActivate: [authGuard]
  },
  {
    // 🌟 تأكيد البريد الإلكتروني
    path: 'auth/confirm-email',
    loadComponent: () => import('./features/auth/confirm-email/confirm-email.component').then(m => m.ConfirmEmailComponent),
    canActivate: [guestGuard]
  },
  {
    // 🌟 طلب استعادة كلمة المرور
    path: 'auth/forgot-password',
    loadComponent: () => import('./features/auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent),
    canActivate: [guestGuard]
  },
  {
    // 🌟 تعيين كلمة المرور الجديدة
    path: 'auth/reset-password',
    loadComponent: () => import('./features/auth/reset-password/reset-password.component').then(m => m.ResetPasswordComponent),
    canActivate: [guestGuard]
  },
  {
    path: 'groups/:groupId/problems/:problemId/review',
    loadComponent: () => import('./features/groups/mentor-problem-review/mentor-problem-review.component')
      .then(m => m.MentorProblemReviewComponent),
    canActivate: [authGuard]
  },
  { 
    path: '**',
    redirectTo: 'dashboard'
  }
];