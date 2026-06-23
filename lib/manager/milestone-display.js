/** @typedef {'NOT_STARTED' | 'IN_PROGRESS' | 'DONE'} MilestoneStatus */

/** @param {MilestoneStatus} status */
export function milestoneStatusLabel(status) {
  if (status === 'IN_PROGRESS') return 'In progress';
  if (status === 'DONE') return 'Done';
  return 'Not started';
}

/** @param {MilestoneStatus} status */
export function milestoneStatusClass(status) {
  if (status === 'DONE') return 'bg-emerald-50 text-emerald-700';
  if (status === 'IN_PROGRESS') return 'bg-blue-50 text-blue-800';
  return 'bg-slate-100 text-slate-600';
}
