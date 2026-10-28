'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import type { WorksheetSummary, WorksheetType } from '@/types/worksheet';
import WorksheetCard from '@/components/WorksheetCard';
import FilterChip from '@/components/FilterChip';
import { TYPES, ORDER, type TypeKey } from '@/lib/types';

const ALL_TYPES = ORDER as WorksheetType[];

interface Props {
  worksheets: WorksheetSummary[];
  unitMap: Record<string, string>;
}

export default function BrowseClient({ worksheets, unitMap }: Props) {
  const [typeFilter, setTypeFilter] = useState<WorksheetType | null>(null);
  const [search,     setSearch]     = useState('');

  const filtered = useMemo(() => {
    let list = worksheets;
    if (typeFilter) list = list.filter(w => w.type === typeFilter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(w =>
        w.title.includes(q) || w.unit.includes(q) ||
        (unitMap[w.unit] ?? '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [worksheets, typeFilter, search, unitMap]);

  return (
    <div className="p-main">
      {/* 위치 표시 */}
      <nav className="crumb" aria-label="breadcrumb">
        <Link href="/home">홈</Link>
        <span aria-hidden="true">›</span>
        <span>활동지 목록</span>
      </nav>

      {/* 헤더 */}
      <div className="page-head">
        <div>
          <h1>활동지 목록</h1>
          <p>단원별로 활동지를 고르고, 카드를 눌러 내용을 확인하세요.</p>
        </div>
        <Link href="/my-sheets/new" className="btn primary" style={{ textDecoration: 'none' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          활동지 만들기
        </Link>
      </div>

      {/* 필터 패널 */}
      <div className="filters">
        <div className="frow">
          <b>유형</b>
          <div className="chipset">
            <FilterChip
              label="전체"
              pressed={typeFilter === null}
              onClick={() => setTypeFilter(null)}
            />
            {ALL_TYPES.map(t => (
              <FilterChip
                key={t}
                label={TYPES[t as TypeKey].name}
                pressed={typeFilter === t}
                dotColor={`var(--${t})`}
                onClick={() => setTypeFilter(prev => prev === t ? null : t)}
              />
            ))}
          </div>
        </div>
        <div className="frow">
          <b>검색</b>
          <label className="search-bar" style={{ flex: 1 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>
            </svg>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="제목이나 단원으로 찾기"
              aria-label="활동지 검색"
            />
          </label>
        </div>
      </div>

      {/* 결과 헤더 */}
      <div className="result-h">
        <b>활동지 {filtered.length}개{typeFilter && ` · ${TYPES[typeFilter as TypeKey].name}`}{search && ` · "${search}"`}</b>
        {(typeFilter || search) && (
          <button className="link-btn" onClick={() => { setTypeFilter(null); setSearch(''); }}>
            필터 초기화
          </button>
        )}
      </div>

      {/* 카드 목록 */}
      {filtered.length === 0 ? (
        <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--ink-3)', fontSize: 14 }}>
          <p style={{ marginBottom: 12 }}>조건에 맞는 활동지가 없어요.</p>
          <button className="btn sm ghost" onClick={() => { setTypeFilter(null); setSearch(''); }}>
            필터 초기화
          </button>
        </div>
      ) : (
        <div className="ws-grid4">
          {filtered.map(s => (
            <WorksheetCard key={s.id} sheet={s} unitTitle={unitMap[s.unit]} />
          ))}
        </div>
      )}
    </div>
  );
}
