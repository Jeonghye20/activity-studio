function ShieldIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 2L19.5 5.5V11.5C19.5 15.9 16.1 19.8 12 21C7.9 19.8 4.5 15.9 4.5 11.5V5.5L12 2Z"
        fill="rgba(255,255,255,0.95)"
      />
      <circle cx="16.5" cy="15.5" r="3.5" fill="#364fc7" />
      <path d="M15.2 15.5L16.2 16.6L18 14.4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" fill="rgba(255,255,255,0.95)" />
      <path d="M8 12l3 3.5 5-5.5" stroke="#6741d9" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function StudentHeroArt() {
  return (
    <div style={{ position: 'relative', width: 260, height: 220, flexShrink: 0 }}>
      {/* 주황 카드 — 뒤, 오른쪽 위 */}
      <div style={{
        position: 'absolute', left: 98, top: 0,
        width: 152, height: 108, borderRadius: 22,
        background: 'linear-gradient(145deg, #f59f00 0%, #fd7e14 100%)',
        transform: 'rotate(13deg)',
        boxShadow: '0 10px 30px rgba(0,0,0,0.30)',
        zIndex: 1,
      }} />

      {/* 파랑 카드 — 중간 */}
      <div style={{
        position: 'absolute', left: 2, top: 55,
        width: 164, height: 120, borderRadius: 20,
        background: '#fff',
        transform: 'rotate(-9deg)',
        boxShadow: '0 8px 26px rgba(0,0,0,0.22)',
        overflow: 'hidden',
        zIndex: 2,
      }}>
        <div style={{
          height: 54,
          background: 'linear-gradient(135deg, #364fc7 0%, #4263eb 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <ShieldIcon />
        </div>
        <div style={{ padding: '10px 14px' }}>
          <div style={{ height: 7, width: 112, borderRadius: 4, background: '#dbe4ff', marginBottom: 9 }} />
          <div style={{ height: 7, width: 78, borderRadius: 4, background: '#dbe4ff' }} />
        </div>
      </div>

      {/* 보라 카드 — 앞, 오른쪽 */}
      <div style={{
        position: 'absolute', left: 76, top: 72,
        width: 158, height: 116, borderRadius: 20,
        background: '#fff',
        transform: 'rotate(7deg)',
        boxShadow: '0 6px 22px rgba(0,0,0,0.20)',
        overflow: 'hidden',
        zIndex: 3,
      }}>
        <div style={{
          height: 52,
          background: 'linear-gradient(135deg, #6741d9 0%, #845ef7 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <CheckIcon />
        </div>
        <div style={{ padding: '10px 14px' }}>
          <div style={{ height: 7, width: 108, borderRadius: 4, background: '#e5dbff', marginBottom: 9 }} />
          <div style={{ height: 7, width: 74, borderRadius: 4, background: '#e5dbff' }} />
        </div>
      </div>
    </div>
  );
}
