'use client';

import { useState } from 'react';
import type { Block } from '@/types/worksheet';

interface OrderAnswer {
  items: number[];
  touched: boolean;
}

interface Props {
  block: Block;
  savedValue?: unknown;
  onAnswer: (v: OrderAnswer) => void;
}

const PANEL_ART_SVG = `<svg viewBox="0 0 220 160" style="width:100%;display:block" aria-hidden="true"><path d="M69 96h82l-12 54H81z" fill="#d7a075"/><ellipse cx="110" cy="96" rx="42" ry="9" fill="#805c42"/><path d="M110 95V39" stroke="#477e51" stroke-width="5"/><path d="M109 69Q68 73 68 37q38-1 41 32M111 54q4-36 40-33-1 34-40 33" fill="#73a96c"/><rect x="159" y="102" width="25" height="33" rx="4" fill="#7da9b4"/><path d="M172 102V80h-36V96" stroke="#658d98" stroke-width="4" fill="none"/><rect x="61" y="83" width="8" height="35" rx="3" fill="#55836e"/><path d="M65 83V72h-20" stroke="#55836e" stroke-width="3" fill="none"/><path d="M136 100l-3 7m3 0-3 7" stroke="#62adcb" stroke-width="3"/><path d="M50 154h140" stroke="#c9d8bd" stroke-width="4"/></svg>`;

export default function OrderBlock({ block, savedValue, onAnswer }: Props) {
  const items = (block.items as string[]) ?? [];
  const startIndices = (block.start as number[]) ?? items.map((_, i) => i);

  const [order, setOrder] = useState<number[]>(() => {
    if (savedValue && typeof savedValue === 'object' && !Array.isArray(savedValue)) {
      const v = savedValue as OrderAnswer;
      if (Array.isArray(v.items) && v.items.length === items.length) return v.items;
    }
    return startIndices;
  });
  const [touched, setTouched] = useState<boolean>(() => {
    if (savedValue && typeof savedValue === 'object' && !Array.isArray(savedValue)) {
      return !!(savedValue as OrderAnswer).touched;
    }
    return false;
  });

  function move(idx: number, dir: -1 | 1) {
    const next = [...order];
    const target = idx + dir;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target], next[idx]];
    setOrder(next);
    setTouched(true);
    onAnswer({ items: next, touched: true });
  }

  return (
    <div style={{ display: 'flex', gap: 16, alignItems: 'stretch' }}>
      {/* 왼쪽 그림 패널 */}
      <div style={{
        width: 180, flexShrink: 0,
        background: '#f7f8fb', borderRadius: 16, overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
      }}>
        <div dangerouslySetInnerHTML={{ __html: PANEL_ART_SVG }} />
        <p style={{ margin: 0, padding: '8px 12px', fontSize: 12, color: '#5d6880', lineHeight: 1.5, textAlign: 'center' }}>
          센서에서 시작된 신호는 어디로 갈까요?
        </p>
      </div>

      {/* 오른쪽 목록 */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {order.map((itemIdx, pos) => (
          <div key={itemIdx} style={{
            display: 'flex', alignItems: 'center', gap: 14,
            height: 58, padding: '0 10px 0 18px',
            borderRadius: 14, border: '1.5px solid #e3e7ef', background: '#fff',
          }}>
            {/* 번호 */}
            <span style={{
              width: 24, flexShrink: 0,
              fontSize: 15, fontWeight: 800, color: '#6b7383',
            }}>
              {pos + 1}
            </span>
            {/* 텍스트 */}
            <span style={{ flex: 1, fontSize: 15, fontWeight: 600, color: '#172036' }}>
              {items[itemIdx]}
            </span>
            {/* 이동 버튼 */}
            <div style={{ display: 'flex', gap: 4 }}>
              <button
                onClick={() => move(pos, -1)}
                disabled={pos === 0}
                aria-label="위로"
                style={{
                  width: 36, height: 36, borderRadius: 8,
                  border: '1px solid #cfd6df', background: '#fff',
                  fontSize: 14, fontWeight: 800,
                  cursor: pos === 0 ? 'default' : 'pointer',
                  opacity: pos === 0 ? 0.3 : 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >↑</button>
              <button
                onClick={() => move(pos, 1)}
                disabled={pos === order.length - 1}
                aria-label="아래로"
                style={{
                  width: 36, height: 36, borderRadius: 8,
                  border: '1px solid #cfd6df', background: '#fff',
                  fontSize: 14, fontWeight: 800,
                  cursor: pos === order.length - 1 ? 'default' : 'pointer',
                  opacity: pos === order.length - 1 ? 0.3 : 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >↓</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
