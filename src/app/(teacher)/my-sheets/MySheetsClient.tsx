'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { WorksheetType } from '@/types/worksheet';
import TypeCover from '@/components/TypeCover';
import TypeTag  from '@/components/TypeTag';
import type { TypeKey } from '@/lib/types';

export interface MySavedSheet {
  id: string;
  worksheetId: string;
  title: string;
  type: WorksheetType;
  unit: string;
  unitTitle?: string;
  source: 'edit' | 'create' | 'save';
  savedAt: string;
  shared: boolean;
}

const DEMO_BOOKMARKED: MySavedSheet[] = [
  { id: 'bk-1', worksheetId: 'ws-vault',     title: '비트 금고를 열어라',                           type: 'escape',   unit: 'Ⅱ-1-02', unitTitle: '다양한 데이터의 디지털 표현',          source: 'save',   savedAt: '2026-10-21', shared: false },
  { id: 'bk-2', worksheetId: 'ws-laugh',     title: '사건 파일: 박수도 웃음으로 세는 웃음 계수기',  type: 'mystery',  unit: 'Ⅳ-2-02', unitTitle: '소리 데이터를 이용한 웃음 계수 시스템', source: 'save',   savedAt: '2026-10-20', shared: false },
  { id: 'bk-3', worksheetId: 'ws-sleeptemp', title: '밤에만 켜지는 온도 알림이 설계하기',           type: 'practice', unit: 'Ⅰ-2-02', unitTitle: '수면 온도 알림이 장치 만들기',          source: 'save',   savedAt: '2026-10-18', shared: false },
];

const DEMO_EDITED: MySavedSheet[] = [
  { id: 'ed-1', worksheetId: 'ws-sleep',     title: '잠을 많이 자면 덜 졸까? (수정본)',             type: 'analysis', unit: 'Ⅱ-2-02', unitTitle: '데이터의 구조화와 분석',               source: 'edit',   savedAt: '2026-10-22', shared: false },
  { id: 'ed-2', worksheetId: 'ws-cs-escape', title: '잠긴 정보실 컴퓨터를 깨워라 (우리 반 버전)',   type: 'escape',   unit: 'Ⅰ-1-01', unitTitle: '컴퓨터 시스템의 구성',                 source: 'edit',   savedAt: '2026-10-17', shared: false },
];

const DEMO_CREATED: MySavedSheet[] = [
  { id: 'cr-1', worksheetId: 'ws-video',     title: '우리 학교 홍보 영상, 무엇을 찍을까?',          type: 'analysis', unit: 'Ⅱ-2-03', unitTitle: '인기 공유 동영상 데이터 분석',          source: 'create', savedAt: '2026-10-23', shared: false },
];

const DEMO_DEPLOYED: MySavedSheet[] = [
  { id: 'dp-1', worksheetId: 'ws-vault',     title: '비트 금고를 열어라',                           type: 'escape',   unit: 'Ⅱ-1-02', unitTitle: '다양한 데이터의 디지털 표현',          source: 'save',   savedAt: '2026-10-22', shared: false },
  { id: 'dp-2', worksheetId: 'ws-sleeptemp', title: '밤에만 켜지는 온도 알림이 설계하기',           type: 'practice', unit: 'Ⅰ-2-02', unitTitle: '수면 온도 알림이 장치 만들기',          source: 'save',   savedAt: '2026-10-19', shared: false },
];

export const MY_SHEETS_KEY = 'activity_studio_my_sheets';

export function loadMySheets(): MySavedSheet[] {
  try {
    const raw = localStorage.getItem(MY_SHEETS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}
export function saveMySheets(sheets: MySavedSheet[]) {
  localStorage.setItem(MY_SHEETS_KEY, JSON.stringify(sheets));
}
export function addMySheet(sheet: MySavedSheet) {
  const existing = loadMySheets();
  const filtered = existing.filter(s => s.worksheetId !== sheet.worksheetId || s.source !== sheet.source);
  saveMySheets([sheet, ...filtered]);
}

type MainTab = 'mine' | 'deployed';
type FilterKey = 'all' | 'saved' | 'edited' | 'created';

const FILTERS: { key: FilterKey; label: string; source?: MySavedSheet['source'] }[] = [
  { key: 'all',     label: '전체' },
  { key: 'saved',   label: '🔖 책갈피',    source: 'save'   },
  { key: 'edited',  label: '✏️ 수정한 자료',    source: 'edit'   },
  { key: 'created', label: '➕ 직접 만든 자료', source: 'create' },
];

export default function MySheetsClient() {
  const [sheets,   setSheets]  = useState<MySavedSheet[]>([]);
  const [mounted,  setMounted] = useState(false);
  const [mainTab,  setMainTab] = useState<MainTab>('mine');
  const [filter,   setFilter]  = useState<FilterKey>('all');
  const [search,   setSearch]  = useState('');

  useEffect(() => { setSheets(loadMySheets()); setMounted(true); }, []);

  if (!mounted) return null;

  const allMine: MySavedSheet[] = [...DEMO_BOOKMARKED, ...DEMO_EDITED, ...DEMO_CREATED, ...sheets];

  const counts: Record<FilterKey, number> = {
    all:     allMine.length,
    saved:   allMine.filter(s => s.source === 'save').length,
    edited:  allMine.filter(s => s.source === 'edit').length,
    created: allMine.filter(s => s.source === 'create').length,
  };

  const q = search.trim().toLowerCase();

  const mineFiltered = allMine
    .filter(s => filter === 'all' || s.source === FILTERS.find(f => f.key === filter)?.source)
    .filter(s => !q || s.title.toLowerCase().includes(q) || s.unit.toLowerCase().includes(q) || (s.unitTitle ?? '').toLowerCase().includes(q));

  const deployedFiltered = DEMO_DEPLOYED
    .filter(s => !q || s.title.toLowerCase().includes(q) || (s.unitTitle ?? '').toLowerCase().includes(q));

  const deployedIds = new Set(DEMO_DEPLOYED.map(s => s.worksheetId));

  return (
    <div className="p-main">

      {/* 헤더 */}
      <div className="page-head">
        <div>
          <h1>자료실</h1>
          <p>담아두고, 수정하고, 직접 만든 활동지를 한곳에서 관리해요.</p>
        </div>
        <Link href="/my-sheets/new" className="btn primary" style={{ textDecoration: 'none' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          활동지 만들기
        </Link>
      </div>

      {/* 탭 네비게이션 */}
      <div className="lib-nav" role="tablist">
        {(['mine', 'deployed'] as MainTab[]).map(tab => (
          <button
            key={tab}
            role="tab"
            aria-selected={mainTab === tab}
            className="lib-tab-btn"
            onClick={() => setMainTab(tab)}
          >
            {tab === 'mine' ? '내 자료' : '배포한 자료'}
          </button>
        ))}
      </div>

      {/* ── 내 자료 탭 ── */}
      {mainTab === 'mine' && (
        <>
          {/* 필터 칩 */}
          <div className="lib-filter-row">
            {FILTERS.map(f => (
              <button
                key={f.key}
                className={`lib-chip${f.key === 'all' ? ' chip-all' : ''}`}
                aria-pressed={filter === f.key}
                onClick={() => setFilter(f.key)}
                style={f.key === 'all' ? { paddingLeft: 18, paddingRight: 18 } : undefined}
              >
                {f.label}
                <span className="cnt">{counts[f.key]}</span>
              </button>
            ))}
          </div>

          {/* 검색·정렬 */}
          <div className="toolbar">
            <label className="search-bar" style={{ flex: 1, maxWidth: 380 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>
              </svg>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="제목이나 단원으로 찾기"
                aria-label="내 자료에서 찾기"
              />
            </label>
            <label className="sort-label">
              정렬{' '}
              <select aria-label="정렬">
                <option>최근 담은 순</option>
                <option>단원 순</option>
              </select>
            </label>
          </div>

          {mineFiltered.length === 0 ? (
            <EmptyMine />
          ) : (
            <div className="ws-grid4">
              {mineFiltered.map(s => (
                <SheetCard key={s.id} sheet={s} deployed={deployedIds.has(s.worksheetId)} />
              ))}
            </div>
          )}
        </>
      )}

      {/* ── 배포한 자료 탭 ── */}
      {mainTab === 'deployed' && (
        <>
          <div className="toolbar">
            <label className="search-bar" style={{ flex: 1, maxWidth: 380 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>
              </svg>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="제목이나 단원으로 찾기"
                aria-label="배포한 자료에서 찾기"
              />
            </label>
            <label className="sort-label">
              정렬{' '}
              <select aria-label="정렬">
                <option>최근 배포 순</option>
                <option>단원 순</option>
              </select>
            </label>
          </div>

          {deployedFiltered.length === 0 ? (
            <EmptyDeployed />
          ) : (
            <div className="ws-grid4">
              {deployedFiltered.map(s => (
                <SheetCard key={s.id} sheet={s} deployed={true} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ── 활동지 카드 ── */
function SheetCard({ sheet, deployed }: { sheet: MySavedSheet; deployed?: boolean }) {
  const badge = sheet.source === 'edit'   ? '✏️ 수정본'
    : sheet.source === 'create' ? '➕ 직접만든'
    : '🔖 책갈피';

  return (
    <div className="ws-card2" style={{ cursor: 'default' }}>
      <div className="cover" style={{ aspectRatio: '5/3', borderRadius: 0 }}>
        <TypeCover type={sheet.type as TypeKey} height={120} block={false} />
        <div className="corner">{badge}</div>
      </div>
      <div className="body">
        <div className="row">
          <TypeTag type={sheet.type as TypeKey} />
        </div>
        <h3>{sheet.title}</h3>
        {sheet.unitTitle && (
          <p style={{ margin: 0, fontSize: 12, color: 'var(--ink-3)' }}>{sheet.unitTitle}</p>
        )}
        <div className="row" style={{ marginTop: 'auto', paddingTop: 6, gap: 8 }}>
          <Link
            href={`/worksheets/${sheet.worksheetId}/deploy`}
            className="btn sm ghost"
            style={{ textDecoration: 'none', flex: 1, justifyContent: 'center' }}
          >
            배포하기
          </Link>
          <Link
            href={`/worksheets/${sheet.worksheetId}`}
            className="btn sm ghost"
            style={{ textDecoration: 'none', flex: 1, justifyContent: 'center' }}
          >
            미리보기
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ── 빈 상태 ── */
function EmptyMine() {
  return (
    <div style={{ padding: '80px 24px', textAlign: 'center' }}>
      <p style={{ margin: '0 0 6px', fontSize: 18, fontWeight: 800 }}>담아둔 활동이 없어요.</p>
      <p style={{ margin: '0 0 20px', fontSize: 14, color: 'var(--ink-3)' }}>
        활동지를 찾아 담아두거나, 직접 만들어 보세요.
      </p>
      <Link href="/browse" className="btn ghost" style={{ textDecoration: 'none' }}>활동지 찾기</Link>
    </div>
  );
}

function EmptyDeployed() {
  return (
    <div style={{ padding: '80px 24px', textAlign: 'center' }}>
      <p style={{ margin: '0 0 6px', fontSize: 18, fontWeight: 800 }}>아직 배포한 활동이 없어요.</p>
      <p style={{ margin: '0 0 20px', fontSize: 14, color: 'var(--ink-3)' }}>
        활동지를 배포하면 여기에 모여요.
      </p>
      <Link href="/browse" className="btn ghost" style={{ textDecoration: 'none' }}>활동지 찾기</Link>
    </div>
  );
}
