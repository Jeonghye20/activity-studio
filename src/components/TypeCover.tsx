/**
 * TypeCover — 수업 유형별 일러스트 아이콘 표지
 *
 * TypeIconPaths는 단독 SVG나 랜딩 아이콘 타일에서도 재사용한다.
 */

import { TYPES, mix, type TypeKey } from '@/lib/types';

interface Props {
  type: TypeKey;
  /** 논리 높이 (기본 180). 뷰박스 비율 계산에만 쓰인다. */
  height?: number;
  /** 어두운 배경 여부 */
  dark?: boolean;
  /** 아래쪽 블록 코딩 모티프 (높이 50 이상일 때만 표시) */
  block?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/** 96×64 뷰박스 기준 유형별 일러스트 경로 */
export function TypeIconPaths({ type, color }: { type: TypeKey; color: string }) {
  switch (type) {
    case 'concept': return (
      <>
        <circle cx="48" cy="28" r="13" fill={color} opacity=".18"/>
        <path d="M40 28c0-4.4 3.6-8 8-8s8 3.6 8 8c0 3.3-1.9 6.1-4.7 7.5V40h-6.6v-4.5A8.04 8.04 0 0 1 40 28Z" fill={color}/>
        <rect x="43" y="41.5" width="10" height="2.5" rx="1.25" fill={color} opacity=".55"/>
        <rect x="44.5" y="45.5" width="7" height="2" rx="1" fill={color} opacity=".35"/>
        <line x1="48" y1="10" x2="48" y2="7" stroke={color} strokeWidth="2" strokeLinecap="round"/>
        <line x1="62" y1="15" x2="64" y2="13" stroke={color} strokeWidth="2" strokeLinecap="round"/>
        <line x1="34" y1="15" x2="32" y2="13" stroke={color} strokeWidth="2" strokeLinecap="round"/>
        <line x1="67" y1="28" x2="70" y2="28" stroke={color} strokeWidth="2" strokeLinecap="round"/>
        <line x1="29" y1="28" x2="26" y2="28" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      </>
    );
    case 'escape': return (
      <>
        <rect x="30" y="34" width="36" height="24" rx="5" fill={color} opacity=".75"/>
        <path d="M37 34V24a11 11 0 0 1 22 0v10" stroke={color} strokeWidth="3" fill="none" strokeLinecap="round"/>
        <circle cx="48" cy="44" r="4" fill="white"/>
        <rect x="46" y="45" width="4" height="6" rx="2" fill="white"/>
        <circle cx="72" cy="18" r="3" fill={color} opacity=".3"/>
        <circle cx="24" cy="20" r="2" fill={color} opacity=".2"/>
      </>
    );
    case 'mystery': return (
      <>
        <circle cx="40" cy="28" r="14" stroke={color} strokeWidth="3" fill="none"/>
        <circle cx="40" cy="28" r="9" fill={color} opacity=".18"/>
        <line x1="51" y1="39" x2="64" y2="52" stroke={color} strokeWidth="4" strokeLinecap="round"/>
        <circle cx="35" cy="23" r="4" fill={color} opacity=".3"/>
        <text x="64" y="24" fontSize="18" fontWeight="700" fill={color} opacity=".35" fontFamily="sans-serif">?</text>
      </>
    );
    case 'practice': return (
      <>
        <rect x="16" y="14" width="64" height="40" rx="6" fill={color} opacity=".12"/>
        <rect x="16" y="14" width="64" height="10" rx="6" fill={color} opacity=".2"/>
        <circle cx="24" cy="19" r="2" fill={color} opacity=".4"/>
        <circle cx="31" cy="19" r="2" fill={color} opacity=".4"/>
        <circle cx="38" cy="19" r="2" fill={color} opacity=".4"/>
        <path d="M30 34 l-7 4 7 4" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <path d="M54 34 l7 4-7 4" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <line x1="50" y1="30" x2="46" y2="46" stroke={color} strokeWidth="2" strokeLinecap="round" opacity=".6"/>
      </>
    );
    case 'analysis': return (
      <>
        <rect x="16" y="48" width="12" height="8" rx="2" fill={color} opacity=".3"/>
        <rect x="32" y="36" width="12" height="20" rx="2" fill={color} opacity=".5"/>
        <rect x="48" y="22" width="12" height="34" rx="2" fill={color} opacity=".7"/>
        <rect x="64" y="30" width="12" height="26" rx="2" fill={color}/>
        <line x1="12" y1="56" x2="82" y2="56" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="12" y1="56" x2="12" y2="12" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
        <polyline points="22,46 38,34 54,20 70,28" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity=".5"/>
        <circle cx="22" cy="46" r="2.5" fill={color} opacity=".5"/>
        <circle cx="54" cy="20" r="2.5" fill={color} opacity=".5"/>
        <circle cx="70" cy="28" r="2.5" fill={color} opacity=".5"/>
      </>
    );
    case 'discussion': return (
      <>
        <rect x="8" y="12" width="44" height="26" rx="9" fill={color} opacity=".3"/>
        <polygon points="18,38 28,38 18,48" fill={color} opacity=".3"/>
        <rect x="44" y="24" width="44" height="26" rx="9" fill={color} opacity=".6"/>
        <polygon points="78,50 68,50 78,60" fill={color} opacity=".6"/>
        <line x1="18" y1="22" x2="42" y2="22" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity=".6"/>
        <line x1="18" y1="28" x2="36" y2="28" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity=".6"/>
        <line x1="54" y1="34" x2="78" y2="34" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity=".6"/>
        <line x1="54" y1="40" x2="72" y2="40" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity=".6"/>
      </>
    );
  }
}

export default function TypeCover({
  type,
  height = 180,
  dark = false,
  block = true,
  className,
  style,
}: Props) {
  const T = TYPES[type];
  const W = 250, H = height;

  const bg    = dark ? '#1f2a48' : mix(T.c, 0.8);
  const color = dark ? 'rgba(255,255,255,.9)' : T.c;

  const iconH = Math.round(H * 0.55);
  const iconW = Math.round(iconH * 1.5);
  const iconX = Math.round((W - iconW) / 2);
  const iconY = Math.round((H - iconH) / 2);

  const bx = 16, by = H - 34, bw = 64;

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        width: '100%',
        overflow: 'hidden',
        background: bg,
        ...style,
      }}
      aria-hidden="true"
    >
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid slice"
        width="100%"
        height="100%"
        style={{ display: 'block' }}
      >
        <svg x={iconX} y={iconY} width={iconW} height={iconH} viewBox="0 0 96 64" fill="none">
          <TypeIconPaths type={type} color={color} />
        </svg>

        {block && H > 50 && (
          <>
            <path
              d={`M${bx} ${by}h18l4 4h10l4-4h${bw}v20H${bx}z`}
              fill={T.c}
              opacity={0.9}
            />
            <rect
              x={bx + 10} y={by + 7}
              width={bw - 6} height={6}
              rx={3}
              fill="#fff"
              opacity={0.85}
            />
          </>
        )}
      </svg>
    </div>
  );
}
