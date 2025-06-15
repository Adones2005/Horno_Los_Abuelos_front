import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, take } from 'rxjs/operators';
import { LoginService } from '../services/login.service';

export const roleGuard = (allowed: string[]): CanActivateFn => () => {
  const loginSvc = inject(LoginService);
  const router = inject(Router);
  return loginSvc.role$.pipe(
    take(1),
    map(role => {
      if (!role) return router.createUrlTree(['/identificarse']);
      return allowed.includes(role) ? true : router.createUrlTree(['/']);
    })
  );
};