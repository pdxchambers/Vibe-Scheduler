import { ApiError } from './ApiError';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function assertString(value: unknown, field: string, opts: { minLength?: number; maxLength?: number } = {}): string {
  if (typeof value !== 'string') {
    throw ApiError.badRequest(`"${field}" must be a string`);
  }
  const trimmed = value.trim();
  if (opts.minLength !== undefined && trimmed.length < opts.minLength) {
    throw ApiError.badRequest(`"${field}" must be at least ${opts.minLength} characters`);
  }
  if (opts.maxLength !== undefined && trimmed.length > opts.maxLength) {
    throw ApiError.badRequest(`"${field}" must be at most ${opts.maxLength} characters`);
  }
  return value;
}

export function assertEmail(value: unknown): string {
  const email = assertString(value, 'email', { minLength: 3, maxLength: 254 });
  if (!EMAIL_REGEX.test(email.trim())) {
    throw ApiError.badRequest('"email" must be a valid email address');
  }
  return email;
}

export function assertIsoDate(value: unknown, field: string): string {
  const str = assertString(value, field);
  const parsed = new Date(str);
  if (Number.isNaN(parsed.getTime())) {
    throw ApiError.badRequest(`"${field}" must be a valid ISO 8601 date string`);
  }
  return parsed.toISOString();
}

export function assertOneOf<T extends string>(value: unknown, field: string, allowed: readonly T[]): T {
  if (typeof value !== 'string' || !allowed.includes(value as T)) {
    throw ApiError.badRequest(`"${field}" must be one of: ${allowed.join(', ')}`);
  }
  return value as T;
}
