'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import StudentEntryLayout from '@/components/StudentEntryLayout';
import { DEMO_ENTRY_CODE } from '@/lib/studentDemoData';

const VALID_CODES = ['T7Y75'];
const PURPLE = '#6741d9';

function IconQR() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <rect x="2" y="2" width="9" height="9" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <rect x="4.5" y="4.5" width="4" height="4" rx=".5" />
      <rect x="13" y="2" width="9" height="9" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <rect x="15.5" y="4.5" width="4" height="4" rx=".5" />
      <rect x="2" y="13" width="9" height="9" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <rect x="4.5" y="15.5" width="4" height="4" rx=".5" />
      <rect x="13" y="13" width="3.5" height="3.5" rx=".5" />
      <rect x="17.5" y="13" width="3.5" height="3.5" rx=".5" />
      <rect x="13" y="17.5" width="3.5" height="3.5" rx=".5" />
      <rect x="17.5" y="17.5" width="3.5" height="3.5" rx=".5" />
    </svg>
  );
}

export default function StudentCodePage() {
  const router = useRouter();
  const [digits, setDigits] = useState(() =>
    DEMO_ENTRY_CODE ? DEMO_ENTRY_CODE.split('') : ['', '', '', '', '']
  );
  const [error, setError] = useState('');
  const [showQrMsg, setShowQrMsg] = useState(false);
  const [resetMsg, setResetMsg] = useState(false);
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const code = digits.join('');
  const complete = digits.every(d => d !== '');

  useEffect(() => {
    refs.current[0]?.focus();
  }, []);

  function handleChange(index: number, e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(-1);
    setDigits(prev => {
      const nd = [...prev];
      nd[index] = val;
      return nd;
    });
    setError('');
    if (val && index < 4) refs.current[index + 1]?.focus();
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace') {
      e.preventDefault();
      const wasEmpty = !digits[index];
      setDigits(prev => {
        if (!prev[index]) return prev;
        const nd = [...prev]; nd[index] = ''; return nd;
      });
      if (wasEmpty && index > 0) refs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      refs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 4) {
      e.preventDefault();
      refs.current[index + 1]?.focus();
    }
  }

  function handlePaste(index: number, e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const text = e.clipboardData.getData('text').toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (!text) return;
    setDigits(prev => {
      const nd = [...prev];
      for (let i = 0; i < text.length && index + i < 5; i++) nd[index + i] = text[i];
      return nd;
    });
    setError('');
    refs.current[Math.min(index + text.length, 4)]?.focus();
  }

  function handleSubmit() {
    if (!complete) return;
    if (!VALID_CODES.includes(code)) {
      setError('코드를 다시 확인해 주세요');
      return;
    }
    router.push(`/s/${code}`);
  }

  function handleReset() {
    try {
      const prefixes = [
        'activity_studio_student_info',
        'activity_studio_view_mode',
        'activity_studio_submissions_',
        'activity_studio_result_viewed_',
        'activity_studio_answers_',
        'activity_studio_help_',
      ];
      const keys = Array.from({ length: localStorage.length }, (_, i) => localStorage.key(i))
        .filter((k): k is string => k !== null && prefixes.some(p => k === p || k.startsWith(p)));
      keys.forEach(k => localStorage.removeItem(k));
    } catch {}
    setDigits(DEMO_ENTRY_CODE ? DEMO_ENTRY_CODE.split('') : ['', '', '', '', '']);
    setError('');
    setResetMsg(true);
    setTimeout(() => setResetMsg(false), 2500);
  }

  return (
    <StudentEntryLayout step={1}>
      <h2 style={{
        margin: '0 0 8px', fontSize: 26, fontWeight: 850,
        color: '#172036', letterSpacing: '-.02em',
      }}>
        수업 코드를 입력하세요
      </h2>
      <p style={{ margin: '0 0 36px', fontSize: 15, color: '#5d6880' }}>
        칠판이나 화면에 있는 5자리 코드예요.
      </p>

      {/* 5칸 코드 입력 */}
      <div style={{ maxWidth: 536, margin: '0 auto' }}>
        <div style={{ display: 'flex', gap: 14, justifyContent: 'center' }}>
          {digits.map((d, i) => (
            <input
              key={i}
              ref={el => { refs.current[i] = el; }}
              type="text"
              inputMode="text"
              value={d}
              onChange={e => handleChange(i, e)}
              onKeyDown={e => handleKeyDown(i, e)}
              onPaste={e => handlePaste(i, e)}
              style={{
                width: 96, height: 112,
                borderRadius: 16,
                border: `2px solid ${error ? '#e03131' : d ? PURPLE : '#d1d5db'}`,
                background: d ? '#f8f5ff' : '#fff',
                fontSize: 44, fontWeight: 800,
                color: '#172036',
                textAlign: 'center',
                outline: 'none',
                fontFamily: 'inherit',
                caretColor: PURPLE,
                transition: 'border-color .15s, background .15s',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            />
          ))}
        </div>
        {error && (
          <p style={{ margin: '10px 0 0', fontSize: 13, color: '#e03131', fontWeight: 600, textAlign: 'center' }}>
            {error}
          </p>
        )}
        {DEMO_ENTRY_CODE && (
          <p style={{ margin: '10px 0 0', fontSize: 12, color: '#9ca3af', textAlign: 'center' }}>
            시연용 코드 {DEMO_ENTRY_CODE}가 미리 들어가 있어요
          </p>
        )}
      </div>

      {/* 입장 버튼 */}
      <div style={{ maxWidth: 536, margin: '20px auto 0' }}>
        <button
          onClick={handleSubmit}
          disabled={!complete}
          style={{
            width: '100%', height: 64,
            background: complete ? PURPLE : '#d1d5db',
            color: '#fff', border: 'none', borderRadius: 16,
            fontSize: 17, fontWeight: 800, letterSpacing: '-.01em',
            cursor: complete ? 'pointer' : 'default',
            transition: 'background .15s',
          }}
        >
          입장하기 →
        </button>
      </div>

      {/* 구분선 */}
      <div style={{ maxWidth: 536, margin: '28px auto', display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ flex: 1, height: 1, background: '#e3e7ef' }} />
        <span style={{ fontSize: 13, color: '#9ca3af', fontWeight: 600 }}>또는</span>
        <div style={{ flex: 1, height: 1, background: '#e3e7ef' }} />
      </div>

      {/* QR 버튼 */}
      <div style={{ maxWidth: 536, margin: '0 auto' }}>
        <button
          onClick={() => setShowQrMsg(v => !v)}
          style={{
            width: '100%', height: 56,
            background: '#fff', color: '#172036',
            border: '1.5px solid #e3e7ef', borderRadius: 16,
            fontSize: 15, fontWeight: 700, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          }}
        >
          <IconQR />
          QR 코드 찍고 들어가기
        </button>
        {showQrMsg && (
          <p style={{ margin: '10px 0 0', fontSize: 13, color: '#9ca3af', textAlign: 'center' }}>
            준비 중이에요
          </p>
        )}
      </div>

      {/* 시연 초기화 버튼 */}
      <div style={{ maxWidth: 536, margin: '24px auto 0', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 10 }}>
        {resetMsg && (
          <span style={{ fontSize: 12, color: '#6b7280' }}>처음 상태로 돌렸어요</span>
        )}
        <button
          onClick={handleReset}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 12, color: '#9ca3af', padding: '4px 0',
          }}
        >
          시연 데이터 처음으로
        </button>
      </div>
    </StudentEntryLayout>
  );
}
