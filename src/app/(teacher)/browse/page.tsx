import { Suspense } from 'react';
import { getAllWorksheets, getCurriculum } from '@/lib/data';
import BrowseClient from './BrowseClient';

export default function BrowsePage() {
  const worksheets = getAllWorksheets();
  const curriculum = getCurriculum();
  const unitMap: Record<string, string> = Object.fromEntries(
    curriculum.units.map(u => [u.code, u.title])
  );
  return (
    <Suspense>
      <BrowseClient worksheets={worksheets} unitMap={unitMap} />
    </Suspense>
  );
}
