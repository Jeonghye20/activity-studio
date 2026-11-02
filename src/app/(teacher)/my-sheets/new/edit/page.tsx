import { Suspense } from 'react';
import SheetEditorClient from './SheetEditorClient';

export default function NewSheetEditPage() {
  return (
    <Suspense fallback={<div style={{ padding: 40, color: '#5d6880' }}>불러오는 중…</div>}>
      <SheetEditorClient />
    </Suspense>
  );
}
