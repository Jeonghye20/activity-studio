'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const LS_KEY = 'activity_studio_student_info';

export default function EntryClient({ code }: { code: string }) {
  const router = useRouter();
  const [cls, setCls] = useState('2반');
  const [num, setNum] = useState('15');
  const [name, setName] = useState('이서연');
  const [error, setError] = useState('');

  useEffect(() => {
    try {
      const saved = localStorage.getItem(LS_KEY);
      if (saved) {
        const { cls: c, num: n, name: nm } = JSON.parse(saved);
        setCls(c ?? ''); setNum(n ?? ''); setName(nm ?? '');
      }
    } catch {}
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!cls.trim() || !num.trim() || !name.trim()) {
      setError('반, 번호, 이름을 모두 입력해 주세요.'); return;
    }
    localStorage.setItem(LS_KEY, JSON.stringify({ cls, num, name }));
    router.push(`/s/${code}/home`);
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'var(--canvas)', padding: 24,
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <p style={{ margin: '0 0 4px', fontSize: 13, color: 'var(--ink-3)', fontWeight: 600 }}>
            수업 코드 {code}
          </p>
          <h1 style={{ margin: '0 0 6px', fontSize: 20, fontWeight: 850, color: 'var(--ink)', letterSpacing: '-.02em' }}>
            놀이공원 입장료 예측표
          </h1>
          <p style={{ margin: 0, fontSize: 14, color: 'var(--ink-2)' }}>반, 번호, 이름을 입력하세요.</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>반</span>
              <input
                value={cls}
                onChange={e => { setCls(e.target.value); setError(''); }}
                placeholder="예: 2반"
                className="inp"
                style={{ height: 48, fontSize: 15 }}
              />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>번호</span>
              <input
                value={num}
                onChange={e => { setNum(e.target.value); setError(''); }}
                placeholder="예: 15"
                className="inp"
                style={{ height: 48, fontSize: 15 }}
              />
            </label>
          </div>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>이름</span>
            <input
              value={name}
              onChange={e => { setName(e.target.value); setError(''); }}
              placeholder="이름을 입력하세요"
              className="inp"
              style={{ height: 48, fontSize: 15 }}
            />
          </label>

          {error && (
            <p style={{ margin: 0, fontSize: 13, color: 'var(--st-help)', fontWeight: 600 }}>{error}</p>
          )}

          <button
            type="submit"
            className="btn primary"
            style={{ marginTop: 8, height: 52, fontSize: 16, borderRadius: 'var(--r-md)' }}
          >
            활동지 시작하기
          </button>
        </form>
      </div>
    </div>
  );
}
