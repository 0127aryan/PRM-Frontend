import { Mail } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  employeeInitials,
  employeeStatusClass,
  employeeStatusLabel,
} from '@/lib/manager/employee-display';

export function EmployeeDetailProfile({ employee }) {
  const statusStyle = employeeStatusClass(employee?.status, employee?.accountStatus);
  const initials = employeeInitials(employee?.fullName);

  return (
    <section className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-8 lg:col-span-8">
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-bl-full bg-slate-900/5" />
      <div className="flex flex-col gap-8 md:flex-row md:items-start">
        <div
          className={cn(
            'flex h-28 w-28 shrink-0 items-center justify-center rounded-lg border-2 border-slate-200 text-2xl font-bold',
            statusStyle.avatar,
          )}
        >
          {initials}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h3 className="text-2xl font-semibold text-slate-900">
                {employee.fullName}
              </h3>
              <p className="mt-1 text-slate-600">
                {employee.designation || employee.department || '—'}
              </p>
            </div>
            <span
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide',
                statusStyle.badge,
              )}
            >
              <span className={cn('h-1.5 w-1.5 rounded-full', statusStyle.dot)} />
              {employeeStatusLabel(employee.status, employee.accountStatus)}
            </span>
          </div>

          <dl className="mt-6 grid grid-cols-2 gap-6 sm:grid-cols-3">
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Employee ID
              </dt>
              <dd className="mt-1 font-medium text-slate-900">
                {employee.employeeCode}
              </dd>
            </div>
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Department
              </dt>
              <dd className="mt-1 font-medium text-slate-900">
                {employee.department || '—'}
              </dd>
            </div>
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Email
              </dt>
              <dd className="mt-1 font-medium text-slate-900 break-all">
                {employee.email}
              </dd>
            </div>
          </dl>
          <a
            href={`mailto:${employee.email}`}
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
          >
            <Mail className="h-4 w-4" aria-hidden />
            Email {employee.fullName.split(' ')[0]}
          </a>
        </div>
      </div>
    </section>
  );
}
