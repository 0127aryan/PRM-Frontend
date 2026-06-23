import { Suspense } from 'react';
import { SetPasswordForm } from '@/components/auth/set-password-form';

export const metadata = {
  title: 'Set password — PRM Tool',
  description: 'Create your password to access PRM Tool',
};

function SetPasswordFallback() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <p className="text-sm text-slate-500">Loading…</p>
    </div>
  );
}

export default function SetPasswordPage() {
  return (
    <Suspense fallback={<SetPasswordFallback />}>
      <SetPasswordForm />
    </Suspense>
  );
}
