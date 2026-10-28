'use client';

import type { Student, AttendanceRecord, AchievementStatus, ActivityScore, StudentProgress } from '@/types/classRoster';
import { getStudentProgress, TOTAL_ACTIVITIES } from '@/lib/classRosterDummy';
import { toggleAbsent } from '@/lib/classRosterStore';

interface Props {
  classId: string;
  students: Student[];
  att: AttendanceRecord;
  selectedDate: string;
  filterStatus: AchievementStatus | null;
  sortBy: 'no' | 'name';
  searchQuery: string;
  onAttChange: () => void;
  onFilterClear: () => void;
}

// ── 성취 상태 색 ──────────────────────────────────────────
const STATUS_COLOR: Record<AchievementStatus, string> = {
  rising:       '#2b8a3e',
  steady:       '#868e96',
  falling:      '#e8730c',
  insufficient: '#9aa3b0',
  new:          '#9aa3b0',
};

function getStatusText(status: AchievementStatus, delta: number | null): string {
  if (status === 'new')          return '첫 활동 전';
  if (status === 'insufficient') return '기록 쌓는 중';
  const arrows = { rising: '↗', steady: '→', falling: '↘' } as Record<string, string>;
  const names  = { rising: '향상', steady: '유지', falling: '하락' } as Record<string, string>;
  const deltaStr = delta !== null ? (delta >= 0 ? ` +${delta}` : ` ${delta}`) : '';
  return `${arrows[status]} ${names[status]}${deltaStr}`;
}

// ── 미니 막대 차트 ────────────────────────────────────────
const BAR_W = 22;
const MAX_H = 40;
const GAP   = 3;

function MiniBarChart({ scores, status }: { scores: ActivityScore[]; status: AchievementStatus }) {
  const n = scores.length;
  if (n === 0) return <div style={{ height: MAX_H }} />;

  const svgW = n * BAR_W + (n - 1) * GAP;
  const recentStart = Math.max(0, n - 3);
  const barColor = STATUS_COLOR[status];

  const prev3 = n >= 6 ? scores.slice(-6, -3) : null;
  const prev3Avg = prev3 ? prev3.reduce((s, a) => s + a.score, 0) / 3 : null;
  const lineY = prev3Avg !== null ? MAX_H - Math.round((prev3Avg / 100) * MAX_H) : null;

  return (
    <svg
      width={svgW}
      height={MAX_H + 2}
      style={{ display: 'block', overflow: 'visible' }}
      aria-hidden="true"
    >
      {scores.map((s, i) => {
        const h = Math.max(2, Math.round((s.score / 100) * MAX_H));
        const x = i * (BAR_W + GAP);
        const y = MAX_H - h + 2;
        return (
          <rect key={i} x={x} y={y} width={BAR_W} height={h}
            fill={i >= recentStart ? barColor : '#dde1e7'}
          >
            <title>{s.name} · {s.score}점</title>
          </rect>
        );
      })}
      {lineY !== null && (
        <line
          x1={0} y1={lineY + 2} x2={svgW} y2={lineY + 2}
          stroke="#9aa3b0" strokeWidth="1" strokeDasharray="3 2"
        />
      )}
    </svg>
  );
}

// ── 학생 카드 ─────────────────────────────────────────────
function StudentCard({
  student, progress, isAbsent, onToggleAtt,
}: {
  student: Student;
  progress: StudentProgress;
  isAbsent: boolean;
  onToggleAtt: () => void;
}) {
  const completionPct = (progress.completedCount / TOTAL_ACTIVITIES) * 100;
  const isLow = completionPct < 60;
  const statusColor = STATUS_COLOR[progress.status];
  const hasChart = progress.recentScores.length > 0;

  const cardBg: React.CSSProperties = isAbsent
    ? {
        background: `repeating-linear-gradient(
          -45deg,
          #fff 0px, #fff 7px,
          rgba(224,49,49,0.05) 7px, rgba(224,49,49,0.05) 14px
        )`,
      }
    : { background: '#fff' };

  return (
    <div
      className="cr-card"
      style={{
        ...cardBg,
        border: '1px solid var(--line)',
        borderRadius: 16,
        padding: 14,
        display: 'flex',
        flexDirection: 'column',
        gap: 0,
        minWidth: 0,
        position: 'relative',
      }}
    >
      {/* 번호 + 출결 토글 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
        <span style={{
          fontSize: 22, fontWeight: 300, lineHeight: 1,
          color: '#8a94aa',
          letterSpacing: '-0.02em',
        }}>
          {String(student.no).padStart(2, '0')}
        </span>
        <button
          onClick={onToggleAtt}
          style={{
            height: 26, padding: '0 8px',
            borderRadius: 13,
            border: isAbsent ? 'none' : '1px solid #d4e8d4',
            background: isAbsent ? 'var(--st-help)' : '#ebfbee',
            color: isAbsent ? '#fff' : '#2b8a3e',
            fontSize: 12, fontWeight: 700,
            cursor: 'pointer',
            flexShrink: 0,
            lineHeight: 1,
          }}
        >
          {isAbsent ? '결석' : '출석'}
        </button>
      </div>

      {/* 이름 + ⋯ */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ fontSize: 19, fontWeight: 850, color: 'var(--ink)', letterSpacing: '-0.03em', lineHeight: 1.2 }}>
          {student.name}
        </span>
        <button
          className="cr-more"
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 16, color: 'var(--mute)', padding: '0 2px',
            lineHeight: 1, opacity: 0, transition: 'opacity 0.1s',
          }}
          aria-label="더보기"
        >⋯</button>
      </div>

      {/* 점선 구분 */}
      <div style={{ borderTop: '1px dashed var(--line)', marginBottom: 10 }} />

      {/* 성취·활동 영역 (결석 시 grayscale) */}
      <div style={{ filter: isAbsent ? 'grayscale(1) opacity(0.45)' : 'none' }}>
        {/* 성취 상태 레이블 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <span style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--mute)' }}>성취</span>
          <span style={{
            fontSize: 12.5, fontWeight: 700,
            color: (progress.status === 'new' || progress.status === 'insufficient')
              ? 'var(--mute)'
              : statusColor,
          }}>
            {getStatusText(progress.status, progress.statusDelta)}
          </span>
        </div>

        {/* 막대 차트 */}
        <div style={{ marginBottom: 10 }}>
          {hasChart
            ? <MiniBarChart scores={progress.recentScores} status={progress.status} />
            : <div style={{ height: MAX_H + 2 }} />
          }
        </div>

        {/* 활동 수 + 진행 막대 */}
        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 2, marginBottom: 4 }}>
            <span style={{ fontSize: 17, fontWeight: 700, color: isLow ? 'var(--st-help)' : 'var(--ink)', lineHeight: 1 }}>
              {progress.completedCount}
            </span>
            <span style={{ fontSize: 11.5, color: 'var(--mute)' }}>/{TOTAL_ACTIVITIES} 활동</span>
          </div>
          <div style={{ height: 4, background: 'var(--line)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${Math.min(100, completionPct)}%`,
              background: isLow ? 'var(--st-help)' : 'var(--side)',
              borderRadius: 2,
            }} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── 메인 컴포넌트 ─────────────────────────────────────────
export default function StudentCardGrid({
  classId, students, att, selectedDate,
  filterStatus, sortBy, searchQuery,
  onAttChange, onFilterClear,
}: Props) {
  const absentMap = att[classId]?.[selectedDate] ?? {};

  const sorted = [...students].sort((a, b) =>
    sortBy === 'name' ? a.name.localeCompare(b.name, 'ko') : a.no - b.no,
  );

  const q = searchQuery.trim().toLowerCase();
  const filtered = sorted.filter(s => {
    if (q && !s.name.toLowerCase().includes(q) && !String(s.no).includes(q)) return false;
    if (filterStatus) {
      const prog = getStudentProgress(classId, s);
      if (prog.status !== filterStatus) return false;
    }
    return true;
  });

  if (filtered.length === 0) {
    return (
      <div style={{
        padding: '40px 20px', textAlign: 'center',
        border: '1px dashed var(--line)', borderRadius: 'var(--r-md)',
        color: 'var(--mute)', fontSize: 14,
      }}>
        {filterStatus ? (
          <>
            해당 학생이 없어요.{' '}
            <button
              onClick={onFilterClear}
              style={{ background: 'none', border: 'none', color: 'var(--concept)', cursor: 'pointer', textDecoration: 'underline', fontSize: 14 }}
            >전체 보기</button>
          </>
        ) : '검색 결과가 없어요.'}
      </div>
    );
  }

  return (
    <>
      <style>{`.cr-card:hover .cr-more { opacity: 1 !important; }`}</style>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 12,
      }}>
        {filtered.map(s => {
          const progress = getStudentProgress(classId, s);
          const isAbsent = absentMap[s.id] === 'absent';
          return (
            <StudentCard
              key={s.id}
              student={s}
              progress={progress}
              isAbsent={isAbsent}
              onToggleAtt={() => {
                toggleAbsent(classId, s.id, selectedDate);
                onAttChange();
              }}
            />
          );
        })}
      </div>
    </>
  );
}
