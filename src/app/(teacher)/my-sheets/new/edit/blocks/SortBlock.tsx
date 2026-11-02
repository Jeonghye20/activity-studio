'use client';

import { useState } from 'react';
import type { SortBlock as T } from '../types';
import { DASHED, DASHED_FOCUS, XBtn } from './BlockWrapper';

interface Props { block: T; onChange: (u: Partial<T>) => void; studentView: boolean; }

const aiBadge: React.CSSProperties = {
  position: 'absolute', right: 8, top: 8,
  height: 20, padding: '0 7px', borderRadius: 10,
  background: '#7048e8', color: '#fff', fontSize: 11, fontWeight: 800,
  display: 'inline-flex', alignItems: 'center', pointerEvents: 'none',
};

export default function SortBlock({ block, onChange, studentView }: Props) {
  const [focusKey, setFocusKey] = useState('');
  const aiItems = block.aiFields?.includes('items');
  const aiG     = block.aiFields?.includes('g');

  function setGroupName(i: 0 | 1, v: string) {
    const g: [string, string] = [...block.g] as [string, string]; g[i] = v;
    onChange({ g, aiFields: block.aiFields?.filter(f => f !== 'g') });
  }

  function setItem(i: number, v: string) {
    const items = [...block.items]; items[i] = v;
    onChange({ items, aiFields: block.aiFields?.filter(f => f !== 'items') });
  }

  function addItemToGroup(g: 0 | 1) {
    onChange({ items: [...block.items, ''], gi: [...block.gi, g] });
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
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {([0, 1] as const).map(gi => (
          <div key={gi} style={{ border: '1.5px solid #e3e7ef', borderRadius: 12, padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {/* 묶음 이름 */}
            <div style={{ position: 'relative' }}>
              <input
                value={block.g[gi]}
                onChange={e => setGroupName(gi, e.target.value)}
                onFocus={() => setFocusKey(`g${gi}`)} onBlur={() => setFocusKey('')}
                placeholder={`묶음 ${gi + 1} 이름`}
                style={{ ...DASHED, height: 36, fontWeight: 700, width: '100%', background: aiG ? '#f3f0ff' : (focusKey === `g${gi}` ? '#fff' : '#fbfcfe'), ...(focusKey === `g${gi}` ? DASHED_FOCUS : {}), ...(aiG ? { paddingRight: 38 } : {}) }}
              />
              {aiG && <span style={aiBadge}>AI</span>}
            </div>
            {/* 이 묶음에 속하는 항목들 */}
            {block.items.map((item, i) => block.gi[i] === gi && (
              <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                  <input
                    value={item}
                    onChange={e => setItem(i, e.target.value)}
                    onFocus={() => setFocusKey(`i${i}`)} onBlur={() => setFocusKey('')}
                    placeholder={`항목 ${i + 1}`}
                    style={{ ...DASHED, height: 36, width: '100%', background: aiItems ? '#f3f0ff' : (focusKey === `i${i}` ? '#fff' : '#fbfcfe'), ...(focusKey === `i${i}` ? DASHED_FOCUS : {}), ...(aiItems ? { paddingRight: 38 } : {}) }}
                  />
                  {aiItems && <span style={aiBadge}>AI</span>}
                </div>
                <XBtn onClick={() => removeItem(i)} />
              </div>
            ))}
            <button
              onClick={() => addItemToGroup(gi)}
              style={{ height: 32, border: '1.5px dashed #c7cedb', borderRadius: 8, background: 'none', fontSize: 13, color: '#5d6880', cursor: 'pointer' }}
            >+ 항목 추가</button>
          </div>
        ))}
      </div>
    </div>
  );
}
