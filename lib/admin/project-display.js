/** @typedef {'PLANNED' | 'ACTIVE' | 'ON_HOLD'} ProjectStatus */
/** @typedef {'ON_TRACK' | 'ATTENTION' | 'AT_RISK'} ProjectHealth */

/** ISO date (YYYY-MM-DD) → DD-MM-YYYY for display */
export function formatApiDate(dateStr) {
  if (!dateStr) return '—';
  const part = String(dateStr).split('T')[0];
  const [y, m, d] = part.split('-');
  if (!y || !m || !d) return part;
  return `${d}-${m}-${y}`;
}

export function projectInitials(name) {
  const parts = String(name || '')
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

/** @param {ProjectStatus} status */
export function projectStatusLabel(status) {
  if (status === 'ACTIVE') return 'Active';
  if (status === 'ON_HOLD') return 'On hold';
  return 'Planned';
}

/** @param {ProjectHealth} health */
export function projectHealthLabel(health) {
  if (health === 'ATTENTION') return 'Attention';
  if (health === 'AT_RISK') return 'At risk';
  return 'On track';
}

/** @param {ProjectStatus} status */
export function projectStatusClass(status) {
  if (status === 'ACTIVE') {
    return 'bg-blue-600 text-white';
  }
  if (status === 'ON_HOLD') {
    return 'bg-red-50 text-red-800';
  }
  return 'bg-slate-200 text-slate-700';
}

/** @param {ProjectHealth} health */
export function projectHealthClass(health) {
  if (health === 'ATTENTION') {
    return { text: 'text-amber-600', dot: 'bg-amber-600' };
  }
  if (health === 'AT_RISK') {
    return { text: 'text-red-600', dot: 'bg-red-600' };
  }
  return { text: 'text-emerald-600', dot: 'bg-emerald-600' };
}

/** @param {import('@/lib/admin/project-display').ProjectStatus} status */
export function projectAvatarClass(status) {
  if (status === 'ACTIVE') return 'bg-blue-100 text-blue-800';
  if (status === 'ON_HOLD') return 'bg-red-50 text-red-700';
  return 'bg-slate-100 text-slate-800';
}

/**
 * @param {Array<{ status: string, health: string }>} projects
 */
export function projectListStats(projects) {
  const active = projects.filter((p) => p.status === 'ACTIVE').length;
  const atRisk = projects.filter((p) => p.health === 'AT_RISK').length;
  const planned = projects.filter((p) => p.status === 'PLANNED').length;
  return { active, atRisk, planned, total: projects.length };
}

/**
 * @param {Array<{ managerId: number, status: string }>} projects
 * @param {number} managerId
 */
export function managerActiveProjectCount(projects, managerId) {
  return projects.filter(
    (p) => p.managerId === managerId && p.status === 'ACTIVE',
  ).length;
}
