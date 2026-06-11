import { projectInitials } from '@/lib/admin/project-display';

/** @typedef {'BENCH' | 'ALLOCATED'} EmployeeStatus */
/** @typedef {'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'} Proficiency */

export function employeeInitials(fullName) {
  return projectInitials(fullName);
}

/** @param {EmployeeStatus} status */
export function employeeStatusLabel(status) {
  if (status === 'ALLOCATED') return 'Allocated';
  return 'Bench';
}

/** @param {EmployeeStatus} status */
export function employeeStatusClass(status) {
  if (status === 'ALLOCATED') {
    return {
      badge: 'bg-slate-900 text-white',
      dot: 'bg-slate-900',
      row: '',
      avatar: 'bg-slate-100 text-slate-800',
    };
  }
  return {
    badge: 'bg-red-50 text-red-800',
    dot: 'bg-red-600',
    row: 'bg-red-50/40',
    avatar: 'bg-red-50 text-red-800',
  };
}

/** @param {Proficiency} proficiency */
export function proficiencyLabel(proficiency) {
  if (proficiency === 'ADVANCED') return 'Advanced';
  if (proficiency === 'INTERMEDIATE') return 'Intermediate';
  return 'Beginner';
}

/** @param {Proficiency} proficiency */
export function proficiencyBarWidth(proficiency) {
  if (proficiency === 'ADVANCED') return '90%';
  if (proficiency === 'INTERMEDIATE') return '60%';
  return '35%';
}

/** @param {Proficiency} proficiency */
export function proficiencyClass(proficiency) {
  if (proficiency === 'ADVANCED') {
    return { badge: 'bg-emerald-50 text-emerald-700', bar: 'bg-emerald-500' };
  }
  if (proficiency === 'INTERMEDIATE') {
    return { badge: 'bg-blue-50 text-blue-700', bar: 'bg-blue-600' };
  }
  return { badge: 'bg-slate-100 text-slate-600', bar: 'bg-slate-400' };
}

/**
 * @param {Array<{ status: string }>} employees
 */
export function directReportStats(employees) {
  const total = employees.length;
  const onBench = employees.filter((e) => e.status === 'BENCH').length;
  const allocated = employees.filter((e) => e.status === 'ALLOCATED').length;
  return { total, onBench, allocated };
}

/**
 * @param {Array<{ utilizationPct: number }>} allocations
 */
export function totalUtilizationPct(allocations) {
  if (!allocations?.length) return 0;
  return allocations.reduce((sum, a) => sum + Number(a.utilizationPct || 0), 0);
}

/** @param {string} status */
export function timesheetStatusLabel(status) {
  if (status === 'SUBMITTED') return 'Submitted';
  if (status === 'APPROVED') return 'Approved';
  if (status === 'REJECTED') return 'Rejected';
  if (status === 'DRAFT') return 'Draft';
  if (status === 'MISSING') return 'Not submitted';
  return status || '—';
}

/** @param {string} status */
export function timesheetStatusClass(status) {
  if (status === 'APPROVED' || status === 'SUBMITTED') {
    return 'bg-slate-100 text-slate-700';
  }
  if (status === 'REJECTED') return 'bg-red-50 text-red-800';
  if (status === 'MISSING') return 'bg-slate-50 text-slate-500';
  return 'bg-amber-50 text-amber-800';
}
