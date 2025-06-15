import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { LoginService } from '../services/login.service';
import { map, take } from 'rxjs/operators';

export const repartidorGuard: CanActivateFn = () => {
  const login = inject(LoginService);
  const router = inject(Router);
  return login.role$.pipe(
    take(1),
    map(role => (role === 'repartidor' ? true : router.createUrlTree(['/control-panel'])))
  );
};