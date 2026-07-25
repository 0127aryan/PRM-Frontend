'use client';

import { AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  allocationCoversWeek,
  DEFAULT_MAX_WEEKLY_HOURS,
  formatWeekHeading,
  maxHoursForAllocation,
} from '@/lib/employee/timesheet-display';
import { weekEndFromStart } from '@/lib/manager/week';
import { cn } from '@/lib/utils';
import * as employeeService from '@/services/employee.service';

/**
 * @typedef {object} ProjectRowState
 * @property {number} projectId
 * @property {string} projectName
 * @property {number} utilizationPct
 * @property {number} hours
 * @property {number[]} selectedTagIds
 * @property {string} otherText
 */

/**
 * @param {{
 *   weekStart: string,
 *   allocations: Array<object>,
 *   activityTags: Array<{ id: number, name: string }>,
 *   existingWeek: object | null,
 *   onSubmitted: () => void,
 * }} props
 */
export function SubmitTimesheetForm({
  weekStart,
  allocations,
  activityTags,
  existingWeek,
  onSubmitted,
}) {
  const weekEnd = weekEndFromStart(weekStart);
  const isSubmitted = existingWeek?.status === 'SUBMITTED';
  const otherTag = useMemo(
    () => activityTags.find((t) => t.name?.toLowerCase() === 'other'),
    [activityTags],
  );

  const weekAllocations = useMemo(
    () =>
      allocations.filter((a) =>
        allocationCoversWeek(a, weekStart, weekEnd),
      ),
    [allocations, weekStart, weekEnd],
  );

  const [rows, setRows] = useState(/** @type {ProjectRowState[]} */ ([]));
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isSubmitted && existingWeek) {
      setRows(
        (existingWeek.entries ?? []).map((e) => ({
          projectId: e.projectId,
          projectName: e.projectName,
          utilizationPct:
            weekAllocations.find((a) => a.projectId === e.projectId)
              ?.utilizationPct ?? 0,
          hours: e.hours,
          selectedTagIds: (e.tags ?? [])
            .map((t) => t.activityTagId)
            .filter(Boolean),
          otherText:
            (e.tags ?? []).find((t) => t.otherText)?.otherText ?? '',
        })),
      );
      return;
    }

    setRows(
      weekAllocations.map((a) => ({
        projectId: a.projectId,
        projectName: a.projectName,
        utilizationPct: a.utilizationPct,
        hours: 0,
        selectedTagIds: [],
        otherText: '',
      })),
    );
  }, [weekAllocations, existingWeek, isSubmitted]);

  const totalHours = useMemo(
    () => rows.reduce((s, r) => s + Number(r.hours || 0), 0),
    [rows],
  );

  const maxWeekly = DEFAULT_MAX_WEEKLY_HOURS;

  function updateRow(projectId, patch) {
    setRows((prev) =>
      prev.map((r) => (r.projectId === projectId ? { ...r, ...patch } : r)),
    );
  }

  function toggleTag(projectId, tagId) {
    setRows((prev) =>
      prev.map((r) => {
        if (r.projectId !== projectId) return r;
        const has = r.selectedTagIds.includes(tagId);
        return {
          ...r,
          selectedTagIds: has
            ? r.selectedTagIds.filter((id) => id !== tagId)
            : [...r.selectedTagIds, tagId],
        };
      }),
    );
  }

  const validateClient = useCallback(() => {
    const withHours = rows.filter((r) => r.hours > 0);
    if (withHours.length === 0) {
      return 'Enter hours for at least one project.';
    }
    if (totalHours > maxWeekly) {
      return `Total hours (${totalHours}) cannot exceed ${maxWeekly}h.`;
    }
    for (const row of withHours) {
      const cap = maxHoursForAllocation(row.utilizationPct, maxWeekly);
      if (row.hours > cap) {
        return `${row.projectName}: max ${cap}h this week (${row.utilizationPct}% allocation).`;
      }
      if (row.selectedTagIds.length === 0) {
        return `${row.projectName}: select at least one activity tag.`;
      }
      if (
        otherTag &&
        row.selectedTagIds.includes(otherTag.id) &&
        (!row.otherText || row.otherText.trim().length < 2)
      ) {
        return `${row.projectName}: describe "Other" activity (2–40 characters).`;
      }
    }
    return '';
  }, [rows, totalHours, maxWeekly, otherTag]);

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage('');
    setError('');
    const clientErr = validateClient();
    if (clientErr) {
      setError(clientErr);
      return;
    }

    const entries = rows
      .filter((r) => r.hours > 0)
      .map((r) => ({
        projectId: r.projectId,
        hours: r.hours,
        tags: r.selectedTagIds.map((activityTagId) => {
          if (otherTag && activityTagId === otherTag.id) {
            return { activityTagId, otherText: r.otherText.trim() };
          }
          return { activityTagId };
        }),
      }));

    setSubmitting(true);
    try {
      await employeeService.submitTimesheet({ weekStart, entries });
      setMessage('Timesheet submitted successfully.');
      onSubmitted();
    } catch (err) {
      setError(err.message || 'Could not submit timesheet.');
    } finally {
      setSubmitting(false);
    }
  }

  if (weekAllocations.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-white px-8 py-12 text-center">
        <p className="font-medium text-slate-900">No allocations for this week</p>
        <p className="mt-2 text-sm text-slate-500">
          You need an active project allocation covering{' '}
          {formatWeekHeading(weekStart, weekEnd)} before you can log hours.
        </p>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center gap-2 border-b border-slate-200 bg-emerald-50 px-6 py-3 text-sm text-emerald-800">
          <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden />
          Submitted — {existingWeek.totalHours}h total
          {existingWeek.submittedAt
            ? ` on ${new Date(existingWeek.submittedAt).toLocaleString()}`
            : ''}
        </div>
        <div className="divide-y divide-slate-100">
          {rows.map((row) => (
            <div key={row.projectId} className="px-6 py-4">
              <div className="flex justify-between gap-4">
                <p className="font-semibold text-slate-900">{row.projectName}</p>
                <p className="font-medium text-slate-900">{row.hours}h</p>
              </div>
              <p className="mt-2 text-sm text-slate-600">
                {(existingWeek.entries ?? [])
                  .find((e) => e.projectId === row.projectId)
                  ?.tags?.map((t) => t.activityTagName || t.otherText)
                  .filter(Boolean)
                  .join(', ') || '—'}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error ? (
        <p
          role="alert"
          className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {message}
        </p>
      ) : null}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="grid grid-cols-12 gap-0 border-b border-slate-200 bg-slate-50 px-6 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          <div className="col-span-4">Project</div>
          <div className="col-span-2 text-center">Hours</div>
          <div className="col-span-2 text-center">Max</div>
          <div className="col-span-4">Activity tags</div>
        </div>

        <div className="divide-y divide-slate-100">
          {rows.map((row) => {
            const cap = maxHoursForAllocation(row.utilizationPct, maxWeekly);
            const showOther =
              otherTag && row.selectedTagIds.includes(otherTag.id);
            return (
              <div
                key={row.projectId}
                className="px-6 py-4 hover:bg-slate-50/80"
              >
                <div className="grid grid-cols-12 items-start gap-4">
                  <div className="col-span-4">
                    <p className="font-semibold text-slate-900">
                      {row.projectName}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {row.utilizationPct}% allocation
                    </p>
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      min={0}
                      max={cap}
                      step={1}
                      value={row.hours || ''}
                      onChange={(e) =>
                        updateRow(row.projectId, {
                          hours: Math.max(0, parseInt(e.target.value, 10) || 0),
                        })
                      }
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-center text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                      aria-label={`Hours for ${row.projectName}`}
                    />
                  </div>
                  <div className="col-span-2 pt-2 text-center text-sm text-slate-600">
                    {cap}h
                  </div>
                  <div className="col-span-4">
                    <div className="flex flex-wrap gap-2">
                      {activityTags.map((tag) => (
                        <label
                          key={tag.id}
                          className={cn(
                            'cursor-pointer rounded-full border px-2.5 py-1 text-xs font-medium transition-colors',
                            row.selectedTagIds.includes(tag.id)
                              ? 'border-slate-900 bg-slate-900 text-white'
                              : 'border-slate-200 bg-white text-slate-600 hover:border-slate-400',
                          )}
                        >
                          <input
                            type="checkbox"
                            className="sr-only"
                            checked={row.selectedTagIds.includes(tag.id)}
                            onChange={() => toggleTag(row.projectId, tag.id)}
                          />
                          {tag.name}
                        </label>
                      ))}
                    </div>
                    {showOther ? (
                      <input
                        type="text"
                        minLength={2}
                        maxLength={40}
                        value={row.otherText}
                        onChange={(e) =>
                          updateRow(row.projectId, { otherText: e.target.value })
                        }
                        placeholder="Describe other activity (2–40 chars)"
                        className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                      />
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-4">
          <span className="font-semibold text-slate-900">Weekly total</span>
          <span
            className={cn(
              'text-lg font-bold',
              totalHours > maxWeekly ? 'text-red-600' : 'text-slate-900',
            )}
          >
            {totalHours} / {maxWeekly}h
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="flex items-center gap-2 text-sm text-slate-500">
          {totalHours > 0 && !validateClient() ? (
            <>
              <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden />
              Ready to submit
            </>
          ) : (
            <>
              <AlertTriangle className="h-4 w-4 text-amber-500" aria-hidden />
              Whole hours only; at least one project with tags
            </>
          )}
        </p>
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-8 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
        >
          {submitting ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : null}
          Submit week
        </button>
      </div>
    </form>
  );
}
