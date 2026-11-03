'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import type { WorksheetSummary } from '@/types/worksheet';
import TypeCover from '@/components/TypeCover';
import TypeTag from '@/components/TypeTag';
import { type TypeKey } from '@/lib/types';
import HomeFilterBar, { type FilterValues } from '@/components/HomeFilterBar';

/* ── 범위 설정 ── */
const SCOPE_KEY = 'activity_studio_scope';
const SCHOOLS   = ['초등학교', '중학교', '고등학교'] as const;
const SUBJECTS  = ['정보', '과학', '수학', '국어', '사회', '전체 교과'] as const;
interface ScopeConfig { school: string; subject: string; done: boolean; }
const DEFAULT_SCOPE: ScopeConfig = { school: '중학교', subject: '정보', done: false };
function isInfoScope(s: ScopeConfig) { return s.school === '중학교' && s.subject === '정보'; }

/* ── 칩 데이터 ── */
const COMMON_CHIPS = [
  { id: 'focus', label: '집중이 흐트러졌어요', q: '학생들 집중이 흐트러졌어요. 짧게 분위기를 바꿀 활동' },
  { id: 'level', label: '수준 차이가 커요',    q: '학생 수준 차이가 커요. 각자 속도로 할 수 있는 활동' },
  { id: 'wrap',  label: '오늘 내용 정리',      q: '오늘 배운 내용을 정리하는 활동' },
  { id: 'quiz',  label: '깜짝 퀴즈',           q: '깜짝 퀴즈로 이해했는지 확인하고 싶어요' },
];
const SUBJECT_CHIPS = [
  { id: 'debug', label: '코드 오류 찾기',       q: '코드 오류를 찾고 고치는 활동' },
  { id: 'algo',  label: '알고리즘 순서 정하기', q: '절차를 순서대로 배열하며 알고리즘을 익히는 활동' },
  { id: 'ai',    label: 'AI 원리 체험',         q: '인공지능 분류 원리를 체험하는 활동' },
];
const SIT_MAP: Record<string, string[]> = {
  focus: ['ws-clapdance','ws-telepathy','ws-maze'],
  level: ['ws-ai-escape','ws-vault','ws-debug'],
  wrap:  ['ws-abstract','ws-calc','ws-ai-ethics'],
  quiz:  ['ws-cs-escape','ws-digital','ws-logic'],
  debug: ['ws-debug','ws-nested','ws-project'],
  algo:  ['ws-ramen','ws-search','ws-list'],
  ai:    ['ws-ai-escape','ws-learning-data','ws-arm'],
};


/* ── Props ── */
interface Props {
  worksheets: WorksheetSummary[];
  unitMap: Record<string, string>;
}

/* ── 범위 칩 선택기 ── */
function ScopeChips({ school, subject, onSchool, onSubject, size = 'md' }: {
  school: string; subject: string;
  onSchool: (s: string) => void; onSubject: (s: string) => void;
  size?: 'sm' | 'md';
}) {
  const h  = size === 'sm' ? 34 : 44;
  const fs = size === 'sm' ? 13 : 14.5;
  const px = size === 'sm' ? 12 : 16;

  function Chip({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="pick"
        aria-pressed={selected}
        style={{ height: h, padding: `0 ${px}px`, fontSize: fs, borderRadius: h }}
      >
        {label}
      </button>
    );
  }

  return (
    <div>
      <div className="mgroup">
        <b>학교급</b>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {SCHOOLS.map(s => <Chip key={s} label={s} selected={school === s} onClick={() => onSchool(s)} />)}
        </div>
      </div>
      <div className="mgroup">
        <b>교과</b>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {SUBJECTS.map(s => <Chip key={s} label={s} selected={subject === s} onClick={() => onSubject(s)} />)}
        </div>
      </div>
    </div>
  );
}

/* ── 첫 방문 설정 모달 ── */
function SetupModal({ onDone }: { onDone: (scope: ScopeConfig) => void }) {
  const [school,  setSchool]  = useState('중학교');
  const [subject, setSubject] = useState('정보');
  return (
    <div className="setup-modal-bg" role="dialog" aria-modal="true" aria-labelledby="setup-title">
      <div className="setup-modal-box">
        <div className="setup-modal-art">
          <svg width="40" height="40" viewBox="0 0 40 40" aria-hidden="true">
            <rect width="40" height="40" rx="11" fill="#ffd43b"/>
            <path d="M9 12h8l2 2h12v6H9z" fill="#172036"/>
            <path d="M9 22h14l2 2h6v5H9z" fill="#172036" opacity=".55"/>
          </svg>
        </div>
        <div className="setup-modal-body">
          <h2 id="setup-title">어떤 수업을 하세요?</h2>
          <p>한 번만 정해 두면 활동을 찾을 때 이 범위로 먼저 보여 드려요.</p>
          <ScopeChips school={school} subject={subject} onSchool={setSchool} onSubject={setSubject} />
          <div className="mfoot">
            <small>나중에 범위 칩을 눌러 언제든 바꿀 수 있어요.</small>
            <button
              className="btn primary"
              onClick={() => onDone({ school, subject, done: true })}
            >
              시작하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── 섹션 > 버튼 ── */
function NavArrow({ href }: { href: string }) {
  return (
    <Link href={href} className="sec-nav-btn" aria-label="더 보기">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
        <path d="M9 18l6-6-6-6"/>
      </svg>
    </Link>
  );
}

/* ── 섹션 헤더 ── */
function SectionHead({ id, title, sub, href }: { id: string; title: string; sub: string; href: string }) {
  return (
    <div className="sec-h">
      <div>
        <h2 id={id}>{title}</h2>
        <p>{sub}</p>
      </div>
      <Link href={href} style={{ color: 'var(--ink-2)', fontWeight: 700, fontSize: 14, whiteSpace: 'nowrap', textDecoration: 'none' }}>
        전체 보기
      </Link>
    </div>
  );
}

/* ── 활동지 카드 ── */
const EXCLUDE_IDS = ['ws-physical', 'ws-vault', 'ws-cs-escape', 'ws-robot'];

function WsCard({ sheet, unitTitle, isNew, isPreparing }: { sheet: WorksheetSummary; unitTitle?: string; isNew?: boolean; isPreparing?: boolean }) {
  return (
    <Link href={`/worksheets/${sheet.id}`} className="ws-card2" style={{ textDecoration: 'none', position: 'relative' }}>
      {isPreparing && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 10,
          display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
          paddingTop: '24px',
          pointerEvents: 'none',
        }}>
          <span style={{
            fontSize: 15, fontWeight: 800, color: 'var(--ink-2)',
            background: 'rgba(255,255,255,0.72)', border: '1.5px solid rgba(255,255,255,0.6)',
            borderRadius: 10, padding: '18px 18px',
            boxShadow: '0 2px 8px rgba(0,0,0,.10)',
            letterSpacing: '-.01em',
            width: '80%', textAlign: 'center', boxSizing: 'border-box',
          }}>준비중</span>
        </div>
      )}
      <div className="cover" style={{ aspectRatio: '5/3', borderRadius: 0 }}>
        <TypeCover type={sheet.type as TypeKey} height={120} block={false} />
      </div>
      <div className="body">
        <div className="row">
          <TypeTag type={sheet.type as TypeKey} />
          {isNew && <span className="new-badge">NEW</span>}
        </div>
        <h3>{sheet.title}</h3>
        {unitTitle && <p style={{ margin: 0, fontSize: 12, color: 'var(--ink-3)' }}>{unitTitle}</p>}
        <span style={{ marginTop: 'auto', paddingTop: 6, fontSize: 14, fontWeight: 700, color: 'var(--ink-2)' }}>
          살펴보기
        </span>
      </div>
    </Link>
  );
}

/* ── 검색 결과 카드 ── */
function RCard({ sheet, unitTitle, why }: { sheet: WorksheetSummary; unitTitle?: string; why?: string }) {
  return (
    <Link href={`/worksheets/${sheet.id}`} className="rcard" style={{ textDecoration: 'none' }}>
      <div className="cover" style={{ aspectRatio: 'auto', height: '100%', borderRadius: 0 }}>
        <TypeCover type={sheet.type as TypeKey} height={160} block={false} />
      </div>
      <div className="body">
        <div>
          <TypeTag type={sheet.type as TypeKey} />
        </div>
        <h3>{sheet.title}</h3>
        <p style={{ margin: 0, fontSize: 12.5, color: 'var(--ink-3)' }}>
          {sheet.unit}{unitTitle ? ` · ${unitTitle}` : ''}
        </p>
        {why && (
          <div className="why">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 2l2.2 6.3L20.5 10.5 14.2 12.7 12 19l-2.2-6.3L3.5 10.5l6.3-2.2z"/>
            </svg>
            {why}
          </div>
        )}
      </div>
    </Link>
  );
}

/* ── 히어로 일러스트 ── */
function HeroIllustration() {
  return (
    <svg viewBox="0 0 280 210" width="280" height="210" aria-hidden="true" style={{ overflow: 'visible' }}>
      <defs>
        <filter id="hi-glow">
          <feGaussianBlur stdDeviation="5" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="hi-s1"><feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="#000" floodOpacity=".38"/></filter>
        <filter id="hi-s2"><feDropShadow dx="0" dy="5" stdDeviation="9" floodColor="#000" floodOpacity=".28"/></filter>
        <filter id="hi-s3"><feDropShadow dx="0" dy="10" stdDeviation="14" floodColor="#000" floodOpacity=".5"/></filter>
        <linearGradient id="hi-ge" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f59e0b"/><stop offset="100%" stopColor="#d97706"/>
        </linearGradient>
        <linearGradient id="hi-gc" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6"/><stop offset="100%" stopColor="#2563eb"/>
        </linearGradient>
        <linearGradient id="hi-gm" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8b5cf6"/><stop offset="100%" stopColor="#6d28d9"/>
        </linearGradient>
      </defs>

      <ellipse cx="148" cy="115" rx="95" ry="75" fill="rgba(99,102,241,.1)" filter="url(#hi-glow)"/>

      {/* 뒤 카드 — 탈출 게임 */}
      <g transform="translate(75,15) rotate(-11)" filter="url(#hi-s2)">
        <rect width="148" height="102" rx="16" fill="#1c1c2e"/>
        <rect width="148" height="50" rx="16" fill="url(#hi-ge)"/>
        <rect y="35" width="148" height="15" fill="url(#hi-ge)"/>
        <rect x="56" y="6" width="36" height="27" rx="18" fill="none" stroke="rgba(255,255,255,.6)" strokeWidth="3.5"/>
        <rect x="49" y="20" width="50" height="26" rx="7" fill="rgba(0,0,0,.3)"/>
        <circle cx="74" cy="31" r="6.5" fill="#fff" opacity=".9"/>
        <rect x="71" y="31" width="6" height="10" rx="3" fill="#d97706"/>
        <rect x="13" y="58" width="80" height="8" rx="4" fill="rgba(255,255,255,.2)"/>
        <rect x="13" y="72" width="58" height="6" rx="3" fill="rgba(255,255,255,.12)"/>
        <rect x="13" y="83" width="50" height="13" rx="6.5" fill="rgba(255,255,255,.1)"/>
      </g>

      {/* 중간 카드 — 개념 확인 */}
      <g transform="translate(6,58) rotate(-6)" filter="url(#hi-s1)">
        <rect width="160" height="108" rx="16" fill="#fff"/>
        <rect width="160" height="54" rx="16" fill="url(#hi-gc)"/>
        <rect y="38" width="160" height="16" fill="url(#hi-gc)"/>
        <rect x="58" y="7" width="22" height="32" rx="4" fill="rgba(255,255,255,.4)"/>
        <rect x="80" y="7" width="22" height="32" rx="4" fill="rgba(255,255,255,.28)"/>
        <line x1="80" y1="7" x2="80" y2="39" stroke="rgba(255,255,255,.55)" strokeWidth="2"/>
        <path d="M90 7v16l6-4 6 4V7z" fill="rgba(255,255,255,.5)"/>
        <circle cx="120" cy="30" r="13" fill="rgba(255,255,255,.25)" stroke="rgba(255,255,255,.5)" strokeWidth="1.5"/>
        <path d="M115 30l3.5 3.5 6.5-7" stroke="#fff" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        <rect x="13" y="62" width="90" height="8" rx="4" fill="#e2e8f0"/>
        <rect x="13" y="76" width="66" height="6" rx="3" fill="#f1f5f9"/>
        <rect x="13" y="87" width="56" height="16" rx="8" fill="#dbeafe"/>
        <rect x="20" y="92" width="42" height="5" rx="2.5" fill="#93c5fd"/>
      </g>

      {/* 앞 카드 — 추리 게임 */}
      <g transform="translate(118,76) rotate(7)" filter="url(#hi-s3)">
        <rect width="150" height="108" rx="16" fill="#fff"/>
        <rect width="150" height="54" rx="16" fill="url(#hi-gm)"/>
        <rect y="38" width="150" height="16" fill="url(#hi-gm)"/>
        <circle cx="65" cy="24" r="16" fill="none" stroke="rgba(255,255,255,.6)" strokeWidth="3"/>
        <circle cx="65" cy="24" r="9" fill="rgba(255,255,255,.2)"/>
        <path d="M77 36l12 12" stroke="rgba(255,255,255,.7)" strokeWidth="4" strokeLinecap="round"/>
        <text x="59" y="30" fontSize="13" fill="rgba(255,255,255,.95)" fontWeight="900" fontFamily="sans-serif">?</text>
        <rect x="13" y="62" width="82" height="8" rx="4" fill="#ede9fe"/>
        <rect x="13" y="76" width="60" height="6" rx="3" fill="#f5f3ff"/>
        <rect x="13" y="87" width="56" height="16" rx="8" fill="#ede9fe"/>
        <rect x="20" y="92" width="42" height="5" rx="2.5" fill="#c4b5fd"/>
      </g>

      {/* AI 배지 */}
      <g transform="translate(210,8)" filter="url(#hi-s2)">
        <rect width="64" height="34" rx="17" fill="#fbbf24"/>
        <text x="12" y="23" fontSize="15" fontWeight="900" fill="#451a03" fontFamily="sans-serif" letterSpacing="-.5">AI</text>
        <circle cx="47" cy="17" r="8" fill="rgba(69,26,3,.12)"/>
        <path d="M43 17l3 3 5-5" stroke="#451a03" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      </g>

      {/* 반짝이 */}
      <circle cx="22" cy="30" r="3.5" fill="rgba(251,191,36,.5)" filter="url(#hi-glow)"/>
      <circle cx="255" cy="60" r="3" fill="rgba(167,139,250,.55)" filter="url(#hi-glow)"/>
      <circle cx="268" cy="165" r="4" fill="rgba(99,102,241,.45)" filter="url(#hi-glow)"/>
      <path d="M248 28l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" fill="rgba(255,255,255,.35)" filter="url(#hi-glow)"/>
      <path d="M35 190l1.5 3.5 3.5 1.5-3.5 1.5-1.5 3.5-1.5-3.5-3.5-1.5 3.5-1.5z" fill="rgba(251,191,36,.4)" filter="url(#hi-glow)"/>
    </svg>
  );
}

/* ── 메인 컴포넌트 ── */
export default function HomeClient({ worksheets, unitMap }: Props) {
  const [query,        setQuery]        = useState('');
  const [searchResult, setSearchResult] = useState<{ best: WorksheetSummary[]; rest: WorksheetSummary[]; empty?: boolean } | null>(null);
  const [loading,      setLoading]      = useState(false);
  const [scope,        setScope]        = useState<ScopeConfig>(DEFAULT_SCOPE);
  const [showSetup,    setShowSetup]    = useState(false);
  const [filterKey,    setFilterKey]    = useState(0);
  const inputRef   = useRef<HTMLInputElement>(null);

  /* localStorage 로드 */
  useEffect(() => {
    try {
      const saved = localStorage.getItem(SCOPE_KEY);
      if (saved) {
        const p = JSON.parse(saved) as ScopeConfig;
        if (p.done) { setScope(p); return; }
      }
    } catch {}
    setShowSetup(true);
  }, []);

  /* 검색 */
  function handleSearch(q: string) {
    if (!q.trim()) return;
    setLoading(true);
    setSearchResult(null);
    setTimeout(() => {
      if (!isInfoScope(scope)) {
        setSearchResult({ best: [], rest: [], empty: true });
        setLoading(false);
        return;
      }
      const lower = q.toLowerCase();
      const sitKey = [...COMMON_CHIPS, ...SUBJECT_CHIPS].find(c =>
        lower.includes(c.label.slice(0, 4)) || lower.includes(c.q.slice(0, 6))
      )?.id;
      const priorityIds = sitKey ? SIT_MAP[sitKey] ?? [] : [];
      const keywordMatches = worksheets.filter(w =>
        !priorityIds.includes(w.id) && (
          w.title.includes(q.trim()) ||
          w.keywords.some(k => q.includes(k)) ||
          q.split(/\s+/).some(word => word.length >= 2 && (w.title.includes(word) || w.goal.includes(word)))
        )
      );
      const byPriority = priorityIds.map(id => worksheets.find(w => w.id === id)).filter(Boolean) as WorksheetSummary[];
      const pool  = [...byPriority, ...keywordMatches];
      const final = pool.length === 0 ? worksheets.slice(0, 6) : pool.slice(0, 6);
      setSearchResult({ best: final.slice(0, 3), rest: final.slice(3) });
      setLoading(false);
    }, 420);
  }

  function handleSetupDone(newScope: ScopeConfig) {
    localStorage.setItem(SCOPE_KEY, JSON.stringify(newScope));
    setScope(newScope);
    setShowSetup(false);
  }

  function handleReset() {
    localStorage.removeItem(SCOPE_KEY);
    setScope(DEFAULT_SCOPE);
    setShowSetup(true);
    setFilterKey(k => k + 1);
  }

  function handleFilterChange(values: FilterValues) {
    setScope(prev => ({ ...prev, school: values.school, subject: values.subject }));
  }

  /* 섹션용 데이터 */
  const RECENT_IDS = ['ws-physical', 'ws-vault', 'ws-cs-escape', 'ws-robot'];
  const recent     = RECENT_IDS.map(id => worksheets.find(w => w.id === id)).filter(Boolean) as WorksheetSummary[];
  const specialized= worksheets.filter(w => ['escape','mystery'].includes(w.type)).slice(0, 8);
  const shared     = worksheets.filter(w => w.type === 'concept').slice(0, 4);
  return (
    <>
      {showSetup && <SetupModal onDone={handleSetupDone} />}

      <div className="p-main">
        {/* 처음 상태로 보기 */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
          <button onClick={handleReset} className="link-btn" style={{ fontSize: 13, color: 'var(--ink-3)' }}>
            처음 상태로 보기
          </button>
        </div>

        {/* ── 히어로 ── */}
        <section className="hero hero-grid" aria-labelledby="hero-h1">
          <div>
          <h1 id="hero-h1" className="hero-h1-grad">이번 수업, 어떤 활동이<br/>필요하세요?</h1>

          {/* 검색 박스 + 칩: 흰색 박스 */}
          <div className="ask">
            <form role="search" onSubmit={e => { e.preventDefault(); handleSearch(query); }}>
              <svg className="spark" width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="currentColor" d="M12 2l2.2 6.3L20.5 10.5 14.2 12.7 12 19l-2.2-6.3L3.5 10.5l6.3-2.2z"/>
              </svg>
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                    e.preventDefault(); handleSearch(query);
                  }
                }}
                aria-label="원하는 활동 설명"
                placeholder="수업 상황이나 원하는 활동을 말해 주세요. 예: 조건문을 게임처럼 복습"
              />
              <button type="submit" className="go" aria-label="찾기">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
                  <path d="M12 19V5M5 12l7-7 7 7"/>
                </svg>
              </button>
            </form>

            <div className="ask-sep" aria-hidden="true" />

            {/* 칩 줄 */}
            <div className="chips" role="group" aria-label="상황 칩">
              {/* 상황 칩 */}
              {COMMON_CHIPS.map(c => (
                <button
                  key={c.id} type="button" className="sit"
                  onClick={() => { setQuery(c.q); handleSearch(c.q); }}
                >
                  {c.label}
                </button>
              ))}

              {/* 정보 추천 칩 */}
              {isInfoScope(scope) && (
                <>
                  <div style={{ flexBasis: '100%', height: 0 }} aria-hidden="true" />
                  <span className="hero-label">정보 추천</span>
                  {SUBJECT_CHIPS.map(c => (
                    <button
                      key={c.id} type="button" className="sit"
                      style={{ borderColor: 'rgba(105,60,220,.25)', background: 'rgba(105,60,220,.07)', color: '#5c3ec2' }}
                      onClick={() => { setQuery(c.q); handleSearch(c.q); }}
                    >
                      {c.label}
                    </button>
                  ))}
                </>
              )}
            </div>
          </div>

          <div className="hero-foot" style={{ marginTop: 20 }}>
            찾는 활동이 없나요?{' '}
            <Link href="/my-sheets/new" className="link-btn">활동지 만들기</Link>
          </div>
          </div>
          <div className="hero-art">
            <HeroIllustration />
          </div>
        </section>

        {/* ── 필터 줄 ── */}
        <div style={{ marginTop: 18 }}>
          <HomeFilterBar
            key={filterKey}
            initialSchool={scope.school}
            initialSubject={scope.subject}
            onChange={handleFilterChange}
          />
        </div>

        {/* ── 검색 결과 ── */}
        {(loading || searchResult) && (
          <div className="res" aria-live="polite" style={{ marginTop: 16 }}>
            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--ink-3)', fontSize: 14 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={{ color: 'var(--escape)' }} aria-hidden="true">
                  <path d="M12 2l2.2 6.3L20.5 10.5 14.2 12.7 12 19l-2.2-6.3L3.5 10.5l6.3-2.2z"/>
                </svg>
                활동을 찾고 있어요…
              </div>
            ) : searchResult && (
              <>
                <div className="res-h">
                  <div>
                    <h2>
                      {searchResult.empty
                        ? `${scope.subject} 활동지는 준비 중이에요`
                        : `활동 ${searchResult.best.length + searchResult.rest.length}개를 찾았어요`
                      }
                    </h2>
                    {!searchResult.empty && <p>잘 맞는 {searchResult.best.length}개 · 나머지 {searchResult.rest.length}개</p>}
                  </div>
                  <button type="button" className="link-btn" onClick={() => { setSearchResult(null); setQuery(''); }}>
                    지우기 ✕
                  </button>
                </div>
                {!searchResult.empty && (
                  <>
                    <div className="res-list">
                      {searchResult.best.map(w => (
                        <RCard key={w.id} sheet={w} unitTitle={unitMap[w.unit]} why="이 수업 상황에 잘 맞아요" />
                      ))}
                    </div>
                    {searchResult.rest.length > 0 && (
                      <div className="res-more">
                        나머지 활동도 있어요.{' '}
                        <Link href={`/browse?q=${encodeURIComponent(query)}`} style={{ color: 'var(--ink-2)', fontWeight: 700 }}>
                          활동지 목록에서 더 보기
                        </Link>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        )}

        {/* ── 최근 나온 활동지 ── */}
        <section className="sec sec-box" aria-labelledby="sec-recent">
          <SectionHead
            id="sec-recent" title="최근 나온 활동지"
            sub="새로 올라온 활동지부터 보여 드려요."
            href="/browse?from=recent"
          />
          <div className="sec-cards-row">
            <div className="ws-grid4">
              {recent.slice(0, 4).map((w, i) => (
                <WsCard key={w.id} sheet={w} unitTitle={unitMap[w.unit]} isNew={true} />
              ))}
            </div>
            <NavArrow href="/browse?from=recent" />
          </div>
        </section>

        {/* ── 정보 특화 활동지 ── */}
        <section className="sec sec-box" aria-labelledby="sec-spec">
          <SectionHead
            id="sec-spec"
            title={isInfoScope(scope) ? '정보 특화 활동지' : `${scope.subject} 특화 활동지`}
            sub={isInfoScope(scope) ? '정보 수업에서 자주 쓰는 게임형 활동이에요.' : '이 과목 활동지는 준비 중이에요.'}
            href="/browse?from=spec"
          />
          {isInfoScope(scope) ? (
            <div className="sec-cards-row">
              <div className="ws-grid4">
                {specialized.slice(0, 4).map(w => (
                  <WsCard key={w.id} sheet={w} unitTitle={unitMap[w.unit]} isPreparing={!EXCLUDE_IDS.includes(w.id)} />
                ))}
              </div>
              <NavArrow href="/browse?from=spec" />
            </div>
          ) : (
            <div style={{ padding: '40px 24px', textAlign: 'center', background: 'var(--surface)', borderRadius: 14, border: '1px dashed var(--line)', fontSize: 14, color: 'var(--ink-3)' }}>
              {scope.subject} 활동지는 준비 중이에요.
            </div>
          )}
        </section>

        {/* ── 선생님들이 공유한 활동 ── */}
        <section className="sec sec-box" aria-labelledby="sec-shared">
          <SectionHead
            id="sec-shared" title="선생님들이 공유한 활동"
            sub="전국 정보 선생님들이 자기 수업에 맞게 고쳐 쓴 활동이에요."
            href="/browse?from=shared"
          />
          <div className="sec-cards-row">
            <div className="ws-grid4">
              {shared.slice(0, 4).map(w => (
                <WsCard key={w.id} sheet={w} unitTitle={unitMap[w.unit]} isPreparing={!EXCLUDE_IDS.includes(w.id)} />
              ))}
            </div>
            <NavArrow href="/browse?from=shared" />
          </div>
        </section>
      </div>
    </>
  );
}
