import { getAllWorksheets, getCurriculum } from '@/lib/data';
import BrowseClient from './BrowseClient';

export default function BrowsePage() {
  const worksheets = getAllWorksheets();
  const curriculum = getCurriculum();
  const unitMap: Record<string, string> = Object.fromEntries(
    curriculum.units.map(u => [u.code, u.title])
  );
  return <BrowseClient worksheets={worksheets} unitMap={unitMap} />;
}
