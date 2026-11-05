'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { getStudentActivities, DEMO_TODO } from '@/lib/studentDemoData';

const LS_KEY = 'activity_studio_student_info';

interface StudentInfo {
  cls: string;
  num: string;
  name: string;
}

function Logo() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" aria-hidden="true">
      <rect width="40" height="40" rx="11" fill="#ffd43b" />
      <path d="M9 12h8l2 2h12v6H9z" fill="#172036" />
      <path d="M9 22h14l2 2h6v5H9z" fill="#172036" opacity=".55" />
    </svg>
  );
}

const IconHome = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />
  </svg>
);

const IconActivity = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="9" y1="13" x2="15" y2="13" />
    <line x1="9" y1="17" x2="13" y2="17" />
  </svg>
);

const IconRecord = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
    <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
  </svg>
);

function getActiveSection(pathname: string, code: string): string {
  if (
    pathname.startsWith(`/s/${code}/activities`) ||
    pathname.startsWith(`/s/${code}/activity`) ||
    pathname.startsWith(`/s/${code}/result`)
  ) return 'activities';
  if (pathname.startsWith(`/s/${code}/record`)) return 'record';
  return 'home';
}

function calcBadge(code: string): number {
  try {
    return getStudentActivities(code).todoItems.length;
  } catch {
    return DEMO_TODO.length;
  }
}

export default function StudentShell({ code, children }: { code: string; children: ReactNode }) {
  const pathname = usePathname();
  const active = getActiveSection(pathname, code);
  const [info, setInfo] = useState<StudentInfo | null>(null);
  const [badge, setBadge] = useState(0);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) setInfo(JSON.parse(raw));
    } catch {}

    setBadge(calcBadge(code));

    function onBadgeUpdate() { setBadge(calcBadge(code)); }
    window.addEventListener('activity_studio_badge_update', onBadgeUpdate);
    window.addEventListener('storage', onBadgeUpdate);
    return () => {
      window.removeEventListener('activity_studio_badge_update', onBadgeUpdate);
      window.removeEventListener('storage', onBadgeUpdate);
    };
  }, [code]);

  const name = info?.name || '이름 없음';
  const cls = info?.cls || '';
  const paddedNum = info?.num
    ? String(parseInt(info.num, 10)).padStart(2, '0')
    : '00';

  return (
    <div className="app-shell">
      <aside className="app-side" aria-label="메뉴">
        <Link href={`/s/${code}/home`} className="shell-brand">
          <Logo />
          <div className="shell-brand-text">
            <b>수업활동 스튜디오</b>
            <small>비상교육</small>
          </div>
        </Link>

        <nav className="shell-nav">
          <NavBtn
            href={`/s/${code}/home`}
            label="홈"
            icon={<IconHome />}
            active={active === 'home'}
          />
          <NavBtn
            href={`/s/${code}/activities`}
            label="내 활동"
            icon={<IconActivity />}
            active={active === 'activities'}
            badge={badge}
          />
          <NavBtn
            href={`/s/${code}/record`}
            label="나의 기록"
            icon={<IconRecord />}
            active={active === 'record'}
          />
        </nav>

        <div className="shell-foot">
          <Link href="/s" className="shell-preview-btn">
            다른 수업 코드 입력
          </Link>

          <div className="shell-me">
            <span
              style={{
                width: 38, height: 38, borderRadius: '50%',
                background: 'var(--concept)',
                display: 'grid', placeItems: 'center',
                fontWeight: 800, color: '#fff', fontSize: 15, flexShrink: 0,
              }}
              aria-hidden="true"
            >
              {name[0] ?? '?'}
            </span>
            <div>
              <b>{name}</b>
              <small>{cls && `${cls} `}{paddedNum}번</small>
            </div>
          </div>
        </div>
      </aside>

      <main className="app-main" id="main-content">
        {children}
      </main>
    </div>
  );
}

function NavBtn({
  href, label, icon, active, badge,
}: {
  href: string;
  label: string;
  icon: ReactNode;
  active: boolean;
  badge?: number;
}) {
  return (
    <Link
      href={href}
      className="shell-nav-btn"
      aria-current={active ? 'page' : undefined}
    >
      {icon}
      {label}
      {badge !== undefined && badge > 0 && (
        <span className="shell-badge" aria-label={`${badge}개`}>{badge}</span>
      )}
    </Link>
  );
}
