'use client';

import {
  CheckCircle2,
  KeyRound,
  Loader2,
  RotateCcw,
  Search,
  UserX,
  Unlock,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { StatusBadge } from '@/components/admin/status-badge';
import { directoryStats } from '@/lib/admin/merge-users';
import * as adminService from '@/services/admin.service';

function initials(name) {
  const parts = String(name).split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  return parts
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase();
}

function accountVariant(status) {
  if (status === 'PENDING_PASSWORD') return 'pending';
  if (status === 'ACTIVE') return 'active';
  if (status === 'FROZEN') return 'frozen';
  return 'inactive';
}

function accountLabel(status) {
  if (status === 'PENDING_PASSWORD') return 'Pending password';
  if (status === 'ACTIVE') return 'Active';
  if (status === 'FROZEN') return 'Frozen';
  return 'Inactive';
}

/**
 * @param {{ rows: import('@/lib/admin/merge-users').mergeUsersDirectory extends (...args: any) => infer R ? R : never, onRefresh: () => void }} props
 */
export function UsersTable({ rows, onRefresh }) {
  const [search, setSearch] = useState('');
  const [actionId, setActionId] = useState(null);
  const [message, setMessage] = useState('');

  const stats = useMemo(() => directoryStats(rows), [rows]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.fullName.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.employeeCode.toLowerCase().includes(q),
    );
  }, [rows, search]);

  async function runAction(userId, fn) {
    setActionId(userId);
    setMessage('');
    try {
      await fn();
      setMessage('Updated successfully.');
      onRefresh();
    } catch (err) {
      setMessage(err.message || 'Action failed.');
    } finally {
      setActionId(null);
    }
  }

  async function copySetupLink(userId) {
    setActionId(userId);
    try {
      const res = await adminService.issueSetupLink(userId);
      await navigator.clipboard.writeText(res.setupUrl);
      setMessage('Setup link copied to clipboard.');
    } catch (err) {
      setMessage(err.message || 'Could not generate link.');
    } finally {
      setActionId(null);
    }
  }

  async function handleResetPassword(userId) {
    const confirmed = window.confirm(
      'Reset this user\'s password? They will be signed out and must set a new password before they can sign in again.',
    );
    if (!confirmed) return;

    setActionId(userId);
    setMessage('');
    try {
      const res = await adminService.resetPassword(userId);
      if (res.setupUrl) {
        await navigator.clipboard.writeText(res.setupUrl);
      }
      setMessage(
        `${res.message || 'Password reset.'} Setup link copied to clipboard.`,
      );
      onRefresh();
    } catch (err) {
      setMessage(err.message || 'Could not reset password.');
    } finally {
      setActionId(null);
    }
  }

  return (
    <section className="space-y-4 lg:col-span-8">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <MiniStat label="Total users" value={stats.total} />
        <MiniStat label="Allocated" value={stats.allocated} />
        <MiniStat label="On bench" value={stats.bench} />
      </div>

      {message ? (
        <p className="rounded-md border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700">
          {message}
        </p>
      ) : null}

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-4 border-b border-slate-200 px-6 py-4 md:flex-row md:items-center">
          <h3 className="text-lg font-semibold text-slate-900">User directory</h3>
          <div className="relative w-full md:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, ID, or email…"
              className="w-full rounded-full border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-100"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">User details</th>
                <th className="px-4 py-3 text-center">Role</th>
                <th className="px-4 py-3">Manager</th>
                <th className="px-4 py-3">Work status</th>
                <th className="px-4 py-3">Account</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-sm text-slate-500"
                  >
                    {rows.length === 0
                      ? 'No users yet — create your first manager or employee.'
                      : 'No users match your search.'}
                  </td>
                </tr>
              ) : (
                filtered.map((row) => (
                  <tr
                    key={row.userId}
                    className="group transition-colors hover:bg-slate-50"
                  >
                    <td className="px-4 py-3 text-sm font-semibold text-slate-600">
                      {row.employeeCode}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded bg-slate-100 text-[10px] font-bold text-slate-600">
                          {initials(row.fullName)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {row.fullName}
                            {!row.hasProfile ? (
                              <span className="ml-2 text-xs font-normal text-amber-700">
                                (profile pending)
                              </span>
                            ) : null}
                          </p>
                          <p className="text-xs text-slate-500">{row.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <StatusBadge
                        variant={
                          row.role === 'MANAGER' ? 'roleManager' : 'roleEmployee'
                        }
                      >
                        {row.role === 'MANAGER' ? 'Manager' : 'Employee'}
                      </StatusBadge>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {row.reportingManagerName}
                    </td>
                    <td className="px-4 py-3">
                      {row.workStatus ? (
                        <StatusBadge
                          variant={
                            row.workStatus === 'BENCH' ? 'bench' : 'allocated'
                          }
                        >
                          {row.workStatus === 'BENCH' ? 'Bench' : 'Allocated'}
                        </StatusBadge>
                      ) : (
                        <span className="text-sm text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge variant={accountVariant(row.accountStatus)}>
                        {accountLabel(row.accountStatus)}
                      </StatusBadge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1 opacity-60 transition-opacity group-hover:opacity-100">
                        {actionId === row.userId ? (
                          <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                        ) : (
                          <>
                            {row.accountStatus === 'FROZEN' ? (
                              <IconButton
                                title="Unfreeze account"
                                onClick={() =>
                                  runAction(row.userId, () =>
                                    adminService.unfreezeUser(row.userId),
                                  )
                                }
                              >
                                <Unlock className="h-4 w-4 text-amber-600" />
                              </IconButton>
                            ) : null}
                            <IconButton
                              title="Copy set-password page link (email prefilled)"
                              onClick={() => copySetupLink(row.userId)}
                            >
                              <KeyRound className="h-4 w-4" />
                            </IconButton>
                            {row.accountStatus === 'ACTIVE' ? (
                              <IconButton
                                title="Reset password (user must set a new password on next sign-in)"
                                onClick={() => handleResetPassword(row.userId)}
                              >
                                <RotateCcw className="h-4 w-4" />
                              </IconButton>
                            ) : null}
                            {row.isActive ? (
                              <IconButton
                                title="Deactivate"
                                onClick={() =>
                                  runAction(row.userId, () =>
                                    adminService.deactivateUser(row.userId),
                                  )
                                }
                              >
                                <UserX className="h-4 w-4" />
                              </IconButton>
                            ) : (
                              <IconButton
                                title="Reactivate"
                                onClick={() =>
                                  runAction(row.userId, () =>
                                    adminService.reactivateUser(row.userId),
                                  )
                                }
                              >
                                <CheckCircle2 className="h-4 w-4" />
                              </IconButton>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function MiniStat({ label, value }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {label}
        </p>
        <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
      </div>
    </div>
  );
}

function IconButton({ title, onClick, children }) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className="rounded p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
    >
      {children}
    </button>
  );
}
