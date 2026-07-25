import { Suspense } from 'react';
import { ManagerAllocatePage } from '@/components/manager/manager-allocate-page';
import { ManagerShell } from '@/components/manager/manager-shell';
import { Loader2 } from 'lucide-react';

export const metadata = {
  title: 'Allocate resource — Manager — PRM Tool',
  description: 'Skill match and allocate direct reports to projects',
};

function AllocateFallback() {
  return (
    <div className="flex items-center justify-center gap-2 p-16 text-slate-500">
      <Loader2 className="h-6 w-6 animate-spin" />
      Loading…
    </div>
  );
}

export default function ManagerAllocateRoute() {
  return (
    <ManagerShell
      title="Allocate resource"
      subtitle="Skill match and direct allocation"
    >
      <Suspense fallback={<AllocateFallback />}>
        <ManagerAllocatePage />
      </Suspense>
    </ManagerShell>
  );
}
