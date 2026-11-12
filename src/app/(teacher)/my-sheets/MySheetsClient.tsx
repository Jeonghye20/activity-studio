'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { TYPE_LABEL, type WorksheetType } from '@/types/worksheet';
import TypeCover from '@/components/TypeCover';
import TypeTag  from '@/components/TypeTag';
import type { TypeKey } from '@/lib/types';

const TYPE_THUMB: Record<string, { bg: string; dot: string }> = {
  concept:    { bg: '#e8ecff', dot: '#4263eb' },
  escape:     { bg: '#fdf0e0', dot: '#e8890c' },
  mystery:    { bg: '#f0eaff', dot: '#7048e8' },
  practice:   { bg: '#e0f5ef', dot: '#0ca678' },
  analysis:   { bg: '#e0f5f8', dot: '#1098ad' },
  discussion: { bg: '#fce8ef', dot: '#d6336c' },
  free:       { bg: '#f3f4f6', dot: '#5d6880' },
};

const STATUS_BAR_COLOR: Record<string, string> = {
  live:     '#6741d9',
  feedback: '#e8890c',
  resubmit: '#2b4fb8',
  done:     '#2b8a3e',
};
import {
  type DeployLog,
  getDeployLogs,
  getDeployInfoForWorksheet,
  STATUS_STYLE,
  CLASS_COLOR_MAP,
  formatDeployDate,
} from '@/lib/deployLogDemo';

const SOURCE_COLOR: Record<string, string> = {
  save:   '#e03131',
  edit:   '#e8590c',
  create: '#6741d9',
  shared: '#2b4fb8',
};
const FILTER_TO_SOURCE: Record<string, string> = {
  saved: 'save', edited: 'edit', created: 'create',
};

function SourceIcon({ source, size, white }: { source: string; size: number; white?: boolean }) {
  const fill = white ? '#fff' : (SOURCE_COLOR[source] ?? 'currentColor');
  if (source === 'save') return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} aria-hidden="true">
      <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z"/>
    </svg>
  );
  if (source === 'edit') return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} aria-hidden="true">
      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 000-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
    </svg>
  );
  if (source === 'create') return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} aria-hidden="true">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/>
    </svg>
  );
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} aria-hidden="true">
      <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/>
    </svg>
  );
}

function TypeIcon({ type, color }: { type: string; color: string }) {
  const s = { display: 'block' as const };
  const p = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, style: s, 'aria-hidden': true as const };
  switch (type) {
    case 'concept': return (
      <svg {...p}>
        <path d="M12 2a7 7 0 00-4.9 11.9V16a1 1 0 001 1h7.8a1 1 0 001-1v-2.1A7 7 0 0012 2z"/>
        <path d="M9 21h6"/>
        <path d="M9 17h6"/>
      </svg>
    );
    case 'escape': return (
      <svg {...p}>
        <rect x="5" y="11" width="14" height="10" rx="2"/>
        <path d="M8 11V7a4 4 0 018 0v4"/>
        <circle cx="12" cy="16" r="1" fill={color} stroke="none"/>
      </svg>
    );
    case 'mystery': return (
      <svg {...p}>
        <circle cx="11" cy="11" r="7"/>
        <path d="M20 20l-4-4"/>
      </svg>
    );
    case 'practice': return (
      <svg {...p}>
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
        <rect x="9" y="3" width="6" height="4" rx="1"/>
        <path d="M9 12h6M9 16h4"/>
      </svg>
    );
    case 'analysis': return (
      <svg {...p}>
        <path d="M18 20V10M12 20V4M6 20v-6"/>
      </svg>
    );
    case 'discussion': return (
      <svg {...p}>
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
      </svg>
    );
    default: return (
      <svg {...p}>
        <circle cx="11" cy="11" r="7"/>
        <path d="M20 20l-4-4"/>
      </svg>
    );
  }
}

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
  { id: 'ed-1', worksheetId: 'ws-sleep',     title: '잠을 많이 자면 덜 졸까? (수정본)',           type: 'analysis', unit: 'Ⅱ-2-02', unitTitle: '데이터의 구조화와 분석',               source: 'edit',   savedAt: '2026-10-22', shared: true  },
  { id: 'ed-2', worksheetId: 'ws-cs-escape', title: '잠긴 정보실 컴퓨터를 깨워라 (우리 반 버전)', type: 'escape',   unit: 'Ⅰ-1-01', unitTitle: '컴퓨터 시스템의 구성',                 source: 'edit',   savedAt: '2026-10-17', shared: false },
];

const DEMO_CREATED: MySavedSheet[] = [
  { id: 'cr-1', worksheetId: 'ws-video',     title: '우리 학교 홍보 영상, 무엇을 찍을까?',        type: 'analysis', unit: 'Ⅱ-2-03', unitTitle: '인기 공유 동영상 데이터 분석',          source: 'create', savedAt: '2026-10-23', shared: false },
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
type FilterKey = 'all' | 'saved' | 'edited' | 'created' | 'shared';

const FILTERS_MAIN: { key: Exclude<FilterKey, 'shared'>; label: string; source?: MySavedSheet['source'] }[] = [
  { key: 'all',     label: '전체' },
  { key: 'saved',   label: '책갈피',         source: 'save'   },
  { key: 'edited',  label: '수정한 자료',    source: 'edit'   },
  { key: 'created', label: '직접 만든 자료', source: 'create' },
];

function getWeekStart(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? 6 : day - 1;
  now.setDate(now.getDate() - diff);
  now.setHours(0, 0, 0, 0);
  return now.toISOString().slice(0, 10);
}

export default function MySheetsClient() {
  const [sheets,     setSheets]     = useState<MySavedSheet[]>([]);
  const [deployLogs, setDeployLogs] = useState<DeployLog[]>([]);
  const [mainTab,    setMainTab]    = useState<MainTab>('mine');
  const [filter,     setFilter]     = useState<FilterKey>('all');
  const [search,     setSearch]     = useState('');
  const [clsFilter,  setClsFilter]  = useState('all');

  useEffect(() => {
    setSheets(loadMySheets());
    setDeployLogs(getDeployLogs());
  }, []);

  const allMine: MySavedSheet[] = [...DEMO_BOOKMARKED, ...DEMO_EDITED, ...DEMO_CREATED, ...sheets];

  const counts: Record<FilterKey, number> = {
    all:     allMine.length,
    saved:   allMine.filter(s => s.source === 'save').length,
    edited:  allMine.filter(s => s.source === 'edit').length,
    created: allMine.filter(s => s.source === 'create').length,
    shared:  allMine.filter(s => s.shared).length,
  };

  const q = search.trim().toLowerCase();

  const mineFiltered = allMine
    .filter(s => {
      if (filter === 'all') return true;
      if (filter === 'shared') return s.shared;
      return s.source === FILTERS_MAIN.find(f => f.key === filter)?.source;
    })
    .filter(s => !q || s.title.toLowerCase().includes(q) || s.unit.toLowerCase().includes(q) || (s.unitTitle ?? '').toLowerCase().includes(q));

  const deployedIds = new Set(deployLogs.map(l => l.worksheetId));

  /* ── 배포 기록 탭 계산 ── */
  const deployLogsFiltered = clsFilter === 'all'
    ? deployLogs
    : deployLogs.filter(l => l.cls === clsFilter);
  const deployClasses = [...new Set(deployLogs.map(l => l.cls))].sort();
  const liveCount     = deployLogs.filter(l => l.status === 'live').length;
  const feedbackLogs  = deployLogs.filter(l => l.status === 'feedback');
  const weekStart     = getWeekStart();
  const thisWeekLogs  = deployLogs.filter(l => l.deployedDate >= weekStart);
  const thisWeekCount = thisWeekLogs.length;

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
        <button
          role="tab"
          aria-selected={mainTab === 'mine'}
          className="lib-tab-btn"
          onClick={() => setMainTab('mine')}
        >
          내 자료
        </button>
        <button
          role="tab"
          aria-selected={mainTab === 'deployed'}
          className="lib-tab-btn"
          onClick={() => setMainTab('deployed')}
        >
          배포 기록
          {deployLogs.length > 0 && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              minWidth: 20, height: 20, borderRadius: 10, padding: '0 5px', marginLeft: 6,
              background: mainTab === 'deployed' ? 'var(--ink)' : 'var(--line)',
              color: mainTab === 'deployed' ? '#fff' : 'var(--ink-3)',
              fontSize: 11, fontWeight: 800,
            }}>
              {deployLogs.length}
            </span>
          )}
        </button>
      </div>

      {/* ── 내 자료 탭 ── */}
      {mainTab === 'mine' && (
        <>
          {/* 필터 칩 */}
          <div className="lib-filter-row">
            {FILTERS_MAIN.map(f => (
              <button
                key={f.key}
                className={`lib-chip${f.key === 'all' ? ' chip-all' : ''}`}
                aria-pressed={filter === f.key}
                onClick={() => setFilter(f.key)}
                style={f.key === 'all'
                  ? { paddingLeft: 18, paddingRight: 18 }
                  : { display: 'inline-flex', alignItems: 'center', gap: 5 }
                }
              >
                {f.key !== 'all' && FILTER_TO_SOURCE[f.key] && (
                  <SourceIcon source={FILTER_TO_SOURCE[f.key]} size={14} white={filter === f.key} />
                )}
                {f.label}
                <span className="cnt">{counts[f.key]}</span>
              </button>
            ))}
            {/* 세로선 구분자 */}
            <span
              aria-hidden="true"
              style={{ width: 1, height: 16, background: '#e3e7ef', alignSelf: 'center', flexShrink: 0, margin: '0 4px' }}
            />
            {/* 공유한 자료 */}
            <button
              className="lib-chip"
              aria-pressed={filter === 'shared'}
              onClick={() => setFilter('shared')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}
            >
              <SourceIcon source="shared" size={14} white={filter === 'shared'} />
              공유한 자료
              <span className="cnt">{counts.shared}</span>
            </button>
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
                <SheetCard
                  key={s.id}
                  sheet={s}
                  deployed={deployedIds.has(s.worksheetId)}
                  deployInfo={deployedIds.has(s.worksheetId) ? getDeployInfoForWorksheet(s.worksheetId, deployLogs) : null}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* ── 배포 기록 탭 ── */}
      {mainTab === 'deployed' && (
        <>
          {/* 요약 카드 3개 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
            {[
              {
                label: '지금 진행 중',
                value: `${liveCount}개 반`,
                sub: liveCount > 0
                  ? deployLogs.filter(l => l.status === 'live').map(l => l.cls.replace('2학년 ', '')).join(', ') + ' · 수업 중'
                  : '진행 중인 수업 없어요',
                accent: liveCount > 0,
              },
              {
                label: '피드백 기다리는 반',
                value: `${feedbackLogs.length}개`,
                sub: feedbackLogs.length > 0
                  ? feedbackLogs.map(l => l.cls).join(', ')
                  : '피드백 대기 없어요',
                accent: false,
              },
              {
                label: '이번 주 배포',
                value: `${thisWeekCount}회`,
                sub: thisWeekCount > 0
                  ? `활동지 ${new Set(thisWeekLogs.map(l => l.worksheetId)).size}종 · 학생 ${thisWeekLogs.reduce((s, l) => s + l.total, 0)}명`
                  : '이번 주 배포 없어요',
                accent: false,
              },
            ].map(card => (
              <div key={card.label} style={{
                background: card.accent ? '#f3f0ff' : '#fff',
                border: `1px solid ${card.accent ? '#6741d9' : 'var(--line)'}`,
                borderRadius: 16,
                padding: '16px 18px',
              }}>
                <p style={{ margin: '0 0 4px', fontSize: 12, fontWeight: 600, color: 'var(--ink-3)' }}>{card.label}</p>
                <p style={{ margin: '0 0 6px', fontSize: 22, fontWeight: 800, color: 'var(--ink)', lineHeight: 1.2 }}>{card.value}</p>
                <p style={{ margin: 0, fontSize: 12, color: 'var(--ink-3)', lineHeight: 1.4 }}>{card.sub}</p>
              </div>
            ))}
          </div>

          {/* 반 필터 */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
            {(['all', ...deployClasses]).map(cls => {
              const isActive = clsFilter === cls;
              const color = cls !== 'all' ? (CLASS_COLOR_MAP[cls] ?? { bg: '#f3f4f6', text: 'var(--ink)' }) : { bg: '', text: '' };
              return (
                <button
                  key={cls}
                  onClick={() => setClsFilter(cls)}
                  style={{
                    height: 32, padding: '0 12px', borderRadius: 20,
                    border: isActive ? '2px solid var(--navy)' : '1.5px solid var(--line)',
                    background: isActive ? (cls !== 'all' ? color.bg : 'var(--canvas)') : '#fff',
                    color: isActive ? (cls !== 'all' ? color.text : 'var(--navy)') : 'var(--ink-2)',
                    fontSize: 13, fontWeight: isActive ? 800 : 600, cursor: 'pointer',
                  }}
                >
                  {cls === 'all' ? '전체' : cls}
                </button>
              );
            })}
          </div>

          {/* 표 */}
          {deployLogsFiltered.length === 0 ? (
            <EmptyDeployed />
          ) : (
            <div className="panel">
              <div className="tscroll">
                <table style={{ tableLayout: 'fixed', width: '100%' }}>
                  <colgroup>
                    <col />
                    <col style={{ width: 108 }} />
                    <col style={{ width: 108 }} />
                    <col style={{ width: 118 }} />
                    <col style={{ width: 102 }} />
                  </colgroup>
                  <thead>
                    <tr>
                      {['활동지 · 반', '날짜 · 교시', '제출', '상태', ''].map(h => (
                        <th key={h} style={{ whiteSpace: 'nowrap', fontSize: 13, fontWeight: 600, color: '#5d6880' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {deployLogsFiltered.map(log => {
                      const cls   = CLASS_COLOR_MAP[log.cls] ?? { bg: '#f3f4f6', text: 'var(--ink-3)' };
                      const st    = STATUS_STYLE[log.status];
                      const pct   = Math.round((log.submitted / log.total) * 100);
                      const thumb = TYPE_THUMB[log.worksheetType] ?? { bg: '#f3f4f6', dot: '#9ca3af' };
                      return (
                        <tr key={log.id}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <div style={{
                                width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                                background: thumb.bg,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                              }}>
                                <TypeIcon type={log.worksheetType} color={thumb.dot} />
                              </div>
                              <div style={{ minWidth: 0 }}>
                                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-3)', marginBottom: 2 }}>
                                  {TYPE_LABEL[log.worksheetType as WorksheetType]}
                                </div>
                                <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)', lineHeight: 1.3, wordBreak: 'keep-all' }}>
                                  {log.worksheetTitle}
                                </div>
                                <div style={{ marginTop: 3 }}>
                                  <span style={{
                                    background: cls.bg, color: cls.text,
                                    padding: '1px 7px', borderRadius: 6,
                                    fontSize: 12.5, fontWeight: 600,
                                  }}>
                                    {log.cls}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td style={{ whiteSpace: 'nowrap', verticalAlign: 'middle' }}>
                            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>
                              {formatDeployDate(log.deployedDate)}
                            </div>
                            {log.period && (
                              <div style={{ fontSize: 12.5, color: '#5d6880', marginTop: 1 }}>
                                {log.period}
                              </div>
                            )}
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <div style={{ width: 44, height: 5, borderRadius: 3, background: 'var(--line)', overflow: 'hidden', flexShrink: 0 }}>
                                <div style={{ width: `${pct}%`, height: '100%', background: STATUS_BAR_COLOR[log.status] ?? '#34d399' }} />
                              </div>
                              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', whiteSpace: 'nowrap' }}>
                                {log.submitted}/{log.total}
                              </span>
                            </div>
                          </td>
                          <td>
                            <span style={{
                              padding: '3px 8px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                              background: st.bg, color: st.color, whiteSpace: 'nowrap',
                            }}>
                              {st.label}
                            </span>
                          </td>
                          <td style={{ whiteSpace: 'nowrap' }}>
                            <Link
                              href="/class"
                              className="btn sm"
                              style={{
                                textDecoration: 'none',
                                background: log.status === 'live' ? '#6741d9' : '#fff',
                                color: log.status === 'live' ? '#fff' : 'var(--ink)',
                                border: log.status === 'live' ? 'none' : '1.5px solid var(--line)',
                                fontSize: 13.5, fontWeight: 600,
                              }}
                            >
                              {log.status === 'live' ? '수업 보기' : '결과 보기'}
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ── 활동지 카드 ── */
interface DeploySummary { classStr: string; dateStr: string; }

export function SheetCard({ sheet, deployed, deployInfo }: {
  sheet: MySavedSheet;
  deployed?: boolean;
  deployInfo?: DeploySummary | null;
}) {
  return (
    <div className="ws-card2" style={{ cursor: 'default' }}>
      <div className="cover" style={{ aspectRatio: '5/3', borderRadius: 0 }}>
        <TypeCover type={sheet.type as TypeKey} height={120} block={false} />
        <div className="corner" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <SourceIcon source={sheet.source} size={12} />
          {sheet.source === 'edit' ? '수정본' : sheet.source === 'create' ? '직접만든' : '책갈피'}
        </div>
      </div>
      <div className="body">
        <div className="row" style={{ gap: 6, flexWrap: 'wrap' }}>
          <TypeTag type={sheet.type as TypeKey} />
          {deployed && (
            <span style={{
              height: 20, padding: '0 7px', borderRadius: 10,
              background: '#ebfbee', color: '#1e6b2f',
              fontSize: 11, fontWeight: 700,
              display: 'inline-flex', alignItems: 'center',
            }}>
              배포함
            </span>
          )}
          {sheet.shared && (
            <span style={{
              height: 20, padding: '0 7px', borderRadius: 10,
              background: '#e7f0ff', color: '#2b4fb8',
              fontSize: 11, fontWeight: 700,
              display: 'inline-flex', alignItems: 'center',
            }}>
              공유함
            </span>
          )}
        </div>
        <h3>{sheet.title}</h3>
        {sheet.unitTitle && (
          <p style={{ margin: 0, fontSize: 12, color: 'var(--ink-3)' }}>{sheet.unitTitle}</p>
        )}
        {deployInfo && (
          <p style={{ margin: '4px 0 0', fontSize: 11.5, color: 'var(--ink-3)' }}>
            {deployInfo.classStr} 배포 · {deployInfo.dateStr}
          </p>
        )}
        <div className="row" style={{ marginTop: 'auto', paddingTop: 6, gap: 8 }}>
          <Link
            href={
              sheet.source === 'create'
                ? `/worksheets/${sheet.id}/deploy`
                : `/worksheets/${sheet.worksheetId}/deploy`
            }
            className="btn sm ghost"
            style={{ textDecoration: 'none', flex: 1, justifyContent: 'center' }}
          >
            배포하기
          </Link>
          <Link
            href={
              sheet.source === 'create'
                ? `/my-sheets/new/edit?id=${sheet.id}&view=student`
                : `/worksheets/${sheet.worksheetId}`
            }
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
