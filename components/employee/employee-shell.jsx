'use client';

import { Loader2 } from 'lucide-react';
import { EmployeeSidebar } from '@/components/employee/employee-sidebar';
import { EmployeeTopBar } from '@/components/employee/employee-top-bar';
import { useCurrentUser } from '@/hooks/useCurrentUser';

/**
 * @param {{ children: React.ReactNode, title: string, subtitle?: string }} props
 */
export function EmployeeShell({ children, title, subtitle }) {
  const { user, loading } = useCurrentUser({ requiredRole: 'EMPLOYEE' });

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
          Could not verify your employee session. Sign in again at{' '}
          <a href="/login" className="font-semibold text-slate-900 underline">
            /login
          </a>{' '}
          using <strong>http://localhost:3001</strong>.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <EmployeeSidebar />
      <div className="ml-[240px] flex min-h-screen flex-col">
        <EmployeeTopBar title={title} subtitle={subtitle} user={user} />
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}
