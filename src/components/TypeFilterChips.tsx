'use client';

import { TYPE_LABEL, WorksheetType } from '@/types/worksheet';

const TYPES: WorksheetType[] = ['concept', 'escape', 'mystery', 'practice', 'analysis', 'discussion'];

interface Props {
  selected: WorksheetType | null;
  onChange: (type: WorksheetType | null) => void;
}

export default function TypeFilterChips({ selected, onChange }: Props) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      <button
        onClick={() => onChange(null)}
        style={{
          height: 34,
          padding: '0 14px',
          borderRadius: 17,
          border: `1px solid ${selected === null ? 'var(--navy)' : 'var(--line)'}`,
          background: selected === null ? 'var(--sel)' : '#fff',
          color: selected === null ? 'var(--navy)' : 'var(--sub)',
          fontWeight: selected === null ? 700 : 500,
          fontSize: 13,
          cursor: 'pointer',
          transition: 'all .12s',
        }}
      >
        전체
      </button>
      {TYPES.map(type => {
        const isActive = selected === type;
        return (
          <button
            key={type}
            onClick={() => onChange(isActive ? null : type)}
            style={{
              height: 34,
              padding: '0 14px',
              borderRadius: 17,
              border: `1px solid ${isActive ? 'var(--navy)' : 'var(--line)'}`,
              background: isActive ? 'var(--sel)' : '#fff',
              color: isActive ? 'var(--navy)' : 'var(--sub)',
              fontWeight: isActive ? 700 : 500,
              fontSize: 13,
              cursor: 'pointer',
              transition: 'all .12s',
            }}
          >
            {TYPE_LABEL[type]}
          </button>
        );
      })}
    </div>
  );
}
