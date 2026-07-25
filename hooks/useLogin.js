'use client';

import { useCallback, useState } from 'react';
import { getHomePathForRole } from '@/lib/auth';
import * as authService from '@/services/auth.service';

/**
 * Login form state and submit handler.
 * @returns {{ submit: (email: string, password: string) => Promise<void>, loading: boolean, error: string, clearError: () => void }}
 */
export function useLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const clearError = useCallback(() => setError(''), []);

  const submit = useCallback(
    async (email, password) => {
      setError('');
      setLoading(true);
      try {
        const result = await authService.login(email, password);
        const destination = getHomePathForRole(result.user?.role);
        if (destination === '/login') {
          setError('Your account role is not recognized. Contact an administrator.');
          return;
        }
        // Full navigation so httpOnly cookies are applied before protected routes load
        window.location.assign(destination);
      } catch (err) {
        if (
          err.code === 'PASSWORD_SETUP_REQUIRED' ||
          err.data?.code === 'PASSWORD_SETUP_REQUIRED'
        ) {
          const normalized = email.trim().toLowerCase();
          window.location.assign(
            `/set-password?email=${encodeURIComponent(normalized)}`,
          );
          return;
        }
        setError(
          err.message || 'Sign in failed. Check your email and password.',
        );
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return { submit, loading, error, clearError };
}
