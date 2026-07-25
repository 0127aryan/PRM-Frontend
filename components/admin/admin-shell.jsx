'use client';

import { Loader2 } from 'lucide-react';
import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { AdminTopBar } from '@/components/admin/admin-top-bar';
import { useCurrentUser } from '@/hooks/useCurrentUser';

/**
 * @param {{ children: React.ReactNode, title: string, subtitle?: string }} props
 */
export function AdminShell({ children, title, subtitle }) {
  const { user, loading } = useCurrentUser({ requiredRole: 'ADMIN' });

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-slate-600" aria-label="Loading" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-8">
        <p className="max-w-md text-center text-sm text-slate-600">
          Could not verify your admin session. Sign in again at{' '}
          <a href="/login" className="font-semibold text-slate-900 underline">
            /login
          </a>{' '}
          using <strong>http://localhost:3001</strong> (not 127.0.0.1).
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminSidebar />
      <div className="ml-[240px] flex min-h-screen flex-col">
        <AdminTopBar title={title} subtitle={subtitle} user={user} />
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}
