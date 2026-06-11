export default function AuthLayout({ children }) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-slate-50 p-4">
      <div className="pointer-events-none fixed inset-0 z-0" aria-hidden>
        <div className="absolute -left-[5%] -top-[10%] h-[40%] w-[40%] rounded-full bg-slate-200/40 blur-[120px]" />
        <div className="absolute -bottom-[10%] -right-[5%] h-[50%] w-[50%] rounded-full bg-slate-300/30 blur-[140px]" />
      </div>
      {children}
    </div>
  );
}
