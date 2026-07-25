/** @typedef {'BACKEND' | 'FRONTEND' | 'DEVOPS' | 'QA' | 'OTHER'} SkillCategory */

export const SKILL_CATEGORIES = [
  { value: 'FRONTEND', label: 'Frontend' },
  { value: 'BACKEND', label: 'Backend' },
  { value: 'DEVOPS', label: 'DevOps' },
  { value: 'QA', label: 'QA' },
  { value: 'OTHER', label: 'Other' },
];

/** @param {SkillCategory} category */
export function skillCategoryLabel(category) {
  const found = SKILL_CATEGORIES.find((c) => c.value === category);
  return found?.label ?? category;
}

/** @param {SkillCategory} category */
export function skillCategoryClass(category) {
  switch (category) {
    case 'FRONTEND':
      return 'bg-blue-50 text-blue-700 border-blue-100';
    case 'BACKEND':
      return 'bg-orange-50 text-orange-700 border-orange-100';
    case 'DEVOPS':
      return 'bg-emerald-50 text-emerald-700 border-emerald-100';
    case 'QA':
      return 'bg-purple-50 text-purple-700 border-purple-100';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
}

/** @param {SkillCategory} category */
export function skillCategoryDotClass(category) {
  switch (category) {
    case 'FRONTEND':
      return 'bg-blue-600';
    case 'BACKEND':
      return 'bg-orange-600';
    case 'DEVOPS':
      return 'bg-emerald-600';
    case 'QA':
      return 'bg-purple-600';
    default:
      return 'bg-slate-600';
  }
}

export function formatSkillDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * @param {Array<{ skills?: { skillId: number }[] }>} employees
 */
export function buildSkillUsageCounts(employees) {
  /** @type {Record<number, number>} */
  const counts = {};
  for (const emp of employees) {
    for (const s of emp.skills ?? []) {
      counts[s.skillId] = (counts[s.skillId] ?? 0) + 1;
    }
  }
  return counts;
}
