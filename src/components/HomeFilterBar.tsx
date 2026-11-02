'use client';

import { useState, useEffect, useRef } from 'react';
import { TYPES, ORDER, type TypeKey } from '@/lib/types';

export interface FilterValues {
  school: string;
  grade: string;
  subject: string;
  type: string;
}

const DEFAULT_VALUES: FilterValues = {
  school: '중학교',
  grade: '전체 학년',
  subject: '정보',
  type: '전체',
};

const SCHOOLS = ['초등학교', '중학교', '고등학교'] as const;

const GRADE_OPTS: Record<string, string[]> = {
  '초등학교': ['1학년', '2학년', '3학년', '4학년', '5학년', '6학년'],
  '중학교':   ['1학년', '2학년', '3학년'],
  '고등학교': ['1학년', '2학년', '3학년'],
};

const SUBJECT_OPTS: Array<{ label: string; disabled: boolean; divider?: true }> = [
  { label: '정보',     disabled: false },
  { label: '',         disabled: true,  divider: true },
  { label: '수학',     disabled: true },
  { label: '과학',     disabled: true },
  { label: '사회',     disabled: true },
  { label: '기술·가정', disabled: true },
  { label: '도덕·윤리', disabled: true },
  { label: '진로·교양', disabled: true },
];

type OpenKey = 'school' | 'grade' | 'subject' | 'type' | null;

/* ── SVG ── */
function ChevronIcon({ flip }: { flip: boolean }) {
  return (
    <svg
      width="10" height="10" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="3"
      style={{ flexShrink: 0, transition: 'transform .15s', transform: flip ? 'rotate(180deg)' : 'none' }}
      aria-hidden="true"
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M2.5 7l3.5 3.5 5.5-6" stroke="#12b886" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ResetIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
      <path d="M11 2A5 5 0 102 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M11 2v3.5H7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ── 드롭다운 항목 ── */
interface DropItemProps {
  label: string;
  selected: boolean;
  disabled?: boolean;
  dot?: string;
  onClick?: () => void;
}

function DropItem({ label, selected, disabled, dot, onClick }: DropItemProps) {
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      onMouseEnter={e => { if (!disabled) (e.currentTarget as HTMLElement).style.background = '#f4f6fb'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
      style={{
        display: 'flex', alignItems: 'center', gap: 7,
        width: '100%', height: 36, padding: '0 10px',
        border: 'none', borderRadius: 8, background: 'transparent',
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontSize: 13.5, fontWeight: selected ? 800 : 500,
        color: disabled ? '#a3abbb' : 'var(--ink)',
        textAlign: 'left',
      }}
    >
      {dot && <span style={{ width: 8, height: 8, borderRadius: 2, background: dot, flexShrink: 0 }} />}
      <span style={{ flex: 1 }}>{label}</span>
      {disabled && <span style={{ fontSize: 11, color: '#a3abbb', fontWeight: 700, flexShrink: 0 }}>준비 중</span>}
      {selected && !disabled && <CheckIcon />}
    </button>
  );
}

function Divider() {
  return <div style={{ height: 1, background: 'var(--line)', margin: '3px 6px' }} />;
}

/* ── 메인 컴포넌트 ── */
interface Props {
  initialSchool?: string;
  initialSubject?: string;
  onChange?: (values: FilterValues) => void;
}

export default function HomeFilterBar({
  initialSchool = DEFAULT_VALUES.school,
  initialSubject = DEFAULT_VALUES.subject,
  onChange,
}: Props) {
  const [school,  setSchool]  = useState(initialSchool);
  const [grade,   setGrade]   = useState(DEFAULT_VALUES.grade);
  const [subject, setSubject] = useState(initialSubject);
  const [type,    setType]    = useState(DEFAULT_VALUES.type);
  const [open,    setOpen]    = useState<OpenKey>(null);
  const barRef = useRef<HTMLDivElement>(null);

  const isDefault =
    school  === DEFAULT_VALUES.school  &&
    grade   === DEFAULT_VALUES.grade   &&
    subject === DEFAULT_VALUES.subject &&
    type    === DEFAULT_VALUES.type;

  /* 외부 클릭 닫기 */
  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (barRef.current && !barRef.current.contains(e.target as Node)) setOpen(null);
    }
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  /* Esc 닫기 */
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') setOpen(null); }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  /* onChange 헬퍼 */
  function fire(patch: Partial<FilterValues>) {
    onChange?.({ school, grade, subject, type, ...patch });
  }

  function pickSchool(s: string) {
    const list = GRADE_OPTS[s] ?? [];
    const newGrade = grade !== DEFAULT_VALUES.grade && !list.includes(grade) ? DEFAULT_VALUES.grade : grade;
    setSchool(s); setGrade(newGrade); setOpen(null);
    fire({ school: s, grade: newGrade });
  }
  function pickGrade(g: string)   { setGrade(g);   setOpen(null); fire({ grade: g }); }
  function pickSubject(s: string) { setSubject(s); setOpen(null); fire({ subject: s }); }
  function pickType(t: string)    { setType(t);    setOpen(null); fire({ type: t }); }

  function reset() {
    setSchool(DEFAULT_VALUES.school);
    setGrade(DEFAULT_VALUES.grade);
    setSubject(DEFAULT_VALUES.subject);
    setType(DEFAULT_VALUES.type);
    setOpen(null);
    onChange?.(DEFAULT_VALUES);
  }

  /* 스타일 헬퍼 */
  function dropBtnStyle(key: OpenKey, val: string, def: string, minW: number): React.CSSProperties {
    const modified = val !== def;
    const isOpen   = open === key;
    return {
      display: 'inline-flex', alignItems: 'center', justifyContent: 'space-between', gap: 6,
      height: 36, padding: '0 10px', minWidth: minW, borderRadius: 10, boxSizing: 'border-box',
      border: modified
        ? '1.5px solid #ffd43b'
        : `1.5px solid ${isOpen ? 'var(--ink)' : 'var(--line)'}`,
      background: modified ? '#fff9db' : '#fff',
      fontSize: 13.5, fontWeight: 700, color: 'var(--ink)',
      cursor: 'pointer', whiteSpace: 'nowrap',
    };
  }

  const dropListStyle: React.CSSProperties = {
    position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 200,
    background: '#fff', border: '1px solid var(--line)',
    borderRadius: 12, boxShadow: '0 4px 16px rgba(0,0,0,.12)',
    padding: 6, minWidth: 150,
  };

  const typeColor = type !== '전체' ? TYPES[type as TypeKey]?.c : undefined;

  return (
    <div
      ref={barRef}
      style={{
        display: 'flex', alignItems: 'center', flexWrap: 'nowrap', gap: 22,
        background: '#fff', border: '1px solid var(--line)',
        borderRadius: 16, padding: '12px 18px', boxSizing: 'border-box',
      }}
    >
      {/* 학교급 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
        <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--ink-3)', whiteSpace: 'nowrap' }}>학교급</span>
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            style={dropBtnStyle('school', school, DEFAULT_VALUES.school, 110)}
            onClick={() => setOpen(v => v === 'school' ? null : 'school')}
          >
            <span>{school}</span>
            <ChevronIcon flip={open === 'school'} />
          </button>
          {open === 'school' && (
            <div style={dropListStyle}>
              {SCHOOLS.map(s => (
                <DropItem key={s} label={s} selected={school === s} onClick={() => pickSchool(s)} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 학년 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
        <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--ink-3)', whiteSpace: 'nowrap' }}>학년</span>
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            style={dropBtnStyle('grade', grade, DEFAULT_VALUES.grade, 112)}
            onClick={() => setOpen(v => v === 'grade' ? null : 'grade')}
          >
            <span>{grade}</span>
            <ChevronIcon flip={open === 'grade'} />
          </button>
          {open === 'grade' && (
            <div style={dropListStyle}>
              <DropItem label="전체 학년" selected={grade === DEFAULT_VALUES.grade} onClick={() => pickGrade(DEFAULT_VALUES.grade)} />
              <Divider />
              {(GRADE_OPTS[school] ?? []).map(g => (
                <DropItem key={g} label={g} selected={grade === g} onClick={() => pickGrade(g)} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 과목 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
        <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--ink-3)', whiteSpace: 'nowrap' }}>과목</span>
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            style={dropBtnStyle('subject', subject, DEFAULT_VALUES.subject, 110)}
            onClick={() => setOpen(v => v === 'subject' ? null : 'subject')}
          >
            <span>{subject}</span>
            <ChevronIcon flip={open === 'subject'} />
          </button>
          {open === 'subject' && (
            <div style={{ ...dropListStyle, minWidth: 170 }}>
              {SUBJECT_OPTS.map((s, i) =>
                s.divider ? (
                  <Divider key={`div-${i}`} />
                ) : (
                  <DropItem
                    key={s.label} label={s.label}
                    selected={subject === s.label} disabled={s.disabled}
                    onClick={s.disabled ? undefined : () => pickSubject(s.label)}
                  />
                )
              )}
            </div>
          )}
        </div>
      </div>

      {/* 유형 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
        <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--ink-3)', whiteSpace: 'nowrap' }}>유형</span>
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            style={dropBtnStyle('type', type, DEFAULT_VALUES.type, 132)}
            onClick={() => setOpen(v => v === 'type' ? null : 'type')}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              {typeColor && <span style={{ width: 8, height: 8, borderRadius: 2, background: typeColor, flexShrink: 0 }} />}
              {type === '전체' ? '전체' : (TYPES[type as TypeKey]?.name ?? type)}
            </span>
            <ChevronIcon flip={open === 'type'} />
          </button>
          {open === 'type' && (
            <div style={{ ...dropListStyle, minWidth: 180 }}>
              <DropItem label="전체" selected={type === '전체'} onClick={() => pickType('전체')} />
              <Divider />
              {ORDER.map(k => (
                <DropItem
                  key={k} label={TYPES[k].name}
                  dot={TYPES[k].c} selected={type === k}
                  onClick={() => pickType(k)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 오른쪽 끝 밀기 */}
      <div style={{ flex: 1 }} aria-hidden="true" />

      {/* 초기화 */}
      {!isDefault && (
        <button
          type="button"
          onClick={reset}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--ink)'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--ink-3)'}
          style={{
            display: 'flex', alignItems: 'center', gap: 5,
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 12.5, fontWeight: 700, color: 'var(--ink-3)',
            padding: '4px 6px', borderRadius: 8, whiteSpace: 'nowrap',
          }}
        >
          <ResetIcon />
          초기화
        </button>
      )}
    </div>
  );
}
