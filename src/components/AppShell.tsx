'use client';

/**
 * AppShell — 교사 화면 공통 레이아웃
 *
 * 왼쪽: 남색 사이드바 (로고, 메뉴 3개, 오늘 수업, 픽셀 줄, 학생 미리보기, 프로필)
 * 오른쪽: children (각 페이지 내용)
 *
 * 860px 이하: 위쪽 가로 메뉴로 전환
 */

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

/* ── 로고 SVG ──────────────────────────────────────────── */
function Logo() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" aria-hidden="true">
      <rect width="40" height="40" rx="11" fill="#ffd43b" />
      <path d="M9 12h8l2 2h12v6H9z"  fill="#172036" />
      <path d="M9 22h14l2 2h6v5H9z"  fill="#172036" opacity=".55" />
    </svg>
  );
}

/* ── 네비게이션 아이콘 ─────────────────────────────────── */
const IconHome = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>
  </svg>
);
const IconFolder = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M3 6a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
  </svg>
);
const IconChart = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
    <path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>
  </svg>
);
const IconPeople = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
    <circle cx="9" cy="7" r="4"/>
    <path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75M21 21v-2a4 4 0 0 0-3-3.85"/>
  </svg>
);
const IconEye = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <rect x="6" y="2" width="12" height="20" rx="2"/>
    <path d="M11 18h2"/>
  </svg>
);

/* ── 활성 섹션 판별 ────────────────────────────────────── */
function getActiveSection(pathname: string): string {
  if (pathname.startsWith('/my-sheets'))    return '/my-sheets';
  if (pathname.startsWith('/class-roster')) return '/class-roster';
  if (pathname.startsWith('/class'))        return '/class';
  return '/home';
}

/* ── 메인 컴포넌트 ─────────────────────────────────────── */
export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const active   = getActiveSection(pathname);

  return (
    <div className="app-shell">

      {/* ── 사이드바 ── */}
      <aside className="app-side" aria-label="메뉴">

        {/* 브랜드 */}
        <Link href="/home" className="shell-brand">
          <Logo />
          <div className="shell-brand-text">
            <b>수업활동 스튜디오</b>
            <small>비상교육</small>
          </div>
        </Link>

        {/* 주 메뉴 */}
        <nav className="shell-nav">
          <NavBtn
            href="/home" label="홈" icon={<IconHome />}
            active={active === '/home'}
          />
          <NavBtn
            href="/my-sheets" label="자료실" icon={<IconFolder />}
            active={active === '/my-sheets'}
          />
          <NavBtn
            href="/class" label="수업 관리" icon={<IconChart />}
            active={active === '/class'}
            badge={3}
          />
          <NavBtn
            href="/class-roster" label="학급 관리" icon={<IconPeople />}
            active={active === '/class-roster'}
          />
        </nav>


        {/* 하단: 학생 미리보기 + 프로필 */}
        <div className="shell-foot">
          <Link href="/student-preview" className="shell-preview-btn">
            <IconEye />
            학생 화면 미리보기
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
              김
            </span>
            <div>
              <b>김선생님</b>
              <small>○○중학교 정보</small>
            </div>
          </div>
        </div>
      </aside>

      {/* ── 본문 ── */}
      <main className="app-main" id="main-content">
        {children}
      </main>
    </div>
  );
}

/* ── NavBtn ────────────────────────────────────────────── */
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
