import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '수업활동 스튜디오',
  description: '중학교 정보 수업 활동지 플랫폼',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        {/* Pretendard Variable — 프로젝트 전체 기본 글꼴 */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/pretendard@1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.css"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
