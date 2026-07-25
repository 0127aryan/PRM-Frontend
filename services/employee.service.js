import { apiFetch } from '@/lib/api/client';

export function listActivityTags() {
  return apiFetch('/employee/activity-tags');
}

export function listAllocations() {
  return apiFetch('/employee/allocations');
}

/** @param {string} [weekStart] */
export function listTimesheets(weekStart) {
  const q = weekStart ? `?${new URLSearchParams({ weekStart })}` : '';
  return apiFetch(`/employee/timesheets${q}`);
}

export function missedReminders() {
  return apiFetch('/employee/timesheets/reminders');
}

/** @param {{ weekStart: string, entries: Array<{ projectId: number, hours: number, tags: Array<{ activityTagId?: number, otherText?: string }> }> }} body */
export function submitTimesheet(body) {
  return apiFetch('/employee/timesheets', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}
