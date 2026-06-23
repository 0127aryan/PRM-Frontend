import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  timesheetStatusClass,
  timesheetStatusLabel,
} from '@/lib/manager/employee-display';

export function EmployeeDetailTimesheetHistory({
  weekHistory,
  historyLoading,
  historyOffset,
  setHistoryOffset,
  historyWeeks,
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white lg:col-span-12">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 px-6 py-4">
        <div>
          <h4 className="text-lg font-semibold text-slate-900">
            Weekly timesheet history
          </h4>
          <p className="text-sm text-slate-500">
            Read-only view of the last {historyWeeks} weeks
          </p>
        </div>

        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => setHistoryOffset((o) => o + historyWeeks)}
            className="rounded-full p-2 text-slate-600 hover:bg-slate-100"
            aria-label="Older weeks"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() =>
              setHistoryOffset((o) => Math.max(0, o - historyWeeks))
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
  );
}
