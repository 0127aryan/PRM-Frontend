'use client';

import {
  ArrowLeft,
  Loader2,
  Unlock,
} from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { totalUtilizationPct } from '@/lib/manager/employee-display';
import {
  formatWeekRangeLabel,
  recentMondayWeekStarts,
  weekEndFromStart,
} from '@/lib/manager/week';
import * as managerService from '@/services/manager.service';
import { EmployeeDetailProfile } from './employee-detail-profile';
import { EmployeeDetailAllocationLoad } from './employee-detail-allocation-load';
import { EmployeeDetailCompetencies } from './employee-detail-competencies';
import { EmployeeDetailAllocationsTable } from './employee-detail-allocations-table';
import { EmployeeDetailTimesheetHistory } from './employee-detail-timesheet-history';

const HISTORY_WEEKS = 6;

export function ManagerEmployeeDetailPage({ employeeId }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [employee, setEmployee] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [weekHistory, setWeekHistory] = useState([]);
  const [historyOffset, setHistoryOffset] = useState(0);
  const [unfreezing, setUnfreezing] = useState(false);

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

  async function handleUnfreeze() {
    setUnfreezing(true);
    try {
      await managerService.unfreezeEmployee(employeeId);
      await loadEmployee();
    } catch (err) {
      alert(err.message || 'Failed to unfreeze account.');
    } finally {
      setUnfreezing(false);
    }
  }

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

      {employee.accountStatus === 'FROZEN' && (
        <div className="mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 rounded-xl border border-amber-200 bg-amber-50 px-6 py-4 text-sm text-amber-900 shadow-sm animate-in fade-in duration-200">
          <div className="flex items-start gap-3">
            <span className="text-xl">⚠️</span>
            <div>
              <p className="font-semibold text-slate-900">Account access is frozen</p>
              <p className="text-slate-600 mt-0.5">This employee's account has been frozen due to 2+ consecutive missed timesheet submissions. They cannot log in to submit timesheets.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleUnfreeze}
            disabled={unfreezing}
            className="rounded-lg bg-amber-600 hover:bg-amber-700 px-5 py-2 text-xs font-semibold text-white transition disabled:opacity-50 flex items-center gap-1.5 shrink-0"
          >
            {unfreezing ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Unlock className="h-3.5 w-3.5" />
            )}
            Unfreeze Account
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <EmployeeDetailProfile employee={employee} />

        <EmployeeDetailAllocationLoad employee={employee} utilization={utilization} />

        <EmployeeDetailCompetencies employee={employee} />

        <EmployeeDetailAllocationsTable employee={employee} />

        <EmployeeDetailTimesheetHistory
          weekHistory={weekHistory}
          historyLoading={historyLoading}
          historyOffset={historyOffset}
          setHistoryOffset={setHistoryOffset}
          historyWeeks={HISTORY_WEEKS}
        />
      </div>
    </main>
  );
}
