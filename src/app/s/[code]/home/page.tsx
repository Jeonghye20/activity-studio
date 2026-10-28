import StudentHomeClient from './StudentHomeClient';

export function generateStaticParams() {
  return [{ code: 'T7Y75' }];
}

export default async function StudentHomePage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  return <StudentHomeClient code={code} />;
}
