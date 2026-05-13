import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { CanActivateFn } from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

/**
 * Guard that checks if user has admin role before allowing access to admin routes.
 */
export const AdminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const notificationService = inject(NotificationService);

  return authService.loadCurrentUser(true).pipe(
    map(user => {
      if (user?.role === 'ADMIN') {
        return true;
      }

      if (!user) {
        return router.createUrlTree(['/404']);
      }

      notificationService.showError('Access denied. Admin privileges required.');
      return router.createUrlTree(['/404']);
    })
  );
};
