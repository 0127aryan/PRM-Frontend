'use client';

import { Code2, MoreVertical, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  formatSkillDate,
  skillCategoryClass,
  skillCategoryDotClass,
  skillCategoryLabel,
} from '@/lib/admin/skill-display';
import { cn } from '@/lib/utils';

/**
 * @param {{ skills: object[], usageCounts: Record<number, number>, categoryFilter: string | null, search: string, onSearchChange: (v: string) => void }} props
 */
export function SkillsCatalogTable({
  skills,
  usageCounts,
  categoryFilter,
  search,
  onSearchChange,
}) {
  const filtered = useMemo(() => {
    let rows = skills;
    if (categoryFilter) {
      rows = rows.filter((s) => s.category === categoryFilter);
    }
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (s) =>
        s.name?.toLowerCase().includes(q) ||
        skillCategoryLabel(s.category).toLowerCase().includes(q),
    );
  }, [skills, categoryFilter, search]);

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 bg-slate-50 px-6 py-3">
        <div className="relative max-w-xs">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            aria-hidden
          />
          <input
            type="search"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search skills…"
            className="w-full rounded-lg border border-slate-200 bg-white py-1.5 pl-9 pr-4 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
          />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                Skill name
              </th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                Category
              </th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                Assigned experts
              </th>
              <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">
                Added
              </th>
              <th className="w-16 px-6 py-4" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-16 text-center">
                  <p className="text-sm font-medium text-slate-900">
                    No skills in catalog
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Add skills to use them when creating employees.
                  </p>
                </td>
              </tr>
            ) : (
              filtered.map((skill) => (
                <tr
                  key={skill.id}
                  className="group transition-colors hover:bg-slate-50"
                >
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded border border-slate-200 bg-slate-100 text-slate-700">
                        <Code2 className="h-4 w-4" aria-hidden />
                      </div>
                      <span className="text-sm font-semibold text-slate-900">
                        {skill.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-3">
                    <span
                      className={cn(
                        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold',
                        skillCategoryClass(skill.category),
                      )}
                    >
                      <span
                        className={cn(
                          'h-1.5 w-1.5 rounded-full',
                          skillCategoryDotClass(skill.category),
                        )}
                      />
                      {skillCategoryLabel(skill.category)}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    <span className="inline-flex h-7 min-w-[1.75rem] items-center justify-center rounded-full border-2 border-white bg-slate-100 px-2 text-[10px] font-bold text-slate-600">
                      {usageCounts[skill.id] ?? 0}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-right text-sm text-slate-500">
                    {formatSkillDate(skill.createdAt)}
                  </td>
                  <td className="px-6 py-3 text-right">
                    <button
                      type="button"
                      disabled
                      title="Edit coming soon"
                      className="rounded p-1 text-slate-400 opacity-0 transition group-hover:opacity-100 disabled:cursor-not-allowed"
                    >
                      <MoreVertical className="h-5 w-5" aria-hidden />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {filtered.length > 0 ? (
        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-3">
          <span className="text-xs font-medium text-slate-500">
            Showing {filtered.length} of {skills.length} skill
            {skills.length === 1 ? '' : 's'}
          </span>
        </div>
      ) : null}
    </div>
  );
}
