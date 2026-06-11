import { cn } from '@/lib/utils';

const variants = {
  roleManager: 'bg-slate-200 text-slate-800',
  roleEmployee: 'bg-slate-100 text-slate-700',
  bench: 'bg-slate-100 text-slate-600',
  allocated: 'bg-blue-50 text-blue-800',
  pending: 'bg-orange-50 text-orange-800',
  active: 'bg-emerald-50 text-emerald-800',
  inactive: 'bg-red-50 text-red-800',
};

/**
 * @param {{ variant: keyof typeof variants, children: React.ReactNode, className?: string }} props
 */
export function StatusBadge({ variant, children, className }) {
  return (
    <span
      className={cn(
        'inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-tight',
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
