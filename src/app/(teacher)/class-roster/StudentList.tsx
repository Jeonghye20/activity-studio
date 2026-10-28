'use client';

import { useState, useEffect, useRef } from 'react';
import type { ClassRoom, Student, AttendanceRecord, AchievementStatus, ActivityScore, StudentProgress } from '@/types/classRoster';
import { getStudentProgress, TOTAL_ACTIVITIES } from '@/lib/classRosterDummy';
import { toggleAbsent, updateStudent, removeStudent, moveStudent, addStudent, newStudentId } from '@/lib/classRosterStore';

// ── 성취 상태 색·텍스트 ──────────────────────────────────
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

// ── 목록용 미니 막대 차트 (72×24) ───────────────────────
const SM_BAR_W = 14;
const SM_MAX_H = 24;
const SM_GAP   = 1;

function MiniBarSm({ scores, status }: { scores: ActivityScore[]; status: AchievementStatus }) {
  const n = scores.length;
  if (n === 0) return <div style={{ width: 72, height: SM_MAX_H }} />;

  const svgW = n * SM_BAR_W + (n - 1) * SM_GAP;
  const recentStart = Math.max(0, n - 3);
  const barColor = STATUS_COLOR[status];

  const prev3 = n >= 6 ? scores.slice(-6, -3) : null;
  const prev3Avg = prev3 ? prev3.reduce((s, a) => s + a.score, 0) / 3 : null;
  const lineY = prev3Avg !== null ? SM_MAX_H - Math.round((prev3Avg / 100) * SM_MAX_H) : null;

  return (
    <svg width={svgW} height={SM_MAX_H + 2} style={{ display: 'block', overflow: 'visible', flexShrink: 0 }} aria-hidden>
      {scores.map((s, i) => {
        const h = Math.max(2, Math.round((s.score / 100) * SM_MAX_H));
        const x = i * (SM_BAR_W + SM_GAP);
        const y = SM_MAX_H - h + 2;
        return <rect key={i} x={x} y={y} width={SM_BAR_W} height={h} fill={i >= recentStart ? barColor : '#dde1e7'} />;
      })}
      {lineY !== null && (
        <line x1={0} y1={lineY + 2} x2={svgW} y2={lineY + 2} stroke="#9aa3b0" strokeWidth="1" strokeDasharray="3 2" />
      )}
    </svg>
  );
}

// ── 학생 행 ──────────────────────────────────────────────
function StudentRow({
  student, progress, isAbsent,
  classId, otherClasses, selectedDate,
  menuOpen, onToggleMenu, onCloseMenu,
  onAttToggle, onStudentChange, onToast,
}: {
  student: Student;
  progress: StudentProgress;
  isAbsent: boolean;
  classId: string;
  otherClasses: ClassRoom[];
  selectedDate: string;
  menuOpen: boolean;
  onToggleMenu: () => void;
  onCloseMenu: () => void;
  onAttToggle: () => void;
  onStudentChange: () => void;
  onToast: (m: string) => void;
}) {
  const [mode, setMode] = useState<'normal' | 'edit' | 'delete' | 'move'>('normal');
  const [editNo, setEditNo]     = useState(student.no);
  const [editName, setEditName] = useState(student.name);
  const menuRef = useRef<HTMLDivElement>(null);

  // 모드를 normal로 복귀할 때 edit 값도 초기화
  function resetEdit() {
    setEditNo(student.no);
    setEditName(student.name);
    setMode('normal');
  }

  function handleSaveEdit() {
    const name = editName.trim();
    if (!name) return;
    updateStudent(classId, { ...student, no: editNo, name });
    onStudentChange();
    onToast(`${name} 정보를 수정했어요`);
    setMode('normal');
  }

  function handleDelete() {
    removeStudent(classId, student.id);
    onStudentChange();
    onToast(`${student.name} 학생을 명단에서 제거했어요`);
  }

  function handleMove(toClassId: string, toClassName: string) {
    moveStudent(classId, toClassId, student.id);
    onStudentChange();
    onToast(`${student.name} 학생을 ${toClassName}으로 옮겼어요`);
    setMode('normal');
  }

  const completionPct = (progress.completedCount / TOTAL_ACTIVITIES) * 100;
  const isLow = completionPct < 60;

  const cellCls: React.CSSProperties = {
    padding: '0 12px', verticalAlign: 'middle',
    filter: isAbsent && mode === 'normal' ? 'none' : 'none',
  };
  const achieveFilter = isAbsent ? 'grayscale(1) opacity(0.45)' : 'none';

  // ── 편집 행 ──
  if (mode === 'edit') {
    return (
      <tr style={{ height: 52, background: '#f0f6ff', borderBottom: '1px solid var(--line)' }}>
        <td style={{ ...cellCls, width: 56, textAlign: 'right' }}>
          <input
            type="number"
            value={editNo}
            onChange={e => setEditNo(Math.max(1, parseInt(e.target.value) || 1))}
            style={{
              width: 44, height: 30, textAlign: 'right', fontSize: 13,
              border: '1px solid var(--line)', borderRadius: 4, padding: '0 4px',
            }}
          />
        </td>
        <td style={{ ...cellCls }}>
          <input
            type="text"
            value={editName}
            onChange={e => setEditName(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') handleSaveEdit();
              if (e.key === 'Escape') resetEdit();
            }}
            autoFocus
            style={{
              width: '100%', height: 30, fontSize: 14, fontWeight: 700,
              border: '1px solid var(--concept)', borderRadius: 4, padding: '0 8px', outline: 'none',
            }}
          />
        </td>
        <td style={{ ...cellCls, width: 76 }} />
        <td colSpan={3} style={{ ...cellCls, paddingLeft: 16 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={handleSaveEdit}
              style={{
                height: 30, padding: '0 14px', borderRadius: 'var(--r-sm)',
                border: 'none', background: 'var(--side)', color: '#fff',
                fontSize: 13, fontWeight: 700, cursor: 'pointer',
              }}
            >저장</button>
            <button
              onClick={resetEdit}
              style={{
                height: 30, padding: '0 12px', borderRadius: 'var(--r-sm)',
                border: '1px solid var(--line)', background: '#fff',
                fontSize: 13, cursor: 'pointer', color: 'var(--ink-3)',
              }}
            >취소</button>
          </div>
        </td>
      </tr>
    );
  }

  // ── 제거 확인 행 ──
  if (mode === 'delete') {
    return (
      <tr style={{ height: 52, background: 'rgba(224,49,49,0.06)', borderBottom: '1px solid var(--line)' }}>
        <td style={{ ...cellCls, width: 56, textAlign: 'right', color: '#8a94aa', fontSize: 14 }}>
          {String(student.no).padStart(2, '0')}
        </td>
        <td style={{ ...cellCls, fontWeight: 700 }}>{student.name}</td>
        <td style={{ ...cellCls, width: 76 }} />
        <td colSpan={3} style={{ ...cellCls, paddingLeft: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 13, color: 'var(--ink)' }}>명단에서 제거할까요?</span>
            <button
              onClick={() => setMode('normal')}
              style={{
                height: 30, padding: '0 12px', borderRadius: 'var(--r-sm)',
                border: '1px solid var(--line)', background: '#fff',
                fontSize: 13, cursor: 'pointer', color: 'var(--ink-3)',
              }}
            >취소</button>
            <button
              onClick={handleDelete}
              style={{
                height: 30, padding: '0 14px', borderRadius: 'var(--r-sm)',
                border: 'none', background: 'var(--st-help)', color: '#fff',
                fontSize: 13, fontWeight: 700, cursor: 'pointer',
              }}
            >제거</button>
          </div>
        </td>
      </tr>
    );
  }

  // ── 반 이동 선택 행 ──
  if (mode === 'move') {
    return (
      <tr style={{ height: 52, background: '#f0f6ff', borderBottom: '1px solid var(--line)' }}>
        <td style={{ ...cellCls, width: 56, textAlign: 'right', color: '#8a94aa', fontSize: 14 }}>
          {String(student.no).padStart(2, '0')}
        </td>
        <td style={{ ...cellCls, fontWeight: 700 }}>{student.name}</td>
        <td style={{ ...cellCls, width: 76 }} />
        <td colSpan={3} style={{ ...cellCls, paddingLeft: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 13, color: 'var(--ink)', flexShrink: 0 }}>이동할 반:</span>
            {otherClasses.map(c => (
              <button
                key={c.id}
                onClick={() => handleMove(c.id, c.name)}
                style={{
                  height: 30, padding: '0 12px', borderRadius: 'var(--r-sm)',
                  border: '1px solid var(--concept)', background: '#fff',
                  color: 'var(--concept)', fontSize: 13, cursor: 'pointer',
                }}
              >{c.name}</button>
            ))}
            {otherClasses.length === 0 && (
              <span style={{ fontSize: 13, color: 'var(--mute)' }}>다른 반이 없어요</span>
            )}
            <button
              onClick={() => setMode('normal')}
              style={{
                height: 30, padding: '0 12px', borderRadius: 'var(--r-sm)',
                border: '1px solid var(--line)', background: '#fff',
                fontSize: 13, cursor: 'pointer', color: 'var(--mute)',
              }}
            >취소</button>
          </div>
        </td>
      </tr>
    );
  }

  // ── 일반 행 ──
  return (
    <tr
      className="cr-list-row"
      style={{
        height: 52,
        background: isAbsent ? 'rgba(224,49,49,0.05)' : '#fff',
        borderBottom: '1px solid var(--line)',
      }}
    >
      {/* 번호 */}
      <td style={{
        ...cellCls, width: 56, textAlign: 'right',
        fontSize: 14, fontWeight: 300, color: '#8a94aa',
      }}>
        {String(student.no).padStart(2, '0')}
      </td>

      {/* 이름 */}
      <td style={{ ...cellCls, width: 180, fontSize: 15.5, fontWeight: 700, color: 'var(--ink)' }}>
        {student.name}
      </td>

      {/* 출결 */}
      <td style={{ ...cellCls, width: 90, textAlign: 'center' }}>
        <button
          onClick={onAttToggle}
          style={{
            height: 28, padding: '0 10px', borderRadius: 14,
            border: isAbsent ? 'none' : '1px solid #d4e8d4',
            background: isAbsent ? 'var(--st-help)' : '#ebfbee',
            color: isAbsent ? '#fff' : '#2b8a3e',
            fontSize: 12, fontWeight: 700, cursor: 'pointer',
          }}
        >{isAbsent ? '결석' : '출석'}</button>
      </td>

      {/* 성취 변화 — 남는 폭 전부 */}
      <td style={{ ...cellCls }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, filter: achieveFilter }}>
          <span style={{
            fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap',
            color: (progress.status === 'new' || progress.status === 'insufficient')
              ? 'var(--mute)' : STATUS_COLOR[progress.status],
          }}>
            {getStatusText(progress.status, progress.statusDelta)}
          </span>
          <MiniBarSm scores={progress.recentScores} status={progress.status} />
        </div>
      </td>

      {/* 활동 */}
      <td style={{ ...cellCls, width: 160, filter: achieveFilter }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 2, marginBottom: 3 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: isLow ? 'var(--st-help)' : 'var(--ink)', lineHeight: 1 }}>
              {progress.completedCount}
            </span>
            <span style={{ fontSize: 11, color: 'var(--mute)' }}>/{TOTAL_ACTIVITIES}</span>
          </div>
          <div style={{ height: 4, background: 'var(--line)', borderRadius: 2, overflow: 'hidden', width: '80%' }}>
            <div style={{
              height: '100%',
              width: `${Math.min(100, completionPct)}%`,
              background: isLow ? 'var(--st-help)' : 'var(--side)',
              borderRadius: 2,
            }} />
          </div>
        </div>
      </td>

      {/* 관리 */}
      <td style={{ ...cellCls, width: 44, textAlign: 'center' }}>
        <div className="cr-list-more-wrap" style={{ position: 'relative' }} ref={menuRef}>
          <button
            className="cr-list-more"
            onClick={() => onToggleMenu()}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 18, color: 'var(--mute)', padding: '0 4px',
              lineHeight: 1, letterSpacing: 1,
            }}
            aria-label="더보기"
          >⋯</button>

          {menuOpen && (
            <div style={{
              position: 'absolute', right: 0, top: '100%', zIndex: 200,
              background: '#fff', border: '1px solid var(--line)',
              borderRadius: 8, boxShadow: '0 4px 20px rgba(0,0,0,0.13)',
              minWidth: 160, overflow: 'hidden',
            }}>
              {[
                { label: '번호·이름 고치기', action: () => { setMode('edit'); onCloseMenu(); } },
                { label: '다른 반으로 옮기기', action: () => { setMode('move'); onCloseMenu(); } },
              ].map(({ label, action }) => (
                <button
                  key={label}
                  onClick={action}
                  style={{
                    display: 'block', width: '100%', textAlign: 'left',
                    background: 'none', border: 'none', cursor: 'pointer',
                    padding: '10px 16px', fontSize: 13.5, color: 'var(--ink)',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--canvas)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                >{label}</button>
              ))}
              <div style={{ height: 1, background: 'var(--line)', margin: '2px 0' }} />
              <button
                onClick={() => { setMode('delete'); onCloseMenu(); }}
                style={{
                  display: 'block', width: '100%', textAlign: 'left',
                  background: 'none', border: 'none', cursor: 'pointer',
                  padding: '10px 16px', fontSize: 13.5, color: 'var(--st-help)', fontWeight: 600,
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(224,49,49,0.06)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'none')}
              >명단에서 제거</button>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
}

// ── 메인 컴포넌트 ─────────────────────────────────────────
interface Props {
  classId: string;
  students: Student[];
  otherClasses: ClassRoom[];
  att: AttendanceRecord;
  selectedDate: string;
  filterStatus: AchievementStatus | null;
  sortBy: 'no' | 'name';
  onSortChange: (s: 'no' | 'name') => void;
  searchQuery: string;
  onAttChange: () => void;
  onFilterClear: () => void;
  addRowOpen: boolean;
  onAddRowClose: () => void;
  onStudentChange: () => void;
  onToast: (m: string) => void;
}

export default function StudentList({
  classId, students, otherClasses, att, selectedDate,
  filterStatus, sortBy, onSortChange, searchQuery,
  onAttChange, onFilterClear, addRowOpen, onAddRowClose, onStudentChange, onToast,
}: Props) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const absentMap = att[classId]?.[selectedDate] ?? {};

  // 바깥 클릭 시 메뉴 닫기 (mousedown: 버튼 onClick보다 먼저 실행되지 않도록)
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!(e.target as Element).closest('.cr-list-more-wrap')) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

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

  return (
    <>
      <style>{`
        .cr-list-row:hover { background: var(--canvas) !important; }
        .cr-list-row:hover .cr-list-more { opacity: 0.4; }
        .cr-list-more { opacity: 0; transition: opacity 0.1s; }
        .cr-list-more:hover { opacity: 1 !important; }
      `}</style>

      <div style={{ border: '1px solid var(--line)', borderRadius: 'var(--r-md)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          {/* 머리글 */}
          <thead>
            <tr style={{ background: 'var(--canvas)', borderBottom: '1px solid var(--line)' }}>
              <th style={{ width: 56, padding: '0 12px', height: 40, textAlign: 'right' }}>
                <button
                  onClick={() => onSortChange('no')}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontSize: 12.5, fontWeight: sortBy === 'no' ? 700 : 500,
                    color: sortBy === 'no' ? 'var(--side)' : 'var(--ink-3)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  번호{sortBy === 'no' ? ' ▲' : ''}
                </button>
              </th>
              <th style={{ width: 180, padding: '0 12px', height: 40, textAlign: 'left' }}>
                <button
                  onClick={() => onSortChange('name')}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontSize: 12.5, fontWeight: sortBy === 'name' ? 700 : 500,
                    color: sortBy === 'name' ? 'var(--side)' : 'var(--ink-3)',
                  }}
                >
                  이름{sortBy === 'name' ? ' ▲' : ''}
                </button>
              </th>
              <th style={{ width: 90, padding: '0 12px', height: 40, textAlign: 'center', fontSize: 12.5, fontWeight: 500, color: 'var(--ink-3)' }}>출결</th>
              <th style={{ padding: '0 12px', height: 40, textAlign: 'left', fontSize: 12.5, fontWeight: 500, color: 'var(--ink-3)' }}>성취 변화</th>
              <th style={{ width: 160, padding: '0 12px', height: 40, textAlign: 'left', fontSize: 12.5, fontWeight: 500, color: 'var(--ink-3)' }}>활동</th>
              <th style={{ width: 44, padding: 0 }} />
            </tr>
          </thead>

          <tbody>
            {/* 학생 추가 행 */}
            {addRowOpen && (
              <AddStudentTableRow
                classId={classId}
                nextNo={students.length > 0 ? Math.max(...students.map(s => s.no)) + 1 : 1}
                onAdded={(name) => { onStudentChange(); onToast(`${name} 학생을 추가했어요`); onAddRowClose(); }}
                onClose={onAddRowClose}
              />
            )}

            {filtered.length === 0 && !addRowOpen ? (
              <tr>
                <td colSpan={6} style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--mute)', fontSize: 14 }}>
                  {filterStatus ? (
                    <>
                      해당 학생이 없어요.{' '}
                      <button
                        onClick={onFilterClear}
                        style={{ background: 'none', border: 'none', color: 'var(--concept)', cursor: 'pointer', textDecoration: 'underline', fontSize: 14 }}
                      >전체 보기</button>
                    </>
                  ) : '검색 결과가 없어요.'}
                </td>
              </tr>
            ) : (
              filtered.map(s => {
                const progress = getStudentProgress(classId, s);
                const isAbsent = absentMap[s.id] === 'absent';
                return (
                  <StudentRow
                    key={s.id}
                    student={s}
                    progress={progress}
                    isAbsent={isAbsent}
                    classId={classId}
                    otherClasses={otherClasses}
                    selectedDate={selectedDate}
                    menuOpen={openMenuId === s.id}
                    onToggleMenu={() => setOpenMenuId(prev => prev === s.id ? null : s.id)}
                    onCloseMenu={() => setOpenMenuId(null)}
                    onAttToggle={() => {
                      toggleAbsent(classId, s.id, selectedDate);
                      onAttChange();
                    }}
                    onStudentChange={onStudentChange}
                    onToast={onToast}
                  />
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

// ── 학생 추가 행 (테이블 첫 번째 행으로 삽입) ─────────────
function AddStudentTableRow({
  classId, nextNo, onAdded, onClose,
}: {
  classId: string;
  nextNo: number;
  onAdded: (name: string) => void;
  onClose: () => void;
}) {
  const [no, setNo]     = useState(nextNo);
  const [name, setName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function handleAdd() {
    const trimmed = name.trim();
    if (!trimmed) return;
    addStudent(classId, { id: newStudentId(classId), no, name: trimmed });
    onAdded(trimmed);
  }

  return (
    <tr style={{ height: 52, background: '#f0f6ff', borderBottom: '1px solid var(--concept)' }}>
      <td style={{ width: 56, padding: '0 12px', textAlign: 'right' }}>
        <input
          type="number"
          value={no}
          onChange={e => setNo(Math.max(1, parseInt(e.target.value) || 1))}
          style={{
            width: 44, height: 30, textAlign: 'right', fontSize: 13,
            border: '1px solid var(--line)', borderRadius: 4, padding: '0 4px',
          }}
        />
      </td>
      <td style={{ padding: '0 12px' }}>
        <input
          ref={inputRef}
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="학생 이름"
          onKeyDown={e => {
            if (e.key === 'Enter') handleAdd();
            if (e.key === 'Escape') onClose();
          }}
          style={{
            width: '100%', height: 30, fontSize: 14, fontWeight: 700,
            border: '1px solid var(--concept)', borderRadius: 4, padding: '0 8px', outline: 'none',
          }}
        />
      </td>
      <td style={{ width: 76 }} />
      <td colSpan={3} style={{ padding: '0 12px' }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={handleAdd}
            style={{
              height: 30, padding: '0 14px', borderRadius: 'var(--r-sm)',
              border: 'none', background: 'var(--side)', color: '#fff',
              fontSize: 13, fontWeight: 700, cursor: 'pointer',
            }}
          >추가</button>
          <button
            onClick={onClose}
            style={{
              height: 30, padding: '0 12px', borderRadius: 'var(--r-sm)',
              border: '1px solid var(--line)', background: '#fff',
              fontSize: 13, cursor: 'pointer', color: 'var(--ink-3)',
            }}
          >취소</button>
        </div>
      </td>
    </tr>
  );
}
