'use client';

import { useState } from 'react';
import type { Sheet } from './types';
import type { WorksheetType } from '@/types/worksheet';
import { addMySheet } from '@/app/(teacher)/my-sheets/MySheetsClient';
import { saveCreatedSheet } from './createdSheetsStore';

interface Props {
  sheet: Sheet;
  blockCount: number;
  onBack: () => void;
  onSaved: () => void;
}

export default function SaveStep({ sheet, blockCount, onBack, onSaved }: Props) {
  const [selectedShare, setSelectedShare] = useState<'none' | 'all'>(sheet.share ?? 'none');
  const [sourceChecked, setSourceChecked] = useState(false);

  const canSave = selectedShare === 'none' || sourceChecked;

  function handleSave() {
    if (!canSave) return;
    const updated: Sheet = { ...sheet, share: selectedShare };
    saveCreatedSheet(updated);
    addMySheet({
      id: sheet.id,
      worksheetId: sheet.id,
      title: sheet.info.title || '제목 없는 활동지',
      type: sheet.type as WorksheetType,
      unit: sheet.info.unit || '',
      source: 'create',
      savedAt: new Date().toISOString().slice(0, 10),
      shared: selectedShare === 'all',
    });
    onSaved();
  }

  return (
    <div style={{ maxWidth: 680 }}>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--r-lg)', padding: '24px 28px' }}>
        <h2 style={{ margin: '0 0 4px', fontSize: 20, fontWeight: 800 }}>내 자료에 저장할까요?</h2>
        <p style={{ margin: '0 0 20px', fontSize: 14, color: 'var(--ink-3)' }}>
          {sheet.info.title || '제목 없는 활동지'} · 문항 {blockCount}개
        </p>

        <p style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 800, color: 'var(--ink-2)' }}>공유</p>
        <div className="share-opt">
          {(['none', 'all'] as const).map(m => (
            <button
              key={m}
              className="ocard"
              aria-pressed={selectedShare === m}
              onClick={() => { setSelectedShare(m); if (m === 'none') setSourceChecked(false); }}
            >
              <b>{m === 'none' ? '공유 안 함' : '전국 공유'}</b>
              <small>{m === 'none' ? '나만 볼 수 있어요.' : '전국 정보 선생님의 홈에 보여요.'}</small>
            </button>
          ))}
        </div>

        {selectedShare === 'all' && (
          <div style={{ marginTop: 14, padding: '14px 16px', border: '1px solid #e3e7ef', borderRadius: 10, background: '#f8f9fa' }}>
            <p style={{ margin: '0 0 10px', fontSize: 13, color: '#4a5563' }}>다른 선생님이 볼 수 있어요. 올린 자료의 출처를 확인해 주세요.</p>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={sourceChecked}
                onChange={e => setSourceChecked(e.target.checked)}
                style={{ width: 16, height: 16, accentColor: '#1c3a6b', cursor: 'pointer' }}
              />
              <span style={{ fontSize: 13.5, fontWeight: 700, color: '#172036' }}>자료 출처를 확인했어요</span>
            </label>
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--line)' }}>
          <button className="btn ghost" onClick={onBack}>만들기로 돌아가기</button>
          <button
            className="btn primary"
            onClick={handleSave}
            disabled={!canSave}
            style={{ opacity: canSave ? 1 : 0.45, cursor: canSave ? 'pointer' : 'not-allowed' }}
          >
            저장하기
          </button>
        </div>
      </div>
    </div>
  );
}
