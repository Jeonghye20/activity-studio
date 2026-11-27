'use client';

/**
 * HomeSchoolTabs — 교사 홈 필터 줄 (학교급 탭)
 *
 * 정보 교과만 다루는 서비스라 드롭다운(학교급·학년·과목·유형) 대신
 * 학교급 탭 하나만 둔다. 중학만 선택 가능하고 초등·고등은 '준비 중'.
 *
 * 초등·고등은 span 이 아니라 button(aria-disabled) 으로 두어 키보드로 이동되며,
 * 화면 읽기 프로그램이 "초등 활동지는 준비 중입니다"를 읽도록 aria-label 을 준다.
 * 눌러도 선택은 바뀌지 않는다(아무 동작 없음).
 *
 * 스타일은 인라인. '흰 둥근 상자'는 기존 필터 줄 그대로 유지한다.
 */

/* 자물쇠 아이콘 (준비 중 알약) */
function LockIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

/* 준비 중 알약 */
function SoonPill() {
  return (
    <span
      aria-hidden="true"
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 3,
        fontSize: 11.5, fontWeight: 700, color: '#8a93ab',
        background: '#e9ecf3', borderRadius: 999, padding: '2px 7px',
      }}
    >
      <LockIcon />
      준비 중
    </span>
  );
}

export default function HomeSchoolTabs() {
  return (
    <div
      style={{
        display: 'flex', alignItems: 'center', gap: 14,
        background: '#fff', border: '1.5px solid #a0a8b8', boxShadow: '0 2px 8px rgba(0,0,0,.10)',
        borderRadius: 16, padding: '12px 18px', boxSizing: 'border-box',
      }}
    >
      <span style={{ fontSize: 14, fontWeight: 700, color: '#5d6880', whiteSpace: 'nowrap' }}>학교급</span>

      <div
        role="group"
        aria-label="학교급"
        style={{ display: 'inline-flex', gap: 4, padding: 4, background: '#f3f5fa', borderRadius: 12 }}
      >
        {/* 초등 — 준비 중 */}
        <SoonTab label="초등" />

        {/* 중학 — 선택 */}
        <button
          type="button"
          aria-pressed="true"
          style={{
            height: 40, padding: '0 18px', borderRadius: 9,
            background: '#fff', border: '1.5px solid #172036',
            color: '#172036', fontWeight: 700, fontSize: 15,
            boxShadow: '0 1px 3px rgba(0,0,0,.12)', cursor: 'default', whiteSpace: 'nowrap',
          }}
        >
          중학
        </button>

        {/* 고등 — 준비 중 */}
        <SoonTab label="고등" />
      </div>

      <span style={{ marginLeft: 'auto', fontSize: 13.5, color: '#5d6880', whiteSpace: 'nowrap' }}>
        정보 교과 활동지만 모았어요
      </span>
    </div>
  );
}

/* 준비 중 탭 (초등·고등): button + aria-disabled, 키보드 이동 가능, 눌러도 안 바뀜 */
function SoonTab({ label }: { label: string }) {
  const notice = `${label} 활동지는 준비 중입니다`;
  return (
    <button
      type="button"
      aria-disabled="true"
      aria-label={notice}
      title={notice}
      onClick={(e) => e.preventDefault()}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        height: 40, padding: '0 12px', borderRadius: 9,
        background: 'transparent', border: '1.5px solid transparent',
        color: '#a3abbd', fontWeight: 700, fontSize: 15,
        cursor: 'not-allowed', whiteSpace: 'nowrap',
      }}
    >
      {label}
      <SoonPill />
    </button>
  );
}
