import type { WorksheetType } from '@/types/worksheet';

const THUMB_BG: Record<WorksheetType, string> = {
  concept:    '#dbeafe',
  escape:     '#fef3c7',
  mystery:    '#ede9fe',
  practice:   '#d1fae5',
  analysis:   '#cffafe',
  discussion: '#fce7f3',
};

const THUMB_COLOR: Record<WorksheetType, string> = {
  concept:    '#2563eb',
  escape:     '#b45309',
  mystery:    '#7c3aed',
  practice:   '#1e7a46',
  analysis:   '#0e7490',
  discussion: '#9d174d',
};

interface Props {
  type: WorksheetType;
  height?: number;
}

export default function TypeThumbnail({ type, height = 88 }: Props) {
  const bg = THUMB_BG[type];
  const c = THUMB_COLOR[type];

  return (
    <div
      style={{
        background: bg,
        height,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
      aria-hidden="true"
    >
      {type === 'concept'    && <ConceptSVG    color={c} />}
      {type === 'escape'     && <EscapeSVG     color={c} />}
      {type === 'mystery'    && <MysterySVG    color={c} />}
      {type === 'practice'   && <PracticeSVG   color={c} />}
      {type === 'analysis'   && <AnalysisSVG   color={c} />}
      {type === 'discussion' && <DiscussionSVG color={c} />}
    </div>
  );
}

/* ── SVG 일러스트 ─────────────────────────────────── */

function ConceptSVG({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 96 64" width="96" height="64" fill="none">
      {/* 전구 */}
      <circle cx="48" cy="28" r="13" fill={color} opacity=".18"/>
      <path
        d="M40 28c0-4.4 3.6-8 8-8s8 3.6 8 8c0 3.3-1.9 6.1-4.7 7.5V40h-6.6v-4.5A8.04 8.04 0 0 1 40 28Z"
        fill={color}
      />
      <rect x="43" y="41.5" width="10" height="2.5" rx="1.25" fill={color} opacity=".55"/>
      <rect x="44.5" y="45.5" width="7" height="2" rx="1" fill={color} opacity=".35"/>
      {/* 빛줄기 */}
      <line x1="48" y1="10" x2="48" y2="7" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      <line x1="62" y1="15" x2="64" y2="13" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      <line x1="34" y1="15" x2="32" y2="13" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      <line x1="67" y1="28" x2="70" y2="28" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      <line x1="29" y1="28" x2="26" y2="28" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

function EscapeSVG({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 96 64" width="96" height="64" fill="none">
      {/* 자물쇠 몸통 */}
      <rect x="30" y="34" width="36" height="24" rx="5" fill={color} opacity=".75"/>
      {/* 자물쇠 고리 */}
      <path
        d="M37 34V24a11 11 0 0 1 22 0v10"
        stroke={color} strokeWidth="3" fill="none" strokeLinecap="round"
      />
      {/* 열쇠 구멍 */}
      <circle cx="48" cy="44" r="4" fill="white"/>
      <rect x="46" y="45" width="4" height="6" rx="2" fill="white"/>
      {/* 별 장식 */}
      <circle cx="72" cy="18" r="3" fill={color} opacity=".3"/>
      <circle cx="24" cy="20" r="2" fill={color} opacity=".2"/>
    </svg>
  );
}

function MysterySVG({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 96 64" width="96" height="64" fill="none">
      {/* 돋보기 */}
      <circle cx="40" cy="28" r="14" stroke={color} strokeWidth="3"/>
      <circle cx="40" cy="28" r="9" fill={color} opacity=".18"/>
      {/* 돋보기 손잡이 */}
      <line x1="51" y1="39" x2="64" y2="52" stroke={color} strokeWidth="4" strokeLinecap="round"/>
      {/* 하이라이트 */}
      <circle cx="35" cy="23" r="4" fill={color} opacity=".3"/>
      {/* 물음표 */}
      <text x="64" y="24" fontSize="18" fontWeight="700" fill={color} opacity=".35" fontFamily="sans-serif">?</text>
    </svg>
  );
}

function PracticeSVG({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 96 64" width="96" height="64" fill="none">
      {/* 코드 창 */}
      <rect x="16" y="14" width="64" height="40" rx="6" fill={color} opacity=".12"/>
      <rect x="16" y="14" width="64" height="10" rx="6" fill={color} opacity=".2"/>
      {/* 점 3개 */}
      <circle cx="24" cy="19" r="2" fill={color} opacity=".4"/>
      <circle cx="31" cy="19" r="2" fill={color} opacity=".4"/>
      <circle cx="38" cy="19" r="2" fill={color} opacity=".4"/>
      {/* 코드 줄 */}
      <path d="M30 34 l-7 4 7 4" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <path d="M54 34 l7 4-7 4" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <line x1="50" y1="30" x2="46" y2="46" stroke={color} strokeWidth="2" strokeLinecap="round" opacity=".6"/>
    </svg>
  );
}

function AnalysisSVG({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 96 64" width="96" height="64" fill="none">
      {/* 막대 그래프 */}
      <rect x="16" y="48" width="12" height="8" rx="2" fill={color} opacity=".3"/>
      <rect x="32" y="36" width="12" height="20" rx="2" fill={color} opacity=".5"/>
      <rect x="48" y="22" width="12" height="34" rx="2" fill={color} opacity=".7"/>
      <rect x="64" y="30" width="12" height="26" rx="2" fill={color}/>
      {/* X축 */}
      <line x1="12" y1="56" x2="82" y2="56" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      {/* Y축 */}
      <line x1="12" y1="56" x2="12" y2="12" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      {/* 꺾은선 */}
      <polyline
        points="22,46 38,34 54,20 70,28"
        stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity=".5"
      />
      <circle cx="22" cy="46" r="2.5" fill={color} opacity=".5"/>
      <circle cx="54" cy="20" r="2.5" fill={color} opacity=".5"/>
      <circle cx="70" cy="28" r="2.5" fill={color} opacity=".5"/>
    </svg>
  );
}

function DiscussionSVG({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 96 64" width="96" height="64" fill="none">
      {/* 왼쪽 말풍선 */}
      <rect x="8" y="12" width="44" height="26" rx="9" fill={color} opacity=".3"/>
      <polygon points="18,38 28,38 18,48" fill={color} opacity=".3"/>
      {/* 오른쪽 말풍선 */}
      <rect x="44" y="24" width="44" height="26" rx="9" fill={color} opacity=".6"/>
      <polygon points="78,50 68,50 78,60" fill={color} opacity=".6"/>
      {/* 줄 */}
      <line x1="18" y1="22" x2="42" y2="22" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity=".6"/>
      <line x1="18" y1="28" x2="36" y2="28" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity=".6"/>
      <line x1="54" y1="34" x2="78" y2="34" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity=".6"/>
      <line x1="54" y1="40" x2="72" y2="40" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity=".6"/>
    </svg>
  );
}
