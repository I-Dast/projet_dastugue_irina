import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserService } from '../services/user.service';

export const authGuard: CanActivateFn = () => {
  const users = inject(UserService);
  return users.isAuthenticated() || inject(Router).parseUrl('/login');
};
