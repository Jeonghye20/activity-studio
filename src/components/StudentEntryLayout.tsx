import type { ReactNode } from 'react';

const PURPLE = '#6741d9';

function Logo() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" aria-hidden="true">
      <rect width="40" height="40" rx="11" fill="#ffd43b" />
      <path d="M9 12h8l2 2h12v6H9z" fill="#172036" />
      <path d="M9 22h14l2 2h6v5H9z" fill="#172036" opacity=".55" />
    </svg>
  );
}

function CardIllustration() {
  return (
    <div style={{ position: 'relative', width: 300, height: 240 }}>
      {/* 주황 카드 — 뒤 왼쪽 */}
      <div style={{
        position: 'absolute', left: 0, top: 20,
        width: 220, height: 148, borderRadius: 20,
        background: 'linear-gradient(135deg, #f97316 0%, #fb923c 100%)',
        transform: 'rotate(-10deg)',
        boxShadow: '0 12px 32px rgba(0,0,0,0.35)',
      }} />
      {/* 흰 카드 1 — 가운데 */}
      <div style={{
        position: 'absolute', left: 24, top: 32,
        width: 220, height: 148, borderRadius: 20,
        background: '#fff',
        transform: 'rotate(-3deg)',
        boxShadow: '0 10px 28px rgba(0,0,0,0.25)',
        overflow: 'hidden',
      }}>
        <div style={{ height: 48, background: 'linear-gradient(90deg, #4263eb, #7048e8)' }} />
        <div style={{ padding: '14px 16px' }}>
          <div style={{ height: 8, width: 110, borderRadius: 4, background: '#e3e7ef', marginBottom: 10 }} />
          <div style={{ height: 8, width: 75, borderRadius: 4, background: '#e3e7ef' }} />
        </div>
      </div>
      {/* 흰 카드 2 — 앞 오른쪽 */}
      <div style={{
        position: 'absolute', left: 48, top: 48,
        width: 220, height: 148, borderRadius: 20,
        background: '#fff',
        transform: 'rotate(5deg)',
        boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
        overflow: 'hidden',
      }}>
        <div style={{ height: 48, background: 'linear-gradient(90deg, #2563eb, #6741d9)' }} />
        <div style={{ padding: '14px 16px' }}>
          <div style={{ height: 8, width: 120, borderRadius: 4, background: '#e3e7ef', marginBottom: 10 }} />
          <div style={{ height: 8, width: 85, borderRadius: 4, background: '#e3e7ef' }} />
        </div>
      </div>
    </div>
  );
}

function StepIndicator({ step }: { step: 1 | 2 }) {
  const isPast = (n: number) => step > n;
  const isCurrent = (n: number) => step === n;
  const isActive = (n: number) => step >= n;

  function Circle({ n }: { n: number }) {
    return (
      <div style={{
        width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
        background: isActive(n) ? PURPLE : 'transparent',
        border: isActive(n) ? 'none' : '2px solid #d1d5db',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: isActive(n) ? '#fff' : '#9ca3af',
        fontSize: 14, fontWeight: 800,
      }}>
        {n}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 44 }}>
      <Circle n={1} />
      <span style={{
        marginLeft: 10, fontSize: 14, whiteSpace: 'nowrap',
        fontWeight: isCurrent(1) ? 700 : 600,
        color: isActive(1) ? PURPLE : '#9ca3af',
      }}>
        수업 코드
      </span>
      <div style={{
        width: 48, height: 2, flexShrink: 0,
        background: isPast(1) ? PURPLE : '#d1d5db',
        margin: '0 16px',
      }} />
      <Circle n={2} />
      <span style={{
        marginLeft: 10, fontSize: 14, whiteSpace: 'nowrap',
        fontWeight: isCurrent(2) ? 700 : 500,
        color: isActive(2) ? PURPLE : '#9ca3af',
      }}>
        내 이름 고르기
      </span>
    </div>
  );
}

export default function StudentEntryLayout({ step, children }: { step: 1 | 2; children: ReactNode }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* 왼쪽 패널 */}
      <div style={{
        width: 560, minWidth: 560,
        background: `
          radial-gradient(ellipse at 0% 0%, rgba(251,191,36,.2) 0%, transparent 45%),
          radial-gradient(ellipse at 100% 0%, rgba(139,92,246,.22) 0%, transparent 45%),
          radial-gradient(ellipse at 55% 115%, rgba(99,102,241,.18) 0%, transparent 40%),
          linear-gradient(145deg,#0d1424 0%,#161d3a 30%,#1b1545 55%,#0a1628 100%)
        `,
        display: 'flex', flexDirection: 'column',
        padding: '32px 48px 48px',
        color: '#fff',
      }}>
        {/* 로고 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Logo />
          <div>
            <div style={{ fontSize: 15, fontWeight: 850, letterSpacing: '-.02em', lineHeight: 1.3 }}>
              수업활동 스튜디오
            </div>
            <div style={{ fontSize: 12, color: '#9aa4bf', lineHeight: 1.4 }}>비상교육</div>
          </div>
        </div>

        {/* 카드 일러스트 */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CardIllustration />
        </div>

        {/* 큰 텍스트 */}
        <div>
          <h1 style={{
            margin: '0 0 14px', fontSize: 36, fontWeight: 850,
            lineHeight: 1.3, letterSpacing: '-.03em', color: '#fff',
          }}>
            오늘 수업 활동,<br />여기서 시작해요
          </h1>
          <p style={{ margin: 0, fontSize: 15, color: '#9aa4bf', lineHeight: 1.6 }}>
            선생님이 알려 준 수업 코드로 들어와요.
          </p>
        </div>
      </div>

      {/* 오른쪽 패널 */}
      <div style={{ flex: 1, background: '#f7f8fb', overflowY: 'auto', minHeight: '100vh' }}>
        <div style={{
          maxWidth: 720, margin: '0 auto',
          padding: '56px 40px 80px',
          boxSizing: 'border-box',
        }}>
          <StepIndicator step={step} />
          {children}
        </div>
      </div>
    </div>
  );
}
