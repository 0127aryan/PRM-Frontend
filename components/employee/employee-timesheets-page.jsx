'use client';

import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { SubmitTimesheetForm } from '@/components/employee/submit-timesheet-form';
import {
  formatWeekHeading,
  timesheetWeekStatusClass,
  timesheetWeekStatusLabel,
} from '@/lib/employee/timesheet-display';
import {
  formatWeekRangeLabel,
  mondayOnOrBefore,
  recentMondayWeekStarts,
  weekEndFromStart,
} from '@/lib/manager/week';
import { cn } from '@/lib/utils';
import * as employeeService from '@/services/employee.service';

const WEEK_OPTIONS = 12;

export function EmployeeTimesheetsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [allocations, setAllocations] = useState([]);
  const [activityTags, setActivityTags] = useState([]);
  const [history, setHistory] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [weekStart, setWeekStart] = useState(() => {
    const today = new Date().toISOString().slice(0, 10);
    return mondayOnOrBefore(today);
  });
  const [existingWeek, setExistingWeek] = useState(null);
  const [weekLoading, setWeekLoading] = useState(false);
  const [selectedHistoryId, setSelectedHistoryId] = useState(null);

  const weekOptions = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return recentMondayWeekStarts(WEEK_OPTIONS).filter((m) => m <= today);
  }, []);

  const loadBase = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [allocs, tags, ts, rem] = await Promise.all([
        employeeService.listAllocations(),
        employeeService.listActivityTags(),
        employeeService.listTimesheets(),
        employeeService.missedReminders(),
      ]);
      setAllocations(allocs);
      setActivityTags(tags);
      setHistory(ts.items ?? []);
      setReminders(rem.reminders ?? []);
    } catch (err) {
      setError(err.message || 'Failed to load timesheet data.');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadWeek = useCallback(async () => {
    if (!weekStart) return;
    setWeekLoading(true);
    try {
      const res = await employeeService.listTimesheets(weekStart);
      setExistingWeek(res.items?.[0] ?? null);
    } catch {
      setExistingWeek(null);
    } finally {
      setWeekLoading(false);
    }
  }, [weekStart]);

  useEffect(() => {
    loadBase();
  }, [loadBase]);

  useEffect(() => {
    loadWeek();
  }, [loadWeek]);

  const weekEnd = weekStart ? weekEndFromStart(weekStart) : '';
  const weekLabel = weekStart
    ? formatWeekHeading(weekStart, weekEnd).toUpperCase()
    : '';

  const weekIndex = weekOptions.indexOf(weekStart);

  function goOlderWeek() {
    if (weekIndex < weekOptions.length - 1) {
      setWeekStart(weekOptions[weekIndex + 1]);
    }
  }

  function goNewerWeek() {
    if (weekIndex > 0) {
      setWeekStart(weekOptions[weekIndex - 1]);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 p-16 text-slate-500">
        <Loader2 className="h-6 w-6 animate-spin" />
        Loading timesheets…
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col lg:flex-row">
      <div className="flex-1 p-8">
        {error ? (
          <p
            role="alert"
            className="mb-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          >
            {error}
          </p>
        ) : null}

        {reminders.length > 0 ? (
          <div className="mb-6 space-y-2">
            {reminders.slice(0, 3).map((r) => (
              <div
                key={r.weekStart}
                className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
              >
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                <p>
                  {r.message} for week{' '}
                  <button
                    type="button"
                    className="font-semibold underline"
                    onClick={() => setWeekStart(r.weekStart)}
                  >
                    {formatWeekHeading(r.weekStart, r.weekEnd)}
                  </button>
                </p>
              </div>
            ))}
          </div>
        ) : null}

        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={goOlderWeek}
              disabled={weekIndex >= weekOptions.length - 1}
              className="rounded-full p-2 text-slate-600 hover:bg-slate-200 disabled:opacity-40"
              aria-label="Previous week"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <select
              value={weekStart}
              onChange={(e) => setWeekStart(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
              aria-label="Select week"
            >
              {weekOptions.map((m) => (
                <option key={m} value={m}>
                  {formatWeekRangeLabel(m, weekEndFromStart(m))}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={goNewerWeek}
              disabled={weekIndex <= 0}
              className="rounded-full p-2 text-slate-600 hover:bg-slate-200 disabled:opacity-40"
              aria-label="Next week"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {weekLabel}
          </p>
        </div>

        {weekLoading ? (
          <div className="flex items-center gap-2 py-12 text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading week…
          </div>
        ) : (
          <SubmitTimesheetForm
            weekStart={weekStart}
            allocations={allocations}
            activityTags={activityTags}
            existingWeek={existingWeek}
            onSubmitted={async () => {
              await loadBase();
              await loadWeek();
            }}
          />
        )}
      </div>

      <aside className="w-full shrink-0 border-t border-slate-200 bg-slate-100 p-6 lg:w-[320px] lg:border-l lg:border-t-0">
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          Past weeks
        </h3>
        <div className="mt-4 max-h-[calc(100vh-12rem)] space-y-3 overflow-y-auto">
          {history.length === 0 ? (
            <p className="text-sm text-slate-500">No submitted timesheets yet.</p>
          ) : (
            history.map((week) => (
              <button
                key={week.timesheetWeekId}
                type="button"
                onClick={() =>
                  setSelectedHistoryId(
                    selectedHistoryId === week.timesheetWeekId
                      ? null
                      : week.timesheetWeekId,
                  )
                }
                className={cn(
                  'w-full rounded-xl border bg-white p-4 text-left shadow-sm transition hover:border-slate-400 hover:shadow-md',
                  selectedHistoryId === week.timesheetWeekId
                    ? 'border-slate-900'
                    : 'border-slate-200',
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-sm font-bold text-slate-900">
                    {formatWeekRangeLabel(week.weekStart, week.weekEnd)}
                  </span>
                  <span
                    className={cn(
                      'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase',
                      timesheetWeekStatusClass(week.status),
                    )}
                  >
                    {timesheetWeekStatusLabel(week.status)}
                  </span>
                </div>
                <p className="mt-2 text-lg font-semibold text-slate-900">
                  {week.totalHours}
                  <span className="text-sm font-normal text-slate-500"> hrs</span>
                </p>
                {selectedHistoryId === week.timesheetWeekId ? (
                  <ul className="mt-3 space-y-2 border-t border-slate-100 pt-3 text-xs text-slate-600">
                    {(week.entries ?? []).map((e) => (
                      <li key={e.id}>
                        <span className="font-medium text-slate-800">
                          {e.projectName}
                        </span>
                        {' — '}
                        {e.hours}h (
                        {(e.tags ?? [])
                          .map((t) => t.activityTagName || t.otherText)
                          .filter(Boolean)
                          .join(', ') || '—'}
                        )
                      </li>
                    ))}
                  </ul>
                ) : null}
              </button>
            ))
          )}
        </div>

      </aside>
    </div>
  );
}
