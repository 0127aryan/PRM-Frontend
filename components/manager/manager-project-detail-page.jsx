'use client';

import {
  AlertTriangle,
  ArrowLeft,
  Flag,
  Loader2,
  Sparkles,
  UserPlus,
  Wand2,
} from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AllocateEmployeeModal } from '@/components/manager/allocate-employee-modal';
import {
  formatApiDate,
  projectHealthClass,
  projectHealthLabel,
} from '@/lib/admin/project-display';
import {
  milestoneStatusClass,
  milestoneStatusLabel,
} from '@/lib/manager/milestone-display';
import { cn } from '@/lib/utils';
import * as managerService from '@/services/manager.service';

const STATUS_OPTIONS = [
  { value: 'PLANNED', label: 'Planned' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'ON_HOLD', label: 'On hold' },
];

/**
 * @param {{ projectId: number }} props
 */
export function ManagerProjectDetailPage({ projectId }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [project, setProject] = useState(null);
  const [riskFlags, setRiskFlags] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [statusSaving, setStatusSaving] = useState(false);
  const [endingId, setEndingId] = useState(null);
  const [message, setMessage] = useState('');
  const [allocateOpen, setAllocateOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [p, flags, team] = await Promise.all([
        managerService.getProject(projectId),
        managerService.getProjectRiskFlags(projectId).catch(() => ({
          flags: [],
        })),
        managerService.listDirectReports(),
      ]);
      setProject(p);
      setRiskFlags(flags.flags ?? []);
      setEmployees(team);
    } catch (err) {
      setError(err.message || 'Failed to load project.');
      setProject(null);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    load();
  }, [load]);

  const avgUtilization = useMemo(() => {
    const allocs = project?.allocations ?? [];
    if (allocs.length === 0) return 0;
    const sum = allocs.reduce((a, x) => a + Number(x.utilizationPct), 0);
    return (sum / allocs.length).toFixed(1);
  }, [project]);

  async function handleStatusChange(newStatus) {
    if (!project || newStatus === project.status) return;
    setStatusSaving(true);
    setMessage('');
    try {
      const updated = await managerService.updateProjectStatus(projectId, {
        status: newStatus,
      });
      setProject((prev) =>
        prev ? { ...prev, status: updated.status, health: updated.health } : prev,
      );
      setMessage('Project status updated.');
    } catch (err) {
      setMessage(err.message || 'Could not update status.');
    } finally {
      setStatusSaving(false);
    }
  }

  async function handleEndAllocation(allocationId) {
    if (
      !window.confirm(
        'End this allocation? The employee will be removed from the project team.',
      )
    ) {
      return;
    }
    setEndingId(allocationId);
    setMessage('');
    try {
      await managerService.endAllocation(allocationId);
      setProject((prev) =>
        prev
          ? {
              ...prev,
              allocations: (prev.allocations ?? []).filter(
                (a) => a.id !== allocationId,
              ),
            }
          : prev,
      );
      setMessage('Allocation ended. Employee removed from project team.');
      await load();
    } catch (err) {
      setMessage(err.message || 'Could not end allocation.');
    } finally {
      setEndingId(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 p-16 text-slate-500">
        <Loader2 className="h-6 w-6 animate-spin" />
        Loading project…
      </div>
    );
  }

  if (error || !project) {
    return (
      <main className="p-8">
        <Link
          href="/manager/projects"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to projects
        </Link>
        <p role="alert" className="mt-6 text-sm text-red-800">
          {error || 'Project not found.'}
        </p>
      </main>
    );
  }

  const healthStyle = projectHealthClass(project.health);

  return (
    <main className="p-8">
      <Link
        href="/manager/projects"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to my projects
      </Link>

      {message ? (
        <p
          role="status"
          className={cn(
            'mb-6 rounded-md border px-4 py-3 text-sm',
            message.toLowerCase().includes('could not') ||
              message.toLowerCase().includes('cannot') ||
              message.toLowerCase().includes('failed')
              ? 'border-red-200 bg-red-50 text-red-800'
              : 'border-slate-200 bg-white text-slate-700',
          )}
        >
          {message}
        </p>
      ) : null}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <section className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm lg:col-span-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">
                {project.name}
              </h1>
              {project.description ? (
                <p className="mt-2 text-sm text-slate-500">
                  {project.description}
                </p>
              ) : null}
            </div>
            <div className="flex flex-col items-end gap-2">
              <label
                htmlFor="project-status"
                className="text-xs font-bold uppercase tracking-wide text-slate-500"
              >
                Project status
              </label>
              <select
                id="project-status"
                value={project.status}
                disabled={statusSaving}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 disabled:opacity-60"
              >
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 border-t border-slate-200 pt-6 sm:grid-cols-3">
            <div>
              <p className="text-xs font-bold uppercase text-slate-500">
                Project health
              </p>
              <div
                className={cn(
                  'mt-1 flex items-center gap-2 text-lg font-semibold',
                  healthStyle.text,
                )}
              >
                <span className={cn('h-3 w-3 rounded-full', healthStyle.dot)} />
                {projectHealthLabel(project.health)}
              </div>
              <p className="mt-1 text-xs text-slate-500">Read-only (computed)</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase text-slate-500">
                Start date
              </p>
              <p className="mt-1 text-lg text-slate-900">
                {formatApiDate(project.startDate)}
              </p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase text-slate-500">
                End date
              </p>
              <p className="mt-1 text-lg text-slate-900">
                {formatApiDate(project.endDate)}
              </p>
            </div>
          </div>
        </section>

        <section className="flex flex-col justify-center rounded-xl bg-slate-900 p-6 text-white lg:col-span-4">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
            Team utilization
          </p>
          <p className="mt-2 text-4xl font-black">{avgUtilization}%</p>
          <p className="mt-2 text-sm text-slate-300">
            Average across {project.allocations?.length ?? 0} active allocation
            {(project.allocations?.length ?? 0) === 1 ? '' : 's'}.
          </p>
        </section>
      </div>

      {riskFlags.length > 0 ? (
        <section className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-center gap-2 text-amber-900">
            <AlertTriangle className="h-5 w-5" aria-hidden />
            <h3 className="text-sm font-semibold">Risk flags</h3>
          </div>
          <ul className="mt-2 space-y-1 text-sm text-amber-900">
            {riskFlags.map((f) => (
              <li key={`${f.code}-${f.milestoneId ?? ''}`}>{f.message}</li>
            ))}
          </ul>
        </section>
      ) : null}

      <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-12">
        <section className="rounded-xl border border-slate-200 bg-white p-6 xl:col-span-4">
          <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-slate-900">
            <Flag className="h-5 w-5" aria-hidden />
            Milestones
          </h3>
          {(project.milestones ?? []).length === 0 ? (
            <p className="text-sm text-slate-500">No milestones defined yet.</p>
          ) : (
            <ul className="space-y-4">
              {project.milestones.map((m) => (
                <li
                  key={m.id}
                  className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4 last:border-0 last:pb-0"
                >
                  <div>
                    <p className="font-semibold text-slate-900">{m.title}</p>
                    <p className="text-xs text-slate-500">
                      Due: {formatApiDate(m.dueDate)}
                    </p>
                  </div>
                  <span
                    className={cn(
                      'shrink-0 rounded px-2 py-0.5 text-[10px] font-bold uppercase',
                      milestoneStatusClass(m.status),
                    )}
                  >
                    {milestoneStatusLabel(m.status)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="flex flex-col rounded-xl border border-slate-200 bg-white xl:col-span-8">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900">
              Team allocation
            </h3>
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={`/manager/allocate?projectId=${projectId}`}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50"
              >
                <Wand2 className="h-4 w-4" aria-hidden />
                AI skill match
              </Link>
              <Link
                href={`/manager/assistant?projectId=${projectId}`}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50"
              >
                <Sparkles className="h-4 w-4" aria-hidden />
                Risk summary
              </Link>
              <button
                type="button"
                onClick={() => setAllocateOpen(true)}
                className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
              >
                <UserPlus className="h-4 w-4" aria-hidden />
                Allocate employee
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-xs font-bold uppercase text-slate-500">
                    Employee ID
                  </th>
                  <th className="px-6 py-3 text-xs font-bold uppercase text-slate-500">
                    Full name
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-bold uppercase text-slate-500">
                    Utilization
                  </th>
                  <th className="px-6 py-3 text-xs font-bold uppercase text-slate-500">
                    Allocation range
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-bold uppercase text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {(project.allocations ?? []).length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-sm text-slate-500">
                      No active allocations. Allocate a direct report to this
                      project.
                    </td>
                  </tr>
                ) : (
                  project.allocations.map((a) => (
                    <tr key={a.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {a.employeeCode}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                        {a.employeeName}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-block rounded bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700">
                          {a.utilizationPct}%
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {formatApiDate(a.fromDate)} – {formatApiDate(a.toDate)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          type="button"
                          disabled={endingId === a.id}
                          onClick={() => handleEndAllocation(a.id)}
                          className="text-sm font-semibold text-red-600 hover:underline disabled:opacity-50"
                        >
                          {endingId === a.id ? 'Ending…' : 'End allocation'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <AllocateEmployeeModal
        key="project-allocate"
        open={allocateOpen}
        projectId={projectId}
        employees={employees}
        onClose={() => setAllocateOpen(false)}
        onCreated={load}
      />
    </main>
  );
}
