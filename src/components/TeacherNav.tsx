'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

function getActiveSection(pathname: string): string {
  if (pathname.startsWith('/my-sheets')) return '/my-sheets';
  if (pathname.startsWith('/class')) return '/class';
  if (pathname === '/student-preview') return '/student-preview';
  return '/home';
}

/* ── SVG 아이콘 ── */
const IconHome = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12L12 3l9 9" />
    <path d="M5 10v9a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1v-9" />
  </svg>
);

const IconFolder = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round">
    <path d="M3 7a2 2 0 012-2h4.17a2 2 0 011.42.59L12 7h7a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
  </svg>
);

const IconChart = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <path d="M18 20V10M12 20V4M6 20v-6" />
    <path d="M2 20h20" />
  </svg>
);

const IconEye = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

/* ── 브랜드 마크 ── */
const BrandMark = () => (
  <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
    <rect width="36" height="36" rx="10" fill="#1f2a44" />
    <rect x="9" y="10"   width="18" height="2.5" rx="1.25" fill="white" opacity=".5" />
    <rect x="9" y="14.5" width="13" height="2.5" rx="1.25" fill="white" opacity=".5" />
    <rect x="9" y="19"   width="15" height="2.5" rx="1.25" fill="white" opacity=".5" />
    <path d="M11 25.5l3.5 3.5 7.5-7.5" stroke="#86efac" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function TeacherNav() {
  const pathname = usePathname();
  const activeSection = getActiveSection(pathname);

  return (
    <nav style={{
      width: 240, minWidth: 240,
      background: '#fff',
      borderRight: '1px solid var(--line2)',
      display: 'flex', flexDirection: 'column',
      height: '100vh',
      position: 'sticky', top: 0,
    }}>

      {/* ── 브랜드 영역 ── */}
      <div style={{ padding: '18px 18px 14px' }}>
        <Link href="/home" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <BrandMark />
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--navy)', letterSpacing: '-.02em', lineHeight: 1.3 }}>
              수업활동 스튜디오
            </div>
            <div style={{ fontSize: 11, color: 'var(--mute)', lineHeight: 1.4 }}>비상교육</div>
          </div>
        </Link>
      </div>

      <div style={{ height: 1, background: 'var(--line2)', margin: '0 14px 8px' }} />

      {/* ── 주 메뉴 ── */}
      <div style={{ flex: 1, padding: '4px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        <NavItem href="/home"      label="홈"       icon={<IconHome />}   active={activeSection === '/home'} />
        <NavItem href="/my-sheets" label="내 자료"  icon={<IconFolder />} active={activeSection === '/my-sheets'} />
        <NavItem href="/class"     label="수업 관리" icon={<IconChart />}  active={activeSection === '/class'} badge={3} />
      </div>

      {/* ── 하단 영역 ── */}
      <div style={{ padding: '0 10px 20px' }}>
        <div style={{ height: 1, background: 'var(--line2)', margin: '0 4px 12px' }} />

        {/* 학생 화면 미리보기 */}
        <Link
          href="/student-preview"
          className={`nav-item${activeSection === '/student-preview' ? ' nav-item-active' : ''}`}
          style={{ marginBottom: 12, fontSize: 13, fontWeight: 500 }}
        >
          <span style={{ color: 'inherit', display: 'flex', flexShrink: 0 }}>
            <IconEye />
          </span>
          학생 화면 미리보기
        </Link>

        {/* 교사 프로필 */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 12px', borderRadius: 10,
          border: '1px solid var(--line2)', background: 'var(--soft)',
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'linear-gradient(135deg, #1f2a44 0%, #3a5080 100%)',
            color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 800, flexShrink: 0,
          }}>
            김
          </div>
          <div style={{ overflow: 'hidden', flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)', lineHeight: 1.3 }}>김선생님</div>
            <div style={{ fontSize: 11, color: 'var(--mute)', lineHeight: 1.3 }}>정보 · 중학교</div>
          </div>
          <button style={{
            background: 'none', border: 'none', padding: '2px 4px',
            color: 'var(--mute)', cursor: 'pointer', fontSize: 16, lineHeight: 1,
            borderRadius: 4, flexShrink: 0,
          }} title="설정">
            ⋯
          </button>
        </div>
      </div>
    </nav>
  );
}

function NavItem({ href, label, icon, active, badge }: {
  href: string;
  label: string;
  icon: ReactNode;
  active: boolean;
  badge?: number;
}) {
  return (
    <Link
      href={href}
      className={`nav-item${active ? ' nav-item-active' : ''}`}
    >
      <span style={{ color: 'inherit', display: 'flex', flexShrink: 0 }}>
        {icon}
      </span>
      {label}
      {badge !== undefined && badge > 0 && (
        <span style={{
          marginLeft: 'auto',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          minWidth: 20, height: 20, borderRadius: 10, padding: '0 5px',
          background: active ? 'var(--navy)' : 'var(--line2)',
          color: active ? '#fff' : 'var(--mute)',
          fontSize: 11, fontWeight: 800,
        }}>
          {badge}
        </span>
      )}
    </Link>
  );
}
