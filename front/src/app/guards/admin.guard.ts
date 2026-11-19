import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserService } from '../services/user.service';

export const adminGuard: CanActivateFn = () => {
  const users = inject(UserService);
  return users.hasAdminToken() || inject(Router).parseUrl('/login');
};
