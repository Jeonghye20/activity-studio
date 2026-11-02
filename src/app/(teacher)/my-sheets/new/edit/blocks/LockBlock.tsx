'use client';

import { useState } from 'react';
import type { LockBlock as T } from '../types';
import { DASHED, DASHED_FOCUS, autoResize, XBtn } from './BlockWrapper';

interface Props { block: T; onChange: (u: Partial<T>) => void; studentView: boolean; }

const NUM_BADGES = ['①', '②', '③', '④'];

const aiBadge: React.CSSProperties = {
  position: 'absolute', right: 8, top: 8,
  height: 20, padding: '0 7px', borderRadius: 10,
  background: '#7048e8', color: '#fff', fontSize: 11, fontWeight: 800,
  display: 'inline-flex', alignItems: 'center', pointerEvents: 'none',
};

export default function LockBlock({ block, onChange, studentView }: Props) {
  const [focusKey, setFocusKey] = useState('');
  const aiLocks = block.aiFields?.includes('locks');

  const lockNumber = block.locks.map(l => l.a).join('');

  function setLock(i: number, field: 'q' | 'a', v: string) {
    const locks = block.locks.map((l, j) => j === i ? { ...l, [field]: v } : l);
    onChange({ locks, aiFields: block.aiFields?.filter(f => f !== 'locks') });
  }

  function addLock() { if (block.locks.length < 4) onChange({ locks: [...block.locks, { q: '', a: '' }] }); }
  function removeLock(i: number) { if (block.locks.length > 2) onChange({ locks: block.locks.filter((_, j) => j !== i) }); }

  if (studentView) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {block.locks.map((l, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 12px', border: '1px solid #e3e7ef', borderRadius: 10 }}>
            <span style={{ fontSize: 16, fontWeight: 800, flexShrink: 0, paddingTop: 2 }}>{NUM_BADGES[i]}</span>
            <span style={{ flex: 1, fontSize: 14 }}>{l.q}</span>
            <div style={{ width: 36, height: 36, border: '1.5px solid #e3e7ef', borderRadius: 8, background: '#fff' }} />
          </div>
        ))}
        <div style={{ padding: '12px 16px', border: '1.5px dashed #e3e7ef', borderRadius: 10, background: '#fbfcfe' }}>
          <span style={{ fontSize: 13, color: '#5d6880', display: 'inline-flex', alignItems: 'center', gap: 4 }}><svg width="12" height="14" viewBox="0 0 10 12" fill="none"><rect x="0.75" y="4.75" width="8.5" height="6.5" rx="1.25" stroke="currentColor" strokeWidth="1.3"/><path d="M3 4.75V3.25a2 2 0 014 0v1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>자물쇠 번호: </span>
          {block.locks.map((_, i) => (
            <span key={i} style={{ display: 'inline-flex', width: 28, height: 28, border: '1.5px solid #e3e7ef', borderRadius: 7, background: '#fff', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 800, margin: '0 3px' }}>?</span>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 10 }}>
        {block.locks.map((l, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 16, fontWeight: 800, flexShrink: 0, width: 22 }}>{NUM_BADGES[i]}</span>
            {/* 문제 textarea */}
            <div style={{ flex: 1, position: 'relative' }}>
              <textarea
                value={l.q}
                onChange={e => { setLock(i, 'q', e.target.value); autoResize(e.target); }}
                onFocus={() => setFocusKey(`q${i}`)} onBlur={() => setFocusKey('')}
                ref={el => { if (el) autoResize(el); }}
                placeholder="문제"
                rows={1}
                style={{ ...DASHED, width: '100%', resize: 'none', overflow: 'hidden', minHeight: 38, background: aiLocks ? '#f3f0ff' : (focusKey === `q${i}` ? '#fff' : '#fbfcfe'), ...(focusKey === `q${i}` ? DASHED_FOCUS : {}), ...(aiLocks ? { paddingRight: 38 } : {}) }}
              />
              {aiLocks && <span style={aiBadge}>AI</span>}
            </div>
            {/* 답 input */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <input
                value={l.a}
                onChange={e => setLock(i, 'a', e.target.value.slice(0, 1))}
                onFocus={() => setFocusKey(`a${i}`)} onBlur={() => setFocusKey('')}
                placeholder="답"
                maxLength={1}
                style={{ ...DASHED, width: 68, height: 38, textAlign: 'center', fontWeight: 800, fontSize: 18, background: aiLocks ? '#f3f0ff' : (focusKey === `a${i}` ? '#fff' : '#fbfcfe'), ...(focusKey === `a${i}` ? DASHED_FOCUS : {}), ...(aiLocks ? { paddingRight: 38 } : {}) }}
              />
              {aiLocks && <span style={aiBadge}>AI</span>}
            </div>
            {block.locks.length > 2 && (
              <XBtn onClick={() => removeLock(i)} />
            )}
          </div>
        ))}
      </div>
      {block.locks.length < 4 && (
        <button onClick={addLock} style={{ height: 32, padding: '0 12px', borderRadius: 8, border: '1.5px dashed #c7cedb', background: 'none', fontSize: 13, color: '#5d6880', cursor: 'pointer', marginBottom: 10 }}>
          + 문제 추가 ({block.locks.length}/4)
        </button>
      )}
      {/* 자물쇠 번호 박스 */}
      <div style={{ padding: '12px 16px', border: '1.5px dashed #e8890c', borderRadius: 12, background: '#fff9f2' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 13.5, fontWeight: 700, color: '#c25e00', display: 'inline-flex', alignItems: 'center', gap: 4 }}><svg width="12" height="14" viewBox="0 0 10 12" fill="none"><rect x="0.75" y="4.75" width="8.5" height="6.5" rx="1.25" stroke="currentColor" strokeWidth="1.3"/><path d="M3 4.75V3.25a2 2 0 014 0v1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>자물쇠 번호</span>
          <div style={{ display: 'flex', gap: 4 }}>
            {block.locks.map((l, i) => (
              <span key={i} style={{ display: 'inline-flex', width: 32, height: 32, border: '1.5px solid #e8890c', borderRadius: 8, background: '#fff', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 850, color: '#c25e00' }}>
                {l.a || '?'}
              </span>
            ))}
          </div>
          <span style={{ fontSize: 12.5, color: '#c25e00' }}>각 문제의 답을 차례로 이으면 번호가 돼요. 맞혀야 다음 문항이 열려요.</span>
        </div>
      </div>
    </div>
  );
}
