import type { Sheet, Block, SheetType, ChoiceBlock, MultiBlock, PictureBlock, OrderBlock, WriteBlock, OxBlock, BlankBlock, LineBlock, SortBlock, DataBlock, LockBlock, OpinionBlock } from './types';

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

/* ─ 빈 블록 생성 ─ */
export function createEmptyBlock(type: Block['type']): Block {
  const base = { id: uid(), q: '', hint: '', hintOn: false };
  switch (type) {
    case 'choice':  return { ...base, type, opts: ['', '', ''], ans: -1 };
    case 'multi':   return { ...base, type, opts: ['', '', '', ''], ans: [] };
    case 'picture': return { ...base, type, items: [{ img: '', a: '' }, { img: '', a: '' }, { img: '', a: '' }] };
    case 'line':    return { ...base, type, cols: ['', ''], pairs: [['', ''], ['', ''], ['', '']] };
    case 'order':   return { ...base, type, img: '', noImg: false, steps: ['', '', '', ''] };
    case 'ox':      return { ...base, type, ans: '' };
    case 'short':   return { ...base, type, a: '' };
    case 'blank':   return { ...base, type, sent: '', a: '' };
    case 'sort':    return { ...base, type, g: ['', ''], items: ['', '', '', ''], gi: [0, 0, 1, 1] };
    case 'write':   return { ...base, type, kw: [], ex: '' };
    case 'data':    return { ...base, type, img: '', noImg: false, cols: ['', ''], rows: [['', ''], ['', ''], ['', '']], a: '' };
    case 'lock':    return { ...base, type, locks: [{ q: '', a: '' }, { q: '', a: '' }, { q: '', a: '' }] };
    case 'opinion': return { ...base, type, st: ['', ''], ex: '' };
  }
}

/* ─ 빈 시트 생성 ─ */
export function createEmptySheet(type: SheetType): Sheet {
  const id = 'my-' + Date.now();
  const defaultBlocks: Block['type'][] = type === 'concept'
    ? ['choice', 'picture', 'order', 'multi', 'write']
    : [];

  return {
    id,
    type,
    info: { unit: '', title: '', goal: '', img: '' },
    blocks: defaultBlocks.map(t => createEmptyBlock(t)),
    share: 'none',
    sourceChecked: false,
    createdBy: 'me',
    createdAt: new Date().toISOString().slice(0, 10),
  };
}

/* ─ 예시 자료 미리보기 ─ */
export const DEMO_MATERIAL_CONCEPT = {
  fileName: '조건문_수업자료.pdf',
  pages: 3,
  excerpt: [
    { text: '[조건문]은 조건이 [참이면] 정해진 명령을 실행하고, [거짓이면] 다른 명령을 실행하는 구조이다.' },
    { text: '예: 놀이공원 입장료는 [13세 이하이면 5,000원], 그 밖에는 10,000원이다. 비가 오면 우산을 챙긴다.' },
  ],
};

export const DEMO_MATERIAL_FREE = {
  fileName: '개인정보보호_수업자료.pdf',
  pages: 4,
  excerpt: [
    { text: '[개인정보]는 이름·전화번호·주소처럼 [나를 알아볼 수 있는 정보]이다.' },
    { text: '비밀번호는 [길게], 영어 대·소문자·숫자·기호를 [섞어서] 만들고, 생일이나 전화번호는 쓰지 않는다.' },
  ],
};

/* ─ AI 채우기 결과: 개념 확인 (조건문) ─ */
export const AI_FILL_CONCEPT: {
  info: Sheet['info'];
  blocks: Partial<Block>[];
} = {
  info: {
    unit: 'Ⅱ-2-03 조건문 이해하기',
    title: '조건에 따라 달라지는 입장료',
    goal: '조건문의 구조를 이해하고, 조건에 따라 달라지는 결과를 판단할 수 있다.',
    img: 'ai-concept',
  },
  blocks: [
    // choice
    {
      q: '놀이공원 입장료는 13세 이하이면 5,000원, 그 밖에는 10,000원이에요. 12세 학생의 입장료는?',
      opts: ['5,000원', '10,000원', '15,000원'],
      ans: 0,
      hint: '12는 13 이하인가요?',
      hintOn: true,
      aiAnswered: true,
      aiChecked: false,
      aiFields: ['q', 'opts', 'ans', 'hint'],
    } as Partial<ChoiceBlock>,
    // picture
    {
      q: '그림 속 상황에서 무엇을 판단하는지, "조건"을 쓰세요.',
      items: [
        { img: 'traffic', a: '신호등이 초록불인가?' },
        { img: 'rain', a: '비가 오는가?' },
        { img: 'lunch', a: '점심시간인가?' },
      ],
      hint: '"만약 ~라면"에서 ~에 들어갈 부분이 조건이에요.',
      hintOn: true,
      aiFields: ['q', 'items', 'hint'],
    } as Partial<PictureBlock>,
    // order
    {
      q: '입장료를 계산하는 순서를 정하세요.',
      steps: [
        '나이를 입력받는다',
        '나이가 13세 이하인지 판단한다',
        '참이면 5,000원, 거짓이면 10,000원으로 정한다',
        '입장료를 화면에 출력한다',
      ] as [string, string, string, string],
      hint: '판단은 입력을 받은 다음에 해요.',
      hintOn: true,
      noImg: true,
      aiFields: ['q', 'steps', 'hint'],
    } as Partial<OrderBlock>,
    // multi
    {
      q: '조건문에 대한 설명으로 옳은 것을 모두 고르세요.',
      opts: [
        '조건이 참일 때 실행할 명령을 정할 수 있다',
        '조건이 거짓일 때 실행할 명령을 따로 정할 수 있다',
        '조건문은 같은 명령을 계속 반복한다',
        '조건에는 비교(>, <, ==)를 자주 쓴다',
      ],
      ans: [0, 1, 3],
      hint: '"반복"은 다른 구조예요.',
      hintOn: true,
      aiAnswered: true,
      aiChecked: false,
      aiFields: ['q', 'opts', 'ans', 'hint'],
    } as Partial<MultiBlock>,
    // write
    {
      q: '학교생활에서 조건문을 쓸 수 있는 상황을 "만약"과 "그렇지 않으면"을 넣어 한 문장으로 써 보세요.',
      kw: ['만약', '그렇지 않으면'],
      ex: '만약 점심시간이면 급식실 문을 열고, 그렇지 않으면 문을 닫는다',
      aiFields: ['q', 'kw', 'ex'],
    } as Partial<WriteBlock>,
  ],
};

/* ─ AI 채우기 결과: 자유형 6개 (개인정보보호) ─ */
export const AI_FILL_FREE_6: {
  info: Sheet['info'];
  blocks: Block[];
} = {
  info: {
    unit: 'Ⅰ-2-02 개인정보 보호와 정보 보안',
    title: '해킹당하지 않는 비밀번호 만들기',
    goal: '안전한 비밀번호의 조건을 알고, 자료를 근거로 나만의 비밀번호 규칙을 만들 수 있다.',
    img: '',
  },
  blocks: [
    {
      id: uid(), type: 'ox',
      q: '생일이나 전화번호를 넣은 비밀번호는 안전하다.',
      ans: 'X', hint: '다른 사람이 쉽게 알 수 있는 정보인지 생각해 보세요.', hintOn: true,
      aiMade: true, aiAnswered: true, aiChecked: false,
      aiFields: ['q', 'ans', 'hint'],
    } as OxBlock,
    {
      id: uid(), type: 'blank',
      q: '아래 문장에서 빈칸을 채우세요.',
      sent: '비밀번호는 길이가 [길수록], 여러 종류의 문자를 섞을수록 알아내기 어렵다.',
      a: '길수록', hint: '자료의 표에서 자리 수가 늘면 시간이 어떻게 되나요?', hintOn: true,
      aiMade: true, aiFields: ['q', 'sent', 'a', 'hint'],
    } as BlankBlock,
    {
      id: uid(), type: 'line',
      q: '보안 위협과 알맞은 대처를 선으로 이으세요.',
      cols: ['보안 위협', '알맞은 대처'],
      pairs: [
        ['모르는 번호로 온 링크 문자', '링크를 누르지 않고 지운다'],
        ['비밀번호를 옆에서 엿보기', '입력할 때 화면을 가린다'],
        ['학교 공용 컴퓨터 사용', '쓰고 나서 꼭 로그아웃한다'],
        ['가입한 사이트 정보 유출', '비밀번호를 바로 바꾼다'],
      ],
      hint: '', hintOn: false,
      aiMade: true, aiFields: ['q', 'cols', 'pairs'],
    } as LineBlock,
    {
      id: uid(), type: 'data',
      q: '표는 비밀번호 종류에 따라 알아내는 데 걸리는 시간이에요(예시 자료). 가장 안전한 비밀번호는 무엇이고, 그 까닭은 무엇인가요?',
      img: '', noImg: true,
      cols: ['비밀번호 종류', '알아내는 데 걸리는 시간'],
      rows: [
        ['숫자 6자리', '바로'],
        ['영어 소문자 8자리', '몇 분'],
        ['영어 대·소문자 + 숫자 8자리', '몇 시간'],
        ['대·소문자 + 숫자 + 기호 12자리', '수천 년'],
      ],
      a: '대·소문자, 숫자, 기호를 섞은 12자리 비밀번호. 길고 문자 종류가 많을수록 알아내는 데 오래 걸리기 때문이다.',
      hint: '자리 수와 문자 종류, 두 가지를 같이 보세요.', hintOn: true,
      aiMade: true, aiFields: ['q', 'rows', 'a', 'hint'],
    } as DataBlock,
    {
      id: uid(), type: 'lock',
      q: '세 문제를 풀어 자물쇠 번호를 찾으세요.',
      locks: [
        { q: '비밀번호로 가장 알맞은 것의 번호는? ① 0704(생일) ② 하늘색자전거타는날!7 ③ 123456', a: '2' },
        { q: '비밀번호는 최소 몇 자리 이상으로 만드는 것이 좋을까요? (4 또는 8)', a: '8' },
        { q: '개인정보가 아닌 것의 번호는? ① 이름 ② 전화번호 ③ 오늘 날씨', a: '3' },
      ],
      hint: '답은 모두 숫자 1개예요.', hintOn: true,
      aiMade: true, aiFields: ['q', 'locks', 'hint'],
    } as LockBlock,
    {
      id: uid(), type: 'opinion',
      q: '친한 친구에게는 내 비밀번호를 알려 줘도 될까요? 입장을 고르고 근거를 2가지 쓰세요.',
      st: ['알려 줘도 된다', '알려 주면 안 된다'],
      ex: '알려 주면 안 된다. 친구 휴대폰이 해킹되면 내 계정도 위험해지고, 사이가 달라지면 내 정보를 지킬 수 없기 때문이다.',
      hint: '', hintOn: false,
      aiMade: true, aiFields: ['q', 'st', 'ex'],
    } as OpinionBlock,
  ],
};

/* ─ 자유형 문항 수별 기본 구성 ─ */
export const FREE_BLOCK_TEMPLATES: Record<5 | 6 | 7, Block['type'][]> = {
  5: ['ox', 'blank', 'data', 'lock', 'opinion'],
  6: ['ox', 'blank', 'line', 'data', 'lock', 'opinion'],
  7: ['ox', 'blank', 'line', 'sort', 'data', 'lock', 'opinion'],
};
