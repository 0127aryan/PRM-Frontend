import { ManagerEmployeesPage } from '@/components/manager/manager-employees-page';
import { ManagerShell } from '@/components/manager/manager-shell';

export const metadata = {
  title: 'Direct reports — Manager — PRM Tool',
  description: 'Employees who report to you',
};

export default function ManagerEmployeesRoute() {
  return (
    <ManagerShell
      title="Employee management"
      subtitle="Direct reports"
    >
      <ManagerEmployeesPage />
    </ManagerShell>
  );
}
