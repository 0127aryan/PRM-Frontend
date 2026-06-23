'use client';

import {
  ArrowLeft,
  Flag,
  Info,
  Loader2,
  Plus,
  Rocket,
  Save,
  Trash2,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { managerActiveProjectCount } from '@/lib/admin/project-display';
import { cn } from '@/lib/utils';
import * as adminService from '@/services/admin.service';

const STATUS_OPTIONS = [
  { value: 'PLANNED', label: 'Planned (draft)' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'ON_HOLD', label: 'On hold' },
];

/**
 * @param {{ managers: object[], existingProjects: object[] }} props
 */
export function CreateProjectForm({ managers, existingProjects }) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState('PLANNED');
  const [managerId, setManagerId] = useState('');
  const [milestones, setMilestones] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const managerOptions = useMemo(
    () =>
      managers.map((m) => ({
        ...m,
        activeCount: managerActiveProjectCount(existingProjects, m.id),
      })),
    [managers, existingProjects],
  );

  function addMilestone() {
    setMilestones((prev) => [
      ...prev,
      { key: crypto.randomUUID(), title: '', dueDate: '' },
    ]);
  }

  function updateMilestone(key, field, value) {
    setMilestones((prev) =>
      prev.map((m) => (m.key === key ? { ...m, [field]: value } : m)),
    );
  }

  function removeMilestone(key) {
    setMilestones((prev) => prev.filter((m) => m.key !== key));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Project name is required.');
      return;
    }
    if (!startDate || !endDate) {
      setError('Start and end dates are required.');
      return;
    }
    if (startDate > endDate) {
      setError('Start date must be on or before end date.');
      return;
    }
    if (!managerId) {
      setError('Select a project manager.');
      return;
    }
    if (managers.length === 0) {
      setError('Create at least one manager user before adding projects.');
      return;
    }

    const validMilestones = milestones.filter(
      (m) => m.title.trim() && m.dueDate,
    );
    const incomplete = milestones.some(
      (m) => (m.title.trim() && !m.dueDate) || (!m.title.trim() && m.dueDate),
    );
    if (incomplete) {
      setError('Each milestone needs both a title and due date.');
      return;
    }

    setSubmitting(true);
    try {
      const project = await adminService.createProject({
        name: trimmedName,
        description: description.trim() || undefined,
        startDate,
        endDate,
        status,
        managerId: Number(managerId),
      });

      for (const m of validMilestones) {
        await adminService.addProjectMilestone(project.id, {
          title: m.title.trim(),
          dueDate: m.dueDate,
        });
      }

      router.push('/admin/projects');
      router.refresh();
    } catch (err) {
      setError(err.message || 'Could not create project.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-8">
      <div className="mb-6">
        <Link
          href="/admin/projects"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back to projects
        </Link>
      </div>

      {error ? (
        <p
          role="alert"
          className="mb-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          {error}
        </p>
      ) : null}

      <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-8">
          <section className="rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="mb-6 flex items-center gap-2 text-lg font-semibold text-slate-900">
              <Info className="h-5 w-5 text-slate-900" aria-hidden />
              General information
            </h2>
            <div className="space-y-6">
              <Field label="Project name" htmlFor="project-name">
                <input
                  id="project-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Project Phoenix Migration"
                  className={inputClass}
                  required
                />
              </Field>
              <Field label="Description" htmlFor="description">
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                  placeholder="High-level objectives and scope…"
                  className={cn(inputClass, 'resize-none')}
                />
              </Field>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <Field label="Start date" htmlFor="start-date">
                  <input
                    id="start-date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className={inputClass}
                    required
                  />
                </Field>
                <Field label="End date" htmlFor="end-date">
                  <input
                    id="end-date"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className={inputClass}
                    required
                  />
                </Field>
              </div>
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                <Flag className="h-5 w-5 text-slate-900" aria-hidden />
                Project milestones
              </h2>
              <button
                type="button"
                onClick={addMilestone}
                className="inline-flex items-center gap-1 text-xs font-semibold text-slate-900 hover:underline"
              >
                <Plus className="h-4 w-4" aria-hidden />
                Add milestone
              </button>
            </div>

            {milestones.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 py-12 px-4 text-center">
                <Flag className="mb-3 h-10 w-10 text-slate-300" aria-hidden />
                <p className="text-sm text-slate-500">
                  No milestones yet. Add phases to track delivery (optional).
                </p>
              </div>
            ) : (
              <ul className="space-y-3">
                {milestones.map((m) => (
                  <li
                    key={m.key}
                    className="flex flex-wrap items-end gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="min-w-[200px] flex-1">
                      <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                        Title
                      </label>
                      <input
                        type="text"
                        value={m.title}
                        onChange={(e) =>
                          updateMilestone(m.key, 'title', e.target.value)
                        }
                        placeholder="Milestone title"
                        className={inputClass}
                      />
                    </div>
                    <div className="w-40">
                      <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                        Due date
                      </label>
                      <input
                        type="date"
                        value={m.dueDate}
                        onChange={(e) =>
                          updateMilestone(m.key, 'dueDate', e.target.value)
                        }
                        className={inputClass}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeMilestone(m.key)}
                      className="mb-1 rounded p-2 text-slate-400 hover:bg-slate-200 hover:text-red-600"
                      aria-label="Remove milestone"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <div className="space-y-6 lg:col-span-4">
          <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-6 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Project controls
            </h3>
            <div className="space-y-6">
              <Field label="Status" htmlFor="status">
                <select
                  id="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className={inputClass}
                >
                  {STATUS_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </Field>

              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Assign project manager
                </p>
                {managerOptions.length === 0 ? (
                  <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                    No active managers found.{' '}
                    <Link
                      href="/admin/users"
                      className="font-semibold underline"
                    >
                      Create a manager
                    </Link>{' '}
                    first.
                  </p>
                ) : (
                  <ul className="max-h-52 space-y-2 overflow-y-auto pr-1">
                    {managerOptions.map((m) => {
                      const selected = String(managerId) === String(m.id);
                      return (
                        <li key={m.id}>
                          <label
                            className={cn(
                              'flex cursor-pointer items-center gap-3 rounded-lg border p-2 transition',
                              selected
                                ? 'border-slate-900 bg-slate-50'
                                : 'border-transparent hover:border-slate-200 hover:bg-slate-50',
                            )}
                          >
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-700">
                              {(m.fullName || '?').charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-semibold text-slate-900">
                                {m.fullName}
                              </p>
                              <p className="text-xs text-slate-500">
                                {m.employeeCode} · {m.activeCount} active project
                                {m.activeCount === 1 ? '' : 's'}
                              </p>
                            </div>
                            <input
                              type="radio"
                              name="managerId"
                              value={m.id}
                              checked={selected}
                              onChange={() => setManagerId(String(m.id))}
                              className="h-4 w-4 border-slate-300 text-slate-900 focus:ring-slate-900"
                            />
                          </label>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>
          </section>

          <section className="relative overflow-hidden rounded-lg border border-slate-900 bg-slate-900 p-6 text-white shadow-sm">
            <Rocket
              className="pointer-events-none absolute -bottom-4 -right-4 h-28 w-28 text-white/10"
              aria-hidden
            />
            <h3 className="relative text-lg font-semibold">Resource check</h3>
            <p className="relative mt-2 text-sm text-slate-300">
              Health scores update as managers log allocations and timesheets.
            </p>
          </section>

          <div className="flex flex-col gap-3">
            <button
              type="submit"
              disabled={submitting || managerOptions.length === 0}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 py-4 text-sm font-bold text-white shadow-lg transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 active:scale-[0.98]"
            >
              {submitting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Save className="h-5 w-5" aria-hidden />
              )}
              {submitting ? 'Creating…' : 'Initialize project'}
            </button>
            <p className="px-2 text-center text-xs text-slate-500">
              The assigned manager can manage team allocations from their
              console.
            </p>
          </div>
        </div>
      </div>
    </form>
  );
}

const inputClass =
  'w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10';

function Field({ label, htmlFor, children }) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500"
      >
        {label}
      </label>
      {children}
    </div>
  );
}
