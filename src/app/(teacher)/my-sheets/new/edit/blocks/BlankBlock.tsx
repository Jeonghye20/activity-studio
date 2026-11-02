'use client';

import { useState } from 'react';
import type { BlankBlock as T } from '../types';
import { DASHED, DASHED_FOCUS, AiField } from './BlockWrapper';

interface Props { block: T; onChange: (u: Partial<T>) => void; studentView: boolean; }

function renderSentence(sent: string) {
  const parts = sent.split(/\[([^\]]+)\]/g);
  return parts.map((p, i) =>
    i % 2 === 0
      ? <span key={i}>{p}</span>
      : <span key={i} style={{ display: 'inline-block', minWidth: 60, height: 22, borderBottom: '2.5px solid #172036', background: '#f0f4ff', borderRadius: 4, padding: '0 4px', fontSize: 14 }}>{p}</span>
  );
}

export default function BlankBlock({ block, onChange, studentView }: Props) {
  const [sentFocus, setSentFocus] = useState(false);
  const [ansFocus, setAnsFocus] = useState(false);
  const aiSent = block.aiFields?.includes('sent');
  const aiA    = block.aiFields?.includes('a');

  if (studentView) {
    return (
      <div>
        <div style={{ padding: '10px 14px', background: '#f9fafb', border: '1px solid #e3e7ef', borderRadius: 10, fontSize: 14, lineHeight: 1.7, marginBottom: 12 }}>
          {block.sent ? renderSentence(block.sent) : <span style={{ color: '#a3abbb' }}>문장이 여기 표시됩니다.</span>}
        </div>
        <div style={{ height: 42, border: '1.5px solid #e3e7ef', borderRadius: 10, background: '#fff' }} />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div>
        <label style={{ fontSize: 13, fontWeight: 700, color: '#5d6880', display: 'block', marginBottom: 4 }}>문장 (빈칸 자리는 [ ]로 표시)</label>
        <AiField active={aiSent}>
          <input
            value={block.sent}
            onChange={e => onChange({ sent: e.target.value, aiFields: block.aiFields?.filter(f => f !== 'sent') })}
            onFocus={() => setSentFocus(true)} onBlur={() => setSentFocus(false)}
            placeholder="예: 조건이 [참]이면 if 아래의 명령을 실행한다."
            style={{ ...DASHED, height: 42, background: aiSent ? '#f3f0ff' : (sentFocus ? '#fff' : '#fbfcfe'), ...(sentFocus ? DASHED_FOCUS : {}), ...(aiSent ? { paddingRight: 38 } : {}) }}
          />
        </AiField>
      </div>
      <div>
        <label style={{ fontSize: 13, fontWeight: 700, color: '#5d6880', display: 'block', marginBottom: 4 }}>정답</label>
        <AiField active={aiA}>
          <input
            value={block.a}
            onChange={e => onChange({ a: e.target.value, aiFields: block.aiFields?.filter(f => f !== 'a') })}
            onFocus={() => setAnsFocus(true)} onBlur={() => setAnsFocus(false)}
            placeholder="빈칸에 들어갈 정답"
            style={{ ...DASHED, height: 42, background: aiA ? '#f3f0ff' : (ansFocus ? '#fff' : '#fbfcfe'), ...(ansFocus ? DASHED_FOCUS : {}), ...(aiA ? { paddingRight: 38 } : {}) }}
          />
        </AiField>
      </div>
    </div>
  );
}
