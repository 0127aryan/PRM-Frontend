'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { getHomePathForRole } from '@/lib/auth';
import { isPasswordValid, PRM_PASSWORD_MESSAGE } from '@/lib/auth/password-rules';
import * as authService from '@/services/auth.service';

/**
 * @returns {{
 *   email: string,
 *   setEmail: (value: string) => void,
 *   eligibility: 'idle' | 'checking' | 'eligible' | 'ineligible',
 *   submit: (password: string, confirmPassword: string) => Promise<void>,
 *   loading: boolean,
 *   error: string,
 *   success: boolean,
 * }}
 */
export function useSetPassword() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState(
    () => searchParams.get('email')?.trim() || '',
  );
  const [eligibility, setEligibility] = useState('idle');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fromUrl = searchParams.get('email')?.trim();
    if (fromUrl) setEmail(fromUrl);
  }, [searchParams]);

  useEffect(() => {
    const normalized = email.trim().toLowerCase();
    if (!normalized || !normalized.includes('@')) {
      setEligibility('idle');
      return;
    }

    let cancelled = false;
    setEligibility('checking');

    const timer = setTimeout(async () => {
      try {
        const result = await authService.validateSetupEligibility(normalized);
        if (cancelled) return;
        setEligibility(result.eligible ? 'eligible' : 'ineligible');
      } catch {
        if (!cancelled) setEligibility('idle');
      }
    }, 400);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [email]);

  const submit = useCallback(
    async (password, confirmPassword) => {
      setError('');
      const normalizedEmail = email.trim().toLowerCase();

      if (!normalizedEmail) {
        setError('Enter the work email your administrator registered for you.');
        return;
      }

      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }

      if (!isPasswordValid(password)) {
        setError(PRM_PASSWORD_MESSAGE);
        return;
      }

      setLoading(true);
      try {
        const result = await authService.setPassword({
          email: normalizedEmail,
          password,
        });
        setSuccess(true);
        setTimeout(() => {
          router.push(getHomePathForRole(result.user.role));
          router.refresh();
        }, 1500);
      } catch (err) {
        setError(
          err.message ||
            'Could not set password. Check your email or contact your administrator.',
        );
      } finally {
        setLoading(false);
      }
    },
    [email, router],
  );

  return {
    email,
    setEmail,
    eligibility,
    submit,
    loading,
    error,
    success,
  };
}
