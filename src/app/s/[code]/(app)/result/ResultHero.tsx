'use client';

/**
 * ResultHero — 결과 상세 머리 띠. 학생 풀기 화면 머리 띠와 같은 모양.
 * 오른쪽 '자동 저장됨' 자리에 결과(맞힌 문항 / 게임 결과)를 둔다.
 */

import { useState, useEffect } from 'react';
import TypeThumbnail from '@/components/TypeThumbnail';

/* 풀기 화면 머리 그림과 같음 (ws.js DEVICE_ART[1]) */
function SensorIllustration() {
  return (
    <svg viewBox="0 0 190 130" width="190" height="130" aria-hidden="true">
      <rect width="190" height="130" fill="#e8ecf4" rx="14" />
      <g transform="translate(20,8) scale(0.68)">
        <path d="M69 96h82l-12 54H81z" fill="#d7a075" />
        <ellipse cx="110" cy="96" rx="42" ry="9" fill="#805c42" />
        <path d="M110 95V39" stroke="#477e51" strokeWidth="5" />
        <path d="M109 69Q68 73 68 37q38-1 41 32M111 54q4-36 40-33-1 34-40 33" fill="#73a96c" />
        <rect x="159" y="102" width="25" height="33" rx="4" fill="#7da9b4" />
        <path d="M172 102V80h-36V96" stroke="#658d98" strokeWidth="4" fill="none" />
        <rect x="61" y="83" width="8" height="35" rx="3" fill="#55836e" />
        <path d="M65 83V72h-20" stroke="#55836e" strokeWidth="3" fill="none" />
        <path d="M136 100l-3 7m3 0-3 7" stroke="#62adcb" strokeWidth="3" />
        <path d="M50 154h140" stroke="#c9d8bd" strokeWidth="4" />
      </g>
    </svg>
  );
}

interface Props {
  worksheetId: string;
  type: string;
  typeLabel: string;
  typeColor: string;
  title: string;
  unit?: string;
  minutes?: number;
  goal?: string;
  submittedText: string; // 예: '11월 13일 제출'
  result: { kind: 'score'; correct: number; total: number } | { kind: 'game'; text: string };
}

export default function ResultHero(p: Props) {
  const [who, setWho] = useState('');
  useEffect(() => {
    try {
      const raw = localStorage.getItem('activity_studio_student_info');
      if (!raw) return;
      const s = JSON.parse(raw) as { cls?: string; num?: string; name?: string };
      const num = s.num ? String(parseInt(s.num, 10)).padStart(2, '0') : '';
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setWho(`${s.cls ? `${s.cls} ` : ''}${num ? `${num}번 ` : ''}${s.name ?? ''}`.trim());
    } catch {}
  }, []);

  const unitLine = [p.unit, p.minutes ? `${p.minutes}분` : ''].filter(Boolean).join(' · ');

  return (
    <div className="hero" style={{ padding: '20px 24px', marginBottom: 20 }}>
      <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
        <div style={{ width: 190, height: 130, borderRadius: 14, overflow: 'hidden', flexShrink: 0, background: '#e8ecf4' }}>
          {p.worksheetId === 'ws-physical'
            ? <SensorIllustration />
            : <TypeThumbnail type={p.type as Parameters<typeof TypeThumbnail>[0]['type']} height={130} />}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              fontSize: 12, fontWeight: 700, color: '#2d3a6b',
              border: '1px solid #c8c2e8', borderRadius: 8, padding: '4px 10px', background: '#ede9f8',
            }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.typeColor, flexShrink: 0 }} />
              {p.typeLabel}
            </span>
            {unitLine && <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>{unitLine}</span>}
          </div>
          <h1 style={{ margin: '0 0 8px', fontSize: 24, fontWeight: 850, color: '#fff', letterSpacing: '-.02em', lineHeight: 1.3 }}>
            {p.title}
          </h1>
          {p.goal && (
            <p style={{ margin: '0 0 7px', fontSize: 13, color: 'rgba(255,255,255,0.78)', lineHeight: 1.55, wordBreak: 'keep-all' }}>
              <span style={{ color: '#ffd43b', fontWeight: 700 }}>학습목표</span>{' '}{p.goal}
            </p>
          )}
          <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>
            {[who, p.submittedText].filter(Boolean).join(' · ')}
          </p>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 14, padding: '14px 20px', textAlign: 'center', flexShrink: 0, minWidth: 104 }}>
          {p.result.kind === 'game' ? (
            <>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: 'rgba(255,255,255,0.65)', marginBottom: 6 }}>결과</div>
              <div style={{ fontSize: 20, fontWeight: 850, color: '#ffd43b', lineHeight: 1 }}>{p.result.text}</div>
            </>
          ) : (
            <>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: 'rgba(255,255,255,0.65)', marginBottom: 6 }}>맞힌 문항</div>
              <div style={{ lineHeight: 1 }}>
                <span style={{ fontSize: 30, fontWeight: 850, color: '#fff' }}>{p.result.correct}</span>
                <span style={{ fontSize: 18, color: 'rgba(255,255,255,0.55)', fontWeight: 700 }}> / {p.result.total}</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
