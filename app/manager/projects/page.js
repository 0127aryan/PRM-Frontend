import { ManagerProjectsPage } from '@/components/manager/manager-projects-page';
import { ManagerShell } from '@/components/manager/manager-shell';

export const metadata = {
  title: 'My projects — Manager — PRM Tool',
  description: 'Projects assigned to you as delivery manager',
};

export default function ManagerProjectsRoute() {
  return (
    <ManagerShell title="My projects" subtitle="Projects you manage">
      <ManagerProjectsPage />
    </ManagerShell>
  );
}
