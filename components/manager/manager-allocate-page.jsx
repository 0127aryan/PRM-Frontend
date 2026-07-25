'use client';

import { Loader2, UserPlus, Wand2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { AllocateEmployeeModal } from '@/components/manager/allocate-employee-modal';
import { ManagerResourceSearch } from '@/components/manager/manager-resource-search';
import * as managerService from '@/services/manager.service';

export function ManagerAllocatePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialProjectId = searchParams.get('projectId') ?? '';

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [projectId, setProjectId] = useState(initialProjectId);
  const [allocateOpen, setAllocateOpen] = useState(false);
  const [allocateEmployee, setAllocateEmployee] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [p, team] = await Promise.all([
        managerService.listProjects(),
        managerService.listDirectReports(),
      ]);
      setProjects(p);
      setEmployees(team);
    } catch (err) {
      setError(err.message || 'Failed to load data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (initialProjectId) setProjectId(initialProjectId);
  }, [initialProjectId]);

  function openAllocate(employee = null) {
    if (!projectId) {
      setError('Select a project before allocating.');
      return;
    }
    setAllocateEmployee(employee);
    setAllocateOpen(true);
    setError('');
  }

  function handleAllocated() {
    load();
    if (projectId) {
      router.push(`/manager/projects/${projectId}`);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 p-16 text-slate-500">
        <Loader2 className="h-6 w-6 animate-spin" />
        Loading…
      </div>
    );
  }

  const selectedProject = projects.find((p) => String(p.id) === projectId);

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

      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-slate-600">
            Find the best fit among your direct reports, then confirm allocation
            dates and utilisation.
          </p>
        </div>
        {selectedProject ? (
          <Link
            href={`/manager/projects/${projectId}`}
            className="text-sm font-semibold text-slate-900 hover:underline"
          >
            View {selectedProject.name} →
          </Link>
        ) : null}
      </div>

      <section className="mb-10">
        <div className="mb-4 flex items-center gap-2">
          <Wand2 className="h-5 w-5 text-slate-900" aria-hidden />
          <h3 className="text-lg font-semibold text-slate-900">
            Find resource (skill match)
          </h3>
        </div>
        <ManagerResourceSearch
          projects={projects}
          projectId={projectId}
          onProjectIdChange={setProjectId}
          onAllocate={(match) => openAllocate(match)}
          submitLabel="Search direct reports"
        />
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <UserPlus className="h-5 w-5 text-slate-900" aria-hidden />
          <h3 className="text-lg font-semibold text-slate-900">
            Direct allocation
          </h3>
        </div>
        <p className="mb-4 text-sm text-slate-600">
          Already know who you want? Select a project above, then pick an
          employee without running a search.
        </p>
        <button
          type="button"
          onClick={() => openAllocate(null)}
          disabled={!projectId || employees.length === 0}
          className="rounded-lg border border-slate-200 px-6 py-2.5 text-sm font-semibold text-slate-900 hover:bg-slate-50 disabled:opacity-50"
        >
          Allocate employee to project
        </button>
        {!projectId ? (
          <p className="mt-2 text-xs text-amber-800">
            Choose a project in the search form first.
          </p>
        ) : null}
        <p className="mt-4 text-xs text-slate-500">
          To end an existing allocation, open the{' '}
          <Link href={`/manager/projects/${projectId || ''}`} className="underline">
            project detail
          </Link>{' '}
          page.
        </p>
      </section>

      {projectId ? (
        <AllocateEmployeeModal
          key={allocateEmployee?.employeeId ?? allocateEmployee?.id ?? 'direct'}
          open={allocateOpen}
          projectId={Number(projectId)}
          employees={employees}
          presetEmployee={allocateEmployee}
          onClose={() => {
            setAllocateOpen(false);
            setAllocateEmployee(null);
          }}
          onCreated={handleAllocated}
        />
      ) : null}
    </main>
  );
}
