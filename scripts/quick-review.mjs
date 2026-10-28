// 1단계+2단계 결과 빠른 캡처
import { chromium } from 'playwright';
import fs from 'fs';

const BASE = 'http://localhost:3001';
const OUT = 'screens/review';
if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

const PAGES = [
  { name: '00_landing',  url: '/' },
  { name: '01_home',     url: '/home' },
  { name: '03_browse',   url: '/browse' },
  { name: '12_mysheets', url: '/my-sheets' },
  { name: '11_class',    url: '/class' },
];

const browser = await chromium.launch();

for (const p of PAGES) {
  for (const width of [1440, 390]) {
    const page = await browser.newPage({ viewport: { width, height: width === 1440 ? 900 : 844 } });
    await page.goto(BASE + p.url, { waitUntil: 'networkidle', timeout: 20000 });
    if (p.url === '/home') {
      await page.evaluate(() => localStorage.setItem('activity_studio_scope', JSON.stringify({ school: '중학교', subject: '정보', done: true })));
      await page.reload({ waitUntil: 'networkidle' });
    }
    await page.waitForTimeout(800);
    await page.screenshot({ path: `${OUT}/${p.name}_${width}.png`, fullPage: true });
    console.log(`✓ ${p.name} @ ${width}px`);
    await page.close();
  }
}

await browser.close();
console.log('\n캡처 완료 →', OUT);
