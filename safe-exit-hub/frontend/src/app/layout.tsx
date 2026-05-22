import type { Metadata } from 'next';
import { AuthProvider } from '@/lib/auth';
import AppShell from '@/components/AppShell';
import './globals.css';

export const metadata: Metadata = {
  title: 'Safe Exit Hub',
  description: 'Dynamic staff RBAC child check-in and safe exit',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <AppShell>{children}</AppShell>
        </AuthProvider>
      </body>
    </html>
  );
}
