'use client';

import { Filter, Loader2, Plus } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AddSkillModal } from '@/components/admin/add-skill-modal';
import { SkillsCatalogTable } from '@/components/admin/skills-catalog-table';
import {
  SKILL_CATEGORIES,
  buildSkillUsageCounts,
} from '@/lib/admin/skill-display';
import { cn } from '@/lib/utils';
import * as adminService from '@/services/admin.service';

export function AdminSkillsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [skills, setSkills] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [view, setView] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState(null);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [s, e] = await Promise.all([
        adminService.listSkills(),
        adminService.listEmployees(),
      ]);
      setSkills(s);
      setEmployees(e);
    } catch (err) {
      setError(err.message || 'Failed to load skills catalog.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const usageCounts = useMemo(
    () => buildSkillUsageCounts(employees),
    [employees],
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 p-16 text-slate-500">
        <Loader2 className="h-6 w-6 animate-spin" />
        Loading skills catalog…
      </div>
    );
  }

  return (
    <main className="flex flex-col">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 bg-white px-8 py-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex rounded-lg border border-slate-200 bg-slate-100 p-1">
            <ViewTab
              active={view === 'all'}
              onClick={() => {
                setView('all');
                setCategoryFilter(null);
              }}
            >
              All skills
            </ViewTab>
            <ViewTab
              active={view === 'category'}
              onClick={() => setView('category')}
            >
              By category
            </ViewTab>
          </div>
          {view === 'category' ? (
            <div className="flex flex-wrap gap-2">
              {SKILL_CATEGORIES.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() =>
                    setCategoryFilter(
                      categoryFilter === c.value ? null : c.value,
                    )
                  }
                  className={cn(
                    'rounded-lg border px-3 py-1 text-xs font-semibold transition',
                    categoryFilter === c.value
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50',
                  )}
                >
                  {c.label}
                </button>
              ))}
            </div>
          ) : (
            <>
              <span className="mx-1 hidden h-8 w-px bg-slate-200 sm:block" />
              <button
                type="button"
                disabled
                title="Filters coming soon"
                className="inline-flex cursor-not-allowed items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-500 opacity-60"
              >
                <Filter className="h-4 w-4" aria-hidden />
                Filters
              </button>
            </>
          )}
        </div>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" aria-hidden />
          Add new skill
        </button>
      </div>

      <div className="flex-1 bg-slate-100 p-6">
        {error ? (
          <p
            role="alert"
            className="mb-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          >
            {error}
          </p>
        ) : null}

        <SkillsCatalogTable
          skills={skills}
          usageCounts={usageCounts}
          categoryFilter={categoryFilter}
          search={search}
          onSearchChange={setSearch}
        />
      </div>

      <AddSkillModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={load}
      />
    </main>
  );
}

function ViewTab({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-md px-4 py-1.5 text-xs font-semibold transition',
        active
          ? 'bg-white text-slate-900 shadow-sm'
          : 'text-slate-500 hover:text-slate-900',
      )}
    >
      {children}
    </button>
  );
}
