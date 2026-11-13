/** StudentRecentCard — 학생 홈 '최근 활동' 카드. 교사 홈 활동 카드(.ws-card2)와 같은 모양 */

import Link from 'next/link';
import TypeCover from './TypeCover';
import TypeTag from './TypeTag';
import type { TypeKey } from '@/lib/types';
import type { StudentActivity } from '@/lib/studentDemoData';

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getMonth() + 1}월 ${d.getDate()}일`;
}

const chip: React.CSSProperties = {
  height: 22, padding: '0 8px', borderRadius: 6,
  fontSize: 11.5, fontWeight: 800,
  display: 'inline-flex', alignItems: 'center',
};

function StatusChip({ item }: { item: StudentActivity }) {
  if (item.status === 'feedback') {
    return <span className="new-badge">피드백 도착</span>;
  }
  if (item.status === 'resubmit') {
    return <span style={{ ...chip, background: '#f3f0ff', color: '#6741d9' }}>다시 풀기</span>;
  }
  // 실제 제출(피드백 전)은 '답한 문항 n/N' 결과 문구를 가짐
  const waiting = item.resultText.startsWith('답한 문항');
  return (
    <span style={{ ...chip, background: '#eef1f6', color: '#5d6880' }}>
      {waiting ? '피드백 기다림' : '확인 완료'}
    </span>
  );
}

export default function StudentRecentCard({ code, item }: { code: string; item: StudentActivity }) {
  return (
    <Link
      href={`/s/${code}/result?id=${item.worksheetId}`}
      className="ws-card2"
      style={{ textDecoration: 'none' }}
    >
      <div className="cover" style={{ aspectRatio: '5/3', borderRadius: 0 }}>
        <TypeCover type={item.type as TypeKey} height={120} block={false} />
      </div>
      <div className="body">
        <div className="row" style={{ flexWrap: 'wrap', gap: 6 }}>
          <TypeTag type={item.type as TypeKey} />
          <StatusChip item={item} />
        </div>
        <h3 style={{ wordBreak: 'keep-all' }}>{item.title}</h3>
        <p style={{ margin: 0, fontSize: 12, color: 'var(--ink-3)' }}>
          {formatDate(item.submittedAt)} 제출 · {item.resultText}
        </p>
        <span style={{ marginTop: 'auto', paddingTop: 6, fontSize: 14, fontWeight: 700, color: 'var(--ink-2)' }}>
          결과 보기
        </span>
      </div>
    </Link>
  );
}
