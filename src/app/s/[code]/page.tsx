import EntryClient from './EntryClient';
import { getWorksheet } from '@/lib/data';
import { TYPE_LABEL } from '@/types/worksheet';
import { TYPE_COLORS, DEMO_ACTIVITY_ID } from '@/lib/studentDemoData';

export function generateStaticParams() {
  return [{ code: 'T7Y75' }];
}

interface Props {
  params: Promise<{ code: string }>;
}

export default async function StudentEntryPage({ params }: Props) {
  const { code } = await params;
  const ws = getWorksheet(DEMO_ACTIVITY_ID);
  const activityInfo = ws
    ? {
        title: ws.title,
        typeLabel: TYPE_LABEL[ws.type],
        typeColor: TYPE_COLORS[ws.type] ?? '#5d6880',
        meta: '정보 · 2학년 3반 · 3교시 · 김선생님',
      }
    : null;
  return <EntryClient code={code} activityInfo={activityInfo} />;
}
