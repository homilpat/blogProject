import { API_URL } from './knowledge-api';

export type AuthUser = { username: string; email: string; role: 'ROLE_USER' | 'ROLE_ADMIN' };
const TOKEN_KEY = 'knowledge_access_token';
const USER_KEY = 'knowledge_user';

export function getToken() { return typeof window === 'undefined' ? null : localStorage.getItem(TOKEN_KEY); }
export function getUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  try { const value = localStorage.getItem(USER_KEY); return value ? JSON.parse(value) : null; } catch { return null; }
}
export function saveAuth(data: AuthUser & { token: string }) {
  localStorage.setItem(TOKEN_KEY, data.token);
  localStorage.setItem(USER_KEY, JSON.stringify({ username: data.username, email: data.email, role: data.role }));
  window.dispatchEvent(new Event('auth-change'));
}
export function clearAuth() { localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(USER_KEY); window.dispatchEvent(new Event('auth-change')); }

export async function authFetch(path: string, init: RequestInit = {}) {
  const token = getToken();
  const headers = new Headers(init.headers);
  if (token) headers.set('Authorization', `Bearer ${token}`);
  const response = await fetch(path.startsWith('http') ? path : `${API_URL}${path}`, { ...init, headers });
  if (response.status === 401 && token) clearAuth();
  return response;
}
