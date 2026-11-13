'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import StudentHeroArt from '@/components/StudentHeroArt';
import StudentRecentCard from '@/components/StudentRecentCard';
import type { Worksheet } from '@/types/worksheet';
import { gradeBlock } from '../result/ResultBlockView';
import {
  DEMO_CURRENT_ACTIVITY,
  DEMO_ALL_DONE,
  TYPE_LABELS,
  TYPE_CHIP,
  initDemoViewedFeedbacks,
  getStudentActivities,
  type StudentActivity,
} from '@/lib/studentDemoData';

const PURPLE = '#6741d9';
const LS_INFO = 'activity_studio_student_info';

function IconChat() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 5h16v11H9l-5 4z" />
      <path d="M9 10h6" />
    </svg>
  );
}

function IconRefresh() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 12a8 8 0 0 1 14-5.3L20 9" />
      <path d="M20 4v5h-5" />
      <path d="M20 12a8 8 0 0 1-14 5.3L4 15" />
    </svg>
  );
}

function IconClock() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function IconChevron() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

function TypeChip({ type, size = 'sm' }: { type: string; size?: 'sm' | 'md' }) {
  const chip = TYPE_CHIP[type] ?? { bg: '#f0f0f0', text: '#5d6880', dot: '#5d6880' };
  const isMd = size === 'md';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      gap: isMd ? 6 : 5,
      fontSize: isMd ? 13 : 12, fontWeight: 700,
      color: chip.text, background: chip.bg,
      padding: isMd ? '5px 10px' : '4px 9px',
      borderRadius: isMd ? 8 : 7,
    }}>
      <span style={{
        width: isMd ? 8 : 7, height: isMd ? 8 : 7,
        borderRadius: 2, background: chip.dot, flexShrink: 0,
      }} />
      {(TYPE_LABELS as Record<string, string>)[type] ?? type}
    </span>
  );
}

export default function StudentHomeClient({ code, sheet }: { code: string; sheet: Worksheet | null }) {
  const [name, setName] = useState('');
  const [doneItems, setDoneItems] = useState<StudentActivity[]>(DEMO_ALL_DONE);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    initDemoViewedFeedbacks(code);

    try {
      const raw = localStorage.getItem(LS_INFO);
      if (raw) setName(JSON.parse(raw).name ?? '');
    } catch {}

    const { doneItems: merged } = getStudentActivities(code);
    setDoneItems(merged);

    setMounted(true);
  }, [code]);

  if (!mounted) return null;

  const greeting = name ? `${name}님,` : '안녕하세요,';

  const currentSub = doneItems.find(s => s.worksheetId === DEMO_CURRENT_ACTIVITY.worksheetId);
  const notStarted = !currentSub;

  const feedbackItems = doneItems.filter(
    s => s.worksheetId !== DEMO_CURRENT_ACTIVITY.worksheetId && s.status === 'feedback'
  );
  const resubmitItems = doneItems.filter(
    s => s.worksheetId !== DEMO_CURRENT_ACTIVITY.worksheetId && s.status === 'resubmit'
  );
  const hasTodos = feedbackItems.length > 0 || resubmitItems.length > 0;

  // 제출한 '지금 수업'의 맞힌 문항 수 (결과 상세와 같은 채점)
  const score = (() => {
    const blocks = (sheet?.sections.flatMap(sec => sec.blocks) ?? []).filter(b => b.kind !== 'note');
    let answers: Record<string, unknown> = {};
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem(`activity_studio_answers_${code}_${DEMO_CURRENT_ACTIVITY.worksheetId}`);
        if (raw) answers = JSON.parse(raw);
      } catch {}
    }
    const correct = blocks.filter(b => gradeBlock(b, answers[b.id]) === 'correct').length;
    return { correct, total: blocks.length || DEMO_CURRENT_ACTIVITY.totalQuestions };
  })();

  const recentCards = [...doneItems]
    .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt))
    .slice(0, 4);

  return (
    <div className="p-main">
      {/* 1. 히어로 */}
      <section className="hero" style={{ marginBottom: 20 }}>
        <div className="hero-grid">
          <div>
            <h1 className="hero-h1-grad">
              {greeting}<br />
              지금 수업이 열렸어요
            </h1>

            {/* 현재 활동 흰 카드 */}
            <div style={{
              background: '#fff', borderRadius: 18,
              border: '1px solid rgba(255,255,255,.12)', overflow: 'hidden',
            }}>
              {/* 위 칸: 유형 칩 + 메타 + 제목 */}
              <div style={{
                padding: '20px 22px',
                display: 'flex', flexDirection: 'column', gap: 10,
                borderBottom: '1px solid #eef0f5',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <TypeChip type={DEMO_CURRENT_ACTIVITY.type} size="md" />
                  <span style={{ fontSize: 13, color: '#5d6880' }}>{DEMO_CURRENT_ACTIVITY.meta}</span>
                </div>
                <p style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#172036', letterSpacing: '-.01em' }}>
                  {DEMO_CURRENT_ACTIVITY.title}
                </p>
              </div>

              {/* 아래 칸: 진행 상황 + 버튼 */}
              <div style={{ padding: '16px 22px', display: 'flex', alignItems: 'center', gap: 16 }}>
                {notStarted ? (
                  <>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, color: '#5d6880', marginBottom: 8 }}>
                        {DEMO_CURRENT_ACTIVITY.totalQuestions}문항 중 1문항 풀었어요
                      </div>
                      <div style={{ height: 8, background: '#eef0f5', borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{ width: `${Math.round(1 / DEMO_CURRENT_ACTIVITY.totalQuestions * 100)}%`, height: '100%', background: PURPLE, borderRadius: 4 }} />
                      </div>
                    </div>
                    <Link
                      href={`/s/${code}/activity`}
                      style={{
                        height: 48, padding: '0 22px', borderRadius: 12,
                        background: PURPLE, color: '#fff',
                        textDecoration: 'none', fontSize: 16, fontWeight: 700,
                        display: 'inline-flex', alignItems: 'center', flexShrink: 0,
                        letterSpacing: '-.01em',
                      }}
                    >
                      이어서 풀기
                    </Link>
                  </>
                ) : (
                  <>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, color: '#5d6880', marginBottom: 8 }}>
                        맞힌 문항 <b style={{ color: '#172036' }}>{score.correct}/{score.total}</b>
                      </div>
                      <div style={{ height: 8, background: '#eef0f5', borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{ width: `${Math.round(score.correct / score.total * 100)}%`, height: '100%', background: PURPLE, borderRadius: 4 }} />
                      </div>
                    </div>
                    <Link
                      href={`/s/${code}/result?id=${DEMO_CURRENT_ACTIVITY.worksheetId}`}
                      style={{
                        height: 48, padding: '0 22px', borderRadius: 12,
                        background: PURPLE, color: '#fff',
                        textDecoration: 'none', fontSize: 16, fontWeight: 700,
                        display: 'inline-flex', alignItems: 'center', flexShrink: 0,
                        letterSpacing: '-.01em',
                      }}
                    >
                      이어서 보기
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="hero-art">
            <StudentHeroArt />
          </div>
        </div>
      </section>

      {/* 2. 해야 할 일 */}
      {hasTodos && (
        <section style={{ marginBottom: 20 }}>
          <h2 style={{ margin: '0 0 12px', fontSize: 17, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-.01em' }}>
            해야 할 일
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {feedbackItems.map(item => (
              <Link key={item.worksheetId} href={`/s/${code}/result?id=${item.worksheetId}`} style={{ textDecoration: 'none' }}>
                <div style={{
                  background: '#fff', border: '1px solid var(--line)', borderRadius: 20,
                  padding: '22px 24px',
                  display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer',
                }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: 14, flexShrink: 0,
                    background: '#fff3bf',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#e8890c',
                  }}>
                    <IconChat />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 17, fontWeight: 800, color: 'var(--ink)' }}>
                        선생님 피드백이 왔어요
                      </span>
                      <span style={{
                        fontSize: 12, fontWeight: 800, color: '#131c33',
                        background: '#ffd43b', padding: '3px 8px', borderRadius: 7,
                        display: 'inline-flex', alignItems: 'center',
                      }}>새로 옴</span>
                    </div>
                    <span style={{ fontSize: 14, color: '#5d6880' }}>
                      {item.title} · 칭찬 1개
                    </span>
                  </div>
                  <div style={{ color: '#5d6880', flexShrink: 0 }}>
                    <IconChevron />
                  </div>
                </div>
              </Link>
            ))}
            {resubmitItems.map(item => (
              <div key={item.worksheetId} style={{
                background: '#fff', border: '1px solid var(--line)', borderRadius: 20,
                padding: '22px 24px',
                display: 'flex', alignItems: 'center', gap: 16,
              }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 14, flexShrink: 0,
                  background: '#f3f0ff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: PURPLE,
                }}>
                  <IconRefresh />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--ink)', marginBottom: 4 }}>
                    {item.resubmitQuestionCount ?? 2}문항을 다시 풀어 주세요
                  </div>
                  <span style={{ fontSize: 14, color: '#5d6880' }}>
                    {item.title} · 고칠 문항만 열려 있어요
                  </span>
                </div>
                <Link
                  href={`/s/${code}/activity`}
                  style={{
                    height: 40, padding: '0 14px', borderRadius: 10,
                    background: PURPLE, color: '#fff',
                    textDecoration: 'none', fontSize: 14, fontWeight: 700,
                    display: 'inline-flex', alignItems: 'center', flexShrink: 0,
                  }}
                >
                  다시 풀기
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 3. 최근 활동 */}
      <section>
        {/* sec-box·sec-h·sec-h-left 클래스로 교사 홈 헤더와 동일하게 맞춤 */}
        <div className="sec-box">
          <div className="sec-h">
            <div className="sec-h-left">
              <div style={{
                width: 40, height: 40, borderRadius: 11,
                background: '#fff3bf', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#b45309',
              }}>
                <IconClock />
              </div>
              <div>
                <h2>최근 활동</h2>
                <p>끝낸 활동의 결과와 선생님 피드백을 볼 수 있어요.</p>
              </div>
            </div>
            <Link
              href={`/s/${code}/activities`}
              style={{ color: 'var(--ink-2)', fontWeight: 700, fontSize: 14, whiteSpace: 'nowrap', textDecoration: 'none' }}
            >
              내 활동에서 전체 보기
            </Link>
          </div>

          {recentCards.length === 0 ? (
            <div style={{ padding: '32px 0', textAlign: 'center', color: 'var(--ink-3)', fontSize: 14 }}>
              아직 끝낸 활동이 없어요.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
              {recentCards.map(item => (
                <StudentRecentCard key={item.worksheetId} code={code} item={item} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
