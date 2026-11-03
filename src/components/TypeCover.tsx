import { TYPES, type TypeKey } from '@/lib/types';

interface Props {
  type: TypeKey;
  height?: number;
  dark?: boolean;
  block?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/* ─ gradient backgrounds (light mode) ─ */
const TYPE_BG: Record<string, string> = {
  concept:    'linear-gradient(145deg,#c7d2fe 0%,#dbeafe 50%,#eff6ff 100%)',
  escape:     'linear-gradient(145deg,#fde68a 0%,#fed7aa 60%,#fef3c7 100%)',
  mystery:    'linear-gradient(145deg,#c4b5fd 0%,#ddd6fe 55%,#f5f3ff 100%)',
  practice:   'linear-gradient(145deg,#6ee7b7 0%,#a7f3d0 55%,#d1fae5 100%)',
  analysis:   'linear-gradient(145deg,#5eead4 0%,#99f6e4 55%,#ccfbf1 100%)',
  discussion: 'linear-gradient(145deg,#fca5a5 0%,#fecdd3 55%,#ffe4e6 100%)',
  free:       'linear-gradient(145deg,#cbd5e1 0%,#e2e8f0 55%,#f8fafc 100%)',
};

/* ─ full-bleed illustrations (200 × 120 viewBox) ─ */
function Illustration({ type }: { type: TypeKey }) {
  switch (type) {
    case 'concept': return (
      <>
        <ellipse cx="105" cy="58" rx="70" ry="52" fill="#3b82f6" opacity=".14"/>
        <rect x="55" y="22" width="30" height="78" rx="5" fill="#2563eb" opacity=".3"/>
        <rect x="85" y="22" width="42" height="78" rx="5" fill="#3b82f6" opacity=".22"/>
        <line x1="85" y1="22" x2="85" y2="100" stroke="#1d4ed8" strokeWidth="1.5" opacity=".4"/>
        <rect x="89" y="28" width="34" height="4" rx="2" fill="#93c5fd" opacity=".5"/>
        <rect x="89" y="36" width="28" height="3" rx="1.5" fill="#93c5fd" opacity=".35"/>
        <rect x="89" y="43" width="32" height="3" rx="1.5" fill="#93c5fd" opacity=".3"/>
        <circle cx="152" cy="68" r="22" fill="#2563eb" opacity=".2"/>
        <circle cx="152" cy="68" r="16" fill="#3b82f6" opacity=".3"/>
        <circle cx="152" cy="68" r="10" fill="#2563eb" opacity=".25"/>
        <path d="M143 68l6 6 10-10" stroke="#1d4ed8" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity=".75"/>
        <path d="M42 35l1.5 3.5 3.5 1.5-3.5 1.5-1.5 3.5-1.5-3.5-3.5-1.5 3.5-1.5z" fill="#3b82f6" opacity=".45"/>
      </>
    );
    case 'escape': return (
      <>
        <ellipse cx="100" cy="60" rx="70" ry="50" fill="#fbbf24" opacity=".18"/>
        <rect x="58" y="28" width="84" height="72" rx="12" fill="#d97706" opacity=".22"/>
        <rect x="62" y="22" width="76" height="70" rx="10" fill="#f59e0b" opacity=".38"/>
        <rect x="66" y="26" width="68" height="62" rx="8" fill="#fbbf24" opacity=".25"/>
        <rect x="89" y="14" width="22" height="28" rx="11" fill="none" stroke="#92400e" strokeWidth="3.5" opacity=".7"/>
        <rect x="82" y="28" width="36" height="28" rx="7" fill="#92400e" opacity=".55"/>
        <circle cx="100" cy="40" r="7" fill="#fef3c7" opacity=".95"/>
        <circle cx="100" cy="40" r="3.5" fill="#92400e" opacity=".5"/>
        <rect x="97.5" y="40" width="5" height="9" rx="2.5" fill="#d97706" opacity=".85"/>
        <path d="M32 35l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" fill="#f59e0b" opacity=".45"/>
        <path d="M162 72l1.5 3.5 3.5 1.5-3.5 1.5-1.5 3.5-1.5-3.5-3.5-1.5 3.5-1.5z" fill="#fbbf24" opacity=".5"/>
        <circle cx="36" cy="85" r="5" fill="#fde68a" opacity=".4"/>
        <circle cx="168" cy="28" r="4" fill="#f59e0b" opacity=".35"/>
      </>
    );
    case 'mystery': return (
      <>
        <ellipse cx="90" cy="62" rx="65" ry="50" fill="#8b5cf6" opacity=".18"/>
        <circle cx="88" cy="60" r="36" fill="none" stroke="#7c3aed" strokeWidth="2.5" opacity=".3" strokeDasharray="6 4"/>
        <circle cx="88" cy="60" r="27" fill="#8b5cf6" opacity=".18"/>
        <circle cx="88" cy="60" r="18" fill="#7c3aed" opacity=".2"/>
        <path d="M111 83l24 24" stroke="#6d28d9" strokeWidth="6" strokeLinecap="round" opacity=".4"/>
        <circle cx="88" cy="60" r="27" fill="none" stroke="#7c3aed" strokeWidth="3" opacity=".45"/>
        <text x="80" y="68" fontSize="18" fill="#6d28d9" opacity=".65" fontWeight="900" fontFamily="sans-serif">?</text>
        <circle cx="152" cy="30" r="7" fill="#ddd6fe" opacity=".55"/>
        <circle cx="164" cy="50" r="5" fill="#c4b5fd" opacity=".5"/>
        <circle cx="148" cy="52" r="4" fill="#ede9fe" opacity=".7"/>
        <path d="M148 28l1.5 3.5 3.5 1.5-3.5 1.5-1.5 3.5-1.5-3.5-3.5-1.5 3.5-1.5z" fill="#8b5cf6" opacity=".5"/>
      </>
    );
    case 'practice': return (
      <>
        <rect x="28" y="14" width="144" height="92" rx="14" fill="rgba(6,78,59,.35)"/>
        <rect x="28" y="14" width="144" height="28" rx="14" fill="#059669" opacity=".5"/>
        <circle cx="46" cy="28" r="6" fill="#fca5a5" opacity=".8"/>
        <circle cx="62" cy="28" r="6" fill="#fde68a" opacity=".8"/>
        <circle cx="78" cy="28" r="6" fill="#6ee7b7" opacity=".8"/>
        <text x="38" y="58" fontSize="9" fill="#6ee7b7" opacity=".8" fontFamily="monospace">def predict(x):</text>
        <rect x="38" y="63" width="90" height="5" rx="2.5" fill="#10b981" opacity=".45"/>
        <text x="50" y="76" fontSize="9" fill="#a7f3d0" opacity=".7" fontFamily="monospace">return model(x)</text>
        <rect x="38" y="80" width="68" height="4.5" rx="2.25" fill="#10b981" opacity=".35"/>
        <rect x="38" y="90" width="100" height="4.5" rx="2.25" fill="#059669" opacity=".4"/>
        <rect x="138" y="55" width="22" height="38" rx="5" fill="rgba(52,211,153,.2)"/>
        <rect x="140" y="62" width="18" height="5" rx="2.5" fill="#34d399" opacity=".6"/>
        <rect x="140" y="72" width="14" height="4" rx="2" fill="#10b981" opacity=".5"/>
        <rect x="140" y="80" width="16" height="4" rx="2" fill="#34d399" opacity=".45"/>
      </>
    );
    case 'analysis': return (
      <>
        <ellipse cx="100" cy="65" rx="75" ry="48" fill="#14b8a6" opacity=".18"/>
        <rect x="32" y="52" width="22" height="52" rx="5" fill="#0d9488" opacity=".38"/>
        <rect x="32" y="52" width="22" height="6" rx="3" fill="#2dd4bf" opacity=".55"/>
        <rect x="60" y="36" width="22" height="68" rx="5" fill="#14b8a6" opacity=".45"/>
        <rect x="60" y="36" width="22" height="6" rx="3" fill="#5eead4" opacity=".55"/>
        <rect x="88" y="20" width="22" height="84" rx="5" fill="#14b8a6" opacity=".55"/>
        <rect x="88" y="20" width="22" height="7" rx="3" fill="#99f6e4" opacity=".6"/>
        <rect x="116" y="38" width="22" height="66" rx="5" fill="#0d9488" opacity=".42"/>
        <rect x="116" y="38" width="22" height="6" rx="3" fill="#2dd4bf" opacity=".5"/>
        <rect x="144" y="50" width="22" height="54" rx="5" fill="#0d9488" opacity=".36"/>
        <rect x="144" y="50" width="22" height="6" rx="3" fill="#5eead4" opacity=".5"/>
        <path d="M43 46L71 32L99 17L127 34L155 44" stroke="#0f766e" strokeWidth="2.8" fill="none" strokeLinecap="round" opacity=".65"/>
        <circle cx="43" cy="46" r="5" fill="#0f766e" opacity=".7"/>
        <circle cx="71" cy="32" r="5" fill="#0f766e" opacity=".7"/>
        <circle cx="99" cy="17" r="5" fill="#0f766e" opacity=".8"/>
        <circle cx="127" cy="34" r="5" fill="#0f766e" opacity=".7"/>
        <circle cx="155" cy="44" r="5" fill="#0f766e" opacity=".65"/>
      </>
    );
    case 'discussion': return (
      <>
        <ellipse cx="95" cy="60" rx="70" ry="48" fill="#e11d48" opacity=".14"/>
        <rect x="26" y="22" width="92" height="60" rx="16" fill="#f43f5e" opacity=".22"/>
        <path d="M26 76L48 76L38 92Z" fill="#f43f5e" opacity=".18"/>
        <rect x="80" y="40" width="92" height="60" rx="16" fill="#e11d48" opacity=".18"/>
        <path d="M172 100L150 100L160 116Z" fill="#e11d48" opacity=".15"/>
        <rect x="38" y="34" width="66" height="7" rx="3.5" fill="#be123c" opacity=".3"/>
        <rect x="38" y="47" width="48" height="6" rx="3" fill="#be123c" opacity=".22"/>
        <rect x="92" y="52" width="66" height="7" rx="3.5" fill="#be123c" opacity=".25"/>
        <rect x="92" y="65" width="50" height="6" rx="3" fill="#be123c" opacity=".18"/>
        <path d="M160 28c0-4-6-4-6 0 0 3 6 7 6 7s6-4 6-7c0-4-6-4-6 0z" fill="#f43f5e" opacity=".55"/>
      </>
    );
    case 'free': return (
      <>
        <rect x="76" y="10" width="48" height="26" rx="8" fill="#64748b" opacity=".4"/>
        <rect x="80" y="14" width="40" height="18" rx="5" fill="#475569" opacity=".3"/>
        <line x1="100" y1="36" x2="100" y2="48" stroke="#64748b" strokeWidth="2.5" opacity=".45"/>
        <polygon points="70,48 130,48 148,65 130,82 70,82 52,65" fill="#64748b" opacity=".25"/>
        <polygon points="73,50 127,50 145,65 127,80 73,80 55,65" fill="none" stroke="#475569" strokeWidth="1.5" opacity=".4"/>
        <line x1="70" y1="65" x2="46" y2="65" stroke="#64748b" strokeWidth="2.5" opacity=".4"/>
        <line x1="130" y1="65" x2="154" y2="65" stroke="#64748b" strokeWidth="2.5" opacity=".4"/>
        <rect x="24" y="53" width="44" height="25" rx="7" fill="#64748b" opacity=".3"/>
        <rect x="132" y="53" width="44" height="25" rx="7" fill="#64748b" opacity=".3"/>
        <line x1="100" y1="82" x2="100" y2="94" stroke="#64748b" strokeWidth="2.5" opacity=".45"/>
        <rect x="76" y="90" width="48" height="22" rx="11" fill="#64748b" opacity=".35"/>
      </>
    );
  }
}

/* ─ legacy small icons (96 × 64 viewBox) — used by page.tsx ─ */
export function TypeIconPaths({ type, color }: { type: TypeKey; color: string }) {
  switch (type) {
    case 'concept': return (
      <>
        <circle cx="48" cy="26" r="14" fill={color} opacity=".18"/>
        <path d="M40 26c0-4.4 3.6-8 8-8s8 3.6 8 8c0 3.3-1.9 6.1-4.7 7.5V38h-6.6v-4.5A8.04 8.04 0 0 1 40 26Z" fill={color}/>
        <rect x="43" y="39" width="10" height="2.5" rx="1.25" fill={color} opacity=".6"/>
        <line x1="48" y1="8" x2="48" y2="5" stroke={color} strokeWidth="2.2" strokeLinecap="round"/>
        <line x1="62" y1="13" x2="64" y2="11" stroke={color} strokeWidth="2.2" strokeLinecap="round"/>
        <line x1="34" y1="13" x2="32" y2="11" stroke={color} strokeWidth="2.2" strokeLinecap="round"/>
      </>
    );
    case 'escape': return (
      <>
        <path d="M37 34V24a11 11 0 0 1 22 0v10" stroke={color} strokeWidth="3.5" fill="none" strokeLinecap="round"/>
        <rect x="28" y="32" width="40" height="28" rx="6" fill={color}/>
        <circle cx="48" cy="44" r="5" fill="white" opacity=".9"/>
        <rect x="45.5" y="44" width="5" height="9" rx="2.5" fill="white" opacity=".9"/>
      </>
    );
    case 'mystery': return (
      <>
        <circle cx="40" cy="28" r="14" stroke={color} strokeWidth="3" fill="none"/>
        <circle cx="40" cy="28" r="9" fill={color} opacity=".2"/>
        <line x1="51" y1="39" x2="65" y2="53" stroke={color} strokeWidth="4.5" strokeLinecap="round"/>
        <text x="34" y="35" fontSize="15" fontWeight="900" fill={color} opacity=".7" fontFamily="sans-serif">?</text>
      </>
    );
    case 'practice': return (
      <>
        <rect x="14" y="12" width="68" height="44" rx="7" fill={color} opacity=".15"/>
        <rect x="14" y="12" width="68" height="12" rx="7" fill={color} opacity=".3"/>
        <circle cx="22" cy="18" r="2.5" fill={color} opacity=".5"/>
        <circle cx="29" cy="18" r="2.5" fill={color} opacity=".5"/>
        <rect x="20" y="30" width="44" height="5" rx="2.5" fill={color} opacity=".5"/>
        <rect x="20" y="40" width="32" height="4.5" rx="2.25" fill={color} opacity=".38"/>
      </>
    );
    case 'analysis': return (
      <>
        <rect x="14" y="46" width="13" height="10" rx="2" fill={color} opacity=".3"/>
        <rect x="30" y="34" width="13" height="22" rx="2" fill={color} opacity=".5"/>
        <rect x="46" y="20" width="13" height="36" rx="2" fill={color} opacity=".7"/>
        <rect x="62" y="28" width="13" height="28" rx="2" fill={color}/>
        <polyline points="20,44 36,32 52,18 68,26" stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity=".6"/>
      </>
    );
    case 'discussion': return (
      <>
        <rect x="8" y="10" width="48" height="30" rx="10" fill={color} opacity=".28"/>
        <polygon points="18,40 30,40 18,52" fill={color} opacity=".28"/>
        <rect x="40" y="22" width="48" height="30" rx="10" fill={color} opacity=".62"/>
        <polygon points="78,52 66,52 78,64" fill={color} opacity=".62"/>
      </>
    );
    case 'free': return (
      <>
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
  block = false,
  className,
  style,
}: Props) {
  const T = TYPES[type];
  const bg = dark ? '#1f2a48' : (TYPE_BG[type] ?? `linear-gradient(145deg,${T.c}33,${T.c}11)`);

  return (
    <div
      className={className}
      style={{ position: 'relative', width: '100%', overflow: 'hidden', background: bg, ...style }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 200 120"
        preserveAspectRatio="xMidYMid slice"
        width="100%"
        height={height}
        style={{ display: 'block' }}
        fill="none"
      >
        <Illustration type={type} />

        {block && (
          <>
            <path d={`M16 ${height - 34}h18l4 4h10l4-4h64v20H16z`} fill={T.c} opacity={0.9}/>
            <rect x="26" y={height - 27} width="58" height="6" rx="3" fill="#fff" opacity={0.85}/>
          </>
        )}
      </svg>
    </div>
  );
}
