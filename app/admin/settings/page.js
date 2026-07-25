import { AdminSettingsPage } from '@/components/admin/admin-settings-page';
import { AdminShell } from '@/components/admin/admin-shell';

export const metadata = {
  title: 'Settings — Admin — XYZ PRM',
  description: 'System configuration and activity tags',
};

export default function AdminSettingsRoute() {
  return (
    <AdminShell title="System configuration">
      <AdminSettingsPage />
    </AdminShell>
  );
}
