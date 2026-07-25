export function EmployeeDetailAllocationLoad({ employee, utilization }) {
  return (
    <section className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-8 lg:col-span-4">
      <div>
        <h4 className="text-lg font-semibold text-slate-900">
          Allocation load
        </h4>
        <p className="mt-1 text-sm text-slate-500">
          Sum of active allocation percentages
        </p>
      </div>

      <div className="my-6 flex items-center justify-center">
        <div className="relative flex h-32 w-32 items-center justify-center">
          <svg className="h-full w-full -rotate-90" viewBox="0 0 128 128">
            <circle
              cx="64"
              cy="64"
              r="58"
              fill="transparent"
              stroke="currentColor"
              strokeWidth="8"
              className="text-slate-100"
            />
            <circle
              cx="64"
              cy="64"
              r="58"
              fill="transparent"
              stroke="currentColor"
              strokeWidth="8"
              strokeDasharray={364.4}
              strokeDashoffset={364.4 - (364.4 * Math.min(utilization, 100)) / 100}
              className="text-slate-900"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-semibold text-slate-900">
              {utilization}%
            </span>
            <span className="text-[11px] font-semibold uppercase text-slate-500">
              Utilised
            </span>
          </div>
        </div>
      </div>

      <div>
        <div className="flex justify-between text-xs font-semibold text-slate-600">
          <span>Active allocations</span>
          <span>{employee.allocations?.length ?? 0}</span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-slate-900 transition-all"
            style={{ width: `${Math.min(utilization, 100)}%` }}
          />
        </div>
      </div>
    </section>
  );
}
