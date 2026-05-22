'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';

const nav = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/check-in', label: 'Check-In' },
  { href: '/safe-exit', label: 'Safe Exit' },
  { href: '/staff', label: 'Staff & Roles' },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { staff, logout, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-ink-muted">Loading…</p>
      </div>
    );
  }

  if (!staff && pathname !== '/login') {
    router.replace('/login');
    return null;
  }

  if (pathname === '/login') {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="card mx-4 mt-4 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-ink">Safe Exit Hub</h1>
          <p className="text-sm text-ink-muted">
            Signed in as <span className="font-semibold text-ink">{staff?.fullName}</span>
            <span className="badge-purple ml-2 px-2 py-0.5 rounded-full text-xs inline-block">
              {staff?.roleName}
            </span>
          </p>
        </div>
        <nav className="flex flex-wrap gap-2">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                pathname === item.href
                  ? 'bg-soft-purple-deep text-white'
                  : 'bg-soft-blue/60 hover:bg-soft-blue'
              }`}
            >
              {item.label}
            </Link>
          ))}
          <button
            type="button"
            onClick={() => {
              logout();
              router.push('/login');
            }}
            className="px-3 py-1.5 rounded-lg text-sm bg-soft-red/80 hover:bg-soft-red"
          >
            Log out
          </button>
        </nav>
      </header>
      <main className="flex-1 p-4 md:p-6 max-w-6xl w-full mx-auto">{children}</main>
    </div>
  );
}
