'use client';

import {
  ArrowRight,
  CheckCircle2,
  Circle,
  Info,
  Loader2,
  Shield,
} from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { PasswordInput } from '@/components/auth/password-input';
import { useSetPassword } from '@/hooks/useSetPassword';
import {
  PASSWORD_MIN_LENGTH,
  passwordChecks,
  passwordStrength,
  STRENGTH_COLORS,
  STRENGTH_LABELS,
} from '@/lib/auth/password-rules';
import { cn } from '@/lib/utils';

function RequirementItem({ met, children }) {
  return (
    <li
      className={cn(
        'flex items-center gap-2 text-sm',
        met ? 'text-slate-900' : 'text-slate-500',
      )}
    >
      {met ? (
        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
      ) : (
        <Circle className="h-4 w-4 shrink-0 text-slate-300" />
      )}
      {children}
    </li>
  );
}

export function SetPasswordForm() {
  const {
    email,
    setEmail,
    eligibility,
    submit,
    loading,
    error,
    success,
  } = useSetPassword();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const checks = useMemo(() => passwordChecks(password), [password]);
  const strength = useMemo(() => passwordStrength(password), [password]);
  const strengthLabel =
    password.length > 0 ? STRENGTH_LABELS[Math.max(0, strength - 1)] : null;
  const strengthTextColors = [
    'text-red-600',
    'text-amber-600',
    'text-slate-700',
    'text-emerald-600',
  ];
  const strengthColor =
    password.length > 0
      ? strengthTextColors[Math.max(0, strength - 1)]
      : '';

  function handleSubmit(event) {
    event.preventDefault();
    submit(password, confirmPassword);
  }

  return (
    <>
      <main className="relative z-10 mx-auto grid w-full max-w-[1000px] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm md:grid-cols-12">
        <section className="relative hidden flex-col justify-between overflow-hidden bg-slate-900 p-12 md:col-span-5 md:flex">
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-slate-700/40 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-10 -left-10 h-48 w-48 rounded-full bg-slate-600/30 blur-3xl" />

          <div className="relative z-10">
            <div className="mb-12 flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-800">
                <Shield className="h-5 w-5 text-slate-100" strokeWidth={2.25} />
              </div>
              <span className="text-sm font-bold tracking-tight text-white">
                PRM Tool
              </span>
            </div>
            <div className="space-y-4">
              <h1 className="text-3xl font-semibold leading-tight text-white">
                Secure your enterprise account.
              </h1>
              <p className="text-base text-slate-400">
                Create your password to access the Project & Resource Management
                suite.
              </p>
            </div>
          </div>

          <p className="relative z-10 border-t border-slate-700 pt-8 text-xs uppercase tracking-widest text-slate-500">
            Enterprise-grade access control
          </p>
        </section>

        <section className="col-span-1 flex flex-col justify-center p-8 md:col-span-7 md:p-16">
          <div className="mx-auto w-full max-w-[400px]">
            <div className="mb-10">
              <h2 className="text-2xl font-semibold text-slate-900">Set password</h2>
              <p className="mt-2 text-sm text-slate-500">
                Use the work email your administrator registered. Required for
                first-time setup and after an administrator resets your password.
              </p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit} noValidate>
              <div className="space-y-2">
                <label
                  htmlFor="setup-email"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-500"
                >
                  Work email
                </label>
                <input
                  id="setup-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  required
                  className="h-12 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-100"
                />
                {eligibility === 'checking' ? (
                  <p className="text-xs text-slate-500">Checking account…</p>
                ) : null}
                {eligibility === 'eligible' ? (
                  <p className="text-xs font-medium text-emerald-700">
                    This account is ready for password setup.
                  </p>
                ) : null}
                {eligibility === 'ineligible' ? (
                  <p className="text-xs text-amber-800">
                    This email cannot set a password here. You may already have
                    one—try{' '}
                    <Link href="/login" className="font-semibold underline">
                      signing in
                    </Link>
                    , or ask your administrator.
                  </p>
                ) : null}
              </div>

              <div>
                <PasswordInput
                  id="new-password"
                  label="New password"
                  value={password}
                  onChange={setPassword}
                  icon="lock"
                  strengthLabel={strengthLabel}
                  strengthColor={strengthColor}
                />
                <div className="mt-2 flex h-1 gap-1">
                  {[0, 1, 2, 3].map((index) => (
                    <div
                      key={index}
                      className={cn(
                        'flex-1 rounded-full transition-colors',
                        index < strength
                          ? STRENGTH_COLORS[Math.max(0, strength - 1)]
                          : 'bg-slate-200',
                      )}
                    />
                  ))}
                </div>
              </div>

              <PasswordInput
                id="confirm-password"
                label="Confirm password"
                value={confirmPassword}
                onChange={setConfirmPassword}
                icon="shield"
              />

              <div className="rounded-lg border border-slate-200/80 bg-slate-50 p-4">
                <h4 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-700">
                  <Info className="h-4 w-4 text-slate-900" />
                  Password requirements
                </h4>
                <ul className="space-y-2">
                  <RequirementItem met={checks.length}>
                    At least {PASSWORD_MIN_LENGTH} characters long
                  </RequirementItem>
                  <RequirementItem met={checks.special}>
                    Include special character (!@#$%)
                  </RequirementItem>
                  <RequirementItem met={checks.number}>
                    Include at least one number
                  </RequirementItem>
                </ul>
              </div>

              {error ? (
                <p
                  role="alert"
                  className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
                >
                  {error}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={loading || success}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 py-3.5 text-sm font-semibold text-white transition-all hover:bg-slate-800 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Saving…</span>
                  </>
                ) : (
                  <>
                    <span>Set new password</span>
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 border-t border-slate-200 pt-8 text-center">
              <p className="text-sm text-slate-500">
                Already have a password?{' '}
                <Link
                  href="/login"
                  className="font-semibold text-slate-900 hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </section>
      </main>

      <div
        role="status"
        aria-live="polite"
        className={cn(
          'fixed bottom-8 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-full bg-slate-900 px-6 py-4 text-sm font-medium text-white shadow-lg transition-all duration-500',
          success
            ? 'translate-y-0 opacity-100'
            : 'pointer-events-none translate-y-8 opacity-0',
        )}
      >
        <CheckCircle2 className="h-5 w-5 text-emerald-400" />
        Password updated. Redirecting…
      </div>
    </>
  );
}