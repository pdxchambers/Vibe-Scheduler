import { apiRequest } from './client';
import { User } from './types';

export interface AuthResponse {
  user: User;
  token: string;
}

export const authApi = {
  register(email: string, password: string, displayName: string): Promise<AuthResponse> {
    return apiRequest('/auth/register', { method: 'POST', body: { email, password, displayName } });
  },

  login(email: string, password: string): Promise<AuthResponse> {
    return apiRequest('/auth/login', { method: 'POST', body: { email, password } });
  },

  logout(): Promise<void> {
    return apiRequest('/auth/logout', { method: 'POST' });
  },
};
