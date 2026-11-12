import type { WorksheetType } from '@/types/worksheet';

export interface DeployLog {
  id: string;
  worksheetId: string;
  worksheetTitle: string;
  worksheetType: WorksheetType;
  cls: string;        // '2학년 1반'
  deployedDate: string; // 'YYYY-MM-DD'
  period?: string;    // '3교시'
  submitted: number;
  total: number;
  status: 'live' | 'feedback' | 'resubmit' | 'done';
}

export type DeployStatus = DeployLog['status'];

export const STATUS_STYLE: Record<DeployStatus, { bg: string; color: string; label: string }> = {
  live:     { bg: '#6741d9', color: '#fff',    label: '진행 중' },
  feedback: { bg: '#fff4e6', color: '#8a4b00', label: '피드백 대기' },
  resubmit: { bg: '#e7f0ff', color: '#2b4fb8', label: '다시 제출 중' },
  done:     { bg: '#ebfbee', color: '#1e6b2f', label: '완료' },
};

// class/page.tsx CLASS_TABS.bg 와 같은 색 + 같은 계열 진한 글자색
export const CLASS_COLOR_MAP: Record<string, { bg: string; text: string }> = {
  '2학년 1반': { bg: '#dbeafe', text: '#1e40af' },
  '2학년 2반': { bg: '#d1fae5', text: '#1e6b2f' },
  '2학년 3반': { bg: '#fef9c3', text: '#854d0e' },
  '2학년 4반': { bg: '#ede9fe', text: '#5b21b6' },
};

// ws-pixel('0과 1로 그림 보내기')는 worksheets.json에 없는 플레이스홀더 ID
const DEMO_DEPLOY_LOG: DeployLog[] = [
  {
    id: 'demo-dl-1',
    worksheetId: 'ws-logic',
    worksheetTitle: '놀이공원 입장료 예측표',
    worksheetType: 'concept',
    cls: '2학년 3반',
    deployedDate: '2026-11-10',
    period: '3교시',
    submitted: 15,
    total: 24,
    status: 'live',
  },
  {
    id: 'demo-dl-2',
    worksheetId: 'ws-debug',
    worksheetTitle: '버그 탐정: 고장 난 블록 찾기',
    worksheetType: 'mystery',
    cls: '2학년 1반',
    deployedDate: '2026-11-09',
    period: '1교시',
    submitted: 24,
    total: 24,
    status: 'feedback',
  },
  {
    id: 'demo-dl-3',
    worksheetId: 'ws-pixel',
    worksheetTitle: '0과 1로 그림 보내기',
    worksheetType: 'concept',
    cls: '2학년 2반',
    deployedDate: '2026-11-09',
    period: '2교시',
    submitted: 22,
    total: 24,
    status: 'resubmit',
  },
  {
    id: 'demo-dl-4',
    worksheetId: 'ws-vault',
    worksheetTitle: '비트 금고를 열어라',
    worksheetType: 'escape',
    cls: '2학년 3반',
    deployedDate: '2026-11-06',
    period: '3교시',
    submitted: 24,
    total: 24,
    status: 'done',
  },
];

const STORAGE_KEY = 'activity_studio_deploy_log';

export function loadDeployLogs(): DeployLog[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as DeployLog[]) : [];
  } catch { return []; }
}

export function saveDeployLogs(logs: DeployLog[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
}

export function addDeployLogs(newLogs: DeployLog[]): void {
  const existing = loadDeployLogs();
  const newKeys = new Set(newLogs.map(n => `${n.worksheetId}:${n.cls}`));
  const kept = existing.filter(e => !newKeys.has(`${e.worksheetId}:${e.cls}`));
  saveDeployLogs([...newLogs, ...kept]);
}

export function getDeployLogs(): DeployLog[] {
  const real = loadDeployLogs();
  const realKeys = new Set(real.map(r => `${r.worksheetId}:${r.cls}`));
  const demo = DEMO_DEPLOY_LOG.filter(d => !realKeys.has(`${d.worksheetId}:${d.cls}`));
  return [...real, ...demo].sort((a, b) => {
    if (b.deployedDate !== a.deployedDate) return b.deployedDate.localeCompare(a.deployedDate);
    return (b.period ?? '').localeCompare(a.period ?? '');
  });
}

const DAY_KO = ['일', '월', '화', '수', '목', '금', '토'];

export function formatDeployDate(isoDate: string): string {
  const d = new Date(isoDate + 'T00:00:00');
  return `${d.getMonth() + 1}/${d.getDate()}(${DAY_KO[d.getDay()]})`;
}

export function getDeployInfoForWorksheet(
  worksheetId: string,
  logs: DeployLog[],
): { classStr: string; dateStr: string } | null {
  const matching = logs.filter(l => l.worksheetId === worksheetId);
  if (matching.length === 0) return null;
  const nums = [...new Set(matching.map(l => l.cls.match(/(\d+)반/)?.[1] ?? l.cls))].sort();
  const classStr = nums.length === 1 ? `2학년 ${nums[0]}반` : `2학년 ${nums.join('·')}반`;
  const d = new Date(matching[0].deployedDate + 'T00:00:00');
  const dateStr = `${d.getMonth() + 1}/${d.getDate()}`;
  return { classStr, dateStr };
}
