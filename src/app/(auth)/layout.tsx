// Layout for the auth route group: no admin shell, just a centered card area.
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      {children}
    </div>
  );
}
