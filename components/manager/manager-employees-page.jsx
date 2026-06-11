'use client';

import {
  Briefcase,
  Loader2,
  Search,
  UserMinus,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  directReportStats,
  employeeInitials,
  employeeStatusClass,
  employeeStatusLabel,
} from '@/lib/manager/employee-display';
import { cn } from '@/lib/utils';
import * as managerService from '@/services/manager.service';

const STATUS_FILTERS = [
  { value: '', label: 'All statuses' },
  { value: 'BENCH', label: 'On bench' },
  { value: 'ALLOCATED', label: 'Allocated' },
];

export function ManagerEmployeesPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await managerService.listDirectReports();
      setEmployees(data);
    } catch (err) {
      setError(err.message || 'Failed to load your team.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const stats = useMemo(() => directReportStats(employees), [employees]);

  const filtered = useMemo(() => {
    let rows = employees;
    if (statusFilter) {
      rows = rows.filter((e) => e.status === statusFilter);
    }
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (e) =>
        e.fullName?.toLowerCase().includes(q) ||
        e.email?.toLowerCase().includes(q) ||
        e.employeeCode?.toLowerCase().includes(q) ||
        e.currentProjectName?.toLowerCase().includes(q) ||
        e.department?.toLowerCase().includes(q),
    );
  }, [employees, search, statusFilter]);

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 p-16 text-slate-500">
        <Loader2 className="h-6 w-6 animate-spin" />
        Loading direct reports…
      </div>
    );
  }

  return (
    <main className="p-8">
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Total reports"
          value={stats.total}
          icon={Users}
          iconClass="text-slate-900"
        />
        <StatCard
          label="On bench"
          value={stats.onBench}
          icon={UserMinus}
          iconClass="text-red-600"
          valueClass="text-red-600"
        />
        <StatCard
          label="Allocated"
          value={stats.allocated}
          icon={Briefcase}
          iconClass="text-blue-600"
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 px-6 py-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                aria-hidden
              />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search direct reports…"
                className="w-64 max-w-full rounded-lg border border-slate-200 py-2 pl-10 pr-4 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="min-w-[140px] rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
              aria-label="Filter by status"
            >
              {STATUS_FILTERS.map((f) => (
                <option key={f.value || 'all'} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>
          <p className="text-sm text-slate-500">
            {filtered.length} employee{filtered.length === 1 ? '' : 's'}
          </p>
        </div>

        {error ? (
          <p
            role="alert"
            className="mx-6 my-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          >
            {error}
          </p>
        ) : null}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-left text-sm">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <th className="border-b border-slate-200 px-6 py-3">Employee ID</th>
                <th className="border-b border-slate-200 px-6 py-3">Name</th>
                <th className="border-b border-slate-200 px-6 py-3">Email</th>
                <th className="border-b border-slate-200 px-6 py-3 text-center">
                  Status
                </th>
                <th className="border-b border-slate-200 px-6 py-3">
                  Current project
                </th>
                <th className="border-b border-slate-200 px-6 py-3 text-center">
                  Skills
                </th>
                <th className="border-b border-slate-200 px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-16 text-center text-slate-500"
                  >
                    {employees.length === 0
                      ? 'No direct reports yet. An administrator must assign employees to you as their reporting manager.'
                      : 'No employees match your search or filters.'}
                  </td>
                </tr>
              ) : (
                filtered.map((employee) => (
                  <EmployeeRow key={employee.id} employee={employee} />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}

function StatCard({ label, value, icon: Icon, iconClass, valueClass }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4">
      <div>
        <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          {label}
        </p>
        <p
          className={cn(
            'text-2xl font-semibold text-slate-900',
            valueClass,
          )}
        >
          {value}
        </p>
      </div>
      <Icon className={cn('h-8 w-8', iconClass)} aria-hidden />
    </div>
  );
}

function EmployeeRow({ employee }) {
  const statusStyle = employeeStatusClass(employee.status);
  const initials = employeeInitials(employee.fullName);

  return (
    <tr
      className={cn(
        'transition-colors hover:bg-slate-50',
        statusStyle.row,
      )}
    >
      <td className="px-6 py-3 font-mono text-xs text-slate-500">
        {employee.employeeCode}
      </td>
      <td className="px-6 py-3">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold',
              statusStyle.avatar,
            )}
          >
            {initials}
          </div>
          <span className="font-semibold text-slate-900">{employee.fullName}</span>
        </div>
      </td>
      <td className="px-6 py-3 text-slate-600">{employee.email}</td>
      <td className="px-6 py-3 text-center">
        <span
          className={cn(
            'inline-flex items-center gap-1.5 rounded px-2 py-1 text-[11px] font-bold uppercase tracking-wider',
            statusStyle.badge,
          )}
        >
          <span className={cn('h-1.5 w-1.5 rounded-full', statusStyle.dot)} />
          {employeeStatusLabel(employee.status)}
        </span>
      </td>
      <td className="px-6 py-3 text-slate-700">
        {employee.currentProjectName ?? (
          <span className="text-slate-400">—</span>
        )}
      </td>
      <td className="px-6 py-3 text-center font-medium text-slate-900">
        {employee.skillCount ?? 0}
      </td>
      <td className="px-6 py-3 text-right">
        <Link
          href={`/manager/employees/${employee.id}`}
          className="text-xs font-semibold text-slate-900 hover:underline"
        >
          View profile
        </Link>
      </td>
    </tr>
  );
}
