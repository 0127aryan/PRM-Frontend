import { AdminCreateProjectPage } from '@/components/admin/admin-create-project-page';
import { AdminShell } from '@/components/admin/admin-shell';

export const metadata = {
  title: 'Create project — Admin — XYZ PRM',
  description: 'Create a new project and assign a manager',
};

export default function AdminCreateProjectRoute() {
  return (
    <AdminShell title="Create new project">
      <AdminCreateProjectPage />
    </AdminShell>
  );
}
