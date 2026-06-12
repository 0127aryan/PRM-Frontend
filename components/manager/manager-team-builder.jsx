'use client';

import { useState } from 'react';
import { Sparkles, Loader2, AlertCircle, User, Clock, ShieldAlert, Award } from 'lucide-react';
import * as managerService from '@/services/manager.service';
import { cn } from '@/lib/utils';

export function ManagerTeamBuilder({ projects, projectId, onProjectIdChange }) {
  const [requirement, setRequirement] = useState('');
  const [building, setBuilding] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  async function handleBuildTeam(e) {
    e.preventDefault();
    setError('');
    setBuilding(true);
    setResult(null);
    try {
      const body = {
        query: requirement.trim() || undefined,
        projectId: projectId ? Number(projectId) : undefined,
      };
      const data = await managerService.buildTeam(body);
      setResult(data);
    } catch (err) {
      setError(err.message || 'Team Builder failed to run.');
    } finally {
      setBuilding(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Input section with custom premium styling */}
      <form
        onSubmit={handleBuildTeam}
        className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-md transition-all duration-300 hover:shadow-lg"
      >
        <div className="absolute right-0 top-0 -mr-6 -mt-6 h-24 w-24 rounded-full bg-indigo-50/50 blur-xl" />
        <div className="absolute left-0 bottom-0 -ml-6 -mb-6 h-24 w-24 rounded-full bg-cyan-50/50 blur-xl" />

        <div className="relative space-y-5">
          <div className="grid gap-5 md:grid-cols-3">
            <div className="md:col-span-2">
              <label
                htmlFor="tb-requirement"
                className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500"
              >
                Describe your desired team
              </label>
              <textarea
                id="tb-requirement"
                value={requirement}
                onChange={(e) => setRequirement(e.target.value)}
                rows={3}
                required
                placeholder="e.g. I need a backend, frontend, devops and QA"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition-all focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/10 placeholder:text-slate-400"
              />
            </div>
            <div>
              <label
                htmlFor="tb-project"
                className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500"
              >
                Project context (optional)
              </label>
              <select
                id="tb-project"
                value={projectId}
                onChange={(e) => onProjectIdChange(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition-all focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/10"
              >
                <option value="">Any project context</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-[11px] text-slate-500 leading-relaxed">
                Matches are found from all over the organization, bypassing manager assignments.
              </p>
            </div>
          </div>

          {error ? (
            <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" aria-hidden />
              <div>
                <p className="font-semibold">AI Generation Unavailable</p>
                <p className="mt-1 text-xs text-red-700">{error}</p>
              </div>
            </div>
          ) : null}

          <button
            type="submit"
            disabled={building || !requirement.trim()}
            className={cn(
              "relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-300 hover:from-indigo-500 hover:to-violet-500 hover:shadow-md active:scale-95 disabled:pointer-events-none disabled:opacity-60"
            )}
          >
            {building ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <Sparkles className="h-4 w-4 text-indigo-200 animate-pulse" aria-hidden />
            )}
            {building ? 'Synthesizing team configuration…' : 'Build best possible teams'}
          </button>
        </div>
      </form>

      {/* Result Section */}
      {result ? (
        <div className="space-y-8">
          {/* Gaps / Honesty panel */}
          {result.gaps && result.gaps.length > 0 ? (
            <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50/50 to-amber-100/30 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <ShieldAlert className="h-5 w-5 text-amber-700" />
                <h4 className="text-sm font-bold uppercase tracking-wider text-amber-800">
                  Resource &amp; Skill Gaps Identified
                </h4>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {result.gaps.map((gap, idx) => (
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
          ) : null}

          {/* Team options side by side */}
          <div>
            <div className="mb-6 flex items-center justify-between">
              <h4 className="text-base font-semibold text-slate-900">
                Proposed Team Configurations
              </h4>
              <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700 border border-indigo-100">
                AI Generated
              </span>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {result.options.map((option, optIdx) => (
                <div
                  key={optIdx}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-md"
                >
                  {/* Visual accent top border */}
                  <div
                    className={cn(
                      "absolute top-0 left-0 right-0 h-1 bg-gradient-to-r",
                      optIdx === 0
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
                                    <span className="rounded-full bg-slate-250 px-2 py-0.5 text-[10px] font-bold text-slate-700 border border-slate-200 uppercase tracking-wide">
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
              ))}
            </div>
          </div>

        </div>
      ) : null}
    </div>
  );
}
