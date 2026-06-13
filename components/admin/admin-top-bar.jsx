'use client';

import { Calendar } from 'lucide-react';
import { formatDateDDMMYYYY } from '@/lib/format';
import { NotificationCenter } from '@/components/ui/notification-center';

/**
 * @param {{ title: string, subtitle?: string, user?: { email?: string, username?: string } | null }} props
 */
export function AdminTopBar({ title, subtitle, user }) {
  const displayName = user?.username || user?.email || 'Admin';
  const today = formatDateDDMMYYYY();

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-8">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        {subtitle ? (
          <p className="text-xs text-slate-500">{subtitle}</p>
        ) : null}
      </div>
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Calendar className="h-4 w-4 text-slate-900" aria-hidden />
          <span>{today}</span>
        </div>
        <NotificationCenter />
        <div className="h-8 w-px bg-slate-200" />
        <div className="text-right">
          <p className="text-sm font-medium text-slate-900">{displayName}</p>
          <p className="text-[10px] uppercase tracking-wide text-slate-500">
            Administrator
          </p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-sm font-semibold text-slate-700">
          {displayName.charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  );
}
