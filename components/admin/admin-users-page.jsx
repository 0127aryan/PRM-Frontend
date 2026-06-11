'use client';

import { Loader2 } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { CreateUserForm } from '@/components/admin/create-user-form';
import { UsersTable } from '@/components/admin/users-table';
import { mergeUsersDirectory } from '@/lib/admin/merge-users';
import * as adminService from '@/services/admin.service';

export function AdminUsersPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [users, setUsers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [skills, setSkills] = useState([]);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [u, e, s] = await Promise.all([
        adminService.listUsers(),
        adminService.listEmployees(),
        adminService.listSkills(),
      ]);
      setUsers(u);
      setEmployees(e);
      setSkills(s);
    } catch (err) {
      setError(err.message || 'Failed to load users.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const rows = useMemo(
    () => mergeUsersDirectory(users, employees),
    [users, employees],
  );

  const managers = useMemo(
    () =>
      employees.filter(
        (e) => e.userRole === 'MANAGER' && e.isActive !== false,
      ),
    [employees],
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 p-16 text-slate-500">
        <Loader2 className="h-6 w-6 animate-spin" />
        Loading users…
      </div>
    );
  }

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

      <div className="grid grid-cols-12 items-start gap-6">
        <CreateUserForm
          managers={managers}
          skills={skills}
          onCreated={load}
        />
        <UsersTable rows={rows} onRefresh={load} />
      </div>
    </main>
  );
}
