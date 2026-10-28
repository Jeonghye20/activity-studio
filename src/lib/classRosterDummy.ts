// 더미 데이터 모듈 — 실제 제출·점수 기록과 연결하지 않음.
// getStudentProgress 함수로 학생별 성취 진도를 계산. 결과는 시드 고정으로 재현 가능.

import type { ClassRoom, Student, AttendanceRecord, ActivityScore, AchievementStatus, StudentProgress } from '@/types/classRoster';

export const TOTAL_ACTIVITIES = 20;
export const ACHIEVEMENT_THRESHOLD = 6;  // 향상/하락 기준 점수 차이
export const COMPLETION_RATE = 0.6;      // '완료 미만' 기준 비율

const ACTIVITY_NAMES = [
  '컴퓨팅 사고 탐정',
  '순서도 그리기',
  '조건문 스위치',
  '반복 로봇',
  '데이터 분류',
  '변수 실험실',
  '네트워크 탈출',
  'AI 체크포인트',
] as const;

// ─── 데모 반 ID ──────────────────────────────────────────
export const DEMO_CLASS_IDS = {
  c1: 'cls_2_1',
  c2: 'cls_2_2',
  c3: 'cls_2_3',
  c4: 'cls_2_4',
} as const;

// ─── 더미: 2학년 3반 학생별 고정 진도 ──────────────────
// scores[0]=오래된 것 ... scores[7]=최신. recent3=scores[5..7], prev3=scores[2..4]
// 더미: 2학년 3반 학생별 고정 진도
// scores[0]=오래된 것 … scores[7]=최신. recent3=scores[5..7], prev3=scores[2..4]
// 성취 변화 = round(avg(recent3) − avg(prev3))
// 출발 점수(prev3 base) = 52~80 범위로 학생마다 다르게
const CLASS3_DATA: Record<number, { completed: number; scores: number[] }> = {
  1:  { completed: 18, scores: [62,68,63,67,65,73,70,72] }, // 향상  +7
  2:  { completed: 20, scores: [69,75,70,74,72,85,85,86] }, // 향상 +13
  3:  { completed: 17, scores: [55,62,57,59,58,65,67,66] }, // 향상  +8
  4:  { completed: 15, scores: [73,77,74,76,75,79,79,78] }, // 유지  +4
  5:  { completed: 14, scores: [58,65,61,63,62,79,79,80] }, // 향상 +17
  6:  { completed: 12, scores: [75,80,77,79,78,70,70,71] }, // 하락  -8
  7:  { completed: 19, scores: [68,73,69,71,70,67,67,68] }, // 유지  -3
  8:  { completed: 16, scores: [52,58,54,56,55,66,66,67] }, // 향상 +11
  9:  { completed: 13, scores: [65,70,67,69,68,73,73,74] }, // 유지  +5
  10: { completed: 18, scores: [60,66,62,64,63,78,78,79] }, // 향상 +15
  11: { completed: 15, scores: [74,79,75,77,76,71,71,71] }, // 유지  -5
  12: { completed: 17, scores: [50,56,52,54,53,62,62,63] }, // 향상  +9
  13: { completed: 14, scores: [71,77,73,75,74,76,76,76] }, // 유지  +2
  14: { completed: 16, scores: [63,69,65,67,66,80,80,81] }, // 향상 +14
  15: { completed: 11, scores: [77,83,79,81,80,64,64,65] }, // 하락 -16
  16: { completed: 13, scores: [70,76,72,74,73,67,67,67] }, // 하락  -6
  17: { completed: 19, scores: [66,71,67,69,68,64,64,64] }, // 유지  -4
  18: { completed: 16, scores: [68,74,70,72,71,72,72,72] }, // 유지  +1
  19: { completed: 10, scores: [74,80,76,78,77,63,65,63] }, // 하락 -13
  20: { completed: 18, scores: [56,63,59,61,60,67,67,68] }, // 향상  +7
  21: { completed: 14, scores: [64,70,66,68,67,65,65,65] }, // 유지  -2
  22: { completed: 2,  scores: [72,65] },                    // 기록 부족 (고은호)
  23: { completed: 20, scores: [62,68,64,66,65,81,81,82] }, // 향상 +16
  24: { completed: 12, scores: [71,77,73,75,74,63,63,63] }, // 하락 -11
};

// ─── 시드 기반 PRNG (다른 반용) ─────────────────────────
// FNV-1a 32-bit hash
function fnv1a(str: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h;
}

// Linear Congruential Generator
function lcg(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

// ─── 성취 계산 공통 함수 ─────────────────────────────────
function calcStatus(scores: number[]): { status: AchievementStatus; delta: number | null } {
  if (scores.length === 0) return { status: 'new', delta: null };
  if (scores.length < 6) return { status: 'insufficient', delta: null };
  const recent3 = scores.slice(-3);
  const prev3 = scores.slice(-6, -3);
  const recentAvg = recent3.reduce((a, b) => a + b, 0) / 3;
  const prevAvg = prev3.reduce((a, b) => a + b, 0) / 3;
  const delta = Math.round(recentAvg - prevAvg);
  let status: AchievementStatus;
  if (delta >= ACHIEVEMENT_THRESHOLD) status = 'rising';
  else if (delta <= -ACHIEVEMENT_THRESHOLD) status = 'falling';
  else status = 'steady';
  return { status, delta };
}

// ─── 더미: 학생 성취 진도 반환 ───────────────────────────
export function getStudentProgress(classId: string, student: Student): StudentProgress {
  // 2학년 3반은 고정 값 테이블 사용
  if (classId === DEMO_CLASS_IDS.c3) {
    const d = CLASS3_DATA[student.no];
    if (!d) {
      return { completedCount: 0, totalActivities: TOTAL_ACTIVITIES, recentScores: [], status: 'new', statusDelta: null };
    }
    const recentScores: ActivityScore[] = d.scores.map((score, i) => ({
      name: ACTIVITY_NAMES[i % ACTIVITY_NAMES.length],
      score,
    }));
    const { status, delta } = calcStatus(d.scores);
    return {
      completedCount: d.completed,
      totalActivities: TOTAL_ACTIVITIES,
      recentScores,
      status,
      statusDelta: delta,
    };
  }

  // 나머지 반: 시드 기반 생성
  const seed = fnv1a(`${classId}-${student.no}`);
  const rng = lcg(seed);

  const completedCount = 10 + Math.floor(rng() * 11); // 10~20
  const numScores = Math.min(8, completedCount);

  if (numScores === 0) {
    return { completedCount: 0, totalActivities: TOTAL_ACTIVITIES, recentScores: [], status: 'new', statusDelta: null };
  }

  // 트렌드 결정 (시드 기반)
  const trendSeed = fnv1a(`${classId}-trend-${student.no}`);
  const tv = (trendSeed % 100) / 100;
  const trend = tv < 0.40 ? 'rising' : tv < 0.75 ? 'steady' : 'falling';

  const rawScores: number[] = [];
  for (let i = 0; i < numScores; i++) {
    const isRecent = i >= numScores - 3;
    const isPrev   = i >= numScores - 6 && !isRecent;
    let base: number;
    if (isRecent)     base = trend === 'rising' ? 74 : trend === 'falling' ? 63 : 70;
    else if (isPrev)  base = trend === 'rising' ? 63 : trend === 'falling' ? 74 : 70;
    else              base = 65;
    const variation = Math.floor(rng() * 17) - 8;
    rawScores.push(Math.min(100, Math.max(30, base + variation)));
  }

  const recentScores: ActivityScore[] = rawScores.map((score, i) => ({
    name: ACTIVITY_NAMES[i % ACTIVITY_NAMES.length],
    score,
  }));

  const { status, delta } = calcStatus(rawScores);
  return { completedCount, totalActivities: TOTAL_ACTIVITIES, recentScores, status, statusDelta: delta };
}

// ─── 데모 반 생성 ────────────────────────────────────────
function makeStudents(classId: string, names: string[]): Student[] {
  return names.map((name, i) => ({
    id: `${classId}_s${String(i + 1).padStart(2, '0')}`,
    no: i + 1,
    name,
  }));
}

const NAMES_C1 = [
  '김도현','이수빈','박태준','최지아','정민호','강하린','조윤서','윤재원',
  '장나은','임준혁','한예린','오수현','서도윤','신채원','권태영','황보람',
  '안민서','송재호','류지원','홍시우','전예준','고민주','문태현','양서현',
];

const NAMES_C2 = [
  '김지원','이태양','박소현','최준혁','정나영','강시현','조민지','윤태호',
  '장수민','임하은','한재준','오채영','서민혁','신지수','권성준','황예진',
  '안도준','송유나','류태현','홍가은','전지훈','고태준','문소연','양재현',
];

const NAMES_C3 = [
  '김민준','이서연','박지훈','최유나','정하윤','강도윤','조서준','윤지우',
  '장예린','임시우','한지민','오태윤','서하은','신우진','권나은','황준서',
  '안수아','송민재','류채원','홍건우','전소율','고은호','문다인','양현우',
];

const WALL_COLORS = ['연한 파랑','민트','연노랑','연보라','연분홍','연청록'];

export function getDemoClasses(): ClassRoom[] {
  return [
    {
      id: DEMO_CLASS_IDS.c1,
      name: '2학년 1반', chalk: '2-1', kind: 'num', grade: 2, room: 1,
      wallIndex: 0,
      students: makeStudents(DEMO_CLASS_IDS.c1, NAMES_C1),
    },
    {
      id: DEMO_CLASS_IDS.c2,
      name: '2학년 2반', chalk: '2-2', kind: 'num', grade: 2, room: 2,
      wallIndex: 1,
      students: makeStudents(DEMO_CLASS_IDS.c2, NAMES_C2),
    },
    {
      id: DEMO_CLASS_IDS.c3,
      name: '2학년 3반', chalk: '2-3', kind: 'num', grade: 2, room: 3,
      wallIndex: 2,
      students: makeStudents(DEMO_CLASS_IDS.c3, NAMES_C3),
    },
    {
      id: DEMO_CLASS_IDS.c4,
      name: '2학년 4반', chalk: '2-4', kind: 'num', grade: 2, room: 4,
      wallIndex: 3,
      students: [],
    },
  ];
}

export function getDemoAttendance(): AttendanceRecord {
  const today = new Date().toISOString().slice(0, 10);
  const classes = getDemoClasses();
  const c3 = classes.find(c => c.id === DEMO_CLASS_IDS.c3)!;

  // 권나은(15번)·고은호(22번) 결석
  const absentNos = [15, 22];
  const absentRecord: Record<string, 'absent'> = {};
  for (const s of c3.students) {
    if (absentNos.includes(s.no)) {
      absentRecord[s.id] = 'absent';
    }
  }

  return {
    [DEMO_CLASS_IDS.c3]: {
      [today]: absentRecord,
    },
  };
}

// WALL_COLORS export for classroom card SVG
export const WALL_COLOR_VALUES = [
  '#dce8f5', // 연한 파랑
  '#d4efe8', // 민트
  '#f5efd4', // 연노랑
  '#e8d4f0', // 연보라
  '#f5d4e2', // 연분홍
  '#d4f0f0', // 연청록
] as const;

export { WALL_COLORS };
