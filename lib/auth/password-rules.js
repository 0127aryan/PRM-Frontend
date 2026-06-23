/**
 * PRM password policy — must match backend
 * `common/validation/password-policy.ts` (SetPasswordDto, ChangePasswordDto).
 */

export const PASSWORD_MIN_LENGTH = 12;

export const PRM_PASSWORD_MESSAGE =
  'Password must be at least 12 characters and include a number and a special character';

export function passwordChecks(password) {
  return {
    length: password.length >= PASSWORD_MIN_LENGTH,
    special: /[^A-Za-z0-9]/.test(password),
    number: /[0-9]/.test(password),
  };
}

export function isPasswordValid(password) {
  const checks = passwordChecks(password);
  return checks.length && checks.special && checks.number;
}

/** @returns {0 | 1 | 2 | 3 | 4} */
export function passwordStrength(password) {
  let strength = 0;
  if (password.length >= 8) strength += 1;
  if (password.length >= PASSWORD_MIN_LENGTH) strength += 1;
  if (/[0-9]/.test(password)) strength += 1;
  if (/[^A-Za-z0-9]/.test(password)) strength += 1;
  return strength;
}

export const STRENGTH_LABELS = ['Weak', 'Fair', 'Good', 'Strong'];
export const STRENGTH_COLORS = [
  'bg-red-500',
  'bg-amber-600',
  'bg-slate-700',
  'bg-emerald-600',
];
