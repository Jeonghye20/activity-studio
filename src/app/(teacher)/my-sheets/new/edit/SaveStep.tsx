'use client';

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
  function handleSave(share: 'none' | 'all') {
    const updated: Sheet = { ...sheet, share };
    saveCreatedSheet(updated);
    addMySheet({
      id: sheet.id,
      worksheetId: sheet.id,
      title: sheet.info.title || '제목 없는 활동지',
      type: sheet.type as WorksheetType,
      unit: sheet.info.unit || '',
      source: 'create',
      savedAt: new Date().toISOString().slice(0, 10),
      shared: share === 'all',
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
              aria-pressed={sheet.share === m}
              onClick={() => handleSave(m)}
            >
              <b>{m === 'none' ? '공유 안 함' : '전국 공유'}</b>
              <small>{m === 'none' ? '나만 볼 수 있어요.' : '전국 정보 선생님의 홈에 보여요.'}</small>
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--line)' }}>
          <button className="btn ghost" onClick={onBack}>만들기로 돌아가기</button>
          <button className="btn primary" onClick={() => handleSave(sheet.share)}>
            내 자료에 저장
          </button>
        </div>
      </div>
    </div>
  );
}
