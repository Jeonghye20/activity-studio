'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  DEMO_ALL_DONE,
  DEMO_CURRENT_ACTIVITY,
  DEMO_RECORD_STATS,
  DEMO_RESULT_MAP,
  TYPE_COLORS,
  TYPE_LABELS,
  initDemoViewedFeedbacks,
  getStudentActivities,
  type StudentActivity,
  type WorksheetType,
} from '@/lib/studentDemoData';

const PURPLE = '#6741d9';
const NAVY = '#131c33';
const GREEN = '#2f9e44';

// ─── 달력 상수 ──────────────────────────────────────────────────────────────
// 2학기 시작: 2026-08-31 (월요일)
const SEMESTER_START = new Date(2026, 7, 31);
const WEEKS = 17;
const TODAY_STR = '2026-11-04';
const DAY_LABELS = ['월', '화', '수', '목', '금'];

function toDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function getCellDate(week: number, dow: number): Date {
  const d = new Date(SEMESTER_START);
  d.setDate(d.getDate() + week * 7 + dow);
  return d;
}

function getMonthLabel(week: number): string | null {
  const thisMonday = getCellDate(week, 0);
  if (week === 0) return null;
  const prevMonday = getCellDate(week - 1, 0);
  if (thisMonday.getMonth() !== prevMonday.getMonth()) {
    return `${thisMonday.getMonth() + 1}월`;
  }
  return null;
}

function formatMonthDay(dateKey: string): string {
  const [, m, d] = dateKey.split('-');
  return `${parseInt(m)}월 ${parseInt(d)}일`;
}

function formatFeedbackTime(iso: string): string {
  const d = new Date(iso);
  const mo = d.getMonth() + 1;
  const da = d.getDate();
  const h = d.getHours();
  const mi = String(d.getMinutes()).padStart(2, '0');
  const ampm = h < 12 ? '오전' : '오후';
  return `${mo}월 ${da}일 ${ampm} ${h % 12 || 12}:${mi}`;
}

// ─── 활동 데이터 ─────────────────────────────────────────────────────────────
const CURRENT_AS_ACTIVITY: StudentActivity = {
  worksheetId: DEMO_CURRENT_ACTIVITY.worksheetId,
  title: DEMO_CURRENT_ACTIVITY.title,
  type: DEMO_CURRENT_ACTIVITY.type,
  submittedAt: '2026-11-04T13:30:00',
  status: 'feedback',
  resultText: '맞힌 문항 2/4',
};

const ALL_ACTS: StudentActivity[] = [...DEMO_ALL_DONE, CURRENT_AS_ACTIVITY];

const DATE_MAP: Record<string, StudentActivity[]> = {};
ALL_ACTS.forEach(a => {
  const key = a.submittedAt.substring(0, 10);
  if (!DATE_MAP[key]) DATE_MAP[key] = [];
  DATE_MAP[key].push(a);
});

// ─── 유형별 개수 ─────────────────────────────────────────────────────────────
const TYPE_ORDER: WorksheetType[] = ['concept', 'escape', 'mystery', 'practice', 'analysis', 'discussion'];
const TYPE_COUNTS: Record<string, number> = {};
ALL_ACTS.forEach(a => {
  TYPE_COUNTS[a.type] = (TYPE_COUNTS[a.type] || 0) + 1;
});
const MAX_TYPE_COUNT = Math.max(...Object.values(TYPE_COUNTS), 1);

// ─── 최근 피드백 3개 (지금 수업 중인 활동 제외) ─────────────────────────────────
const RECENT_FBS = Object.values(DEMO_RESULT_MAP)
  .filter(r => r.feedback !== null && r.worksheetId !== DEMO_CURRENT_ACTIVITY.worksheetId)
  .sort((a, b) => b.feedback!.receivedAt.localeCompare(a.feedback!.receivedAt))
  .slice(0, 3);

// ─── 아이콘 ─────────────────────────────────────────────────────────────────
function IconCalendar() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function IconBarChart() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4263eb" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}

function IconChat() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f08c00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

// ─── 달력 그리드 ─────────────────────────────────────────────────────────────
function CalendarGrid({
  selectedDate,
  onSelect,
}: {
  selectedDate: string;
  onSelect: (d: string) => void;
}) {
  const weeks = Array.from({ length: WEEKS }, (_, w) => w);
  const days = Array.from({ length: 5 }, (_, d) => d);

  return (
    <div style={{ display: 'flex', gap: 0 }}>
      {/* 요일 라벨 */}
      <div style={{
        display: 'flex', flexDirection: 'column', gap: 6,
        marginRight: 6, paddingTop: 22,
      }}>
        {DAY_LABELS.map(label => (
          <div key={label} style={{
            width: 14, height: 22,
            display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
            fontSize: 10, fontWeight: 700, color: '#b8c0cc',
          }}>
            {label}
          </div>
        ))}
      </div>

      {/* 주 그리드 */}
      <div>
        {/* 월 라벨 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${WEEKS}, 22px)`,
          columnGap: 6,
          marginBottom: 4, height: 16,
        }}>
          {weeks.map(w => (
            <div key={w} style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', lineHeight: 1 }}>
              {getMonthLabel(w) ?? ''}
            </div>
          ))}
        </div>

        {/* 셀 그리드 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${WEEKS}, 22px)`,
          gridTemplateRows: 'repeat(5, 22px)',
          columnGap: 6,
          rowGap: 6,
        }}>
          {weeks.flatMap(w =>
            days.map(d => {
              const date = getCellDate(w, d);
              const dateKey = toDateKey(date);
              const isFuture = dateKey > TODAY_STR;
              const acts = DATE_MAP[dateKey] ?? [];
              const count = acts.length;
              const selected = dateKey === selectedDate;

              let bg = '#eef1f6';
              if (isFuture) bg = '#fff';
              else if (count >= 2) bg = '#2f9e44';
              else if (count === 1) bg = '#b2f2bb';

              return (
                <button
                  key={`${w}-${d}`}
                  disabled={isFuture}
                  aria-label={`${date.getMonth() + 1}월 ${date.getDate()}일${count > 0 ? ` 활동 ${count}개` : ''}`}
                  onClick={() => onSelect(dateKey)}
                  style={{
                    width: 22, height: 22, borderRadius: 5,
                    background: bg,
                    border: selected
                      ? `2px solid ${PURPLE}`
                      : isFuture
                      ? '1.5px dashed #dde2ea'
                      : 'none',
                    cursor: isFuture ? 'default' : 'pointer',
                    padding: 0,
                    gridColumn: w + 1,
                    gridRow: d + 1,
                    boxSizing: 'border-box',
                    transition: 'border .08s',
                  }}
                />
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

// ─── 오른쪽 패널 활동 카드 ───────────────────────────────────────────────────
function ActivityDayCard({ activity, code }: { activity: StudentActivity; code: string }) {
  const color = TYPE_COLORS[activity.type] ?? '#5d6880';
  const typeLabel = (TYPE_LABELS as Record<string, string>)[activity.type] ?? activity.type;

  let linkText = '결과 보기';
  let linkHref = `/s/${code}/result?id=${activity.worksheetId}`;
  if (activity.status === 'resubmit') {
    linkText = '다시 풀기';
    linkHref = `/s/${code}/activity`;
  }

  return (
    <div style={{ border: '1px solid var(--line)', borderRadius: 12, padding: '14px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11.5, fontWeight: 700, color }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: color }} />
          {typeLabel}
        </span>
        <span style={{ fontSize: 11.5, color: '#9ca3af' }}>정보</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--ink)', marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {activity.title}
          </div>
          <div style={{ fontSize: 12, color: '#9ca3af' }}>{activity.resultText}</div>
        </div>
        <Link
          href={linkHref}
          style={{ fontSize: 13, fontWeight: 700, color: PURPLE, textDecoration: 'none', flexShrink: 0 }}
        >
          {linkText}
        </Link>
      </div>
    </div>
  );
}

// ─── 메인 ─────────────────────────────────────────────────────────────────────
export default function RecordClient({ code }: { code: string }) {
  const [mounted, setMounted] = useState(false);
  const [selectedDate, setSelectedDate] = useState(TODAY_STR);
  const [subject, setSubject] = useState<'all' | '정보'>('all');
  const [period, setPeriod] = useState<'this' | 'last' | 'all'>('this');
  const [viewedFeedbacks, setViewedFeedbacks] = useState<string[]>([]);
  const [doneCount, setDoneCount] = useState(DEMO_ALL_DONE.length);

  useEffect(() => {
    setViewedFeedbacks(initDemoViewedFeedbacks(code));
    setDoneCount(getStudentActivities(code).doneItems.length);
    setMounted(true);
  }, [code]);

  if (!mounted) return null;

  const selectedActs = DATE_MAP[selectedDate] ?? [];
  const newFeedbackCount = Object.values(DEMO_RESULT_MAP)
    .filter(r => r.feedback !== null && !viewedFeedbacks.includes(r.worksheetId)).length;

  // 요약 카드
  const summaryCards = [
    { num: doneCount, unit: '개', label: '끝낸 활동', badge: null as number | null },
    { num: DEMO_RECORD_STATS.feedbackCount, unit: '개', label: '받은 피드백', badge: newFeedbackCount > 0 ? newFeedbackCount : null },
    { num: DEMO_RECORD_STATS.praiseCount, unit: '개', label: '받은 칭찬', badge: null },
    { num: DEMO_RECORD_STATS.fixedCount, unit: '문항', label: '다시 풀어 고친', badge: null },
  ];

  return (
    <div className="p-main">

      {/* 1. 제목 줄 */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20, gap: 16 }}>
        <div>
          <h1 style={{ margin: '0 0 6px', fontSize: 26, fontWeight: 850, color: 'var(--ink)', letterSpacing: '-.02em' }}>
            나의 기록
          </h1>
          <p style={{ margin: 0, fontSize: 15, color: 'var(--ink-3)' }}>
            내가 한 활동과 받은 피드백을 모아 봤어요.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexShrink: 0 }}>
          {/* 과목 탭 */}
          <div style={{ display: 'flex', border: '1.5px solid var(--line)', borderRadius: 10, overflow: 'hidden' }}>
            {(['all', '정보'] as const).map(s => (
              <button
                key={s}
                onClick={() => setSubject(s)}
                style={{
                  height: 36, padding: '0 14px',
                  background: subject === s ? NAVY : '#fff',
                  color: subject === s ? '#fff' : '#5d6880',
                  border: 'none', cursor: 'pointer',
                  fontSize: 13, fontWeight: 700,
                  transition: 'background .1s',
                }}
              >
                {s === 'all' ? '전체' : '정보'}
              </button>
            ))}
          </div>
          {/* 기간 선택 */}
          <select
            value={period}
            onChange={e => setPeriod(e.target.value as typeof period)}
            style={{
              height: 36, padding: '0 28px 0 12px',
              border: '1.5px solid var(--line)', borderRadius: 10,
              background: '#fff', color: 'var(--ink)',
              fontSize: 13, fontWeight: 700, cursor: 'pointer',
              appearance: 'none',
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%236b7280' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 10px center',
            }}
          >
            <option value="this">이번 학기</option>
            <option value="last">지난 학기</option>
            <option value="all">전체</option>
          </select>
        </div>
      </div>

      {/* 2. 요약 카드 4개 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20 }}>
        {summaryCards.map(c => (
          <div
            key={c.label}
            style={{
              background: '#fff', border: '1px solid var(--line)', borderRadius: 18,
              padding: '20px 22px', position: 'relative',
            }}
          >
            {c.badge !== null && (
              <span style={{
                position: 'absolute', top: 14, right: 14,
                background: '#ffd43b', color: '#1a1a1a',
                fontSize: 11, fontWeight: 850, padding: '2px 8px', borderRadius: 20,
              }}>
                새로 {c.badge}
              </span>
            )}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 5 }}>
              <span style={{ fontSize: 32, fontWeight: 850, color: 'var(--ink)', letterSpacing: '-.03em', lineHeight: 1 }}>
                {c.num}
              </span>
              <span style={{ fontSize: 16, color: '#9ca3af' }}>{c.unit}</span>
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-3)' }}>{c.label}</div>
          </div>
        ))}
      </div>

      {/* 3. 활동한 날 카드 */}
      <div style={{
        background: '#fff', border: '1px solid var(--line)', borderRadius: 24,
        marginBottom: 20, display: 'flex', overflow: 'hidden',
      }}>
        {/* 왼쪽: 달력 */}
        <div style={{ flex: '0 0 58%', padding: '24px 24px 20px', minWidth: 0 }}>
          {/* 헤더 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10, background: '#ebfbee', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <IconCalendar />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 850, color: 'var(--ink)', letterSpacing: '-.01em' }}>활동한 날</div>
              <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>2학기 · 날짜를 누르면 그날 한 활동이 보여요</div>
            </div>
          </div>

          {/* 달력 */}
          <CalendarGrid selectedDate={selectedDate} onSelect={setSelectedDate} />

          {/* 범례 */}
          <div style={{ display: 'flex', gap: 16, marginTop: 10 }}>
            {[
              { color: '#eef1f6', label: '안 함', border: '1px solid #e3e7ef' },
              { color: '#b2f2bb', label: '1개', border: 'none' },
              { color: '#2f9e44', label: '2개 이상', border: 'none' },
            ].map(l => (
              <span key={l.label} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11.5, color: '#9ca3af' }}>
                <span style={{ width: 12, height: 12, borderRadius: 3, background: l.color, border: l.border, flexShrink: 0 }} />
                {l.label}
              </span>
            ))}
          </div>
        </div>

        {/* 세로 구분선 */}
        <div style={{ width: 1, background: 'var(--line)', flexShrink: 0 }} />

        {/* 오른쪽: 선택된 날 활동 */}
        <div style={{ flex: 1, padding: '24px 22px', minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 850, color: 'var(--ink)', marginBottom: 14, letterSpacing: '-.01em' }}>
            {formatMonthDay(selectedDate)}에 한 활동
          </div>
          {selectedActs.length === 0 ? (
            <div style={{
              border: '1.5px dashed #d1d5db', borderRadius: 12,
              padding: '28px 20px', textAlign: 'center',
              color: '#9ca3af', fontSize: 14,
            }}>
              이날은 한 활동이 없어요.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {selectedActs.map(a => (
                <ActivityDayCard key={a.worksheetId} activity={a} code={code} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 4. 아래 2열 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 32 }}>

        {/* 유형별로 한 활동 */}
        <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 24, padding: '22px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10, background: '#e8ecff', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <IconBarChart />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 850, color: 'var(--ink)', letterSpacing: '-.01em' }}>유형별로 한 활동</div>
              <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>어떤 활동을 많이 했는지 볼 수 있어요</div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
            {TYPE_ORDER.map(t => {
              const count = TYPE_COUNTS[t] || 0;
              const pct = (count / MAX_TYPE_COUNT) * 100;
              const color = TYPE_COLORS[t] ?? '#5d6880';
              const label = (TYPE_LABELS as Record<string, string>)[t] ?? t;
              return (
                <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ width: 68, fontSize: 12.5, fontWeight: 700, color: 'var(--ink-3)', flexShrink: 0, textAlign: 'right' }}>
                    {label}
                  </span>
                  <div style={{ flex: 1, height: 14, background: '#f1f3f5', borderRadius: 6, overflow: 'hidden' }}>
                    {count > 0 && (
                      <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 6 }} />
                    )}
                  </div>
                  <span style={{
                    width: 18, fontSize: 13, fontWeight: 850, flexShrink: 0, textAlign: 'right',
                    color: count > 0 ? 'var(--ink)' : '#d1d5db',
                  }}>
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 최근 피드백 */}
        <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 24, padding: '22px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10, background: '#fff9db', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <IconChat />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 850, color: 'var(--ink)', letterSpacing: '-.01em' }}>최근 피드백</div>
            </div>
            <Link
              href={`/s/${code}/activities`}
              style={{ fontSize: 13, fontWeight: 700, color: PURPLE, textDecoration: 'none', flexShrink: 0 }}
            >
              모두 보기
            </Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {RECENT_FBS.map(r => {
              const isNew = !viewedFeedbacks.includes(r.worksheetId);
              const color = TYPE_COLORS[r.type] ?? '#5d6880';
              const typeLabel = (TYPE_LABELS as Record<string, string>)[r.type] ?? r.type;
              return (
                <Link
                  key={r.worksheetId}
                  href={`/s/${code}/result?id=${r.worksheetId}`}
                  style={{
                    display: 'block', textDecoration: 'none',
                    border: isNew ? '2px solid #ffd43b' : '1.5px solid var(--line)',
                    borderRadius: 14, padding: '14px 16px', background: '#fff',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11.5, fontWeight: 700, color }}>
                      <span style={{ width: 7, height: 7, borderRadius: '50%', background: color }} />
                      {typeLabel}
                    </span>
                    {isNew && (
                      <span className="new-badge" style={{ fontSize: 11, padding: '1px 7px' }}>새로 옴</span>
                    )}
                    <span style={{ marginLeft: 'auto', fontSize: 11.5, color: '#9ca3af', flexShrink: 0 }}>
                      {formatFeedbackTime(r.feedback!.receivedAt)}
                    </span>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--ink)', marginBottom: isNew ? 8 : 0 }}>
                    {r.title}
                  </div>
                  {isNew ? (
                    r.feedback!.praises.length > 0 && (
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {r.feedback!.praises.map(p => (
                          <span key={p} style={{
                            height: 22, padding: '0 8px', borderRadius: 6,
                            background: '#ebfbee', color: '#2b8a3e',
                            fontSize: 11.5, fontWeight: 700,
                            display: 'inline-flex', alignItems: 'center',
                          }}>
                            {p}
                          </span>
                        ))}
                      </div>
                    )
                  ) : (
                    <div style={{ fontSize: 12.5, color: '#9ca3af', marginTop: 4 }}>
                      {r.feedback!.comment.substring(0, 36)}…
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
