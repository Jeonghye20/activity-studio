'use client';

import { useState } from 'react';
import type { MultiBlock as T } from '../types';
import { DASHED, DASHED_FOCUS, XBtn } from './BlockWrapper';

interface Props { block: T; onChange: (u: Partial<T>) => void; studentView: boolean; }

const aiBadge: React.CSSProperties = {
  position: 'absolute', right: 8, top: 8,
  height: 20, padding: '0 7px', borderRadius: 10,
  background: '#7048e8', color: '#fff', fontSize: 11, fontWeight: 800,
  display: 'inline-flex', alignItems: 'center', pointerEvents: 'none',
};

export default function MultiBlock({ block, onChange, studentView }: Props) {
  const [focusIdx, setFocusIdx] = useState(-1);
  const aiOpts = block.aiFields?.includes('opts');
  const aiAns  = block.aiFields?.includes('ans');

  function toggleAns(i: number) {
    if (studentView) return;
    const ans = block.ans.includes(i) ? block.ans.filter(x => x !== i) : [...block.ans, i].sort((a, b) => a - b);
    onChange({ ans, aiAnswered: false, aiChecked: false });
  }

  function setOpt(i: number, v: string) {
    const opts = [...block.opts]; opts[i] = v;
    onChange({ opts, aiFields: block.aiFields?.filter(f => f !== 'opts') });
  }

  function addOpt() { if (block.opts.length < 5) onChange({ opts: [...block.opts, ''] }); }

  function removeOpt(i: number) {
    if (block.opts.length <= 2) return;
    const opts = block.opts.filter((_, j) => j !== i);
    const ans  = block.ans.filter(x => x !== i).map(x => x > i ? x - 1 : x);
    onChange({ opts, ans });
  }

  if (studentView) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {block.opts.map((o, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', border: '1px solid #e3e7ef', borderRadius: 10 }}>
            <span style={{ width: 20, height: 20, border: '2px solid #c5ccd8', borderRadius: 5, display: 'block', flexShrink: 0 }} />
            <span style={{ fontSize: 14 }}>{o || <span style={{ color: '#a3abbb' }}>(보기 {i + 1})</span>}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <p style={{ margin: '0 0 8px', fontSize: 13, color: '#5d6880' }}>체크박스를 눌러 정답을 여러 개 표시하세요</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {block.opts.map((o, i) => {
          const isAns = block.ans.includes(i);
          const aiActive = aiOpts || (aiAns && isAns);
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button
                onClick={() => toggleAns(i)}
                style={{
                  width: 24, height: 24, borderRadius: 6, cursor: 'pointer', flexShrink: 0,
                  border: `2px solid ${isAns ? '#2b8a3e' : '#c5ccd8'}`,
                  background: isAns ? '#ebfbee' : '#fff',
                  display: 'grid', placeItems: 'center',
                }}
              >
                {isAns && <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#2b8a3e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
              </button>
              <div style={{ flex: 1, position: 'relative' }}>
                <input
                  value={o}
                  onChange={e => setOpt(i, e.target.value)}
                  onFocus={() => setFocusIdx(i)}
                  onBlur={() => setFocusIdx(-1)}
                  placeholder={`보기 ${i + 1}`}
                  style={{ ...DASHED, width: '100%', height: 38, background: aiActive ? '#f3f0ff' : (focusIdx === i ? '#fff' : '#fbfcfe'), ...(focusIdx === i ? DASHED_FOCUS : {}), ...(aiActive ? { paddingRight: 38 } : {}) }}
                />
                {aiActive && <span style={aiBadge}>AI</span>}
              </div>
              {block.opts.length > 2 && <XBtn onClick={() => removeOpt(i)} />}
            </div>
          );
        })}
      </div>
      {block.opts.length < 5 && (
        <button onClick={addOpt} style={{ marginTop: 8, height: 34, padding: '0 12px', borderRadius: 8, border: '1.5px dashed #c7cedb', background: 'none', fontSize: 13, color: '#5d6880', cursor: 'pointer' }}>
          + 보기 추가 ({block.opts.length}/5)
        </button>
      )}
    </div>
  );
}
