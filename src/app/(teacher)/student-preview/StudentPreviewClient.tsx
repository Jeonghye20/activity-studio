'use client';

import { useState } from 'react';
import WorksheetViewer from '@/components/WorksheetViewer';
import type { Worksheet, CurriculumUnit } from '@/types/worksheet';

const STEPS = ['접속', '풀기', '제출', '결과'];

function StepBar({ current }: { current: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
      {STEPS.map((label, i) => {
        const n = i + 1;
        const done = n < current;
        const active = n === current;
        return (
          <div key={n} style={{ display: 'flex', alignItems: 'center' }}>
            {i > 0 && <div style={{ width: 32, height: 2, background: done ? 'var(--navy)' : 'var(--line)' }} />}
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{
                width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                background: done || active ? 'var(--navy)' : '#fff',
                border: done || active ? '2px solid var(--navy)' : '2px solid var(--line)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {done
                  ? <svg viewBox="0 0 24 24" width="11" height="11" fill="none"><path d="M5 12l4 4L19 8" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  : <span style={{ fontSize: 10, fontWeight: 800, color: active ? '#fff' : 'var(--mute)' }}>{n}</span>
                }
              </div>
              <span style={{ fontSize: 12, fontWeight: active ? 700 : 600, color: done || active ? 'var(--ink)' : 'var(--mute)', whiteSpace: 'nowrap' }}>
                {label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

interface Props {
  sheet: Worksheet;
  units: CurriculumUnit[];
}

export default function StudentPreviewClient({ sheet, units }: Props) {
  const [showHint, setShowHint] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* 헤더 */}
      <div style={{ padding: '16px 28px 14px', borderBottom: '1px solid var(--line2)', background: '#fff', flexShrink: 0 }}>
        <h1 style={{ margin: '0 0 2px', fontSize: 22, fontWeight: 800, color: 'var(--ink)' }}>학생 화면 미리보기</h1>
        <p style={{ margin: '0 0 12px', fontSize: 13, color: 'var(--mute)' }}>
          {sheet.title} · 교사용 미리보기라 제출되지 않아요
        </p>
        <StepBar current={2} />
      </div>

      {/* 활동지 본문 */}
      <div style={{ flex: 1, overflowY: 'auto', background: '#f5f7fa' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', background: '#fff', minHeight: '100%', padding: '24px 28px 100px' }}>
          <WorksheetViewer sheet={sheet} showAnswers={false} units={units} />
        </div>
      </div>

      {/* 하단 바 */}
      <div style={{
        borderTop: '1px solid var(--line2)', padding: '14px 28px',
        background: '#fff', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          {showHint && (
            <p style={{ margin: '0 0 4px', fontSize: 13, color: 'var(--sub)' }}>
              힌트: 조건을 하나씩 확인해 보세요.
            </p>
          )}
          <button
            onClick={() => setShowHint(v => !v)}
            style={{
              height: 40, padding: '0 16px',
              border: '1.5px solid var(--line)', borderRadius: 10,
              background: '#fff', fontSize: 13, fontWeight: 600, color: 'var(--sub)', cursor: 'pointer',
            }}
          >
            힌트 1단계 보기
          </button>
        </div>
        <button
          style={{
            height: 48, padding: '0 28px',
            background: 'var(--navy)', color: '#fff',
            border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: 'pointer',
          }}
        >
          다 풀었어요
        </button>
      </div>
    </div>
  );
}
