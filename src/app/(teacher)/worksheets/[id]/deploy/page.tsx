import { notFound } from 'next/navigation';
import { getWorksheet } from '@/lib/data';
import DeployClient from './DeployClient';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function DeployPage({ params }: Props) {
  const { id } = await params;
  const sheet = getWorksheet(id);
  if (!sheet) notFound();
  return <DeployClient sheet={sheet} />;
}

export async function generateStaticParams() {
  const { getAllWorksheets } = await import('@/lib/data');
  return getAllWorksheets().map(s => ({ id: s.id }));
}
