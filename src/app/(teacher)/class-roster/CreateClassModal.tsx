'use client';

import { useState, useCallback } from 'react';
import type { ClassRoom } from '@/types/classRoster';
import { newClassId } from '@/lib/classRosterStore';
import { ClassroomSVG } from './ClassCard';

const PRESET_NAMES = ['새싹반', '코딩 동아리', '방과후 A', '자유학기'];

interface Props {
  existingClasses: ClassRoom[];
  nextWallIndex: number;
  onClose: () => void;
  onCreate: (room: ClassRoom) => void;
}

export default function CreateClassModal({ existingClasses, nextWallIndex, onClose, onCreate }: Props) {
  const [tab, setTab] = useState<'num' | 'free'>('num');
  const [grade, setGrade] = useState(2);
  const [room, setRoom]   = useState(1);
  const [freeName, setFreeName] = useState('');

  const stepGrade = (d: number) => setGrade(g => Math.max(1, Math.min(6, g + d)));
  const stepRoom  = (d: number) => setRoom(r  => Math.max(1, Math.min(30, r + d)));

  const numName   = `${grade}학년 ${room}반`;
  const numChalk  = `${grade}-${room}`;
  const freeTrimmed = freeName.trim();
  const freeChalk = freeTrimmed.slice(0, 7);

  const existingNumClasses = existingClasses
    .filter(c => c.kind === 'num')
    .map(c => `${c.grade}-${c.room}`)
    .sort((a, b) => a.localeCompare(b, 'ko'));

  const isDuplicate = tab === 'num'
    ? existingClasses.some(c => c.kind === 'num' && c.grade === grade && c.room === room)
    : freeTrimmed.length > 0 && existingClasses.some(c => c.name === freeTrimmed);

  const dupMsg = isDuplicate
    ? tab === 'num'
      ? `${numName}이(가) 이미 있어요.`
      : `'${freeTrimmed}'이(가) 이미 있어요.`
    : null;

  const canSubmit = !isDuplicate && (tab === 'num' || freeTrimmed.length > 0);

  const previewRoom: ClassRoom = {
    id: 'preview',
    name: tab === 'num' ? numName : (freeTrimmed || '새 학급'),
    chalk: tab === 'num' ? numChalk : (freeChalk || '새 학급'),
    kind: tab,
    ...(tab === 'num' ? { grade, room } : {}),
    wallIndex: nextWallIndex,
    students: [],
  };

  function handleSubmit() {
    if (!canSubmit) return;
    onCreate({
      id: newClassId(),
      name: previewRoom.name,
      chalk: previewRoom.chalk,
      kind: tab,
      ...(tab === 'num' ? { grade, room } : {}),
      wallIndex: nextWallIndex,
      students: [],
    });
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          width: 680, background: '#fff', borderRadius: 'var(--r-lg)',
          boxShadow: '0 12px 48px rgba(0,0,0,0.2)',
          overflow: 'hidden',
        }}
        role="dialog"
        aria-modal="true"
        aria-label="반 만들기"
      >
        {/* 헤더 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px 0' }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: 'var(--ink)' }}>반 만들기</h2>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: 'var(--mute)', lineHeight: 1, padding: '4px 8px' }}
            aria-label="닫기"
          >
            ×
          </button>
        </div>

        {/* 탭 */}
        <div style={{ display: 'flex', gap: 0, padding: '16px 24px 0', borderBottom: '1px solid var(--line)' }}>
          {(['num', 'free'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                padding: '8px 16px',
                fontSize: 14, fontWeight: tab === t ? 700 : 500,
                color: tab === t ? 'var(--concept)' : 'var(--mute)',
                borderBottom: tab === t ? '2px solid var(--concept)' : '2px solid transparent',
                marginBottom: -1,
              }}
            >
              {t === 'num' ? '학년·반 번호' : '이름 직접 쓰기'}
            </button>
          ))}
        </div>

        {/* 본문: 왼쪽 폼 + 오른쪽 미리보기 */}
        <div style={{ display: 'flex', gap: 0 }}>

          {/* 왼쪽 폼 */}
          <div style={{ flex: 1, padding: '24px 24px 0' }}>

            {tab === 'num' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <Stepper label="학년" value={grade} min={1} max={6} onChange={stepGrade} unit="학년" />
                <Stepper label="반"   value={room}  min={1} max={30} onChange={stepRoom}  unit="반" />
                {dupMsg ? (
                  <p style={{ margin: 0, fontSize: 13, color: 'var(--st-help)' }}>{dupMsg}</p>
                ) : (
                  <p style={{ margin: 0, fontSize: 13, color: 'var(--mute)' }}>
                    {existingNumClasses.length > 0
                      ? `이미 있는 반: ${existingNumClasses.join(' · ')}`
                      : '아직 등록된 번호 반이 없어요.'}
                  </p>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--ink)', marginBottom: 6 }}>
                    학급 이름
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      value={freeName}
                      onChange={e => setFreeName(e.target.value.slice(0, 10))}
                      placeholder="예: 새싹반"
                      maxLength={10}
                      style={{
                        width: '100%', height: 44, padding: '0 40px 0 12px',
                        border: `1px solid ${isDuplicate ? 'var(--st-help)' : 'var(--line)'}`,
                        borderRadius: 'var(--r-sm)', fontSize: 15, outline: 'none',
                        fontFamily: 'inherit', boxSizing: 'border-box',
                      }}
                    />
                    <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: 'var(--mute)' }}>
                      {freeName.length}/10
                    </span>
                  </div>
                  {dupMsg ? (
                    <p style={{ margin: '6px 0 0', fontSize: 13, color: 'var(--st-help)' }}>{dupMsg}</p>
                  ) : (
                    <p style={{ margin: '6px 0 0', fontSize: 13, color: 'var(--mute)' }}>
                      칠판에 이 이름이 그대로 써져요. 10자까지 쓸 수 있어요.
                    </p>
                  )}
                </div>
                <div>
                  <p style={{ margin: '0 0 8px', fontSize: 13, color: 'var(--mute)' }}>예시</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {PRESET_NAMES.map(p => (
                      <button
                        key={p}
                        onClick={() => setFreeName(p)}
                        style={{
                          background: freeName === p ? 'var(--sel)' : 'var(--canvas)',
                          border: `1px solid ${freeName === p ? 'var(--concept)' : 'var(--line)'}`,
                          borderRadius: 20, padding: '5px 12px',
                          fontSize: 13, cursor: 'pointer', color: 'var(--ink)',
                        }}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 오른쪽 미리보기 */}
          <div style={{ width: 220, padding: '24px 24px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--mute)', alignSelf: 'flex-start' }}>미리보기</p>
            <div style={{ border: '2px solid var(--line)', borderRadius: 0, overflow: 'hidden' }}>
              <ClassroomSVG room={previewRoom} width={180} height={108} />
              <div style={{ padding: '7px 10px 8px', background: '#fff', minHeight: 40, display: 'flex', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--ink)' }}>
                  {previewRoom.name}
                </span>
                <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--mute)' }}>명단 없음</span>
              </div>
            </div>
          </div>
        </div>

        {/* 푸터 */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, padding: '24px' }}>
          <button
            onClick={onClose}
            style={{
              height: 40, padding: '0 18px', borderRadius: 'var(--r-sm)',
              border: '1px solid var(--line)', background: '#fff',
              fontSize: 14, cursor: 'pointer', color: 'var(--ink)',
            }}
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            style={{
              height: 40, padding: '0 20px', borderRadius: 'var(--r-sm)',
              border: 'none',
              background: canSubmit ? 'var(--concept)' : 'var(--line)',
              color: canSubmit ? '#fff' : 'var(--mute)',
              fontSize: 14, fontWeight: 700, cursor: canSubmit ? 'pointer' : 'default',
              transition: 'background 0.12s',
            }}
          >
            반 만들기
          </button>
        </div>
      </div>
    </div>
  );
}

function Stepper({ label, value, min, max, onChange, unit }: {
  label: string; value: number; min: number; max: number;
  onChange: (d: number) => void; unit: string;
}) {
  return (
    <div>
      <p style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{label}</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
        <StepBtn onClick={() => onChange(-1)} disabled={value <= min} label="감소">−</StepBtn>
        <div style={{
          minWidth: 80, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '1px solid var(--line)', borderLeft: 'none', borderRight: 'none',
          fontSize: 16, fontWeight: 700, color: 'var(--ink)',
        }}>
          {value}{unit}
        </div>
        <StepBtn onClick={() => onChange(+1)} disabled={value >= max} label="증가">+</StepBtn>
      </div>
    </div>
  );
}

function StepBtn({ children, onClick, disabled, label }: {
  children: string; onClick: () => void; disabled: boolean; label: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      style={{
        width: 44, height: 44, border: '1px solid var(--line)', borderRadius: 0,
        background: disabled ? 'var(--canvas)' : '#fff',
        color: disabled ? 'var(--mute)' : 'var(--ink)',
        fontSize: 20, fontWeight: 400, cursor: disabled ? 'default' : 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      {children}
    </button>
  );
}
