import RecordClient from './RecordClient';

export function generateStaticParams() {
  return [{ code: 'T7Y75' }];
}

interface Props {
  params: Promise<{ code: string }>;
}

export default async function RecordPage({ params }: Props) {
  const { code } = await params;
  return <RecordClient code={code} />;
}
