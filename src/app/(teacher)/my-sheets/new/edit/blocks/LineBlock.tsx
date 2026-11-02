'use client';

import { useState } from 'react';
import type { LineBlock as T } from '../types';
import { DASHED, DASHED_FOCUS, AiField } from './BlockWrapper';

interface Props { block: T; onChange: (u: Partial<T>) => void; studentView: boolean; }

const CIRCLE_L = ['①', '②', '③', '④', '⑤'];
const CIRCLE_R = ['㉠', '㉡', '㉢', '㉣', '㉤'];

export default function LineBlock({ block, onChange, studentView }: Props) {
  const [focusKey, setFocusKey] = useState('');
  const aiPairs = block.aiFields?.includes('pairs');

  function setCol(i: 0 | 1, v: string) {
    const cols: [string, string] = [...block.cols] as [string, string];
    cols[i] = v;
    onChange({ cols });
  }

  function setPair(i: number, side: 0 | 1, v: string) {
    const pairs = block.pairs.map((p, j) => j === i ? (side === 0 ? [v, p[1]] : [p[0], v]) as [string, string] : p);
    onChange({ pairs, aiFields: block.aiFields?.filter(f => f !== 'pairs') });
  }

  function addPair() {
    if (block.pairs.length >= 5) return;
    onChange({ pairs: [...block.pairs, ['', '']] });
  }

  function removePair(i: number) {
    if (block.pairs.length <= 2) return;
    onChange({ pairs: block.pairs.filter((_, j) => j !== i) });
  }

  if (studentView) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '8px 12px', alignItems: 'center' }}>
        {/* Left header */}
        <b style={{ fontSize: 13, color: '#5d6880' }}>{block.cols[0] || '왼쪽'}</b>
        <span />
        <b style={{ fontSize: 13, color: '#5d6880' }}>{block.cols[1] || '오른쪽'}</b>
        {block.pairs.map((p, i) => (
          [
            <div key={`l${i}`} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 10px', border: '1px solid #e3e7ef', borderRadius: 9 }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: '#5d6880' }}>{CIRCLE_L[i]}</span>
              <span style={{ fontSize: 14 }}>{p[0]}</span>
            </div>,
            <span key={`c${i}`} style={{ textAlign: 'center', color: '#c5ccd8', fontSize: 12 }}>——</span>,
            <div key={`r${i}`} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 10px', border: '1px solid #e3e7ef', borderRadius: 9 }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: '#5d6880' }}>{CIRCLE_R[i]}</span>
              <span style={{ fontSize: 14 }}>{p[1]}</span>
            </div>,
          ]
        ))}
      </div>
    );
  }

  return (
    <div>
      <p style={{ margin: '0 0 10px', fontSize: 13, color: '#5d6880' }}>한 줄에 맞는 짝끼리 쓰세요. 학생에게는 오른쪽이 섞이고 ㉠㉡㉢ 기호가 붙어요.</p>
      {/* Column headers */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 24px 1fr 28px', gap: 8, marginBottom: 6 }}>
        {([0, 1] as (0 | 1)[]).map(side => (
          <input key={side} value={block.cols[side]} onChange={e => setCol(side, e.target.value)}
            placeholder={side === 0 ? '왼쪽 열 제목' : '오른쪽 열 제목'}
            style={{ ...DASHED, height: 36, fontSize: 13, fontWeight: 700 }}
          />
        ))}
        <span />
        <span />
      </div>
      {/* Pairs */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {block.pairs.map((p, i) => (
          <AiField key={i} active={aiPairs}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 24px 1fr 28px', gap: 8, alignItems: 'center' }}>
              <input value={p[0]} onChange={e => setPair(i, 0, e.target.value)}
                onFocus={() => setFocusKey(`l${i}`)} onBlur={() => setFocusKey('')}
                placeholder={`왼쪽 ${i + 1}`}
                style={{ ...DASHED, height: 38, background: aiPairs ? '#f3f0ff' : (focusKey === `l${i}` ? '#fff' : '#fbfcfe'), ...(focusKey === `l${i}` ? DASHED_FOCUS : {}) }}
              />
              <span style={{ textAlign: 'center', color: '#a3abbb', fontSize: 13 }}>——</span>
              <input value={p[1]} onChange={e => setPair(i, 1, e.target.value)}
                onFocus={() => setFocusKey(`r${i}`)} onBlur={() => setFocusKey('')}
                placeholder={`오른쪽 ${i + 1}`}
                style={{ ...DASHED, height: 38, background: aiPairs ? '#f3f0ff' : (focusKey === `r${i}` ? '#fff' : '#fbfcfe'), ...(focusKey === `r${i}` ? DASHED_FOCUS : {}) }}
              />
              {block.pairs.length > 2 ? (
                <button onClick={() => removePair(i)} style={{ width: 24, height: 24, border: '1px solid #ffc9c9', borderRadius: 6, background: '#fff5f5', color: '#c92a2a', fontSize: 14, cursor: 'pointer' }}>×</button>
              ) : <span />}
            </div>
          </AiField>
        ))}
      </div>
      {block.pairs.length < 5 && (
        <button onClick={addPair} style={{ marginTop: 8, height: 34, padding: '0 12px', borderRadius: 8, border: '1.5px dashed #c7cedb', background: 'none', fontSize: 13, color: '#5d6880', cursor: 'pointer' }}>
          + 짝 추가 ({block.pairs.length}/5)
        </button>
      )}
    </div>
  );
}
