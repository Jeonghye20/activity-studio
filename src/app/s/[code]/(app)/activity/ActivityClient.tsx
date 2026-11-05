'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import OrderBlock from './blocks/OrderBlock';
import MultiBlock from './blocks/MultiBlock';
import type { Worksheet, Block, CurriculumUnit } from '@/types/worksheet';
import { TYPE_COLORS, TYPE_LABELS, DEMO_TODO } from '@/lib/studentDemoData';

const PURPLE = '#6741d9';

type Answers = Record<string, unknown>;

/* ── 시간 포맷 ─────────────────────────────────────────── */
function formatSubmitTime(d: Date): string {
  const m = d.getMonth() + 1;
  const day = d.getDate();
  const h = d.getHours();
  const min = String(d.getMinutes()).padStart(2, '0');
  const ampm = h < 12 ? '오전' : '오후';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${m}월 ${day}일 ${ampm} ${h12}:${min}`;
}

/* ── 헤로 썸네일 — ws.js DEVICE_ART[1] 그대로 ── */
function SensorIllustration() {
  return (
    <svg viewBox="0 0 190 130" width="190" height="130" aria-hidden="true">
      {/* 배경 */}
      <rect width="190" height="130" fill="#e8ecf4" rx="14"/>
      {/* ws.js DEVICE_ART[1] — viewBox 220×160 → scale(0.68) translate(20,8) */}
      <g transform="translate(20,8) scale(0.68)">
        <path d="M69 96h82l-12 54H81z" fill="#d7a075"/>
        <ellipse cx="110" cy="96" rx="42" ry="9" fill="#805c42"/>
        <path d="M110 95V39" stroke="#477e51" strokeWidth="5"/>
        <path d="M109 69Q68 73 68 37q38-1 41 32M111 54q4-36 40-33-1 34-40 33" fill="#73a96c"/>
        <rect x="159" y="102" width="25" height="33" rx="4" fill="#7da9b4"/>
        <path d="M172 102V80h-36V96" stroke="#658d98" strokeWidth="4" fill="none"/>
        <rect x="61" y="83" width="8" height="35" rx="3" fill="#55836e"/>
        <path d="M65 83V72h-20" stroke="#55836e" strokeWidth="3" fill="none"/>
        <path d="M136 100l-3 7m3 0-3 7" stroke="#62adcb" strokeWidth="3"/>
        <path d="M50 154h140" stroke="#c9d8bd" strokeWidth="4"/>
      </g>
    </svg>
  );
}

/* ── 블록 렌더러들 ─────────────────────────────────────── */

interface BlockProps<V = unknown> {
  block: Block;
  savedValue?: V;
  onAnswer: (v: unknown) => void;
}

function ChoiceBlock({ block, savedValue, onAnswer }: BlockProps<number>) {
  const options = (block.options as string[]) ?? [];
  const isCol = options.some(o => o.length > 14);
  const [selected, setSelected] = useState<number | null>(() =>
    typeof savedValue === 'number' ? savedValue : null
  );
  function pick(i: number) { setSelected(i); onAnswer(i); }
  return (
    <div style={
      isCol
        ? { display: 'flex', flexDirection: 'column', gap: 8 }
        : { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }
    }>
      {options.map((opt, i) => {
        const on = selected === i;
        return (
          <button
            key={i} onClick={() => pick(i)}
            style={{
              minHeight: 65, borderRadius: 10,
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 14px',
              fontSize: 15, fontWeight: 600, color: '#1f2a44',
              background: on ? '#e7eef8' : '#fff',
              border: on ? '1.5px solid #1f2a44' : '1px solid #cfd6df',
              cursor: 'pointer', textAlign: 'left', width: '100%',
            }}
          >
            <span style={{
              width: 27, height: 27, borderRadius: '50%', flexShrink: 0,
              background: on ? '#1f2a44' : 'transparent',
              border: on ? 'none' : '1px solid #cfd6df',
              color: on ? '#fff' : '#6b7383',
              fontSize: 13, fontWeight: 700,
              display: 'inline-grid', placeItems: 'center',
            }}>
              {i + 1}
            </span>
            {opt}
          </button>
        );
      })}
    </div>
  );
}

function WriteBlock({ block, savedValue, onAnswer }: BlockProps<string>) {
  const [val, setVal] = useState(() => (typeof savedValue === 'string' ? savedValue : ''));
  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setVal(e.target.value);
    onAnswer(e.target.value);
  }
  const keywords = (block.keywords as string[]) ?? [];
  return (
    <div>
      <textarea
        value={val}
        onChange={handleChange}
        placeholder="여기에 써 보세요"
        rows={3}
        style={{
          width: '100%', borderRadius: 12, border: '1.5px solid #e3e7ef',
          padding: '12px 16px', fontSize: 15, lineHeight: 1.6,
          resize: 'vertical', outline: 'none', boxSizing: 'border-box',
          fontFamily: 'inherit', color: '#172036',
        }}
      />
      {keywords.length > 0 && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
          {keywords.map(kw => {
            const present = val.includes(kw);
            return (
              <span key={kw} style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                padding: '4px 10px', borderRadius: 20,
                fontSize: 12, fontWeight: 700,
                background: present ? '#dcfce7' : '#f3f4f6',
                color: present ? '#16a34a' : '#5d6880',
                border: `1px solid ${present ? '#86efac' : '#e5e7eb'}`,
                transition: 'all .2s',
              }}>
                {present && '✓ '}{kw}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}

type TableCell = { answer: string; options: string[] };
type TableAnswers = Record<string, number>;

function TableBlock({ block, savedValue, onAnswer }: BlockProps<TableAnswers>) {
  const columns = (block.columns as string[]) ?? [];
  const rows = (block.rows as Array<[string, ...TableCell[]]>) ?? [];

  const [sel, setSel] = useState<TableAnswers>(() => {
    if (savedValue && typeof savedValue === 'object' && !Array.isArray(savedValue)) {
      return savedValue as TableAnswers;
    }
    return {};
  });

  function pick(r: number, c: number, i: number) {
    const k = `${r}-${c}`;
    const next = { ...sel, [k]: i };
    setSel(next);
    onAnswer(next);
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 14 }}>
        <thead>
          <tr>
            {columns.map((col, ci) => (
              <th key={ci} style={{
                background: '#f0f4ff', padding: '8px 12px',
                border: '1px solid #e3e7ef', fontWeight: 700,
                color: ci === 0 ? '#5d6880' : '#172036', textAlign: 'left',
                whiteSpace: 'nowrap',
              }}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => {
            const label = row[0] as string;
            const cells = row.slice(1) as TableCell[];
            return (
              <tr key={ri}>
                <td style={{ padding: '10px 12px', border: '1px solid #e3e7ef', background: '#f8f9fb', fontWeight: 600, color: '#5d6880', whiteSpace: 'nowrap' }}>
                  {label}
                </td>
                {cells.map((cell, ci) => {
                  const k = `${ri}-${ci}`;
                  return (
                    <td key={ci} style={{ padding: '8px 10px', border: '1px solid #e3e7ef', verticalAlign: 'top' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {cell.options.map((opt, oi) => {
                          const on = sel[k] === oi;
                          return (
                            <button
                              key={oi}
                              onClick={() => pick(ri, ci, oi)}
                              style={{
                                padding: '5px 10px', borderRadius: 8,
                                border: on ? `2px solid ${PURPLE}` : '1.5px solid #e3e7ef',
                                background: on ? '#f3f0ff' : '#fff',
                                color: on ? PURPLE : '#4a5563',
                                fontSize: 13, fontWeight: on ? 700 : 500,
                                cursor: 'pointer', textAlign: 'left',
                              }}
                            >{opt}</button>
                          );
                        })}
                      </div>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ── 장치 카드 (deviceCard: true) ──────────────────────── */
const DEVICE_ART_SVG = [
  `<svg viewBox="0 0 220 160" style="height:105px;width:auto;display:block" aria-hidden="true"><rect x="43" y="28" width="134" height="116" rx="5" fill="#a3cbb5"/><rect x="53" y="38" width="114" height="105" fill="#f5fcf7"/><path d="M110 38V143" stroke="#81b29b" stroke-width="4"/><rect x="97" y="17" width="26" height="13" rx="5" fill="#306a54"/><path d="M91 12Q110-1 129 12M84 6Q110-13 136 6" fill="none" stroke="#d1a65a" stroke-width="3"/><path d="M63 57h31M63 65h20M123 57h31" stroke="#c4e5d3" stroke-width="4"/><circle cx="29" cy="92" r="10" fill="#e6ac74"/><path d="M29 106v32M16 120l13-13 15 8" stroke="#456e67" stroke-width="7" stroke-linecap="round"/><path d="M17 148h182" stroke="#6b8d76" stroke-width="3"/></svg>`,
  `<svg viewBox="0 0 220 160" style="height:105px;width:auto;display:block" aria-hidden="true"><path d="M69 96h82l-12 54H81z" fill="#d7a075"/><ellipse cx="110" cy="96" rx="42" ry="9" fill="#805c42"/><path d="M110 95V39" stroke="#477e51" stroke-width="5"/><path d="M109 69Q68 73 68 37q38-1 41 32M111 54q4-36 40-33-1 34-40 33" fill="#73a96c"/><rect x="159" y="102" width="25" height="33" rx="4" fill="#7da9b4"/><path d="M172 102V80h-36V96" stroke="#658d98" stroke-width="4" fill="none"/><rect x="61" y="83" width="8" height="35" rx="3" fill="#55836e"/><path d="M65 83V72h-20" stroke="#55836e" stroke-width="3" fill="none"/><path d="M136 100l-3 7m3 0-3 7" stroke="#62adcb" stroke-width="3"/><path d="M50 154h140" stroke="#c9d8bd" stroke-width="4"/></svg>`,
  `<svg viewBox="0 0 220 160" style="height:105px;width:auto;display:block" aria-hidden="true"><circle cx="156" cy="39" r="27" fill="#ffe4a3"/><path d="M79 146V43q0-17 20-17h26" fill="none" stroke="#547b69" stroke-width="9"/><path d="M111 25h42l8 16h-59z" fill="#779c7c"/><path d="M109 48l-21 70h86l-22-70" fill="#f8df9c" opacity=".55"/><rect x="63" y="143" width="34" height="9" rx="4" fill="#547b69"/><path d="M53 156h129" stroke="#c9d8bd" stroke-width="5"/></svg>`,
];

function DeviceCardBlock({ block, savedValue, onAnswer }: BlockProps<Record<string, string>>) {
  const rows = (block.rows as Array<[string, ...{ answer: string; options: string[] }[]]>) ?? [];
  const [sel, setSel] = useState<Record<string, string>>(() => {
    if (savedValue && typeof savedValue === 'object' && !Array.isArray(savedValue)) {
      return savedValue as Record<string, string>;
    }
    return {};
  });

  function pick(r: number, c: number, v: string) {
    const next = { ...sel, [`${r}-${c}`]: v };
    setSel(next);
    onAnswer(next);
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
      {rows.map((row, ri) => {
        const name = row[0] as string;
        const cells = row.slice(1) as { answer: string; options: string[] }[];
        const labels = ['입력(센서)', '출력'];
        return (
          <div key={ri} style={{ background: '#f8f9fb', borderRadius: 14, overflow: 'hidden', border: '1px solid #e3e7ef' }}>
            <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0' }} dangerouslySetInnerHTML={{ __html: DEVICE_ART_SVG[ri] ?? '' }} />
            <div style={{ padding: '10px 14px 16px' }}>
              <p style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 800, color: '#172036' }}>{name}</p>
              {cells.map((cell, ci) => {
                const k = `${ri}-${ci}`;
                const v = sel[k] ?? '';
                return (
                  <div key={ci} style={{ marginBottom: ci < cells.length - 1 ? 10 : 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#5d6880', marginBottom: 4 }}>{labels[ci]}</div>
                    <select
                      value={v}
                      onChange={e => pick(ri, ci, e.target.value)}
                      style={{
                        display: 'block', width: '100%', height: 36,
                        borderRadius: 8,
                        border: `1.5px solid ${v ? '#4263eb' : '#e3e7ef'}`,
                        fontSize: 13, padding: '0 8px',
                        background: v ? '#f0f4ff' : '#fff',
                        color: '#172036', outline: 'none', cursor: 'pointer',
                      }}
                    >
                      <option value="">선택</option>
                      {cell.options.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function NoteBlock({ block }: { block: Block }) {
  return (
    <div style={{ background: '#f0f4ff', borderRadius: 12, padding: '14px 18px', fontSize: 14, color: '#4a5563', lineHeight: 1.6 }}>
      {String(block.prompt ?? '')}
    </div>
  );
}

/* ── 답변 여부 판단 ────────────────────────────────────── */
function isBlockAnswered(block: Block, answers: Answers): boolean {
  if (block.kind === 'note') return true;
  const v = answers[block.id];
  if (v === undefined || v === null) return false;
  if (typeof v === 'string') return v.trim().length > 0;
  if (typeof v === 'number') return true;
  if (Array.isArray(v)) return (v as unknown[]).length > 0;
  if (typeof v === 'object' && v !== null) {
    if (block.kind === 'order') return !!(v as Record<string, unknown>).touched;
    return true;
  }
  return false;
}

/* ── 메인 컴포넌트 ─────────────────────────────────────── */
interface Props {
  sheet: Worksheet;
  units: CurriculumUnit[];
  code: string;
}

export default function ActivityClient({ sheet, units: _units, code }: Props) {
  const [mounted, setMounted] = useState(false);
  const [studentInfo, setStudentInfo] = useState<{ cls: string; num: string; name: string } | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitTime, setSubmitTime] = useState<Date | null>(null);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [helpRequested, setHelpRequested] = useState(false);
  const [answers, setAnswers] = useState<Answers>({});
  const [currentQ, setCurrentQ] = useState(0);
  const [viewMode, setViewMode] = useState<'single' | 'all'>('single');
  const [showHint, setShowHint] = useState(false);
  const submitBtnRef = useRef<HTMLButtonElement>(null);

  /* 모든 섹션의 블록 (note 포함) */
  const allBlocks: Block[] = sheet.sections.flatMap(s => s.blocks);
  /* 채점 대상 블록 (note 제외) */
  const questionBlocks: Block[] = allBlocks.filter(b => b.kind !== 'note');
  const totalCount = questionBlocks.length;
  const answeredCount = questionBlocks.filter(b => isBlockAnswered(b, answers)).length;

  useEffect(() => {
    try {
      const raw = localStorage.getItem('activity_studio_student_info');
      if (raw) setStudentInfo(JSON.parse(raw));
    } catch {}
    try {
      const saved = localStorage.getItem(`activity_studio_answers_${code}_${sheet.id}`);
      if (saved) setAnswers(JSON.parse(saved));
    } catch {}
    try {
      const help = localStorage.getItem(`activity_studio_help_${code}`);
      if (help === 'true') setHelpRequested(true);
    } catch {}
    setMounted(true);
  }, [code, sheet.id]);

  useEffect(() => {
    if (showSubmitDialog) setTimeout(() => submitBtnRef.current?.focus(), 50);
  }, [showSubmitDialog]);

  useEffect(() => {
    if (!showSubmitDialog) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setShowSubmitDialog(false);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showSubmitDialog]);

  const saveAnswer = useCallback((blockId: string, v: unknown) => {
    setAnswers(prev => {
      const next = { ...prev, [blockId]: v };
      try {
        localStorage.setItem(
          `activity_studio_answers_${code}_${sheet.id}`,
          JSON.stringify(next)
        );
      } catch {}
      return next;
    });
  }, [code, sheet.id]);

  if (!mounted) return null;

  /* ── 제출 ────────────────────────────────────────── */
  function handleSubmit() {
    const now = new Date();
    setSubmitTime(now);
    try {
      const key = `activity_studio_submissions_${code}`;
      const existing: unknown[] = JSON.parse(localStorage.getItem(key) ?? '[]');
      const sub = {
        worksheetId: sheet.id,
        title: sheet.title,
        type: sheet.type,
        submittedAt: now.toISOString(),
        hasFeedback: false,
        feedbackType: null,
        feedbackText: null,
        answeredCount,
        totalCount,
      };
      localStorage.setItem(
        key,
        JSON.stringify([sub, ...(existing as { worksheetId: string }[]).filter(s => s.worksheetId !== sheet.id)])
      );
    } catch {}
    setShowSubmitDialog(false);
    setSubmitted(true);
    try { window.dispatchEvent(new Event('activity_studio_badge_update')); } catch {}
  }

  function toggleHelp() {
    const next = !helpRequested;
    setHelpRequested(next);
    try { localStorage.setItem(`activity_studio_help_${code}`, String(next)); } catch {}
  }

  /* ── 블록 렌더 함수 ─────────────────────────────── */
  function renderBlock(block: Block, qNum: number) {
    const saved = answers[block.id];
    const setAnswer = (v: unknown) => saveAnswer(block.id, v);

    return (
      <div key={block.id}>
        {/* 질문 번호 + 지시문 */}
        {block.kind !== 'note' && (
          <div style={{ display: 'flex', gap: 15, alignItems: 'flex-start', marginBottom: 14 }}>
            <span style={{
              display: 'inline-grid', placeItems: 'center', flexShrink: 0,
              minWidth: 45, borderRadius: 5,
              background: '#e7eef8', color: '#1f2a44',
              fontSize: 20, fontWeight: 800, lineHeight: 1.3,
              padding: '8px 9px',
            }}>{String(qNum).padStart(2, '0')}</span>
            <p style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#1f2a44', lineHeight: 1.55, paddingTop: 6 }}>
              {String(block.prompt ?? '')}
            </p>
          </div>
        )}
        {/* 블록 내용 */}
        <div>
          {block.kind === 'note' && <NoteBlock block={block} />}
          {block.kind === 'choice' && (
            <ChoiceBlock block={block} savedValue={saved as number} onAnswer={setAnswer} />
          )}
          {block.kind === 'write' && (
            <WriteBlock block={block} savedValue={saved as string} onAnswer={setAnswer} />
          )}
          {block.kind === 'table' && (
            (block as unknown as { deviceCard?: boolean }).deviceCard
              ? <DeviceCardBlock block={block} savedValue={saved as Record<string, string>} onAnswer={setAnswer} />
              : <TableBlock block={block} savedValue={saved as TableAnswers} onAnswer={setAnswer} />
          )}
          {block.kind === 'multi' && (
            <MultiBlock block={block} savedValue={saved} onAnswer={setAnswer} />
          )}
          {block.kind === 'order' && (
            <OrderBlock block={block} savedValue={saved} onAnswer={setAnswer} />
          )}
        </div>
      </div>
    );
  }

  /* ── 파생값 ─────────────────────────────────────── */
  const name = studentInfo?.name ?? '이름 없음';
  const cls = studentInfo?.cls ?? '';
  const paddedNum = studentInfo?.num ? String(parseInt(studentInfo.num, 10)).padStart(2, '0') : '00';
  const typeColor = TYPE_COLORS[sheet.type] ?? '#5d6880';
  const typeLabel = (TYPE_LABELS as Record<string, string>)[sheet.type] ?? sheet.type;
  const nextTodo = DEMO_TODO.find(t => t.worksheetId !== sheet.id);
  const submitTimeStr = submitTime ? formatSubmitTime(submitTime) : '';

  /* 현재 보고 있는 questionBlocks index → 블록 */
  const curBlock = questionBlocks[currentQ];
  /* 블록별 답변 여부 (dots에서 사용) */
  const isAnswered = (b: Block) => isBlockAnswered(b, answers);

  /* ── 제출 완료 화면 ─────────────────────────────── */
  if (submitted) {
    return (
      <div className="p-main">
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 20 }}>
          <div style={{
            background: '#fff', border: '1px solid var(--line)',
            borderRadius: 24, padding: '40px 36px', width: 680, maxWidth: '100%',
          }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 22 }}>
              <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="38" height="38" viewBox="0 0 38 38" fill="none" aria-hidden="true">
                  <circle cx="19" cy="19" r="18" fill="#f0fdf4" stroke="#16a34a" strokeWidth="2"/>
                  <polyline points="11 19 17 25 27 12" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
            <h1 style={{ margin: '0 0 8px', fontSize: 26, fontWeight: 850, color: 'var(--ink)', textAlign: 'center', letterSpacing: '-.02em' }}>
              제출했어요!
            </h1>
            <p style={{ margin: '0 0 28px', fontSize: 15, color: '#5d6880', textAlign: 'center' }}>
              선생님 피드백을 기다려요. 피드백이 오면 홈에서 알려 줄게요.
            </p>
            <div style={{ background: '#f8f9fb', borderRadius: 14, padding: '16px 20px', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700, color: '#5d6880', marginBottom: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: typeColor }}/>
                {typeLabel}
              </div>
              <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--ink)', marginBottom: 5 }}>{sheet.title}</div>
              <div style={{ fontSize: 13, color: '#5d6880' }}>{totalCount}문항 · {submitTimeStr}</div>
            </div>
            {nextTodo && (
              <div style={{ border: '1px solid var(--line)', borderRadius: 14, padding: '16px 20px', marginBottom: 24 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#9ca3af', marginBottom: 8 }}>다음 할 일</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--ink)', marginBottom: 4 }}>{nextTodo.title}</div>
                    <div style={{ fontSize: 13, color: '#5d6880' }}>
                      {nextTodo.kind === 'resubmit' ? `${nextTodo.resubmitQuestionCount}문항 다시 풀기가 남았어요` : '아직 시작하지 않은 활동이에요'}
                    </div>
                  </div>
                  <Link href={`/s/${code}/activity`} style={{
                    height: 40, padding: '0 16px', borderRadius: 10,
                    background: PURPLE, color: '#fff', textDecoration: 'none',
                    fontSize: 13, fontWeight: 700, display: 'inline-flex', alignItems: 'center', flexShrink: 0,
                  }}>
                    {nextTodo.kind === 'resubmit' ? '다시 풀기' : '시작하기'}
                  </Link>
                </div>
              </div>
            )}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <Link href={`/s/${code}/activities`} style={{
                height: 44, padding: '0 24px', borderRadius: 12,
                border: '1.5px solid var(--line)', background: '#fff',
                color: 'var(--ink)', textDecoration: 'none', fontSize: 14, fontWeight: 700,
                display: 'inline-flex', alignItems: 'center',
              }}>내 활동으로</Link>
              <Link href={`/s/${code}/result`} style={{
                height: 44, padding: '0 24px', borderRadius: 12,
                background: PURPLE, color: '#fff', textDecoration: 'none',
                fontSize: 14, fontWeight: 700, display: 'inline-flex', alignItems: 'center',
              }}>결과 보기</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── 헤로 밴드 ───────────────────────────────────── */
  const heroBand = (
    <div className="hero" style={{ padding: '20px 24px', marginBottom: 20 }}>
      <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
        {/* 썸네일 — IoT 센서 일러스트 */}
        <div style={{ width: 190, height: 130, borderRadius: 14, overflow: 'hidden', flexShrink: 0 }}>
          <SensorIllustration />
        </div>
        {/* 활동 정보 */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              fontSize: 12, fontWeight: 700, color: '#2d3a6b',
              border: '1px solid #c8c2e8',
              borderRadius: 8, padding: '4px 10px',
              background: '#ede9f8',
            }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: typeColor, flexShrink: 0 }}/>
              {typeLabel}
            </span>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>{sheet.unit} · {sheet.minutes}분</span>
          </div>
          <h1 style={{ margin: '0 0 8px', fontSize: 24, fontWeight: 850, color: '#fff', letterSpacing: '-.02em', lineHeight: 1.3 }}>
            {sheet.title}
          </h1>
          <p style={{ margin: '0 0 7px', fontSize: 13, color: 'rgba(255,255,255,0.78)', lineHeight: 1.55 }}>
            <span style={{ color: '#ffd43b', fontWeight: 700 }}>학습목표</span>{' '}{sheet.goal}
          </p>
          <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>
            {cls && `${cls} `}{paddedNum}번 {name}
          </p>
        </div>
        <div style={{ flexShrink: 0 }}>
          <span style={{ fontSize: 11.5 }}>
            <span style={{ color: '#6ee7b7' }}>✓ </span>
            <span style={{ color: 'rgba(255,255,255,0.75)' }}>자동 저장됨</span>
          </span>
        </div>
      </div>
    </div>
  );

  /* ── 질문 번호 내비 ───────────────────────────────── */
  const navDots = (
    <div style={{ marginBottom: 24, paddingBottom: 20, borderBottom: '1px solid var(--line)' }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      {questionBlocks.map((b, i) => {
        const done = isAnswered(b);
        const active = viewMode === 'single' && i === currentQ;
        return (
          <button
            key={b.id}
            onClick={() => { setCurrentQ(i); setShowHint(false); setViewMode('single'); }}
            aria-label={`${i + 1}번 문항`}
            style={{
              width: 36, height: 36, borderRadius: '50%',
              background: active ? '#1f2a44' : done ? '#e7eef8' : '#f3f4f6',
              color: active ? '#fff' : done ? '#1f2a44' : '#9ca3af',
              border: active ? 'none' : done ? '1px solid #c5d3e8' : '1px solid #e5e7eb',
              fontSize: 14, fontWeight: 700,
              cursor: 'pointer', transition: 'all .15s',
            }}
          >
            {i + 1}
          </button>
        );
      })}
    </div>
    <span style={{ fontSize: 13, fontWeight: 600, color: '#9ca3af' }}>{currentQ + 1}/{totalCount}</span>
    </div>
    </div>
  );

  /* ── 한 문항씩 보기 ─────────────────────────────── */
  const singleView = curBlock ? (
    <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 22, padding: '32px 36px', marginBottom: 14 }}>
      {navDots}
      {renderBlock(curBlock, currentQ + 1)}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 28, paddingTop: 20, borderTop: '1px solid var(--line)' }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => setShowHint(h => !h)}
            style={{
              height: 40, padding: '0 14px', borderRadius: 10,
              border: `1.5px solid ${showHint ? '#f59f00' : 'var(--line)'}`,
              background: showHint ? '#fff9db' : '#fff',
              fontSize: 13, fontWeight: 600,
              color: showHint ? '#b45309' : '#5d6880',
              cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: 6,
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#f59f00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M9 21h6"/><path d="M12 3a6 6 0 0 1 6 6c0 2.5-1.5 4.5-3 5.5V17H9v-2.5C7.5 13.5 6 11.5 6 9a6 6 0 0 1 6-6z"/>
            </svg>
            {showHint ? '힌트 닫기' : '힌트 1단계 보기'}
          </button>
          <button
            onClick={toggleHelp}
            style={{
              height: 40, padding: '0 14px', borderRadius: 10,
              border: `1.5px solid ${helpRequested ? PURPLE : 'var(--line)'}`,
              background: helpRequested ? '#f3f0ff' : '#fff',
              fontSize: 13, fontWeight: 600,
              color: helpRequested ? PURPLE : '#5d6880',
              cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: 6,
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#131c33" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M18 11V7a2 2 0 0 0-4 0v4"/><path d="M14 7V5a2 2 0 0 0-4 0v6"/><path d="M10 5V4a2 2 0 0 0-4 0v9"/><path d="M6 13c0 3.3 2.7 6 6 6s6-2.7 6-6v-2a2 2 0 0 0-4 0"/>
            </svg>
            {helpRequested ? '선생님께 알렸어요' : '도움 요청'}
          </button>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => { setCurrentQ(q => Math.max(0, q - 1)); setShowHint(false); }}
            disabled={currentQ === 0}
            style={{
              height: 40, padding: '0 18px', borderRadius: 10,
              border: '1.5px solid var(--line)', background: '#fff',
              fontSize: 14, fontWeight: 600, color: '#5d6880', cursor: 'pointer',
              opacity: currentQ === 0 ? 0.4 : 1,
            }}
          >이전</button>
          {currentQ < totalCount - 1 ? (
            <button
              onClick={() => { setCurrentQ(q => Math.min(totalCount - 1, q + 1)); setShowHint(false); }}
              style={{
                height: 40, padding: '0 18px', borderRadius: 10,
                background: PURPLE, color: '#fff', border: 'none',
                fontSize: 14, fontWeight: 600, cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', gap: 6,
              }}
            >
              다음 문항
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="4" y1="12" x2="20" y2="12"/>
                <polyline points="14 6 20 12 14 18"/>
              </svg>
            </button>
          ) : (
            <button
              onClick={() => setShowSubmitDialog(true)}
              style={{
                height: 40, padding: '0 18px', borderRadius: 10,
                background: PURPLE, color: '#fff', border: 'none',
                fontSize: 14, fontWeight: 700, cursor: 'pointer',
              }}
            >제출하기</button>
          )}
        </div>
      </div>
      {showHint && (
        <div style={{ marginTop: 16, background: '#fffbeb', border: '1.5px solid #f59f00', borderRadius: 14, padding: '18px 22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59f00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M9 21h6"/><path d="M12 3a6 6 0 0 1 6 6c0 2.5-1.5 4.5-3 5.5V17H9v-2.5C7.5 13.5 6 11.5 6 9a6 6 0 0 1 6-6z"/>
            </svg>
            <span style={{ fontSize: 13, fontWeight: 800, color: '#b45309' }}>힌트 1단계</span>
            <span style={{ fontSize: 13, color: '#b45309', opacity: 0.5 }}>·</span>
            <span style={{ fontSize: 13, color: '#92400e' }}>{curBlock?.hint ? String(curBlock.hint) : '이 문항에 선생님이 넣은 힌트'}</span>
          </div>
        </div>
      )}
    </div>
  ) : null;

  /* ── 전체 보기 ──────────────────────────────────── */
  let qNum = 0;
  const allView = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 14 }}>
      {allBlocks.map(b => {
        if (b.kind !== 'note') qNum++;
        const num = qNum;
        return (
          <div key={b.id} style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 22, padding: '32px 36px' }}>
            {renderBlock(b, num)}
          </div>
        );
      })}
      {/* 제출 카드 */}
      <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 22, padding: '24px 36px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button
          onClick={toggleHelp}
          style={{
            height: 40, padding: '0 14px', borderRadius: 10,
            border: `1.5px solid ${helpRequested ? PURPLE : 'var(--line)'}`,
            background: helpRequested ? '#f3f0ff' : '#fff',
            fontSize: 13, fontWeight: 600,
            color: helpRequested ? PURPLE : '#5d6880',
            cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', gap: 6,
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#131c33" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M18 11V7a2 2 0 0 0-4 0v4"/><path d="M14 7V5a2 2 0 0 0-4 0v6"/><path d="M10 5V4a2 2 0 0 0-4 0v9"/><path d="M6 13c0 3.3 2.7 6 6 6s6-2.7 6-6v-2a2 2 0 0 0-4 0"/>
          </svg>
          {helpRequested ? '선생님께 알렸어요' : '도움 요청'}
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 14, color: '#5d6880' }}>
            답한 문항 <strong style={{ color: '#1f2a44', fontWeight: 700 }}>{answeredCount}/{totalCount}</strong>
          </span>
          <button
            onClick={() => setShowSubmitDialog(true)}
            style={{
              height: 44, padding: '0 28px', borderRadius: 12,
              background: PURPLE, color: '#fff', border: 'none',
              fontSize: 15, fontWeight: 700, cursor: 'pointer',
            }}
          >제출하기</button>
        </div>
      </div>
    </div>
  );

  /* ── 보기 토글 ──────────────────────────────────── */
  const viewToggle = (
    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10 }}>
      <div style={{ display: 'flex', border: '1.5px solid var(--line)', borderRadius: 10, overflow: 'hidden', background: '#fff' }}>
        {(['single', 'all'] as const).map(m => (
          <button
            key={m}
            onClick={() => setViewMode(m)}
            style={{
              height: 34, padding: '0 14px',
              background: viewMode === m ? '#131c33' : '#fff',
              color: viewMode === m ? '#fff' : '#5d6880',
              border: 'none', fontSize: 13, fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {m === 'single' ? '한 문항씩' : '전체 보기'}
          </button>
        ))}
      </div>
    </div>
  );

  /* ── 제출 확인 다이얼로그 ───────────────────────── */
  const submitDialog = showSubmitDialog ? (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(19,28,51,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      role="dialog" aria-modal="true" aria-label="제출 확인"
      onMouseDown={e => { if (e.target === e.currentTarget) setShowSubmitDialog(false); }}
      tabIndex={-1}
    >
      <div style={{ background: '#fff', borderRadius: 24, padding: '32px 28px', width: 440, maxWidth: '90vw', boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }}>
        <h2 style={{ margin: '0 0 6px', fontSize: 22, fontWeight: 850, color: 'var(--ink)', letterSpacing: '-.02em' }}>
          제출할까요?
        </h2>
        <p style={{ margin: '0 0 16px', fontSize: 14, color: '#5d6880' }}>
          {answeredCount < totalCount
            ? `${totalCount - answeredCount}문항을 아직 답하지 않았어요.`
            : '모든 문항에 답했어요.'}
        </p>
        {/* 문항 dots */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 24 }}>
          {questionBlocks.map((b, i) => (
            <div key={b.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: isAnswered(b) ? '#131c33' : '#f0f4ff',
                border: `1.5px solid ${isAnswered(b) ? '#131c33' : '#c5ccd9'}`,
                color: isAnswered(b) ? '#fff' : '#9ca3af',
                fontSize: 13, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{i + 1}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button
            onClick={() => setShowSubmitDialog(false)}
            style={{ height: 44, padding: '0 20px', border: '1.5px solid var(--line)', borderRadius: 12, background: '#fff', fontSize: 14, fontWeight: 700, color: '#5d6880', cursor: 'pointer' }}
          >더 볼게요</button>
          <button
            ref={submitBtnRef}
            onClick={handleSubmit}
            style={{ height: 44, padding: '0 24px', borderRadius: 12, background: PURPLE, color: '#fff', border: 'none', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
          >제출하기</button>
        </div>
      </div>
    </div>
  ) : null;

  /* ── 최종 렌더 ──────────────────────────────────── */
  return (
    <div className="p-main">
      {heroBand}
      {viewToggle}
      {viewMode === 'single' ? singleView : allView}
      {submitDialog}
    </div>
  );
}
