import type { WorksheetType } from '@/types/worksheet';
import { TYPE_LABEL } from '@/types/worksheet';

export type { WorksheetType };
export { TYPE_LABEL as TYPE_LABELS };

export const TYPE_COLORS: Record<string, string> = {
  concept: '#4263eb',
  escape: '#e8890c',
  mystery: '#7048e8',
  practice: '#0ca678',
  analysis: '#1098ad',
  discussion: '#d6336c',
  free: '#5d6880',
};

export const TYPE_LIGHT_COLORS: Record<string, string> = {
  concept: '#e8ecff',
  escape: '#fdf0e0',
  mystery: '#f0eaff',
  practice: '#e0f5ef',
  analysis: '#e0f5f8',
  discussion: '#fce8ef',
  free: '#f0f0f0',
};

export const TYPE_CHIP: Record<string, { bg: string; text: string; dot: string }> = {
  concept:    { bg: '#edf2ff', text: '#3b5bdb', dot: '#4263eb' },
  escape:     { bg: '#fff4e6', text: '#b35c00', dot: '#e8890c' },
  mystery:    { bg: '#f3f0ff', text: '#6741d9', dot: '#7048e8' },
  practice:   { bg: '#f0fdfa', text: '#0ca678', dot: '#12b886' },
  analysis:   { bg: '#e0f5f8', text: '#1098ad', dot: '#1098ad' },
  discussion: { bg: '#fce8ef', text: '#d6336c', dot: '#d6336c' },
  free:       { bg: '#f0f0f0', text: '#5d6880', dot: '#5d6880' },
};

export interface StudentActivity {
  worksheetId: string;
  title: string;
  type: WorksheetType;
  submittedAt: string;
  status: 'feedback' | 'resubmit' | 'done';
  resultText: string;
  resubmitQuestionCount?: number;
}

export interface TodoItem {
  kind: 'current' | 'resubmit' | 'pending';
  worksheetId: string;
  title: string;
  type: WorksheetType;
  resubmitQuestionCount?: number;
  deadline?: string;
  teacher?: string;
}

export const DEMO_ACTIVITY_ID = 'ws-physical';

export const DEMO_CURRENT_ACTIVITY = {
  worksheetId: DEMO_ACTIVITY_ID,
  title: '센서가 알아채고, 장치가 움직인다',
  type: 'concept' as WorksheetType,
  typeLabel: '개념 확인',
  typeColor: '#4263eb',
  meta: '정보 · 2학년 3반 · 3교시 · 김선생님',
  totalQuestions: 5,  // s1 m1 m2 m3 w1
  minutes: 20,
};

export const DEMO_TODO: TodoItem[] = [
  {
    kind: 'current',
    worksheetId: DEMO_CURRENT_ACTIVITY.worksheetId,
    title: DEMO_CURRENT_ACTIVITY.title,
    type: DEMO_CURRENT_ACTIVITY.type,
  },
  {
    kind: 'resubmit',
    worksheetId: 'ws-vault',
    title: '비트 금고를 열어라',
    type: 'escape',
    resubmitQuestionCount: 2,
    deadline: '11월 6일까지',
  },
  {
    kind: 'pending',
    worksheetId: 'ws-screen-time',
    title: '민준이의 일주일 스마트폰 기록',
    type: 'analysis',
    teacher: '김선생님이 보냄',
    deadline: '11월 10일까지',
  },
];

// 최근 3개 — 홈 '최근 활동'과 동일
export const DEMO_RECENT: StudentActivity[] = [
  {
    worksheetId: 'ws-cs-escape',
    title: '잠긴 정보실 컴퓨터를 깨워라',
    type: 'escape',
    submittedAt: '2026-10-30T14:00:00',
    status: 'feedback',
    resultText: '탈출 성공',
  },
  {
    worksheetId: 'ws-vault',
    title: '비트 금고를 열어라',
    type: 'escape',
    submittedAt: '2026-10-23T14:00:00',
    status: 'resubmit',
    resultText: '맞힌 문항 3/5',
    resubmitQuestionCount: 2,
  },
  {
    worksheetId: 'ws-digital',
    title: '아날로그 vs 디지털, 무엇이 달라졌을까?',
    type: 'concept',
    submittedAt: '2026-10-16T14:00:00',
    status: 'done',
    resultText: '맞힌 문항 5/5',
  },
];

// 전체 9개 — 내 활동 '끝낸 활동' 목록 (DEMO_RECENT 포함)
export const DEMO_ALL_DONE: StudentActivity[] = [
  ...DEMO_RECENT,
  {
    worksheetId: 'ws-collect',
    title: '체육대회 종목, 데이터로 정하기',
    type: 'concept',
    submittedAt: '2026-10-08T14:00:00',
    status: 'done',
    resultText: '맞힌 문항 5/5',
  },
  {
    worksheetId: 'ws-river',
    title: '농부는 강을 어떻게 건넜을까?',
    type: 'concept',
    submittedAt: '2026-09-25T14:00:00',
    status: 'done',
    resultText: '맞힌 문항 4/5',
  },
  {
    worksheetId: 'ws-sleep',
    title: '잠을 많이 자면 덜 졸까?',
    type: 'analysis',
    submittedAt: '2026-09-18T14:00:00',
    status: 'done',
    resultText: '자료 분석 완료',
  },
  {
    worksheetId: 'ws-ramen',
    title: '사건 파일: 로봇이 끓인 이상한 라면',
    type: 'mystery',
    submittedAt: '2026-09-11T14:00:00',
    status: 'done',
    resultText: '사건 해결',
  },
  {
    worksheetId: 'ws-ai-ethics',
    title: '얼굴 인식 출석, 해도 될까?',
    type: 'discussion',
    submittedAt: '2026-09-10T14:00:00',
    status: 'done',
    resultText: '의견 제출',
  },
  {
    worksheetId: 'ws-exercise',
    title: '흔들면 세어 주는 운동 횟수 표시 장치',
    type: 'practice',
    submittedAt: '2026-09-08T14:00:00',
    status: 'done',
    resultText: '기록 제출',
  },
];

// ─── 결과 상세 ─────────────────────────────────────────────────────────────

export interface QuestionResult {
  blockId: string;
  num: number;
  prompt: string;
  kind: string;
  studentAnswer: string;
  status: 'correct' | 'review';
  teacherComment?: string;
}

export interface ResultData {
  worksheetId: string;
  title: string;
  type: WorksheetType;
  submittedAt: string;
  meta: string;
  correctCount: number;
  totalCount: number;
  isGameType: boolean;
  gameResult?: string;
  feedback: {
    teacherName: string;
    receivedAt: string;
    comment: string;
    praises: string[];
  } | null;
  resubmit: { questionCount: number; deadline: string } | null;
  questions: QuestionResult[];
}

export const DEMO_RESULT_MAP: Record<string, ResultData> = {
  'ws-physical': {
    worksheetId: 'ws-physical',
    title: '센서가 알아채고, 장치가 움직인다',
    type: 'concept',
    submittedAt: '2026-11-04T13:30:00',
    meta: '정보 · 11월 4일 제출 · 김선생님',
    correctCount: 3,
    totalCount: 5,
    isGameType: false,
    feedback: {
      teacherName: '김선생님',
      receivedAt: '2026-11-04T14:00:00',
      comment: '생활 속 사례를 잘 떠올렸어요. 2번과 3번만 다시 확인해 보면 완벽해요.',
      praises: ['끝까지 도전', '생활 속 예시 최고'],
    },
    resubmit: { questionCount: 2, deadline: '11월 6일까지' },
    questions: [
      {
        blockId: 's1', num: 1,
        prompt: '자동문은 사람이 다가오면 열려요. 사람이 다가온 것을 알아채는 부품은?',
        kind: 'choice',
        studentAnswer: '센서',
        status: 'correct',
      },
      {
        blockId: 'm1', num: 2,
        prompt: '생활 속 피지컬 컴퓨팅 장치예요. 입력(센서)과 출력에 알맞은 부품을 고르세요.',
        kind: 'table',
        studentAnswer: '표 채우기 — 일부 칸 선택',
        status: 'review',
        teacherComment: '자동문 센서는 맞았어요! 스마트 화분 출력 부품을 다시 확인해 보세요.',
      },
      {
        blockId: 'm2', num: 3,
        prompt: '스마트 화분이 물을 주는 순서를 정하세요.',
        kind: 'order',
        studentAnswer: '1 → 물 펌프가 작동해 물을 준다\n2 → 토양 습도 센서가 흙의 습도를 잰다\n3 → 흙이 다시 촉촉해진다\n4 → 마이크로컨트롤러가 습도가 기준보다 낮은지 판단한다',
        status: 'review',
      },
      {
        blockId: 'm3', num: 4,
        prompt: '피지컬 컴퓨팅 시스템이 쓸모 있는 이유를 모두 고르세요.',
        kind: 'multi',
        studentAnswer: '사람이 계속 지켜보지 않아도 된다 / 위험한 곳의 일을 대신할 수 있다 / 정해진 조건에 맞춰 정확하게 반응한다',
        status: 'correct',
      },
      {
        blockId: 'w1', num: 5,
        prompt: '우리 학교에 있으면 좋을 피지컬 컴퓨팅 장치를 하나 떠올려 보세요. "센서"와 "동작"을 넣어 한 문장으로 써 보세요.',
        kind: 'write',
        studentAnswer: '복도에 사람이 지나가면 동작 감지 센서가 알아채고 전등이 켜지는 동작을 하는 장치가 있으면 좋겠다.',
        status: 'correct',
      },
    ],
  },
  'ws-logic': {
    worksheetId: 'ws-logic',
    title: '놀이공원 입장료 예측표',
    type: 'concept',
    submittedAt: '2026-11-04T13:30:00',
    meta: '정보 · 11월 4일 제출 · 김선생님',
    correctCount: 2,
    totalCount: 4,
    isGameType: false,
    feedback: {
      teacherName: '김선생님',
      receivedAt: '2026-11-04T14:00:00',
      comment: '생활 속 사례를 잘 떠올렸어요. 2번과 3번만 다시 확인해 보면 완벽해요.',
      praises: ['끝까지 도전', '생활 속 예시 최고'],
    },
    resubmit: { questionCount: 2, deadline: '11월 6일까지' },
    questions: [
      {
        blockId: 's1', num: 1,
        prompt: '"비가 오고, 우산이 없으면 옷이 젖는다." 두 조건이 "그리고"로 이어져 있어요. 비가 오지만 우산이 있다면?',
        kind: 'choice',
        studentAnswer: '옷이 젖지 않는다',
        status: 'correct',
      },
      {
        blockId: 'm1', num: 2,
        prompt: '기본 입장료는 10,000원이고, 맞는 할인은 모두 적용돼요. 조건별로 각 사람의 입장료를 완성해 보세요.',
        kind: 'table',
        studentAnswer: '표 채우기 — 일부 칸 선택',
        status: 'review',
        teacherComment: '조건 1은 맞았어요! 조건 3을 다시 계산해 보세요.',
      },
      {
        blockId: 'm2', num: 3,
        prompt: '19세 일요일 방문자는 조건 1이 참일까요?',
        kind: 'choice',
        studentAnswer: '거짓이다. 19세는 청소년이 아니다',
        status: 'review',
      },
      {
        blockId: 'w1', num: 4,
        prompt: '"그리고"와 "또는"의 차이를 한 문장으로 써 보세요.',
        kind: 'write',
        studentAnswer: '"그리고"는 두 조건이 모두 참이어야 하고, "또는"은 하나만 참이어도 돼요.',
        status: 'correct',
      },
    ],
  },
  'ws-cs-escape': {
    worksheetId: 'ws-cs-escape',
    title: '잠긴 정보실 컴퓨터를 깨워라',
    type: 'escape',
    submittedAt: '2026-10-30T14:00:00',
    meta: '정보 · 10월 30일 제출 · 김선생님',
    correctCount: 0,
    totalCount: 0,
    isGameType: true,
    gameResult: '탈출 성공',
    feedback: {
      teacherName: '김선생님',
      receivedAt: '2026-10-30T15:30:00',
      comment: '단서를 하나씩 차근차근 연결한 과정이 훌륭해요. 다음 탈출 게임도 기대할게요!',
      praises: ['끝까지 도전', '논리적으로 풀기'],
    },
    resubmit: null,
    questions: [],
  },
  'ws-vault': {
    worksheetId: 'ws-vault',
    title: '비트 금고를 열어라',
    type: 'escape',
    submittedAt: '2026-10-23T14:00:00',
    meta: '정보 · 10월 23일 제출 · 김선생님',
    correctCount: 3,
    totalCount: 5,
    isGameType: false,
    feedback: {
      teacherName: '김선생님',
      receivedAt: '2026-10-23T15:30:00',
      comment: '비트 계산을 잘 이해했어요. 3번과 5번을 한 번 더 살펴봐요.',
      praises: ['비트 연산 도전'],
    },
    resubmit: { questionCount: 2, deadline: '11월 6일까지' },
    questions: [],
  },
  'ws-digital': {
    worksheetId: 'ws-digital',
    title: '아날로그 vs 디지털, 무엇이 달라졌을까?',
    type: 'concept',
    submittedAt: '2026-10-16T14:00:00',
    meta: '정보 · 10월 16일 제출 · 김선생님',
    correctCount: 5,
    totalCount: 5,
    isGameType: false,
    feedback: {
      teacherName: '김선생님',
      receivedAt: '2026-10-16T15:30:00',
      comment: '아날로그와 디지털의 차이를 정확하게 짚었어요. 모두 완벽해요!',
      praises: ['꼼꼼하게 풀기'],
    },
    resubmit: null,
    questions: [],
  },
  'ws-collect': {
    worksheetId: 'ws-collect',
    title: '체육대회 종목, 데이터로 정하기',
    type: 'concept',
    submittedAt: '2026-10-08T14:00:00',
    meta: '정보 · 10월 8일 제출 · 김선생님',
    correctCount: 5,
    totalCount: 5,
    isGameType: false,
    feedback: {
      teacherName: '김선생님',
      receivedAt: '2026-10-08T16:00:00',
      comment: '데이터를 활용해 근거 있는 결정을 내린 과정이 훌륭해요.',
      praises: ['논리적으로 풀기', '끝까지 도전'],
    },
    resubmit: null,
    questions: [],
  },
  'ws-river': {
    worksheetId: 'ws-river',
    title: '농부는 강을 어떻게 건넜을까?',
    type: 'concept',
    submittedAt: '2026-09-25T14:00:00',
    meta: '정보 · 9월 25일 제출 · 김선생님',
    correctCount: 4,
    totalCount: 5,
    isGameType: false,
    feedback: {
      teacherName: '김선생님',
      receivedAt: '2026-09-25T15:00:00',
      comment: '문제를 단계별로 나눠 생각한 과정이 좋았어요. 4번만 한 번 더!',
      praises: ['단계별 사고'],
    },
    resubmit: null,
    questions: [],
  },
};

// ─── 나의 기록 요약 ────────────────────────────────────────────────────────────
export const DEMO_RECORD_STATS = {
  doneCount: DEMO_ALL_DONE.length,
  feedbackCount: Object.values(DEMO_RESULT_MAP).filter(r => r.feedback !== null).length,
  praiseCount: Object.values(DEMO_RESULT_MAP).reduce(
    (sum, r) => sum + (r.feedback?.praises.length ?? 0), 0
  ),
  fixedCount: 2,
};

// ─── 공통 데이터 접근 함수 ────────────────────────────────────────────────────────

export interface StoredSub {
  worksheetId: string;
  title: string;
  type: string;
  submittedAt: string;
  hasFeedback: boolean;
  feedbackType: string | null;
  feedbackText?: string | null;
  answeredCount?: number;
  totalCount?: number;
}

export function mapStoredSubs(subs: StoredSub[]): StudentActivity[] {
  return subs.map(s => ({
    worksheetId: s.worksheetId,
    title: s.title,
    type: s.type as WorksheetType,
    submittedAt: s.submittedAt,
    status:
      s.hasFeedback && s.feedbackType === 'review' ? 'resubmit'
      : s.hasFeedback ? 'feedback'
      : 'done',
    resultText:
      s.hasFeedback
        ? (s.feedbackType === 'review' ? '다시 풀기 요청' : '피드백 도착')
        : (s.answeredCount != null && s.totalCount != null
            ? `답한 문항 ${s.answeredCount}/${s.totalCount}`
            : '확인 완료'),
  }));
}

/**
 * 예시 데이터 + 실제 제출을 머지. 같은 worksheetId → 실제 제출이 예시를 덮어씀.
 * doneItems: 끝낸 활동 전체 (submittedAt 최신순)
 * todoItems: DEMO_TODO에서 실제 제출된 항목 제거
 */
export function getStudentActivities(code: string): {
  doneItems: StudentActivity[];
  todoItems: TodoItem[];
} {
  let realSubs: StoredSub[] = [];
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(`activity_studio_submissions_${code}`);
      realSubs = raw ? JSON.parse(raw) : [];
    } catch {}
  }

  const realActivities = mapStoredSubs(realSubs);
  const submittedIds = new Set(realSubs.map(s => s.worksheetId));

  const merged = new Map(DEMO_ALL_DONE.map(a => [a.worksheetId, a]));
  realActivities.forEach(a => merged.set(a.worksheetId, a));
  const doneItems = [...merged.values()].sort(
    (a, b) => b.submittedAt.localeCompare(a.submittedAt)
  );

  const todoItems = DEMO_TODO.filter(t => !submittedIds.has(t.worksheetId));

  return { doneItems, todoItems };
}

// ─── 시연용 상수 & 공통 초기화 ───────────────────────────────────────────────────

// 아직 열어보지 않은 "새로 온 피드백"으로 시연할 항목
export const DEMO_NEW_FEEDBACK_ID = 'ws-cs-escape';

// 빈 값('')으로 바꾸면 사전 입력 비활성화
export const DEMO_ENTRY_CODE = 'T7Y75';

/**
 * 어떤 페이지에서 먼저 열어도 '새로 1'이 유지되도록 localStorage를 머지 초기화.
 * DEMO_NEW_FEEDBACK_ID 외 모든 피드백을 "이미 읽은 것"으로 보장.
 */
export function initDemoViewedFeedbacks(code: string): string[] {
  if (typeof window === 'undefined') return [];
  const key = `activity_studio_result_viewed_${code}`;
  const preViewed = Object.values(DEMO_RESULT_MAP)
    .filter(r => r.feedback !== null && r.worksheetId !== DEMO_NEW_FEEDBACK_ID)
    .map(r => r.worksheetId);
  try {
    const raw = localStorage.getItem(key);
    const existing: string[] = raw ? JSON.parse(raw) : [];
    const merged = [...new Set([...existing, ...preViewed])];
    if (!raw || merged.length !== existing.length) {
      localStorage.setItem(key, JSON.stringify(merged));
    }
    return merged;
  } catch {
    return preViewed;
  }
}
