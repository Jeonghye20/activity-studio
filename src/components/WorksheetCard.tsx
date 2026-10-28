import Link from 'next/link';
import type { WorksheetSummary } from '@/types/worksheet';
import TypeCover from './TypeCover';
import TypeTag  from './TypeTag';
import type { TypeKey } from '@/lib/types';

interface Props {
  sheet: WorksheetSummary;
  unitTitle?: string;
  isNew?: boolean;
  saved?: boolean;
}

export default function WorksheetCard({ sheet, unitTitle, isNew, saved: _saved }: Props) {
  return (
    <Link href={`/worksheets/${sheet.id}`} className="ws-card2" style={{ textDecoration: 'none' }}>
      <div className="cover" style={{ aspectRatio: '5/3', borderRadius: 0 }}>
        <TypeCover type={sheet.type as TypeKey} height={120} block={false} />
      </div>
      <div className="body">
        <div className="row">
          <TypeTag type={sheet.type as TypeKey} />
          {isNew && <span className="new-badge">NEW</span>}
        </div>
        <h3>{sheet.title}</h3>
        {unitTitle && <p style={{ margin: 0, fontSize: 12, color: 'var(--ink-3)' }}>{unitTitle}</p>}
        <span style={{ marginTop: 'auto', paddingTop: 6, fontSize: 14, fontWeight: 700, color: 'var(--ink-2)' }}>
          살펴보기
        </span>
      </div>
    </Link>
  );
}
