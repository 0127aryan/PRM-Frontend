import { ShieldAlert, Award, Clock } from 'lucide-react';

export function TeamBuilderGaps({ gaps }) {
  if (!gaps || gaps.length === 0) return null;

  return (
    <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50/50 to-amber-100/30 p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <ShieldAlert className="h-5 w-5 text-amber-700" />
        <h4 className="text-sm font-bold uppercase tracking-wider text-amber-800">
          Resource & Skill Gaps Identified
        </h4>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {gaps.map((gap, idx) => (
          <div
            key={idx}
            className="flex gap-3 rounded-xl border border-amber-200/60 bg-white p-4 text-sm shadow-sm"
          >
            {gap.type === 'NO_SKILL' ? (
              <Award className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
            ) : (
              <Clock className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
            )}

            <div>
              <span className="inline-flex rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-900 border border-amber-100 uppercase tracking-wider mb-2">
                {gap.role}
              </span>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                {gap.reason}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
