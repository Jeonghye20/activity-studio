'use client';

import { useState } from 'react';
import type { Block } from '@/types/worksheet';

const PURPLE = '#6741d9';

interface Props {
  block: Block;
  savedValue?: unknown;
  onAnswer: (v: number[]) => void;
}

export default function MultiBlock({ block, savedValue, onAnswer }: Props) {
  const options = (block.options as string[]) ?? [];

  const [selected, setSelected] = useState<number[]>(() => {
    if (Array.isArray(savedValue)) return savedValue as number[];
    return [];
  });

  function toggle(idx: number) {
    const next = selected.includes(idx)
      ? selected.filter(i => i !== idx)
      : [...selected, idx];
    setSelected(next);
    onAnswer(next);
  }

  const isCol = options.some(o => o.length > 14);

  return (
    <div>
      <div style={
        isCol
          ? { display: 'flex', flexDirection: 'column', gap: 8 }
          : { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }
      }>
        {options.map((opt, i) => {
          const on = selected.includes(i);
          return (
            <button
              key={i}
              onClick={() => toggle(i)}
              style={{
                minHeight: 65, borderRadius: 10,
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 14px',
                fontSize: 15, fontWeight: 600, color: '#1f2a44',
                background: on ? '#e7eef8' : '#fff',
                border: on ? '1.5px solid #1f2a44' : '1px solid #cfd6df',
                cursor: 'pointer', textAlign: 'left', width: '100%',
                transition: 'background .1s, border-color .1s',
              }}
            >
              <span style={{
                width: 27, height: 27, borderRadius: 5, flexShrink: 0,
                background: on ? '#1f2a44' : 'transparent',
                border: on ? 'none' : '1px solid #cfd6df',
                color: on ? '#fff' : '#6b7383',
                fontSize: 13, fontWeight: 700,
                display: 'inline-grid', placeItems: 'center',
              }}>
                {i + 1}
              </span>
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}
