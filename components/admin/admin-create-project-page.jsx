'use client';

import { Loader2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { CreateProjectForm } from '@/components/admin/create-project-form';
import * as adminService from '@/services/admin.service';

export function AdminCreateProjectPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [managers, setManagers] = useState([]);
  const [projects, setProjects] = useState([]);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [employees, projectList] = await Promise.all([
        adminService.listEmployees(),
        adminService.listProjects(),
      ]);
      setManagers(
        employees.filter(
          (e) => e.userRole === 'MANAGER' && e.isActive !== false,
        ),
      );
      setProjects(projectList);
    } catch (err) {
      setError(err.message || 'Failed to load form data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 p-16 text-slate-500">
        <Loader2 className="h-6 w-6 animate-spin" />
        Loading…
      </div>
    );
  }

  return (
    <>
      {error ? (
        <p
          role="alert"
          className="mx-8 mt-8 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          {error}
        </p>
      ) : null}
      <CreateProjectForm managers={managers} existingProjects={projects} />
    </>
  );
}
