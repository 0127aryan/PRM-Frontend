import { AdminProjectsPage } from '@/components/admin/admin-projects-page';
import { AdminShell } from '@/components/admin/admin-shell';

export const metadata = {
  title: 'Projects — Admin — XYZ PRM',
  description: 'Manage projects and assign delivery managers',
};

export default function AdminProjectsRoute() {
  return (
    <AdminShell title="Projects">
      <AdminProjectsPage />
    </AdminShell>
  );
}
