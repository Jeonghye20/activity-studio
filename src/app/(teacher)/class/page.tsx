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
  getFilteredClassResults,
  getFilteredStudentRecords,
  NOT_JOINED,
  IN_PROGRESS,
  SUBMITTED_VISIBLE,
  SUBMITTED_HIDDEN,
  WATCH_STUDENTS,
  RESUBMIT_FIXED_OK,
  RESUBMIT_FIXED_STILL,
  RESUBMIT_NOT_FIXED,
} from './demoData';

/* ── 진행 중 수업 데모 데이터 ── */
const LIVE_CLASSES = [
  {
    id: 'cls3',
    cls: '2학년 3반',
    title: DEMO_SESSION.worksheetTitle,
    submitted: DEMO_SESSION.submitted,
    total: DEMO_SESSION.total,
    inProgress: DEMO_SESSION.inProgress,
    notJoined: DEMO_SESSION.notJoined,
    needHelp: 2,
    status: 'live' as const,
  },
  {
    id: 'cls1',
    cls: '2학년 1반',
    title: DEMO_SESSION.worksheetTitle,
    submitted: 22,
    total: 24,
    inProgress: 0,
    notJoined: 0,
    needHelp: 0,
    status: 'feedback' as const,
  },
  {
    id: 'cls2',
    cls: '2학년 2반',
    title: DEMO_SESSION.worksheetTitle,
    submitted: 20,
    total: 22,
    inProgress: 0,
    notJoined: 0,
    needHelp: 0,
    status: 'resubmit' as const,
  },
];

const STATUS_LABEL: Record<string, { label: string; bg: string; color: string }> = {
  resubmit: { label: '재제출 중', bg: '#fce7f3', color: '#9d174d' },
  feedback: { label: '완료',      bg: '#d1fae5', color: '#1e7a46' },
  done:     { label: '완료',      bg: '#d1fae5', color: '#1e7a46' },
};

const QUICK_QUERIES = ['1반만 보기', '피드백 안 보낸 수업', '자주 틀린 칸 모아 보기', '이서연 기록 보기'];

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

  // 수업 중 현황 상태
  const [liveExpanded, setLiveExpanded] = useState(false);
  const [demo, setDemo] = useState(false);
  const [demoSeconds, setDemoSeconds] = useState(60);
  const [lastUpdated, setLastUpdated] = useState(0);
  const [tick, setTick] = useState(0);

  // 피드백 인라인 상태
  const [feedbackExpanded, setFeedbackExpanded] = useState(false);
  const [fbTab, setFbTab] = useState<'watch' | 'all'>('watch');
  const [feedbacks, setFeedbacks] = useState<Record<string, FeedbackValue>>(
    Object.fromEntries(WATCH_STUDENTS.map(s => [s.name, s.feedback]))
  );
  const [comments, setComments] = useState<Record<string, string>>(
    Object.fromEntries(WATCH_STUDENTS.map(s => [s.name, s.aiComment]))
  );
  const [fbSent, setFbSent] = useState(false);
  const [fbUndoTimer, setFbUndoTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  // 재제출 인라인 상태
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
    const id = setInterval(() => setLastUpdated(s => Math.min(s + 1, 99)), 1000);
    return () => clearInterval(id);
  }, [tick]);

  function handleRefresh() {
    setLastUpdated(0);
    setTick(t => t + 1);
  }

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

  const filter: AiFilterKey = aiResult?.filter ?? null;
  const studentLabel = aiResult?.studentLabel;
  const classRows = getFilteredClassResults(filter);
  const studentRows = getFilteredStudentRecords(filter, studentLabel);
  const studentSectionLabel = studentLabel ? studentLabel : '전체 · 김oo';

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

  function clearFilter() {
    setAiResult(null);
    setAiQuery('');
  }

  // 수업 중 현황 계산
  const notJoinedCount = demo ? 0 : DEMO_SESSION.notJoined;
  const inProgressCount = demo ? 4 : DEMO_SESSION.inProgress;
  const submittedCount = demo ? DEMO_SESSION.total : DEMO_SESSION.submitted;
  const notJoinedPct = Math.round((notJoinedCount / DEMO_SESSION.total) * 100);
  const inProgressPct = Math.round((inProgressCount / DEMO_SESSION.total) * 100);
  const submittedPct = 100 - notJoinedPct - inProgressPct;

  const totalResubmit = RESUBMIT_FIXED_OK.length + RESUBMIT_FIXED_STILL.length;

  const liveCount     = LIVE_CLASSES.filter(c => c.status === 'live').length;
  const feedbackCount = LIVE_CLASSES.filter(c => c.status === 'feedback').length;
  const resubmitCount = LIVE_CLASSES.filter(c => c.status === 'resubmit').length;

  return (
    <div className="p-main">

      {/* ── 헤더 ── */}
      <div className="page-head" style={{ marginBottom: 20 }}>
        <div>
          <h1>수업 관리</h1>
          <p>진행 중인 수업을 모니터링하고 피드백을 보내세요.</p>
        </div>
      </div>

      {/* ── KPI 요약 ── */}
      <div className="kpis" style={{ marginBottom: 24 }}>
        <div className={`kpi${liveCount > 0 ? ' warn' : ''}`}>
          <div className="k">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="5" fill="#fff" stroke="none"/></svg>
            수업 중
          </div>
          <b>{liveCount}</b>
          <small>지금 진행 중</small>
        </div>
        <div className="kpi">
          <div className="k">피드백 대기</div>
          <b>{feedbackCount}</b>
          <small>전송 필요</small>
        </div>
        <div className="kpi">
          <div className="k">재제출 중</div>
          <b>{resubmitCount}</b>
          <small>확인 필요</small>
        </div>
        <div className="kpi">
          <div className="k">전체 수업</div>
          <b>{LIVE_CLASSES.length}</b>
          <small>이 활동지 기준</small>
        </div>
      </div>

      {/* 탭 */}
      <div className="seg" style={{ marginBottom: 24 }}>
        <button aria-selected={mainTab === 'live'} onClick={() => setMainTab('live')}>
          수업 현황
          {LIVE_CLASSES.length > 0 && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              minWidth: 20, height: 20, borderRadius: 10, padding: '0 5px',
              background: mainTab === 'live' ? 'var(--ink)' : 'var(--line)',
              color: mainTab === 'live' ? '#fff' : 'var(--ink-3)',
              fontSize: 11, fontWeight: 800,
            }}>{LIVE_CLASSES.length}</span>
          )}
        </button>
        <button aria-selected={mainTab === 'history'} onClick={() => setMainTab('history')}>
          수업 기록
        </button>
      </div>

      {/* 탭 콘텐츠 */}
      {mainTab === 'live' ? (

        /* ── 수업 현황 탭 ── */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {LIVE_CLASSES.map(cls => {

            /* ── 수업 중 카드 ── */
            if (cls.status === 'live') {
              return (
                <div
                  key={cls.id}
                  style={{ background: '#fff', border: '1.5px solid #34d399', borderRadius: 16, overflow: 'hidden' }}
                >
                  <div style={{ padding: '18px 24px', display: 'flex', alignItems: 'center', gap: 20 }}>
                    <div style={{ minWidth: 100 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                        <span className="live-dot" style={{ color: '#16a34a', fontSize: 9, lineHeight: 1 }}>●</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#059669' }}>수업 중</span>
                      </div>
                      <p style={{ margin: 0, fontSize: 17, fontWeight: 800, color: 'var(--ink)' }}>{cls.cls}</p>
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: '0 0 8px', fontSize: 14, color: 'var(--sub)' }}>{cls.title}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ flex: 1, height: 6, borderRadius: 4, background: 'var(--line2)', overflow: 'hidden' }}>
                          <div style={{ width: `${submittedPct}%`, height: '100%', borderRadius: 4, background: '#34d399', transition: 'width .5s' }} />
                        </div>
                        <span style={{ fontSize: 13, color: 'var(--sub)', whiteSpace: 'nowrap', fontWeight: 600 }}>
                          제출 {submittedCount}/{cls.total}
                        </span>
                      </div>
                      {cls.needHelp > 0 && (
                        <p style={{ margin: '4px 0 0', fontSize: 12, color: '#b45309', fontWeight: 600 }}>
                          도움 필요 {cls.needHelp}명
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => setLiveExpanded(v => !v)}
                      style={{
                        height: 42, padding: '0 20px',
                        background: liveExpanded ? '#fff' : '#059669',
                        color: liveExpanded ? 'var(--sub)' : '#fff',
                        border: liveExpanded ? '1.5px solid var(--line)' : 'none',
                        borderRadius: 10, fontSize: 14, fontWeight: 700,
                        cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
                      }}
                    >
                      {liveExpanded ? '접기' : '현황 보기'}
                    </button>
                  </div>

                  {liveExpanded && (
                    <div style={{ borderTop: '1px solid var(--line2)', padding: '20px 24px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--mute)' }}>
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
                              background: '#fff', fontSize: 12, fontWeight: 700, color: 'var(--sub)',
                              cursor: 'pointer',
                            }}
                          >
                            체험: {demo ? `${demoSeconds}초 뒤 모습` : '1분 뒤 모습'} ▶
                          </button>
                          <button
                            onClick={handleRefresh}
                            style={{ background: 'none', border: 'none', fontSize: 12, color: 'var(--mute)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, padding: 0 }}
                          >
                            <span>{lastUpdated}초 전 업데이트</span>
                            <span style={{ fontSize: 15 }}>↻</span>
                          </button>
                        </div>
                      </div>
                      <div style={{ height: 8, borderRadius: 4, overflow: 'hidden', marginBottom: 16, display: 'flex' }}>
                        <div style={{ width: `${notJoinedPct}%`, background: '#d1d5db', transition: 'width .5s' }} />
                        <div style={{ width: `${inProgressPct}%`, background: '#93c5fd', transition: 'width .5s' }} />
                        <div style={{ width: `${submittedPct}%`, background: '#86efac', transition: 'width .5s' }} />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                        <KanbanCol
                          title={`미접속 ${demo ? 0 : NOT_JOINED.length}명`}
                          bg="#f3f4f6" titleColor="var(--sub)"
                          items={demo ? [] : NOT_JOINED.map(n => ({ name: n, needHelp: false }))}
                        />
                        <KanbanCol
                          title={`진행 중 ${inProgressCount}명`}
                          bg="#eff6ff" titleColor="#1d4ed8"
                          items={demo
                            ? IN_PROGRESS.slice(2).map(s => ({ ...s, needHelp: false }))
                            : IN_PROGRESS.map(s => s)}
                        />
                        <KanbanCol
                          title={`제출 ${submittedCount}명`}
                          bg="#f0fdf4" titleColor="#1e7a46"
                          items={[
                            ...SUBMITTED_VISIBLE.map(n => ({ name: n, needHelp: false })),
                            ...(demo ? NOT_JOINED.map(n => ({ name: n, needHelp: false })) : []),
                          ]}
                          hiddenCount={SUBMITTED_HIDDEN}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            }

            /* ── 피드백 카드 ── */
            if (cls.status === 'feedback') {
              const pct = Math.round((cls.submitted / cls.total) * 100);
              return (
                <div
                  key={cls.id}
                  style={{ background: '#fff', border: '1px solid var(--line2)', borderRadius: 16, overflow: 'hidden' }}
                >
                  {/* 카드 헤더 */}
                  <div style={{ padding: '18px 24px', display: 'flex', alignItems: 'center', gap: 24 }}>
                    <div style={{ minWidth: 100 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                        <span style={{ color: 'var(--line)', fontSize: 9, lineHeight: 1 }}>●</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--mute)' }}>제출 완료</span>
                      </div>
                      <p style={{ margin: 0, fontSize: 17, fontWeight: 800, color: 'var(--ink)' }}>{cls.cls}</p>
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: '0 0 10px', fontSize: 14, color: 'var(--sub)' }}>{cls.title}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ flex: 1, height: 6, borderRadius: 4, background: 'var(--line2)', overflow: 'hidden' }}>
                          <div style={{ width: `${pct}%`, height: '100%', borderRadius: 4, background: '#93c5fd' }} />
                        </div>
                        <span style={{ fontSize: 13, color: 'var(--sub)', whiteSpace: 'nowrap', fontWeight: 600 }}>
                          제출 {cls.submitted}/{cls.total}
                        </span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--mute)', letterSpacing: '.03em' }}>
                        다음 단계
                      </span>
                      <button
                        onClick={() => setFeedbackExpanded(v => !v)}
                        style={{
                          height: 42, padding: '0 20px',
                          background: feedbackExpanded ? '#fff' : 'var(--navy)',
                          color: feedbackExpanded ? 'var(--sub)' : '#fff',
                          border: feedbackExpanded ? '1.5px solid var(--line)' : 'none',
                          borderRadius: 10, fontSize: 14, fontWeight: 700,
                          cursor: 'pointer', whiteSpace: 'nowrap',
                        }}
                      >
                        {feedbackExpanded ? '접기' : '피드백 보내기'}
                      </button>
                    </div>
                  </div>

                  {/* 피드백 인라인 UI */}
                  {feedbackExpanded && (
                    <div style={{ borderTop: '1px solid var(--line2)', padding: '20px 24px' }}>
                      {/* 탭 */}
                      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                        {[['watch', `따로 볼 학생 ${WATCH_STUDENTS.length}`], ['all', `전체 ${cls.submitted}`]].map(([key, label]) => (
                          <button
                            key={key}
                            onClick={() => setFbTab(key as 'watch' | 'all')}
                            style={{
                              height: 34, padding: '0 14px', borderRadius: 20,
                              border: fbTab === key ? '2px solid var(--navy)' : '1.5px solid var(--line2)',
                              background: fbTab === key ? 'var(--navy)' : '#fff',
                              color: fbTab === key ? '#fff' : 'var(--sub)',
                              fontSize: 13, fontWeight: 700, cursor: 'pointer',
                            }}
                          >
                            {label}
                          </button>
                        ))}
                      </div>

                      {/* 따로 볼 학생 탭 */}
                      {fbTab === 'watch' ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
                          {WATCH_STUDENTS.map(s => (
                            <div
                              key={s.name}
                              style={{
                                background: '#fff5f5', border: '1.5px solid #fca5a5',
                                borderRadius: 12, padding: '14px 16px',
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                                <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--ink)', flex: 1 }}>{s.name}</span>
                                <span style={{ fontSize: 12, color: 'var(--sub)' }}>{s.score}</span>
                                {(['good', 'almost', 'review'] as FeedbackValue[]).map(v => (
                                  <button
                                    key={v}
                                    onClick={() => setFeedbacks(f => ({ ...f, [s.name]: v }))}
                                    style={{
                                      height: 32, padding: '0 10px', borderRadius: 8,
                                      border: feedbacks[s.name] === v ? '2px solid var(--navy)' : '1px solid var(--line)',
                                      background: feedbacks[s.name] === v ? 'var(--navy)' : '#fff',
                                      color: feedbacks[s.name] === v ? '#fff' : 'var(--sub)',
                                      fontSize: 12, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap',
                                    }}
                                  >
                                    {FEEDBACK_LABELS[v]}
                                  </button>
                                ))}
                              </div>
                              <div style={{ fontSize: 12, color: '#dc2626', marginBottom: 6, fontWeight: 600 }}>{s.aiReason}</div>
                              <input
                                value={comments[s.name] ?? ''}
                                onChange={e => setComments(c => ({ ...c, [s.name]: e.target.value }))}
                                style={{
                                  width: '100%', height: 40, border: '1px solid var(--line)', borderRadius: 8,
                                  padding: '0 12px', fontSize: 13, color: 'var(--ink)', boxSizing: 'border-box',
                                }}
                              />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
                          {WATCH_STUDENTS.map(s => (
                            <div key={s.name} style={{
                              display: 'flex', alignItems: 'center', gap: 8,
                              padding: '10px 14px', background: '#fff5f5',
                              border: '1px solid #fca5a5', borderRadius: 10,
                            }}>
                              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)', flex: 1 }}>{s.name}</span>
                              <span style={{ fontSize: 11, padding: '2px 7px', background: '#fce7f3', color: '#9d174d', borderRadius: 6, fontWeight: 700 }}>따로 볼</span>
                              {(['good', 'almost', 'review'] as FeedbackValue[]).map(v => (
                                <button
                                  key={v}
                                  onClick={() => setFeedbacks(f => ({ ...f, [s.name]: v }))}
                                  style={{
                                    height: 28, padding: '0 9px', borderRadius: 7,
                                    border: feedbacks[s.name] === v ? '2px solid var(--navy)' : '1px solid var(--line)',
                                    background: feedbacks[s.name] === v ? 'var(--navy)' : '#fff',
                                    color: feedbacks[s.name] === v ? '#fff' : 'var(--sub)',
                                    fontSize: 11, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap',
                                  }}
                                >
                                  {FEEDBACK_LABELS[v]}
                                </button>
                              ))}
                            </div>
                          ))}
                          {OTHER_STUDENTS.map(s => (
                            <div key={s.name} style={{
                              display: 'flex', alignItems: 'center', gap: 8,
                              padding: '10px 14px', background: '#fff',
                              border: '1px solid var(--line2)', borderRadius: 10,
                            }}>
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

                      {/* 전송 버튼 */}
                      {fbSent ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{
                              display: 'flex', alignItems: 'center', gap: 8,
                              padding: '10px 16px', borderRadius: 10,
                              background: '#d1fae5', border: '1px solid #6ee7b7',
                            }}>
                              <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
                                <path d="M5 12l4 4L19 8" stroke="#1e7a46" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                              <span style={{ fontSize: 14, color: '#1e7a46', fontWeight: 700 }}>
                                {cls.submitted}명에게 전송했어요
                              </span>
                            </div>
                            <button
                              onClick={handleFbUndo}
                              style={{ height: 36, padding: '0 14px', border: '1px solid var(--line)', borderRadius: 8, background: '#fff', fontSize: 13, color: 'var(--sub)', cursor: 'pointer', fontWeight: 600 }}
                            >
                              되돌리기 (5초)
                            </button>
                          </div>
                          <button
                            onClick={() => { setResubmitExpanded(true); setFeedbackExpanded(false); }}
                            style={{
                              height: 44, background: 'var(--navy)', color: '#fff',
                              border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer',
                              alignSelf: 'flex-start', padding: '0 24px',
                            }}
                          >
                            재제출 확인하기
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={handleFbSend}
                          style={{
                            width: '100%', height: 48, background: 'var(--navy)', color: '#fff',
                            border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: 'pointer',
                          }}
                        >
                          제출한 {cls.submitted}명에게 모두 전송
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            }

            /* ── 재제출 카드 ── */
            if (cls.status === 'resubmit') {
              const pct = Math.round((cls.submitted / cls.total) * 100);
              return (
                <div
                  key={cls.id}
                  style={{ background: '#fff', border: '1px solid var(--line2)', borderRadius: 16, overflow: 'hidden' }}
                >
                  {/* 카드 헤더 */}
                  <div style={{ padding: '18px 24px', display: 'flex', alignItems: 'center', gap: 24 }}>
                    <div style={{ minWidth: 100 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                        <span style={{ color: 'var(--line)', fontSize: 9, lineHeight: 1 }}>●</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--mute)' }}>재제출 중</span>
                      </div>
                      <p style={{ margin: 0, fontSize: 17, fontWeight: 800, color: 'var(--ink)' }}>{cls.cls}</p>
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: '0 0 10px', fontSize: 14, color: 'var(--sub)' }}>{cls.title}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ flex: 1, height: 6, borderRadius: 4, background: 'var(--line2)', overflow: 'hidden' }}>
                          <div style={{ width: `${pct}%`, height: '100%', borderRadius: 4, background: '#fca5a5' }} />
                        </div>
                        <span style={{ fontSize: 13, color: 'var(--sub)', whiteSpace: 'nowrap', fontWeight: 600 }}>
                          제출 {cls.submitted}/{cls.total}
                        </span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--mute)', letterSpacing: '.03em' }}>
                        다음 단계
                      </span>
                      <button
                        onClick={() => setResubmitExpanded(v => !v)}
                        style={{
                          height: 42, padding: '0 20px',
                          background: resubmitExpanded ? '#fff' : 'var(--navy)',
                          color: resubmitExpanded ? 'var(--sub)' : '#fff',
                          border: resubmitExpanded ? '1.5px solid var(--line)' : 'none',
                          borderRadius: 10, fontSize: 14, fontWeight: 700,
                          cursor: 'pointer', whiteSpace: 'nowrap',
                        }}
                      >
                        {resubmitExpanded ? '접기' : '재제출 확인'}
                      </button>
                    </div>
                  </div>

                  {/* 재제출 인라인 UI */}
                  {resubmitExpanded && (
                    <div style={{ borderTop: '1px solid var(--line2)', padding: '20px 24px' }}>
                      <p style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 800, color: 'var(--ink)' }}>재제출 후 학생 모습</p>

                      {/* 3열 카드 */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 20 }}>
                        <div style={{ background: '#fff', border: '1px solid var(--line2)', borderRadius: 12, padding: '14px 16px' }}>
                          <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 10, fontSize: 12, fontWeight: 700, background: '#d1fae5', color: '#1e7a46', marginBottom: 8 }}>
                            고쳐서 맞음 {RESUBMIT_FIXED_OK.length}명
                          </span>
                          <p style={{ margin: '0 0 6px', fontSize: 13, color: 'var(--sub)' }}>
                            피드백이 '잘했어요'로 자동으로 바뀌어요
                          </p>
                          <p style={{ margin: 0, fontSize: 13, color: 'var(--ink)' }}>
                            {RESUBMIT_FIXED_OK.join(' · ')}
                          </p>
                        </div>
                        <div style={{ background: '#fff5f5', border: '1px solid #fca5a5', borderRadius: 12, padding: '14px 16px' }}>
                          <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 10, fontSize: 12, fontWeight: 700, background: '#fce7f3', color: '#9d174d', marginBottom: 8 }}>
                            고쳤지만 아직 {RESUBMIT_FIXED_STILL.length}명
                          </span>
                          <p style={{ margin: '0 0 6px', fontSize: 13, color: 'var(--sub)' }}>
                            분홍 표시 · 선생님이 한 번 더 봐요
                          </p>
                          <p style={{ margin: 0, fontSize: 13, color: 'var(--ink)' }}>
                            {RESUBMIT_FIXED_STILL.map(s => s.name).join(' · ')}
                          </p>
                        </div>
                        <div style={{ background: '#fff', border: '1px solid var(--line2)', borderRadius: 12, padding: '14px 16px' }}>
                          <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 10, fontSize: 12, fontWeight: 700, background: '#f3f4f6', color: 'var(--sub)', marginBottom: 8 }}>
                            안 고침 {RESUBMIT_NOT_FIXED.length}명
                          </span>
                          <p style={{ margin: '0 0 6px', fontSize: 13, color: 'var(--sub)' }}>
                            전송 대상에서 빠지고 기록에만 남아요
                          </p>
                          <p style={{ margin: 0, fontSize: 13, color: 'var(--ink)' }}>
                            {RESUBMIT_NOT_FIXED.join(' · ')}
                          </p>
                        </div>
                      </div>

                      {/* 고쳤지만 아직 학생 피드백 */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                        {RESUBMIT_FIXED_STILL.map(s => (
                          <div
                            key={s.name}
                            style={{
                              background: '#fff5f5', border: '1px solid #fca5a5',
                              borderRadius: 12, padding: '14px 16px',
                              display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
                            }}
                          >
                            <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--ink)', minWidth: 48 }}>{s.name}</span>
                            <span style={{ fontSize: 13, color: 'var(--mute)' }}>처음 답 · 고친 답</span>
                            {(['good', 'almost', 'review'] as FeedbackValue[]).map(v => (
                              <button
                                key={v}
                                onClick={() => setResubFeedbacks(f => ({ ...f, [s.name]: v }))}
                                style={{
                                  height: 34, padding: '0 12px', borderRadius: 8,
                                  border: resubFeedbacks[s.name] === v ? '2px solid var(--navy)' : '1px solid var(--line)',
                                  background: resubFeedbacks[s.name] === v ? 'var(--navy)' : '#fff',
                                  color: resubFeedbacks[s.name] === v ? '#fff' : 'var(--sub)',
                                  fontSize: 13, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap',
                                }}
                              >
                                {FEEDBACK_LABELS[v]}
                              </button>
                            ))}
                          </div>
                        ))}
                      </div>

                      {/* 마무리 전송 버튼 */}
                      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        {resubSent ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                            <div style={{
                              padding: '12px 20px', background: '#d1fae5', border: '1px solid #6ee7b7',
                              borderRadius: 12, display: 'flex', alignItems: 'center', gap: 10,
                            }}>
                              <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
                                <path d="M5 12l4 4L19 8" stroke="#1e7a46" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                              <span style={{ fontSize: 15, color: '#1e7a46', fontWeight: 700 }}>마무리 전송 완료</span>
                            </div>
                            <button
                              onClick={() => setResubmitExpanded(false)}
                              style={{
                                height: 48, padding: '0 24px', borderRadius: 12,
                                border: '1.5px solid var(--navy)', background: '#fff',
                                color: 'var(--navy)', fontSize: 15, fontWeight: 700, cursor: 'pointer',
                              }}
                            >
                              접기
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setResubSent(true)}
                            style={{
                              height: 48, padding: '0 28px',
                              background: 'var(--navy)', color: '#fff',
                              border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: 'pointer',
                            }}
                          >
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

      ) : (

        /* ── 수업 기록 탭 ── */
        <div>
          {/* AI 질문창 */}
          <div style={{ marginBottom: 16 }}>
            <div className="ai-ask">
              <div className="ai-dot">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none"><path d="M12 2l2.09 6.43H21L15.47 12.6l2.09 6.4L12 15.18 6.44 19l2.09-6.4L3 8.43h6.91L12 2z" fill="currentColor"/></svg>
              </div>
              <input
                value={aiQuery}
                onChange={e => setAiQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAI()}
                placeholder="예: 1반 데이터만 보여줘"
              />
              <button
                className="btn primary"
                onClick={() => handleAI()}
                disabled={!aiQuery.trim()}
                style={{ height: 40 }}
              >
                보내기
              </button>
            </div>
            <div className="qchips">
              {QUICK_QUERIES.map(q => (
                <button
                  key={q}
                  className="btn sm ghost"
                  onClick={() => { setAiQuery(q); handleAI(q); }}
                >
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
                    <button
                      className="link-btn"
                      onClick={clearFilter}
                      style={{ fontSize: 12, color: 'var(--ink-3)', whiteSpace: 'nowrap' }}
                    >
                      전체 보기 ✕
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* ①② 패널 */}
          <div className="two">
            {/* ① 반별 결과 */}
            <div className="panel">
              <div className="panel-h">
                <h3>① 반별 결과</h3>
                {filter ? (
                  <button className="link-btn" onClick={clearFilter} style={{ fontSize: 12, fontWeight: 700 }}>
                    {filter === 'cls1' ? '1반' : filter === 'nofeedback' ? '피드백 전' : filter === 'wrongblock' ? '오답 많은 칸' : '전체'} ✕
                  </button>
                ) : (
                  <small>전체</small>
                )}
              </div>
              <div className="tscroll">
                <table>
                  <thead>
                    <tr>
                      {['활동', '반', '제출', '상태', '자주 틀린 칸'].map(h => (
                        <th key={h}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {classRows.map((row, i) => {
                      const st = STATUS_LABEL[row.status] ?? STATUS_LABEL.done;
                      const highlight = filter === 'wrongblock';
                      return (
                        <tr key={i} style={{ background: highlight ? '#fffbe8' : 'transparent' }}>
                          <td>
                            <div className="act">{row.title}</div>
                          </td>
                          <td>{row.cls}</td>
                          <td>{row.submitted}</td>
                          <td>
                            <span style={{ padding: '3px 8px', borderRadius: 8, fontSize: 12, fontWeight: 700, background: st.bg, color: st.color }}>
                              {st.label}
                            </span>
                          </td>
                          <td>
                            <span style={{
                              padding: '3px 8px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                              background: highlight ? '#fef08a' : '#fce7f3',
                              color: highlight ? '#713f12' : '#9d174d',
                            }}>
                              {row.wrongBlock}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                    {classRows.length === 0 && (
                      <tr>
                        <td colSpan={5} style={{ textAlign: 'center', color: 'var(--ink-3)' }}>
                          해당 조건의 수업이 없어요.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ② 학생별 기록 */}
            <div className="panel">
              <div className="panel-h">
                <h3>② 학생별 기록</h3>
                <small>{studentSectionLabel}</small>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {studentRows.map((rec, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ flex: 1, fontSize: 14, color: 'var(--ink)', fontWeight: 600 }}>{rec.title}</span>
                    {rec.feedback ? (
                      <span className="fbk g">{FEEDBACK_LABELS[rec.feedback as FeedbackValue]}</span>
                    ) : (
                      <span className="fbk n">피드백 전</span>
                    )}
                    <button className="link-btn" style={{ fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap' }}>
                      답 보기
                    </button>
                  </div>
                ))}
                <p style={{ margin: '8px 0 0', fontSize: 12, color: 'var(--ink-3)' }}>
                  처음 답 · 고친 답 · 받은 피드백이 함께 남아요
                </p>
              </div>
            </div>
          </div>

          {/* AI 안내 */}
          <div style={{ marginTop: 16, background: 'var(--canvas)', borderRadius: 12, overflow: 'hidden' }}>
            <button
              onClick={() => setExpanded(v => !v)}
              className="link-btn"
              style={{
                width: '100%', padding: '12px 16px', display: 'flex', alignItems: 'center',
                fontSize: 13, fontWeight: 700, color: 'var(--ink-3)', textAlign: 'left', gap: 6,
              }}
            >
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

/* ── 칸반 열 ── */
function KanbanCol({
  title, bg, titleColor, items, hiddenCount,
}: {
  title: string;
  bg: string;
  titleColor: string;
  items: { name: string; needHelp: boolean }[];
  hiddenCount?: number;
}) {
  return (
    <div style={{ background: bg, borderRadius: 10, padding: '14px 12px' }}>
      <p style={{ margin: '0 0 10px', textAlign: 'center', fontSize: 14, fontWeight: 800, color: titleColor }}>
        {title}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {items.map(s => (
          <div
            key={s.name}
            style={{
              padding: '8px 12px',
              background: s.needHelp ? '#fee2e2' : '#fff',
              border: s.needHelp ? '1px solid #fca5a5' : '1px solid transparent',
              borderRadius: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              fontSize: 14, color: 'var(--ink)',
            }}
          >
            {s.name}
            {s.needHelp && (
              <span style={{ fontSize: 12, fontWeight: 700, color: '#dc2626', whiteSpace: 'nowrap' }}>
                도움 필요 ▶
              </span>
            )}
          </div>
        ))}
        {hiddenCount && items.length > 0 && (
          <div style={{ padding: '8px 12px', background: '#fff', borderRadius: 8, fontSize: 14, color: 'var(--mute)', textAlign: 'center' }}>
            +{hiddenCount}명
          </div>
        )}
      </div>
    </div>
  );
}

/* ── 탭 버튼 ── */
function TabBtn({ children, active, onClick, badge, live }: {
  children: ReactNode;
  active: boolean;
  onClick: () => void;
  badge?: number;
  live?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '10px 20px',
        border: 'none',
        borderBottom: active ? '2px solid var(--navy)' : '2px solid transparent',
        marginBottom: -2,
        background: 'none',
        fontSize: 15,
        fontWeight: active ? 800 : 600,
        color: active ? 'var(--navy)' : 'var(--mute)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 7,
      }}
    >
      {live && (
        <span className="live-dot" style={{ color: '#16a34a', fontSize: 8, lineHeight: 1 }}>●</span>
      )}
      {children}
      {badge !== undefined && badge > 0 && (
        <span style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          minWidth: 20, height: 20, borderRadius: 10, padding: '0 5px',
          background: active ? 'var(--navy)' : 'var(--line2)',
          color: active ? '#fff' : 'var(--mute)',
          fontSize: 11, fontWeight: 800,
        }}>
          {badge}
        </span>
      )}
    </button>
  );
}

function AiBadge() {
  return (
    <span style={{
      width: 28, height: 28, borderRadius: '50%',
      background: 'var(--navy)', color: '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 11, fontWeight: 800, flexShrink: 0,
    }}>
      AI
    </span>
  );
}
