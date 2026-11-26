export const ADMIN_TOKEN_KEY = 'pollution.admin-token';
export const USER_SESSION_KEY = 'pollution.user-session';

export function hasStoredSession(): boolean {
  return (
    typeof sessionStorage !== 'undefined' &&
    (sessionStorage.getItem(USER_SESSION_KEY) === 'true' ||
      sessionStorage.getItem(ADMIN_TOKEN_KEY) !== null)
  );
}
