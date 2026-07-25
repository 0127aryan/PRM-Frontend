import { EmployeeAllocationsPage } from '@/components/employee/employee-allocations-page';
import { EmployeeShell } from '@/components/employee/employee-shell';

export const metadata = {
  title: 'My allocations — Employee — PRM Tool',
  description: 'Your active project allocations',
};

export default function EmployeeAllocationsRoute() {
  return (
    <EmployeeShell title="My allocations" subtitle="Active project assignments">
      <EmployeeAllocationsPage />
    </EmployeeShell>
  );
}
