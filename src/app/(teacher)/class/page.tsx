'use client';

import { useState, useEffect, type ReactNode } from 'react';
import Link from 'next/link';
import {
  DEMO_SESSION,
  FEEDBACK_LABELS,
  type FeedbackValue,
  type AiFilterKey,
  type AiDemoResponse,
  resolveAiQuery,
  NOT_JOINED,
  IN_PROGRESS,
  SUBMITTED_VISIBLE,
  SUBMITTED_HIDDEN,
  WATCH_STUDENTS,
  RESUBMIT_FIXED_OK,
  RESUBMIT_FIXED_STILL,
  RESUBMIT_NOT_FIXED,
} from './demoData';

/* ── 반별 카드 목록 데이터 ── */
const LIVE_CLASSES = [
  {
    id: 'cls3',
    cls: '2학년 3반',
    title: '놀이공원 입장료 예측표',
    submitted: 15,
    total: 24,
    inProgress: 6,
    notJoined: 1,
    needHelp: 2,
    status: 'live' as const,
  },
  {
    id: 'cls1',
    cls: '2학년 1반',
    title: '버그 탐정: 고장 난 블록 찾기',
    submitted: 24,
    total: 24,
    inProgress: 0,
    notJoined: 0,
    needHelp: 0,
    status: 'feedback' as const,
  },
  {
    id: 'cls2',
    cls: '2학년 2반',
    title: '0과 1로 그림 보내기',
    submitted: 22,
    total: 24,
    inProgress: 0,
    notJoined: 0,
    needHelp: 0,
    status: 'resubmit' as const,
  },
];

/* ── 학생 칸 판 데이터 ── */
type CellType = 'submitted' | 'inProgress' | 'help' | 'notJoined';
const GRID_CELLS: CellType[] = [
  'submitted',   // 01 김민준
  'help',        // 02 이서연
  'help',        // 03 박지훈
  'submitted',   // 04
  'submitted', 'submitted', 'submitted', 'submitted', 'submitted', 'submitted',
  'submitted', 'submitted', 'submitted', 'submitted', 'submitted', 'submitted',
  'submitted',   // 17 (15 submitted total: 01,04–17)
  'inProgress', 'inProgress', 'inProgress',
  'inProgress', 'inProgress', 'inProgress', // 18–23
  'notJoined',   // 24
];

const HELP_STUDENTS = [
  { name: '이서연', desc: '문항 2에서 4번 다시 풀었어요' },
  { name: '박지훈', desc: '문항 3에서 6분째 머물러 있어요' },
];

/* ── 요약 카드 데이터 ── */
const SUMMARY_CARDS = [
  {
    label: '피드백 대기',
    value: '1개 반',
    sub: '2학년 1반 버그 탐정 · 24명 제출 완료',
    accent: true,
  },
  {
    label: '재제출 중',
    value: '3명',
    sub: '2학년 3반 · 마감 오늘 밤 12시',
    accent: false,
  },
  {
    label: '이번 주 수업',
    value: '3회',
    sub: '활동지 3종 · 학생 72명',
    accent: false,
  },
  {
    label: '평균 제출률',
    value: '88%',
    sub: '지난주보다 6%p 올랐어요',
    accent: false,
  },
];

/* ── 수업 기록 탭 — 반별 결과 ── */
const HISTORY_ROWS = [
  {
    title: '놀이공원 입장료 예측표',
    cls: '2학년 3반',
    submitted: 15,
    inProgress: 6,
    help: 2,
    total: 24,
    statusKey: 'resubmit3',
    statusLabel: '재제출 3명',
    statusBg: '#fce7f3',
    statusColor: '#9d174d',
    wrongBlock: '문항 2',
  },
  {
    title: '버그 탐정: 고장 난 블록 찾기',
    cls: '2학년 1반',
    submitted: 24,
    inProgress: 0,
    help: 0,
    total: 24,
    statusKey: 'feedback',
    statusLabel: '피드백 대기',
    statusBg: '#fef3c7',
    statusColor: '#92400e',
    wrongBlock: '문항 3',
  },
  {
    title: '0과 1로 그림 보내기',
    cls: '2학년 2반',
    submitted: 22,
    inProgress: 0,
    help: 0,
    total: 24,
    statusKey: 'done',
    statusLabel: '완료',
    statusBg: '#d1fae5',
    statusColor: '#1e7a46',
    wrongBlock: '문항 1',
  },
];

/* ── 학생별 기록 탭 데이터 ── */
const CLASS_TABS = [
  { id: '2-1', label: '2-1', bg: '#dbeafe', disabled: false },
  { id: '2-2', label: '2-2', bg: '#d1fae5', disabled: false },
  { id: '2-3', label: '2-3', bg: '#fef9c3', disabled: false },
  { id: '2-4', label: '2-4', bg: '#ede9fe', disabled: true },
];

const STUDENT_AVATAR_COLORS: Record<string, string> = {
  '김민준': '#4263eb',
  '이서연': '#0ca678',
  '박지훈': '#e8890c',
  '최유나': '#7048e8',
};

type StudentStatus = 'good' | 'almost' | 'review' | 'none';
const STUDENT_STATUS_STYLE: Record<StudentStatus, { bg: string; color: string }> = {
  good:   { bg: '#d1fae5', color: '#1e7a46' },
  almost: { bg: '#dbeafe', color: '#1e40af' },
  review: { bg: '#fff7ed', color: '#c2410c' },
  none:   { bg: '#f3f4f6', color: '#6b7280' },
};

const STUDENT_RECORDS_23 = [
  { num: '01', name: '김민준', desc: '처음 답 4/4 맞음', status: 'good' as StudentStatus, label: '잘했어요' },
  { num: '02', name: '이서연', desc: '문항 2 · 4번 다시 풂', status: 'review' as StudentStatus, label: '한 번 더 살펴봐요' },
  { num: '03', name: '박지훈', desc: '문항 3 · 재제출 중', status: 'almost' as StudentStatus, label: '거의 다 왔어요' },
  { num: '04', name: '최유나', desc: '문항 2 고쳐서 다시 냄', status: 'none' as StudentStatus, label: '피드백 전' },
];

const QUICK_QUERIES = ['1반만 보기', '피드백 안 보낸 수업', '자주 틀린 문항 모아 보기', '이서연 학생 기록'];

const OTHER_STUDENTS: { name: string; feedback: FeedbackValue }[] = [
  { name: '임oo', feedback: 'good' },
  { name: '한oo', feedback: 'good' },
  { name: '오oo', feedback: 'good' },
  { name: '서oo', feedback: 'almost' },
  { name: '권oo', feedback: 'good' },
  { name: '황oo', feedback: 'good' },
  { name: '류oo', feedback: 'good' },
  { name: '문oo', feedback: 'good' },
  { name: '장oo', feedback: 'almost' },
  { name: '윤oo', feedback: 'good' },
  { name: '조oo', feedback: 'good' },
  { name: '정oo', feedback: 'good' },
];

type MainTab = 'live' | 'history';

export default function ClassDashboard() {
  const [mainTab, setMainTab] = useState<MainTab>('live');
  const [aiQuery, setAiQuery] = useState('');
  const [aiResult, setAiResult] = useState<AiDemoResponse | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [classTab, setClassTab] = useState('2-3');

  const [liveExpanded, setLiveExpanded] = useState(false);
  const [demo, setDemo] = useState(false);
  const [demoSeconds, setDemoSeconds] = useState(60);
  const [lastUpdated, setLastUpdated] = useState(0);
  const [tick, setTick] = useState(0);

  const [feedbackExpanded, setFeedbackExpanded] = useState(false);
  const [fbTab, setFbTab] = useState<'watch' | 'all'>('watch');
  const [feedbacks, setFeedbacks] = useState<Record<string, FeedbackValue>>({});
  const [comments, setComments] = useState<Record<string, string>>({});
  const [aiDraftLoading, setAiDraftLoading] = useState<Record<string, boolean>>({});
  const [aiDraftApplied, setAiDraftApplied] = useState<Record<string, boolean>>({});
  const [fbSent, setFbSent] = useState(false);
  const [fbUndoTimer, setFbUndoTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  const [resubmitExpanded, setResubmitExpanded] = useState(false);
  const [resubFeedbacks, setResubFeedbacks] = useState<Record<string, FeedbackValue>>(
    Object.fromEntries(RESUBMIT_FIXED_STILL.map(s => [s.name, 'review' as FeedbackValue]))
  );
  const [resubSent, setResubSent] = useState(false);

  useEffect(() => {
    if (!demo) return;
    const t = setInterval(() => setDemoSeconds(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [demo]);

  useEffect(() => {
    const id = setInterval(() => setLastUpdated(s => Math.min(s + 99, 99)), 1000);
    return () => clearInterval(id);
  }, [tick]);

  function handleRefresh() { setLastUpdated(0); setTick(t => t + 1); }

  function handleFbSend() {
    setFbSent(true);
    const t = setTimeout(() => { setFbSent(false); setFbUndoTimer(null); }, 5000);
    setFbUndoTimer(t);
  }

  function handleFbUndo() {
    if (fbUndoTimer) clearTimeout(fbUndoTimer);
    setFbSent(false);
    setFbUndoTimer(null);
  }

  function handleAiDraft(name: string, suggested: FeedbackValue, comment: string) {
    setAiDraftLoading(prev => ({ ...prev, [name]: true }));
    setTimeout(() => {
      setFeedbacks(f => ({ ...f, [name]: suggested }));
      setComments(c => ({ ...c, [name]: comment }));
      setAiDraftApplied(prev => ({ ...prev, [name]: true }));
      setAiDraftLoading(prev => ({ ...prev, [name]: false }));
    }, 700);
  }

  const filter: AiFilterKey = aiResult?.filter ?? null;
  const studentLabel = aiResult?.studentLabel;

  function handleAI(q?: string) {
    const query = (q ?? aiQuery).trim();
    if (!query) return;
    setAiLoading(true);
    setAiResult(null);
    setTimeout(() => {
      setAiResult(resolveAiQuery(query));
      setAiLoading(false);
    }, 600);
  }

  function clearFilter() { setAiResult(null); setAiQuery(''); }

  const notJoinedCount = demo ? 0 : DEMO_SESSION.notJoined;
  const inProgressCount = demo ? 4 : DEMO_SESSION.inProgress;
  const submittedCount = demo ? DEMO_SESSION.total : DEMO_SESSION.submitted;
  const notJoinedPct = Math.round((notJoinedCount / DEMO_SESSION.total) * 100);
  const inProgressPct = Math.round((inProgressCount / DEMO_SESSION.total) * 100);
  const submittedPct = 100 - notJoinedPct - inProgressPct;

  const totalResubmit = RESUBMIT_FIXED_OK.length + RESUBMIT_FIXED_STILL.length;

  /* ── 필터된 수업 기록 행 ── */
  const historyRows = filter === 'cls1'
    ? HISTORY_ROWS.filter(r => r.cls === '2학년 1반')
    : filter === 'nofeedback'
    ? HISTORY_ROWS.filter(r => r.statusKey === 'feedback')
    : HISTORY_ROWS;

  const studentRows = filter === 'student' && studentLabel === '이서연'
    ? STUDENT_RECORDS_23.filter(r => r.name === '이서연')
    : STUDENT_RECORDS_23;

  return (
    <div className="p-main">

      {/* ── 헤더 + 탭 ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, gap: 16 }}>
        <div>
          <h1 style={{ margin: '0 0 4px', fontSize: 24, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.03em' }}>수업 관리</h1>
          <p style={{ margin: 0, fontSize: 14, color: 'var(--ink-3)' }}>진행 중인 수업을 모니터링하고 피드백을 보내세요.</p>
        </div>
        <div className="seg" style={{ flexShrink: 0, marginTop: 4 }}>
          <button aria-selected={mainTab === 'live'} onClick={() => setMainTab('live')}>
            수업 현황
            <span style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              minWidth: 20, height: 20, borderRadius: 10, padding: '0 5px', marginLeft: 4,
              background: mainTab === 'live' ? 'var(--ink)' : 'var(--line)',
              color: mainTab === 'live' ? '#fff' : 'var(--ink-3)',
              fontSize: 11, fontWeight: 800,
            }}>3</span>
          </button>
          <button aria-selected={mainTab === 'history'} onClick={() => setMainTab('history')}>
            수업 기록
          </button>
        </div>
      </div>

      {/* ── 수업 현황 탭 ── */}
      {mainTab === 'live' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* ① 지금 수업 중 큰 카드 */}
          <div style={{
            background: '#fff',
            borderLeft: '6px solid #ffd43b',
            borderRadius: 20,
            boxShadow: '0 2px 8px rgba(0,0,0,.06)',
            padding: '24px 28px',
            display: 'grid',
            gridTemplateColumns: '260px 1fr 280px',
            gap: 24,
          }}>

            {/* 왼쪽 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                height: 28, padding: '0 12px', borderRadius: 20,
                background: '#fff9db', border: '1.5px solid #ffd43b',
                fontSize: 12, fontWeight: 800, color: '#6b4d00',
                width: 'fit-content',
              }}>
                <span style={{ fontSize: 8, color: '#f59e0b' }}>●</span>
                지금 수업 중
              </span>
              <p style={{ margin: 0, fontSize: 22, fontWeight: 800, color: 'var(--ink)', lineHeight: 1.3 }}>
                놀이공원 입장료 예측표
              </p>
              <p style={{ margin: 0, fontSize: 13, color: 'var(--ink-3)', fontWeight: 500 }}>
                2학년 3반 · 3교시 · 개념 확인
              </p>
              <div style={{ display: 'flex', gap: 14, marginTop: 4 }}>
                <BigStat value="18분" label="시작한 지" />
                <BigStat value="62%" label="제출률" />
                <BigStat value="문항 2" label="가장 많이 막힘" small />
              </div>
            </div>

            {/* 가운데 — 학생 칸 판 */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>
                  2학년 3반 학생 24명
                </span>
                <span style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>칸을 누르면 학생 답을 볼 수 있어요</span>
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(8, 36px)',
                gap: 4,
              }}>
                {GRID_CELLS.map((type, i) => {
                  const num = String(i + 1).padStart(2, '0');
                  const style: React.CSSProperties = {
                    width: 36, height: 36, borderRadius: 6,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 700, cursor: 'default',
                    flexShrink: 0,
                    ...(type === 'submitted'  && { background: '#d1fae5', color: '#1e7a46' }),
                    ...(type === 'inProgress' && { background: '#dbeafe', color: '#1e40af' }),
                    ...(type === 'help'       && { background: '#e03131', color: '#fff' }),
                    ...(type === 'notJoined'  && { background: '#f3f4f6', color: '#9ca3af' }),
                  };
                  return (
                    <div key={i} style={style}>
                      {type === 'submitted'  ? '✓' : type === 'help' ? '!' : num}
                    </div>
                  );
                })}
              </div>
              <div style={{ display: 'flex', gap: 14, marginTop: 10 }}>
                {[
                  { color: '#d1fae5', label: '제출', count: 15, textColor: '#1e7a46' },
                  { color: '#dbeafe', label: '푸는 중', count: 6, textColor: '#1e40af' },
                  { color: '#fee2e2', label: '도움 필요', count: 2, textColor: '#dc2626' },
                  { color: '#f3f4f6', label: '미접속', count: 1, textColor: '#9ca3af' },
                ].map(({ color, label, count, textColor }) => (
                  <span key={label} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: textColor, fontWeight: 600 }}>
                    <span style={{ width: 10, height: 10, borderRadius: 2, background: color, flexShrink: 0 }} />
                    {label} {count}
                  </span>
                ))}
              </div>
            </div>

            {/* 오른쪽 — 도움 필요 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>지금 도움이 필요해요</span>
              {HELP_STUDENTS.map(s => (
                <div key={s.name} style={{
                  background: '#fff5f5', borderRadius: 12, padding: '12px 14px',
                  display: 'flex', alignItems: 'center', gap: 10,
                }}>
                  <span style={{
                    width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                    background: '#fee2e2', border: '2px solid #fca5a5',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 800, color: '#dc2626',
                  }}>
                    {s.name.slice(0, 1)}
                  </span>
                  <div>
                    <p style={{ margin: '0 0 2px', fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>{s.name}</p>
                    <p style={{ margin: 0, fontSize: 11.5, color: '#dc2626', fontWeight: 500 }}>{s.desc}</p>
                  </div>
                </div>
              ))}
              <button
                onClick={() => setLiveExpanded(true)}
                style={{
                  marginTop: 4, height: 40, padding: '0 16px',
                  background: 'var(--navy)', color: '#fff',
                  border: 'none', borderRadius: 10,
                  fontSize: 13.5, fontWeight: 700, cursor: 'pointer',
                }}
              >
                현황 자세히 보기
              </button>
            </div>
          </div>

          {/* ② 요약 카드 4개 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            {SUMMARY_CARDS.map(c => (
              <div key={c.label} style={{
                background: '#fff',
                border: c.accent ? '1.5px solid #ffd43b' : '1px solid var(--line)',
                borderRadius: 16,
                padding: '16px 18px',
                ...(c.accent && { background: '#fffde7' }),
              }}>
                <p style={{ margin: '0 0 4px', fontSize: 12, fontWeight: 600, color: 'var(--ink-3)' }}>{c.label}</p>
                <p style={{ margin: '0 0 6px', fontSize: 22, fontWeight: 800, color: 'var(--ink)', lineHeight: 1.2 }}>{c.value}</p>
                <p style={{ margin: 0, fontSize: 12, color: 'var(--ink-3)', lineHeight: 1.4 }}>{c.sub}</p>
              </div>
            ))}
          </div>

          {/* ③ 반별 카드 목록 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {LIVE_CLASSES.map(cls => {

              /* 수업 중 카드 */
              if (cls.status === 'live') {
                const subPct   = Math.round((cls.submitted / cls.total) * 100);
                const progPct  = Math.round((cls.inProgress / cls.total) * 100);
                const helpPct  = Math.round((cls.needHelp / cls.total) * 100);
                return (
                  <div key={cls.id} style={{ background: '#fff', border: '1.5px solid #34d399', borderRadius: 16, overflow: 'hidden' }}>
                    <div style={{ padding: '16px 22px', display: 'flex', alignItems: 'center', gap: 20 }}>
                      <div style={{ minWidth: 110 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 2 }}>
                          <span style={{ fontSize: 9, color: '#16a34a' }}>●</span>
                          <span style={{ fontSize: 12, fontWeight: 700, color: '#059669' }}>수업 중</span>
                        </div>
                        <p style={{ margin: 0, fontSize: 16, fontWeight: 800, color: 'var(--ink)' }}>{cls.cls}</p>
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: '0 0 7px', fontSize: 13.5, color: 'var(--ink-2)' }}>{cls.title}</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ flex: 1, height: 6, borderRadius: 4, background: 'var(--line)', overflow: 'hidden', display: 'flex' }}>
                            <div style={{ width: `${subPct}%`,  background: '#34d399', transition: 'width .5s' }} />
                            <div style={{ width: `${progPct}%`, background: '#93c5fd', transition: 'width .5s' }} />
                            <div style={{ width: `${helpPct}%`, background: '#fca5a5', transition: 'width .5s' }} />
                          </div>
                          <span style={{ fontSize: 13, color: 'var(--ink-2)', whiteSpace: 'nowrap', fontWeight: 600 }}>
                            {cls.submitted}/{cls.total}
                          </span>
                        </div>
                        {cls.needHelp > 0 && (
                          <p style={{ margin: '3px 0 0', fontSize: 12, color: '#dc2626', fontWeight: 600 }}>
                            도움 필요 {cls.needHelp}명
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => setLiveExpanded(v => !v)}
                        style={{
                          height: 40, padding: '0 18px',
                          background: liveExpanded ? '#fff' : '#059669',
                          color: liveExpanded ? 'var(--ink-2)' : '#fff',
                          border: liveExpanded ? '1.5px solid var(--line)' : 'none',
                          borderRadius: 10, fontSize: 13.5, fontWeight: 700,
                          cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
                        }}
                      >
                        {liveExpanded ? '접기' : '현황 보기'}
                      </button>
                    </div>

                    {liveExpanded && (
                      <div style={{ borderTop: '1px solid var(--line)', padding: '18px 22px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                          <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--ink-3)' }}>
                            {[['#e5e7eb','미접속'],['#93c5fd','진행 중'],['#86efac','제출']].map(([c,l]) => (
                              <span key={l} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                <span style={{ width: 10, height: 10, borderRadius: 2, background: c, display: 'inline-block' }} />{l}
                              </span>
                            ))}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <button
                              onClick={() => { setDemo(true); setDemoSeconds(60); }}
                              style={{
                                height: 30, padding: '0 12px',
                                border: '1.5px solid var(--line)', borderRadius: 20,
                                background: '#fff', fontSize: 12, fontWeight: 700, color: 'var(--ink-2)',
                                cursor: 'pointer',
                              }}
                            >
                              체험: {demo ? `${demoSeconds}초 뒤 모습` : '1분 뒤 모습'} ▶
                            </button>
                            <button
                              onClick={handleRefresh}
                              style={{ background: 'none', border: 'none', fontSize: 12, color: 'var(--ink-3)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, padding: 0 }}
                            >
                              <span>{lastUpdated}초 전 업데이트</span>
                              <span style={{ fontSize: 15 }}>↻</span>
                            </button>
                          </div>
                        </div>
                        <div style={{ height: 8, borderRadius: 4, overflow: 'hidden', marginBottom: 14, display: 'flex' }}>
                          <div style={{ width: `${notJoinedPct}%`, background: '#d1d5db', transition: 'width .5s' }} />
                          <div style={{ width: `${inProgressPct}%`, background: '#93c5fd', transition: 'width .5s' }} />
                          <div style={{ width: `${submittedPct}%`, background: '#86efac', transition: 'width .5s' }} />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                          <KanbanCol title={`미접속 ${demo ? 0 : NOT_JOINED.length}명`} bg="#f3f4f6" titleColor="var(--ink-2)"
                            items={demo ? [] : NOT_JOINED.map(n => ({ name: n, needHelp: false }))} />
                          <KanbanCol title={`진행 중 ${inProgressCount}명`} bg="#eff6ff" titleColor="#1d4ed8"
                            items={demo ? IN_PROGRESS.slice(2).map(s => ({ ...s, needHelp: false })) : IN_PROGRESS.map(s => s)} />
                          <KanbanCol title={`제출 ${submittedCount}명`} bg="#f0fdf4" titleColor="#1e7a46"
                            items={[...SUBMITTED_VISIBLE.map(n => ({ name: n, needHelp: false })), ...(demo ? NOT_JOINED.map(n => ({ name: n, needHelp: false })) : [])]}
                            hiddenCount={SUBMITTED_HIDDEN} />
                        </div>
                      </div>
                    )}
                  </div>
                );
              }

              /* 피드백 카드 */
              if (cls.status === 'feedback') {
                const pct = Math.round((cls.submitted / cls.total) * 100);
                return (
                  <div key={cls.id} style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 16, overflow: 'hidden' }}>
                    <div style={{ padding: '16px 22px', display: 'flex', alignItems: 'center', gap: 20 }}>
                      <div style={{ minWidth: 110 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 2 }}>
                          <span style={{ fontSize: 9, color: '#e8890c' }}>●</span>
                          <span style={{ fontSize: 12, fontWeight: 700, color: '#e8890c' }}>피드백 대기</span>
                        </div>
                        <p style={{ margin: 0, fontSize: 16, fontWeight: 800, color: 'var(--ink)' }}>{cls.cls}</p>
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: '0 0 7px', fontSize: 13.5, color: 'var(--ink-2)' }}>{cls.title}</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ flex: 1, height: 6, borderRadius: 4, background: 'var(--line)', overflow: 'hidden', display: 'flex' }}>
                            <div style={{ width: `${pct}%`, background: '#34d399' }} />
                          </div>
                          <span style={{ fontSize: 13, color: 'var(--ink-2)', whiteSpace: 'nowrap', fontWeight: 600 }}>
                            {cls.submitted}/{cls.total}
                          </span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-3)' }}>다음 단계</span>
                        <button
                          onClick={() => setFeedbackExpanded(v => !v)}
                          style={{
                            height: 40, padding: '0 18px',
                            background: feedbackExpanded ? '#fff' : 'var(--navy)',
                            color: feedbackExpanded ? 'var(--ink-2)' : '#fff',
                            border: feedbackExpanded ? '1.5px solid var(--line)' : 'none',
                            borderRadius: 10, fontSize: 13.5, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap',
                          }}
                        >
                          {feedbackExpanded ? '접기' : '피드백 보내기'}
                        </button>
                      </div>
                    </div>

                    {feedbackExpanded && (
                      <div style={{ borderTop: '1px solid var(--line)', padding: '18px 22px' }}>
                        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                          {[['watch', `따로 볼 학생 ${WATCH_STUDENTS.length}`], ['all', `전체 ${cls.submitted}`]].map(([key, label]) => (
                            <button key={key} onClick={() => setFbTab(key as 'watch' | 'all')}
                              style={{
                                height: 34, padding: '0 14px', borderRadius: 20,
                                border: fbTab === key ? '2px solid var(--navy)' : '1.5px solid var(--line)',
                                background: fbTab === key ? 'var(--navy)' : '#fff',
                                color: fbTab === key ? '#fff' : 'var(--ink-2)',
                                fontSize: 13, fontWeight: 700, cursor: 'pointer',
                              }}>
                              {label}
                            </button>
                          ))}
                        </div>

                        {fbTab === 'watch' ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 }}>
                            {WATCH_STUDENTS.map(s => (
                              <div key={s.name} style={{ background: '#fff5f5', border: '1.5px solid #fca5a5', borderRadius: 12, padding: '14px 16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                                  <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--ink)', flex: 1 }}>{s.name}</span>
                                  <span style={{ fontSize: 12, color: 'var(--ink-2)' }}>{s.score}</span>
                                  {(['good', 'almost', 'review'] as FeedbackValue[]).map(v => (
                                    <button key={v} onClick={() => setFeedbacks(f => ({ ...f, [s.name]: v }))}
                                      style={{
                                        height: 32, padding: '0 10px', borderRadius: 8, position: 'relative',
                                        border: feedbacks[s.name] === v ? '2px solid var(--navy)' : '1px solid var(--line)',
                                        background: feedbacks[s.name] === v ? 'var(--navy)' : '#fff',
                                        color: feedbacks[s.name] === v ? '#fff' : 'var(--ink-2)',
                                        fontSize: 12, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap',
                                      }}>
                                      {FEEDBACK_LABELS[v]}
                                      {aiDraftApplied[s.name] && feedbacks[s.name] === v && (
                                        <span style={{ position: 'absolute', top: -7, right: -4, fontSize: 8, fontWeight: 800, background: '#7048e8', color: '#fff', borderRadius: 4, padding: '1px 4px', lineHeight: 1.4 }}>AI</span>
                                      )}
                                    </button>
                                  ))}
                                </div>
                                <div style={{ fontSize: 12, color: '#dc2626', marginBottom: 8, fontWeight: 600 }}>{s.aiReason}</div>
                                {!aiDraftApplied[s.name] && (
                                  <button onClick={() => handleAiDraft(s.name, s.feedback, s.aiComment)} disabled={aiDraftLoading[s.name]}
                                    style={{
                                      marginBottom: 8, height: 34, padding: '0 14px', borderRadius: 20,
                                      border: '1.5px solid #7048e8', background: '#f3f0ff', color: '#7048e8',
                                      fontSize: 13, fontWeight: 700, cursor: aiDraftLoading[s.name] ? 'default' : 'pointer',
                                      display: 'inline-flex', alignItems: 'center', gap: 6,
                                      opacity: aiDraftLoading[s.name] ? 0.7 : 1,
                                    }}>
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2l2.2 6.3L20.5 10.5 14.2 12.7 12 19l-2.2-6.3L3.5 10.5l6.3-2.2z"/></svg>
                                    {aiDraftLoading[s.name] ? 'AI가 초안 만들고 있어요…' : 'AI 초안 보기'}
                                  </button>
                                )}
                                {aiDraftApplied[s.name] && (
                                  <div style={{ fontSize: 11.5, color: '#7048e8', fontWeight: 700, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2l2.2 6.3L20.5 10.5 14.2 12.7 12 19l-2.2-6.3L3.5 10.5l6.3-2.2z"/></svg>
                                    AI 초안 · 수정 가능
                                  </div>
                                )}
                                <input value={comments[s.name] ?? ''} onChange={e => setComments(c => ({ ...c, [s.name]: e.target.value }))}
                                  placeholder={aiDraftApplied[s.name] ? '' : '한 마디를 남겨 보세요. AI 초안을 먼저 써 볼 수 있어요.'}
                                  style={{
                                    width: '100%', height: 40,
                                    border: `1px solid ${aiDraftApplied[s.name] ? '#c4b5fd' : 'var(--line)'}`,
                                    borderRadius: 8, padding: '0 12px', fontSize: 13, color: 'var(--ink)',
                                    boxSizing: 'border-box',
                                    background: aiDraftApplied[s.name] ? '#faf7ff' : '#fff',
                                  }} />
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
                            {WATCH_STUDENTS.map(s => (
                              <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: '#fff5f5', border: '1px solid #fca5a5', borderRadius: 10 }}>
                                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)', flex: 1 }}>{s.name}</span>
                                <span style={{ padding: '2px 7px', background: '#fce7f3', color: '#9d174d', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>따로 볼</span>
                                {(['good', 'almost', 'review'] as FeedbackValue[]).map(v => (
                                  <button key={v} onClick={() => setFeedbacks(f => ({ ...f, [s.name]: v }))}
                                    style={{
                                      height: 28, padding: '0 9px', borderRadius: 7,
                                      border: feedbacks[s.name] === v ? '2px solid var(--navy)' : '1px solid var(--line)',
                                      background: feedbacks[s.name] === v ? 'var(--navy)' : '#fff',
                                      color: feedbacks[s.name] === v ? '#fff' : 'var(--ink-2)',
                                      fontSize: 11, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap',
                                    }}>
                                    {FEEDBACK_LABELS[v]}
                                  </button>
                                ))}
                              </div>
                            ))}
                            {OTHER_STUDENTS.map(s => (
                              <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: '#fff', border: '1px solid var(--line)', borderRadius: 10 }}>
                                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', flex: 1 }}>{s.name}</span>
                                <span style={{
                                  padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700,
                                  background: s.feedback === 'good' ? '#d1fae5' : s.feedback === 'almost' ? '#fef3c7' : '#fee2e2',
                                  color: s.feedback === 'good' ? '#1e7a46' : s.feedback === 'almost' ? '#92400e' : '#991b1b',
                                }}>
                                  {FEEDBACK_LABELS[s.feedback]}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}

                        {fbSent ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 10, background: '#d1fae5', border: '1px solid #6ee7b7' }}>
                                <svg viewBox="0 0 24 24" width="16" height="16" fill="none"><path d="M5 12l4 4L19 8" stroke="#1e7a46" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                <span style={{ fontSize: 14, color: '#1e7a46', fontWeight: 700 }}>{cls.submitted}명에게 전송했어요</span>
                              </div>
                              <button onClick={handleFbUndo} style={{ height: 36, padding: '0 14px', border: '1px solid var(--line)', borderRadius: 8, background: '#fff', fontSize: 13, color: 'var(--ink-2)', cursor: 'pointer', fontWeight: 600 }}>
                                되돌리기 (5초)
                              </button>
                            </div>
                            <button onClick={() => { setResubmitExpanded(true); setFeedbackExpanded(false); }}
                              style={{ height: 44, background: 'var(--navy)', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer', alignSelf: 'flex-start', padding: '0 24px' }}>
                              재제출 확인하기
                            </button>
                          </div>
                        ) : (
                          <button onClick={handleFbSend}
                            style={{ width: '100%', height: 48, background: 'var(--navy)', color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
                            제출한 {cls.submitted}명에게 모두 전송
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              }

              /* 재제출 카드 */
              if (cls.status === 'resubmit') {
                const pct = Math.round((cls.submitted / cls.total) * 100);
                return (
                  <div key={cls.id} style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 16, overflow: 'hidden' }}>
                    <div style={{ padding: '16px 22px', display: 'flex', alignItems: 'center', gap: 20 }}>
                      <div style={{ minWidth: 110 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 2 }}>
                          <span style={{ fontSize: 9, color: '#d6336c' }}>●</span>
                          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-3)' }}>재제출 중</span>
                        </div>
                        <p style={{ margin: 0, fontSize: 16, fontWeight: 800, color: 'var(--ink)' }}>{cls.cls}</p>
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: '0 0 7px', fontSize: 13.5, color: 'var(--ink-2)' }}>{cls.title}</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ flex: 1, height: 6, borderRadius: 4, background: 'var(--line)', overflow: 'hidden', display: 'flex' }}>
                            <div style={{ width: `${pct}%`, background: '#34d399' }} />
                          </div>
                          <span style={{ fontSize: 13, color: 'var(--ink-2)', whiteSpace: 'nowrap', fontWeight: 600 }}>
                            {cls.submitted}/{cls.total}
                          </span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-3)' }}>다음 단계</span>
                        <button onClick={() => setResubmitExpanded(v => !v)}
                          style={{
                            height: 40, padding: '0 18px',
                            background: resubmitExpanded ? '#fff' : 'var(--navy)',
                            color: resubmitExpanded ? 'var(--ink-2)' : '#fff',
                            border: resubmitExpanded ? '1.5px solid var(--line)' : 'none',
                            borderRadius: 10, fontSize: 13.5, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap',
                          }}>
                          {resubmitExpanded ? '접기' : '재제출 확인'}
                        </button>
                      </div>
                    </div>

                    {resubmitExpanded && (
                      <div style={{ borderTop: '1px solid var(--line)', padding: '18px 22px' }}>
                        <p style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 800, color: 'var(--ink)' }}>재제출 후 학생 모습</p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 18 }}>
                          <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 12, padding: '14px 16px' }}>
                            <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 10, fontSize: 12, fontWeight: 700, background: '#d1fae5', color: '#1e7a46', marginBottom: 8 }}>고쳐서 맞음 {RESUBMIT_FIXED_OK.length}명</span>
                            <p style={{ margin: '0 0 6px', fontSize: 13, color: 'var(--ink-2)' }}>피드백이 '잘했어요'로 자동으로 바뀌어요</p>
                            <p style={{ margin: 0, fontSize: 13, color: 'var(--ink)' }}>{RESUBMIT_FIXED_OK.join(' · ')}</p>
                          </div>
                          <div style={{ background: '#fff5f5', border: '1px solid #fca5a5', borderRadius: 12, padding: '14px 16px' }}>
                            <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 10, fontSize: 12, fontWeight: 700, background: '#fce7f3', color: '#9d174d', marginBottom: 8 }}>고쳤지만 아직 {RESUBMIT_FIXED_STILL.length}명</span>
                            <p style={{ margin: '0 0 6px', fontSize: 13, color: 'var(--ink-2)' }}>분홍 표시 · 선생님이 한 번 더 봐요</p>
                            <p style={{ margin: 0, fontSize: 13, color: 'var(--ink)' }}>{RESUBMIT_FIXED_STILL.map(s => s.name).join(' · ')}</p>
                          </div>
                          <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 12, padding: '14px 16px' }}>
                            <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 10, fontSize: 12, fontWeight: 700, background: '#f3f4f6', color: 'var(--ink-2)', marginBottom: 8 }}>안 고침 {RESUBMIT_NOT_FIXED.length}명</span>
                            <p style={{ margin: '0 0 6px', fontSize: 13, color: 'var(--ink-2)' }}>전송 대상에서 빠지고 기록에만 남아요</p>
                            <p style={{ margin: 0, fontSize: 13, color: 'var(--ink)' }}>{RESUBMIT_NOT_FIXED.join(' · ')}</p>
                          </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18 }}>
                          {RESUBMIT_FIXED_STILL.map(s => (
                            <div key={s.name} style={{ background: '#fff5f5', border: '1px solid #fca5a5', borderRadius: 12, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                              <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--ink)', minWidth: 48 }}>{s.name}</span>
                              <span style={{ fontSize: 13, color: 'var(--ink-3)' }}>처음 답 · 고친 답</span>
                              {(['good', 'almost', 'review'] as FeedbackValue[]).map(v => (
                                <button key={v} onClick={() => setResubFeedbacks(f => ({ ...f, [s.name]: v }))}
                                  style={{
                                    height: 34, padding: '0 12px', borderRadius: 8,
                                    border: resubFeedbacks[s.name] === v ? '2px solid var(--navy)' : '1px solid var(--line)',
                                    background: resubFeedbacks[s.name] === v ? 'var(--navy)' : '#fff',
                                    color: resubFeedbacks[s.name] === v ? '#fff' : 'var(--ink-2)',
                                    fontSize: 13, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap',
                                  }}>
                                  {FEEDBACK_LABELS[v]}
                                </button>
                              ))}
                            </div>
                          ))}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                          {resubSent ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                              <div style={{ padding: '12px 20px', background: '#d1fae5', border: '1px solid #6ee7b7', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
                                <svg viewBox="0 0 24 24" width="18" height="18" fill="none"><path d="M5 12l4 4L19 8" stroke="#1e7a46" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                <span style={{ fontSize: 15, color: '#1e7a46', fontWeight: 700 }}>마무리 전송 완료</span>
                              </div>
                              <button onClick={() => setResubmitExpanded(false)}
                                style={{ height: 48, padding: '0 24px', borderRadius: 12, border: '1.5px solid var(--navy)', background: '#fff', color: 'var(--navy)', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
                                접기
                              </button>
                            </div>
                          ) : (
                            <button onClick={() => setResubSent(true)}
                              style={{ height: 48, padding: '0 28px', background: 'var(--navy)', color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
                              다시 낸 {totalResubmit}명에게 마무리 전송
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              }

              return null;
            })}
          </div>
        </div>
      )}

      {/* ── 수업 기록 탭 ── */}
      {mainTab === 'history' && (
        <div>
          {/* AI 질문창 */}
          <div style={{ marginBottom: 16 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 0,
              background: '#fff', border: '1px solid var(--line)', borderRadius: 14,
              overflow: 'hidden',
            }}>
              <div style={{
                width: 46, height: 52, flexShrink: 0,
                background: 'var(--navy)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
                  <path d="M12 2l2.09 6.43H21L15.47 12.6l2.09 6.4L12 15.18 6.44 19l2.09-6.4L3 8.43h6.91L12 2z" fill="#fff"/>
                </svg>
              </div>
              <input
                value={aiQuery}
                onChange={e => setAiQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAI()}
                placeholder="수업 기록에 물어보세요. 예: 1반에서 많이 틀린 문항만 보여 줘"
                style={{
                  flex: 1, height: 52, border: 'none', outline: 'none',
                  padding: '0 16px', fontSize: 14, color: 'var(--ink)', background: 'transparent',
                }}
              />
              <button
                onClick={() => handleAI()}
                disabled={!aiQuery.trim()}
                style={{
                  height: 36, padding: '0 18px', margin: '0 8px',
                  background: 'var(--navy)', color: '#fff', border: 'none',
                  borderRadius: 9, fontSize: 13.5, fontWeight: 700, cursor: 'pointer',
                  opacity: !aiQuery.trim() ? 0.45 : 1,
                  flexShrink: 0,
                }}
              >
                묻기
              </button>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
              {QUICK_QUERIES.map(q => (
                <button key={q} onClick={() => { setAiQuery(q); handleAI(q); }}
                  style={{
                    height: 32, padding: '0 12px', borderRadius: 20,
                    border: '1px solid var(--line)', background: '#fff',
                    fontSize: 13, color: 'var(--ink-2)', fontWeight: 500, cursor: 'pointer',
                  }}>
                  {q}
                </button>
              ))}
            </div>
            {(aiLoading || aiResult) && (
              <div style={{
                marginTop: 10, padding: '10px 14px',
                background: 'var(--canvas)', border: '1px solid var(--line)',
                borderRadius: 12, fontSize: 14, color: 'var(--ink)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
              }}>
                {aiLoading ? (
                  <span style={{ color: 'var(--ink-3)' }}>AI가 확인하고 있어요…</span>
                ) : (
                  <>
                    <span>{aiResult?.text}</span>
                    <button className="link-btn" onClick={clearFilter} style={{ fontSize: 12, color: 'var(--ink-3)', whiteSpace: 'nowrap' }}>
                      전체 보기 ✕
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* 2열 카드 */}
          <div className="two" style={{ marginBottom: 16 }}>

            {/* 반별 결과 */}
            <div className="panel">
              <div className="panel-h">
                <h3>반별 결과</h3>
                <small style={{ fontSize: 12, color: 'var(--ink-3)' }}>이번 주</small>
              </div>
              <div className="tscroll">
                <table>
                  <thead>
                    <tr>
                      {['활동지 · 반', '제출', '상태', '자주 틀린 문항'].map(h => (
                        <th key={h} style={{ whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {historyRows.map((row, i) => {
                      const highlight = filter === 'wrongblock';
                      const subPct  = Math.round((row.submitted / row.total) * 100);
                      const progPct = Math.round((row.inProgress / row.total) * 100);
                      const helpPct = Math.round((row.help / row.total) * 100);
                      return (
                        <tr key={i} style={{ background: highlight ? '#fffbe8' : 'transparent' }}>
                          <td>
                            <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink)', lineHeight: 1.3 }}>{row.title}</div>
                            <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 1 }}>{row.cls}</div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <div style={{ width: 60, height: 5, borderRadius: 3, background: 'var(--line)', overflow: 'hidden', display: 'flex', flexShrink: 0 }}>
                                <div style={{ width: `${subPct}%`,  background: '#34d399' }} />
                                <div style={{ width: `${progPct}%`, background: '#93c5fd' }} />
                                <div style={{ width: `${helpPct}%`, background: '#fca5a5' }} />
                              </div>
                              <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink-2)', whiteSpace: 'nowrap' }}>
                                {row.submitted}/{row.total}
                              </span>
                            </div>
                          </td>
                          <td>
                            <span style={{ padding: '3px 8px', borderRadius: 8, fontSize: 12, fontWeight: 700, background: row.statusBg, color: row.statusColor, whiteSpace: 'nowrap' }}>
                              {row.statusLabel}
                            </span>
                          </td>
                          <td>
                            <span style={{
                              padding: '3px 8px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                              background: highlight ? '#fef08a' : '#fce7f3',
                              color: highlight ? '#713f12' : '#9d174d',
                              whiteSpace: 'nowrap',
                            }}>
                              {row.wrongBlock}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 학생별 기록 */}
            <div className="panel">
              <div className="panel-h" style={{ alignItems: 'flex-start' }}>
                <h3>학생별 기록</h3>
                <div style={{ display: 'flex', gap: 5 }}>
                  {CLASS_TABS.map(tab => (
                    <button
                      key={tab.id}
                      disabled={tab.disabled}
                      onClick={() => !tab.disabled && setClassTab(tab.id)}
                      style={{
                        height: 30, padding: '0 10px', borderRadius: 8,
                        fontSize: 12.5, fontWeight: 700, cursor: tab.disabled ? 'not-allowed' : 'pointer',
                        background: tab.bg,
                        border: classTab === tab.id ? '2px solid var(--navy)' : '1.5px solid transparent',
                        color: tab.disabled ? 'var(--ink-3)' : 'var(--ink)',
                        opacity: tab.disabled ? 0.45 : 1,
                        transition: 'border-color .1s',
                      }}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {studentRows.map((rec, i) => {
                  const ss = STUDENT_STATUS_STYLE[rec.status];
                  return (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '7px 0' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
                          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-3)', flexShrink: 0 }}>{rec.num}</span>
                          <span style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--ink)' }}>{rec.name}</span>
                        </div>
                        <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--ink-3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{rec.desc}</p>
                      </div>
                      <span style={{
                        padding: '3px 9px', borderRadius: 8, fontSize: 12, fontWeight: 700,
                        background: ss.bg, color: ss.color, whiteSpace: 'nowrap', flexShrink: 0,
                      }}>
                        {rec.label}
                      </span>
                      <button style={{
                        height: 30, padding: '0 10px', borderRadius: 8,
                        border: '1px solid var(--line)', background: '#fff',
                        fontSize: 12.5, fontWeight: 600, color: 'var(--ink-2)', cursor: 'pointer',
                        flexShrink: 0,
                      }}>
                        답 보기
                      </button>
                    </div>
                  );
                })}
              </div>

              <div style={{ borderTop: '1px solid var(--line)', marginTop: 12, paddingTop: 12 }}>
                <p style={{ margin: '0 0 4px', fontSize: 12, color: 'var(--ink-3)' }}>
                  놀이공원 입장료 예측표 · 24명 중 4명 표시
                </p>
                <Link href="/class-roster" style={{ fontSize: 13, fontWeight: 700, color: 'var(--navy)' }}>
                  학생 전체 기록은 학급 관리에서 →
                </Link>
              </div>
            </div>
          </div>

          {/* AI 안내 */}
          <div style={{ background: 'var(--canvas)', borderRadius: 12, overflow: 'hidden' }}>
            <button onClick={() => setExpanded(v => !v)} className="link-btn"
              style={{ width: '100%', padding: '12px 16px', display: 'flex', alignItems: 'center', fontSize: 13, fontWeight: 700, color: 'var(--ink-3)', textAlign: 'left', gap: 6 }}>
              {expanded ? '▼' : '▶'} AI가 질문을 어떻게 처리하나요?
            </button>
            {expanded && (
              <div style={{ padding: '0 16px 12px', fontSize: 13, color: 'var(--ink-3)' }}>
                AI는 보여 줄 화면과 조건만 고르고, 숫자는 실제 기록에서 가져와요.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── 큰 숫자 통계 ── */
function BigStat({ value, label, small }: { value: string; label: string; small?: boolean }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <p style={{ margin: '0 0 2px', fontSize: small ? 16 : 22, fontWeight: 800, color: 'var(--ink)', lineHeight: 1 }}>{value}</p>
      <p style={{ margin: 0, fontSize: 11, color: 'var(--ink-3)', fontWeight: 500 }}>{label}</p>
    </div>
  );
}

/* ── 칸반 열 ── */
function KanbanCol({ title, bg, titleColor, items, hiddenCount }: {
  title: string; bg: string; titleColor: string;
  items: { name: string; needHelp: boolean }[];
  hiddenCount?: number;
}) {
  return (
    <div style={{ background: bg, borderRadius: 10, padding: '14px 12px' }}>
      <p style={{ margin: '0 0 10px', textAlign: 'center', fontSize: 14, fontWeight: 800, color: titleColor }}>{title}</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {items.map(s => (
          <div key={s.name} style={{
            padding: '8px 12px', background: s.needHelp ? '#fee2e2' : '#fff',
            border: s.needHelp ? '1px solid #fca5a5' : '1px solid transparent',
            borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            fontSize: 14, color: 'var(--ink)',
          }}>
            {s.name}
            {s.needHelp && <span style={{ fontSize: 12, fontWeight: 700, color: '#dc2626', whiteSpace: 'nowrap' }}>도움 필요</span>}
          </div>
        ))}
        {hiddenCount && items.length > 0 && (
          <div style={{ padding: '8px 12px', background: '#fff', borderRadius: 8, fontSize: 14, color: 'var(--ink-3)', textAlign: 'center' }}>
            +{hiddenCount}명
          </div>
        )}
      </div>
    </div>
  );
}

/* 하위 호환 — 다른 곳에서 참조하지 않지만 정의 유지 */
function TabBtn({ children, active, onClick, badge }: {
  children: ReactNode; active: boolean; onClick: () => void; badge?: number;
}) {
  return (
    <button onClick={onClick} style={{
      padding: '10px 20px', border: 'none',
      borderBottom: active ? '2px solid var(--navy)' : '2px solid transparent', marginBottom: -2,
      background: 'none', fontSize: 15, fontWeight: active ? 800 : 600,
      color: active ? 'var(--navy)' : 'var(--ink-3)', cursor: 'pointer',
      display: 'flex', alignItems: 'center', gap: 7,
    }}>
      {children}
      {badge !== undefined && badge > 0 && (
        <span style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          minWidth: 20, height: 20, borderRadius: 10, padding: '0 5px',
          background: active ? 'var(--navy)' : 'var(--line)', color: active ? '#fff' : 'var(--ink-3)',
          fontSize: 11, fontWeight: 800,
        }}>{badge}</span>
      )}
    </button>
  );
}
void TabBtn;
