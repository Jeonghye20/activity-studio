'use client';

import { useState, type ReactNode } from 'react';
import type { BlockType } from './types';
import { BLOCK_TYPE_NAMES, BLOCK_SOURCE } from './types';

interface Props {
  onAdd: (type: BlockType) => void;
}

const BASIC_TYPES: BlockType[] = [
  'choice', 'picture', 'line', 'order', 'multi',
  'ox', 'short', 'blank', 'sort', 'write',
];

const IMPORT_TYPES: BlockType[] = ['data', 'lock', 'opinion'];

const TYPE_ICONS: Record<BlockType, ReactNode> = {
  choice:  '①',
  multi:   '☑',
  ox:      'OX',
  short:   '✎',
  blank:   '＿',
  picture: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="2" y="2" width="14" height="14" rx="2" stroke="#4a5563" strokeWidth="1.5"/><circle cx="6.5" cy="6.5" r="1.5" stroke="#4a5563" strokeWidth="1.2"/><path d="M2 12l4-4 3 3 3-3 4 4" stroke="#4a5563" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  line:    '⇌',
  order:   '↕',
  sort:    '⊞',
  write:   <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M3 14l2-1 8-8-1-1-8 8-1 2z" stroke="#4a5563" strokeWidth="1.4" strokeLinejoin="round"/><path d="M12 4l2 2" stroke="#4a5563" strokeWidth="1.4" strokeLinecap="round"/><line x1="3" y1="16" x2="15" y2="16" stroke="#4a5563" strokeWidth="1.2" strokeLinecap="round"/></svg>,
  data:    <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="2" y="10" width="3" height="6" rx="1" fill="#4a5563"/><rect x="7.5" y="6" width="3" height="10" rx="1" fill="#4a5563"/><rect x="13" y="3" width="3" height="13" rx="1" fill="#4a5563"/><line x1="1" y1="16.5" x2="17" y2="16.5" stroke="#4a5563" strokeWidth="1.2"/></svg>,
  lock:    <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="3" y="8" width="12" height="9" rx="2" stroke="#4a5563" strokeWidth="1.5"/><path d="M6 8V6a3 3 0 016 0v2" stroke="#4a5563" strokeWidth="1.5" strokeLinecap="round"/><circle cx="9" cy="12.5" r="1.5" fill="#4a5563"/></svg>,
  opinion: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M2 3h14a1 1 0 011 1v8a1 1 0 01-1 1H6l-4 3V4a1 1 0 011-1z" stroke="#4a5563" strokeWidth="1.5" strokeLinejoin="round"/></svg>,
};

const TYPE_DESC: Record<BlockType, string> = {
  choice:  '보기 중 하나 고르기',
  multi:   '맞는 것을 모두 고르기',
  ox:      '맞으면 O, 틀리면 X',
  short:   '짧게 답 쓰기',
  blank:   '문장 속 빈칸 채우기',
  picture: '그림을 보고 알맞은 답 쓰기',
  line:    '알맞은 짝을 선으로 잇기',
  order:   '단계를 맞는 순서로',
  sort:    '두 묶음으로 나누기',
  write:   '자기 말로 한 문장',
  data:    '표·그래프를 보고 답하기',
  lock:    '문제를 풀어 번호를 찾기',
  opinion: '입장을 고르고 근거 쓰기',
};

export default function AddBlockPanel({ onAdd }: Props) {
  const [open, setOpen] = useState(false);

  function pick(t: BlockType) {
    onAdd(t);
    setOpen(false);
  }

  /* ── 접힌 상태 ── */
  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        style={{
          width: '100%', minHeight: 88, marginTop: 12,
          border: '1.5px dashed #c7cedb', borderRadius: 18,
          background: 'none', cursor: 'pointer',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6,
        }}
      >
        <div style={{ width: 38, height: 38, borderRadius: '50%', border: '1.5px dashed #c7cedb', display: 'grid', placeItems: 'center', fontSize: 22, color: '#a3abbb' }}>+</div>
        <span style={{ fontSize: 14, fontWeight: 800, color: '#5d6880' }}>문항 추가</span>
        <span style={{ fontSize: 12.5, color: '#a3abbb' }}>문항 방식을 골라 새 문항을 넣어요</span>
      </button>
    );
  }

  /* ── 펼친 상태 ── */
  return (
    <div style={{ border: '1.5px solid #4263eb', borderRadius: 18, padding: '18px 20px', background: '#fff', marginTop: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <span style={{ fontSize: 14, fontWeight: 800, color: '#172036' }}>어떤 문항을 넣을까요?</span>
        <button
          onClick={() => setOpen(false)}
          style={{ border: 0, background: 'none', cursor: 'pointer', fontSize: 13.5, color: '#5d6880', fontWeight: 700, padding: '4px 8px', borderRadius: 6 }}
        >닫기</button>
      </div>

      {/* 기본 문항 5열 */}
      <p style={{ margin: '0 0 8px', fontSize: 12, fontWeight: 700, color: '#a3abbb' }}>기본 문항</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8, marginBottom: 16 }}>
        {BASIC_TYPES.map(t => (
          <button
            key={t}
            onClick={() => pick(t)}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
              padding: '14px 8px 12px', borderRadius: 12,
              border: '1.5px solid #e3e7ef', background: '#fff',
              cursor: 'pointer',
            }}
          >
            <span style={{ fontSize: t === 'ox' ? 13 : 20, lineHeight: 1 }}>{TYPE_ICONS[t]}</span>
            <span style={{ fontSize: 12.5, fontWeight: 800, color: '#172036', whiteSpace: 'nowrap' }}>{BLOCK_TYPE_NAMES[t]}</span>
            <span style={{ fontSize: 11, color: '#a3abbb', textAlign: 'center', lineHeight: 1.4 }}>{TYPE_DESC[t]}</span>
          </button>
        ))}
      </div>

      {/* 가져오기 3종 */}
      <p style={{ margin: '0 0 8px', fontSize: 12, fontWeight: 700, color: '#a3abbb' }}>다른 활동지에서 가져오기</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
        {IMPORT_TYPES.map(t => {
          const src = BLOCK_SOURCE[t];
          return (
            <button
              key={t}
              onClick={() => pick(t)}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
                padding: '14px 8px 12px', borderRadius: 12,
                border: `1.5px solid ${src ? src.bg : '#e3e7ef'}`, background: '#fff',
                cursor: 'pointer',
              }}
            >
              <span style={{ fontSize: 20, lineHeight: 1 }}>{TYPE_ICONS[t]}</span>
              <span style={{ fontSize: 12.5, fontWeight: 800, color: '#172036', whiteSpace: 'nowrap' }}>{BLOCK_TYPE_NAMES[t]}</span>
              <span style={{ fontSize: 11, color: '#a3abbb', textAlign: 'center', lineHeight: 1.4 }}>{TYPE_DESC[t]}</span>
              {src && (
                <span style={{ fontSize: 10, fontWeight: 800, padding: '2px 7px', borderRadius: 6, background: src.bg, color: src.color, marginTop: 2 }}>
                  {src.label}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
