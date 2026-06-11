import { apiFetch } from '@/lib/api/client';

export function listUsers() {
  return apiFetch('/admin/users');
}

export function listEmployees() {
  return apiFetch('/admin/employees');
}

export function listProjects() {
  return apiFetch('/admin/projects');
}

export function getProject(id) {
  return apiFetch(`/admin/projects/${id}`);
}

/** @param {{ name: string, description?: string, startDate: string, endDate: string, status?: string, managerId: number }} body */
export function createProject(body) {
  return apiFetch('/admin/projects', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

/** @param {number} id @param {object} body */
export function updateProject(id, body) {
  return apiFetch(`/admin/projects/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

/** @param {number} projectId @param {{ title: string, dueDate: string, status?: string }} body */
export function addProjectMilestone(projectId, body) {
  return apiFetch(`/admin/projects/${projectId}/milestones`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function listSkills() {
  return apiFetch('/admin/skills');
}

/** @param {{ name: string, category: string }} body */
export function createSkill(body) {
  return apiFetch('/admin/skills', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function getSettingsConfig() {
  return apiFetch('/admin/settings/config');
}

/** @param {Record<string, string>} values */
export function patchSettingsConfig(values) {
  return apiFetch('/admin/settings/config', {
    method: 'PATCH',
    body: JSON.stringify({ values }),
  });
}

export function listActivityTags() {
  return apiFetch('/admin/settings/activity-tags');
}

/** @param {{ name: string }} body */
export function createActivityTag(body) {
  return apiFetch('/admin/settings/activity-tags', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

/** @param {{ email: string, role: string, username?: string }} body */
export function createUser(body) {
  return apiFetch('/admin/users', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

/** @param {object} body - CreateEmployeeDto */
export function createEmployee(body) {
  return apiFetch('/admin/employees', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function deactivateUser(userId) {
  return apiFetch(`/admin/users/${userId}/deactivate`, { method: 'POST' });
}

export function reactivateUser(userId) {
  return apiFetch(`/admin/users/${userId}/reactivate`, { method: 'POST' });
}

export function issueSetupLink(userId) {
  return apiFetch(`/admin/users/${userId}/setup-link`, { method: 'POST' });
}

export function resetPassword(userId) {
  return apiFetch(`/admin/users/${userId}/reset-password`, { method: 'POST' });
}
