/**
 * scripts/capture.ts
 * 수업활동 스튜디오 전체 화면 캡처
 * 실행: npx tsx scripts/capture.ts
 */

import { chromium, type Page, type BrowserContext } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

const BASE = 'http://localhost:3001';
const OUT  = path.resolve('screens');
const WIDTHS = [1440, 390] as const;

if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

/* ── 화면 목록 ─────────────────────────────────────────────────────────── */
interface Screen {
  num: string;
  name: string;
  path: string;
  note: string;
  setup?: (page: Page, ctx: BrowserContext) => Promise<void>;
}

const SCREENS: Screen[] = [
  /* ── 랜딩 ── */
  {
    num: '00',
    name: '랜딩_교사학생선택',
    path: '/',
    note: '앱 첫 진입 화면. 교사/학생 선택 카드.',
  },

  /* ── 교사: 홈 ── */
  {
    num: '01a',
    name: '홈_첫방문설정창',
    path: '/home',
    note: '첫 방문 시 학교급·교과 설정 모달이 열린 상태.',
    setup: async (page) => {
      // localStorage 비워서 첫 방문 상태로
      await page.evaluate(() => localStorage.removeItem('activity_studio_scope'));
      await page.reload({ waitUntil: 'networkidle' });
      await page.waitForTimeout(400);
    },
  },
  {
    num: '01b',
    name: '홈_기본',
    path: '/home',
    note: '설정 완료 후 홈 기본 상태. 검색창·추천 칩·카드 섹션.',
    setup: async (page) => {
      await page.evaluate(() =>
        localStorage.setItem('activity_studio_scope', JSON.stringify({ school: '중학교', subject: '정보', done: true }))
      );
      await page.reload({ waitUntil: 'networkidle' });
      await page.waitForTimeout(400);
    },
  },
  {
    num: '01c',
    name: '홈_범위칩_드롭다운',
    path: '/home',
    note: '홈 상단 "중학교·정보▾" 칩 클릭 → 학교급·교과 변경 드롭다운.',
    setup: async (page) => {
      await page.evaluate(() =>
        localStorage.setItem('activity_studio_scope', JSON.stringify({ school: '중학교', subject: '정보', done: true }))
      );
      await page.reload({ waitUntil: 'networkidle' });
      await page.waitForTimeout(400);
      const scopeBtn = page.locator('button', { hasText: /중학교|정보/ }).first();
      if (await scopeBtn.isVisible()) await scopeBtn.click();
      await page.waitForTimeout(300);
    },
  },
  {
    num: '02',
    name: '홈_검색결과',
    path: '/home',
    note: '검색창에 질문 입력 후 AI 결과 "잘 맞는 N개 + 나머지" 표시.',
    setup: async (page) => {
      await page.evaluate(() =>
        localStorage.setItem('activity_studio_scope', JSON.stringify({ school: '중학교', subject: '정보', done: true }))
      );
      await page.reload({ waitUntil: 'networkidle' });
      await page.waitForTimeout(400);
      const chips = page.locator('button', { hasText: '집중이 흐트러졌어요' });
      if (await chips.isVisible()) await chips.click();
      await page.waitForTimeout(800);
    },
  },

  /* ── 교사: 활동 목록 ── */
  {
    num: '03a',
    name: '활동목록_전체',
    path: '/browse',
    note: '유형 필터 칩·카드 그리드 전체 목록.',
  },
  {
    num: '03b',
    name: '활동목록_유형필터',
    path: '/browse',
    note: '탈출 게임 유형 필터 칩 선택 상태.',
    setup: async (page) => {
      await page.waitForTimeout(400);
      const chip = page.locator('button', { hasText: '탈출 게임' }).first();
      if (await chip.isVisible()) await chip.click();
      await page.waitForTimeout(300);
    },
  },

  /* ── 교사: 미리보기 ── */
  {
    num: '04',
    name: '활동_미리보기',
    path: '/worksheets/ws-cs-escape',
    note: '활동지 미리보기. 상단 바 + 정답 보기 토글 + 담아두기 버튼.',
  },
  {
    num: '04b',
    name: '활동_미리보기_정답보기',
    path: '/worksheets/ws-cs-escape',
    note: '정답 보기 토글 ON 상태.',
    setup: async (page) => {
      await page.waitForTimeout(400);
      const btn = page.locator('button', { hasText: '정답 보기' }).first();
      if (await btn.isVisible()) await btn.click();
      await page.waitForTimeout(300);
    },
  },

  /* ── 교사: 고쳐서 배포 ── */
  {
    num: '05a',
    name: '고쳐서배포_1단계_내용수정',
    path: '/worksheets/ws-cs-escape/edit',
    note: '1단계: 편집 탭. 왼쪽 미리보기 + 오른쪽 [편집|AI로 고치기] 탭.',
  },
  {
    num: '05b',
    name: '고쳐서배포_1단계_AI탭',
    path: '/worksheets/ws-cs-escape/edit',
    note: '1단계: AI로 고치기 탭 선택 상태.',
    setup: async (page) => {
      await page.waitForTimeout(400);
      const aiTab = page.locator('button', { hasText: 'AI로 고치기' }).first();
      if (await aiTab.isVisible()) await aiTab.click();
      await page.waitForTimeout(300);
    },
  },
  {
    num: '05c',
    name: '고쳐서배포_2단계_정답수정',
    path: '/worksheets/ws-cs-escape/edit',
    note: '2단계: 정답 수정 화면.',
    setup: async (page) => {
      await page.waitForTimeout(500);
      const next = page.locator('button', { hasText: '다음' }).first();
      if (await next.isVisible()) await next.click();
      await page.waitForTimeout(300);
    },
  },
  {
    num: '05d',
    name: '고쳐서배포_3단계_저장',
    path: '/worksheets/ws-cs-escape/edit',
    note: '3단계: 내 자료에 저장 + 공유 토글.',
    setup: async (page) => {
      await page.waitForTimeout(500);
      for (let i = 0; i < 2; i++) {
        const next = page.locator('button', { hasText: '다음' }).first();
        if (await next.isVisible()) { await next.click(); await page.waitForTimeout(300); }
      }
    },
  },

  /* ── 교사: 배포 ── */
  {
    num: '07a',
    name: '배포_설정',
    path: '/worksheets/ws-cs-escape/deploy',
    note: '배포 설정. 대상 반·방식·마감·힌트 설정.',
  },
  {
    num: '07b',
    name: '배포_완료',
    path: '/worksheets/ws-cs-escape/deploy',
    note: '배포 완료. QR코드·링크·수업 코드.',
    setup: async (page) => {
      await page.waitForTimeout(500);
      const btn = page.locator('button', { hasText: '배포' }).last();
      if (await btn.isVisible()) await btn.click();
      await page.waitForTimeout(500);
    },
  },

  /* ── 교사: 내 자료 ── */
  {
    num: '12a',
    name: '내자료_담아둔',
    path: '/my-sheets',
    note: '내 자료 > 담아둔 탭. 스탯 스트립 + 카드.',
    setup: async (page) => {
      await page.evaluate(() =>
        localStorage.setItem('activity_studio_scope', JSON.stringify({ school: '중학교', subject: '정보', done: true }))
      );
      await page.reload({ waitUntil: 'networkidle' });
      await page.waitForTimeout(400);
    },
  },
  {
    num: '12b',
    name: '내자료_수정한',
    path: '/my-sheets',
    note: '내 자료 > 수정한 탭. (localStorage 없으면 빈 상태)',
    setup: async (page) => {
      await page.waitForTimeout(400);
      const tab = page.locator('button', { hasText: '수정한' }).first();
      if (await tab.isVisible()) await tab.click();
      await page.waitForTimeout(300);
    },
  },
  {
    num: '12c',
    name: '내자료_직접만든',
    path: '/my-sheets',
    note: '내 자료 > 직접 만든 탭.',
    setup: async (page) => {
      await page.waitForTimeout(400);
      const tab = page.locator('button', { hasText: '직접 만든' }).first();
      if (await tab.isVisible()) await tab.click();
      await page.waitForTimeout(300);
    },
  },

  /* ── 교사: 활동지 만들기 ── */
  {
    num: '06a',
    name: '만들기_1단계_유형선택',
    path: '/my-sheets/new',
    note: '활동지 만들기 1단계: 유형 카드 7개.',
  },
  {
    num: '06b',
    name: '만들기_2단계_문항추가',
    path: '/my-sheets/new',
    note: '활동지 만들기 2단계: 문항 추가.',
    setup: async (page) => {
      await page.waitForTimeout(500);
      // 유형 카드 중 '탈출 게임' 클릭
      const typeCard = page.locator('button', { hasText: '탈출 게임' }).first();
      if (await typeCard.isVisible()) await typeCard.click();
      await page.waitForTimeout(300);
      // 활성화된 다음 버튼 클릭
      const next = page.locator('button:not([disabled])', { hasText: '다음' }).first();
      if (await next.isVisible()) await next.click();
      await page.waitForTimeout(400);
    },
  },

  /* ── 교사: 수업 관리 ── */
  {
    num: '11a',
    name: '수업관리_수업현황',
    path: '/class',
    note: '수업 관리 > 수업 현황 탭. 스탯 스트립 + 3개 수업 카드.',
  },
  {
    num: '11b',
    name: '수업관리_현황카드_펼침',
    path: '/class',
    note: '수업 중 카드 "현황 보기" 클릭 → 칸반 펼침.',
    setup: async (page) => {
      await page.waitForTimeout(400);
      const btn = page.locator('button', { hasText: '현황 보기' }).first();
      if (await btn.isVisible()) await btn.click();
      await page.waitForTimeout(400);
    },
  },
  {
    num: '11c',
    name: '수업관리_피드백_펼침',
    path: '/class',
    note: '"피드백 보내기" 클릭 → 학생 카드 펼침.',
    setup: async (page) => {
      await page.waitForTimeout(400);
      const btn = page.locator('button', { hasText: '피드백 보내기' }).first();
      if (await btn.isVisible()) await btn.click();
      await page.waitForTimeout(400);
    },
  },
  {
    num: '11d',
    name: '수업관리_재제출_펼침',
    path: '/class',
    note: '"재제출 확인" 클릭 → 3열 카드 펼침.',
    setup: async (page) => {
      await page.waitForTimeout(400);
      const btn = page.locator('button', { hasText: '재제출 확인' }).first();
      if (await btn.isVisible()) await btn.click();
      await page.waitForTimeout(400);
    },
  },
  {
    num: '11e',
    name: '수업관리_수업기록',
    path: '/class',
    note: '수업 기록 탭. AI 질문창 + 반별 결과 + 학생별 기록 패널.',
    setup: async (page) => {
      await page.waitForTimeout(400);
      const tab = page.locator('button', { hasText: '수업 기록' }).first();
      if (await tab.isVisible()) await tab.click();
      await page.waitForTimeout(300);
    },
  },
  {
    num: '11f',
    name: '수업관리_AI필터_적용',
    path: '/class',
    note: '수업 기록 탭에서 AI 빠른 질문 클릭 → 필터 결과.',
    setup: async (page) => {
      await page.waitForTimeout(400);
      const tab = page.locator('button', { hasText: '수업 기록' }).first();
      if (await tab.isVisible()) await tab.click();
      await page.waitForTimeout(300);
      const chip = page.locator('button', { hasText: '1반만 보기' }).first();
      if (await chip.isVisible()) await chip.click();
      await page.waitForTimeout(800);
    },
  },

  /* ── 교사: 학생 화면 미리보기 ── */
  {
    num: '13',
    name: '학생화면_미리보기',
    path: '/student-preview',
    note: '교사가 학생 화면을 미리 보는 뷰.',
  },

  /* ── 학생 화면 ── */
  {
    num: 'S01',
    name: '학생_수업코드입력',
    path: '/s',
    note: '학생 진입. 수업 코드 입력 화면.',
  },
  {
    num: 'S02',
    name: '학생_이름입력',
    path: '/s/T7Y75',
    note: '수업 코드 T7Y75 입력 후 반·번호·이름 입력 화면.',
  },
  {
    num: 'S03',
    name: '학생_홈대시보드',
    path: '/s/T7Y75/home',
    note: '학생 홈: 배포된 활동 카드(미제출/제출/피드백 상태) + 내 활동 기록.',
    setup: async (page) => {
      await page.evaluate(() =>
        localStorage.setItem('as_student_T7Y75', JSON.stringify({ cls: '2반', num: '15', name: '이서연' }))
      );
      await page.reload({ waitUntil: 'networkidle' });
      await page.waitForTimeout(400);
    },
  },
  {
    num: 'S04',
    name: '학생_활동지',
    path: '/s/T7Y75/activity',
    note: '학생 활동지 풀기 화면.',
    setup: async (page) => {
      await page.evaluate(() =>
        localStorage.setItem('as_student_T7Y75', JSON.stringify({ cls: '2반', num: '15', name: '이서연' }))
      );
      await page.reload({ waitUntil: 'networkidle' });
      await page.waitForTimeout(500);
    },
  },
  {
    num: 'S05',
    name: '학생_결과',
    path: '/s/T7Y75/result',
    note: '제출 후 결과 화면. 자동 확인 + 피드백 표시.',
    setup: async (page) => {
      await page.evaluate(() =>
        localStorage.setItem('as_student_T7Y75', JSON.stringify({ cls: '2반', num: '15', name: '이서연' }))
      );
      await page.reload({ waitUntil: 'networkidle' });
      await page.waitForTimeout(500);
    },
  },
];

/* ── 캡처 실행 ─────────────────────────────────────────────────────────── */
async function capture() {
  const browser = await chromium.launch({ headless: true });

  for (const w of WIDTHS) {
    const label = w === 1440 ? '1440' : '390';
    console.log(`\n━━━ ${w}px ━━━`);

    for (const screen of SCREENS) {
      const ctx = await browser.newContext({
        viewport: { width: w, height: w === 1440 ? 900 : 844 },
        deviceScaleFactor: 1,
      });
      const page = await ctx.newPage();

      try {
        await page.goto(`${BASE}${screen.path}`, { waitUntil: 'networkidle', timeout: 15000 });
        await page.waitForTimeout(300);

        if (screen.setup) {
          await screen.setup(page, ctx);
        }

        const filename = `${screen.num}_${screen.name}_${label}.png`;
        const filepath = path.join(OUT, filename);
        await page.screenshot({ path: filepath, fullPage: true });
        console.log(`  ✓ ${filename}`);
      } catch (e) {
        console.error(`  ✗ ${screen.num}_${screen.name}_${label}: ${(e as Error).message}`);
      } finally {
        await ctx.close();
      }
    }
  }

  await browser.close();
  console.log('\n✅ 캡처 완료');
}

capture().catch(console.error);
