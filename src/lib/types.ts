/**
 * 수업 유형 디자인 데이터
 * 유형 이름·색·픽셀 그림을 한 곳에서 관리합니다.
 * 바꿀 때는 이 파일만 수정하면 전체에 반영됩니다.
 */

export type TypeKey =
  | 'concept'
  | 'practice'
  | 'mystery'
  | 'escape'
  | 'analysis'
  | 'discussion';

export interface TypeInfo {
  name: string;   // 화면에 표시할 이름
  c: string;      // 대표 색 (#hex)
  d: string;      // 짧은 설명
  n: number;      // 활동지 수
  /** 픽셀 아트: 12×10 그리드. '1'=대표색, '2'=연한색, '3'=흰색, '.'=빈칸 */
  art: string[];
}

export const TYPES: Record<TypeKey, TypeInfo> = {
  concept: {
    name: '개념 확인', c: '#4263eb', d: '배운 개념을 예측하고 실행해 확인', n: 9,
    art: [
      '....1111....',
      '...122221...',
      '..12233221..',
      '..12233221..',
      '..12222221..',
      '...122221...',
      '....1221....',
      '....1111....',
      '....1331....',
      '.....11.....',
    ],
  },
  practice: {
    name: '실습 기록', c: '#0ca678', d: '만들고 기록하며 고칠 점 찾기', n: 5,
    art: [
      '.1.1.1.1.1..',
      '11111111111.',
      '12222222221.',
      '12111122221.',
      '12133122321.',
      '12133122221.',
      '12111122221.',
      '12222222221.',
      '11111111111.',
      '.1.1.1.1.1..',
    ],
  },
  mystery: {
    name: '추리 게임', c: '#7048e8', d: '단서를 모아 사건의 원인 밝히기', n: 6,
    art: [
      '...1111.....',
      '..133221....',
      '.13222221...',
      '.12222221...',
      '.12222221...',
      '..122221....',
      '...1111.1...',
      '........11..',
      '.........11.',
      '..........1.',
    ],
  },
  escape: {
    name: '탈출 게임', c: '#e8890c', d: '관문을 풀고 번호를 모아 탈출', n: 6,
    art: [
      '....1111....',
      '...1....1...',
      '...1....1...',
      '..11111111..',
      '..12222221..',
      '..12211221..',
      '..12211221..',
      '..12221221..',
      '..12222221..',
      '..11111111..',
    ],
  },
  analysis: {
    name: '자료 분석', c: '#1098ad', d: '자료를 정리하고 근거로 주장', n: 5,
    art: [
      '..........3.',
      '........113.',
      '........11..',
      '.....11.11..',
      '.....11.11..',
      '..22.11.11..',
      '..22.11.11..',
      '..22.22.22..',
      '..22.22.22..',
      '.1111111111.',
    ],
  },
  discussion: {
    name: '토론·의견', c: '#d6336c', d: '상황을 판단하고 근거 나누기', n: 3,
    art: [
      '1111111.....',
      '1222221.....',
      '1233321.....',
      '1222221.....',
      '11.1111111..',
      '1..1222221..',
      '...1233321..',
      '...1222221..',
      '...111111.1.',
      '..........1.',
    ],
  },
};

export const ORDER: TypeKey[] = [
  'concept', 'practice', 'mystery', 'escape', 'analysis', 'discussion',
];

/**
 * 두 색을 섞는다 (w=1: t 색으로, w=0: hex 색 유지)
 * hex: 대표색, w: 흰색(t=255) 방향 비율, t: 목표 채널값(기본 255=흰색)
 */
export function mix(hex: string, w: number, t = 255): string {
  const n = parseInt(hex.slice(1), 16);
  const r = n >> 16, g = (n >> 8) & 255, b = n & 255;
  const m = (v: number) => Math.round(v + (t - v) * w);
  return '#' + [m(r), m(g), m(b)].map(v => v.toString(16).padStart(2, '0')).join('');
}

/**
 * TypeCover에서 사용할 픽셀 셀 목록을 반환한다.
 * 렌더링은 TypeCover 컴포넌트가 담당한다.
 */
export function getCoverCells(
  type: TypeKey,
  opts: { h?: number; px?: number; shift?: number } = {},
): Array<{ x: number; y: number; fill: string }> {
  const T = TYPES[type];
  const H = opts.h ?? 180;
  const W = 320;
  const px = opts.px ?? Math.floor(Math.min((H * 0.62) / 10, 15));
  const aw = 12 * px, ah = 10 * px;
  const ox = Math.round(W / 2 - aw / 2 + (opts.shift ?? 0));
  const oy = Math.round(H / 2 - ah / 2);

  const cells: Array<{ x: number; y: number; fill: string }> = [];
  T.art.forEach((row, y) => {
    [...row].forEach((ch, x) => {
      const fill =
        ch === '1' ? T.c :
        ch === '2' ? mix(T.c, 0.45) :
        ch === '3' ? '#ffffff' :
        null;
      if (fill) cells.push({ x: ox + x * px, y: oy + y * px, fill });
    });
  });
  return cells;
}

/** 유형 태그에 쓸 글자 색 (탈출 게임은 진한 갈색 처리) */
export function typeInkColor(type: TypeKey): string {
  return type === 'escape' ? '#8a4b00' : TYPES[type].c;
}
