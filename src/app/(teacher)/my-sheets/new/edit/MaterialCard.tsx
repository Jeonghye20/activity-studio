'use client';

import { useState } from 'react';
import type { SheetType } from './types';
import { DEMO_MATERIAL_CONCEPT, DEMO_MATERIAL_FREE } from './demoData';

type TabKey = 'file' | 'url' | 'text' | 'textbook';
type FreeCount = 5 | 6 | 7;

interface Props {
  sheetType: SheetType;
  onFill: (freeCount?: FreeCount) => void;
  loading: boolean;
  done: boolean;
  filledCount: number;
  onReset: () => void;
}

const FILL_STEPS = ['자료 읽는 중…', '학습목표 정리…', '문항 만드는 중…'];

const tabs: { key: TabKey; label: string }[] = [
  { key: 'file',     label: '파일 올리기' },
  { key: 'url',      label: 'URL 입력' },
  { key: 'text',     label: '글 붙여 넣기' },
  { key: 'textbook', label: '교과서 단원' },
];

const freeLabels: Record<number, string> = {
  5: 'OX · 빈칸 채우기 · 자료 읽기 · 자물쇠 풀기 · 내 의견 쓰기',
  6: 'OX · 빈칸 채우기 · 선 잇기 · 자료 읽기 · 자물쇠 풀기 · 내 의견 쓰기',
  7: 'OX · 빈칸 채우기 · 선 잇기 · 분류하기 · 자료 읽기 · 자물쇠 풀기 · 내 의견 쓰기',
};

export default function MaterialCard({ sheetType, onFill, done, filledCount, onReset }: Props) {
  const [tab, setTab]               = useState<TabKey>('file');
  const [fileName, setFileName]     = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [freeCount, setFreeCount]   = useState<FreeCount>(6);
  const [loadStep, setLoadStep]     = useState(0);

  const material  = sheetType === 'concept' ? DEMO_MATERIAL_CONCEPT : DEMO_MATERIAL_FREE;
  const isRunning = loadStep > 0 && loadStep <= FILL_STEPS.length;

  function handleDemoClick() {
    setFileName(material.fileName);
    setShowPreview(true);
  }

  function handleFill() {
    if (isRunning) return;
    setLoadStep(1);
    const next = (step: number) => {
      if (step > FILL_STEPS.length) {
        setLoadStep(0);
        onFill(sheetType === 'free' ? freeCount : undefined);
        return;
      }
      setLoadStep(step);
      setTimeout(() => next(step + 1), 800);
    };
    setTimeout(() => next(2), 800);
  }

  /* ── 완료 후 한 줄 카드 ── */
  if (done) {
    const doneMsg = sheetType === 'free'
      ? `문항 ${freeCount}개를 만들었어요 (${freeLabels[freeCount]}).`
      : `빈 칸 ${filledCount}개를 채웠어요.`;

    return (
      <div style={{
        border: '1.5px solid #7048e8', borderRadius: 16, background: '#fff',
        padding: '14px 18px', marginBottom: 18,
        display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
      }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#7048e8', flexShrink: 0 }}>
          ✦ 자료: {fileName || material.fileName}
        </span>
        <span style={{ fontSize: 13.5, color: '#172036', flex: 1, minWidth: 200 }}>
          {doneMsg} 보라색 칸을 확인하고 고쳐 주세요.
        </span>
        <button onClick={onReset} style={{ height: 32, padding: '0 12px', borderRadius: 8, border: '1px solid #e3e7ef', background: '#fff', fontSize: 13, cursor: 'pointer', color: '#5d6880', whiteSpace: 'nowrap' }}>
          빈 칸 다시 채우기
        </button>
        <button onClick={onReset} style={{ height: 32, padding: '0 12px', borderRadius: 8, border: '1px solid #e3e7ef', background: '#fff', fontSize: 13, cursor: 'pointer', color: '#5d6880', whiteSpace: 'nowrap' }}>
          자료 바꾸기
        </button>
      </div>
    );
  }

  /* ── 메인 카드 ── */
  return (
    <div style={{ border: '1.5px solid #7048e8', borderRadius: 16, background: '#fdfcff', padding: '18px 20px', marginBottom: 18 }}>
      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>

        {/* ─ 왼쪽 ─ */}
        <div style={{ flex: 1, minWidth: 260 }}>
          <p style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 800 }}>✦ 자료로 한 번에 채우기</p>
          <p style={{ margin: '0 0 14px', fontSize: 13.5, color: '#5d6880' }}>
            {sheetType === 'free'
              ? '자료를 넣으면 AI가 문항 방식과 개수(5~7개)를 정해 활동지를 만들어요. 이미 쓴 칸은 그대로 둬요.'
              : '자료를 넣으면 AI가 빈 칸을 채워요. 이미 쓴 칸은 그대로 둬요.'}
          </p>

          {/* 자유형 문항 수 */}
          {sheetType === 'free' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#5d6880' }}>만들 문항 수</span>
              {([5, 6, 7] as FreeCount[]).map(n => (
                <button
                  key={n}
                  onClick={() => setFreeCount(n)}
                  style={{ height: 32, padding: '0 14px', borderRadius: 8, border: `1.5px solid ${freeCount === n ? '#7048e8' : '#e3e7ef'}`, background: freeCount === n ? '#ede9fe' : '#fff', color: freeCount === n ? '#7048e8' : '#5d6880', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
                >
                  {n}개
                </button>
              ))}
            </div>
          )}

          {/* 탭: 알약 버튼 */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
            {tabs.map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                style={{
                  height: 32, padding: '0 16px', borderRadius: 20,
                  border: `1.5px solid ${tab === t.key ? '#7048e8' : '#e3e7ef'}`,
                  background: tab === t.key ? '#f3f0ff' : '#fff',
                  color: tab === t.key ? '#7048e8' : '#5d6880',
                  fontSize: 13, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap',
                }}
              >{t.label}</button>
            ))}
          </div>

          {/* 탭 콘텐츠 */}
          {tab === 'file' && (
            <div
              style={{ border: '1.5px dashed #c7cedb', borderRadius: 12, padding: '18px 16px', background: '#fbfcfe', cursor: 'pointer', textAlign: 'center' }}
              onClick={() => setFileName(material.fileName)}
            >
              {fileName ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                  <span style={{ fontSize: 22 }}>📄</span>
                  <span style={{ fontWeight: 700, fontSize: 14, color: '#172036' }}>{fileName}</span>
                </div>
              ) : (
                <>
                  <svg viewBox="0 0 40 40" width="36" height="36" fill="none" style={{ margin: '0 auto 6px', display: 'block' }}>
                    <path d="M20 6 v18" stroke="#adb5bd" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M13 14 l7-8 7 8" stroke="#adb5bd" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M8 28 v6 h24 v-6" stroke="#adb5bd" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <p style={{ margin: '0 0 4px', fontSize: 13.5, fontWeight: 700, color: '#5d6880' }}>
                    수업 자료를 끌어다 놓거나 눌러서 올리세요
                  </p>
                  <p style={{ margin: 0, fontSize: 12, color: '#a3abbb' }}>
                    PDF · PPT · 워드 · 이미지(판서·교과서 사진)
                  </p>
                </>
              )}
            </div>
          )}
          {tab === 'url' && (
            <input placeholder="https://" style={{ width: '100%', height: 44, border: '1.5px dashed #c7cedb', borderRadius: 12, padding: '0 14px', font: 'inherit', fontSize: 14, outline: 'none', background: '#fbfcfe', boxSizing: 'border-box' }} />
          )}
          {tab === 'text' && (
            <textarea placeholder="자료 내용을 붙여 넣으세요" rows={3} style={{ width: '100%', border: '1.5px dashed #c7cedb', borderRadius: 12, padding: '8px 14px', font: 'inherit', fontSize: 14, outline: 'none', background: '#fbfcfe', resize: 'vertical', boxSizing: 'border-box' }} />
          )}
          {tab === 'textbook' && (
            <select style={{ width: '100%', height: 44, border: '1.5px dashed #c7cedb', borderRadius: 12, padding: '0 14px', font: 'inherit', fontSize: 14, background: '#fbfcfe', boxSizing: 'border-box' }}>
              <option value="">단원을 선택하세요</option>
              <option>Ⅱ-2-03 조건문 이해하기</option>
              <option>Ⅰ-2-02 개인정보 보호와 정보 보안</option>
            </select>
          )}
        </div>

        {/* ─ 오른쪽: 버튼 ─ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'stretch', minWidth: 152 }}>
          <button
            onClick={handleFill}
            disabled={isRunning}
            style={{ height: 44, padding: '0 20px', borderRadius: 12, border: 0, background: isRunning ? '#d3c5f7' : '#7048e8', color: '#fff', fontSize: 14.5, fontWeight: 800, cursor: isRunning ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap' }}
          >
            {isRunning ? (FILL_STEPS[loadStep - 1] ?? '준비 중…') : '✦ 빈 칸 채우기'}
          </button>
          <button
            onClick={handleDemoClick}
            style={{ height: 36, border: '1.5px solid #e3e7ef', borderRadius: 10, background: '#fff', color: '#7048e8', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
          >
            예시 자료로 해 보기
          </button>
        </div>
      </div>

      {/* ── 예시 자료 미리보기 ── */}
      {showPreview && (
        <div style={{ marginTop: 16, borderTop: '1px solid #ede9fe', paddingTop: 14, display: 'grid', gridTemplateColumns: '86px 1fr', gap: 16, alignItems: 'start' }}>
          {/* 썸네일 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {Array.from({ length: material.pages }).map((_, i) => (
              <div key={i} style={{ height: 60, background: '#f3f5fa', border: '1px solid #e3e7ef', borderRadius: 8, display: 'grid', placeItems: 'center', fontSize: 12, color: '#a3abbb', fontWeight: 700 }}>
                {i + 1}쪽
              </div>
            ))}
          </div>
          {/* 발췌문 */}
          <div>
            <p style={{ margin: '0 0 8px', fontSize: 12.5, fontWeight: 800, color: '#7048e8' }}>{fileName} · 자료 발췌</p>
            {material.excerpt.map((e, i) => (
              <p key={i} style={{ margin: '0 0 8px', fontSize: 14, lineHeight: 1.75, background: '#fff', padding: '8px 12px', borderRadius: 8, border: '1px solid #ede9fe' }}>
                {e.text.split(/(\[[^\]]+\])/g).map((p, j) =>
                  j % 2 === 1
                    ? <mark key={j} style={{ background: '#ffe066', borderRadius: 3, padding: '0 2px' }}>{p.slice(1, -1)}</mark>
                    : <span key={j}>{p}</span>
                )}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
