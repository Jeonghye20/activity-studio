import { Suspense } from 'react';
import AppShell from '@/components/AppShell';

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: 'var(--canvas)' }} />}>
      <AppShell>{children}</AppShell>
    </Suspense>
  );
}
