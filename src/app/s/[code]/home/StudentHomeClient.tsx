'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import StudentNav from '@/components/StudentNav';

interface Submission {
  worksheetId: string;
  title: string;
  type: string;
  submittedAt: string;
  hasFeedback: boolean;
  feedbackType: string | null;
  feedbackText: string | null;
}

const DEMO_ACTIVITY = {
  worksheetId: 'ws-logic',
  title: '놀이공원 입장료 예측표',
  type: 'analysis',
  typeLabel: '자료 분석',
  deadline: '수업 끝날 때',
};

function getSubmissionsKey(code: string) {
  return `activity_studio_submissions_${code}`;
}

export function loadSubmissions(code: string): Submission[] {
  try {
    const raw = localStorage.getItem(getSubmissionsKey(code));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveSubmissions(code: string, submissions: Submission[]) {
  localStorage.setItem(getSubmissionsKey(code), JSON.stringify(submissions));
}

export default function StudentHomeClient({ code }: { code: string }) {
  const [studentName, setStudentName] = useState('');
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const info = localStorage.getItem('activity_studio_student_info');
      if (info) setStudentName(JSON.parse(info).name ?? '');
    } catch {}
    setSubmissions(loadSubmissions(code));
    setMounted(true);
  }, [code]);

  if (!mounted) return null;

  const mySubmission = submissions.find(s => s.worksheetId === DEMO_ACTIVITY.worksheetId);
  const status: 'none' | 'submitted' | 'feedback' = mySubmission
    ? mySubmission.hasFeedback ? 'feedback' : 'submitted'
    : 'none';

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <StudentNav code={code} />

      <main style={{ flex: 1, background: 'var(--canvas)', overflowY: 'auto' }}>
        <div style={{ maxWidth: 640, padding: '32px 32px 60px' }}>
          <h1 style={{ margin: '0 0 28px', fontSize: 22, fontWeight: 850, color: 'var(--ink)', letterSpacing: '-.02em' }}>
            {studentName ? `${studentName}님의 활동` : '내 활동'}
          </h1>

          {/* 지금 수업 */}
          <section style={{ marginBottom: 36 }}>
            <p style={{ margin: '0 0 12px', fontSize: 12, fontWeight: 700, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '.06em' }}>
              지금 수업
            </p>
            <ActivityCard activity={DEMO_ACTIVITY} status={status} code={code} />
          </section>

          {/* 내 활동 기록 */}
          <section>
            <p style={{ margin: '0 0 12px', fontSize: 12, fontWeight: 700, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '.06em' }}>
              내 활동 기록
            </p>
            {submissions.length === 0 ? (
              <div style={{
                padding: '28px 20px', background: 'var(--surface)',
                border: '1px solid var(--line)', borderRadius: 'var(--r-md)',
                textAlign: 'center', color: 'var(--ink-3)', fontSize: 14,
              }}>
                아직 제출한 활동이 없어요.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {submissions.map((s, i) => (
                  <div key={i} style={{
                    background: 'var(--surface)', border: '1px solid var(--line)',
                    borderRadius: 'var(--r-md)', padding: '14px 18px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
                  }}>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 700, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {s.title}
                      </p>
                      <p style={{ margin: 0, fontSize: 13, color: 'var(--ink-3)' }}>
                        {new Date(s.submittedAt).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })} 제출
                        {s.hasFeedback && (
                          <span style={{ marginLeft: 8, color: 'var(--st-done)', fontWeight: 700 }}>· 피드백 수신</span>
                        )}
                      </p>
                    </div>
                    <Link
                      href={`/s/${code}/result`}
                      className="btn ghost"
                      style={{ textDecoration: 'none', flexShrink: 0, fontSize: 13 }}
                    >
                      결과 보기
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

function ActivityCard({
  activity, status, code,
}: {
  activity: typeof DEMO_ACTIVITY;
  status: 'none' | 'submitted' | 'feedback';
  code: string;
}) {
  const isFeedback = status === 'feedback';
  const isSubmitted = status === 'submitted';

  return (
    <div style={{
      background: 'var(--surface)',
      border: `${isFeedback ? '2px' : '1px'} solid ${isFeedback ? 'var(--st-done)' : 'var(--line)'}`,
      borderRadius: 'var(--r-lg)', padding: '18px 20px',
    }}>
      {isFeedback && (
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '4px 10px', borderRadius: 20,
          background: '#d3f9d8', color: 'var(--st-done)',
          fontSize: 12, fontWeight: 700, marginBottom: 12,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--st-done)', display: 'inline-block' }} />
          피드백이 도착했어요
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <span style={{
          padding: '3px 9px', borderRadius: 20, fontSize: 12, fontWeight: 700,
          background: 'var(--canvas)', color: 'var(--ink-2)',
        }}>
          {activity.typeLabel}
        </span>
        {isSubmitted && !isFeedback && (
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--st-done)' }}>제출 완료</span>
        )}
      </div>

      <p style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 700, color: 'var(--ink)' }}>{activity.title}</p>
      <p style={{ margin: '0 0 16px', fontSize: 13, color: 'var(--ink-3)' }}>마감 · {activity.deadline}</p>

      {status === 'none' && (
        <Link
          href={`/s/${code}/activity`}
          className="btn primary"
          style={{ textDecoration: 'none', height: 48, fontSize: 15, borderRadius: 'var(--r-md)' }}
        >
          시작하기
        </Link>
      )}
      {status === 'submitted' && (
        <Link
          href={`/s/${code}/result`}
          className="btn ghost"
          style={{ textDecoration: 'none', height: 44, fontSize: 14 }}
        >
          결과 보기
        </Link>
      )}
      {status === 'feedback' && (
        <Link
          href={`/s/${code}/result`}
          className="btn primary"
          style={{ textDecoration: 'none', height: 48, fontSize: 15, borderRadius: 'var(--r-md)', background: 'var(--st-done)' }}
        >
          피드백 확인
        </Link>
      )}
    </div>
  );
}
