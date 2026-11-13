'use client';

/**
 * ResultBlockView — 결과 상세의 문항 한 개.
 * 교사 활동지 화면(/worksheets/[id])·학생 풀기 화면과 같은 모양으로 그리고,
 * 학생이 낸 답을 읽기 전용으로 표시한다. 맞음 초록 · 다시 볼 것 주황.
 */

import type { Block } from '@/types/worksheet';

const GREEN = '#2b8a3e';
const GREEN_BG = '#ebfbee';
const ORANGE = '#e8890c';
const ORANGE_BG = '#fff4e6';
const INK = '#1f2a44';

export type Grade = 'correct' | 'review';
type Answer = unknown;

/* ── 채점 ─────────────────────────────────────────────── */
type Cell = { answer: string; options: string[] };

export function gradeBlock(block: Block, ans: Answer): Grade | null {
  if (ans === undefined || ans === null) return null;
  const b = block as unknown as Record<string, unknown>;
  switch (block.kind) {
    case 'choice':
      return typeof ans === 'number' ? (ans === b.answer ? 'correct' : 'review') : null;
    case 'multi': {
      if (!Array.isArray(ans) || ans.length === 0) return null;
      const want = [...((b.answer as number[]) ?? [])].sort().join(',');
      const got = [...(ans as number[])].sort().join(',');
      return want === got ? 'correct' : 'review';
    }
    case 'order': {
      const v = ans as { items?: number[]; touched?: boolean };
      if (!v || !Array.isArray(v.items) || !v.touched) return null;
      return v.items.every((it, i) => it === i) ? 'correct' : 'review';
    }
    case 'table': {
      if (typeof ans !== 'object') return null;
      const rows = (b.rows as Array<[string, ...Cell[]]>) ?? [];
      const a = ans as Record<string, string | number>;
      if (Object.keys(a).length === 0) return null;
      const ok = rows.every((row, ri) =>
        (row.slice(1) as Cell[]).every((cell, ci) => cellValue(cell, a[`${ri}-${ci}`]) === cell.answer)
      );
      return ok ? 'correct' : 'review';
    }
    case 'write': {
      const t = typeof ans === 'string' ? ans.trim() : '';
      if (!t) return null;
      const kws = (b.keywords as string[]) ?? [];
      if (b.graded === false) return 'correct';
      return kws.every(k => t.includes(k)) ? 'correct' : 'review';
    }
    default:
      return null;
  }
}

function cellValue(cell: Cell, v: string | number | undefined): string | undefined {
  if (typeof v === 'number') return cell.options[v];
  return v || undefined;
}

/* ── 공통 조각 ─────────────────────────────────────────── */
function AnswerChip() {
  return (
    <span style={{
      marginLeft: 'auto', flexShrink: 0,
      fontSize: 11.5, fontWeight: 800, color: GREEN,
      background: '#fff', border: `1px solid ${GREEN}`, borderRadius: 6,
      padding: '2px 7px',
    }}>정답</span>
  );
}

function tone(isPicked: boolean, isRight: boolean, showAnswer: boolean) {
  if (isPicked) {
    return isRight
      ? { border: `2px solid ${GREEN}`, background: GREEN_BG, numBg: GREEN }
      : { border: `2px solid ${ORANGE}`, background: ORANGE_BG, numBg: ORANGE };
  }
  if (isRight && showAnswer) return { border: `1.5px dashed ${GREEN}`, background: '#fff', numBg: '' };
  return { border: '1px solid #cfd6df', background: '#fff', numBg: '' };
}

/* ── 객관식 ────────────────────────────────────────────── */
function ChoiceView({ block, ans, showAnswer }: { block: Block; ans: Answer; showAnswer: boolean }) {
  const options = (block.options as string[]) ?? [];
  const isCol = options.some(o => o.length > 14);
  const answer = (block as unknown as { answer: number }).answer;
  return (
    <div style={isCol
      ? { display: 'flex', flexDirection: 'column', gap: 8 }
      : { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
      {options.map((opt, i) => {
        const t = tone(ans === i, i === answer, showAnswer);
        return (
          <div key={i} style={{
            minHeight: 65, borderRadius: 10, display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 14px', fontSize: 15, fontWeight: 400, color: INK,
            border: t.border, background: t.background,
          }}>
            <NumCircle n={i + 1} bg={t.numBg} />
            <span style={{ wordBreak: 'keep-all' }}>{opt}</span>
            {ans !== i && i === answer && showAnswer && <AnswerChip />}
          </div>
        );
      })}
    </div>
  );
}

function NumCircle({ n, bg, square }: { n: number; bg: string; square?: boolean }) {
  return (
    <span style={{
      width: 27, height: 27, borderRadius: square ? 6 : '50%', flexShrink: 0,
      background: bg || 'transparent', border: bg ? 'none' : '1px solid #cfd6df',
      color: bg ? '#fff' : '#6b7383', fontSize: 13, fontWeight: 700,
      display: 'inline-grid', placeItems: 'center',
    }}>{n}</span>
  );
}

/* ── 모두 고르기 ───────────────────────────────────────── */
function MultiView({ block, ans, showAnswer }: { block: Block; ans: Answer; showAnswer: boolean }) {
  const options = (block.options as string[]) ?? [];
  const answer = ((block as unknown as { answer: number[] }).answer) ?? [];
  const picked = Array.isArray(ans) ? (ans as number[]) : [];
  return (
    <div style={{ background: '#f1f3f7', borderRadius: 14, padding: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
      {options.map((opt, i) => {
        const t = tone(picked.includes(i), answer.includes(i), showAnswer);
        return (
          <div key={i} style={{
            minHeight: 58, borderRadius: 10, display: 'flex', alignItems: 'center', gap: 12,
            padding: '8px 14px', fontSize: 15, fontWeight: 400, color: INK,
            border: t.border, background: t.background,
          }}>
            <NumCircle n={i + 1} bg={t.numBg} square />
            <span style={{ wordBreak: 'keep-all' }}>{opt}</span>
            {!picked.includes(i) && answer.includes(i) && showAnswer && <AnswerChip />}
          </div>
        );
      })}
    </div>
  );
}

/* ── 표 채우기 (장치 카드 / 일반 표) ───────────────────── */
const DEVICE_ART_SVG = [
  `<svg viewBox="0 0 220 160" style="height:105px;width:auto;display:block" aria-hidden="true"><rect x="43" y="28" width="134" height="116" rx="5" fill="#a3cbb5"/><rect x="53" y="38" width="114" height="105" fill="#f5fcf7"/><path d="M110 38V143" stroke="#81b29b" stroke-width="4"/><rect x="97" y="17" width="26" height="13" rx="5" fill="#306a54"/><path d="M91 12Q110-1 129 12M84 6Q110-13 136 6" fill="none" stroke="#d1a65a" stroke-width="3"/><path d="M63 57h31M63 65h20M123 57h31" stroke="#c4e5d3" stroke-width="4"/><circle cx="29" cy="92" r="10" fill="#e6ac74"/><path d="M29 106v32M16 120l13-13 15 8" stroke="#456e67" stroke-width="7" stroke-linecap="round"/><path d="M17 148h182" stroke="#6b8d76" stroke-width="3"/></svg>`,
  `<svg viewBox="0 0 220 160" style="height:105px;width:auto;display:block" aria-hidden="true"><path d="M69 96h82l-12 54H81z" fill="#d7a075"/><ellipse cx="110" cy="96" rx="42" ry="9" fill="#805c42"/><path d="M110 95V39" stroke="#477e51" stroke-width="5"/><path d="M109 69Q68 73 68 37q38-1 41 32M111 54q4-36 40-33-1 34-40 33" fill="#73a96c"/><rect x="159" y="102" width="25" height="33" rx="4" fill="#7da9b4"/><path d="M172 102V80h-36V96" stroke="#658d98" stroke-width="4" fill="none"/><rect x="61" y="83" width="8" height="35" rx="3" fill="#55836e"/><path d="M65 83V72h-20" stroke="#55836e" stroke-width="3" fill="none"/><path d="M136 100l-3 7m3 0-3 7" stroke="#62adcb" stroke-width="3"/><path d="M50 154h140" stroke="#c9d8bd" stroke-width="4"/></svg>`,
  `<svg viewBox="0 0 220 160" style="height:105px;width:auto;display:block" aria-hidden="true"><circle cx="156" cy="39" r="27" fill="#ffe4a3"/><path d="M79 146V43q0-17 20-17h26" fill="none" stroke="#547b69" stroke-width="9"/><path d="M111 25h42l8 16h-59z" fill="#779c7c"/><path d="M109 48l-21 70h86l-22-70" fill="#f8df9c" opacity=".55"/><rect x="63" y="143" width="34" height="9" rx="4" fill="#547b69"/><path d="M53 156h129" stroke="#c9d8bd" stroke-width="5"/></svg>`,
];

function ValueBox({ value, right, showAnswer }: { value?: string; right: string; showAnswer: boolean }) {
  const ok = value === right;
  const empty = !value;
  return (
    <div>
      <div style={{
        height: 36, borderRadius: 8, display: 'flex', alignItems: 'center', padding: '0 10px',
        fontSize: 13, color: empty ? '#9aa4bf' : INK, fontWeight: empty ? 400 : 600,
        border: empty ? '1px solid #e3e7ef' : `1.5px solid ${ok ? GREEN : ORANGE}`,
        background: empty ? '#fff' : ok ? GREEN_BG : ORANGE_BG,
      }}>{value || '선택 안 함'}</div>
      {!ok && showAnswer && (
        <div style={{ marginTop: 4, fontSize: 12, fontWeight: 700, color: GREEN }}>정답 {right}</div>
      )}
    </div>
  );
}

function TableView({ block, ans, showAnswer }: { block: Block; ans: Answer; showAnswer: boolean }) {
  const b = block as unknown as { rows: Array<[string, ...Cell[]]>; columns: string[]; deviceCard?: boolean };
  const rows = b.rows ?? [];
  const a = (ans && typeof ans === 'object' ? ans : {}) as Record<string, string | number>;

  if (b.deviceCard) {
    const labels = (b.columns ?? []).slice(1);
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
        {rows.map((row, ri) => (
          <div key={ri} style={{ background: '#f5f6f9', borderRadius: 12, border: '1px solid #e3e7ef', overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 0' }}
              dangerouslySetInnerHTML={{ __html: DEVICE_ART_SVG[ri] ?? '' }} />
            <div style={{ padding: '6px 14px 16px' }}>
              <p style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 700, color: INK, textAlign: 'center' }}>{row[0] as string}</p>
              {(row.slice(1) as Cell[]).map((cell, ci) => (
                <div key={ci} style={{ marginBottom: ci < row.length - 2 ? 10 : 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#5d6880', marginBottom: 4 }}>
                    {(labels[ci] ?? '').replace(' (', '(')}
                  </div>
                  <ValueBox value={cellValue(cell, a[`${ri}-${ci}`])} right={cell.answer} showAnswer={showAnswer} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 14 }}>
      <thead>
        <tr>{(b.columns ?? []).map((c, ci) => (
          <th key={ci} style={{ background: '#f0f4ff', padding: '8px 12px', border: '1px solid #e3e7ef', textAlign: 'left' }}>{c}</th>
        ))}</tr>
      </thead>
      <tbody>
        {rows.map((row, ri) => (
          <tr key={ri}>
            <td style={{ padding: '10px 12px', border: '1px solid #e3e7ef', background: '#f8f9fb', color: '#5d6880', fontWeight: 600 }}>{row[0] as string}</td>
            {(row.slice(1) as Cell[]).map((cell, ci) => (
              <td key={ci} style={{ padding: 8, border: '1px solid #e3e7ef' }}>
                <ValueBox value={cellValue(cell, a[`${ri}-${ci}`])} right={cell.answer} showAnswer={showAnswer} />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/* ── 순서 정하기 ───────────────────────────────────────── */
const PANEL_ART_SVG = DEVICE_ART_SVG[1].replace('height:105px;width:auto', 'width:100%');

function OrderView({ block, ans, showAnswer }: { block: Block; ans: Answer; showAnswer: boolean }) {
  const items = (block.items as string[]) ?? [];
  const start = (block.start as number[]) ?? items.map((_, i) => i);
  const v = ans as { items?: number[]; touched?: boolean } | undefined;
  const answered = !!(v && Array.isArray(v.items) && v.touched);
  const order = answered ? v!.items! : start;
  const hasPanel = !!(block as unknown as { panelArt?: number }).panelArt;

  return (
    <div style={{ display: 'flex', gap: 16, alignItems: 'stretch' }}>
      {hasPanel && (
        <div style={{ width: 140, flexShrink: 0, background: '#f5f6f9', borderRadius: 12, padding: '10px 8px', alignSelf: 'flex-start' }}>
          <div dangerouslySetInnerHTML={{ __html: PANEL_ART_SVG }} />
          <p style={{ margin: '6px 0 0', fontSize: 12, color: '#5d6880', lineHeight: 1.5, textAlign: 'center', wordBreak: 'keep-all' }}>
            {String(block.hint ?? '센서에서 시작된 신호는 어디로 갈까요?')}
          </p>
        </div>
      )}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {order.map((itemIdx, pos) => {
          const ok = itemIdx === pos;
          const colored = answered;
          return (
            <div key={itemIdx} style={{
              display: 'flex', alignItems: 'center', gap: 14, minHeight: 46, padding: '0 14px',
              borderRadius: 8,
              border: colored ? `1.5px solid ${ok ? GREEN : ORANGE}` : '1px solid #cfd6df',
              background: colored ? (ok ? GREEN_BG : ORANGE_BG) : '#fff',
            }}>
              <span style={{ width: 18, fontSize: 15, fontWeight: 700, color: '#6b7383' }}>{pos + 1}</span>
              <span style={{ flex: 1, fontSize: 15, color: INK, wordBreak: 'keep-all' }}>{items[itemIdx]}</span>
              {colored && !ok && showAnswer && (
                <span style={{ fontSize: 12, fontWeight: 700, color: GREEN, flexShrink: 0 }}>정답 {itemIdx + 1}번째</span>
              )}
            </div>
          );
        })}
        {!answered && (
          <p style={{ margin: 0, fontSize: 13, color: '#9aa4bf' }}>순서를 바꾸지 않고 냈어요.</p>
        )}
      </div>
    </div>
  );
}

/* ── 서술형 ────────────────────────────────────────────── */
function WriteView({ block, ans }: { block: Block; ans: Answer }) {
  const text = typeof ans === 'string' ? ans.trim() : '';
  const kws = (block.keywords as string[]) ?? [];
  return (
    <div>
      <div style={{
        minHeight: 80, borderRadius: 8, border: '1px solid #cfd6df', background: '#fff',
        padding: '12px 14px', fontSize: 15, lineHeight: 1.6, color: text ? INK : '#9aa4bf', whiteSpace: 'pre-wrap',
      }}>{text || '쓰지 않았어요.'}</div>
      {kws.length > 0 && (
        <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
          {kws.map(k => {
            const on = text.includes(k);
            return (
              <span key={k} style={{
                padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700,
                background: on ? GREEN_BG : '#f3f4f6', color: on ? GREEN : '#5d6880',
                border: `1px solid ${on ? '#8ce99a' : '#e5e7eb'}`,
              }}>{on ? '✓ ' : ''}{k}</span>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── 아직 모양을 못 그리는 유형: 글로 보여 줌 ─────────────── */
function TextFallback({ text }: { text: string }) {
  return (
    <div style={{ background: '#f8f9fb', borderRadius: 8, padding: '10px 14px' }}>
      <span style={{ fontSize: 11.5, fontWeight: 700, color: '#9ca3af', marginRight: 10 }}>내 답</span>
      <span style={{ fontSize: 14, color: INK, whiteSpace: 'pre-wrap' }}>{text}</span>
    </div>
  );
}

/* ── 문항 카드 ─────────────────────────────────────────── */
export default function ResultBlockView({
  block, num, ans, status, fallbackText, showAnswer, comment, commentIcon,
}: {
  block: Block;
  num: number;
  ans: Answer;
  status: Grade;
  fallbackText: string;
  showAnswer: boolean;
  comment?: string;
  commentIcon?: React.ReactNode;
}) {
  const isReview = status === 'review';
  let body: React.ReactNode;
  switch (block.kind) {
    case 'choice': body = <ChoiceView block={block} ans={ans} showAnswer={showAnswer} />; break;
    case 'multi': body = <MultiView block={block} ans={ans} showAnswer={showAnswer} />; break;
    case 'table': body = <TableView block={block} ans={ans} showAnswer={showAnswer} />; break;
    case 'order': body = <OrderView block={block} ans={ans} showAnswer={showAnswer} />; break;
    case 'write': body = <WriteView block={block} ans={ans} />; break;
    default: body = <TextFallback text={fallbackText} />;
  }

  return (
    <div style={{
      borderRadius: 16, background: '#fff', padding: '22px 24px',
      border: isReview ? '2px solid #ffc078' : '1px solid var(--line)',
    }}>
      <div style={{ display: 'flex', gap: 15, alignItems: 'flex-start', marginBottom: 14 }}>
        <span style={{
          display: 'inline-grid', placeItems: 'center', flexShrink: 0, minWidth: 45, borderRadius: 5,
          background: '#e7eef8', color: INK, fontSize: 20, fontWeight: 800, lineHeight: 1.3, padding: '8px 9px',
        }}>{String(num).padStart(2, '0')}</span>
        <p style={{ margin: 0, flex: 1, fontSize: 17, fontWeight: 700, color: INK, lineHeight: 1.55, paddingTop: 6, wordBreak: 'keep-all' }}>
          {String(block.prompt ?? '')}
        </p>
        <span style={{
          flexShrink: 0, marginTop: 8, fontSize: 12, fontWeight: 800, padding: '4px 9px', borderRadius: 7,
          background: isReview ? ORANGE_BG : GREEN_BG, color: isReview ? ORANGE : GREEN,
        }}>{isReview ? '다시 볼 것' : '맞음'}</span>
      </div>

      {body}

      {comment && (
        <div style={{
          display: 'flex', gap: 8, alignItems: 'flex-start', marginTop: 14,
          padding: '10px 12px', background: ORANGE_BG, borderRadius: 8,
        }}>
          <span style={{ color: ORANGE, flexShrink: 0, marginTop: 1 }}>{commentIcon}</span>
          <div>
            <span style={{ fontSize: 11.5, fontWeight: 700, color: ORANGE, marginRight: 8 }}>선생님</span>
            <span style={{ fontSize: 13, color: '#c2410c' }}>{comment}</span>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── 아직 교사 화면 모양으로 못 그리는 유형이 있으면 안내 ────────── */
export const DRAWABLE_KINDS = ['choice', 'multi', 'table', 'order', 'write', 'note'];

export function ResultPreparingNotice() {
  return (
    <div style={{
      margin: '4px 0 4px', borderRadius: 16, border: '1.5px dashed #c5cde0', background: '#f8f9fc',
      padding: '36px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
    }}>
      <span style={{
        width: 52, height: 52, borderRadius: 14, background: '#f3f0ff', color: '#6741d9',
        display: 'grid', placeItems: 'center', marginBottom: 14,
      }}>
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.4-.6-.6-2.4z" />
        </svg>
      </span>
      <span style={{
        fontSize: 11.5, fontWeight: 800, color: '#6741d9', background: '#f3f0ff',
        borderRadius: 6, padding: '3px 8px', marginBottom: 10,
      }}>수정 중</span>
      <p style={{ margin: '0 0 6px', fontSize: 17, fontWeight: 800, color: INK }}>문항별 결과 화면을 고치고 있어요</p>
      <p style={{ margin: 0, fontSize: 14, color: '#5d6880', lineHeight: 1.6, wordBreak: 'keep-all' }}>
        선생님 활동지와 같은 모양으로 보여 주려고 준비하고 있어요.<br />
        선생님 피드백과 결과는 위에서 먼저 볼 수 있어요.
      </p>
    </div>
  );
}
