/** Post-login home routes by role (v4). */
export function getHomePathForRole(role) {
  const normalized = String(role ?? '').toUpperCase();
  switch (normalized) {
    case 'ADMIN':
      return '/admin';
    case 'MANAGER':
      return '/manager/projects';
    case 'EMPLOYEE':
      return '/employee/timesheets';
    default:
      return '/login';
  }
}
