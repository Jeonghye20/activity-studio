/* 수업 관리 시연용 고정 데이터 — 값을 바꾸면 관련 화면에 자동 반영 */

export const DEMO_SESSION = {
  worksheetId: 'ws-logic',
  worksheetTitle: '놀이공원 입장료 예측표',
  classLabel: '2학년 3반',
  classCode: 'T7Y75',
  total: 24,
  submitted: 15,
  inProgress: 6,
  notJoined: 3,
};

export const NOT_JOINED = ['김oo', '이oo', '박oo'];

export const IN_PROGRESS = [
  { name: '최oo', needHelp: false },
  { name: '정oo', needHelp: true },
  { name: '강oo', needHelp: false },
  { name: '조oo', needHelp: false },
  { name: '윤oo', needHelp: false },
  { name: '장oo', needHelp: false },
];

export const SUBMITTED_VISIBLE = ['임oo', '한oo', '오oo', '서oo', '신oo', '권oo', '황oo'];
export const SUBMITTED_HIDDEN = 8;

export const WATCH_STUDENTS = [
  {
    name: '신oo', score: '1/3 맞음', feedback: 'review' as const,
    aiReason: '다른 학생과 전혀 다른 답 → AI 초안',
    aiComment: '조건을 하나씩 나눠서 참·거짓부터 다시 적어 보세요.',
    wrongBlock: '문항 2',
  },
  {
    name: '송oo', score: '1/3 맞음', feedback: 'review' as const,
    aiReason: '이유 칸이 비어 있음 → AI 초안',
    aiComment: '왜 그렇게 골랐는지 한 문장만 적어 볼까요?',
    wrongBlock: '문항 2',
  },
  {
    name: '홍oo', score: '0/3 맞음', feedback: 'review' as const,
    aiReason: '"잘 모르겠어요" → AI 초안',
    aiComment: '요금표에서 15세가 어느 칸에 들어가는지 먼저 찾아볼까요?',
    wrongBlock: '문항 1',
  },
];

export type FeedbackValue = 'good' | 'almost' | 'review';
export const FEEDBACK_LABELS: Record<FeedbackValue, string> = {
  good: '잘했어요',
  almost: '거의 다 왔어요',
  review: '한 번 더 살펴봐요',
};

/* ── 반별 결과 전체 데이터 ── */
export const ALL_CLASS_RESULTS = [
  { title: '놀이공원 입장료 예측표', cls: '2학년 3반', submitted: '15/24', status: 'resubmit', wrongBlock: '문항 2' },
  { title: '놀이공원 입장료 예측표', cls: '1반', submitted: '24/24', status: 'feedback', wrongBlock: '문항 2' },
  { title: '버그 탐정: 고장 난 블록 찾기', cls: '1반', submitted: '24/24', status: 'done', wrongBlock: '문항 2' },
  { title: '0과 1로 그림 보내기', cls: '2반', submitted: '24/24', status: 'done', wrongBlock: '문항 2' },
];

/* 하위 호환용 */
export const CLASS_RESULTS = ALL_CLASS_RESULTS;

/* ── 학생별 기록 전체 데이터 ── */
export const ALL_STUDENT_RECORDS = [
  { title: '놀이공원 입장료 예측표', feedback: 'good' as FeedbackValue, student: '김oo' },
  { title: '놀이공원 입장료 예측표', feedback: null, student: '이서연' },
  { title: '버그 탐정: 고장 난 블록 찾기', feedback: 'good' as FeedbackValue, student: '이서연' },
  { title: '0과 1로 그림 보내기', feedback: 'good' as FeedbackValue, student: '이서연' },
];

export const STUDENT_RECORDS = ALL_STUDENT_RECORDS;

export const RESUBMIT_FIXED_OK = ['오oo', '권oo', '류oo', '문oo'];
export const RESUBMIT_FIXED_STILL = [
  { name: '신oo' },
  { name: '홍oo' },
];
export const RESUBMIT_NOT_FIXED = ['송oo'];

/* ── AI 대시보드 시연 ── */

export type AiFilterKey = 'cls1' | 'nofeedback' | 'wrongblock' | 'student' | null;

export interface AiDemoResponse {
  text: string;
  filter: AiFilterKey;
  /** 학생별 기록 섹션 헤더 라벨 */
  studentLabel?: string;
}

/** 질문 키워드 → 응답 매핑 (순서대로 첫 번째 매칭 적용) */
export const AI_DEMO_ENTRIES: Array<{ match: string; response: AiDemoResponse }> = [
  {
    match: '1반',
    response: {
      text: '1반 데이터만 필터해서 보여 드릴게요. 반별 결과 섹션이 1반으로 좁혀졌어요.',
      filter: 'cls1',
    },
  },
  {
    match: '피드백',
    response: {
      text: '피드백 아직 안 보낸 수업 1개예요 — 놀이공원 입장료 예측표 1반. 바로 이동할까요?',
      filter: 'nofeedback',
    },
  },
  {
    match: '자주 틀린',
    response: {
      text: '전체 반에서 문항 2가 가장 많이 틀렸어요. 43%가 오답이었어요.',
      filter: 'wrongblock',
    },
  },
  {
    match: '이서연',
    response: {
      text: '이서연 학생 기록을 보여 드릴게요. 최근 3개 활동 모두 제출했고, 피드백은 2개 수령했어요.',
      filter: 'student',
      studentLabel: '이서연',
    },
  },
];

export const AI_DEMO_DEFAULT: AiDemoResponse = {
  text: '요청을 처리했어요. 더 구체적인 조건이 있으면 알려 주세요.',
  filter: null,
};

/** AI_DEMO_RESPONSES는 하위 호환용 */
export const AI_DEMO_RESPONSES: Record<string, string> = Object.fromEntries([
  ['default', AI_DEMO_DEFAULT.text],
  ...AI_DEMO_ENTRIES.map(e => [e.match, e.response.text]),
]);

/* ── 필터 적용 함수 ── */

export function getFilteredClassResults(filter: AiFilterKey) {
  if (filter === 'cls1') return ALL_CLASS_RESULTS.filter(r => r.cls === '1반');
  if (filter === 'nofeedback') return ALL_CLASS_RESULTS.filter(r => r.status === 'feedback');
  if (filter === 'wrongblock') return ALL_CLASS_RESULTS; // 하이라이트만
  return ALL_CLASS_RESULTS;
}

export function getFilteredStudentRecords(filter: AiFilterKey, studentLabel?: string) {
  if (filter === 'student' && studentLabel) {
    return ALL_STUDENT_RECORDS.filter(r => r.student === studentLabel);
  }
  return ALL_STUDENT_RECORDS;
}

export function resolveAiQuery(query: string): AiDemoResponse {
  const entry = AI_DEMO_ENTRIES.find(e => query.includes(e.match));
  return entry ? entry.response : AI_DEMO_DEFAULT;
}
