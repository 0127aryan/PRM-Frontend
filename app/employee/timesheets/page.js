import { EmployeeShell } from '@/components/employee/employee-shell';
import { EmployeeTimesheetsPage } from '@/components/employee/employee-timesheets-page';

export const metadata = {
  title: 'Weekly timesheet — Employee — PRM Tool',
  description: 'Submit and view your weekly timesheets',
};

export default function EmployeeTimesheetsRoute() {
  return (
    <EmployeeShell title="Weekly timesheet" subtitle="Submit hours and activity tags">
      <EmployeeTimesheetsPage />
    </EmployeeShell>
  );
}
