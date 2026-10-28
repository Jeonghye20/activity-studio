export type WorksheetType = 'concept' | 'escape' | 'mystery' | 'practice' | 'analysis' | 'discussion';
export type SectionRole = 'start' | 'main' | 'wrap';
export type Situation = 'wrap' | 'quiz' | 'level' | 'focus';

export interface CodeLine { k?: string; d: number; t: string; }

export type Block = {
  id: string;
  kind: string;
  method: string;
  prompt: string;
  hint?: string;
  explain?: string;
  gate?: boolean;
  reward?: string;
  hidden?: boolean;
  code?: CodeLine[];
  afterLock?: boolean;
  // kind-specific fields (keep as any for renderer compat)
  [key: string]: unknown;
};

export interface Section {
  role: SectionRole;
  title: string;
  blocks: Block[];
}

export interface Worksheet {
  id: string;
  unit: string;
  title: string;
  type: WorksheetType;
  minutes: number;
  mode?: string[];
  goal: string;
  keywords: string[];
  situations: Situation[];
  wrapOn: boolean;
  story?: string;
  lock?: Record<string, unknown>;
  heroArt?: number;
  sections: Section[];
}

export interface WorksheetSummary {
  id: string;
  unit: string;
  title: string;
  type: WorksheetType;
  minutes: number;
  goal: string;
  keywords: string[];
  situations: Situation[];
}

export interface CurriculumUnit {
  code: string;
  chapter: string;
  section: string;
  subsection: string;
  title: string;
  pages?: string;
  goal?: string;
  standards: string[];
}

export interface Curriculum {
  textbook: { publisher: string; subject: string; school: string; curriculum: string; };
  standards: { code: string; area: string; text: string; }[];
  units: CurriculumUnit[];
}

export const TYPE_LABEL: Record<WorksheetType, string> = {
  concept: '개념 확인',
  escape: '탈출 게임',
  mystery: '추리 게임',
  practice: '실습 기록',
  analysis: '자료 분석',
  discussion: '토론·의견',
};

export const TYPE_GAME: Record<WorksheetType, boolean> = {
  concept: false,
  escape: true,
  mystery: true,
  practice: false,
  analysis: false,
  discussion: false,
};
