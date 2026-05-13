import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';

/**
 * HTTP interceptor that ensures API requests include credentials so
 * the server can handle auth and authorization via HttpOnly cookies.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.url.startsWith(environment.apiUrl) || req.url.includes('/api/')) {
    return next(req.clone({
      withCredentials: true
    }));
  }

  return next(req);
};
