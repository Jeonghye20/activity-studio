'use client';

import type { OxBlock as T } from '../types';

interface Props { block: T; onChange: (u: Partial<T>) => void; studentView: boolean; }

export default function OxBlock({ block, onChange, studentView }: Props) {
  function pick(v: 'O' | 'X') {
    if (studentView) return;
    onChange({ ans: v, aiAnswered: false, aiChecked: false });
  }

  const btnBase: React.CSSProperties = {
    width: 80, height: 80, borderRadius: 16, fontSize: 40, fontWeight: 900, cursor: 'pointer',
    border: '2.5px solid', transition: 'all .1s',
  };

  const selected = studentView ? '' : block.ans;

  return (
    <div>
      {!studentView && (
        <p style={{ margin: '0 0 12px', fontSize: 13, color: '#5d6880' }}>정답을 누르세요</p>
      )}
      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        {(['O', 'X'] as const).map(v => {
          const isOn = selected === v;
          return (
            <button
              key={v}
              onClick={() => pick(v)}
              style={{
                ...btnBase,
                borderColor: isOn ? '#2b8a3e' : '#e3e7ef',
                background: isOn ? '#ebfbee' : '#f9fafb',
                color: isOn ? '#2b8a3e' : '#c5ccd8',
              }}
            >{v}</button>
          );
        })}
      </div>
    </div>
  );
}
