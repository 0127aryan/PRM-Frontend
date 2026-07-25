'use client';

import Link from 'next/link';
import {
  employeeStatusClass,
  employeeStatusLabel,
  proficiencyClass,
  proficiencyLabel,
} from '@/lib/manager/employee-display';
import { matchScoreLabel } from '@/lib/manager/matching-display';
import { cn } from '@/lib/utils';

/**
 * @param {{
 *   matches: Array<object>,
 *   mode?: string,
 *   notice?: string,
 *   onAllocate?: (match: object) => void,
 *   showAllocateActions?: boolean,
 * }} props
 */
export function ManagerMatchResults({
  matches,
  mode = 'keyword',
  notice,
  onAllocate,
  showAllocateActions = true,
}) {
  if (!matches?.length) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-white px-8 py-12 text-center">
        <p className="font-medium text-slate-900">
          {notice || 'No matches found'}
        </p>
        {!notice ? (
          <p className="mt-2 text-sm text-slate-500">
            Try different keywords or clear filters to list all direct reports.
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-slate-500">
        {matches.length} result{matches.length === 1 ? '' : 's'} ·{' '}
        {mode === 'llm' ? 'AI' : 'Keyword'} matching — verify skills and
        availability before allocating.
      </p>
      <ol className="space-y-3">
        {matches.map((match, index) => {
          const statusStyle = employeeStatusClass(match.status);
          return (
            <li
              key={match.employeeId}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-slate-400">
                      #{index + 1}
                    </span>
                    <h4 className="text-lg font-semibold text-slate-900">
                      {match.fullName}
                    </h4>
                    <span className="font-mono text-xs text-slate-500">
                      {match.employeeCode}
                    </span>
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-bold uppercase',
                        statusStyle.badge,
                      )}
                    >
                      {employeeStatusLabel(match.status)}
                    </span>
                  </div>
                  {match.department ? (
                    <p className="mt-1 text-sm text-slate-500">
                      {match.department}
                    </p>
                  ) : null}
                  <p className="mt-2 text-sm text-slate-600">
                    <span className="font-semibold text-slate-800">
                      {matchScoreLabel(match.score)}
                    </span>
                    {' · '}
                    Score {match.score}
                  </p>
                  {(match.reasons ?? []).length > 0 ? (
                    <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-slate-600">
                      {match.reasons.map((reason) => (
                        <li key={reason}>{reason}</li>
                      ))}
                    </ul>
                  ) : null}
                  {(match.matchedSkills ?? []).length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {match.matchedSkills.map((s) => {
                        const pClass = proficiencyClass(s.proficiency);
                        return (
                          <span
                            key={s.skillId}
                            className={cn(
                              'rounded px-2 py-0.5 text-xs font-medium',
                              pClass.badge,
                            )}
                          >
                            {s.skillName} ({proficiencyLabel(s.proficiency)})
                          </span>
                        );
                      })}
                    </div>
                  ) : null}
                </div>
                <div className="flex shrink-0 flex-col gap-2">
                  {showAllocateActions && onAllocate ? (
                    <button
                      type="button"
                      onClick={() => onAllocate(match)}
                      className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                    >
                      Allocate
                    </button>
                  ) : null}
                  <Link
                    href={`/manager/employees/${match.employeeId}`}
                    className="text-center text-xs font-semibold text-slate-600 hover:underline"
                  >
                    View profile
                  </Link>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
