import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const guestGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return true;
  }

  // إذا كان مسجلاً بالفعل، يتم توجيهه للـ Dashboard فوراً
  return router.createUrlTree(['/dashboard']);
};