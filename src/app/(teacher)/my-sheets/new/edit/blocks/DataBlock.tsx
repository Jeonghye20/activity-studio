'use client';

import { useState } from 'react';
import type { DataBlock as T } from '../types';
import { DASHED, DASHED_FOCUS, autoResize, AiField } from './BlockWrapper';

interface Props { block: T; onChange: (u: Partial<T>) => void; studentView: boolean; }

export default function DataBlock({ block, onChange, studentView }: Props) {
  const [focusKey, setFocusKey] = useState('');
  const aiRows = block.aiFields?.includes('rows');
  const aiA    = block.aiFields?.includes('a');

  function setCol(i: 0 | 1, v: string) {
    const cols: [string, string] = [...block.cols] as [string, string]; cols[i] = v;
    onChange({ cols });
  }

  function setRow(i: number, side: 0 | 1, v: string) {
    const rows = block.rows.map((r, j) => j === i ? (side === 0 ? [v, r[1]] : [r[0], v]) as [string, string] : r);
    onChange({ rows, aiFields: block.aiFields?.filter(f => f !== 'rows') });
  }

  function addRow() { if (block.rows.length < 6) onChange({ rows: [...block.rows, ['', '']] }); }
  function removeRow(i: number) { if (block.rows.length > 2) onChange({ rows: block.rows.filter((_, j) => j !== i) }); }

  const tableStyle: React.CSSProperties = {
    width: '100%', borderCollapse: 'collapse', fontSize: 13.5, marginBottom: 10,
  };
  const thStyle: React.CSSProperties = {
    padding: '8px 10px', fontWeight: 800, fontSize: 12.5, textAlign: 'left',
    background: '#f3f5fa', border: '1px solid #e3e7ef',
  };
  const tdStyle: React.CSSProperties = {
    padding: '6px 8px', border: '1px solid #e3e7ef',
  };

  if (studentView) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: block.noImg ? '1fr' : '160px 1fr', gap: 12 }}>
        {!block.noImg && (
          <div style={{ background: '#eef1f6', borderRadius: 10, minHeight: 100, display: 'grid', placeItems: 'center' }}>
            <span style={{ fontSize: 12, color: '#a3abbb' }}>AI가 만든 그림이 들어가요</span>
          </div>
        )}
        <div>
          <table style={tableStyle}>
            <thead><tr>{block.cols.map((c, i) => <th key={i} style={thStyle}>{c || `열 ${i + 1}`}</th>)}</tr></thead>
            <tbody>{block.rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j} style={tdStyle}>{c}</td>)}</tr>)}</tbody>
          </table>
          <div style={{ height: 60, border: '1.5px solid #e3e7ef', borderRadius: 10, background: '#fff' }} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: block.noImg ? '1fr' : '160px 1fr', gap: 16, alignItems: 'start' }}>
      {/* Graph area */}
      {!block.noImg && (
        <div style={{ border: '1.5px dashed #c7cedb', borderRadius: 12, background: '#fbfcfe', minHeight: 100, display: 'grid', placeItems: 'center', position: 'relative' }}>
          <span style={{ fontSize: 12, color: '#a3abbb', textAlign: 'center' }}>그래프 그림</span>
          <button onClick={() => onChange({ noImg: true })} style={{ position: 'absolute', right: 6, top: 6, width: 22, height: 22, border: '1px solid #e3e7ef', borderRadius: 6, background: '#fff', fontSize: 13, cursor: 'pointer' }}>×</button>
        </div>
      )}
      {block.noImg && (
        <button onClick={() => onChange({ noImg: false })} style={{ display: 'none' }} />
      )}

      {/* Table + Answer */}
      <div>
        <AiField active={aiRows}>
          <table style={tableStyle}>
            <thead>
              <tr>
                {block.cols.map((c, i) => (
                  <th key={i} style={{ ...thStyle, padding: 4 }}>
                    <input value={c} onChange={e => setCol(i as 0 | 1, e.target.value)}
                      placeholder={`열 ${i + 1} 제목`}
                      style={{ ...DASHED, height: 32, fontSize: 12.5, fontWeight: 700 }}
                    />
                  </th>
                ))}
                <th style={{ ...thStyle, width: 28 }} />
              </tr>
            </thead>
            <tbody>
              {block.rows.map((r, i) => (
                <tr key={i}>
                  {r.map((c, j) => (
                    <td key={j} style={{ ...tdStyle, padding: 4 }}>
                      <input value={c} onChange={e => setRow(i, j as 0 | 1, e.target.value)}
                        onFocus={() => setFocusKey(`r${i}c${j}`)} onBlur={() => setFocusKey('')}
                        placeholder={j === 0 ? `항목 ${i + 1}` : `값 ${i + 1}`}
                        style={{ ...DASHED, height: 34, background: aiRows ? '#f3f0ff' : (focusKey === `r${i}c${j}` ? '#fff' : '#fbfcfe'), ...(focusKey === `r${i}c${j}` ? DASHED_FOCUS : {}) }}
                      />
                    </td>
                  ))}
                  <td style={{ ...tdStyle, padding: 4, textAlign: 'center' }}>
                    {block.rows.length > 2 && (
                      <button onClick={() => removeRow(i)} style={{ width: 22, height: 22, border: '1px solid #ffc9c9', borderRadius: 5, background: '#fff5f5', color: '#c92a2a', fontSize: 13, cursor: 'pointer' }}>×</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </AiField>
        {block.rows.length < 6 && (
          <button onClick={addRow} style={{ height: 30, padding: '0 10px', borderRadius: 7, border: '1.5px dashed #c7cedb', background: 'none', fontSize: 12.5, color: '#5d6880', cursor: 'pointer', marginBottom: 10 }}>
            + 줄 추가 ({block.rows.length}/6)
          </button>
        )}
        {block.noImg && (
          <button onClick={() => onChange({ noImg: false })} style={{ height: 30, padding: '0 10px', borderRadius: 7, border: '1.5px dashed #c7cedb', background: 'none', fontSize: 12.5, color: '#5d6880', cursor: 'pointer', marginBottom: 8, marginLeft: 8 }}>+ 그래프 넣기</button>
        )}
        <AiField active={aiA}>
          <label style={{ fontSize: 13, fontWeight: 700, color: '#5d6880', display: 'block', marginBottom: 4 }}>예시 답</label>
          <textarea
            value={block.a}
            onChange={e => { onChange({ a: e.target.value, aiFields: block.aiFields?.filter(f => f !== 'a') }); autoResize(e.target); }}
            onFocus={() => setFocusKey('ans')} onBlur={() => setFocusKey('')}
            ref={el => { if (el) autoResize(el); }}
            placeholder="예시 답안"
            rows={2}
            style={{ ...DASHED, resize: 'none', overflow: 'hidden', minHeight: 52, background: aiA ? '#f3f0ff' : (focusKey === 'ans' ? '#fff' : '#fbfcfe'), ...(focusKey === 'ans' ? DASHED_FOCUS : {}) }}
          />
        </AiField>
      </div>
    </div>
  );
}
