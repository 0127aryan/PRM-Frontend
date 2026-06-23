import Link from 'next/link';
import { formatApiDate } from '@/lib/admin/project-display';

export function EmployeeDetailAllocationsTable({ employee }) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white lg:col-span-8">
      <div className="border-b border-slate-200 px-6 py-4">
        <h4 className="text-lg font-semibold text-slate-900">
          Active allocations
        </h4>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[500px] text-left text-sm">
          <thead>
            <tr className="bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              <th className="px-6 py-3">Project</th>
              <th className="px-6 py-3">Utilisation</th>
              <th className="px-6 py-3">From</th>
              <th className="px-6 py-3">To</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {(employee.allocations ?? []).length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-10 text-center text-slate-500">
                  No active allocations — employee is on bench.
                </td>
              </tr>
            ) : (
              employee.allocations.map((alloc) => (
                <tr key={alloc.id} className="hover:bg-slate-50">
                  <td className="px-6 py-3 font-medium text-slate-900">
                    {alloc.projectId ? (
                      <Link
                        href={`/manager/projects/${alloc.projectId}`}
                        className="hover:underline"
                      >
                        {alloc.projectName}
                      </Link>
                    ) : (
                      alloc.projectName
                    )}
                  </td>
                  <td className="px-6 py-3">{alloc.utilizationPct}%</td>
                  <td className="px-6 py-3">{formatApiDate(alloc.fromDate)}</td>
                  <td className="px-6 py-3">
                    {alloc.toDate ? formatApiDate(alloc.toDate) : '—'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
