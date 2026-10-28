'use client';

import { useMemo } from 'react';
import type { Student, AttendanceRecord, AchievementStatus } from '@/types/classRoster';
import { getStudentProgress, TOTAL_ACTIVITIES, COMPLETION_RATE } from '@/lib/classRosterDummy';

interface Props {
  classId: string;
  students: Student[];
  att: AttendanceRecord;
  selectedDate: string;
  todayStr: string;
  onDateChange: (date: string) => void;
  filterStatus: AchievementStatus | null;
  onFilterChange: (s: AchievementStatus | null) => void;
}

function pad2(n: number) { return String(n).padStart(2, '0'); }

function formatDateKo(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  return `${m}월 ${d}일 (${days[date.getDay()]})`;
}

function prevWeekday(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  do { date.setDate(date.getDate() - 1); } while (date.getDay() === 0 || date.getDay() === 6);
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

function nextWeekday(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  do { date.setDate(date.getDate() + 1); } while (date.getDay() === 0 || date.getDay() === 6);
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

const FILTER_OPTIONS = [
  { status: 'rising'  as const, label: '↗ 향상' },
  { status: 'steady'  as const, label: '→ 유지' },
  { status: 'falling' as const, label: '↘ 하락' },
] as const;

const FILTER_STATUS_LABEL: Record<string, string> = {
  rising: '향상', steady: '유지', falling: '하락',
};

export default function SummaryBand({
  classId, students, att, selectedDate, todayStr,
  onDateChange, filterStatus, onFilterChange,
}: Props) {
  const allProgress = useMemo(
    () => students.map(s => getStudentProgress(classId, s)),
    [classId, students.length], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const absentMap  = att[classId]?.[selectedDate] ?? {};
  const absentStudents = students.filter(s => absentMap[s.id] === 'absent');
  const presentCount = students.length - absentStudents.length;
  const absentCount  = absentStudents.length;

  const avgCompletion = allProgress.length > 0
    ? allProgress.reduce((sum, p) => sum + p.completedCount, 0) / allProgress.length
    : 0;
  const completionPct = (avgCompletion / TOTAL_ACTIVITIES) * 100;
  const lowCount = allProgress.filter(p => p.completedCount < TOTAL_ACTIVITIES * COMPLETION_RATE).length;

  const counts = { rising: 0, steady: 0, falling: 0, other: 0 };
  allProgress.forEach(p => {
    if      (p.status === 'rising')  counts.rising++;
    else if (p.status === 'steady')  counts.steady++;
    else if (p.status === 'falling') counts.falling++;
    else                             counts.other++;
  });
  const n = students.length || 1;
  const risingPct  = (counts.rising  / n) * 100;
  const steadyPct  = (counts.steady  / n) * 100;
  const fallingPct = (counts.falling / n) * 100;
  const otherPct   = (counts.other   / n) * 100;

  const navBtn: React.CSSProperties = {
    width: 24, height: 24, borderRadius: 6,
    border: '1px solid var(--line)', background: '#fff',
    cursor: 'pointer', fontSize: 15, lineHeight: 1,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: 'var(--ink)', padding: 0, flexShrink: 0,
  };

  const sec: React.CSSProperties = { flex: 1, padding: '16px 20px' };

  return (
    <div style={{
      display: 'flex',
      border: '1.5px solid var(--side)',
      borderRadius: 'var(--r-md)',
      overflow: 'hidden',
      background: '#fff',
      marginBottom: 20,
    }}>

      {/* ── 오늘 출결 ── */}
      <div style={{ ...sec, borderRight: '1px solid var(--line)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>오늘 출결</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <button onClick={() => onDateChange(prevWeekday(selectedDate))} style={navBtn} aria-label="이전 날">‹</button>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)', whiteSpace: 'nowrap', textAlign: 'center' }}>
              {formatDateKo(selectedDate)}
            </span>
            <button
              onClick={() => onDateChange(nextWeekday(selectedDate))}
              disabled={selectedDate >= todayStr}
              style={{ ...navBtn, opacity: selectedDate >= todayStr ? 0.3 : 1, cursor: selectedDate >= todayStr ? 'default' : 'pointer' }}
              aria-label="다음 날"
            >›</button>
            {selectedDate !== todayStr && (
              <button
                onClick={() => onDateChange(todayStr)}
                style={{
                  height: 22, padding: '0 8px',
                  border: '1px solid var(--concept)', borderRadius: 11,
                  background: '#fff', color: 'var(--concept)',
                  fontSize: 11.5, fontWeight: 600, cursor: 'pointer', flexShrink: 0,
                }}
              >오늘</button>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 16, marginBottom: 6, alignItems: 'baseline' }}>
          <div>
            <span style={{ fontSize: 38, fontWeight: 900, lineHeight: 1, color: 'var(--ink)' }}>{presentCount}</span>
            <span style={{ fontSize: 13, color: 'var(--mute)', marginLeft: 4 }}>출석</span>
          </div>
          <div>
            <span style={{ fontSize: 38, fontWeight: 900, lineHeight: 1, color: absentCount > 0 ? 'var(--st-help)' : 'var(--mute)' }}>{absentCount}</span>
            <span style={{ fontSize: 13, color: 'var(--mute)', marginLeft: 4 }}>결석</span>
          </div>
        </div>

        <div style={{ fontSize: 12, color: 'var(--mute)', lineHeight: 1.5 }}>
          {absentCount > 0 ? `결석 ${absentStudents.map(s => s.name).join(', ')}` : '전원 출석'}
        </div>
      </div>

      {/* ── 활동 완료 ── */}
      <div style={{ ...sec, borderRight: '1px solid var(--line)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>활동 완료</span>
          <span style={{ fontSize: 11, color: 'var(--mute)' }}>배포한 활동 {TOTAL_ACTIVITIES}개</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 10 }}>
          <span style={{ fontSize: 38, fontWeight: 900, lineHeight: 1, color: 'var(--ink)' }}>
            {avgCompletion.toFixed(1)}
          </span>
          <span style={{ fontSize: 13, color: 'var(--mute)' }}>개 평균</span>
        </div>

        <div style={{ height: 6, background: 'var(--line)', borderRadius: 3, overflow: 'hidden', marginBottom: 8 }}>
          <div style={{
            height: '100%',
            width: `${Math.min(100, completionPct)}%`,
            background: completionPct < COMPLETION_RATE * 100 ? 'var(--st-help)' : 'var(--side)',
            borderRadius: 3,
            transition: 'width 0.3s',
          }} />
        </div>

        <div style={{ fontSize: 12, color: lowCount > 0 ? 'var(--st-help)' : 'var(--mute)' }}>
          {Math.round(COMPLETION_RATE * 100)}% 미만 {lowCount}명
        </div>
      </div>

      {/* ── 성취 변화 ── */}
      <div style={{ ...sec }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>성취 변화</span>
          <span style={{ fontSize: 11, color: 'var(--mute)' }}>최근 3활동 vs 이전 3활동</span>
        </div>

        <div style={{
          display: 'flex', height: 6, borderRadius: 3, overflow: 'hidden',
          marginBottom: 12, background: 'var(--line)',
        }}>
          <div style={{ width: `${risingPct}%`,  background: '#2b8a3e', flexShrink: 0 }} />
          <div style={{ width: `${steadyPct}%`,  background: '#adb5bd', flexShrink: 0 }} />
          <div style={{ width: `${fallingPct}%`, background: '#e8730c', flexShrink: 0 }} />
          <div style={{ width: `${otherPct}%`,   background: '#dde1e7', flexShrink: 0 }} />
        </div>

        {/* 필터 버튼 3개 고정 */}
        <div style={{ display: 'flex', gap: 5 }}>
          {FILTER_OPTIONS.map(({ status, label }) => {
            const isActive = filterStatus === status;
            const count = counts[status];
            return (
              <button
                key={status}
                onClick={() => onFilterChange(isActive ? null : status)}
                style={{
                  height: 32, padding: '0 12px', borderRadius: 20,
                  border: `1px solid ${isActive ? 'var(--side)' : 'var(--line)'}`,
                  background: isActive ? 'var(--side)' : '#fff',
                  color: isActive ? '#fff' : 'var(--ink-3)',
                  fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  transition: 'all 0.12s',
                }}
              >
                {label} <span style={{ fontWeight: 800 }}>{count}</span>명
              </button>
            );
          })}
        </div>

        {/* 필터 상태 텍스트 */}
        {filterStatus !== null && (
          <div style={{ marginTop: 8, fontSize: 11.5, color: 'var(--mute)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <span>{FILTER_STATUS_LABEL[filterStatus] ?? filterStatus} 학생만 보는 중</span>
            <span>·</span>
            <button
              onClick={() => onFilterChange(null)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11.5, color: 'var(--concept)', padding: 0, textDecoration: 'underline' }}
            >전체 보기</button>
          </div>
        )}
      </div>
    </div>
  );
}
