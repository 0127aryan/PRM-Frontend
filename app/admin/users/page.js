import { AdminUsersPage } from '@/components/admin/admin-users-page';
import { AdminShell } from '@/components/admin/admin-shell';

export const metadata = {
  title: 'Users — Admin — XYZ PRM',
  description: 'Create and manage managers and employees',
};

export default function AdminUsersRoute() {
  return (
    <AdminShell title="User management">
      <AdminUsersPage />
    </AdminShell>
  );
}
