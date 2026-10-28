import EntryClient from './EntryClient';

export function generateStaticParams() {
  return [{ code: 'T7Y75' }];
}

interface Props {
  params: Promise<{ code: string }>;
}

export default async function StudentEntryPage({ params }: Props) {
  const { code } = await params;
  return <EntryClient code={code} />;
}
