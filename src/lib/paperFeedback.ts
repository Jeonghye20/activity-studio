// 종이 제출 피드백 — 교사가 찍어 올린 종이 활동지 사진 + 학생별 피드백
// localStorage 키: activity_studio_paper_feedback_${code}
// 값: { [학생 번호]: PaperFeedback }

export type PaperFeedback = {
  sheetId: string;
  num: number;
  name: string;
  photo: string;          // JPEG dataURL (긴 변 1600px, 품질 0.7)
  praise: string[];
  comment: string;
  retryItems: number[];   // 다시 볼 문항 번호
  sentAt: string | null;  // 보내기 전(사진만 올림)이면 null
  viewed: boolean;
};

export const PAPER_PRAISE_OPTIONS = [
  '끝까지 해냈어요',
  '풀이 과정이 잘 보여요',
  '글씨가 또박또박해요',
  '생각이 새로워요',
];

const BADGE_EVENT = 'activity_studio_badge_update';

function key(code: string) {
  return `activity_studio_paper_feedback_${code}`;
}

function readMap(code: string): Record<string, PaperFeedback> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(key(code));
    return raw ? (JSON.parse(raw) as Record<string, PaperFeedback>) : {};
  } catch {
    return {};
  }
}

/** 저장 성공 여부를 돌려준다. 용량 초과면 false */
function writeMap(code: string, map: Record<string, PaperFeedback>): boolean {
  try {
    window.localStorage.setItem(key(code), JSON.stringify(map));
  } catch {
    return false;
  }
  try {
    window.dispatchEvent(new Event(BADGE_EVENT));
  } catch { /* 무시 */ }
  return true;
}

export function getAllPaperFeedback(code: string): Record<number, PaperFeedback> {
  const map = readMap(code);
  const out: Record<number, PaperFeedback> = {};
  for (const k of Object.keys(map)) out[Number(k)] = map[k];
  return out;
}

export function getPaperFeedback(code: string, num: number): PaperFeedback | null {
  return readMap(code)[String(num)] ?? null;
}

/** 학생 번호(data.num) 칸에 덮어쓴다. 용량이 꽉 차면 false */
export function savePaperFeedback(code: string, data: PaperFeedback): boolean {
  const map = readMap(code);
  map[String(data.num)] = data;
  return writeMap(code, map);
}

export function markPaperFeedbackViewed(code: string, num: number): void {
  const map = readMap(code);
  const item = map[String(num)];
  if (!item || item.viewed) return;
  map[String(num)] = { ...item, viewed: true };
  writeMap(code, map);
}
