import { cn } from '@/lib/utils';
import {
  proficiencyBarWidth,
  proficiencyClass,
  proficiencyLabel,
} from '@/lib/manager/employee-display';

export function EmployeeDetailCompetencies({ employee }) {
  return (
    <section className="flex flex-col rounded-xl border border-slate-200 bg-white lg:col-span-4">
      <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
        <h4 className="text-lg font-semibold text-slate-900">
          Core competencies
        </h4>
        <span className="text-sm text-slate-500">
          {employee.skills?.length ?? 0} skills
        </span>
      </div>

      <div className="max-h-[420px] flex-1 space-y-4 overflow-y-auto p-6">
        {(employee.skills ?? []).length === 0 ? (
          <p className="text-sm text-slate-500">No skills on profile yet.</p>
        ) : (
          employee.skills.map((skill) => (
            <SkillRow key={skill.skillId} skill={skill} />
          ))
        )}
      </div>
    </section>
  );
}

function SkillRow({ skill }) {
  const style = proficiencyClass(skill.proficiency);
  return (
    <div className="flex items-center gap-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-slate-100 text-slate-700">
        <span className="text-xs font-bold">
          {(skill.skillName || '?').slice(0, 2).toUpperCase()}
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <div className="mb-1 flex justify-between gap-2">
          <span className="truncate font-medium text-slate-900">
            {skill.skillName}
          </span>
          <span
            className={cn(
              'shrink-0 rounded px-2 py-0.5 text-[11px] font-semibold',
              style.badge,
            )}
          >
            {proficiencyLabel(skill.proficiency)}
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
          <div
            className={cn('h-full rounded-full', style.bar)}
            style={{ width: proficiencyBarWidth(skill.proficiency) }}
          />
        </div>
      </div>
    </div>
  );
}
