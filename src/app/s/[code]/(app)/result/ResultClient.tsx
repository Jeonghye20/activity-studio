'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import TypeThumbnail from '@/components/TypeThumbnail';
import type { Worksheet, Block } from '@/types/worksheet';
import {
  DEMO_RESULT_MAP,
  TYPE_COLORS,
  TYPE_LABELS,
  initDemoViewedFeedbacks,
  type QuestionResult,
  type ResultData,
} from '@/lib/studentDemoData';

const PURPLE = '#6741d9';
const NAVY = '#131c33';
const GREEN = '#2b8a3e';
const ORANGE = '#e8890c';

type Answers = Record<string, unknown>;

// ─── 헬퍼 ────────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getMonth() + 1}월 ${d.getDate()}일`;
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  const h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, '0');
  const ampm = h < 12 ? '오전' : '오후';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${d.getMonth() + 1}월 ${d.getDate()}일 ${ampm} ${h12}:${m}`;
}

interface StoredSub {
  worksheetId: string;
  hasFeedback: boolean;
  feedbackType: string | null;
  feedbackText: string | null;
  submittedAt: string;
}

function buildQuestionsFromSheet(
  sheet: Worksheet,
  storedAnswers: Answers,
  demo: ResultData | null
): QuestionResult[] {
  const blocks = sheet.sections.flatMap(sec => sec.blocks).filter(b => b.kind !== 'note');
  let n = 0;
  return blocks.map((b: Block) => {
    n++;
    const demoQ = demo?.questions.find(q => q.blockId === b.id);

    // choice 블록: 직접 비교 가능
    if (b.kind === 'choice' && typeof b.answer === 'number') {
      const stored = storedAnswers[b.id];
      const opts = (b.options as string[]) ?? [];
      if (typeof stored === 'number') {
        return {
          blockId: b.id, num: n, prompt: b.prompt, kind: b.kind,
          studentAnswer: opts[stored] ?? '(답 없음)',
          status: (stored === b.answer ? 'correct' : 'review') as 'correct' | 'review',
          teacherComment: demoQ?.teacherComment,
        };
      }
    }

    // write: 작성 내용 표시
    if (b.kind === 'write' && typeof storedAnswers[b.id] === 'string') {
      const text = String(storedAnswers[b.id]).trim();
      return {
        blockId: b.id, num: n, prompt: b.prompt, kind: b.kind,
        studentAnswer: text || '(빈 답)',
        status: (demoQ?.status ?? 'correct') as 'correct' | 'review',
        teacherComment: demoQ?.teacherComment,
      };
    }

    // order: {items, touched} → "1 → 항목\n2 → 항목..."
    if (b.kind === 'order') {
      const v = storedAnswers[b.id];
      const items = (b.items as string[]) ?? [];
      if (v && typeof v === 'object' && !Array.isArray(v)) {
        const ov = v as { items?: number[]; touched?: boolean };
        if (Array.isArray(ov.items) && ov.touched) {
          const text = ov.items.map((idx, pos) => `${pos + 1} → ${items[idx]}`).join('\n');
          return {
            blockId: b.id, num: n, prompt: b.prompt, kind: b.kind,
            studentAnswer: text,
            status: (demoQ?.status ?? 'correct') as 'correct' | 'review',
            teacherComment: demoQ?.teacherComment,
          };
        }
      }
    }

    // multi: number[] → "항목1 / 항목2 / ..."
    if (b.kind === 'multi') {
      const v = storedAnswers[b.id];
      const opts = (b.options as string[]) ?? [];
      if (Array.isArray(v) && (v as number[]).length > 0) {
        const text = (v as number[]).map(i => opts[i]).filter(Boolean).join(' / ');
        return {
          blockId: b.id, num: n, prompt: b.prompt, kind: b.kind,
          studentAnswer: text,
          status: (demoQ?.status ?? 'correct') as 'correct' | 'review',
          teacherComment: demoQ?.teacherComment,
        };
      }
    }

    // 나머지: demo 데이터 fallback
    return {
      blockId: b.id, num: n, prompt: b.prompt, kind: b.kind,
      studentAnswer: demoQ?.studentAnswer ?? '(답 없음)',
      status: (demoQ?.status ?? 'correct') as 'correct' | 'review',
      teacherComment: demoQ?.teacherComment,
    };
  });
}

// ─── 작은 컴포넌트 ─────────────────────────────────────────────────────────

function IconChat() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function IconRefresh() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="23 4 23 10 17 10" />
      <polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
  );
}

function QNumCircle({ n, status }: { n: number; status: 'correct' | 'review' }) {
  const bg = status === 'correct' ? '#ebfbee' : '#fff4e6';
  const color = status === 'correct' ? GREEN : ORANGE;
  return (
    <span style={{
      width: 32, height: 32, borderRadius: '50%',
      background: bg, color, flexShrink: 0,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 13, fontWeight: 800,
    }}>
      {n}
    </span>
  );
}

function StatusTag({ status }: { status: 'correct' | 'review' }) {
  const isReview = status === 'review';
  return (
    <span style={{
      height: 24, padding: '0 10px', borderRadius: 8, flexShrink: 0,
      background: isReview ? '#fff4e6' : '#ebfbee',
      color: isReview ? ORANGE : GREEN,
      fontSize: 12, fontWeight: 850,
      display: 'inline-flex', alignItems: 'center',
    }}>
      {isReview ? '다시 볼 것' : '맞음'}
    </span>
  );
}

// ─── 메인 ─────────────────────────────────────────────────────────────────────

interface Props {
  code: string;
  worksheetId: string;
  sheet: Worksheet | null;
}

export default function ResultClient({ code, worksheetId, sheet }: Props) {
  const [mounted, setMounted] = useState(false);
  const [hasFeedback, setHasFeedback] = useState(false);
  const [feedbackData, setFeedbackData] = useState<ResultData['feedback'] | null>(null);
  const [resubmitData, setResubmitData] = useState<ResultData['resubmit'] | null>(null);
  const [questions, setQuestions] = useState<QuestionResult[]>([]);
  const [correctCount, setCorrectCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [isGameType, setIsGameType] = useState(false);
  const [gameResult, setGameResult] = useState<string | undefined>();
  const [meta, setMeta] = useState('');
  const [title, setTitle] = useState('');
  const [wsType, setWsType] = useState<string>('concept');
  const [isNew, setIsNew] = useState(false);
  const [tab, setTab] = useState<'all' | 'review'>('all');

  const VIEWED_KEY = `activity_studio_result_viewed_${code}`;

  useEffect(() => {
    const demo = DEMO_RESULT_MAP[worksheetId] ?? null;

    // 제출 데이터 (localStorage)
    let storedSub: StoredSub | null = null;
    try {
      const subsRaw = localStorage.getItem(`activity_studio_submissions_${code}`);
      const subs: StoredSub[] = subsRaw ? JSON.parse(subsRaw) : [];
      storedSub = subs.find(s => s.worksheetId === worksheetId) ?? null;
    } catch {}

    // 저장된 답 (로컬스토리지)
    let storedAnswers: Answers = {};
    try {
      const ar = localStorage.getItem(`activity_studio_answers_${code}_${worksheetId}`);
      if (ar) storedAnswers = JSON.parse(ar);
    } catch {}

    // 피드백 여부 결정
    const fbReceived = storedSub
      ? storedSub.hasFeedback
      : (demo?.feedback !== null && demo !== null);
    setHasFeedback(fbReceived);

    const fbType = storedSub
      ? storedSub.feedbackType
      : (demo?.resubmit ? 'review' : null);

    // 피드백 내용
    if (fbReceived && demo?.feedback) {
      const comment = storedSub?.feedbackText || demo.feedback.comment;
      setFeedbackData({ ...demo.feedback, comment });
    }

    // 다시 풀기
    if (fbType === 'review' && demo?.resubmit) {
      setResubmitData(demo.resubmit);
    }

    // 문항 결과
    if (sheet) {
      const qs = buildQuestionsFromSheet(sheet, storedAnswers, demo);
      setQuestions(qs);
      const correct = qs.filter(q => q.status === 'correct').length;
      setCorrectCount(correct);
      setTotalCount(qs.length);
    } else if (demo) {
      setQuestions(demo.questions);
      setCorrectCount(demo.correctCount);
      setTotalCount(demo.totalCount);
    }

    // 게임형
    const gameT = sheet?.type ? ['escape', 'mystery'].includes(sheet.type) : (demo?.isGameType ?? false);
    setIsGameType(gameT);
    setGameResult(demo?.gameResult);

    // 메타
    const wsTitle = sheet?.title ?? demo?.title ?? '활동지';
    const wsMeta = demo?.meta ?? (storedSub
      ? `정보 · ${formatDate(storedSub.submittedAt)} 제출 · 김선생님`
      : '');
    setTitle(wsTitle);
    setMeta(wsMeta);
    setWsType(sheet?.type ?? demo?.type ?? 'concept');

    // 새로 옴 상태
    let timerCleanup: (() => void) | undefined;
    try {
      const viewed = initDemoViewedFeedbacks(code);
      const isAlreadyViewed = viewed.includes(worksheetId);
      setIsNew(fbReceived && !isAlreadyViewed);

      if (!isAlreadyViewed) {
        const timer = setTimeout(() => {
          setIsNew(false);
          try {
            const updated = [...new Set([...viewed, worksheetId])];
            localStorage.setItem(VIEWED_KEY, JSON.stringify(updated));
          } catch {}
        }, 1000);
        timerCleanup = () => clearTimeout(timer);
      }
    } catch {}

    setMounted(true);
    return timerCleanup;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, worksheetId]);

  // mounted는 setMounted 위치 때문에 별도 effect
  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return null;

  const typeColor = TYPE_COLORS[wsType] ?? '#5d6880';
  const typeLabel = (TYPE_LABELS as Record<string, string>)[wsType] ?? wsType;
  const reviewCount = questions.filter(q => q.status === 'review').length;
  const filteredQs = tab === 'all' ? questions : questions.filter(q => q.status === 'review');

  // ─── Hero band ──────────────────────────────────────────────────────────
  const heroBand = (
    <div className="hero" style={{ padding: '24px 28px', marginBottom: 18 }}>
      <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
        {/* 썸네일 */}
        <div style={{ width: 160, height: 112, borderRadius: 12, overflow: 'hidden', background: 'rgba(255,255,255,0.1)', flexShrink: 0 }}>
          <TypeThumbnail type={wsType as Parameters<typeof TypeThumbnail>[0]['type']} height={112} />
        </div>

        {/* 정보 */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 7 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.8)' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: typeColor, flexShrink: 0 }} />
              {typeLabel}
            </span>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>{meta}</span>
          </div>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 850, color: '#fff', letterSpacing: '-.02em', lineHeight: 1.3 }}>
            {title}
          </h1>
        </div>

        {/* 결과 상자 */}
        <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 16, padding: '16px 22px', textAlign: 'center', flexShrink: 0 }}>
          {isGameType && gameResult ? (
            <>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: 'rgba(255,255,255,0.65)', marginBottom: 5 }}>결과</div>
              <div style={{ fontSize: 22, fontWeight: 850, color: '#ffd43b', lineHeight: 1 }}>{gameResult}</div>
            </>
          ) : (
            <>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: 'rgba(255,255,255,0.65)', marginBottom: 5 }}>맞힌 문항</div>
              <div style={{ lineHeight: 1 }}>
                <span style={{ fontSize: 34, fontWeight: 850, color: '#fff' }}>{correctCount}</span>
                <span style={{ fontSize: 20, color: 'rgba(255,255,255,0.55)', fontWeight: 700 }}> / {totalCount}</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );

  // ─── 피드백 카드 ─────────────────────────────────────────────────────────
  const feedbackCard = (
    <div style={{
      background: '#fff',
      border: `2px solid ${hasFeedback ? '#ffd43b' : '#e3e7ef'}`,
      borderRadius: 24, padding: '20px 22px', marginBottom: 18,
    }}>
      {hasFeedback && feedbackData ? (
        <>
          {/* 헤더 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <div style={{
              width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
              background: '#3b5bdb', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 15, fontWeight: 850,
            }}>
              {feedbackData.teacherName[0]}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--ink)' }}>
                  {feedbackData.teacherName} 피드백
                </span>
                {isNew && (
                  <span className="new-badge" style={{ fontSize: 11, padding: '2px 7px' }}>새로 옴</span>
                )}
              </div>
            </div>
            <span style={{ marginLeft: 'auto', fontSize: 12, color: '#9ca3af', flexShrink: 0 }}>
              {formatTime(feedbackData.receivedAt)}
            </span>
          </div>

          {/* 코멘트 */}
          <p style={{ margin: '0 0 14px', fontSize: 16, color: 'var(--ink)', lineHeight: 1.65 }}>
            {feedbackData.comment}
          </p>

          {/* 칭찬 칩 */}
          {feedbackData.praises.length > 0 && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {feedbackData.praises.map(p => (
                <span key={p} style={{
                  height: 30, padding: '0 12px', borderRadius: 8,
                  background: '#ebfbee', color: GREEN,
                  fontSize: 13, fontWeight: 800,
                  display: 'inline-flex', alignItems: 'center',
                }}>
                  {p}
                </span>
              ))}
            </div>
          )}
        </>
      ) : (
        /* 피드백 대기 상태 */
        <div style={{
          border: '2px dashed #d1d5db', borderRadius: 14,
          padding: '24px', textAlign: 'center',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: '50%', background: '#f1f3f5',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#9ca3af',
          }}>
            <IconChat />
          </div>
          <span style={{ fontSize: 15, fontWeight: 700, color: '#5d6880' }}>
            선생님 피드백을 기다리고 있어요
          </span>
          <span style={{ fontSize: 13, color: '#9ca3af' }}>
            피드백이 오면 여기에 표시돼요
          </span>
        </div>
      )}
    </div>
  );

  // ─── 다시 풀기 요청 ───────────────────────────────────────────────────────
  const resubmitCard = resubmitData && (
    <div style={{
      background: '#f3f0ff', borderRadius: 20, padding: '18px 20px', marginBottom: 18,
      display: 'flex', alignItems: 'center', gap: 16,
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: 12, background: PURPLE, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ color: '#fff' }}><IconRefresh /></span>
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--ink)', marginBottom: 4, letterSpacing: '-.01em' }}>
          {resubmitData.questionCount}문항을 고쳐서 다시 내 주세요
        </div>
        <div style={{ fontSize: 12.5, color: '#5d6880', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <span>{resubmitData.deadline}</span>
          <span style={{ color: '#d1d5db' }}>·</span>
          <span>고칠 문항만 열려요</span>
          <span style={{ color: '#d1d5db' }}>·</span>
          <span>다시 낼 때까지 이 문항의 정답은 숨겨져요</span>
        </div>
      </div>

      <Link
        href={`/s/${code}/activity`}
        style={{
          height: 44, padding: '0 18px', borderRadius: 12,
          background: PURPLE, color: '#fff',
          textDecoration: 'none', fontSize: 14, fontWeight: 800,
          display: 'inline-flex', alignItems: 'center', flexShrink: 0,
          letterSpacing: '-.01em',
        }}
      >
        다시 풀기 →
      </Link>
    </div>
  );

  // ─── 문항별 결과 ─────────────────────────────────────────────────────────
  const questionSection = questions.length > 0 && (
    <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 24, overflow: 'hidden', marginBottom: 18 }}>
      {/* 헤더 */}
      <div style={{
        padding: '18px 24px 16px',
        borderBottom: '1px solid var(--line)',
        display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
      }}>
        <span style={{ fontSize: 17, fontWeight: 850, color: 'var(--ink)', letterSpacing: '-.01em', marginRight: 4 }}>
          문항별 결과
        </span>

        {/* 번호 원 */}
        <div style={{ display: 'flex', gap: 6 }}>
          {questions.map(q => <QNumCircle key={q.blockId} n={q.num} status={q.status} />)}
        </div>

        {/* 탭 */}
        <div style={{ marginLeft: 'auto', display: 'flex', border: '1.5px solid var(--line)', borderRadius: 10, overflow: 'hidden', flexShrink: 0 }}>
          {(['all', 'review'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                height: 36, padding: '0 14px',
                background: tab === t ? NAVY : '#fff',
                color: tab === t ? '#fff' : '#5d6880',
                border: 'none', cursor: 'pointer',
                fontSize: 13, fontWeight: 700,
                transition: 'background .12s',
              }}
            >
              {t === 'all' ? `전체 ${questions.length}` : `다시 볼 것 ${reviewCount}`}
            </button>
          ))}
        </div>
      </div>

      {/* 범례 */}
      <div style={{ padding: '12px 24px 0', display: 'flex', gap: 16 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700, color: GREEN }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: GREEN }} />
          맞음
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700, color: ORANGE }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: ORANGE }} />
          다시 볼 것
        </span>
      </div>

      {/* 문항 카드 */}
      <div style={{ padding: '12px 24px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filteredQs.length === 0 ? (
          <div style={{ padding: '24px 0', textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>
            해당하는 문항이 없어요.
          </div>
        ) : filteredQs.map(q => {
          const isReview = q.status === 'review';
          return (
            <div
              key={q.blockId}
              style={{
                borderRadius: 14,
                border: isReview ? `2px solid #ffc078` : '1px solid var(--line)',
                background: isReview ? '#fffaf3' : '#fff',
                padding: '16px 18px',
              }}
            >
              {/* 문항 헤더: 번호 + 프롬프트 + 태그 */}
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 12 }}>
                <QNumCircle n={q.num} status={q.status} />
                <p style={{ margin: '4px 0 0', fontSize: 15, fontWeight: 600, color: 'var(--ink)', flex: 1, lineHeight: 1.6, minWidth: 0 }}>
                  {q.prompt}
                </p>
                <StatusTag status={q.status} />
              </div>

              {/* 내 답 */}
              <div style={{
                background: '#f8f9fb', borderRadius: 8,
                padding: '10px 14px',
                marginBottom: q.teacherComment ? 10 : 0,
              }}>
                <span style={{ fontSize: 11.5, fontWeight: 700, color: '#9ca3af', marginRight: 10 }}>내 답</span>
                <span style={{ fontSize: 14, color: 'var(--ink)', whiteSpace: 'pre-wrap' }}>{q.studentAnswer}</span>
              </div>

              {/* 선생님 문항 코멘트 */}
              {q.teacherComment && (
                <div style={{
                  display: 'flex', gap: 8, alignItems: 'flex-start',
                  padding: '10px 12px', background: '#fff4e6', borderRadius: 8,
                }}>
                  <span style={{ color: ORANGE, flexShrink: 0, marginTop: 1 }}><IconChat /></span>
                  <div>
                    <span style={{ fontSize: 11.5, fontWeight: 700, color: ORANGE, marginRight: 8 }}>선생님</span>
                    <span style={{ fontSize: 13, color: '#c2410c' }}>{q.teacherComment}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  // ─── 하단 버튼 ───────────────────────────────────────────────────────────
  const bottomBar = (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 32 }}>
      <Link
        href={`/s/${code}/activities`}
        style={{
          height: 44, padding: '0 20px', borderRadius: 12,
          border: '1.5px solid var(--line)', background: '#fff',
          color: 'var(--ink)', textDecoration: 'none',
          fontSize: 14, fontWeight: 700,
          display: 'inline-flex', alignItems: 'center',
        }}
      >
        내 활동으로
      </Link>

      {resubmitData && (
        <Link
          href={`/s/${code}/activity`}
          style={{
            height: 44, padding: '0 20px', borderRadius: 12,
            background: PURPLE, color: '#fff',
            textDecoration: 'none', fontSize: 14, fontWeight: 700,
            display: 'inline-flex', alignItems: 'center',
          }}
        >
          {resubmitData.questionCount}문항 다시 풀기
        </Link>
      )}
    </div>
  );

  // ─── Render ────────────────────────────────────────────────────────────
  return (
    <div className="p-main">
      {/* ← 내 활동 */}
      <Link
        href={`/s/${code}/activities`}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          fontSize: 13, fontWeight: 700, color: '#9ca3af',
          textDecoration: 'none', marginBottom: 14,
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        내 활동
      </Link>

      {heroBand}
      {feedbackCard}
      {resubmitCard}
      {questionSection}
      {bottomBar}
    </div>
  );
}
