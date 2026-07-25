'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  FolderKanban,
  Loader2,
  Shield,
  UserPlus,
  Users,
} from 'lucide-react';
import { SystemHealthCard } from '@/components/admin/system-health-card';
import { formatDateDDMMYYYY } from '@/lib/format';
import { cn } from '@/lib/utils';
import * as adminService from '@/services/admin.service';

function computeStats(users, employees, projects) {
  const managers = users.filter((u) => u.role === 'MANAGER').length;
  const employeesByRole = users.filter((u) => u.role === 'EMPLOYEE').length;
  const activeProjects = projects.filter((p) => p.status === 'ACTIVE').length;
  const onBench = employees.filter((e) => e.status === 'BENCH').length;
  const totalEmployees = employees.length || employeesByRole;
  const benchPct =
    totalEmployees > 0
      ? ((onBench / totalEmployees) * 100).toFixed(1)
      : '0.0';
  const utilization =
    totalEmployees > 0
      ? (100 - (onBench / totalEmployees) * 100).toFixed(1)
      : '100.0';

  return {
    managers,
    employees: totalEmployees,
    activeProjects,
    onBench,
    benchPct,
    utilization,
  };
}

export function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [users, setUsers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError('');
      try {
        const [u, e, p] = await Promise.all([
          adminService.listUsers(),
          adminService.listEmployees(),
          adminService.listProjects(),
        ]);
        setUsers(u);
        setEmployees(e);
        setProjects(p);
      } catch (err) {
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const stats = useMemo(
    () => computeStats(users, employees, projects),
    [users, employees, projects],
  );

  const today = formatDateDDMMYYYY();

  return (
    <main className="max-w-[1400px] p-8">
      <section className="mb-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h3 className="text-2xl font-semibold tracking-tight text-slate-900">
              Welcome back, Admin
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Overview for {today}. Data reflects your live database.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin/users"
              className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-slate-800 active:scale-[0.98]"
            >
              <UserPlus className="h-4 w-4" aria-hidden />
              Add user
            </Link>
            <Link
              href="/admin/projects"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition-all hover:bg-slate-50 active:scale-[0.98]"
            >
              <FolderKanban className="h-4 w-4" aria-hidden />
              Create project
            </Link>
          </div>
        </div>
      </section>

      {error ? (
        <p
          role="alert"
          className="mb-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          {error}
        </p>
      ) : null}

      {loading ? (
        <div className="flex items-center gap-2 py-16 text-slate-500">
          <Loader2 className="h-6 w-6 animate-spin" />
          Loading dashboard…
        </div>
      ) : (
        <div className="grid grid-cols-12 gap-4">
          <SystemHealthCard />

          <div className="col-span-12 flex flex-col gap-4 lg:col-span-4">
            <StatMini
              label="Total managers"
              value={stats.managers}
              icon={Shield}
              iconClass="bg-slate-100 text-slate-900"
            />
            <StatMini
              label="Total employees"
              value={stats.employees}
              icon={Users}
              iconClass="bg-slate-200 text-slate-700"
            />
          </div>

          <div className="col-span-12 rounded-xl border border-slate-200 bg-white p-6 shadow-sm md:col-span-6">
            <div className="mb-6 flex items-center justify-between">
              <h4 className="text-lg font-semibold text-slate-900">
                Active projects
              </h4>
              <span className="rounded bg-slate-900 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                Live
              </span>
            </div>
            <p className="text-4xl font-bold text-slate-900">
              {stats.activeProjects}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              {projects.length} total in catalog
            </p>
          </div>

          <div className="col-span-12 rounded-xl border border-slate-200 bg-white p-6 shadow-sm md:col-span-6">
            <div className="mb-6 flex items-center justify-between">
              <h4 className="text-lg font-semibold text-slate-900">
                Employees on bench
              </h4>
              <span className="rounded bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-800">
                Resource gap
              </span>
            </div>
            <p className="text-4xl font-bold text-slate-900">{stats.onBench}</p>
            <p className="mt-1 text-sm text-slate-500">
              {stats.benchPct}% of workforce on bench
            </p>
            <div className="mt-4">
              <div className="mb-1 flex justify-between text-[10px] font-semibold text-slate-500">
                <span>Utilization rate</span>
                <span>{stats.utilization}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-slate-900 transition-all"
                  style={{ width: `${stats.utilization}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function StatMini({ label, value, icon: Icon, iconClass }) {
  return (
    <div className="flex flex-1 items-center gap-4 rounded-xl border border-slate-200 bg-slate-100 p-5">
      <div
        className={cn(
          'flex h-12 w-12 items-center justify-center rounded-lg',
          iconClass,
        )}
      >
        <Icon className="h-6 w-6" aria-hidden />
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {label}
        </p>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
      </div>
    </div>
  );
}
