import { Entity } from '../../db/Repository';

export type ThemePreference = 'light' | 'dark' | 'system';
export type WeekStartDay = 'sunday' | 'monday';
export type TimeFormatPreference = '12h' | '24h';

export interface UserPreferences {
  theme: ThemePreference;
  weekStartsOn: WeekStartDay;
  timeFormat: TimeFormatPreference;
  defaultEventColor: string;
}

export interface User extends Entity {
  email: string;
  passwordHash: string;
  displayName: string;
  preferences: UserPreferences;
  createdAt: string;
  updatedAt: string;
}

/** Shape safe to send to the client - never includes the password hash. */
export type PublicUser = Omit<User, 'passwordHash'>;

export function toPublicUser(user: User): PublicUser {
  const { passwordHash, ...publicUser } = user;
  return publicUser;
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'system',
  weekStartsOn: 'sunday',
  timeFormat: '12h',
  defaultEventColor: '#3b82f6',
};
