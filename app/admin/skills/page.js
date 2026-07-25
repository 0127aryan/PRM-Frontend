import { AdminSkillsPage } from '@/components/admin/admin-skills-page';
import { AdminShell } from '@/components/admin/admin-shell';

export const metadata = {
  title: 'Skills — Admin — XYZ PRM',
  description: 'Manage the skills catalog',
};

export default function AdminSkillsRoute() {
  return (
    <AdminShell title="Skills catalog">
      <AdminSkillsPage />
    </AdminShell>
  );
}
