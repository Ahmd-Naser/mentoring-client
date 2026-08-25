import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../services/toast.service';
import { AuthService } from '../services/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastService);
  const authService = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'An unexpected error occurred. Please try again.';

      if (error.status === 0) {
        errorMessage = 'Cannot connect to server. Check your network connection.';
        toast.error(errorMessage, 'Network Error');
        return throwError(() => error);
      }

      switch (error.status) {
        case 401:
          authService.logout();
          router.navigate(['/login']);
          toast.error('Session expired. Please log in again.', 'Unauthorized');
          break;

        case 403:
          toast.error('You do not have permission to perform this action.', 'Access Denied');
          break;

        case 404:
          errorMessage = error.error?.detail || error.error?.message || 'The requested resource was not found.';
          toast.error(errorMessage, 'Not Found');
          break;

        case 400:
        case 422:
          // معالجة أخطاء الـ Validation القادمة من FluentValidation و ProblemDetails
          if (error.error?.errors && typeof error.error.errors === 'object') {
            const validationErrors = Object.values(error.error.errors).flat() as string[];
            errorMessage = validationErrors.join(' | ');
          } else {
            errorMessage = error.error?.detail || error.error?.message || error.error?.title || 'Validation error.';
          }
          toast.error(errorMessage, 'Validation Error');
          break;

        case 500:
          toast.error('Internal server error occurred. Please contact support.', 'Server Error');
          break;

        default:
          errorMessage = error.error?.detail || error.error?.message || errorMessage;
          toast.error(errorMessage);
          break;
      }

      return throwError(() => error);
    })
  );
};