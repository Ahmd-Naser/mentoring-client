import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  // 1. استنساخ الطلب وإضافة الـ Token في الـ Headers إذا كان موجوداً
  let clonedRequest = req;
  if (token) {
    clonedRequest = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  // 2. تمرير الطلب ومراقبة الأخطاء (مثل انتهاء صلاحية التوكن 401)
  return next(clonedRequest).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // تسجيل خروج المستخدم والتوجيه لصفحة تسجيل الدخول فوراً
        authService.logout();
      }
      return throwError(() => error);
    })
  );
};