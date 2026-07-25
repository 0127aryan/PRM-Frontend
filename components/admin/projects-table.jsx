'use client';

import { Filter, MoreVertical, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  formatApiDate,
  projectAvatarClass,
  projectHealthClass,
  projectHealthLabel,
  projectInitials,
  projectStatusClass,
  projectStatusLabel,
} from '@/lib/admin/project-display';
import { cn } from '@/lib/utils';

/**
 * @param {{ projects: object[], tab: 'all' | 'archive' }} props
 */
export function ProjectsTable({ projects, tab }) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    let rows = projects;
    if (tab === 'archive') {
      rows = rows.filter((p) => p.status === 'ON_HOLD');
    } else {
      rows = rows.filter((p) => p.status !== 'ON_HOLD');
    }
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (p) =>
        p.name?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.managerName?.toLowerCase().includes(q) ||
        p.managerCode?.toLowerCase().includes(q),
    );
  }, [projects, search, tab]);

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col justify-between gap-4 border-b border-slate-200 px-6 py-4 sm:flex-row sm:items-center">
        <div className="relative w-full sm:w-64">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            aria-hidden
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects…"
            className="w-full rounded-lg border border-slate-200 py-2 pl-10 pr-4 text-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
          />
        </div>
        <button
          type="button"
          disabled
          title="Filters coming soon"
          className="inline-flex cursor-not-allowed items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-500 opacity-60"
        >
          <Filter className="h-4 w-4" aria-hidden />
          Filter
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px] border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-slate-500">
                Project name
              </th>
              <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-slate-500">
                Manager
              </th>
              <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-slate-500">
                Timeline
              </th>
              <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-slate-500">
                Status
              </th>
              <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-slate-500">
                Health
              </th>
              <th className="px-6 py-4 text-right text-[11px] font-bold uppercase tracking-widest text-slate-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-16 text-center">
                  <p className="text-sm font-medium text-slate-900">
                    {tab === 'archive'
                      ? 'No archived (on hold) projects'
                      : 'No projects yet'}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {search
                      ? 'Try a different search term.'
                      : tab === 'archive'
                        ? 'Projects marked on hold appear here.'
                        : 'Create your first project to get started.'}
                  </p>
                </td>
              </tr>
            ) : (
              filtered.map((project) => (
                <ProjectRow key={project.id} project={project} />
              ))
            )}
          </tbody>
        </table>
      </div>

      {filtered.length > 0 ? (
        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-3">
          <span className="text-xs font-medium text-slate-500">
            Showing {filtered.length} of {projects.length} project
            {projects.length === 1 ? '' : 's'}
          </span>
        </div>
      ) : null}
    </div>
  );
}

function ProjectRow({ project }) {
  const healthStyle = projectHealthClass(project.health);

  return (
    <tr className="transition-colors hover:bg-slate-50">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'flex h-8 w-8 shrink-0 items-center justify-center rounded text-xs font-bold',
              projectAvatarClass(project.status),
            )}
          >
            {projectInitials(project.name)}
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">{project.name}</p>
            {project.description ? (
              <p className="line-clamp-1 text-[11px] text-slate-500">
                {project.description}
              </p>
            ) : null}
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-[10px] font-semibold text-slate-600">
            {projectInitials(project.managerName || '?')}
          </div>
          <span className="text-sm text-slate-900">
            {project.managerName || '—'}
            {project.managerCode ? (
              <span className="ml-1 text-xs text-slate-500">
                ({project.managerCode})
              </span>
            ) : null}
          </span>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex flex-col">
          <span className="text-sm text-slate-900">
            {formatApiDate(project.startDate)}
          </span>
          <span className="text-[11px] text-slate-500">
            to {formatApiDate(project.endDate)}
          </span>
        </div>
      </td>
      <td className="px-6 py-4">
        <span
          className={cn(
            'inline-block rounded px-2 py-1 text-[11px] font-bold uppercase tracking-wide',
            projectStatusClass(project.status),
          )}
        >
          {projectStatusLabel(project.status)}
        </span>
      </td>
      <td className="px-6 py-4">
        <div
          className={cn(
            'flex items-center gap-2 text-xs font-semibold',
            healthStyle.text,
          )}
        >
          <span className={cn('h-2 w-2 rounded-full', healthStyle.dot)} />
          {projectHealthLabel(project.health)}
        </div>
      </td>
      <td className="px-6 py-4 text-right">
        <button
          type="button"
          disabled
          title="Edit coming soon"
          className="rounded p-2 text-slate-400 transition hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <MoreVertical className="h-5 w-5" aria-hidden />
        </button>
      </td>
    </tr>
  );
}
