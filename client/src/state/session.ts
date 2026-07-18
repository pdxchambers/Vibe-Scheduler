import { Store } from './Store';
import { User } from '../api/types';

export interface SessionState {
  user: User | null;
  status: 'loading' | 'authenticated' | 'anonymous';
}

export const sessionStore = new Store<SessionState>({
  user: null,
  status: 'loading',
});

export function setUser(user: User | null): void {
  sessionStore.setState({ user, status: user ? 'authenticated' : 'anonymous' });
}

export function updateUserPreferences(preferences: User['preferences']): void {
  const current = sessionStore.getState().user;
  if (!current) return;
  sessionStore.setState({ user: { ...current, preferences } });
}
