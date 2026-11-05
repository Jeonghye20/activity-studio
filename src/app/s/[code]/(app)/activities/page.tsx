import ActivitiesClient from './ActivitiesClient';

export function generateStaticParams() {
  return [{ code: 'T7Y75' }];
}

export default async function ActivitiesPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  return <ActivitiesClient code={code} />;
}
