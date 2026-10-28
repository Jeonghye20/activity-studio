'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  DEMO_SESSION, WATCH_STUDENTS, FEEDBACK_LABELS,
  type FeedbackValue,
} from '../demoData';

const OTHER_STUDENTS: { name: string; feedback: FeedbackValue }[] = [
  { name: '임oo', feedback: 'good' },
  { name: '한oo', feedback: 'good' },
  { name: '오oo', feedback: 'good' },
  { name: '서oo', feedback: 'almost' },
  { name: '권oo', feedback: 'good' },
  { name: '황oo', feedback: 'good' },
  { name: '류oo', feedback: 'good' },
  { name: '문oo', feedback: 'good' },
  { name: '장oo', feedback: 'almost' },
  { name: '윤oo', feedback: 'good' },
  { name: '조oo', feedback: 'good' },
  { name: '정oo', feedback: 'good' },
];

const FB_MAP: Record<FeedbackValue, { label: string; f: string; cls: string }> = {
  good:   { label: '잘했어요',           f: 'g', cls: 'g' },
  almost: { label: '거의 다 왔어요',     f: 'a', cls: 'a' },
  review: { label: '한 번 더 살펴봐요',  f: 'r', cls: 'r' },
};

export default function ClassFeedback() {
  const [feedbacks, setFeedbacks] = useState<Record<string, FeedbackValue>>(
    Object.fromEntries(WATCH_STUDENTS.map(s => [s.name, s.feedback]))
  );
  const [comments, setComments] = useState<Record<string, string>>(
    Object.fromEntries(WATCH_STUDENTS.map(s => [s.name, s.aiComment]))
  );
  const [selected, setSelected] = useState(WATCH_STUDENTS[0].name);
  const [sent, setSent]         = useState(false);
  const [undoTimer, setUndoTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  function handleSend() {
    setSent(true);
    const t = setTimeout(() => { setSent(false); setUndoTimer(null); }, 5000);
    setUndoTimer(t);
  }
  function handleUndo() {
    if (undoTimer) clearTimeout(undoTimer);
    setSent(false);
    setUndoTimer(null);
  }

  const selData = WATCH_STUDENTS.find(s => s.name === selected);
  const selFb = feedbacks[selected] ?? 'good';

  const fbColor = {
    good:   { bg: '#ebfbee', color: '#2b8a3e' },
    almost: { bg: '#edf2ff', color: '#364fc7' },
    review: { bg: '#fff4e6', color: '#b35a00' },
  };

  return (
    <div className="p-main">
      <nav className="crumb">
        <Link href="/class">수업 관리</Link>
        <span aria-hidden="true">›</span>
        <span>피드백</span>
      </nav>

      <div className="page-head">
        <div>
          <h1>피드백</h1>
          <p>{DEMO_SESSION.worksheetTitle} · {DEMO_SESSION.classLabel}</p>
        </div>
      </div>

      {/* 요약 카드 */}
      <div className="groups" style={{ marginBottom: 20 }}>
        <div className="grp">
          <div className="gt">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/></svg>
            따로 볼 학생
          </div>
          <b>{WATCH_STUDENTS.length}명</b>
          <p>여러 번 시도했거나 서술형 답변이 짧은 학생</p>
        </div>
        <div className="grp">
          <div className="gt" style={{ color: 'var(--st-done)' }}>잘했어요</div>
          <b>{Object.values(feedbacks).filter(v => v === 'good').length}명</b>
          <p>선택된 피드백</p>
        </div>
        <div className="grp">
          <div className="gt" style={{ color: 'var(--st-work)' }}>거의 다</div>
          <b>{Object.values(feedbacks).filter(v => v === 'almost').length + OTHER_STUDENTS.filter(s => s.feedback === 'almost').length}명</b>
          <p>전체 기준</p>
        </div>
      </div>

      <div className="fbw">
        {/* 왼쪽: 학생 목록 */}
        <div className="fb-list">
          <div className="seg" style={{ marginBottom: 12 }}>
            <button aria-selected={true} style={{ fontSize: 13 }}>
              따로 볼 {WATCH_STUDENTS.length}
            </button>
            <button aria-selected={false} style={{ fontSize: 13 }}>
              전체 {DEMO_SESSION.submitted}
            </button>
          </div>

          {WATCH_STUDENTS.map((s, i) => (
            <button
              key={s.name}
              className="fbi"
              aria-current={selected === s.name}
              onClick={() => setSelected(s.name)}
            >
              <div className="no">{i + 1}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <b>{s.name}</b>
                <small>{s.aiReason}</small>
              </div>
              <span className={`fbk ${FB_MAP[feedbacks[s.name]]?.cls ?? 'n'}`}>
                {FEEDBACK_LABELS[feedbacks[s.name] ?? 'good']}
              </span>
            </button>
          ))}

          <div style={{ borderTop: '1px solid var(--line)', marginTop: 4, paddingTop: 4 }}>
            {OTHER_STUDENTS.slice(0, 4).map(s => (
              <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 8px' }}>
                <span style={{ flex: 1, fontSize: 14, fontWeight: 600 }}>{s.name}</span>
                <span className={`fbk ${s.feedback === 'good' ? 'g' : s.feedback === 'almost' ? 'a' : 'r'}`}>
                  {FEEDBACK_LABELS[s.feedback]}
                </span>
              </div>
            ))}
            <p style={{ margin: '4px 8px', fontSize: 12, color: 'var(--ink-3)' }}>
              외 {OTHER_STUDENTS.length - 4}명…
            </p>
          </div>
        </div>

        {/* 오른쪽: 선택된 학생 상세 */}
        {selData && (
          <div>
            {/* 학생 헤더 */}
            <div className="fd-h">
              <div>
                <b>{selData.name}</b>
                <small>{selData.score}</small>
              </div>
              <div className="ai">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.09 6.43H21L15.47 12.6l2.09 6.4L12 15.18 6.44 19l2.09-6.4L3 8.43h6.91L12 2z"/></svg>
                {selData.aiReason}
              </div>
            </div>

            {/* 피드백 선택 */}
            <div className="fpick">
              {(['good', 'almost', 'review'] as FeedbackValue[]).map(v => (
                <button
                  key={v}
                  aria-pressed={feedbacks[selData.name] === v}
                  data-f={FB_MAP[v].f}
                  onClick={() => setFeedbacks(f => ({ ...f, [selData.name]: v }))}
                >
                  <b>{FEEDBACK_LABELS[v]}</b>
                  <small>
                    {v === 'good' ? '잘 이해했어요.' : v === 'almost' ? '조금 더 고민해 봐요.' : '다시 살펴보세요.'}
                  </small>
                </button>
              ))}
            </div>

            {/* 코멘트 입력 */}
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--ink-3)', marginBottom: 6 }}>
                추가 코멘트 (선택)
              </label>
              <input
                value={comments[selData.name] ?? ''}
                onChange={e => setComments(c => ({ ...c, [selData.name]: e.target.value }))}
                style={{
                  width: '100%', height: 44,
                  border: '1.5px solid var(--line)', borderRadius: 12,
                  padding: '0 14px', fontSize: 14, font: 'inherit',
                  outline: 'none', boxSizing: 'border-box',
                }}
              />
            </div>

            {/* 학생에게 보이는 미리보기 */}
            <div style={{ background: 'var(--canvas)', borderRadius: 14, padding: '14px 16px', marginBottom: 14 }}>
              <p style={{ margin: '0 0 10px', fontSize: 12, fontWeight: 800, color: 'var(--ink-3)' }}>
                {selData.name}에게 보이는 화면
              </p>
              <div style={{
                padding: '10px 14px', borderRadius: 10,
                background: fbColor[selFb].bg,
                color: fbColor[selFb].color,
                fontSize: 15, fontWeight: 800, marginBottom: 8,
              }}>
                {FEEDBACK_LABELS[selFb]}
              </div>
              <p style={{ margin: 0, fontSize: 13, color: 'var(--ink-3)' }}>
                {selData.wrongBlock} — 다시 볼 문항
              </p>
            </div>

            {/* 전송 */}
            <div className="fd-foot">
              {sent ? (
                <>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '10px 14px', borderRadius: 10,
                    background: '#ebfbee', color: '#2b8a3e',
                    fontWeight: 700, fontSize: 14,
                  }}>
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
                      <path d="M5 12l4 4L19 8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {DEMO_SESSION.submitted}명에게 전송했어요
                  </div>
                  <button className="btn ghost" onClick={handleUndo}>되돌리기 (5초)</button>
                  <Link href="/class/resubmit" className="btn primary" style={{ textDecoration: 'none' }}>재제출 확인</Link>
                </>
              ) : (
                <button className="btn primary" onClick={handleSend} style={{ flex: 1 }}>
                  제출한 {DEMO_SESSION.submitted}명에게 모두 전송
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
