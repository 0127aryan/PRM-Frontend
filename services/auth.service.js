import { apiFetch } from '@/lib/api/client';

/** @typedef {{ id: number, email: string, username: string, role: string, accountStatus: string, forcePasswordChange: boolean, employeeId: number | null }} AuthUser */

/**
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ user: AuthUser, requiresPasswordChange: boolean }>}
 */
export function login(email, password) {
  return apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: email.trim(), password }),
  });
}

/** @returns {Promise<{ user: AuthUser, requiresPasswordChange: boolean }>} */
export function refreshSession() {
  return apiFetch('/auth/refresh', { method: 'POST' });
}

export function logout() {
  return apiFetch('/auth/logout', { method: 'POST' });
}

/** @returns {Promise<AuthUser>} */
export function getCurrentUser() {
  return apiFetch('/auth/me');
}

/**
 * @param {string} email
 * @returns {Promise<{ eligible: boolean, email?: string }>}
 */
export function validateSetupEligibility(email) {
  const params = new URLSearchParams({ email: email.trim() });
  return apiFetch(`/auth/set-password/validate?${params}`);
}

/**
 * @param {{ email: string, password: string }} payload
 * @returns {Promise<{ user: AuthUser, requiresPasswordChange: boolean }>}
 */
export function setPassword(payload) {
  return apiFetch('/auth/set-password', {
    method: 'POST',
    body: JSON.stringify({
      email: payload.email.trim().toLowerCase(),
      password: payload.password,
    }),
  });
}
