'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import StudentEntryLayout from '@/components/StudentEntryLayout';

const LS_KEY = 'activity_studio_student_info';
const PURPLE = '#6741d9';

// 2학년 3반 명단 — classRosterDummy.ts NAMES_C3 재사용
const ROSTER = [
  '김민준', '이서연', '박지훈', '최유나', '정하윤', '강도윤',
  '조서준', '윤지우', '장예린', '임시우', '한지민', '오태윤',
  '서하은', '신우진', '권나은', '황준서', '안수아', '송민재',
  '류채원', '홍건우', '전소율', '고은호', '문다인', '양현우',
].map((name, i) => ({ no: i + 1, name }));

interface ActivityInfo {
  title: string;
  typeLabel: string;
  typeColor: string;
  meta: string;
}

const FALLBACK_ACTIVITY: ActivityInfo = {
  title: '활동지',
  typeLabel: '활동',
  typeColor: '#5d6880',
  meta: '',
};

function roJosa(name: string): string {
  const code = name.charCodeAt(name.length - 1);
  if (code < 0xAC00 || code > 0xD7A3) return '로';
  return (code - 0xAC00) % 28 !== 0 ? '으로' : '로';
}

export default function EntryClient({ code, activityInfo }: { code: string; activityInfo?: ActivityInfo | null }) {
  const activity = activityInfo ?? FALLBACK_ACTIVITY;
  const router = useRouter();
  const [selected, setSelected] = useState<{ no: number; name: string } | null>(
    ROSTER.find(s => s.name === '박지훈') ?? null
  );

  function handleStart() {
    if (!selected) return;
    localStorage.setItem(LS_KEY, JSON.stringify({
      cls: '2학년 3반',
      num: String(selected.no),
      name: selected.name,
    }));
    router.push(`/s/${code}/home`);
  }

  const paddedNum = selected ? String(selected.no).padStart(2, '0') : '';
  const btnLabel = selected
    ? `${paddedNum} ${selected.name}${roJosa(selected.name)} 시작하기 →`
    : '이름을 골라 주세요';

  return (
    <StudentEntryLayout step={2}>
      {/* 활동 확인 카드 */}
      <div style={{
        background: '#fff', border: '1px solid #e3e7ef', borderRadius: 16,
        padding: '16px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
        marginBottom: 36,
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5, minWidth: 0 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700, color: '#5d6880' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: activity.typeColor, flexShrink: 0 }} />
            {activity.typeLabel}
          </span>
          <p style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#172036', letterSpacing: '-.01em' }}>
            {activity.title}
          </p>
          <p style={{ margin: 0, fontSize: 13, color: '#5d6880' }}>{activity.meta}</p>
        </div>
        <button
          onClick={() => router.push('/s')}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 13, fontWeight: 700, color: PURPLE,
            flexShrink: 0, padding: '4px 0',
          }}
        >
          코드 다시 입력
        </button>
      </div>

      {/* 제목 */}
      <h2 style={{ margin: '0 0 8px', fontSize: 26, fontWeight: 850, color: '#172036', letterSpacing: '-.02em' }}>
        내 이름을 골라요
      </h2>
      <p style={{ margin: '0 0 24px', fontSize: 15, color: '#5d6880' }}>
        2학년 3반 명단이에요. 번호와 이름을 확인하세요.
      </p>

      {/* 명단 그리드 */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8,
        marginBottom: 24,
      }}>
        {ROSTER.map(student => {
          const active = selected?.no === student.no;
          return (
            <button
              key={student.no}
              onClick={() => setSelected(active ? null : student)}
              style={{
                height: 64, borderRadius: 12,
                border: `${active ? 2 : 1}px solid ${active ? PURPLE : '#e3e7ef'}`,
                background: active ? '#f3f0ff' : '#fff',
                cursor: 'pointer',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: 2,
                padding: '0 4px',
                transition: 'border-color .12s, background .12s',
              }}
            >
              <span style={{ fontSize: 11, fontWeight: 700, color: active ? PURPLE : '#9ca3af' }}>
                {String(student.no).padStart(2, '0')}
              </span>
              <span style={{ fontSize: 13, fontWeight: 700, color: active ? PURPLE : '#172036' }}>
                {student.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* 시작 버튼 */}
      <button
        onClick={handleStart}
        disabled={!selected}
        style={{
          width: '100%', height: 64,
          background: selected ? PURPLE : '#d1d5db',
          color: '#fff', border: 'none', borderRadius: 16,
          fontSize: 17, fontWeight: 800, letterSpacing: '-.01em',
          cursor: selected ? 'pointer' : 'default',
          transition: 'background .15s',
        }}
      >
        {btnLabel}
      </button>
    </StudentEntryLayout>
  );
}
