'use client';

import { useState } from 'react';
import type { OpinionBlock as T } from '../types';
import { DASHED, DASHED_FOCUS, autoResize, AiField } from './BlockWrapper';

interface Props { block: T; onChange: (u: Partial<T>) => void; studentView: boolean; }

export default function OpinionBlock({ block, onChange, studentView }: Props) {
  const [focus, setFocus] = useState('');
  const aiSt = block.aiFields?.includes('st');
  const aiEx = block.aiFields?.includes('ex');

  if (studentView) {
    return (
      <div>
        <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
          {block.st.map((s, i) => (
            <button key={i} style={{ flex: 1, height: 44, border: '1.5px solid #e3e7ef', borderRadius: 10, background: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
              <span style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid #c5ccd8', flexShrink: 0, display: 'block' }} />
              {s || `입장 ${i + 1}`}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {['근거 1', '근거 2'].map((label, i) => (
            <div key={i}>
              <p style={{ margin: '0 0 4px', fontSize: 13, fontWeight: 700, color: '#5d6880' }}>{label}</p>
              <div style={{ height: 52, border: '1.5px solid #e3e7ef', borderRadius: 10, background: '#fff' }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* 두 입장 */}
      <AiField active={aiSt}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 32px 1fr', gap: 8, alignItems: 'center', marginBottom: 12 }}>
          <input
            value={block.st[0]}
            onChange={e => onChange({ st: [e.target.value, block.st[1]], aiFields: block.aiFields?.filter(f => f !== 'st') })}
            onFocus={() => setFocus('st0')} onBlur={() => setFocus('')}
            placeholder="입장 1"
            style={{ ...DASHED, height: 42, background: aiSt ? '#f3f0ff' : (focus === 'st0' ? '#fff' : '#fbfcfe'), ...(focus === 'st0' ? DASHED_FOCUS : {}) }}
          />
          <span style={{ textAlign: 'center', fontWeight: 800, color: '#a3abbb' }}>vs</span>
          <input
            value={block.st[1]}
            onChange={e => onChange({ st: [block.st[0], e.target.value], aiFields: block.aiFields?.filter(f => f !== 'st') })}
            onFocus={() => setFocus('st1')} onBlur={() => setFocus('')}
            placeholder="입장 2"
            style={{ ...DASHED, height: 42, background: aiSt ? '#f3f0ff' : (focus === 'st1' ? '#fff' : '#fbfcfe'), ...(focus === 'st1' ? DASHED_FOCUS : {}) }}
          />
        </div>
      </AiField>
      {/* 예시 답 */}
      <AiField active={aiEx}>
        <label style={{ fontSize: 13, fontWeight: 700, color: '#5d6880', display: 'block', marginBottom: 4 }}>
          예시 답 · 정답이 없는 문항이에요. 채점 참고용이에요.
        </label>
        <textarea
          value={block.ex}
          onChange={e => { onChange({ ex: e.target.value, aiFields: block.aiFields?.filter(f => f !== 'ex') }); autoResize(e.target); }}
          onFocus={() => setFocus('ex')} onBlur={() => setFocus('')}
          ref={el => { if (el) autoResize(el); }}
          placeholder="예시 답안"
          rows={2}
          style={{ ...DASHED, resize: 'none', overflow: 'hidden', minHeight: 56, background: aiEx ? '#f3f0ff' : (focus === 'ex' ? '#fff' : '#fbfcfe'), ...(focus === 'ex' ? DASHED_FOCUS : {}) }}
        />
      </AiField>
    </div>
  );
}
