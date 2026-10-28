// Node.js port of validate.py
import { readFileSync, readdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const R = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const cur = JSON.parse(readFileSync(R + '/data/curriculum.json', 'utf8'));
const UNITS = new Set(cur.units.map(u => u.code));
const TYPES = new Set(['concept', 'escape', 'mystery', 'practice', 'analysis', 'discussion']);
const METHODS = new Set(['객관식', '단답형', '서술형', '빈칸 채우기', '문장 고치기', '표 채우기', '매칭', '분류하기', '순서 정하기', '이름 붙이기', '그림에서 찾기', '비교하기', '미로', '갈림길 이야기', '비트 카드', '확인 안내']);
const SITU = new Set(['wrap', 'quiz', 'level', 'focus']);

const errs = [], warns = [];
const E = (s, b, m) => errs.push(`${s}${b ? ' / ' + b : ''}: ${m}`);
const W = (s, b, m) => warns.push(`${s}${b ? ' / ' + b : ''}: ${m}`);
const perm = (x, n) => [...x].sort((a,b)=>a-b).join() === Array.from({length:n},(_,i)=>i).join();

const files = readdirSync(R + '/data/sheets').filter(f => f.endsWith('.json')).sort();
const seenUnits = {}, seenIds = new Set();

for (const fname of files) {
  const s = JSON.parse(readFileSync(R + '/data/sheets/' + fname, 'utf8'));
  const sid = s.id || fname;
  for (const k of ['id','unit','title','type','minutes','goal','keywords','situations','sections']) {
    if (!(k in s)) E(sid, '', `필드 없음 ${k}`);
  }
  if (seenIds.has(sid)) E(sid, '', 'id 중복');
  seenIds.add(sid);
  if (!UNITS.has(s.unit)) E(sid, '', `없는 단원 ${s.unit}`);
  (seenUnits[s.unit] = seenUnits[s.unit] || []).push(sid);
  if (!TYPES.has(s.type)) E(sid, '', `유형 ${s.type}`);
  if (!s.goal?.trim().match(/수 있다\.$/)) E(sid, '', '학습목표가 "~할 수 있다."로 안 끝남');
  if (s.situations && !s.situations.every(x => SITU.has(x))) E(sid, '', `상황 키 ${s.situations}`);
  const roles = s.sections?.map(x => x.role);
  if (JSON.stringify(roles) !== '["start","main","wrap"]') E(sid, '', `섹션 순서 ${roles}`);

  const bids = new Set(); const gates = [];
  for (const sec of (s.sections || [])) {
    for (const b of (sec.blocks || [])) {
      const bid = b.id, k = b.kind;
      if (bids.has(bid)) E(sid, bid, 'id 중복');
      bids.add(bid);
      if (!METHODS.has(b.method)) E(sid, bid, `활동 방법 이름 ${b.method}`);
      if (!b.prompt) E(sid, bid, '지시문 없음');
      if (b.gate) {
        gates.push(b);
        if (!String(b.reward ?? '').match(/^\d$/)) E(sid, bid, '관문 보상 숫자 1자리 필요');
      }
      try {
        if (['choice','oddone','reveal','chart'].includes(k)) {
          if (typeof b.answer !== 'number' || b.answer < 0 || b.answer >= b.options.length) throw new Error('정답 번호');
          if (new Set(b.options).size !== b.options.length) throw new Error('보기 중복');
        } else if (k === 'multi') {
          if (!b.answer?.length || !b.answer.every(i => i >= 0 && i < b.options.length)) throw new Error('정답 번호');
          if (b.answer.length >= b.options.length) throw new Error('전부 정답');
        } else if (k === 'codediff') {
          if (typeof b.answer !== 'number' || b.answer < 0 || b.answer >= b.options.length) throw new Error('정답 번호');
          if (!b.diff?.length || !b.diff.every(i => i >= 0 && i < b.b.length)) throw new Error('diff 범위');
        } else if (k === 'short') {
          if (!(Array.isArray(b.answer) ? b.answer.length : b.answer)) throw new Error('정답');
        } else if (k === 'table') {
          const cells = b.rows.flat().filter(c => typeof c === 'object');
          if (!cells.length) throw new Error('정답 칸 없음');
          for (const r of b.rows) if (r.length !== b.columns.length) throw new Error('열 수');
          for (const c of cells) {
            if (String(c.answer) === '') throw new Error('빈 정답');
            if (c.options && !c.options.includes(c.answer)) throw new Error('정답이 선택지에 없음');
          }
        } else if (['fixsentence','cloze'].includes(k)) {
          const slots = b.parts.filter(p => typeof p === 'object');
          if (!slots.length) throw new Error('슬롯 없음');
          for (const p of slots) if (!p.options.includes(p.answer)) throw new Error(`정답 ${p.answer} 없음`);
          if (k === 'fixsentence') {
            if (!slots.some(p => p.now !== p.answer)) throw new Error('처음부터 다 맞음');
            for (const p of slots) if (!p.options.includes(p.now)) throw new Error('처음 낱말이 보기에 없음');
          } else {
            for (const p of slots) if (p.now !== undefined && p.now !== null) throw new Error('빈칸은 now=null');
          }
        } else if (k === 'bitcards') {
          for (const t of b.targets) {
            const expected = t.value.toString(2).padStart(b.cards.length, '0');
            if (t.answer !== expected) throw new Error(`${t.value} 이진수`);
          }
        } else if (k === 'maze') {
          for (const st of b.steps) if (st.doors.length !== 2 || ![0,1].includes(st.answer)) throw new Error('미로 문');
        } else if (k === 'sort') {
          if (new Set(b.items.map(it=>it.t)).size !== b.items.length) throw new Error('카드 중복');
          if (!b.items.every(it => it.g >= 0 && it.g < b.groups.length)) throw new Error('그룹 번호');
          if (!b.groups.every((_, g) => b.items.some(it => it.g === g))) throw new Error('빈 그룹');
        } else if (k === 'venn') {
          if (!b.items.every(it => ['A','AB','B'].includes(it.z))) throw new Error('벤 영역');
        } else if (k === 'match') {
          if (new Set(b.left).size !== b.left.length || new Set(b.right).size !== b.right.length) throw new Error('짝 중복');
          const n = b.left.length;
          if (b.right.length !== n || !perm(b.answer, n) || !perm(b.shuffle || Array.from({length:n},(_,i)=>i), n)) throw new Error('매칭 구조');
          const sh = b.shuffle;
          if (!sh || JSON.stringify(b.answer.map((_,i)=>b.answer[i])) === JSON.stringify(sh)) throw new Error('섞기가 정답 순서와 같음');
        } else if (k === 'order') {
          if (new Set(b.items.map(x=>x.trim())).size !== b.items.length) throw new Error('같은 문장이 두 번');
          if (!perm(b.start, b.items.length) || JSON.stringify(b.start) === JSON.stringify(Array.from({length:b.items.length},(_,i)=>i))) throw new Error('시작 순서');
        } else if (k === 'label') {
          if (!b.markers.every(m => b.bank.includes(m.answer))) throw new Error('정답이 은행에 없음');
        } else if (k === 'hotspot') {
          const ids = [...b.text.matchAll(/\[\[([^|]+)\|/g)].map(m=>m[1]);
          if (!b.answer.every(a => ids.includes(a)) || ids.length <= b.answer.length) throw new Error('표시 위치');
        } else if (k === 'story') {
          const N = b.nodes;
          if (!(b.start in N)) throw new Error('start 없음');
          for (const n of Object.values(N)) for (const c of (n.choices||[])) if (!(c[1] in N)) throw new Error(`없는 장면 ${c[1]}`);
          if (!Object.values(N).some(n => n.end === 'good')) throw new Error('좋은 결말 없음');
        } else if (k === 'write') {
          const kw = b.keywords || [];
          const need = b.minKeywords ?? kw.length;
          if (kw.length && b.sample) {
            const hit = kw.filter(x => b.sample.includes(x));
            if (hit.length < need) throw new Error(`예시 답이 핵심 단어 ${need}개 미만`);
          }
        } else if (k === 'note') {
          // ok
        } else {
          E(sid, bid, `모르는 kind ${k}`);
        }
      } catch(e) {
        E(sid, bid, `${k}: ${e.message}`);
      }
      if (!('explain' in b) && !['write','note','story'].includes(k)) {
        W(sid, bid, '설명 없음');
      }
    }
  }

  if (s.type === 'escape') {
    if (gates.length < 2) E(sid, '', '관문 2개 이상');
    if (!('lock' in s)) E(sid, '', 'lock 없음');
    const w = s.sections?.[2]?.blocks;
    if (!(w?.length && w[0].kind === 'cloze' && w[0].afterLock)) E(sid, '', '탈출: 금고 속 메시지(cloze, afterLock) 필요');
    if (!s.story) E(sid, '', '탈출: 미션 글 필요');
  }
  if (s.type === 'mystery') {
    const w = s.sections?.[2]?.blocks;
    if (!(w?.length && w[0].kind === 'cloze')) E(sid, '', '추리: 사건 보고서(cloze) 필요');
    if (!s.story) E(sid, '', '추리: 사건 개요 필요');
  }
  if (!['escape','mystery'].includes(s.type)) {
    const w = s.sections?.[2]?.blocks;
    if (!(w?.length && w[0].kind === 'write')) W(sid, '', '한 줄 정리가 서술형이 아님');
  }
}

const missing = [...UNITS].filter(u => !seenUnits[u]).sort();
const dup = Object.entries(seenUnits).filter(([,v])=>v.length>1);
console.log(`활동지 ${files.length}개 · 단원 ${Object.keys(seenUnits).length}/${UNITS.size}`);
if (dup.length) console.log('단원 중복:', Object.fromEntries(dup));
if (process.argv.includes('--all') && missing.length) console.log('빠진 단원:', missing);
errs.forEach(e => console.log('ERR ', e));
warns.forEach(w => console.log('WARN', w));
process.exit(errs.length ? 1 : 0);
