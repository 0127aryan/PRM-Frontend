'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import * as authService from '@/services/auth.service';

/**
 * @param {{ requiredRole?: string }} [options]
 */
export function useCurrentUser(options = {}) {
  const router = useRouter();
  const { requiredRole } = options;
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const me = await authService.getCurrentUser();
      const role = String(me.role ?? '').toUpperCase();
      const need = requiredRole ? String(requiredRole).toUpperCase() : null;
      if (need && role !== need) {
        router.replace('/login');
        return null;
      }
      setUser(me);
      return me;
    } catch {
      router.replace('/login');
      return null;
    } finally {
      setLoading(false);
    }
  }, [requiredRole, router]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { user, loading, refresh };
}
