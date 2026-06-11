import { ManagerEmployeeDetailPage } from '@/components/manager/manager-employee-detail-page';
import { ManagerShell } from '@/components/manager/manager-shell';

export const metadata = {
  title: 'Employee profile — Manager — PRM Tool',
};

export default async function ManagerEmployeeDetailRoute({ params }) {
  const { id } = await params;
  const employeeId = Number(id);

  return (
    <ManagerShell title="Employee profile">
      <ManagerEmployeeDetailPage employeeId={employeeId} />
    </ManagerShell>
  );
}
