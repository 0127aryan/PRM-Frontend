import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { ManagerAssistantPage } from '@/components/manager/manager-assistant-page';
import { ManagerShell } from '@/components/manager/manager-shell';

export const metadata = {
  title: 'AI assistant — Manager — PRM Tool',
  description: 'Skill match suggestions and project risk summaries',
};

function AssistantFallback() {
  return (
    <div className="flex items-center justify-center gap-2 p-16 text-slate-500">
      <Loader2 className="h-6 w-6 animate-spin" />
      Loading…
    </div>
  );
}

export default function ManagerAssistantRoute() {
  return (
    <ManagerShell title="AI assistant" subtitle="Skill match and risk summary">
      <Suspense fallback={<AssistantFallback />}>
        <ManagerAssistantPage />
      </Suspense>
    </ManagerShell>
  );
}
