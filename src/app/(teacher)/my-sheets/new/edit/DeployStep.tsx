'use client';

import Link from 'next/link';
import type { Sheet } from './types';
import type { WorksheetType } from '@/types/worksheet';
import { SheetCard } from '@/app/(teacher)/my-sheets/MySheetsClient';

interface Props {
  sheet: Sheet;
}

export default function DeployStep({ sheet }: Props) {
  const title = sheet.info.title || '제목 없는 활동지';

  const cardData = {
    id: sheet.id,
    worksheetId: sheet.id,
    title,
    type: sheet.type as WorksheetType,
    unit: sheet.info.unit || '',
    unitTitle: sheet.info.unit || '',
    source: 'create' as const,
    savedAt: sheet.createdAt,
    shared: sheet.share === 'all',
  };

  return (
    <div style={{ maxWidth: 680 }}>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--r-lg)', padding: '24px 28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: '#ebfbee', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
              <path d="M5 12l4 4L19 8" stroke="#2b8a3e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>내 자료에 저장했어요</h2>
            <p style={{ margin: '2px 0 0', fontSize: 14, color: 'var(--ink-3)' }}>{title}</p>
          </div>
        </div>

        {/* 카드 미리보기 */}
        <div style={{ maxWidth: 200, marginBottom: 20 }}>
          <SheetCard sheet={cardData} />
        </div>

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', paddingTop: 16, borderTop: '1px solid var(--line)' }}>
          <Link href="/my-sheets" className="btn ghost" style={{ textDecoration: 'none' }}>
            내 자료에서 보기
          </Link>
          <Link
            href={`/worksheets/${sheet.id}/deploy`}
            className="btn primary"
            style={{ textDecoration: 'none' }}
          >
            배포하기
          </Link>
        </div>
      </div>
    </div>
  );
}
