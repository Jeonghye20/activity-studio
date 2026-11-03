import { TYPES, type TypeKey } from '@/lib/types';

interface Props {
  type: TypeKey;
  height?: number;
  dark?: boolean;
  block?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const TYPE_BG: Record<string, string> = {
  concept:    'linear-gradient(145deg,#c7d2fe 0%,#dbeafe 50%,#eff6ff 100%)',
  escape:     'linear-gradient(145deg,#fde68a 0%,#fed7aa 60%,#fef3c7 100%)',
  mystery:    'linear-gradient(145deg,#c4b5fd 0%,#ddd6fe 55%,#f5f3ff 100%)',
  practice:   'linear-gradient(145deg,#6ee7b7 0%,#a7f3d0 55%,#d1fae5 100%)',
  analysis:   'linear-gradient(145deg,#5eead4 0%,#99f6e4 55%,#ccfbf1 100%)',
  discussion: 'linear-gradient(145deg,#fca5a5 0%,#fecdd3 55%,#ffe4e6 100%)',
  free:       'linear-gradient(145deg,#cbd5e1 0%,#e2e8f0 55%,#f8fafc 100%)',
};

export function TypeIconPaths({ type, color }: { type: TypeKey; color: string }) {
  switch (type) {
    case 'concept': return (
      <>
        <ellipse cx="48" cy="30" rx="36" ry="26" fill={color} opacity=".12"/>
        <circle cx="48" cy="26" r="14" fill={color} opacity=".18"/>
        <path d="M40 26c0-4.4 3.6-8 8-8s8 3.6 8 8c0 3.3-1.9 6.1-4.7 7.5V38h-6.6v-4.5A8.04 8.04 0 0 1 40 26Z" fill={color}/>
        <rect x="43" y="39" width="10" height="2.5" rx="1.25" fill={color} opacity=".6"/>
        <rect x="44.5" y="43" width="7" height="2" rx="1" fill={color} opacity=".4"/>
        <line x1="48" y1="8" x2="48" y2="5" stroke={color} strokeWidth="2.2" strokeLinecap="round"/>
        <line x1="62" y1="13" x2="64" y2="11" stroke={color} strokeWidth="2.2" strokeLinecap="round"/>
        <line x1="34" y1="13" x2="32" y2="11" stroke={color} strokeWidth="2.2" strokeLinecap="round"/>
        <line x1="68" y1="26" x2="71" y2="26" stroke={color} strokeWidth="2.2" strokeLinecap="round"/>
        <line x1="28" y1="26" x2="25" y2="26" stroke={color} strokeWidth="2.2" strokeLinecap="round"/>
        <circle cx="68" cy="52" r="9" fill={color} opacity=".2"/>
        <circle cx="68" cy="52" r="6" fill={color} opacity=".22"/>
        <path d="M63 52l3.5 3.5 6.5-6.5" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      </>
    );
    case 'escape': return (
      <>
        <ellipse cx="48" cy="32" rx="34" ry="26" fill={color} opacity=".15"/>
        <path d="M37 34V24a11 11 0 0 1 22 0v10" stroke={color} strokeWidth="3.5" fill="none" strokeLinecap="round"/>
        <rect x="28" y="32" width="40" height="28" rx="6" fill={color} opacity=".75"/>
        <rect x="30" y="34" width="36" height="24" rx="5" fill={color}/>
        <circle cx="48" cy="44" r="5" fill="white" opacity=".9"/>
        <rect x="45.5" y="44" width="5" height="9" rx="2.5" fill="white" opacity=".9"/>
        <circle cx="74" cy="16" r="3.5" fill={color} opacity=".3"/>
        <circle cx="22" cy="18" r="2.5" fill={color} opacity=".22"/>
        <path d="M78 44l1.5 3.5 3.5 1.5-3.5 1.5-1.5 3.5-1.5-3.5-3.5-1.5 3.5-1.5z" fill={color} opacity=".3"/>
      </>
    );
    case 'mystery': return (
      <>
        <ellipse cx="44" cy="32" rx="36" ry="26" fill={color} opacity=".12"/>
        <circle cx="40" cy="28" r="18" stroke={color} strokeWidth="1.5" fill="none" strokeDasharray="5 3" opacity=".4"/>
        <circle cx="40" cy="28" r="14" stroke={color} strokeWidth="3" fill="none"/>
        <circle cx="40" cy="28" r="9" fill={color} opacity=".2"/>
        <line x1="51" y1="39" x2="65" y2="53" stroke={color} strokeWidth="4.5" strokeLinecap="round"/>
        <text x="34" y="35" fontSize="15" fontWeight="900" fill={color} opacity=".7" fontFamily="sans-serif">?</text>
        <circle cx="72" cy="18" r="5" fill={color} opacity=".28"/>
        <circle cx="78" cy="32" r="3.5" fill={color} opacity=".2"/>
        <circle cx="68" cy="12" r="2.5" fill={color} opacity=".22"/>
      </>
    );
    case 'practice': return (
      <>
        <ellipse cx="48" cy="32" rx="38" ry="26" fill={color} opacity=".12"/>
        <rect x="14" y="12" width="68" height="44" rx="7" fill={color} opacity=".15"/>
        <rect x="14" y="12" width="68" height="12" rx="7" fill={color} opacity=".3"/>
        <circle cx="22" cy="18" r="2.5" fill={color} opacity=".5"/>
        <circle cx="29" cy="18" r="2.5" fill={color} opacity=".5"/>
        <circle cx="36" cy="18" r="2.5" fill={color} opacity=".5"/>
        <rect x="20" y="30" width="44" height="5" rx="2.5" fill={color} opacity=".5"/>
        <rect x="20" y="40" width="32" height="4.5" rx="2.25" fill={color} opacity=".38"/>
        <rect x="20" y="49" width="50" height="4" rx="2" fill={color} opacity=".32"/>
        <path d="M60 28l8 6-8 6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity=".6"/>
      </>
    );
    case 'analysis': return (
      <>
        <ellipse cx="48" cy="36" rx="38" ry="24" fill={color} opacity=".12"/>
        <rect x="14" y="46" width="13" height="10" rx="2" fill={color} opacity=".3"/>
        <rect x="14" y="46" width="13" height="3" rx="1.5" fill={color} opacity=".5"/>
        <rect x="30" y="34" width="13" height="22" rx="2" fill={color} opacity=".5"/>
        <rect x="30" y="34" width="13" height="4" rx="2" fill={color} opacity=".65"/>
        <rect x="46" y="20" width="13" height="36" rx="2" fill={color} opacity=".7"/>
        <rect x="46" y="20" width="13" height="5" rx="2" fill={color} opacity=".85"/>
        <rect x="62" y="28" width="13" height="28" rx="2" fill={color}/>
        <rect x="62" y="28" width="13" height="5" rx="2" fill={color} opacity=".8"/>
        <line x1="10" y1="56" x2="80" y2="56" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="10" y1="56" x2="10" y2="10" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
        <polyline points="20,44 36,32 52,18 68,26" stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity=".6"/>
        <circle cx="20" cy="44" r="3" fill={color} opacity=".65"/>
        <circle cx="52" cy="18" r="3" fill={color} opacity=".65"/>
        <circle cx="68" cy="26" r="3" fill={color} opacity=".65"/>
      </>
    );
    case 'discussion': return (
      <>
        <ellipse cx="50" cy="36" rx="38" ry="24" fill={color} opacity=".12"/>
        <rect x="8" y="10" width="48" height="30" rx="10" fill={color} opacity=".28"/>
        <polygon points="18,40 30,40 18,52" fill={color} opacity=".28"/>
        <rect x="40" y="22" width="48" height="30" rx="10" fill={color} opacity=".62"/>
        <polygon points="78,52 66,52 78,64" fill={color} opacity=".62"/>
        <line x1="16" y1="21" x2="44" y2="21" stroke="white" strokeWidth="1.8" strokeLinecap="round" opacity=".55"/>
        <line x1="16" y1="28" x2="38" y2="28" stroke="white" strokeWidth="1.8" strokeLinecap="round" opacity=".45"/>
        <line x1="48" y1="33" x2="76" y2="33" stroke="white" strokeWidth="1.8" strokeLinecap="round" opacity=".7"/>
        <line x1="48" y1="40" x2="70" y2="40" stroke="white" strokeWidth="1.8" strokeLinecap="round" opacity=".55"/>
        <path d="M60 12c0-3.5-5-3.5-5 0 0 2.5 5 5.5 5 5.5s5-3 5-5.5c0-3.5-5-3.5-5 0z" fill={color} opacity=".5"/>
      </>
    );
    case 'free': return (
      <>
        <ellipse cx="48" cy="32" rx="34" ry="24" fill={color} opacity=".1"/>
        <rect x="22" y="12" width="52" height="40" rx="8" stroke={color} strokeWidth="2.5" fill="none" strokeDasharray="7 4" opacity=".7"/>
        <line x1="48" y1="22" x2="48" y2="40" stroke={color} strokeWidth="2.5" strokeLinecap="round" opacity=".65"/>
        <line x1="34" y1="32" x2="62" y2="32" stroke={color} strokeWidth="2.5" strokeLinecap="round" opacity=".65"/>
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

  const bg    = dark ? '#1f2a48' : (TYPE_BG[type] ?? `linear-gradient(145deg,${T.c}33,${T.c}11)`);
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
