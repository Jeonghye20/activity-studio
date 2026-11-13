import { Suspense } from 'react';
import PaperFeedbackClient from './PaperFeedbackClient';

export default function ClassPaperPage() {
  return (
    <Suspense fallback={<div className="p-main" style={{ color: '#5d6880' }}>불러오는 중…</div>}>
      <PaperFeedbackClient />
    </Suspense>
  );
}
