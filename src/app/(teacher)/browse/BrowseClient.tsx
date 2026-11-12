'use client';

import { useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import type { WorksheetSummary, WorksheetType } from '@/types/worksheet';
import WorksheetCard from '@/components/WorksheetCard';
import FilterChip from '@/components/FilterChip';
import { TYPES, ORDER, type TypeKey } from '@/lib/types';
import { RECENT_IDS, SPEC_IDS } from '@/lib/homeLists';

const ALL_TYPES = ORDER as WorksheetType[];

const FROM_LABEL: Record<string, string> = {
  recent: '최근 나온 활동지',
  spec:   '정보 특화 활동지',
  shared: '선생님들이 공유한 활동',
};
const FROM_TITLE: Record<string, string> = {
  recent: '최근 나온 활동지 전체',
  spec:   '정보 특화 활동지 전체',
  shared: '선생님들이 공유한 활동 전체',
};

interface Props {
  worksheets: WorksheetSummary[];
  unitMap: Record<string, string>;
}

export default function BrowseClient({ worksheets, unitMap }: Props) {
  const searchParams = useSearchParams();
  const from = searchParams.get('from') ?? '';

  const [typeFilter, setTypeFilter] = useState<WorksheetType | null>(null);
  const [search,     setSearch]     = useState('');

  const baseList = useMemo(() => {
    if (from === 'recent') {
      return (RECENT_IDS as readonly string[])
        .map(id => worksheets.find(w => w.id === id))
        .filter(Boolean) as WorksheetSummary[];
    }
    if (from === 'spec') {
      const specSet = new Set(SPEC_IDS as readonly string[]);
      const pinned = (SPEC_IDS as readonly string[])
        .map(id => worksheets.find(w => w.id === id))
        .filter(Boolean) as WorksheetSummary[];
      const rest = worksheets.filter(
        w => (w.type === 'escape' || w.type === 'mystery') && !specSet.has(w.id)
      );
      return [...pinned, ...rest];
    }
    if (from === 'shared') {
      return worksheets.filter(w => w.type === 'concept');
    }
    return worksheets;
  }, [worksheets, from]);

  const filtered = useMemo(() => {
    let list = baseList;
    if (typeFilter) list = list.filter(w => w.type === typeFilter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(w =>
        w.title.includes(q) || w.unit.includes(q) ||
        (unitMap[w.unit] ?? '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [baseList, typeFilter, search, unitMap]);

  const sectionTitle = from ? (FROM_TITLE[from] ?? null) : null;

  return (
    <div className="p-main">
      {/* 위치 표시 */}
      <nav className="crumb" aria-label="breadcrumb">
        <Link href="/home">홈</Link>
        <span aria-hidden="true">›</span>
        <span>활동지 찾기</span>
      </nav>

      {/* 헤더 */}
      <div className="page-head">
        <div>
          <h1>활동지 찾기</h1>
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

      {/* 섹션 제목 (from 파라미터) */}
      {sectionTitle && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: 'var(--ink)' }}>{sectionTitle}</h2>
          <Link
            href="/browse"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              height: 28, padding: '0 10px 0 12px', borderRadius: 20,
              border: '1.5px solid var(--line)', background: '#fff',
              fontSize: 13, fontWeight: 600, color: 'var(--ink-2)',
              textDecoration: 'none', whiteSpace: 'nowrap',
            }}
          >
            {FROM_LABEL[from]}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </Link>
        </div>
      )}

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
