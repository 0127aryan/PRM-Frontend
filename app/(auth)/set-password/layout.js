/** Wider canvas for bento set-password layout (Stitch v4). */
export default function SetPasswordLayout({ children }) {
  return (
    <div
      className="relative flex min-h-screen w-full items-center justify-center p-4 md:p-6"
      style={{
        backgroundColor: '#f8fafc',
        backgroundImage:
          'radial-gradient(#e2e8f0 0.5px, transparent 0.5px)',
        backgroundSize: '24px 24px',
      }}
    >
      {children}
    </div>
  );
}
