'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const VALID_CODES = ['T7Y75'];

export default function StudentCodePage() {
  const router = useRouter();
  const [code, setCode] = useState('T7Y75');
  const [error, setError] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) { setError('수업 코드를 입력해 주세요.'); return; }
    if (!VALID_CODES.includes(trimmed)) { setError('코드를 다시 확인해 주세요.'); return; }
    router.push(`/s/${trimmed}`);
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'var(--canvas)', padding: 24,
    }}>
      <div style={{ width: '100%', maxWidth: 380 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{ margin: '0 0 6px', fontSize: 24, fontWeight: 850, color: 'var(--ink)', letterSpacing: '-.02em' }}>
            수업활동 스튜디오
          </h1>
          <p style={{ margin: 0, fontSize: 14, color: 'var(--ink-3)' }}>
            선생님이 알려 준 수업 코드를 입력하세요.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <input
            value={code}
            onChange={e => { setCode(e.target.value); setError(''); }}
            placeholder="수업 코드 (예: T7Y75)"
            autoFocus
            style={{
              width: '100%', height: 56,
              border: `1.5px solid ${error ? 'var(--st-help)' : 'var(--line)'}`,
              borderRadius: 'var(--r-md)', padding: '0 18px',
              fontSize: 20, fontWeight: 800, color: 'var(--ink)', background: 'var(--surface)',
              boxSizing: 'border-box', textAlign: 'center', letterSpacing: 4, outline: 'none',
              display: 'block', fontFamily: 'inherit',
            }}
          />
          {error && (
            <p style={{ margin: '8px 0 0', fontSize: 13, color: 'var(--st-help)', textAlign: 'center' }}>
              {error}
            </p>
          )}
          <button
            type="submit"
            className="btn primary"
            style={{ marginTop: 14, width: '100%', height: 52, fontSize: 16, borderRadius: 'var(--r-md)' }}
          >
            입장하기
          </button>
        </form>
      </div>
    </div>
  );
}
