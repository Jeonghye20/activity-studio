'use client';

import { useState } from 'react';
import type { SortBlock as T } from '../types';
import { DASHED, DASHED_FOCUS, AiField } from './BlockWrapper';

interface Props { block: T; onChange: (u: Partial<T>) => void; studentView: boolean; }

export default function SortBlock({ block, onChange, studentView }: Props) {
  const [focusKey, setFocusKey] = useState('');
  const aiItems = block.aiFields?.includes('items');

  function setGroupName(i: 0 | 1, v: string) {
    const g: [string, string] = [...block.g] as [string, string]; g[i] = v;
    onChange({ g });
  }

  function setItem(i: number, v: string) {
    const items = [...block.items]; items[i] = v;
    onChange({ items, aiFields: block.aiFields?.filter(f => f !== 'items') });
  }

  function setGi(i: number, g: 0 | 1) {
    const gi = [...block.gi]; gi[i] = g;
    onChange({ gi });
  }

  function addItem() {
    onChange({ items: [...block.items, ''], gi: [...block.gi, 0] });
  }

  function removeItem(i: number) {
    if (block.items.length <= 2) return;
    onChange({ items: block.items.filter((_, j) => j !== i), gi: block.gi.filter((_, j) => j !== i) });
  }

  if (studentView) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {([0, 1] as const).map(gi => (
          <div key={gi} style={{ border: '1.5px solid #e3e7ef', borderRadius: 12, padding: 12 }}>
            <b style={{ fontSize: 14, display: 'block', marginBottom: 8 }}>{block.g[gi] || `묶음 ${gi + 1}`}</b>
            <div style={{ minHeight: 60, border: '1.5px dashed #c7cedb', borderRadius: 8, background: '#fbfcfe', padding: 8 }} />
          </div>
        ))}
        <div style={{ gridColumn: '1/-1' }}>
          <p style={{ margin: '0 0 8px', fontSize: 13, color: '#5d6880' }}>항목을 알맞은 묶음으로 옮기세요.</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {block.items.map((item, i) => (
              <span key={i} style={{ height: 34, padding: '0 12px', border: '1px solid #e3e7ef', borderRadius: 8, background: '#fff', display: 'inline-flex', alignItems: 'center', fontSize: 14 }}>{item}</span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <p style={{ margin: '0 0 10px', fontSize: 13, color: '#5d6880' }}>학생에게는 항목이 섞여서 보여요.</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
        {([0, 1] as const).map(gi => (
          <div key={gi} style={{ border: '1.5px solid #e3e7ef', borderRadius: 12, padding: 12 }}>
            <input
              value={block.g[gi]}
              onChange={e => setGroupName(gi, e.target.value)}
              placeholder={`묶음 ${gi + 1} 이름`}
              style={{ ...DASHED, height: 36, marginBottom: 8, fontWeight: 700 }}
            />
            {block.items.map((item, i) => block.gi[i] === gi && (
              <div key={i} style={{ padding: '5px 8px', borderRadius: 8, background: '#f3f5fa', fontSize: 13, marginBottom: 4 }}>{item || `(항목 ${i + 1})`}</div>
            ))}
          </div>
        ))}
      </div>
      <AiField active={aiItems}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {block.items.map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                value={item}
                onChange={e => setItem(i, e.target.value)}
                onFocus={() => setFocusKey(`i${i}`)} onBlur={() => setFocusKey('')}
                placeholder={`항목 ${i + 1}`}
                style={{ ...DASHED, flex: 1, height: 38, background: aiItems ? '#f3f0ff' : (focusKey === `i${i}` ? '#fff' : '#fbfcfe'), ...(focusKey === `i${i}` ? DASHED_FOCUS : {}) }}
              />
              <select
                value={block.gi[i]}
                onChange={e => setGi(i, Number(e.target.value) as 0 | 1)}
                style={{ height: 38, border: '1.5px solid #e3e7ef', borderRadius: 8, padding: '0 8px', fontSize: 13, background: '#fff' }}
              >
                <option value={0}>{block.g[0] || '묶음 1'}</option>
                <option value={1}>{block.g[1] || '묶음 2'}</option>
              </select>
              {block.items.length > 2 && (
                <button onClick={() => removeItem(i)} style={{ width: 24, height: 24, border: '1px solid #ffc9c9', borderRadius: 6, background: '#fff5f5', color: '#c92a2a', fontSize: 14, cursor: 'pointer' }}>×</button>
              )}
            </div>
          ))}
        </div>
      </AiField>
      <button onClick={addItem} style={{ marginTop: 8, height: 34, padding: '0 12px', borderRadius: 8, border: '1.5px dashed #c7cedb', background: 'none', fontSize: 13, color: '#5d6880', cursor: 'pointer' }}>
        + 항목 추가
      </button>
    </div>
  );
}
