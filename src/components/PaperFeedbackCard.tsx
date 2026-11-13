'use client';

// 학생 결과 상세용 — 종이 활동지 피드백 카드
// 결과 상세의 '선생님 피드백' 카드와 같은 모양(노란 테두리). 데이터가 없거나 아직 안 보냈으면 그리지 않는다.
// 아직 학생 화면에 끼우지 않음.

import { useEffect, useState } from 'react';
import {
  getPaperFeedback,
  markPaperFeedbackViewed,
  type PaperFeedback,
} from '@/lib/paperFeedback';

const GREEN = '#2b8a3e';
const ORANGE = '#e8890c';
const INK = '#172036';

export default function PaperFeedbackCard({ code, num }: { code: string; num: number }) {
  const [fb, setFb] = useState<PaperFeedback | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [zoom, setZoom] = useState(false);

  useEffect(() => {
    const load = () => setFb(getPaperFeedback(code, num));
    const first = getPaperFeedback(code, num);
    // localStorage 는 화면이 뜬 뒤에만 읽을 수 있음
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFb(first);
    // 열면 읽음 처리 (기존 피드백 카드와 같은 규칙). '새로 옴'은 이번 화면에서만 보여 준다
    if (first?.sentAt && !first.viewed) {
      setIsNew(true);
      markPaperFeedbackViewed(code, num);
    }
    window.addEventListener('activity_studio_badge_update', load);
    window.addEventListener('storage', load);
    return () => {
      window.removeEventListener('activity_studio_badge_update', load);
      window.removeEventListener('storage', load);
    };
  }, [code, num]);

  useEffect(() => {
    if (!zoom) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setZoom(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [zoom]);

  if (!fb || !fb.sentAt) return null;

  return (
    <div style={{
      background: '#fff', border: '2px solid #ffd43b',
      borderRadius: 24, padding: '20px 22px', marginBottom: 18,
    }}>
      {/* 헤더 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <span style={{ fontSize: 15, fontWeight: 800, color: INK }}>선생님 피드백</span>
        <span style={{
          height: 22, padding: '0 8px', borderRadius: 6,
          background: '#f1f3f5', color: '#5d6880',
          fontSize: 11.5, fontWeight: 800, display: 'inline-flex', alignItems: 'center',
        }}>종이 활동지</span>
        {isNew && <span className="new-badge" style={{ fontSize: 11, padding: '2px 7px' }}>새로 옴</span>}
      </div>

      <div style={{ display: 'flex', gap: 18, alignItems: 'flex-start' }}>
        {/* 사진 썸네일 */}
        {fb.photo && (
          <button
            type="button"
            onClick={() => setZoom(true)}
            aria-label="내 활동지 사진 크게 보기"
            style={{
              width: 132, height: 100, flexShrink: 0, padding: 0, borderRadius: 12,
              border: '1px solid #e3e7ef', background: '#eef1f6', overflow: 'hidden', cursor: 'zoom-in',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={fb.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          </button>
        )}

        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {fb.praise.length > 0 && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {fb.praise.map(p => (
                <span key={p} style={{
                  height: 30, padding: '0 12px', borderRadius: 8,
                  background: '#ebfbee', color: GREEN, fontSize: 13, fontWeight: 800,
                  display: 'inline-flex', alignItems: 'center',
                }}>{p}</span>
              ))}
            </div>
          )}

          {fb.comment && (
            <p style={{ margin: 0, fontSize: 16, color: INK, lineHeight: 1.65, wordBreak: 'keep-all' }}>
              {fb.comment}
            </p>
          )}

          {fb.retryItems.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: ORANGE }}>다시 볼 문항</span>
              {fb.retryItems.map(n => (
                <span key={n} style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: '#fff4e6', border: '1.5px solid #ffc078', color: ORANGE,
                  fontSize: 13, fontWeight: 850,
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                }}>{n}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      {zoom && (
        <div
          role="dialog" aria-modal="true" aria-label="내 활동지 사진"
          onClick={() => setZoom(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(15,20,35,.82)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, cursor: 'zoom-out',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={fb.photo} alt="" style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: 8 }} />
          <button type="button" autoFocus onClick={() => setZoom(false)} style={{
            position: 'fixed', top: 20, right: 24, height: 44, padding: '0 16px', borderRadius: 10,
            border: 0, background: '#fff', color: INK, fontWeight: 800, cursor: 'pointer', font: 'inherit',
          }}>닫기</button>
        </div>
      )}
    </div>
  );
}
