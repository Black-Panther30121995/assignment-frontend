import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { SnackService } from './snack.service';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const snack = inject(SnackService);
  return next(req).pipe(
    catchError(err => {
      const msg = err?.error?.message || err?.statusText || 'Request failed';
      snack.error(msg);
      return throwError(() => err);
    })
  );
};