'use client';

import { Loader2, Search } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ManagerProjectCard } from '@/components/manager/manager-project-card';
import * as managerService from '@/services/manager.service';

const HEALTH_FILTERS = [
  { value: '', label: 'All health' },
  { value: 'ON_TRACK', label: 'On track' },
  { value: 'ATTENTION', label: 'Attention' },
  { value: 'AT_RISK', label: 'At risk' },
];

export function ManagerProjectsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState('');
  const [healthFilter, setHealthFilter] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await managerService.listProjects();
      setProjects(data);
    } catch (err) {
      setError(err.message || 'Failed to load your projects.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    let rows = projects;
    if (healthFilter) {
      rows = rows.filter((p) => p.health === healthFilter);
    }
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (p) =>
        p.name?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q),
    );
  }, [projects, search, healthFilter]);

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 p-16 text-slate-500">
        <Loader2 className="h-6 w-6 animate-spin" />
        Loading your projects…
      </div>
    );
  }

  return (
    <main className="p-8">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-wrap gap-4">
          <div>
            <label
              htmlFor="project-search"
              className="mb-2 ml-1 block text-xs font-semibold text-slate-500"
            >
              Search projects
            </label>
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                aria-hidden
              />
              <input
                id="project-search"
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Project name or description…"
                className="w-72 max-w-full rounded-lg border border-slate-200 py-2 pl-10 pr-4 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="health-filter"
              className="mb-2 ml-1 block text-xs font-semibold text-slate-500"
            >
              Health status
            </label>
            <select
              id="health-filter"
              value={healthFilter}
              onChange={(e) => setHealthFilter(e.target.value)}
              className="min-w-[140px] rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
            >
              {HEALTH_FILTERS.map((f) => (
                <option key={f.value || 'all'} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <p className="text-sm text-slate-500">
          {filtered.length} project{filtered.length === 1 ? '' : 's'} assigned to
          you
        </p>
      </div>

      {error ? (
        <p
          role="alert"
          className="mb-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          {error}
        </p>
      ) : null}

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-white px-8 py-16 text-center">
          <p className="font-medium text-slate-900">No projects to show</p>
          <p className="mt-2 text-sm text-slate-500">
            {projects.length === 0
              ? 'An administrator must assign projects to you before they appear here.'
              : 'Try adjusting search or health filters.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((project) => (
            <ManagerProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </main>
  );
}
