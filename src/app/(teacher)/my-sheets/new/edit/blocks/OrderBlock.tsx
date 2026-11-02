'use client';

import type { OrderBlock as T } from '../types';
import { DASHED, DASHED_FOCUS, autoResize, AiField } from './BlockWrapper';
import { useState } from 'react';

interface Props { block: T; onChange: (u: Partial<T>) => void; studentView: boolean; }

export default function OrderBlock({ block, onChange, studentView }: Props) {
  const [focusIdx, setFocusIdx] = useState(-1);
  const aiSteps = block.aiFields?.includes('steps');

  function setStep(i: number, v: string) {
    const steps = [...block.steps] as [string, string, string, string];
    steps[i] = v;
    onChange({ steps, aiFields: block.aiFields?.filter(f => f !== 'steps') });
  }

  if (studentView) {
    const shuffled = [...block.steps]
      .map((s, i) => ({ s, key: i }))
      .sort((a, b) => (a.key * 7 + 3) % 4 - (b.key * 7 + 3) % 4); // 고정 셔플
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {shuffled.map(({ s }, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', border: '1px solid #e3e7ef', borderRadius: 10, background: '#f9fafb', fontSize: 14 }}>
            <span style={{ width: 24, height: 24, borderRadius: 7, background: '#eef1f6', display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 850, flexShrink: 0 }}>?</span>
            {s}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: block.noImg ? '1fr' : '120px 1fr', gap: 16, alignItems: 'start' }}>
      {/* 그림 영역 */}
      {!block.noImg && (
        <div style={{ border: '1.5px dashed #c7cedb', borderRadius: 12, background: '#fbfcfe', minHeight: 100, display: 'grid', placeItems: 'center', position: 'relative', padding: 8 }}>
          <span style={{ fontSize: 12, color: '#a3abbb', textAlign: 'center' }}>순서도 그림</span>
          <button onClick={() => onChange({ noImg: true })} style={{ position: 'absolute', right: 6, top: 6, width: 22, height: 22, border: '1px solid #e3e7ef', borderRadius: 6, background: '#fff', fontSize: 13, cursor: 'pointer' }}>×</button>
        </div>
      )}
      {block.noImg && (
        <button onClick={() => onChange({ noImg: false })} style={{ display: 'none' }} />
      )}

      {/* 단계 입력 */}
      <div>
        <p style={{ margin: '0 0 8px', fontSize: 13, color: '#5d6880' }}>맞는 순서대로 쓰세요. 학생에게는 섞여서 보여요.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {block.steps.map((s, i) => (
            <AiField key={i} active={aiSteps}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 24, height: 24, borderRadius: 7, background: '#172036', color: '#fff', display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 850, flexShrink: 0 }}>{i + 1}</span>
                <textarea
                  value={s}
                  onChange={e => { setStep(i, e.target.value); autoResize(e.target); }}
                  onFocus={() => setFocusIdx(i)}
                  onBlur={() => setFocusIdx(-1)}
                  ref={el => { if (el) autoResize(el); }}
                  placeholder={`${i + 1}단계`}
                  rows={1}
                  style={{ ...DASHED, flex: 1, resize: 'none', overflow: 'hidden', minHeight: 38, background: aiSteps ? '#f3f0ff' : (focusIdx === i ? '#fff' : '#fbfcfe'), ...(focusIdx === i ? DASHED_FOCUS : {}), ...(aiSteps ? { paddingRight: 38 } : {}) }}
                />
              </div>
            </AiField>
          ))}
        </div>
        {block.noImg && (
          <button onClick={() => onChange({ noImg: false })} style={{ marginTop: 8, height: 32, padding: '0 10px', borderRadius: 8, border: '1.5px dashed #c7cedb', background: 'none', fontSize: 13, color: '#5d6880', cursor: 'pointer' }}>+ 그림 넣기</button>
        )}
      </div>
    </div>
  );
}
