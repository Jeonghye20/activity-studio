import { getAllWorksheets, getCurriculum } from '@/lib/data';
import HomeClient from '../HomeClient';

export default function HomePage() {
  const worksheets = getAllWorksheets();
  const curriculum = getCurriculum();
  const unitMap: Record<string, string> = Object.fromEntries(
    curriculum.units.map(u => [u.code, u.title])
  );
  return <HomeClient worksheets={worksheets} unitMap={unitMap} />;
}
