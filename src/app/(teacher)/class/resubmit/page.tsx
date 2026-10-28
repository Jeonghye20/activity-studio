'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  DEMO_SESSION, RESUBMIT_FIXED_OK, RESUBMIT_FIXED_STILL,
  RESUBMIT_NOT_FIXED, FEEDBACK_LABELS, type FeedbackValue,
} from '../demoData';

export default function ClassResubmit() {
  const [feedbacks, setFeedbacks] = useState<Record<string, FeedbackValue>>(
    Object.fromEntries(RESUBMIT_FIXED_STILL.map(s => [s.name, 'review' as FeedbackValue]))
  );
  const [sent, setSent]           = useState(false);
  const totalResubmit = RESUBMIT_FIXED_OK.length + RESUBMIT_FIXED_STILL.length;

  return (
    <div className="p-main">
      <nav className="crumb">
        <Link href="/class">수업 관리</Link>
        <span aria-hidden="true">›</span>
        <span>재제출 확인</span>
      </nav>

      <div className="page-head">
        <div>
          <h1>재제출 확인</h1>
          <p>{DEMO_SESSION.worksheetTitle} · {DEMO_SESSION.classLabel}</p>
        </div>
      </div>

      {/* 요약 3개 카드 */}
      <div className="re-sum" style={{ marginBottom: 20 }}>
        <div className="re-card">
          <div className="k" style={{ color: 'var(--st-done)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M5 12l4 4L19 8"/></svg>
            고쳐서 맞음
          </div>
          <b>{RESUBMIT_FIXED_OK.length}</b>
          <p>피드백이 &apos;잘했어요&apos;로 자동 변경</p>
          <p style={{ marginTop: 6, color: 'var(--ink-2)', fontWeight: 700 }}>
            {RESUBMIT_FIXED_OK.join(' · ')}
          </p>
        </div>
        <div className="re-card" style={{ borderColor: '#ffd8d8', background: '#fff8f8' }}>
          <div className="k" style={{ color: '#c92a2a' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/></svg>
            고쳤지만 아직
          </div>
          <b>{RESUBMIT_FIXED_STILL.length}</b>
          <p>분홍 표시 · 한 번 더 확인</p>
          <p style={{ marginTop: 6, color: 'var(--ink-2)', fontWeight: 700 }}>
            {RESUBMIT_FIXED_STILL.map(s => s.name).join(' · ')}
          </p>
        </div>
        <div className="re-card">
          <div className="k" style={{ color: 'var(--ink-3)' }}>
            안 고침
          </div>
          <b>{RESUBMIT_NOT_FIXED.length}</b>
          <p>전송 대상에서 제외 · 기록만 남음</p>
          <p style={{ marginTop: 6, color: 'var(--ink-3)' }}>
            {RESUBMIT_NOT_FIXED.join(' · ')}
          </p>
        </div>
      </div>

      {/* 고쳤지만 아직 — 피드백 선택 */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--r-lg)', padding: '20px 22px', marginBottom: 16 }}>
        <p style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 800 }}>
          고쳤지만 아직인 학생 — 피드백 확인
        </p>
        {RESUBMIT_FIXED_STILL.map(s => (
          <div key={s.name} className="re-row">
            <div className="nm">
              <div>
                <b>{s.name}</b>
                <small>처음 답 · 고친 답 변경됨</small>
              </div>
            </div>
            <div className="chg-list">
              <span className="chg-tag still">
                <span className="x">✕</span> 문항 2
              </span>
              <span className="chg-tag still">
                <span className="o">→</span> 재시도
              </span>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {(['good', 'almost', 'review'] as FeedbackValue[]).map(v => (
                <button
                  key={v}
                  className={`btn sm${feedbacks[s.name] === v ? ' primary' : ' ghost'}`}
                  onClick={() => setFeedbacks(f => ({ ...f, [s.name]: v }))}
                  style={{ fontSize: 12 }}
                >
                  {FEEDBACK_LABELS[v]}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* 전송 버튼 */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
        {sent ? (
          <>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '12px 18px', borderRadius: 12,
              background: '#ebfbee', color: '#2b8a3e',
              fontWeight: 700, fontSize: 15,
            }}>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
                <path d="M5 12l4 4L19 8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              마무리 전송 완료
            </div>
            <Link href="/class" className="btn ghost" style={{ textDecoration: 'none' }}>
              수업 관리로
            </Link>
          </>
        ) : (
          <button className="btn primary" onClick={() => setSent(true)}>
            다시 낸 {totalResubmit}명에게 마무리 전송
          </button>
        )}
      </div>
    </div>
  );
}
