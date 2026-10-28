'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { TypeIconPaths } from '@/components/TypeCover';
import { ORDER, TYPES } from '@/lib/types';

export default function LandingPage() {
  const [studentDisabled, setStudentDisabled] = useState(false);
  useEffect(() => {
    setStudentDisabled(window.location.hostname !== 'localhost');
  }, []);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--side)',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 20px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* 점 패턴 배경 */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'radial-gradient(rgba(255,255,255,.07) 1.3px, transparent 1.4px)',
        backgroundSize: '24px 24px',
        pointerEvents: 'none',
      }} aria-hidden="true" />

      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: 700,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        {/* 로고 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 15, fontWeight: 700, color: '#c6cde0' }}>
          <svg width="40" height="40" viewBox="0 0 40 40" aria-hidden="true">
            <rect width="40" height="40" rx="11" fill="#ffd43b" />
            <path d="M9 12h8l2 2h12v6H9z" fill="#172036" />
            <path d="M9 22h14l2 2h6v5H9z" fill="#172036" opacity=".55" />
          </svg>
          비상교육
        </div>

        <h1 style={{
          margin: '18px 0 6px',
          fontSize: 'clamp(34px, 5vw, 56px)',
          fontWeight: 850,
          letterSpacing: '-.045em',
          textAlign: 'center',
          lineHeight: 1.15,
        }}>
          수업활동 스튜디오
        </h1>

        <p style={{
          margin: 0,
          fontSize: 'clamp(16px, 1.8vw, 20px)',
          color: 'var(--signal)',
          fontWeight: 800,
          letterSpacing: '-.01em',
        }}>
          고르고 · 바꾸고 · 사용하고
        </p>

        {/* 유형 아이콘 줄 */}
        <div className="type-icons" style={{ margin: '28px 0 30px' }} aria-hidden="true">
          {ORDER.map(k => (
            <div key={k} style={{
              width: 72,
              height: 72,
              borderRadius: 10,
              background: 'rgba(255,255,255,.95)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <svg viewBox="0 0 96 64" width="64" height="46" fill="none">
                <TypeIconPaths type={k} color={TYPES[k].c} />
              </svg>
            </div>
          ))}
        </div>

        {/* 역할 선택 카드 2개 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, minmax(0, 259px))',
          gap: 31,
          width: '100%',
          justifyContent: 'center',
        }}>
          <RoleCard
            role="teacher"
            title="교사"
            desc=""
            href="/home"
          />
          <RoleCard
            role="student"
            title="학생"
            desc=""
            href="/s"
            disabled={studentDisabled}
          />
        </div>

      </div>
    </div>
  );
}

/* ── 유형 아이콘 타일 ─────────────────────────────────── */

/* ── 역할 카드 ──────────────────────────────────────── */
function RoleCard({
  role, title, desc, href, disabled,
}: {
  role: 'teacher' | 'student';
  title: string;
  desc: string;
  href: string;
  disabled?: boolean;
}) {
  const isTeacher = role === 'teacher';

  return (
    <Link
      href={disabled ? '#' : href}
      onClick={disabled ? (e) => e.preventDefault() : undefined}
      style={{
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 20,
        background: isTeacher ? '#fff' : '#ddeeff',
        color: 'var(--ink)',
        overflow: 'hidden',
        textDecoration: 'none',
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? 'default' : 'pointer',
      }}
    >
      {/* 일러스트 영역 */}
      <div style={{
        height: 170,
        background: isTeacher ? '#f0f3fa' : 'rgba(255,255,255,.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {isTeacher ? <TeacherIllust /> : <StudentIllust />}
      </div>

      {/* 텍스트 영역 */}
      <div style={{ padding: '40px 18px 20px', textAlign: 'center' }}>
        <b style={{
          fontSize: 25,
          fontWeight: 850,
          letterSpacing: '-.03em',
          display: 'block',
          marginBottom: 30,
          color: 'var(--ink)',
        }}>
          {title}
        </b>
        {desc && <p style={{
          margin: '0 0 16px',
          fontSize: 14,
          color: 'var(--ink-2)',
          lineHeight: 1.6,
        }}>
          {desc}
        </p>}
        <div style={{
          height: 42,
          width: '100%',
          borderRadius: 12,
          background: 'var(--ink)',
          color: '#fff',
          fontSize: 18,
          fontWeight: 800,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          입장하기
        </div>
      </div>
    </Link>
  );
}

/* ── 교사 일러스트: 체크 표시가 있는 모니터 ─────────── */
function TeacherIllust() {
  return (
    <svg viewBox="0 0 120 88" width="135" height="100" fill="none" aria-hidden="true">
      <rect x="14" y="6" width="92" height="58" rx="7" fill="#1c2e54"/>
      <rect x="20" y="12" width="80" height="47" rx="4" fill="#253660"/>
      <path d="M43 35l12 12 20-22" stroke="#ffd43b" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round"/>
      <rect x="52" y="64" width="16" height="8" rx="3" fill="#1c2e54"/>
      <rect x="38" y="72" width="44" height="5" rx="2.5" fill="#1c2e54"/>
    </svg>
  );
}

/* ── 학생 일러스트: 공책과 연필 ─────────────────────── */
function StudentIllust() {
  return (
    <svg viewBox="0 0 120 88" width="135" height="100" fill="none" aria-hidden="true">
      {/* 공책 */}
      <rect x="16" y="8" width="62" height="72" rx="5" fill="#fff" stroke="#dde3ef" strokeWidth="1.5"/>
      <rect x="16" y="8" width="16" height="72" rx="5" fill="#c2ceea"/>
      <circle cx="24" cy="26" r="2.5" stroke="#98aecf" strokeWidth="1.5" fill="none"/>
      <circle cx="24" cy="44" r="2.5" stroke="#98aecf" strokeWidth="1.5" fill="none"/>
      <circle cx="24" cy="62" r="2.5" stroke="#98aecf" strokeWidth="1.5" fill="none"/>
      {/* 줄 */}
      <line x1="40" y1="32" x2="70" y2="32" stroke="#dde3ef" strokeWidth="1.5"/>
      <line x1="40" y1="44" x2="70" y2="44" stroke="#dde3ef" strokeWidth="1.5"/>
      <line x1="40" y1="56" x2="70" y2="56" stroke="#dde3ef" strokeWidth="1.5"/>
      {/* 연필 */}
      <g transform="rotate(18, 92, 44)">
        <rect x="86" y="16" width="12" height="50" rx="3" fill="#ffd43b"/>
        <rect x="86" y="15" width="12" height="7" rx="2.5" fill="#e0b030"/>
        <polygon points="86,66 98,66 92,78" fill="#1c2e54"/>
        <rect x="88" y="60" width="8" height="6" rx="1" fill="#f5c4a3"/>
      </g>
    </svg>
  );
}
