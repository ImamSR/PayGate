import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const notificationService = inject(NotificationService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        if (!req.url.includes('/auth/')) {
          authService.logout();
          notificationService.showError('Session expired. Please log in again.');
        }
      }

      if (error.status === 403) {
        notificationService.showError('Access denied. You do not have permission to perform this action.');
      }

      if (error.status === 500) {
        notificationService.showError('Server error. Please try again later.');
      }

      if (error.status === 0) {
        notificationService.showError('Network error. Please check your connection.');
      }

      return throwError(() => error);
    })
  );
};