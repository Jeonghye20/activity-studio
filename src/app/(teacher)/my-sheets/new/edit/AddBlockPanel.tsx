'use client';

import { useState } from 'react';
import type { BlockType } from './types';
import { BLOCK_TYPE_NAMES, BLOCK_SOURCE } from './types';

interface Props {
  onAdd: (type: BlockType) => void;
}

const BASIC_TYPES: BlockType[] = [
  'choice', 'multi', 'ox', 'short', 'blank',
  'picture', 'line', 'order', 'sort', 'write',
];

const IMPORT_TYPES: BlockType[] = ['data', 'lock', 'opinion'];

const TYPE_ICONS: Record<BlockType, string> = {
  choice:  '①',
  multi:   '☑',
  ox:      'OX',
  short:   '✎',
  blank:   '＿',
  picture: '🖼',
  line:    '⇌',
  order:   '↕',
  sort:    '⊞',
  write:   '✍',
  data:    '📊',
  lock:    '🔒',
  opinion: '💬',
};

const TYPE_DESC: Record<BlockType, string> = {
  choice:  '하나만 고르기',
  multi:   '여러 개 고르기',
  ox:      'O 또는 X',
  short:   '단어·숫자 쓰기',
  blank:   '빈칸 채우기',
  picture: '그림 보고 답하기',
  line:    '짝 맞추기',
  order:   '순서 정하기',
  sort:    '항목 분류',
  write:   '서술형 쓰기',
  data:    '표·자료 읽기',
  lock:    '코드 맞추기',
  opinion: '입장·근거 쓰기',
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
            <span style={{ fontSize: 20, lineHeight: 1 }}>{TYPE_ICONS[t]}</span>
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
