import Link from 'next/link';
import type { WorksheetSummary, WorksheetType } from '@/types/worksheet';
import { TYPE_LABEL } from '@/types/worksheet';
import TypeThumbnail from './TypeThumbnail';

const TYPE_COLOR: Record<WorksheetType, string> = {
  concept:    '#2563eb',
  escape:     '#b45309',
  mystery:    '#7c3aed',
  practice:   '#1e7a46',
  analysis:   '#0e7490',
  discussion: '#9d174d',
};

const TYPE_CHIP_BG: Record<WorksheetType, string> = {
  concept:    '#dbeafe',
  escape:     '#fef3c7',
  mystery:    '#ede9fe',
  practice:   '#d1fae5',
  analysis:   '#cffafe',
  discussion: '#fce7f3',
};

interface Props {
  sheet: WorksheetSummary;
  unitTitle?: string;
  isNew?: boolean;
}

export default function HomeCard({ sheet, unitTitle, isNew }: Props) {
  const label = TYPE_LABEL[sheet.type];
  const color = TYPE_COLOR[sheet.type];
  const chipBg = TYPE_CHIP_BG[sheet.type];

  return (
    <article
      style={{
        background: '#fff',
        border: '1px solid var(--line2)',
        borderRadius: 14,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
      className="ws-card"
    >
      {/* 썸네일 */}
      <TypeThumbnail type={sheet.type} height={88} />

      {/* 카드 본문 */}
      <div
        style={{
          padding: '12px 14px 14px',
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
          flex: 1,
        }}
      >
        {/* 유형 칩 */}
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              height: 20,
              padding: '0 7px',
              borderRadius: 5,
              fontSize: 11,
              fontWeight: 700,
              background: chipBg,
              color,
            }}
          >
            {label}
          </span>
          {isNew && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                height: 20,
                padding: '0 7px',
                borderRadius: 5,
                fontSize: 11,
                fontWeight: 700,
                background: 'var(--yellow)',
                color: 'var(--ink)',
              }}
            >
              NEW
            </span>
          )}
        </div>

        {/* 제목 */}
        <h3
          style={{
            margin: '2px 0 0',
            fontSize: 15,
            fontWeight: 700,
            color: 'var(--ink)',
            lineHeight: 1.35,
            wordBreak: 'keep-all',
          }}
        >
          {sheet.title}
        </h3>

        {/* 단원 */}
        <p style={{ margin: 0, color: 'var(--sub)', fontSize: 12 }}>
          {sheet.unit}{unitTitle ? ` · ${unitTitle}` : ''}
        </p>

        {/* 살펴보기 */}
        <Link
          href={`/worksheets/${sheet.id}`}
          style={{
            marginTop: 'auto',
            alignSelf: 'flex-start',
            color: 'var(--navy)',
            fontWeight: 700,
            fontSize: 14,
            textDecoration: 'none',
            minHeight: 36,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          살펴보기
        </Link>
      </div>
    </article>
  );
}
