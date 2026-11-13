import StudentHomeClient from './StudentHomeClient';
import { getWorksheet } from '@/lib/data';
import { DEMO_ACTIVITY_ID } from '@/lib/studentDemoData';

export function generateStaticParams() {
  return [{ code: 'T7Y75' }];
}

export default async function StudentHomePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  return <StudentHomeClient code={code} sheet={getWorksheet(DEMO_ACTIVITY_ID)} />;
}
