import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthSessionService } from './auth-session.service';

export function requireAnyRole(roles: string[]): CanActivateFn {
  return () => {
    const authSession = inject(AuthSessionService);
    const router = inject(Router);

    const user = authSession.getUser();
    if (user && user.roles && roles.some((role) => user.roles.includes(role))) {
      return true;
    }

    return router.createUrlTree(['/auth']);
  };
}
