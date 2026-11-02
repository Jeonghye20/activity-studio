'use client';

import { useEffect, useState } from 'react';
import { loadCreatedSheet } from '@/app/(teacher)/my-sheets/new/edit/createdSheetsStore';
import DeployClient from './DeployClient';
import type { WorksheetType } from '@/types/worksheet';

interface Props {
  id: string;
}

export default function CreatedDeployWrapper({ id }: Props) {
  const [ready, setReady] = useState(false);
  const [sheetData, setSheetData] = useState<{ id: string; title: string; type: WorksheetType } | null>(null);

  useEffect(() => {
    const s = loadCreatedSheet(id);
    if (s) {
      setSheetData({ id: s.id, title: s.info.title || '제목 없는 활동지', type: s.type as WorksheetType });
    } else {
      setSheetData({ id, title: '활동지', type: 'concept' });
    }
    setReady(true);
  }, [id]);

  if (!ready) return <div style={{ padding: 40, color: '#5d6880' }}>불러오는 중…</div>;
  if (!sheetData) return <div style={{ padding: 40 }}>활동지를 찾을 수 없어요.</div>;

  return <DeployClient sheet={sheetData} />;
}
