import { ManagerProjectDetailPage } from '@/components/manager/manager-project-detail-page';
import { ManagerShell } from '@/components/manager/manager-shell';

export const metadata = {
  title: 'Project detail — Manager — PRM Tool',
};

export default async function ManagerProjectDetailRoute({ params }) {
  const { id } = await params;
  const projectId = Number(id);

  return (
    <ManagerShell title="Project detail">
      <ManagerProjectDetailPage projectId={projectId} />
    </ManagerShell>
  );
}
