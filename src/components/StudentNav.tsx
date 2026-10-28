'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

interface Props {
  code: string;
}

export default function StudentNav({ code }: Props) {
  const pathname = usePathname();
  const [studentName, setStudentName] = useState('');

  useEffect(() => {
    try {
      const info = localStorage.getItem('activity_studio_student_info');
      if (info) setStudentName(JSON.parse(info).name ?? '');
    } catch {}
  }, []);

  const links = [
    { label: '홈', href: `/s/${code}/home` },
    { label: '활동지', href: `/s/${code}/activity` },
    { label: '결과', href: `/s/${code}/result` },
  ];

  return (
    <nav style={{
      width: 180, minWidth: 180,
      background: 'var(--surface)',
      borderRight: '1px solid var(--line)',
      display: 'flex', flexDirection: 'column',
      padding: '24px 0 16px',
      position: 'sticky', top: 0, height: '100vh',
      flexShrink: 0,
    }}>
      <div style={{ padding: '0 18px 20px', borderBottom: '1px solid var(--line)', marginBottom: 8 }}>
        <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-.01em' }}>
          수업활동 스튜디오
        </span>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2, padding: '0 10px' }}>
        {links.map(({ label, href }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: 'flex', alignItems: 'center',
                padding: '10px 12px', borderRadius: 10,
                textDecoration: 'none',
                fontSize: 14, fontWeight: active ? 700 : 500,
                color: active ? 'var(--ink)' : 'var(--ink-2)',
                background: active ? 'var(--canvas)' : 'transparent',
                border: `1px solid ${active ? 'var(--line)' : 'transparent'}`,
                transition: 'background .12s',
              }}
            >
              {label}
            </Link>
          );
        })}
      </div>

      <div style={{ padding: '12px 18px', borderTop: '1px solid var(--line)' }}>
        {studentName && (
          <p style={{ margin: '0 0 6px', fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>{studentName}</p>
        )}
        <span style={{
          display: 'inline-block', padding: '3px 10px', borderRadius: 20,
          fontSize: 12, fontWeight: 700,
          background: 'var(--canvas)', color: 'var(--ink-2)', border: '1px solid var(--line)',
        }}>
          수업 {code}
        </span>
      </div>
    </nav>
  );
}
