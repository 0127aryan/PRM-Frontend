'use client';

import {
  AlertTriangle,
  Loader2,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { ManagerResourceSearch } from '@/components/manager/manager-resource-search';
import {
  projectHealthClass,
  projectHealthLabel,
} from '@/lib/manager/matching-display';
import { cn } from '@/lib/utils';
import * as managerService from '@/services/manager.service';

export function ManagerAssistantPage() {
  const searchParams = useSearchParams();
  const urlProjectId = searchParams.get('projectId') ?? '';

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [projects, setProjects] = useState([]);
  const [skillProjectId, setSkillProjectId] = useState('');
  const [riskProjectId, setRiskProjectId] = useState('');
  const [riskLoading, setRiskLoading] = useState(false);
  const [riskResult, setRiskResult] = useState(null);
  const [riskError, setRiskError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const p = await managerService.listProjects();
      setProjects(p);
      const preferred =
        urlProjectId && p.some((x) => String(x.id) === urlProjectId)
          ? urlProjectId
          : p[0]
            ? String(p[0].id)
            : '';
      setRiskProjectId((prev) => prev || preferred);
      if (urlProjectId && p.some((x) => String(x.id) === urlProjectId)) {
        setSkillProjectId(urlProjectId);
      }
    } catch (err) {
      setError(err.message || 'Failed to load projects.');
    } finally {
      setLoading(false);
    }
  }, [urlProjectId]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleRiskSummary(e) {
    e.preventDefault();
    if (!riskProjectId) return;
    setRiskLoading(true);
    setRiskError('');
    setRiskResult(null);
    try {
      const data = await managerService.assistantRiskSummary({
        projectId: Number(riskProjectId),
      });
      setRiskResult(data);
    } catch (err) {
      setRiskError(err.message || 'Could not generate summary.');
    } finally {
      setRiskLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 p-16 text-slate-500">
        <Loader2 className="h-6 w-6 animate-spin" />
        Loading assistant…
      </div>
    );
  }

  const riskProject = projects.find((p) => String(p.id) === riskProjectId);
  const healthStyle = riskProject
    ? projectHealthClass(riskProject.health)
    : null;

  return (
    <main className="p-8">
      {error ? (
        <p
          role="alert"
          className="mb-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          {error}
        </p>
      ) : null}

      <p className="mb-8 max-w-2xl text-sm text-slate-600">
        Skill match uses natural language AI when configured; risk summaries use
        milestone and timesheet data with AI (rule-based fallback). Always verify
        suggestions before allocating.
      </p>

      <section className="mb-12">
        <div className="mb-4 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-slate-900" aria-hidden />
          <h3 className="text-lg font-semibold text-slate-900">Skill match</h3>
        </div>
        <ManagerResourceSearch
          projects={projects}
          projectId={skillProjectId}
          onProjectIdChange={setSkillProjectId}
          showAllocateActions={false}
          submitLabel="Find best employees"
        />
        {skillProjectId ? (
          <p className="mt-4 text-sm text-slate-600">
            Ready to allocate?{' '}
            <Link
              href={`/manager/allocate?projectId=${skillProjectId}`}
              className="font-semibold text-slate-900 underline"
            >
              Go to allocate resource
            </Link>
          </p>
        ) : (
          <p className="mt-4 text-sm text-slate-600">
            <Link
              href="/manager/allocate"
              className="font-semibold text-slate-900 underline"
            >
              Go to allocate resource
            </Link>{' '}
            after you pick a candidate.
          </p>
        )}
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-slate-900" aria-hidden />
          <h3 className="text-lg font-semibold text-slate-900">Risk summary</h3>
        </div>
        <form onSubmit={handleRiskSummary} className="flex flex-wrap items-end gap-4">
          <div className="min-w-[240px] flex-1">
            <label
              htmlFor="risk-project"
              className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500"
            >
              Project
            </label>
            <select
              id="risk-project"
              value={riskProjectId}
              onChange={(e) => setRiskProjectId(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — {projectHealthLabel(p.health)}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            disabled={riskLoading || !riskProjectId}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
          >
            {riskLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : null}
            {riskLoading ? 'Generating…' : 'Generate summary'}
          </button>
        </form>

        {riskError ? (
          <p role="alert" className="mt-4 text-sm text-red-700">
            {riskError}
          </p>
        ) : null}

        {riskResult ? (
          <div className="mt-6 space-y-4 border-t border-slate-100 pt-6">
            <div className="flex flex-wrap items-center gap-3">
              <h4 className="text-xl font-semibold text-slate-900">
                {riskResult.projectName}
              </h4>
              {healthStyle ? (
                <span
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded px-2 py-1 text-[11px] font-bold uppercase',
                    healthStyle.text,
                    riskResult.health === 'ON_TRACK'
                      ? 'bg-emerald-50'
                      : riskResult.health === 'ATTENTION'
                        ? 'bg-amber-50'
                        : 'bg-red-50',
                  )}
                >
                  <span className={cn('h-1.5 w-1.5 rounded-full', healthStyle.dot)} />
                  {projectHealthLabel(riskResult.health)}
                </span>
              ) : null}
              <span className="text-xs text-slate-500">
                {riskResult.mode === 'llm' ? 'AI' : 'Rule-based'} summary
              </span>
            </div>
            <p className="rounded-lg bg-slate-50 p-4 text-sm leading-relaxed text-slate-800">
              {riskResult.summary}
            </p>
            {(riskResult.flags ?? []).length > 0 ? (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase text-slate-500">
                  Active flags
                </p>
                <ul className="space-y-2">
                  {riskResult.flags.map((flag) => (
                    <li
                      key={`${flag.code}-${flag.milestoneId ?? ''}`}
                      className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900"
                    >
                      {flag.message}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {(riskResult.recommendations ?? []).length > 0 ? (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase text-slate-500">
                  Recommendations
                </p>
                <ul className="list-inside list-disc space-y-1 text-sm text-slate-700">
                  {riskResult.recommendations.map((rec) => (
                    <li key={rec}>{rec}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            <p className="text-xs text-slate-500">
              Generated from milestone and timesheet rules. Open{' '}
              <Link
                href={`/manager/projects/${riskResult.projectId}`}
                className="font-semibold underline"
              >
                project detail
              </Link>{' '}
              for full context.
            </p>
          </div>
        ) : null}
      </section>
    </main>
  );
}
