/**
 * Join admin users with employee profiles for the directory table.
 * @param {Array<{ id: number, email: string, username: string, role: string, accountStatus: string, isActive: boolean, employeeId: number | null }>} users
 * @param {Array<{ userId: number, employeeCode: string, fullName: string, email: string, status: string, reportingManagerName: string | null, userRole: string }>} employees
 */
export function mergeUsersDirectory(users, employees) {
  const byUserId = new Map(employees.map((e) => [e.userId, e]));

  return users
    .filter((u) => u.role === 'MANAGER' || u.role === 'EMPLOYEE')
    .map((user) => {
      const emp = byUserId.get(user.id);
      return {
        userId: user.id,
        employeeRecordId: emp?.id ?? user.employeeId ?? null,
        employeeCode: emp?.employeeCode ?? '—',
        fullName: emp?.fullName ?? user.username,
        email: user.email,
        role: user.role,
        reportingManagerName:
          user.role === 'MANAGER'
            ? '—'
            : emp?.reportingManagerName ?? '—',
        workStatus: emp?.status ?? null,
        accountStatus: user.accountStatus,
        isActive: user.isActive,
        hasProfile: Boolean(emp),
      };
    });
}

/**
 * @param {ReturnType<typeof mergeUsersDirectory>} rows
 */
export function directoryStats(rows) {
  const withProfile = rows.filter((r) => r.hasProfile);
  const allocated = withProfile.filter((r) => r.workStatus === 'ALLOCATED').length;
  const bench = withProfile.filter((r) => r.workStatus === 'BENCH').length;
  return {
    total: rows.length,
    allocated,
    bench,
  };
}
