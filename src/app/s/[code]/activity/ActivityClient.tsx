'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Worksheet, CurriculumUnit, Block } from '@/types/worksheet';
import StudentNav from '@/components/StudentNav';

/* ── 채점 결과 타입 ── */
type CheckState = 'unchecked' | 'correct' | 'wrong' | 'ai-ok' | 'ai-retry';

/* ── StepBar ── */
function StepBar({ current }: { current: number }) {
  const steps = ['접속', '풀기', '제출', '결과'];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
      {steps.map((label, i) => {
        const n = i + 1;
        const done = n < current;
        const active = n === current;
        return (
          <div key={n} style={{ display: 'flex', alignItems: 'center' }}>
            {i > 0 && <div style={{ width: 28, height: 2, background: done ? 'var(--navy)' : 'var(--line)' }} />}
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{
                width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                background: done || active ? 'var(--navy)' : '#fff',
                border: done || active ? '2px solid var(--navy)' : '2px solid var(--line)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {done
                  ? <svg viewBox="0 0 24 24" width="11" height="11" fill="none"><path d="M5 12l4 4L19 8" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  : <span style={{ fontSize: 10, fontWeight: 800, color: active ? '#fff' : 'var(--mute)' }}>{n}</span>
                }
              </div>
              <span style={{ fontSize: 12, fontWeight: active ? 700 : 500, color: done || active ? 'var(--ink)' : 'var(--mute)', whiteSpace: 'nowrap' }}>{label}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── 피드백 박스 ── */
function FeedbackBox({ state, explain }: { state: CheckState; explain?: string }) {
  if (state === 'unchecked') return null;
  const configs = {
    correct:  { bg: '#f0fdf4', border: '#86efac', color: '#15803d', text: '맞았어요!' },
    wrong:    { bg: '#fff7ed', border: '#fdba74', color: '#c2410c', text: '다시 한 번 생각해 보세요.' },
    'ai-ok':  { bg: '#f0f4ff', border: '#a5b4fc', color: '#3730a3', text: '핵심 단어를 잘 썼어요!' },
    'ai-retry': { bg: '#fffbe8', border: '#fde047', color: '#713f12', text: '핵심 단어가 빠진 것 같아요. 다시 써 볼까요?' },
  } as const;
  const cfg = configs[state];
  return (
    <div style={{ marginTop: 8, padding: '8px 12px', background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: 8, fontSize: 13, color: cfg.color, fontWeight: 600 }}>
      {cfg.text}
      {state === 'correct' && explain && (
        <p style={{ margin: '6px 0 0', fontWeight: 400, color: '#374151' }}>{explain}</p>
      )}
    </div>
  );
}

/* ── 객관식 블록 ── */
function ChoiceBlock({
  block, blockIndex, onCheck,
}: {
  block: Block; blockIndex: number;
  onCheck: (blockId: string, state: CheckState) => void;
}) {
  const options = (block.options as string[]) ?? [];
  const answer = block.answer as number;
  const [selected, setSelected] = useState<number | null>(null);
  const [checkState, setCheckState] = useState<CheckState>('unchecked');

  function handleCheck() {
    if (selected === null) return;
    const result: CheckState = selected === answer ? 'correct' : 'wrong';
    setCheckState(result);
    onCheck(block.id, result);
  }

  function handleRetry() {
    setSelected(null);
    setCheckState('unchecked');
  }

  return (
    <div>
      <div role="radiogroup" style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 10 }}>
        {options.map((opt, i) => {
          const isSelected = selected === i;
          return (
            <label
              key={i}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 14px', borderRadius: 10, cursor: 'pointer',
                border: `1.5px solid ${isSelected ? 'var(--navy)' : 'var(--line)'}`,
                background: isSelected ? 'var(--sel)' : '#fff',
                fontSize: 14, color: 'var(--ink)', fontWeight: isSelected ? 600 : 400,
              }}
            >
              <input
                type="radio"
                name={`block-${block.id}`}
                value={i}
                checked={isSelected}
                onChange={() => { setSelected(i); setCheckState('unchecked'); }}
                style={{ accentColor: 'var(--navy)' }}
              />
              {opt}
            </label>
          );
        })}
      </div>
      <FeedbackBox state={checkState} explain={checkState === 'correct' ? (block.explain as string) : undefined} />
      {checkState === 'unchecked' && (
        <button
          onClick={handleCheck}
          disabled={selected === null}
          style={{
            marginTop: 8, height: 40, padding: '0 20px', borderRadius: 10,
            background: selected !== null ? 'var(--navy)' : 'var(--line2)',
            color: '#fff', border: 'none', fontSize: 13, fontWeight: 700,
            cursor: selected !== null ? 'pointer' : 'default',
          }}
        >
          확인
        </button>
      )}
      {checkState === 'wrong' && (
        <button
          onClick={handleRetry}
          style={{ marginTop: 8, height: 40, padding: '0 20px', borderRadius: 10, border: '1.5px solid var(--line)', background: '#fff', fontSize: 13, fontWeight: 700, color: 'var(--sub)', cursor: 'pointer' }}
        >
          다시 풀기
        </button>
      )}
    </div>
  );
}

/* ── 서술형 블록 (AI 확인) ── */
function WriteBlock({
  block, onCheck,
}: {
  block: Block;
  onCheck: (blockId: string, state: CheckState) => void;
}) {
  const keywords = (block.keywords as string[]) ?? [];
  const [answer, setAnswer] = useState('');
  const [checkState, setCheckState] = useState<CheckState>('unchecked');
  const [aiLoading, setAiLoading] = useState(false);

  function handleAiCheck() {
    if (!answer.trim()) return;
    setAiLoading(true);
    setCheckState('unchecked');
    setTimeout(() => {
      const hasAll = keywords.length === 0 || keywords.every(k => answer.includes(k));
      const result: CheckState = hasAll ? 'ai-ok' : 'ai-retry';
      setCheckState(result);
      onCheck(block.id, result);
      setAiLoading(false);
    }, 700);
  }

  return (
    <div>
      <textarea
        value={answer}
        onChange={e => { setAnswer(e.target.value); setCheckState('unchecked'); }}
        placeholder="한 문장으로 써 보세요."
        rows={2}
        style={{
          width: '100%', border: `1.5px solid ${checkState === 'ai-ok' ? '#86efac' : checkState === 'ai-retry' ? '#fde047' : 'var(--line)'}`,
          borderRadius: 8, padding: '8px 12px', fontSize: 14,
          color: 'var(--ink)', resize: 'vertical', boxSizing: 'border-box', font: 'inherit',
        }}
      />
      <FeedbackBox state={checkState} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
        <button
          onClick={handleAiCheck}
          disabled={!answer.trim() || aiLoading}
          style={{
            height: 40, padding: '0 18px', borderRadius: 10,
            background: answer.trim() && !aiLoading ? 'var(--navy)' : 'var(--line2)',
            color: '#fff', border: 'none', fontSize: 13, fontWeight: 700,
            cursor: answer.trim() && !aiLoading ? 'pointer' : 'default',
            display: 'flex', alignItems: 'center', gap: 6,
          }}
        >
          <span style={{ fontSize: 10, fontWeight: 800 }}>AI</span>
          {aiLoading ? '확인 중…' : '확인'}
        </button>
        {keywords.length > 0 && (
          <span style={{ fontSize: 12, color: 'var(--mute)' }}>
            핵심 단어: {keywords.join(', ')}
          </span>
        )}
      </div>
    </div>
  );
}

/* ── 표 채우기 블록 ── */
function TableBlock({ block }: { block: Block }) {
  const columns = (block.columns as string[]) ?? [];
  const rows = (block.rows as unknown[][]) ?? [];

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 480 }}>
        <thead>
          <tr>
            {columns.map((col, i) => (
              <th key={i} style={{ padding: '6px 10px', background: 'var(--sel)', border: '1px solid var(--line)', textAlign: 'center', fontWeight: 700, color: 'var(--ink)' }}>
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri}>
              {row.map((cell, ci) => {
                if (typeof cell === 'string') {
                  return (
                    <td key={ci} style={{ padding: '6px 10px', border: '1px solid var(--line)', textAlign: 'center', color: 'var(--ink)' }}>
                      {cell}
                    </td>
                  );
                }
                const c = cell as { answer?: string; options?: string[] };
                if (c.options) {
                  return (
                    <td key={ci} style={{ padding: '6px 6px', border: '1px solid var(--line)', textAlign: 'center' }}>
                      <select style={{ fontSize: 12, padding: '2px 4px', border: '1px solid var(--line)', borderRadius: 4, color: 'var(--ink)' }}>
                        <option value="">—</option>
                        {c.options.map((o, oi) => <option key={oi} value={o}>{o}</option>)}
                      </select>
                    </td>
                  );
                }
                return (
                  <td key={ci} style={{ padding: '4px 6px', border: '1px solid var(--line)', textAlign: 'center' }}>
                    <input
                      type="text"
                      placeholder="?"
                      style={{ width: 64, fontSize: 12, padding: '3px 6px', border: '1px solid var(--line)', borderRadius: 4, textAlign: 'center', color: 'var(--ink)' }}
                    />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ── 블록 공통 렌더러 ── */
function BlockRenderer({
  block, blockIndex, onCheck,
}: {
  block: Block; blockIndex: number;
  onCheck: (blockId: string, state: CheckState) => void;
}) {
  if (block.kind === 'note') {
    return (
      <div style={{ padding: '12px 16px', background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 8, fontSize: 14, color: 'var(--ink)', marginTop: 4 }}>
        {block.prompt}
      </div>
    );
  }

  return (
    <div style={{ marginBottom: 16, padding: '14px 16px', background: '#fafafa', borderRadius: 10 }}>
      {block.kind !== 'note' && (
        <p style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>
          {blockIndex + 1}. {block.prompt}
        </p>
      )}
      {block.kind === 'choice' && (
        <ChoiceBlock block={block} blockIndex={blockIndex} onCheck={onCheck} />
      )}
      {block.kind === 'write' && (
        <WriteBlock block={block} onCheck={onCheck} />
      )}
      {block.kind === 'table' && (
        <TableBlock block={block} />
      )}
      {!['choice', 'write', 'table', 'note'].includes(block.kind) && (
        <textarea
          placeholder="여기에 답을 써 보세요."
          rows={2}
          style={{
            width: '100%', border: '1px solid var(--line)',
            borderRadius: 8, padding: '8px 12px', fontSize: 14,
            color: 'var(--ink)', resize: 'vertical', boxSizing: 'border-box', font: 'inherit',
          }}
        />
      )}
    </div>
  );
}

/* ── 메인 컴포넌트 ── */
interface Props {
  sheet: Worksheet;
  units: CurriculumUnit[];
  code: string;
}

export default function ActivityClient({ sheet, units, code }: Props) {
  const router = useRouter();
  const [studentName, setStudentName] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [checks, setChecks] = useState<Record<string, CheckState>>({});

  useEffect(() => {
    try {
      const info = localStorage.getItem('activity_studio_student_info');
      if (info) setStudentName(JSON.parse(info).name ?? '');
    } catch {}
  }, []);

  function handleCheck(blockId: string, state: CheckState) {
    setChecks(prev => ({ ...prev, [blockId]: state }));
  }

  function handleSubmit() {
    setSubmitting(true);
    try {
      const key = `activity_studio_submissions_${code}`;
      const existing = JSON.parse(localStorage.getItem(key) ?? '[]');
      const submission = {
        worksheetId: sheet.id,
        title: sheet.title,
        type: sheet.type,
        submittedAt: new Date().toISOString(),
        hasFeedback: false,
        feedbackType: null,
        feedbackText: null,
      };
      const filtered = existing.filter((s: { worksheetId: string }) => s.worksheetId !== sheet.id);
      localStorage.setItem(key, JSON.stringify([submission, ...filtered]));
    } catch {}
    setTimeout(() => router.push(`/s/${code}/result`), 600);
  }

  const sectionLabel: Record<string, string> = { start: '시작 질문', main: '핵심 활동', wrap: '한 줄 정리' };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <StudentNav code={code} />
      <div style={{ flex: 1, background: '#f5f7fa', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
      {/* 스텝바 */}
      <div style={{ background: '#fff', borderBottom: '1px solid var(--line2)', padding: '10px 20px', flexShrink: 0 }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <StepBar current={2} />
        </div>
      </div>

      {/* 활동지 본문 */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ maxWidth: 760, margin: '0 auto', background: '#fff', minHeight: '100%', padding: '28px 28px 100px' }}>
          <p style={{ margin: '0 0 4px', fontSize: 12, color: 'var(--mute)' }}>
            중학교 정보 · {sheet.unit}
          </p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: 'var(--ink)' }}>{sheet.title}</h1>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 10, fontSize: 13, color: 'var(--sub)' }}>
              <span>반 ___</span><span>번호 ___</span>
              <span>이름 <strong style={{ color: 'var(--ink)' }}>{studentName || '___'}</strong></span>
            </div>
          </div>

          <div style={{
            background: '#f0f9ff', border: '1px solid #bae6fd',
            borderRadius: 10, padding: '12px 16px', marginBottom: 24, fontSize: 14, color: 'var(--ink)',
          }}>
            <span style={{ fontWeight: 700 }}>오늘의 목표 </span>{sheet.goal}
          </div>

          {sheet.sections.map((sec, si) => (
            <div key={sec.role} style={{ marginBottom: 28 }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12,
                paddingBottom: 8, borderBottom: '2px solid var(--navy)',
              }}>
                <span style={{
                  width: 24, height: 24, borderRadius: '50%',
                  background: 'var(--navy)', color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 800, flexShrink: 0,
                }}>{si + 1}</span>
                <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--ink)' }}>
                  {sectionLabel[sec.role] ?? sec.title}
                </span>
              </div>
              {sec.blocks.map((block, bi) => (
                <BlockRenderer key={block.id} block={block} blockIndex={bi} onCheck={handleCheck} />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* 하단 고정 바 */}
      <div style={{
        position: 'fixed', bottom: 0, left: 180, right: 0,
        background: '#fff', borderTop: '1px solid var(--line2)',
        padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 10,
      }}>
        <div>
          {showHint && <p style={{ margin: '0 0 4px', fontSize: 13, color: 'var(--sub)' }}>힌트: 조건을 하나씩 확인해 보세요.</p>}
          <button
            onClick={() => setShowHint(v => !v)}
            style={{
              height: 40, padding: '0 16px', border: '1.5px solid var(--line)',
              borderRadius: 10, background: '#fff', fontSize: 13, fontWeight: 600, color: 'var(--sub)', cursor: 'pointer',
            }}
          >
            힌트 보기
          </button>
        </div>
        <button
          onClick={handleSubmit} disabled={submitting}
          style={{
            height: 48, padding: '0 28px',
            background: submitting ? '#94a3b8' : 'var(--navy)',
            color: '#fff', border: 'none', borderRadius: 12,
            fontSize: 15, fontWeight: 700, cursor: submitting ? 'default' : 'pointer',
          }}
        >
          {submitting ? '제출 중…' : '다 풀었어요'}
        </button>
      </div>
      </div>
    </div>
  );
}
