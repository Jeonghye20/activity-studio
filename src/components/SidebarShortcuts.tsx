'use client';

/**
 * SidebarShortcuts — 교사·학생 사이드바 공용 '바로가기' 묶음
 *
 * 코딩 실습 사이트 4곳(마이크로비트·엔트리·코답·스크래치)을
 * 새 탭으로 여는 링크 줄을 보여 준다. 주 메뉴와 분리된 별도 묶음이라
 * 눌러도 주 메뉴의 선택 표시(흰 바탕·노란 띠)는 바뀌지 않는다.
 *
 * 스타일은 인라인 기본. hover·focus-visible 은 순수 인라인으로 표현할 수 없어
 * 컴포넌트 안에 scoped <style> 로 둔다(globals.css·tokens.css 는 건드리지 않음).
 */

import type { CSSProperties, ReactNode } from 'react';

/* ── 바로가기 데이터 ───────────────────────────────────── */
const LINKS: { ko: string; en: string; href: string; icon: ReactNode }[] = [
  { ko: '마이크로비트', en: 'micro:bit', href: 'https://makecode.microbit.org/',          icon: <IconMicrobit /> },
  { ko: '엔트리',       en: 'Entry',     href: 'https://playentry.org/ws/new',             icon: <IconEntry /> },
  { ko: '코답',         en: 'CODAP',     href: 'https://codap.concord.org/app/',           icon: <IconCodap /> },
  { ko: '스크래치',     en: 'Scratch',   href: 'https://scratch.mit.edu/projects/editor/', icon: <IconScratch /> },
];

/* ── scoped CSS (hover · focus-visible 전용) ───────────── */
const SCOPED_CSS = `
.sc-link:hover { background: rgba(255,255,255,.07); }
.sc-link:hover .sc-name { color: #fff; }
.sc-link:hover .sc-ext  { color: #ffd43b; opacity: 1; }
.sc-link:focus-visible  { outline: 2px solid #ffd43b; outline-offset: -2px; }
`;

export default function SidebarShortcuts({ style }: { style?: CSSProperties }) {
  return (
    <div
      style={{
        borderTop: '1px solid rgba(255,255,255,.1)',
        borderBottom: '1px solid rgba(255,255,255,.1)',
        marginTop: 10,
        paddingTop: 14,
        paddingBottom: 14,
        marginBottom: 12,
        ...style,
      }}
    >
      <style>{SCOPED_CSS}</style>

      <div style={{ fontSize: 12.5, fontWeight: 700, color: '#8a93ab', padding: '0 6px', marginBottom: 8 }}>
        바로가기
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {LINKS.map((l) => (
          <a
            key={l.href}
            className="sc-link"
            href={l.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${l.ko} (새 탭에서 열림)`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              height: 44,
              borderRadius: 12,
              padding: '0 10px 0 14px',
              textDecoration: 'none',
            }}
          >
            <span style={{ display: 'flex', flex: 'none', color: '#c3cadc' }} aria-hidden="true">
              {l.icon}
            </span>

            <span
              style={{
                flex: 1,
                minWidth: 0,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              <span className="sc-name" style={{ fontSize: 14, fontWeight: 600, color: '#c3cadc', letterSpacing: '-0.2px' }}>
                {l.ko}
              </span>
              <span className="sc-en" style={{ fontSize: 11.5, fontWeight: 500, color: '#8a93ab' }}>
                {' '}({l.en})
              </span>
            </span>

            <span className="sc-ext" style={{ display: 'flex', flex: 'none', color: '#c3cadc', opacity: 0.55 }} aria-hidden="true">
              <ExtIcon />
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}

/* ── 새 탭 아이콘 (↗, 15px) ────────────────────────────── */
function ExtIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M7 17 17 7" />
      <path d="M8 7h9v9" />
    </svg>
  );
}

/* ── 사이트 아이콘 (SVG 선 아이콘, 18px) ───────────────── */

/* 마이크로비트 = 둥근 직사각형 안 동그라미 2개 */
function IconMicrobit() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="7" width="18" height="11" rx="5.5" />
      <circle cx="9" cy="12.5" r="1.7" />
      <circle cx="15" cy="12.5" r="1.7" />
    </svg>
  );
}

/* 엔트리 = 끼우는 블록 2단 */
function IconEntry() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 5.5h5l.8 1.6h5.2v4H4z" />
      <path d="M7 11.1h5l.8 1.6h5.2v4H7z" />
    </svg>
  );
}

/* 코답 = ㄴ자 축 위 점 4개 (산점도) */
function IconCodap() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 4v15h15" />
      <circle cx="9" cy="15" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="12" cy="11" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="15" cy="13" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="17.5" cy="8" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}

/* 스크래치 = 동그랗게 도는 화살표 안 체크 */
function IconScratch() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3" />
      <path d="M19.8 5.2v3.3h-3.3" />
      <path d="M8.8 12.2l2.2 2.2 4.2-4.4" />
    </svg>
  );
}
