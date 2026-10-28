import { getWorksheet, getCurriculum } from '@/lib/data';
import ActivityClient from './ActivityClient';

export function generateStaticParams() {
  return [{ code: 'T7Y75' }];
}

interface Props {
  params: Promise<{ code: string }>;
}

export default async function StudentActivityPage({ params }: Props) {
  const { code } = await params;
  const sheet = getWorksheet('ws-logic');
  const curriculum = getCurriculum();
  if (!sheet) return <div style={{ padding: 40 }}>활동지를 찾을 수 없어요.</div>;
  return <ActivityClient sheet={sheet} units={curriculum.units} code={code} />;
}
