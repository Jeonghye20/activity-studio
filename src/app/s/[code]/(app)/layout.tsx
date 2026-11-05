import StudentShell from '@/components/StudentShell';

export default async function StudentAppLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  return <StudentShell code={code}>{children}</StudentShell>;
}
