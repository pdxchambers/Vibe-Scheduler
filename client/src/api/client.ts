export class ApiRequestError extends Error {
  constructor(public status: number, message: string, public details?: unknown) {
    super(message);
    this.name = 'ApiRequestError';
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE' | 'PUT';
  body?: unknown;
}

/**
 * Thin fetch wrapper shared by every `*.api.ts` module.
 *
 * - Always sends cookies (`credentials: 'include'`) so the httpOnly auth
 *   cookie set by the server is included automatically.
 * - Normalizes error responses into `ApiRequestError`.
 * - Returns `undefined` for 204 No Content responses.
 */
export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const response = await fetch(`/api${path}`, {
    method: options.method ?? 'GET',
    credentials: 'include',
    headers: options.body ? { 'Content-Type': 'application/json' } : undefined,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const payload = isJson ? await response.json().catch(() => undefined) : undefined;

  if (!response.ok) {
    const message =
      (payload && typeof payload === 'object' && 'error' in payload && String(payload.error)) ||
      response.statusText ||
      'Request failed';
    throw new ApiRequestError(response.status, message, payload);
  }

  return payload as T;
}
