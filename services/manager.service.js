import { apiFetch } from '@/lib/api/client';

export function listProjects() {
  return apiFetch('/manager/projects');
}

export function getProject(id) {
  return apiFetch(`/manager/projects/${id}`);
}

export function getProjectRiskFlags(id) {
  return apiFetch(`/manager/projects/${id}/risk-flags`);
}

/** @param {number} id @param {{ status: string }} body */
export function updateProjectStatus(id, body) {
  return apiFetch(`/manager/projects/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export function listDirectReports() {
  return apiFetch('/manager/employees');
}

/** @param {number} id */
export function getEmployee(id) {
  return apiFetch(`/manager/employees/${id}`);
}

/** @param {string} weekStart YYYY-MM-DD (Monday) */
export function listTimesheetsForWeek(weekStart) {
  const q = new URLSearchParams({ weekStart });
  return apiFetch(`/manager/timesheets?${q}`);
}

/** @param {{ employeeId: number, projectId: number, utilizationPct: number, fromDate: string, toDate: string }} body */
export function createAllocation(body) {
  return apiFetch('/manager/allocations', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

/** @param {number} allocationId @param {{ toDate?: string }} [body] */
export function endAllocation(allocationId, body = {}) {
  const today = new Date();
  const localToday = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, '0'),
    String(today.getDate()).padStart(2, '0'),
  ].join('-');

  return apiFetch(`/manager/allocations/${allocationId}/end`, {
    method: 'PATCH',
    body: JSON.stringify({ toDate: body.toDate ?? localToday }),
  });
}

/** @param {{ projectId?: number, keywords?: string[], skillIds?: number[] }} body */
export function searchMatching(body) {
  return apiFetch('/manager/matching/search', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

/** @param {{ projectId?: number, keywords?: string[], skillIds?: number[] }} body */
export function assistantSkillMatch(body) {
  return apiFetch('/manager/assistant/skill-match', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

/** @param {{ projectId: number }} body */
export function assistantRiskSummary(body) {
  return apiFetch('/manager/assistant/risk-summary', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}
