import { notFound } from 'next/navigation';
import { getWorksheet, getCurriculum } from '@/lib/data';
import PreviewClient from './PreviewClient';

interface Props {
  params: Promise<{ id: string }>;
}

export const instant = false;

export default async function WorksheetPreviewPage({ params }: Props) {
  const { id } = await params;
  const sheet = getWorksheet(id);
  if (!sheet) notFound();

  const curriculum = getCurriculum();
  return <PreviewClient sheet={sheet} units={curriculum.units} />;
}

export async function generateStaticParams() {
  const { getAllWorksheets } = await import('@/lib/data');
  return getAllWorksheets().map(s => ({ id: s.id }));
}
