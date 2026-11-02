'use client';

import { useState } from 'react';
import type { BlockType } from '../types';
import { BLOCK_TYPE_NAMES, BLOCK_SOURCE } from '../types';

export const DASHED: React.CSSProperties = {
  border: '1.5px dashed #c7cedb',
  borderRadius: 10,
  background: '#fbfcfe',
  padding: '8px 12px',
  font: 'inherit',
  fontSize: 14,
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
};

export const DASHED_FOCUS = {
  border: '1.5px solid #4263eb',
  background: '#fff',
};

export function XBtn({ onClick, size = 22 }: { onClick: () => void; size?: number }) {
  const [h, setH] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{ width: size, height: size, border: 'none', borderRadius: 6, background: 'none', color: h ? '#c92a2a' : '#adb5bd', fontSize: size - 5, cursor: 'pointer', flexShrink: 0, display: 'grid', placeItems: 'center' }}
    >×</button>
  );
}

export function AiField({ children, active }: { children: React.ReactNode; active?: boolean }) {
  if (!active) return <>{children}</>;
  return (
    <div style={{ position: 'relative' }}>
      {children}
      <span style={{
        position: 'absolute', right: 8, top: 8,
        height: 20, padding: '0 7px', borderRadius: 10,
        background: '#7048e8', color: '#fff', fontSize: 11, fontWeight: 800,
        display: 'inline-flex', alignItems: 'center', pointerEvents: 'none',
      }}>AI</span>
    </div>
  );
}

export function autoResize(el: HTMLTextAreaElement | null) {
  if (!el) return;
  el.style.height = 'auto';
  el.style.height = el.scrollHeight + 'px';
}

interface Props {
  index: number;
  blockType: BlockType;
  q: string;
  onQChange: (v: string) => void;
  hint: string;
  hintOn: boolean;
  onHintToggle: (on: boolean) => void;
  onHintChange: (v: string) => void;
  labelChip?: 'lock' | 'ai' | null;
  aiAnswered?: boolean;
  aiChecked?: boolean;
  onAiCheck?: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
  studentView: boolean;
  aiQField?: boolean;
  aiHintField?: boolean;
  errorQ?: boolean;
  blockId?: string;
  children: React.ReactNode;
}

export default function BlockWrapper({
  index, blockType, q, onQChange,
  hint, hintOn, onHintToggle, onHintChange,
  labelChip, aiAnswered, aiChecked, onAiCheck,
  onDelete, onMoveUp, onMoveDown, isFirst, isLast,
  studentView, aiQField, aiHintField, errorQ, blockId, children,
}: Props) {
  const [hover, setHover] = useState(false);
  const [delHover, setDelHover] = useState(false);
  const [qFocus, setQFocus] = useState(false);
  const [hintFocus, setHintFocus] = useState(false);
  const num = String(index + 1).padStart(2, '0');

  const source = BLOCK_SOURCE[blockType];

  const chipBg = source ? source.bg : '#eef1f6';
  const chipColor = source ? source.color : '#5d6880';
  const chipLabel = BLOCK_TYPE_NAMES[blockType];

  const labelChipStyle: React.CSSProperties = {
    position: 'absolute', top: -12, left: 22,
    height: 24, padding: '0 10px', borderRadius: 12,
    display: 'inline-flex', alignItems: 'center', gap: 5,
    fontSize: 12, fontWeight: 800,
    background: labelChip === 'ai' ? '#7048e8' : '#172036',
    color: '#fff',
    userSelect: 'none',
    zIndex: 1,
  };

  return (
    <div
      id={blockId}
      style={{ position: 'relative', background: '#fff', border: `1.5px solid ${errorQ ? '#f03e3e' : '#e3e7ef'}`, borderRadius: 18, padding: '22px 24px', marginBottom: 18 }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* Label chip */}
      {labelChip && !studentView && (
        <span style={labelChipStyle}>
          {labelChip === 'lock' ? (
            <><svg width="10" height="12" viewBox="0 0 10 12" fill="none" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: 4 }}><rect x="0.75" y="4.75" width="8.5" height="6.5" rx="1.25" stroke="currentColor" strokeWidth="1.3"/><path d="M3 4.75V3.25a2 2 0 014 0v1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>기본 정보 · 삭제 불가</>
          ) : '✦ AI가 만든 문항'}
        </span>
      )}

      {/* Block header */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        {/* Number */}
        <span style={{
          flexShrink: 0, width: 32, height: 32, borderRadius: 9,
          background: '#eef1f6', color: '#172036',
          display: 'grid', placeItems: 'center',
          fontSize: 13, fontWeight: 850,
          marginTop: 5,
        }}>{num}</span>

        {/* Question */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <AiField active={!studentView && aiQField}>
            <textarea
              value={q}
              onChange={e => { onQChange(e.target.value); autoResize(e.target); }}
              onFocus={() => setQFocus(true)}
              onBlur={() => setQFocus(false)}
              ref={el => { if (el) autoResize(el); }}
              placeholder="질문을 입력하세요"
              rows={1}
              style={{
                ...DASHED,
                resize: 'none', overflow: 'hidden', minHeight: 42,
                ...(qFocus ? DASHED_FOCUS : {}),
                ...(errorQ && !qFocus ? { border: '1.5px solid #f03e3e' } : {}),
                background: !studentView && aiQField ? '#f3f0ff' : (qFocus ? '#fff' : '#fbfcfe'),
                ...(!studentView && aiQField ? { paddingRight: 38 } : {}),
              }}
              readOnly={studentView}
            />
          </AiField>
        </div>

        {/* Type chip */}
        {!studentView && (
          <span style={{
            flexShrink: 0, height: 28, padding: '0 10px', borderRadius: 8,
            background: chipBg, color: chipColor,
            fontSize: 12.5, fontWeight: 800,
            display: 'inline-flex', alignItems: 'center',
            marginTop: 7,
          }}>{chipLabel}</span>
        )}

        {/* Tools */}
        {!studentView && hover && (
          <div style={{ display: 'flex', gap: 4, flexShrink: 0, marginTop: 4 }}>
            <button
              onClick={onMoveUp} disabled={isFirst}
              style={{ width: 28, height: 28, border: '1px solid #e3e7ef', borderRadius: 7, background: '#fff', fontSize: 14, cursor: isFirst ? 'not-allowed' : 'pointer', opacity: isFirst ? 0.3 : 1 }}
            >↑</button>
            <button
              onClick={onMoveDown} disabled={isLast}
              style={{ width: 28, height: 28, border: '1px solid #e3e7ef', borderRadius: 7, background: '#fff', fontSize: 14, cursor: isLast ? 'not-allowed' : 'pointer', opacity: isLast ? 0.3 : 1 }}
            >↓</button>
            <button
              onClick={onDelete}
              onMouseEnter={() => setDelHover(true)}
              onMouseLeave={() => setDelHover(false)}
              style={{ width: 28, height: 28, border: 'none', borderRadius: 7, background: 'none', color: delHover ? '#c92a2a' : '#adb5bd', fontSize: 17, cursor: 'pointer', transition: 'color 0.12s' }}
            >×</button>
          </div>
        )}
      </div>

      {/* Block content */}
      <div style={{ marginTop: 14 }}>
        {children}
      </div>

      {/* AI 정답 확인 */}
      {!studentView && aiAnswered && !aiChecked && (
        <div style={{ marginTop: 12 }}>
          <button
            onClick={onAiCheck}
            style={{ height: 34, padding: '0 14px', borderRadius: 9, border: '1.5px solid #ffe08a', background: '#fff9db', color: '#6b4d00', fontSize: 13, fontWeight: 800, cursor: 'pointer' }}
          >
            AI가 고른 정답 · 확인하기
          </button>
        </div>
      )}
      {!studentView && aiChecked && (
        <div style={{ marginTop: 12 }}>
          <span style={{ height: 34, padding: '0 14px', borderRadius: 9, background: '#ebfbee', color: '#2b8a3e', fontSize: 13, fontWeight: 800, display: 'inline-flex', alignItems: 'center' }}>
            ✓ 정답 확인했어요
          </span>
        </div>
      )}

      {/* Hint */}
      {!studentView && (
        <div style={{ marginTop: 12 }}>
          {!hintOn ? (
            <button
              onClick={() => onHintToggle(true)}
              style={{ height: 32, padding: '0 12px', borderRadius: 8, border: '1.5px dashed #c7cedb', background: 'none', fontSize: 13, color: '#5d6880', cursor: 'pointer' }}
            >+ 힌트 넣기</button>
          ) : (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#5d6880', flexShrink: 0 }}>힌트</span>
              <div style={{ flex: 1, position: 'relative' }}>
                <input
                  value={hint}
                  onChange={e => onHintChange(e.target.value)}
                  onFocus={() => setHintFocus(true)}
                  onBlur={() => setHintFocus(false)}
                  placeholder="힌트를 입력하세요"
                  style={{ ...DASHED, height: 38, ...(hintFocus ? DASHED_FOCUS : {}), ...(aiHintField ? { paddingRight: 38, background: '#f3f0ff' } : {}) }}
                />
                {aiHintField && (
                  <span style={{ position: 'absolute', right: 8, top: 8, height: 20, padding: '0 7px', borderRadius: 10, background: '#7048e8', color: '#fff', fontSize: 11, fontWeight: 800, display: 'inline-flex', alignItems: 'center', pointerEvents: 'none' }}>AI</span>
                )}
              </div>
              <button
                onClick={() => { onHintToggle(false); onHintChange(''); }}
                style={{ flexShrink: 0, width: 28, height: 28, border: '1px solid #e3e7ef', borderRadius: 7, background: '#fff', fontSize: 15, color: '#5d6880', cursor: 'pointer' }}
              >×</button>
            </div>
          )}
        </div>
      )}
      {studentView && hintOn && hint && (
        <div style={{ marginTop: 10, padding: '8px 12px', background: '#fffbe8', borderRadius: 8, fontSize: 13.5, color: '#6b4d00', display: 'flex', alignItems: 'flex-start', gap: 6 }}>
          <svg width="14" height="14" viewBox="0 0 15 15" fill="none" style={{ flexShrink: 0, marginTop: 1 }}><path d="M7.5 1.5a4 4 0 00-2.3 7.2V10h4.6V8.7A4 4 0 007.5 1.5z" stroke="#6b4d00" strokeWidth="1.3" strokeLinejoin="round"/><path d="M5.2 11.5h4.6M5.8 13h3.4" stroke="#6b4d00" strokeWidth="1.2" strokeLinecap="round"/></svg>
          {hint}
        </div>
      )}
    </div>
  );
}
