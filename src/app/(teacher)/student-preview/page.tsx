import { getWorksheet, getCurriculum } from '@/lib/data';
import StudentPreviewClient from './StudentPreviewClient';

interface Props {
  searchParams: Promise<{ id?: string }>;
}

export default async function StudentPreviewPage({ searchParams }: Props) {
  const { id } = await searchParams;
  const sheet = getWorksheet(id ?? 'ws-physical');
  const curriculum = getCurriculum();
  if (!sheet) return <div style={{ padding: 40 }}>활동지를 찾을 수 없어요.</div>;
  return <StudentPreviewClient sheet={sheet} units={curriculum.units} />;
}
