'use client';

import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Mail,
} from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { formatApiDate } from '@/lib/admin/project-display';
import {
  employeeInitials,
  employeeStatusClass,
  employeeStatusLabel,
  proficiencyBarWidth,
  proficiencyClass,
  proficiencyLabel,
  timesheetStatusClass,
  timesheetStatusLabel,
  totalUtilizationPct,
} from '@/lib/manager/employee-display';
import {
  formatWeekRangeLabel,
  recentMondayWeekStarts,
  weekEndFromStart,
} from '@/lib/manager/week';
import { cn } from '@/lib/utils';
import * as managerService from '@/services/manager.service';

const HISTORY_WEEKS = 6;

/**
 * @param {{ employeeId: number }} props
 */
export function ManagerEmployeeDetailPage({ employeeId }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [employee, setEmployee] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [weekHistory, setWeekHistory] = useState([]);
  const [historyOffset, setHistoryOffset] = useState(0);

  const loadEmployee = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await managerService.getEmployee(employeeId);
      setEmployee(data);
    } catch (err) {
      setError(err.message || 'Failed to load employee.');
      setEmployee(null);
    } finally {
      setLoading(false);
    }
  }, [employeeId]);

  const weekStarts = useMemo(() => {
    const base = recentMondayWeekStarts(HISTORY_WEEKS + historyOffset);
    return base.slice(historyOffset, historyOffset + HISTORY_WEEKS);
  }, [historyOffset]);

  const loadHistory = useCallback(async () => {
    if (!employee) return;
    setHistoryLoading(true);
    try {
      const results = await Promise.all(
        weekStarts.map((weekStart) =>
          managerService.listTimesheetsForWeek(weekStart).catch(() => ({
            weekStart,
            items: [],
            missingSubmissions: [],
          })),
        ),
      );
      const cards = results.map((payload, index) => {
        const weekStart = weekStarts[index];
        const weekEnd = weekEndFromStart(weekStart);
        const item = (payload.items ?? []).find(
          (row) => row.employeeId === employeeId,
        );
        const missing = (payload.missingSubmissions ?? []).some(
          (m) => m.employeeId === employeeId,
        );
        return {
          weekStart,
          weekEnd,
          label: formatWeekRangeLabel(weekStart, weekEnd),
          totalHours: item?.totalHours ?? 0,
          status: item?.status ?? (missing ? 'MISSING' : null),
          hasData: Boolean(item),
          projects: [
            ...new Set(
              (item?.entries ?? [])
                .map((e) => e.projectName)
                .filter(Boolean),
            ),
          ],
        };
      });
      setWeekHistory(cards);
    } finally {
      setHistoryLoading(false);
    }
  }, [employee, employeeId, weekStarts]);

  useEffect(() => {
    loadEmployee();
  }, [loadEmployee]);

  useEffect(() => {
    if (employee) loadHistory();
  }, [employee, loadHistory]);

  const utilization = useMemo(
    () => totalUtilizationPct(employee?.allocations ?? []),
    [employee],
  );

  const statusStyle = employeeStatusClass(employee?.status);
  const initials = employeeInitials(employee?.fullName);

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 p-16 text-slate-500">
        <Loader2 className="h-6 w-6 animate-spin" />
        Loading employee…
      </div>
    );
  }

  if (error || !employee) {
    return (
      <main className="p-8">
        <Link
          href="/manager/employees"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back to direct reports
        </Link>
        <p
          role="alert"
          className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          {error || 'Employee not found.'}
        </p>
      </main>
    );
  }

  return (
    <main className="p-8">
      <Link
        href="/manager/employees"
        className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Back to direct reports
      </Link>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
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
                  {employeeStatusLabel(employee.status)}
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

        <section className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-8 lg:col-span-4">
          <div>
            <h4 className="text-lg font-semibold text-slate-900">
              Allocation load
            </h4>
            <p className="mt-1 text-sm text-slate-500">
              Sum of active allocation percentages
            </p>
          </div>
          <div className="my-6 flex items-center justify-center">
            <div className="relative flex h-32 w-32 items-center justify-center">
              <svg className="h-full w-full -rotate-90" viewBox="0 0 128 128">
                <circle
                  cx="64"
                  cy="64"
                  r="58"
                  fill="transparent"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-slate-100"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="58"
                  fill="transparent"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeDasharray={364.4}
                  strokeDashoffset={364.4 - (364.4 * Math.min(utilization, 100)) / 100}
                  className="text-slate-900"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-semibold text-slate-900">
                  {utilization}%
                </span>
                <span className="text-[11px] font-semibold uppercase text-slate-500">
                  Utilised
                </span>
              </div>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-600">
              <span>Active allocations</span>
              <span>{employee.allocations?.length ?? 0}</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-slate-900 transition-all"
                style={{ width: `${Math.min(utilization, 100)}%` }}
              />
            </div>
          </div>
        </section>

        <section className="flex flex-col rounded-xl border border-slate-200 bg-white lg:col-span-4">
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
            <h4 className="text-lg font-semibold text-slate-900">
              Core competencies
            </h4>
            <span className="text-sm text-slate-500">
              {employee.skills?.length ?? 0} skills
            </span>
          </div>
          <div className="max-h-[420px] flex-1 space-y-4 overflow-y-auto p-6">
            {(employee.skills ?? []).length === 0 ? (
              <p className="text-sm text-slate-500">No skills on profile yet.</p>
            ) : (
              employee.skills.map((skill) => (
                <SkillRow key={skill.skillId} skill={skill} />
              ))
            )}
          </div>
        </section>

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white lg:col-span-8">
          <div className="border-b border-slate-200 px-6 py-4">
            <h4 className="text-lg font-semibold text-slate-900">
              Active allocations
            </h4>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px] text-left text-sm">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  <th className="px-6 py-3">Project</th>
                  <th className="px-6 py-3">Utilisation</th>
                  <th className="px-6 py-3">From</th>
                  <th className="px-6 py-3">To</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(employee.allocations ?? []).length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center text-slate-500">
                      No active allocations — employee is on bench.
                    </td>
                  </tr>
                ) : (
                  employee.allocations.map((alloc) => (
                    <tr key={alloc.id} className="hover:bg-slate-50">
                      <td className="px-6 py-3 font-medium text-slate-900">
                        {alloc.projectId ? (
                          <Link
                            href={`/manager/projects/${alloc.projectId}`}
                            className="hover:underline"
                          >
                            {alloc.projectName}
                          </Link>
                        ) : (
                          alloc.projectName
                        )}
                      </td>
                      <td className="px-6 py-3">{alloc.utilizationPct}%</td>
                      <td className="px-6 py-3">{formatApiDate(alloc.fromDate)}</td>
                      <td className="px-6 py-3">
                        {alloc.toDate ? formatApiDate(alloc.toDate) : '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white lg:col-span-12">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 px-6 py-4">
            <div>
              <h4 className="text-lg font-semibold text-slate-900">
                Weekly timesheet history
              </h4>
              <p className="text-sm text-slate-500">
                Read-only view of the last {HISTORY_WEEKS} weeks
              </p>
            </div>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => setHistoryOffset((o) => o + HISTORY_WEEKS)}
                className="rounded-full p-2 text-slate-600 hover:bg-slate-100"
                aria-label="Older weeks"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() =>
                  setHistoryOffset((o) => Math.max(0, o - HISTORY_WEEKS))
                }
                disabled={historyOffset === 0}
                className="rounded-full p-2 text-slate-600 hover:bg-slate-100 disabled:opacity-40"
                aria-label="Newer weeks"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
          {historyLoading ? (
            <div className="flex items-center justify-center gap-2 py-12 text-slate-500">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading timesheets…
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 p-6 sm:grid-cols-3 lg:grid-cols-6">
              {[...weekHistory].reverse().map((week) => (
                <div
                  key={week.weekStart}
                  className={cn(
                    'rounded-lg border-l-4 p-4 shadow-sm transition hover:scale-[1.02]',
                    week.hasData
                      ? 'border-slate-900 bg-slate-50'
                      : 'border-slate-200 bg-white',
                  )}
                >
                  <p className="text-[11px] font-semibold uppercase text-slate-500">
                    {week.label}
                  </p>
                  <p className="mt-1 text-lg font-semibold text-slate-900">
                    {week.hasData ? (
                      <>
                        {week.totalHours}{' '}
                        <span className="text-sm font-normal">hrs</span>
                      </>
                    ) : (
                      <span className="text-sm font-normal text-slate-400">
                        No submission
                      </span>
                    )}
                  </p>
                  {week.projects.length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {week.projects.map((name) => (
                        <span
                          key={name}
                          className="h-2 w-2 rounded-full bg-slate-900"
                          title={name}
                        />
                      ))}
                    </div>
                  ) : null}
                  {week.status ? (
                    <span
                      className={cn(
                        'mt-3 inline-block rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase',
                        timesheetStatusClass(week.status),
                      )}
                    >
                      {timesheetStatusLabel(week.status)}
                    </span>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function SkillRow({ skill }) {
  const style = proficiencyClass(skill.proficiency);
  return (
    <div className="flex items-center gap-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-slate-100 text-slate-700">
        <span className="text-xs font-bold">
          {(skill.skillName || '?').slice(0, 2).toUpperCase()}
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex justify-between gap-2">
          <span className="truncate font-medium text-slate-900">
            {skill.skillName}
          </span>
          <span
            className={cn(
              'shrink-0 rounded px-2 py-0.5 text-[11px] font-semibold',
              style.badge,
            )}
          >
            {proficiencyLabel(skill.proficiency)}
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
          <div
            className={cn('h-full rounded-full', style.bar)}
            style={{ width: proficiencyBarWidth(skill.proficiency) }}
          />
        </div>
      </div>
    </div>
  );
}
