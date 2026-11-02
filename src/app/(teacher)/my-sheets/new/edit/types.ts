export type SheetType = 'concept' | 'free';

export type BlockType =
  | 'choice' | 'multi' | 'picture' | 'line' | 'order'
  | 'ox' | 'short' | 'blank' | 'sort' | 'write'
  | 'data' | 'lock' | 'opinion';

interface BlockBase {
  id: string;
  type: BlockType;
  q: string;
  hint: string;
  hintOn: boolean;
  aiMade?: boolean;       // 자유형에서 AI가 만든 문항
  aiFields?: string[];    // AI가 채운 필드 이름 목록
  aiAnswered?: boolean;   // AI가 정답을 골랐고 아직 교사가 확인 안 함
  aiChecked?: boolean;    // 교사가 AI 정답 확인 완료
}

export interface ChoiceBlock extends BlockBase { type: 'choice'; opts: string[]; ans: number; }
export interface MultiBlock  extends BlockBase { type: 'multi';  opts: string[]; ans: number[]; }
export interface PictureBlock extends BlockBase { type: 'picture'; items: { img: string; a: string }[]; }
export interface LineBlock extends BlockBase {
  type: 'line'; cols: [string, string]; pairs: [string, string][];
}
export interface OrderBlock extends BlockBase {
  type: 'order'; img: string; noImg: boolean; steps: [string, string, string, string];
}
export interface OxBlock    extends BlockBase { type: 'ox';    ans: 'O' | 'X' | ''; }
export interface ShortBlock extends BlockBase { type: 'short'; a: string; }
export interface BlankBlock extends BlockBase { type: 'blank'; sent: string; a: string; }
export interface SortBlock  extends BlockBase {
  type: 'sort'; g: [string, string]; items: string[]; gi: number[];
}
export interface WriteBlock  extends BlockBase { type: 'write'; kw: string[]; ex: string; }
export interface DataBlock   extends BlockBase {
  type: 'data'; img: string; noImg: boolean;
  cols: [string, string]; rows: [string, string][]; a: string;
}
export interface LockBlock   extends BlockBase { type: 'lock'; locks: { q: string; a: string }[]; }
export interface OpinionBlock extends BlockBase { type: 'opinion'; st: [string, string]; ex: string; }

export type Block =
  | ChoiceBlock | MultiBlock | PictureBlock | LineBlock | OrderBlock
  | OxBlock | ShortBlock | BlankBlock | SortBlock | WriteBlock
  | DataBlock | LockBlock | OpinionBlock;

export interface Sheet {
  id: string;
  type: SheetType;
  info: { unit: string; title: string; goal: string; img: string };
  blocks: Block[];
  share: 'none' | 'all';
  sourceChecked: boolean;
  createdBy: 'me';
  createdAt: string;
}

export const BLOCK_TYPE_NAMES: Record<BlockType, string> = {
  choice: '객관식',
  multi: '모두 고르기',
  picture: '그림 보고 답하기',
  line: '선 잇기',
  order: '순서 정하기',
  ox: 'OX',
  short: '단답형',
  blank: '빈칸 채우기',
  sort: '분류하기',
  write: '문장 쓰기',
  data: '자료 읽기',
  lock: '자물쇠 풀기',
  opinion: '내 의견 쓰기',
};

export const BLOCK_SOURCE: Partial<Record<BlockType, { label: string; bg: string; color: string }>> = {
  data:    { label: '자료 분석', bg: '#d5eef1', color: '#0b7285' },
  lock:    { label: '탈출 게임', bg: '#fde8cc', color: '#c25e00' },
  opinion: { label: '토론·의견', bg: '#f9dbe6', color: '#c2255c' },
};

// 정답이 없어서 AI 정답 확인 대상에서 제외되는 블록 타입
export const NO_ANSWER_TYPES: BlockType[] = ['write', 'opinion'];

// 정답을 교사가 반드시 골라야 하는 블록 타입 (AI가 고르거나, 비어 있으면 경고)
export const NEEDS_ANSWER_TYPES: BlockType[] = ['choice', 'multi', 'ox'];
