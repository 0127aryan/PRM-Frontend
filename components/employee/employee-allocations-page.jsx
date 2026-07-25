'use client';

import { Briefcase, Loader2 } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { formatApiDate, projectStatusLabel } from '@/lib/admin/project-display';
import {
  allocationProjectStatusLabel,
  totalAllocationPct,
} from '@/lib/employee/timesheet-display';
import { cn } from '@/lib/utils';
import * as employeeService from '@/services/employee.service';

export function EmployeeAllocationsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [allocations, setAllocations] = useState([]);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await employeeService.listAllocations();
      setAllocations(data);
    } catch (err) {
      setError(err.message || 'Failed to load allocations.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const totalPct = useMemo(
    () => totalAllocationPct(allocations),
    [allocations],
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 p-16 text-slate-500">
        <Loader2 className="h-6 w-6 animate-spin" />
        Loading allocations…
      </div>
    );
  }

  return (
    <main className="p-8">
      {error ? (
        <p
          role="alert"
          className="mb-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          {error}
        </p>
      ) : null}

      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Total utilisation
          </p>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-semibold text-blue-600">
              {totalPct}%
            </span>
            <span className="mb-1 text-sm text-slate-500">of capacity</span>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-blue-600 transition-all"
              style={{ width: `${Math.min(totalPct, 100)}%` }}
            />
          </div>
        </div>
        <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-6">
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Active projects
            </p>
            <p className="text-2xl font-semibold text-slate-900">
              {allocations.length}
            </p>
          </div>
          <Briefcase className="h-10 w-10 text-slate-400" aria-hidden />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left text-sm">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <th className="border-b border-slate-200 px-6 py-4">Project</th>
                <th className="border-b border-slate-200 px-6 py-4">
                  Project manager
                </th>
                <th className="border-b border-slate-200 px-6 py-4">Allocation</th>
                <th className="border-b border-slate-200 px-6 py-4">Date range</th>
                <th className="border-b border-slate-200 px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {allocations.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-16 text-center text-slate-500"
                  >
                    No active allocations. Your manager will assign you to
                    projects when needed.
                  </td>
                </tr>
              ) : (
                allocations.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-900">
                        {row.projectName}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      {row.managerName ? (
                        <div>
                          <p className="font-medium text-slate-900">
                            {row.managerName}
                          </p>
                          {row.managerEmail ? (
                            <p className="text-xs text-slate-500">
                              {row.managerEmail}
                            </p>
                          ) : null}
                        </div>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="w-12 font-bold text-slate-900">
                          {row.utilizationPct}%
                        </span>
                        <div className="h-1.5 min-w-[80px] flex-1 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-blue-600"
                            style={{
                              width: `${Math.min(row.utilizationPct, 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-700">
                      {formatApiDate(row.fromDate)} –{' '}
                      {formatApiDate(row.toDate)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase',
                          row.projectStatus === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-800'
                            : 'bg-slate-100 text-slate-700',
                        )}
                      >
                        <span
                          className={cn(
                            'h-1.5 w-1.5 rounded-full',
                            row.projectStatus === 'ACTIVE'
                              ? 'bg-emerald-600'
                              : 'bg-slate-400',
                          )}
                        />
                        {allocationProjectStatusLabel(row.projectStatus) ||
                          projectStatusLabel(row.projectStatus)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
