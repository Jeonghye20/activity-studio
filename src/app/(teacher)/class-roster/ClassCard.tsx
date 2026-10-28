'use client';

import type { ClassRoom } from '@/types/classRoster';
import { WALL_COLOR_VALUES } from '@/lib/classRosterDummy';

const FLOOR_COLOR_VALUES = [
  '#c4d6e8', '#bedad0', '#e8ddb6', '#d8bceb', '#e5bcd1', '#bce8e8',
] as const;

function chalkFontSize(text: string): number {
  const len = text.length;
  if (len <= 3) return 30;
  if (len <= 5) return 23;
  if (len <= 7) return 18;
  return 15;
}

interface SVGProps {
  room: Pick<ClassRoom, 'chalk' | 'wallIndex' | 'students'>;
  width?: number;
  height?: number;
}

export function ClassroomSVG({ room, width = 180, height = 108 }: SVGProps) {
  const wallColor  = WALL_COLOR_VALUES[room.wallIndex % WALL_COLOR_VALUES.length];
  const floorColor = FLOOR_COLOR_VALUES[room.wallIndex % FLOOR_COLOR_VALUES.length];
  const hasStudents = room.students.length > 0;
  const textOpacity = hasStudents ? 1 : 0.32;
  const fontSize = chalkFontSize(room.chalk);

  return (
    <svg
      viewBox="0 0 180 108"
      width={width}
      height={height}
      aria-hidden="true"
      style={{ display: 'block' }}
    >
      {/* 벽 */}
      <rect width="180" height="108" fill={wallColor} />
      {/* 바닥 */}
      <rect y="88" width="180" height="20" fill={floorColor} />

      {/* 칠판 나무 테두리 */}
      <rect x="44" y="18" width="92" height="57" rx="2" fill="#c49060" />
      {/* 칠판 면 */}
      <rect x="50" y="23" width="80" height="43" fill="#2c4c38" />
      {/* 분필받이 */}
      <rect x="50" y="64" width="80" height="8" rx="1" fill="#a87040" />
      {/* 분필 */}
      <rect x="55" y="66" width="13" height="3" rx="1.5" fill="#e8e0d0" opacity="0.9" />
      <rect x="72" y="66.5" width="9" height="2.5" rx="1.2" fill="#e8e0d0" opacity="0.65" />

      {/* 칠판 글씨 */}
      <text
        x="90" y="47"
        textAnchor="middle"
        dominantBaseline="middle"
        fill={`rgba(224,238,220,${textOpacity})`}
        fontSize={fontSize}
        fontWeight="700"
        fontFamily="'Pretendard Variable', Pretendard, sans-serif"
        letterSpacing="-0.03em"
      >
        {room.chalk}
      </text>

      {/* 시계 */}
      <circle cx="15" cy="13" r="8" fill="rgba(255,255,255,0.4)" stroke="rgba(0,0,0,0.15)" strokeWidth="1" />
      <circle cx="15" cy="13" r="1.2" fill="rgba(0,0,0,0.3)" />
      <line x1="15" y1="13" x2="12.2" y2="8.6"  stroke="rgba(0,0,0,0.35)" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="15" y1="13" x2="19.8" y2="11.2" stroke="rgba(0,0,0,0.28)" strokeWidth="1"   strokeLinecap="round" />
    </svg>
  );
}

interface CardProps {
  room: ClassRoom;
  absentCount: number;
  isSelected: boolean;
  onClick: () => void;
}

export default function ClassCard({ room, absentCount, isSelected, onClick }: CardProps) {
  const hasStudents = room.students.length > 0;

  return (
    <button
      onClick={onClick}
      style={{
        position: 'relative',
        width: 184,
        flexShrink: 0,
        background: '#fff',
        border: `2px solid ${isSelected ? 'var(--side)' : 'var(--line)'}`,
        borderRadius: 0,
        padding: 0,
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'border-color 0.12s',
      }}
    >
      {/* 교실 일러스트 */}
      <div style={{ lineHeight: 0, overflow: 'hidden' }}>
        <ClassroomSVG room={room} width={180} height={108} />
      </div>

      {/* 아래 줄 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '7px 10px 8px',
          background: isSelected ? 'var(--side)' : '#fff',
          color: isSelected ? '#fff' : 'var(--ink)',
          minHeight: 40,
          gap: 4,
        }}
      >
        <span style={{ fontWeight: 700, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
          {room.name}
        </span>
        {hasStudents ? (
          <span style={{ flexShrink: 0, fontSize: 12, color: isSelected ? 'rgba(255,255,255,0.85)' : 'var(--mute)' }}>
            {room.students.length}명
            {absentCount > 0 && (
              <span style={{ marginLeft: 5, color: isSelected ? '#ffb3b3' : 'var(--st-help)', fontWeight: 600 }}>
                ● 결석 {absentCount}
              </span>
            )}
          </span>
        ) : (
          <span style={{ flexShrink: 0, fontSize: 12, color: isSelected ? 'rgba(255,255,255,0.6)' : 'var(--mute)' }}>
            명단 없음
          </span>
        )}
      </div>

      {/* 선택 시 노란 밑줄 */}
      {isSelected && (
        <div style={{ height: 3, background: 'var(--signal)' }} />
      )}
    </button>
  );
}
