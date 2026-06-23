'use client';

import Link from 'next/link';
import { Users } from 'lucide-react';
import {
  formatApiDate,
  projectHealthClass,
  projectHealthLabel,
  projectStatusLabel,
} from '@/lib/admin/project-display';
import { cn } from '@/lib/utils';

/**
 * @param {{ project: object }} props
 */
export function ManagerProjectCard({ project }) {
  const healthStyle = projectHealthClass(project.health);
  const borderAccent =
    project.health === 'AT_RISK'
      ? 'border-l-4 border-l-red-500'
      : project.health === 'ATTENTION'
        ? 'border-l-4 border-l-amber-500'
        : '';

  return (
    <Link
      href={`/manager/projects/${project.id}`}
      className={cn(
        'group flex flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md',
        borderAccent,
      )}
    >
      <div className="mb-4 flex items-start justify-between">
        <span
          className={cn(
            'inline-flex items-center gap-1.5 rounded px-2 py-1 text-[11px] font-bold uppercase tracking-wider',
            healthStyle.text,
            project.health === 'ON_TRACK'
              ? 'bg-emerald-50'
              : project.health === 'ATTENTION'
                ? 'bg-amber-50'
                : 'bg-red-50',
          )}
        >
          <span className={cn('h-1.5 w-1.5 rounded-full', healthStyle.dot)} />
          {projectHealthLabel(project.health)}
        </span>
        <span className="text-xs font-semibold uppercase text-slate-500">
          {projectStatusLabel(project.status)}
        </span>
      </div>

      <h3 className="text-lg font-semibold text-slate-900 transition group-hover:text-slate-700">
        {project.name}
      </h3>
      {project.description ? (
        <p className="mt-1 line-clamp-2 text-sm text-slate-500">
          {project.description}
        </p>
      ) : null}

      <div className="mb-6 mt-4 grid grid-cols-2 gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase text-slate-500">
            Date range
          </p>
          <p className="text-sm font-medium text-slate-900">
            {formatApiDate(project.startDate)} – {formatApiDate(project.endDate)}
          </p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase text-slate-500">
            Milestones
          </p>
          <p className="text-sm font-medium text-slate-900">
            {project.milestoneCount ?? 0}
          </p>
        </div>
      </div>

      <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Users className="h-4 w-4" aria-hidden />
          <span>
            {project.teamSize ?? 0} on team
          </span>
        </div>
        <span className="text-xs font-semibold text-slate-900 group-hover:underline">
          View details
        </span>
      </div>
    </Link>
  );
}
