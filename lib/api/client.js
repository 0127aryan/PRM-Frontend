import { getApiBaseUrl } from '../config';

/**
 * Fetch wrapper for Nest API — sends httpOnly cookies (JWT).
 * @param {string} path - e.g. '/auth/login' (no /api prefix)
 * @param {RequestInit} [init]
 */
export async function apiFetch(path, init = {}) {
  const base = getApiBaseUrl();
  const url = `${base}${path.startsWith('/') ? path : `/${path}`}`;

  const headers = new Headers(init.headers);
  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, {
    ...init,
    headers,
    credentials: 'include',
  });

  const contentType = response.headers.get('content-type') ?? '';
  const isJson = contentType.includes('application/json');
  const data = isJson ? await response.json().catch(() => null) : null;

  if (!response.ok) {
    const message =
      data?.message ??
      (typeof data?.message === 'object' ? JSON.stringify(data.message) : null) ??
      response.statusText;
    const error = new Error(
      Array.isArray(message) ? message.join(', ') : String(message),
    );
    error.status = response.status;
    error.data = data;
    error.code =
      data?.code ??
      (typeof data?.message === 'object' ? data.message?.code : undefined);
    throw error;
  }

  return data;
}
