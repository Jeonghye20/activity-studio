import { Suspense } from 'react';
import { getWorksheet } from '@/lib/data';
import ResultClient from './ResultClient';
import { DEMO_ACTIVITY_ID } from '@/lib/studentDemoData';

export function generateStaticParams() {
  return [{ code: 'T7Y75' }];
}

interface Props {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ id?: string }>;
}

// searchParams를 Suspense 안에서 접근해 PPR(Partial Prerendering) 충돌 방지
async function ResultContent({ params, searchParams }: Props) {
  const { code } = await params;
  const { id } = await searchParams;
  const wsId = id ?? DEMO_ACTIVITY_ID;
  const sheet = getWorksheet(wsId);
  return <ResultClient code={code} worksheetId={wsId} sheet={sheet ?? null} />;
}

export default function ResultPage(props: Props) {
  return (
    <Suspense>
      <ResultContent {...props} />
    </Suspense>
  );
}
