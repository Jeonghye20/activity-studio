import ResultClient from './ResultClient';

export function generateStaticParams() {
  return [{ code: 'T7Y75' }];
}

interface Props {
  params: Promise<{ code: string }>;
}

export default async function StudentResultPage({ params }: Props) {
  const { code } = await params;
  return <ResultClient code={code} />;
}
