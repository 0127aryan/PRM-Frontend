'use client';

import { Loader2, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import {
  formatAllocationDate,
  remainingUtilizationPct,
} from '@/lib/manager/allocation-display';
import * as managerService from '@/services/manager.service';

/**
 * @param {{ open: boolean, projectId: number, employees: object[], presetEmployee?: object | null, onClose: () => void, onCreated: () => void }} props
 */
export function AllocateEmployeeModal({
  open,
  projectId,
  employees,
  presetEmployee = null,
  onClose,
  onCreated,
}) {
  const lockedEmployee = presetEmployee
    ? {
        id: presetEmployee.employeeId ?? presetEmployee.id,
        fullName: presetEmployee.fullName,
        employeeCode: presetEmployee.employeeCode,
      }
    : null;
  const employeeOptions = lockedEmployee ? [lockedEmployee] : employees;

  const [employeeId, setEmployeeId] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [utilizationPct, setUtilizationPct] = useState(100);
  const [submitting, setSubmitting] = useState(false);
  const [loadingEmployee, setLoadingEmployee] = useState(false);
  const [activeAllocations, setActiveAllocations] = useState([]);
  const [error, setError] = useState('');

  const maxUtilization = useMemo(
    () => remainingUtilizationPct(activeAllocations, fromDate, toDate),
    [activeAllocations, fromDate, toDate],
  );

  useEffect(() => {
    if (!open) return;
    const initialId = lockedEmployee ? String(lockedEmployee.id) : '';
    setEmployeeId(initialId);
    setFromDate('');
    setToDate('');
    setUtilizationPct(0);
    setActiveAllocations([]);
    setError('');

    function onKey(e) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose, lockedEmployee?.id]);

  useEffect(() => {
    if (!open || !employeeId) {
      setActiveAllocations([]);
      return;
    }

    let cancelled = false;
    setLoadingEmployee(true);
    managerService
      .getEmployee(Number(employeeId))
      .then((profile) => {
        if (cancelled) return;
        setActiveAllocations(
          (profile.allocations ?? []).filter((a) => a.isActive !== false),
        );
      })
      .catch(() => {
        if (!cancelled) setActiveAllocations([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingEmployee(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, employeeId]);

  useEffect(() => {
    if (!open || !fromDate || !toDate) return;
    setUtilizationPct((current) => {
      if (maxUtilization <= 0) return 0;
      if (!current || current > maxUtilization) {
        return maxUtilization;
      }
      return current;
    });
  }, [open, fromDate, toDate, maxUtilization]);

  const sameProjectAllocation = useMemo(
    () =>
      activeAllocations.find(
        (a) => Number(a.projectId) === Number(projectId),
      ) ?? null,
    [activeAllocations, projectId],
  );

  const datesSelected = Boolean(fromDate && toDate);

  if (!open) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!employeeId || !fromDate || !toDate) {
      setError('Select an employee and allocation dates.');
      return;
    }
    if (fromDate > toDate) {
      setError('Start date must be on or before end date.');
      return;
    }
    if (maxUtilization <= 0) {
      setError(
        'This employee is already at 100% utilization for the selected dates. Pick different dates, lower existing allocations, or end an active allocation first.',
      );
      return;
    }
    const pct = Number(utilizationPct);
    if (!pct || pct > maxUtilization) {
      setError(
        `Utilization must be between 1% and ${maxUtilization}% for the selected dates.`,
      );
      return;
    }

    setSubmitting(true);
    try {
      await managerService.createAllocation({
        projectId,
        employeeId: Number(employeeId),
        fromDate,
        toDate,
        utilizationPct: pct,
      });
      onCreated();
      onClose();
    } catch (err) {
      setError(err.message || 'Could not create allocation.');
    } finally {
      setSubmitting(false);
    }
  }

  const selectedEmployee = employeeOptions.find(
    (e) => String(e.id) === employeeId,
  );

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      <div className="flex w-full max-w-lg flex-col border border-slate-200 bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">
            Allocate employee
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-slate-400 hover:bg-slate-200"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          {error ? (
            <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          ) : null}
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
              Employee
            </label>
            {lockedEmployee ? (
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900">
                {lockedEmployee.fullName} ({lockedEmployee.employeeCode})
              </div>
            ) : (
              <select
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                required
              >
                <option value="">Select direct report…</option>
                {employeeOptions.map((e) => (
                  <option key={e.id} value={String(e.id)}>
                    {e.fullName} ({e.employeeCode})
                  </option>
                ))}
              </select>
            )}
            {employeeOptions.length === 0 ? (
              <p className="mt-2 text-xs text-amber-800">
                No direct reports found. Ask admin to assign employees to you.
              </p>
            ) : null}
          </div>

          {employeeId && loadingEmployee ? (
            <p className="text-xs text-slate-500">Loading current allocations…</p>
          ) : null}

          {employeeId && activeAllocations.length > 0 ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
              <p className="font-semibold">Active allocations</p>
              <ul className="mt-2 space-y-1 text-xs">
                {activeAllocations.map((a) => (
                  <li key={a.id}>
                    {a.projectName ?? `Project #${a.projectId}`}:{' '}
                    {a.utilizationPct}% · {formatAllocationDate(a.fromDate)} –{' '}
                    {formatAllocationDate(a.toDate)}
                    {Number(a.projectId) === Number(projectId) ? (
                      <span className="ml-1 font-semibold">(this project)</span>
                    ) : null}
                  </li>
                ))}
              </ul>
              {sameProjectAllocation && !datesSelected ? (
                <p className="mt-2 text-xs">
                  This employee is already on the selected project. Pick dates
                  to see how much additional utilization is available (max 100%
                  total across overlapping dates).
                </p>
              ) : null}
              {datesSelected ? (
                maxUtilization > 0 ? (
                  <p className="mt-2 text-xs">
                    Available for selected dates:{' '}
                    <span className="font-semibold">{maxUtilization}%</span>
                    {sameProjectAllocation
                      ? ' (includes existing allocation on this project)'
                      : ''}
                  </p>
                ) : (
                  <p className="mt-2 text-xs font-semibold">
                    No utilization left for these dates — choose different dates
                    or end an existing allocation first.
                  </p>
                )
              ) : (
                <p className="mt-2 text-xs">
                  Pick from/to dates to calculate available utilization.
                </p>
              )}
            </div>
          ) : null}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
                From date
              </label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm"
                required
              />
            </div>
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
                To date
              </label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm"
                required
              />
            </div>
          </div>
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
              Utilization
              {datesSelected ? (
                <span className="ml-2 font-normal normal-case text-slate-500">
                  {utilizationPct}% · max {maxUtilization}%
                </span>
              ) : (
                <span className="ml-2 font-normal normal-case text-slate-500">
                  select dates first
                </span>
              )}
            </label>
            <input
              type="range"
              min={maxUtilization > 0 ? 1 : 0}
              max={Math.max(maxUtilization, 1)}
              value={utilizationPct || 0}
              onChange={(e) => setUtilizationPct(Number(e.target.value))}
              disabled={!datesSelected || maxUtilization <= 0}
              className="w-full accent-slate-900 disabled:opacity-40"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                submitting ||
                employeeOptions.length === 0 ||
                !selectedEmployee ||
                !datesSelected ||
                maxUtilization <= 0 ||
                utilizationPct <= 0
              }
              className="flex-1 bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
            >
              {submitting ? (
                <Loader2 className="mx-auto h-5 w-5 animate-spin" />
              ) : (
                'Confirm allocation'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
