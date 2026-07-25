'use client';

import { Loader2, Search } from 'lucide-react';
import { useState } from 'react';
import { ManagerMatchResults } from '@/components/manager/manager-match-results';
import * as managerService from '@/services/manager.service';

/**
 * @param {{
 *   projects: Array<{ id: number, name: string }>,
 *   projectId: string,
 *   onProjectIdChange: (id: string) => void,
 *   onAllocate?: (employeeId: number) => void,
 *   showAllocateActions?: boolean,
 *   submitLabel?: string,
 * }} props
 */
export function ManagerResourceSearch({
  projects,
  projectId,
  onProjectIdChange,
  onAllocate,
  showAllocateActions = true,
  submitLabel = 'Search team',
}) {
  const [requirement, setRequirement] = useState('');
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  async function handleSearch(e) {
    e.preventDefault();
    setError('');
    setSearching(true);
    setResult(null);
    try {
      const body = {
        query: requirement.trim() || undefined,
        projectId: projectId ? Number(projectId) : undefined,
      };
      const data = await managerService.searchMatching(body);
      setResult(data);
    } catch (err) {
      setError(err.message || 'Search failed.');
    } finally {
      setSearching(false);
    }
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleSearch}
        className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label
              htmlFor="match-project"
              className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500"
            >
              Project (optional)
            </label>
            <select
              id="match-project"
              value={projectId}
              onChange={(e) => onProjectIdChange(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
            >
              <option value="">Any project context</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label
              htmlFor="match-requirement"
              className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500"
            >
              Describe your requirement
            </label>
            <textarea
              id="match-requirement"
              value={requirement}
              onChange={(e) => setRequirement(e.target.value)}
              rows={3}
              placeholder="e.g. backend developer with Java and microservices experience, available from June"
              className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
            />
            <p className="mt-2 text-xs text-slate-500">
              Plain English is processed by AI when LLM is configured in Admin
              settings; otherwise keyword matching is used as a fallback.
            </p>
          </div>
        </div>
        {error ? (
          <p role="alert" className="mt-4 text-sm text-red-700">
            {error}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={searching}
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
        >
          {searching ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <Search className="h-4 w-4" aria-hidden />
          )}
          {searching ? 'Searching…' : submitLabel}
        </button>
      </form>

      {result?.llmNotice ? (
        <p className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {result.llmNotice}
        </p>
      ) : null}

      {result ? (
        <ManagerMatchResults
          matches={result.matches}
          mode={result.mode}
          notice={result.notice}
          onAllocate={onAllocate}
          showAllocateActions={showAllocateActions && Boolean(onAllocate)}
        />
      ) : null}
    </div>
  );
}
