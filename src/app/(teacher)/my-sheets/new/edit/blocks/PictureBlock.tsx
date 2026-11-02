'use client';

import { useState } from 'react';
import type { PictureBlock as T } from '../types';
import { DASHED, DASHED_FOCUS, AiField, XBtn } from './BlockWrapper';

interface Props { block: T; onChange: (u: Partial<T>) => void; studentView: boolean; }

/* ── AI 삽화 SVG ── */
function TrafficSVG() {
  return (
    <svg viewBox="0 0 70 110" width="56" height="88" style={{ display: 'block' }}>
      <rect x="12" y="4" width="46" height="100" rx="10" fill="#2b2d42"/>
      <circle cx="35" cy="28" r="14" fill="#3d1c1c" opacity=".8"/>
      <circle cx="35" cy="55" r="14" fill="#3d3010" opacity=".8"/>
      <circle cx="35" cy="82" r="14" fill="#40c057"/>
      <circle cx="35" cy="82" r="9" fill="#69db7c" opacity=".55"/>
    </svg>
  );
}

function RainSVG() {
  return (
    <svg viewBox="0 0 100 90" width="90" height="81" style={{ display: 'block' }}>
      <ellipse cx="50" cy="22" rx="35" ry="16" fill="#adb5bd"/>
      <ellipse cx="32" cy="28" rx="14" ry="11" fill="#adb5bd"/>
      <ellipse cx="68" cy="28" rx="14" ry="11" fill="#adb5bd"/>
      <line x1="28" y1="46" x2="20" y2="64" stroke="#74c0fc" strokeWidth="2.2" strokeLinecap="round"/>
      <line x1="50" y1="48" x2="42" y2="66" stroke="#74c0fc" strokeWidth="2.2" strokeLinecap="round"/>
      <line x1="72" y1="46" x2="64" y2="64" stroke="#74c0fc" strokeWidth="2.2" strokeLinecap="round"/>
      <path d="M14 82 Q50 56 86 82" stroke="#4263eb" strokeWidth="3" fill="none" strokeLinecap="round"/>
      <line x1="50" y1="82" x2="50" y2="90" stroke="#4263eb" strokeWidth="3" strokeLinecap="round"/>
    </svg>
  );
}

function LunchSVG() {
  return (
    <svg viewBox="0 0 120 90" width="108" height="81" style={{ display: 'block' }}>
      <circle cx="36" cy="45" r="28" fill="white" stroke="#5d6880" strokeWidth="2.5"/>
      <line x1="36" y1="45" x2="36" y2="22" stroke="#172036" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="36" y1="45" x2="56" y2="45" stroke="#172036" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="36" cy="45" r="3" fill="#172036"/>
      <rect x="74" y="24" width="42" height="50" rx="7" fill="#f1f3f5" stroke="#dee2e6" strokeWidth="1.5"/>
      <ellipse cx="95" cy="52" rx="14" ry="9" fill="none" stroke="#adb5bd" strokeWidth="1.5"/>
      <ellipse cx="87" cy="35" rx="8" ry="6" fill="#ffe8cc" stroke="#e67700" strokeWidth="1.2"/>
      <ellipse cx="103" cy="35" rx="8" ry="6" fill="#fff4e6" stroke="#e67700" strokeWidth="1.2"/>
    </svg>
  );
}

const AI_SVGS: Record<string, () => React.ReactElement> = {
  traffic: TrafficSVG,
  rain:    RainSVG,
  lunch:   LunchSVG,
};

export default function PictureBlock({ block, onChange, studentView }: Props) {
  const [focusIdx, setFocusIdx] = useState(-1);
  const aiItems = block.aiFields?.includes('items');

  function updateItem(i: number, patch: Partial<{ img: string; a: string }>) {
    const items = block.items.map((it, j) => j === i ? { ...it, ...patch } : it);
    onChange({ items, aiFields: block.aiFields?.filter(f => f !== 'items') });
  }

  function removeCard(i: number) {
    if (block.items.length <= 1) return;
    onChange({ items: block.items.filter((_, j) => j !== i) });
  }

  function addCard() {
    if (block.items.length >= 4) return;
    onChange({ items: [...block.items, { img: '', a: '' }] });
  }

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(block.items.length + (block.items.length < 4 ? 1 : 0), 4)}, minmax(0,1fr))`, gap: 12 }}>
        {block.items.map((item, i) => {
          const AiImg = item.img ? AI_SVGS[item.img] : null;
          const isAiImg = !!AiImg;
          return (
            <div key={i} style={{ border: `1.5px ${studentView ? 'solid' : 'dashed'} #c7cedb`, borderRadius: 12, overflow: 'hidden', background: '#fbfcfe' }}>
              {/* 이미지 영역 */}
              <div style={{ background: isAiImg ? '#f8f9fa' : '#eef1f6', minHeight: 90, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                {isAiImg ? (
                  <>
                    <AiImg />
                    {/* AI 그림 배지 */}
                    <span style={{ position: 'absolute', bottom: 5, right: 5, height: 18, padding: '0 6px', borderRadius: 9, background: '#7048e8', color: '#fff', fontSize: 10, fontWeight: 800, display: 'inline-flex', alignItems: 'center', pointerEvents: 'none' }}>AI 그림</span>
                  </>
                ) : (
                  item.img
                    ? <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><rect x="2" y="2" width="24" height="24" rx="4" stroke="#4a5563" strokeWidth="1.8"/><circle cx="9.5" cy="9.5" r="2.5" stroke="#4a5563" strokeWidth="1.5"/><path d="M2 19l6-6 5 5 5-5 8 8" stroke="#4a5563" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    : studentView
                      ? <span style={{ fontSize: 12, color: '#a3abbb' }}>AI가 만든 그림이 들어가요</span>
                      : <span style={{ fontSize: 12, color: '#a3abbb' }}>이미지 없음</span>
                )}
                {!studentView && (
                  <div style={{ position: 'absolute', right: 4, top: 4 }}>
                    <XBtn onClick={() => removeCard(i)} />
                  </div>
                )}
              </div>
              {/* 정답 칸 */}
              <div style={{ padding: 8 }}>
                <p style={{ margin: '0 0 4px', fontSize: 11.5, fontWeight: 700, color: '#5d6880' }}>정답</p>
                {studentView ? (
                  <div style={{ height: 36, border: '1.5px solid #e3e7ef', borderRadius: 8, background: '#fff' }} />
                ) : (
                  <AiField active={aiItems}>
                    <input
                      value={item.a}
                      onChange={e => updateItem(i, { a: e.target.value })}
                      onFocus={() => setFocusIdx(i)}
                      onBlur={() => setFocusIdx(-1)}
                      placeholder="정답"
                      style={{ ...DASHED, height: 36, background: aiItems ? '#f3f0ff' : (focusIdx === i ? '#fff' : '#fbfcfe'), ...(focusIdx === i ? DASHED_FOCUS : {}), ...(aiItems ? { paddingRight: 38 } : {}) }}
                    />
                  </AiField>
                )}
              </div>
            </div>
          );
        })}
        {/* 추가 카드 */}
        {!studentView && block.items.length < 4 && (
          <button onClick={addCard} style={{ minHeight: 120, border: '1.5px dashed #c7cedb', borderRadius: 12, background: 'none', cursor: 'pointer', display: 'grid', placeItems: 'center', color: '#a3abbb', fontSize: 13 }}>
            + 그림 추가 ({block.items.length}/4)
          </button>
        )}
      </div>
    </div>
  );
}
