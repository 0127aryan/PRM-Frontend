import { formatApiDate, projectStatusLabel } from '@/lib/admin/project-display';

/** Default cap for UI summaries; server uses system_config max_weekly_hours. */
export const DEFAULT_MAX_WEEKLY_HOURS = 40;

/** @param {string} status */
export function timesheetWeekStatusLabel(status) {
  if (status === 'SUBMITTED') return 'Submitted';
  if (status === 'MISSED') return 'Missed';
  if (status === 'NOT_SUBMITTED') return 'Not submitted';
  return status || '—';
}

/** @param {string} status */
export function timesheetWeekStatusClass(status) {
  if (status === 'SUBMITTED') return 'bg-emerald-50 text-emerald-800';
  if (status === 'MISSED') return 'bg-red-50 text-red-800';
  return 'bg-amber-50 text-amber-800';
}

/**
 * @param {{ fromDate: string, toDate: string }} allocation
 * @param {string} weekStart
 * @param {string} weekEnd
 */
export function allocationCoversWeek(allocation, weekStart, weekEnd) {
  return allocation.fromDate <= weekEnd && allocation.toDate >= weekStart;
}

/**
 * @param {number} utilizationPct
 * @param {number} [maxWeeklyHours]
 */
export function maxHoursForAllocation(utilizationPct, maxWeeklyHours = DEFAULT_MAX_WEEKLY_HOURS) {
  return Math.floor((Number(utilizationPct) * maxWeeklyHours) / 100);
}

/** @param {string} projectStatus */
export function allocationProjectStatusLabel(projectStatus) {
  return projectStatusLabel(projectStatus);
}

export function formatWeekHeading(weekStart, weekEnd) {
  return `${formatApiDate(weekStart)} – ${formatApiDate(weekEnd)}`;
}

/**
 * @param {Array<{ utilizationPct: number }>} allocations
 */
export function totalAllocationPct(allocations) {
  if (!allocations?.length) return 0;
  return allocations.reduce((s, a) => s + Number(a.utilizationPct || 0), 0);
}
