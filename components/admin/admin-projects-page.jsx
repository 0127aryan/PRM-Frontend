'use client';

import { AlertTriangle, Calendar, Loader2, Plus, Rocket } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ProjectsTable } from '@/components/admin/projects-table';
import { projectListStats } from '@/lib/admin/project-display';
import { cn } from '@/lib/utils';
import * as adminService from '@/services/admin.service';

export function AdminProjectsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [projects, setProjects] = useState([]);
  const [tab, setTab] = useState('all');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await adminService.listProjects();
      setProjects(data);
    } catch (err) {
      setError(err.message || 'Failed to load projects.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const stats = useMemo(() => projectListStats(projects), [projects]);

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 p-16 text-slate-500">
        <Loader2 className="h-6 w-6 animate-spin" />
        Loading projects…
      </div>
    );
  }

  return (
    <main className="p-8">
      <div className="mb-6 flex flex-wrap items-center gap-4 border-b border-slate-200 pb-4">
        <nav className="flex gap-6">
          <TabButton active={tab === 'all'} onClick={() => setTab('all')}>
            All projects
          </TabButton>
          <TabButton active={tab === 'archive'} onClick={() => setTab('archive')}>
            Archive
          </TabButton>
        </nav>
      </div>

      {error ? (
        <p
          role="alert"
          className="mb-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          {error}
        </p>
      ) : null}

      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-slate-500">
          Assign managers and track project health from your live catalog.
        </p>
        <Link
          href="/admin/projects/new"
          className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800 active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" aria-hidden />
          Create project
        </Link>
      </div>

      <ProjectsTable projects={projects} tab={tab} />

      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard
          icon={Rocket}
          iconClass="bg-blue-100 text-blue-800"
          label="Active launches"
          value={stats.active}
        />
        <StatCard
          icon={AlertTriangle}
          iconClass="bg-red-50 text-red-700"
          label="At risk"
          value={stats.atRisk}
        />
        <StatCard
          icon={Calendar}
          iconClass="bg-slate-100 text-slate-700"
          label="Planned projects"
          value={stats.planned}
        />
      </div>
    </main>
  );
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'border-b-2 pb-1 text-xs font-bold uppercase tracking-wider transition-colors',
        active
          ? 'border-blue-600 text-blue-600'
          : 'border-transparent text-slate-500 hover:text-slate-900',
      )}
    >
      {children}
    </button>
  );
}

function StatCard({ icon: Icon, iconClass, label, value }) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-6">
      <div
        className={cn(
          'flex h-12 w-12 items-center justify-center rounded-full',
          iconClass,
        )}
      >
        <Icon className="h-6 w-6" aria-hidden />
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
          {label}
        </p>
        <p className="text-2xl font-black text-slate-900">{value}</p>
      </div>
    </div>
  );
}
