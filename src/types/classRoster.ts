export interface Student {
  id: string;
  no: number;
  name: string;
}

export interface ClassRoom {
  id: string;
  name: string;
  chalk: string;
  kind: 'num' | 'free';
  grade?: number;
  room?: number;
  wallIndex: number;
  students: Student[];
}

// attendance[classId][YYYY-MM-DD][studentId] = 'absent'
// 기록 없으면 출석. 결석만 저장.
export type AttendanceRecord = Record<string, Record<string, Record<string, 'absent'>>>;

export interface ActivityScore {
  name: string;
  score: number; // 0-100
}

export type AchievementStatus =
  | 'rising'       // 향상: delta >= +6
  | 'steady'       // 유지: -6 < delta < +6
  | 'falling'      // 하락: delta <= -6
  | 'insufficient' // 기록 쌓는 중: 1~5개
  | 'new';         // 첫 활동 전: 0개

export interface StudentProgress {
  completedCount: number;
  totalActivities: number;
  recentScores: ActivityScore[]; // 최대 8개, 인덱스 0=오래된 것 / 7=최신
  status: AchievementStatus;
  statusDelta: number | null;   // null when insufficient or new
}
