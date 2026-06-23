import { User } from 'lucide-react';
import { cn } from '@/lib/utils';

export function TeamBuilderOptionCard({ option, index }) {
  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-md">
      {/* Visual accent top border */}
      <div
        className={cn(
          "absolute top-0 left-0 right-0 h-1 bg-gradient-to-r",
          index === 0
            ? "from-indigo-500 to-violet-500"
            : "from-cyan-500 to-indigo-500"
        )}
      />

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h5 className="font-bold text-slate-900 group-hover:text-indigo-950 transition-colors">
            {option.optionName}
          </h5>
          <span className="text-xs font-semibold text-slate-500">
            {option.members.length} members
          </span>
        </div>

        <p className="mb-6 text-xs text-slate-600 leading-relaxed italic">
          {option.description}
        </p>

        <div className="space-y-4">
          {option.members.length > 0 ? (
            option.members.map((member) => (
              <div
                key={member.resourceId}
                className="relative overflow-hidden rounded-xl border border-slate-100 bg-slate-50/50 p-4 transition-all duration-200 hover:border-slate-200 hover:bg-slate-50"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 shrink-0">
                    <User className="h-4 w-4" />
                  </div>

                  <div className="flex-grow min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <h6 className="text-sm font-semibold text-slate-900 truncate">
                        {member.fullName}
                      </h6>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className={cn(
                          "rounded-full px-2 py-0.5 text-[10px] font-bold border",
                          member.availableUtilizationPct === 100
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : member.availableUtilizationPct > 0
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : "bg-red-50 text-red-700 border-red-200"
                        )}>
                          {member.availableUtilizationPct}% Avail
                        </span>
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700 border border-slate-200 uppercase tracking-wide">
                          {member.role}
                        </span>
                      </div>
                    </div>

                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {member.skills.map((skill) => (
                        <span
                          key={skill}
                          className="rounded bg-white border border-slate-200 px-1.5 py-0.5 text-[9px] font-medium text-slate-600"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>

                    <p className="mt-2 text-[11px] text-slate-500 leading-relaxed border-t border-slate-100 pt-2">
                      <span className="font-medium text-slate-700">Fit Rationale: </span>
                      {member.matchReason}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-xs py-8 text-slate-400">
              No resources could be mapped for this option.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
