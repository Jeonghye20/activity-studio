'use client';

import { useState } from 'react';
import type { ShortBlock as T } from '../types';
import { DASHED, DASHED_FOCUS, AiField } from './BlockWrapper';

interface Props { block: T; onChange: (u: Partial<T>) => void; studentView: boolean; }

export default function ShortBlock({ block, onChange, studentView }: Props) {
  const [focus, setFocus] = useState(false);
  const aiA = block.aiFields?.includes('a');

  if (studentView) {
    return <div style={{ height: 42, border: '1.5px solid #e3e7ef', borderRadius: 10, background: '#fff' }} />;
  }

  return (
    <AiField active={aiA}>
      <label style={{ fontSize: 13, fontWeight: 700, color: '#5d6880', display: 'block', marginBottom: 6 }}>정답</label>
      <input
        value={block.a}
        onChange={e => onChange({ a: e.target.value, aiFields: block.aiFields?.filter(f => f !== 'a') })}
        onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
        placeholder="정답 또는 모범 답안"
        style={{ ...DASHED, height: 42, background: aiA ? '#f3f0ff' : (focus ? '#fff' : '#fbfcfe'), ...(focus ? DASHED_FOCUS : {}) }}
      />
    </AiField>
  );
}
