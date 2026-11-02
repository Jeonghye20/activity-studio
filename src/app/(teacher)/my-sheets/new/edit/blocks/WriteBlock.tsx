'use client';

import { useState, useRef } from 'react';
import type { WriteBlock as T } from '../types';
import { DASHED, DASHED_FOCUS, autoResize, AiField } from './BlockWrapper';

interface Props { block: T; onChange: (u: Partial<T>) => void; studentView: boolean; }

export default function WriteBlock({ block, onChange, studentView }: Props) {
  const [kwInput, setKwInput] = useState('');
  const [composing, setComposing] = useState(false);
  const [exFocus, setExFocus] = useState(false);
  const aiKw = block.aiFields?.includes('kw');
  const aiEx = block.aiFields?.includes('ex');

  function addKw() {
    const v = kwInput.trim();
    if (!v || block.kw.includes(v)) { setKwInput(''); return; }
    onChange({ kw: [...block.kw, v], aiFields: block.aiFields?.filter(f => f !== 'kw') });
    setKwInput('');
  }

  function removeKw(i: number) {
    onChange({ kw: block.kw.filter((_, j) => j !== i) });
  }

  if (studentView) {
    return (
      <div>
        {block.kw.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
            <span style={{ fontSize: 13, color: '#5d6880', fontWeight: 700 }}>꼭 넣을 낱말:</span>
            {block.kw.map((k, i) => (
              <span key={i} style={{ height: 28, padding: '0 10px', borderRadius: 8, background: '#eef1f6', color: '#172036', fontSize: 13, fontWeight: 700, display: 'inline-flex', alignItems: 'center' }}>{k}</span>
            ))}
          </div>
        )}
        <div style={{ height: 80, border: '1.5px solid #e3e7ef', borderRadius: 10, background: '#fff' }} />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* 꼭 넣을 낱말 */}
      <div>
        <label style={{ fontSize: 13, fontWeight: 700, color: '#5d6880', display: 'block', marginBottom: 6 }}>꼭 넣을 낱말 (Enter로 추가)</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: '8px 10px', border: '1.5px dashed #c7cedb', borderRadius: 10, background: '#fbfcfe', minHeight: 44, alignItems: 'center' }}>
          {block.kw.map((k, i) => (
            <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, height: 28, padding: '0 8px 0 10px', borderRadius: 8, background: aiKw ? '#ede9fe' : '#eef1f6', fontSize: 13, fontWeight: 700 }}>
              {k}
              <button onClick={() => removeKw(i)} style={{ width: 16, height: 16, border: 0, background: 'none', cursor: 'pointer', color: '#5d6880', fontSize: 14, lineHeight: 1, padding: 0 }}>×</button>
            </span>
          ))}
          <input
            value={kwInput}
            onChange={e => setKwInput(e.target.value)}
            onCompositionStart={() => setComposing(true)}
            onCompositionEnd={() => setComposing(false)}
            onKeyDown={e => { if (e.key === 'Enter' && !composing) { e.preventDefault(); addKw(); } }}
            placeholder="낱말 입력 후 Enter"
            style={{ border: 0, outline: 'none', background: 'none', font: 'inherit', fontSize: 13, minWidth: 120, flex: 1 }}
          />
        </div>
      </div>
      {/* 예시 답 */}
      <AiField active={aiEx}>
        <label style={{ fontSize: 13, fontWeight: 700, color: '#5d6880', display: 'block', marginBottom: 4 }}>예시 답 (학생에게는 보이지 않아요)</label>
        <textarea
          value={block.ex}
          onChange={e => { onChange({ ex: e.target.value, aiFields: block.aiFields?.filter(f => f !== 'ex') }); autoResize(e.target); }}
          onFocus={() => setExFocus(true)} onBlur={() => setExFocus(false)}
          ref={el => { if (el) autoResize(el); }}
          placeholder="예시 답안을 입력하세요"
          rows={2}
          style={{ ...DASHED, resize: 'none', overflow: 'hidden', minHeight: 56, background: aiEx ? '#f3f0ff' : (exFocus ? '#fff' : '#fbfcfe'), ...(exFocus ? DASHED_FOCUS : {}) }}
        />
      </AiField>
    </div>
  );
}
