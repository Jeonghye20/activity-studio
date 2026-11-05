import { getWorksheet, getCurriculum } from '@/lib/data';
import ActivityClient from './ActivityClient';
import { DEMO_ACTIVITY_ID } from '@/lib/studentDemoData';

export function generateStaticParams() {
  return [{ code: 'T7Y75' }];
}

interface Props {
  params: Promise<{ code: string }>;
}

export default async function ActivityPage({ params }: Props) {
  const { code } = await params;
  const sheet = getWorksheet(DEMO_ACTIVITY_ID);
  const curriculum = getCurriculum();
  if (!sheet) return <div style={{ padding: 40 }}>활동지를 불러올 수 없어요.</div>;
  return <ActivityClient sheet={sheet} units={curriculum.units} code={code} />;
}
