'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import StudentNav from '@/components/StudentNav';

type Phase = 'submitted' | 'feedback';

const DEMO_WORKSHEET_ID = 'ws-logic';

function updateSubmissionFeedback(code: string) {
  try {
    const key = `activity_studio_submissions_${code}`;
    const existing = JSON.parse(localStorage.getItem(key) ?? '[]');
    const updated = existing.map((s: { worksheetId: string }) =>
      s.worksheetId === DEMO_WORKSHEET_ID
        ? { ...s, hasFeedback: true, feedbackType: 'review', feedbackText: '요금표에서 15세가 어느 칸에 들어가는지 먼저 찾아볼까요?' }
        : s
    );
    localStorage.setItem(key, JSON.stringify(updated));
  } catch {}
}

export default function ResultClient({ code }: { code: string }) {
  const [phase, setPhase] = useState<Phase>('submitted');
  const [studentName, setStudentName] = useState('');

  useEffect(() => {
    try {
      const info = localStorage.getItem('activity_studio_student_info');
      if (info) setStudentName(JSON.parse(info).name ?? '');
    } catch {}

    const t = setTimeout(() => {
      updateSubmissionFeedback(code);
      setPhase('feedback');
    }, 8000);
    return () => clearTimeout(t);
  }, [code]);

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <StudentNav code={code} />
      <main style={{
        flex: 1, background: 'var(--canvas)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
      }}>
        <div style={{ width: '100%', maxWidth: 480 }}>
          {phase === 'submitted'
            ? <SubmittedState name={studentName} code={code} />
            : <FeedbackState name={studentName} code={code} />}
        </div>
      </main>
    </div>
  );
}

function SubmittedState({ name, code }: { name: string; code: string }) {
  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--line)',
      borderRadius: 'var(--r-lg)', padding: '36px 32px', textAlign: 'center',
    }}>
      <div style={{
        width: 56, height: 56, borderRadius: '50%',
        background: '#d3f9d8', margin: '0 auto 16px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <svg viewBox="0 0 24 24" width="28" height="28" fill="none">
          <path d="M5 12l4 4L19 8" stroke="var(--st-done)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <h2 style={{ margin: '0 0 8px', fontSize: 22, fontWeight: 850, color: 'var(--ink)', letterSpacing: '-.02em' }}>
        {name ? `${name}, 제출했어요!` : '제출했어요!'}
      </h2>
      <p style={{ margin: '0 0 24px', fontSize: 14, color: 'var(--ink-2)' }}>
        선생님이 확인하고 피드백을 보내 줄 거예요.
      </p>
      <div style={{
        padding: '14px 18px', background: 'var(--canvas)',
        borderRadius: 'var(--r-sm)', fontSize: 13, color: 'var(--ink-3)', marginBottom: 20,
      }}>
        피드백이 오면 여기에 표시돼요. 이 화면을 열어 두세요.
      </div>
      <Link href={`/s/${code}/home`} className="btn ghost" style={{ textDecoration: 'none' }}>
        홈으로
      </Link>
    </div>
  );
}

function FeedbackState({ name, code }: { name: string; code: string }) {
  const [resubmit, setResubmit] = useState(false);

  if (resubmit) {
    return (
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--line)',
        borderRadius: 'var(--r-lg)', padding: '36px 32px', textAlign: 'center',
      }}>
        <h2 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 850, color: 'var(--ink)', letterSpacing: '-.02em' }}>
          다시 제출할 수 있어요
        </h2>
        <p style={{ margin: '0 0 20px', fontSize: 14, color: 'var(--ink-2)' }}>
          문항 2를 다시 풀고 제출해 보세요.
        </p>
        <a
          href={`/s/${code}/activity`}
          className="btn primary"
          style={{ textDecoration: 'none', height: 48, fontSize: 15, borderRadius: 'var(--r-md)' }}
        >
          활동지 다시 풀기
        </a>
      </div>
    );
  }

  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--line)',
      borderRadius: 'var(--r-lg)', padding: '36px 32px',
    }}>
      <p style={{ margin: '0 0 16px', fontSize: 13, color: 'var(--ink-3)', textAlign: 'center', fontWeight: 600 }}>
        선생님 피드백
      </p>
      <div style={{
        padding: '18px 20px', borderRadius: 'var(--r-md)', marginBottom: 16, textAlign: 'center',
        background: '#fff5f5', border: '1px solid #ffc9c9',
      }}>
        <p style={{ margin: 0, fontSize: 20, fontWeight: 850, color: 'var(--st-help)', letterSpacing: '-.02em' }}>
          한 번 더 살펴봐요
        </p>
      </div>

      <div style={{
        padding: '14px 16px', background: 'var(--canvas)', borderRadius: 'var(--r-sm)', marginBottom: 16,
      }}>
        <p style={{ margin: '0 0 4px', fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>선생님 메시지</p>
        <p style={{ margin: 0, fontSize: 14, color: 'var(--ink-2)' }}>
          요금표에서 15세가 어느 칸에 들어가는지 먼저 찾아볼까요?
        </p>
      </div>

      <div style={{
        padding: '12px 16px', border: '1px solid var(--line)', borderRadius: 'var(--r-sm)', marginBottom: 20,
      }}>
        <p style={{ margin: '0 0 6px', fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>
          다시 볼 칸{' '}
          <span style={{
            padding: '2px 8px', borderRadius: 6, fontSize: 12, fontWeight: 700,
            background: 'var(--canvas)', color: 'var(--ink-2)',
          }}>
            문항 2
          </span>
        </p>
        <p style={{ margin: '0 0 10px', fontSize: 13, color: 'var(--ink-3)' }}>고쳐서 다시 낼 수 있어요</p>
        <button
          className="btn ghost"
          onClick={() => setResubmit(true)}
          style={{ fontWeight: 700, borderColor: 'var(--ink)', color: 'var(--ink)' }}
        >
          다시 제출
        </button>
      </div>

      <div style={{ textAlign: 'right' }}>
        <Link href={`/s/${code}/home`} className="btn ghost" style={{ textDecoration: 'none', fontSize: 13 }}>
          홈으로
        </Link>
      </div>
    </div>
  );
}
