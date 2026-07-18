import { apiRequest } from './client';
import { User, UserPreferences } from './types';

export const usersApi = {
  getMe(): Promise<User> {
    return apiRequest('/users/me');
  },

  updateProfile(displayName: string): Promise<User> {
    return apiRequest('/users/me', { method: 'PATCH', body: { displayName } });
  },

  updatePreferences(updates: Partial<UserPreferences>): Promise<User> {
    return apiRequest('/users/me/preferences', { method: 'PATCH', body: updates });
  },
};
