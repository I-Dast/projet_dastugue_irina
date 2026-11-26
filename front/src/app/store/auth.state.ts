import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { hasStoredSession } from '../services/auth-session';
import type { UserProfile } from '../services/user.service';
import { Login, Logout } from './auth.actions';

export interface AuthStateModel {
  user: UserProfile | null;
  isAuthenticated: boolean;
}

const initialAuthState: AuthStateModel = {
  user: null,
  isAuthenticated: false,
};

@State<AuthStateModel>({
  name: 'auth',
  defaults: initialAuthState,
})
@Injectable()
export class AuthState {
  ngxsOnInit(ctx: StateContext<AuthStateModel>): void {
    ctx.patchState({ isAuthenticated: hasStoredSession() });
  }

  @Selector()
  static user(state: AuthStateModel): UserProfile | null {
    return state.user;
  }

  @Selector()
  static username(state: AuthStateModel): string | null {
    return state.user?.login ?? null;
  }

  @Selector()
  static isAuthenticated(state: AuthStateModel): boolean {
    return state.isAuthenticated;
  }

  @Action(Login)
  login(ctx: StateContext<AuthStateModel>, action: Login): void {
    ctx.patchState({ user: action.user, isAuthenticated: true });
  }

  @Action(Logout)
  logout(ctx: StateContext<AuthStateModel>): void {
    ctx.setState({ ...initialAuthState });
  }
}
