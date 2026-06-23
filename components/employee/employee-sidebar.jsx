'use client';

import { CalendarClock, LayoutGrid, LogOut } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import * as authService from '@/services/auth.service';

const NAV = [
  {
    href: '/employee/timesheets',
    label: 'Weekly timesheet',
    icon: CalendarClock,
    match: (path) => path.startsWith('/employee/timesheets'),
  },
  {
    href: '/employee/allocations',
    label: 'My allocations',
    icon: LayoutGrid,
    match: (path) => path.startsWith('/employee/allocations'),
  },
];

export function EmployeeSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    try {
      await authService.logout();
    } finally {
      router.push('/login');
      router.refresh();
    }
  }

  return (
    <aside className="fixed left-0 top-0 z-50 flex h-screen w-[240px] flex-col bg-slate-900 text-slate-300">
      <div className="px-6 py-8">
        <h1 className="text-sm font-bold tracking-tight text-white">PRM Tool</h1>
        <p className="mt-1 text-[11px] font-semibold uppercase tracking-widest text-slate-500">
          Employee portal
        </p>
      </div>

      <nav className="flex-1 space-y-1 px-2">
        {NAV.map(({ href, label, icon: Icon, match }) => {
          const active = match(pathname);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-4 py-3 text-sm transition-colors',
                active
                  ? 'border-l-4 border-slate-100 bg-slate-800 text-white'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-white',
              )}
            >
              <Icon className="h-5 w-5 shrink-0" aria-hidden />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-800 p-4">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
        >
          <LogOut className="h-5 w-5" aria-hidden />
          Logout
        </button>
      </div>
    </aside>
  );
}
