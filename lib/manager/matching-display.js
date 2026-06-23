import {
  employeeStatusClass,
  employeeStatusLabel,
} from '@/lib/manager/employee-display';
import {
  projectHealthClass,
  projectHealthLabel,
} from '@/lib/admin/project-display';

/** @param {string} mode */
export function matchingModeLabel(mode) {
  if (mode === 'llm') return 'AI (LLM)';
  return 'Keyword matching';
}

/** @param {number} score */
export function matchScoreLabel(score) {
  if (score >= 15) return 'Strong match';
  if (score >= 8) return 'Good match';
  return 'Possible match';
}

export { employeeStatusClass, employeeStatusLabel, projectHealthClass, projectHealthLabel };

/**
 * Turn plain-English requirement into keyword tokens for the API.
 * @param {string} text
 */
export function parseRequirementKeywords(text) {
  return [
    ...new Set(
      text
        .toLowerCase()
        .split(/[\s,;/]+/)
        .map((s) => s.replace(/[^a-z0-9+#]/g, ''))
        .filter((s) => s.length >= 2),
    ),
  ];
}
