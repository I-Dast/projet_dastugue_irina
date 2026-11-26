import type { UserProfile } from '../services/user.service';

export class Login {
  static readonly type = '[Auth] Login';

  constructor(readonly user: UserProfile) {}
}

export class Logout {
  static readonly type = '[Auth] Logout';
}
