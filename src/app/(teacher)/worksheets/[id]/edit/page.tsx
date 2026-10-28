import { notFound } from 'next/navigation';
import { getWorksheet, getCurriculum } from '@/lib/data';
import EditClient from './EditClient';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function WorksheetEditPage({ params }: Props) {
  const { id } = await params;
  const sheet = getWorksheet(id);
  if (!sheet) notFound();

  const curriculum = getCurriculum();
  return <EditClient sheet={sheet} units={curriculum.units} />;
}

export async function generateStaticParams() {
  const { getAllWorksheets } = await import('@/lib/data');
  return getAllWorksheets().map(s => ({ id: s.id }));
}
