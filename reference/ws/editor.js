/* 고쳐서 배포 · 내용 수정 시제품: 왼쪽 미리보기 + 오른쪽 [편집 | AI로 고치기] */
(function () {
  'use strict';
  const clone = o => JSON.parse(JSON.stringify(o));
  const $ = s => document.querySelector(s);
  function h(tag, attrs, kids) {
    const el = document.createElement(tag);
    if (attrs) for (const k in attrs) {
      const v = attrs[k];
      if (v == null || v === false) continue;
      if (k === 'class') el.className = v;
      else if (k === 'html') el.innerHTML = v;
      else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
      else el.setAttribute(k, v === true ? '' : v);
    }
    [].concat(kids || []).forEach(c => { if (c == null || c === false) return; el.append(c.nodeType ? c : document.createTextNode(c)); });
    return el;
  }

  const ORIG = clone(window.SHEETS);
  const ST = ORIG.map(s => ({ sheet: clone(s), sel: null, tab: 'edit', check: new Set(), hist: [], chat: [], prop: null }));
  let ci = 0;
  const S = () => ST[ci];
  const WRAP_NAME = { escape: '금고 속 메시지', mystery: '사건 보고서' };

  function find(sheet, id) {
    for (const sec of sheet.sections) { const i = sec.blocks.findIndex(b => b.id === id); if (i >= 0) return { b: sec.blocks[i], sec, i }; }
    return null;
  }
  function gateNo(sheet, id) { let n = 0; for (const sec of sheet.sections) for (const b of sec.blocks) { if (b.gate && !b.hidden) n++; if (b.id === id) return b.hidden ? '숨김' : n; } return ''; }
  function snapshot() { const s = S(); s.hist.push({ sheet: clone(s.sheet), check: [...s.check] }); if (s.hist.length > 40) s.hist.shift(); paintTop(); }

  /* ---------- top bar ---------- */
  function paintTop() {
    const tabs = $('#tabs'); tabs.innerHTML = '';
    ST.forEach((s, i) => tabs.append(h('button', { type: 'button', 'aria-pressed': String(i === ci), title: s.sheet.title, onclick: () => { ci = i; all(); } }, WS.TYPE[s.sheet.type][0])));
    $('#undo').disabled = !S().hist.length;
    const n = S().hist.length;
    $('#chg').textContent = n ? `고친 횟수 ${n}` : '아직 고친 곳 없음';
  }
  $('#undo').onclick = () => { const s = S(); const p = s.hist.pop(); if (!p) return; s.sheet = p.sheet; s.check = new Set(p.check); s.prop = null; all(); };
  $('#reset').onclick = () => { const s = S(); if (!s.hist.length) return; if (!confirm('이 활동지를 원본으로 되돌릴까요? 고친 내용이 모두 사라져요.')) return; s.sheet = clone(ORIG[ci]); s.check.clear(); s.hist = []; s.prop = null; s.chat.push({ who: 'sys', t: '원본으로 되돌렸어요.' }); all(); };

  /* ---------- preview ---------- */
  function paintPreview() {
    const s = S();
    const view = s.prop ? s.prop.sheet : s.sheet;
    const marks = {};
    if (s.prop) { s.prop.changed.forEach(id => marks[id] = 'ai'); s.prop.ans.forEach(id => marks[id] = 'aians'); }
    else s.check.forEach(id => marks[id] = 'check');
    WS.render(clone(view), $('#preview'), {
      answers: true, unitLabel: c => (window.UNITS || {})[c] || c,
      edit: { selected: s.sel, marks, onSelect: id => { s.sel = id; paintPreview(); paintPanel(); } }
    });
    if (s.sel) { const el = document.querySelector(`[data-b="${s.sel}"]`); if (el) { const r = el.getBoundingClientRect(); if (r.top < 70 || r.bottom > innerHeight) el.scrollIntoView({ block: 'center', behavior: 'smooth' }); } }
  }

  /* ---------- panel ---------- */
  function paintPanel() {
    const s = S();
    const f = s.sel ? find(s.sheet, s.sel) : null;
    const target = $('#target');
    target.innerHTML = '';
    target.append(h('span', { class: 'tg-l' }, '대상'), h('span', { class: 'tg-chip' + (f ? '' : ' all') }, [f ? (f.b.gate ? `관문 ${gateNo(s.sheet, f.b.id)} · ` : '') + f.b.method : '활동지 전체', f ? h('button', { type: 'button', 'aria-label': '대상 해제', onclick: () => { s.sel = null; paintPreview(); paintPanel(); } }, '✕') : null]));
    document.querySelectorAll('#ptabs button').forEach(b => b.setAttribute('aria-selected', String(b.dataset.t === s.tab)));
    const body = $('#pbody'); body.innerHTML = '';
    if (s.tab === 'edit') body.append(f ? editBlock(f) : editSheet()); else body.append(aiPane(f));
  }
  document.querySelectorAll('#ptabs button').forEach(b => b.onclick = () => { S().tab = b.dataset.t; paintPanel(); });

  /* field helpers */
  let pending = null;
  function onFocus() { pending = clone(S().sheet); pending.__check = [...S().check]; }
  function commit() { if (!pending) return; const s = S(); s.hist.push({ sheet: pending, check: pending.__check }); delete pending.__check; pending = null; paintTop(); }
  function tie(id) { S().check.add(id); paintCheckBanner(id); }
  function inp(value, on, o) {
    o = o || {};
    const el = h(o.area ? 'textarea' : 'input', { class: 'fi' + (o.small ? ' sm' : ''), rows: o.area ? (o.rows || 2) : null, type: o.area ? null : (o.num ? 'number' : 'text'),
      onfocus: onFocus, onchange: commit,
      oninput: e => { on(e.target.value); if (o.tied) tie(o.tied); paintPreview(); } });
    el.value = value == null ? '' : value;
    return el;
  }
  function field(label, control, help) { return h('div', { class: 'fld' }, [h('label', { class: 'fl' }, label), control, help ? h('div', { class: 'fh' }, help) : null]); }
  function group(title, kids, note) { return h('div', { class: 'grp' }, [h('div', { class: 'gt' }, title), note ? h('div', { class: 'fh' }, note) : null].concat(kids)); }
  function pick(type, name, checked, on, label) {
    return h('label', { class: 'pk', title: label }, [h('input', { type, name, checked: checked || null, onfocus: onFocus, onchange: e => { on(e.target.checked); commit(); clearCheck(); paintPreview(); } }), h('span', null, label)]);
  }
  let curId = null;
  function clearCheck() { if (curId && S().check.has(curId)) { /* 교사가 정답을 직접 고르면 확인한 것으로 봄 */ S().check.delete(curId); paintCheckBanner(curId); } }
  function paintCheckBanner(id) {
    const ban = document.getElementById('ckban');
    if (!ban) return;
    const on = S().check.has(id);
    ban.style.display = on ? 'flex' : 'none';
  }

  function editBlock(f) {
    const s = S(), b = f.b; curId = b.id;
    const wrap = h('div');
    const secBlocks = f.sec.blocks;
    wrap.append(h('div', { class: 'bh' }, [
      h('div', null, [h('div', { class: 'bm' }, b.method), h('div', { class: 'fh' }, `활동 방법은 바꿀 수 없어요. 내용만 고칠 수 있어요.`)]),
      h('div', { class: 'bh-act' }, [
        h('button', { class: 'ib', type: 'button', 'aria-label': '위로', disabled: f.i === 0 || null, onclick: () => move(f, -1) }, '↑'),
        h('button', { class: 'ib', type: 'button', 'aria-label': '아래로', disabled: f.i === secBlocks.length - 1 || null, onclick: () => move(f, 1) }, '↓'),
        h('button', { class: 'ib wide', type: 'button', onclick: () => { snapshot(); b.hidden = !b.hidden; all(); } }, b.hidden ? '다시 보이기' : '숨기기')
      ])
    ]));
    if (b.hidden) { wrap.append(h('div', { class: 'hidden-note' }, '숨긴 문항이에요. 학생 화면에 나오지 않아요. 원본에서 지워지지는 않아요.')); return wrap; }
    const ban = h('div', { id: 'ckban', class: 'ckban', style: 'display:none' }, [h('span', null, '보기나 숫자가 바뀌었어요. 정답이 맞는지 확인해 주세요.'), h('button', { class: 'btn sm', type: 'button', onclick: () => { s.check.delete(b.id); paintCheckBanner(b.id); paintPreview(); } }, '정답 확인했어요')]);
    wrap.append(ban);
    wrap.append(field('지시문', inp(b.prompt, v => b.prompt = v, { area: true })));
    wrap.append(kindFields(b));
    if ('hint' in b) wrap.append(field('힌트', inp(b.hint, v => b.hint = v, { area: true })));
    if ('explain' in b) wrap.append(field('설명 (정답을 맞힌 뒤 학생에게 보임)', inp(b.explain, v => b.explain = v, { area: true })));
    wrap.append(h('button', { class: 'tolink', type: 'button', onclick: () => { s.tab = 'ai'; paintPanel(); } }, '말로 설명해서 고치기 →'));
    setTimeout(() => paintCheckBanner(b.id), 0);
    return wrap;
  }
  function move(f, d) { snapshot(); const a = f.sec.blocks; const j = f.i + d; [a[f.i], a[j]] = [a[j], a[f.i]]; all(); }

  function kindFields(b) {
    const id = b.id, box = h('div');
    const opts = (multi, extra) => {
      const name = 'ans-' + id;
      return group(extra || '보기와 정답', b.options.map((o, i) => h('div', { class: 'orow' }, [
        pick(multi ? 'checkbox' : 'radio', name, multi ? b.answer.includes(i) : b.answer === i, on => {
          if (multi) { const set = new Set(b.answer); on ? set.add(i) : set.delete(i); b.answer = [...set].sort(); } else b.answer = i;
        }, '정답'),
        inp(o, v => b.options[i] = v, { tied: id })
      ])), '정답 표시를 바꾸려면 왼쪽 동그라미를 누르세요.');
    };
    const codeEd = (lines, title) => group(title, lines.map(l => h('div', { class: 'orow' }, [h('span', { class: 'ind' }, '·'.repeat(l.d + 1)), inp(l.t, v => l.t = v, { tied: id })])));
    switch (b.kind) {
      case 'short': box.append(field('정답 (여러 개면 쉼표로 구분)', inp([].concat(b.answer).join(', '), v => { b.answer = v.split(',').map(x => x.trim()).filter(Boolean); clearCheck(); }), '띄어쓰기와 쉼표는 무시하고 비교해요.')); if ('unit' in b) box.append(field('단위', inp(b.unit, v => b.unit = v, { small: true }))); break;
      case 'choice': case 'oddone': case 'reveal': box.append(opts(false)); if (b.kind === 'reveal') box.append(h('div', { class: 'fh' }, '가려진 그림은 준비된 그림 중에서 고르게 할 예정이에요 (프로토타입에서는 고정).')); break;
      case 'multi': box.append(opts(true)); break;
      case 'chart':
        box.append(group('그래프 값', b.bars.map(x => h('div', { class: 'orow' }, [h('span', { class: 'lb' }, x.label), inp(x.sub, v => x.sub = v, { tied: id, small: true }), inp(x.v, v => x.v = +v || 0, { tied: id, num: true, small: true })]))));
        box.append(field('질문', inp(b.question, v => b.question = v)));
        box.append(opts(false)); break;
      case 'codediff':
        box.append(codeEd(b.a, '코드 A')); box.append(codeEd(b.b, '코드 B'));
        box.append(field('질문', inp(b.question, v => b.question = v)));
        box.append(opts(false)); break;
      case 'table':
        if (b.code) box.append(codeEd(b.code, '코드'));
        box.append(group('표', [h('table', { class: 'etbl' }, [h('tr', null, b.columns.map((c, i) => h('th', null, inp(c, v => b.columns[i] = v, { small: true }))))].concat(
          b.rows.map(r => h('tr', null, r.map((c, j) => h('td', { class: typeof c === 'object' ? 'a' : '' },
            typeof c === 'object'
              ? (c.options ? h('select', { class: 'fi sm', onfocus: onFocus, onchange: e => { c.answer = e.target.value; commit(); clearCheck(); paintPreview(); } }, c.options.map(o => h('option', { value: o, selected: o === c.answer || null }, o))) : inp(c.answer, v => { c.answer = v; clearCheck(); }, { small: true }))
              : inp(c, v => r[j] = v, { tied: id, small: true })))))
        ))], '초록 칸이 정답 칸이에요.'));
        break;
      case 'fixsentence': case 'cloze':
        box.append(group('문장', b.parts.map((p, i) => typeof p === 'string'
          ? inp(p, v => b.parts[i] = v, { small: true })
          : h('div', { class: 'slotEd' }, [
            h('div', { class: 'fh' }, b.kind === 'cloze' ? '빈칸 보기 (쉼표로 구분)' : '바꿀 낱말 보기 (쉼표로 구분, 첫 화면에는 "' + p.now + '"이 보여요)'),
            inp(p.options.join(', '), v => { p.options = v.split(',').map(x => x.trim()).filter(Boolean); }, { tied: id }),
            h('div', { class: 'orow' }, [h('span', { class: 'lb' }, '정답'), h('select', { class: 'fi sm', onfocus: onFocus, onchange: e => { p.answer = e.target.value; commit(); clearCheck(); paintPreview(); } }, p.options.map(o => h('option', { value: o, selected: o === p.answer || null }, o)))])
          ]))));
        break;
      case 'bitcards':
        box.append(group('만들 수', b.targets.map(t => {
          const out = h('span', { class: 'fh' }, '정답 ' + t.answer);
          return h('div', { class: 'orow' }, [inp(t.value, v => { const n = Math.max(0, Math.min(15, parseInt(v) || 0)); t.value = n; t.answer = n.toString(2).padStart(4, '0'); out.textContent = '정답 ' + t.answer + ' (자동 계산)'; }, { num: true, small: true }), out]);
        }), '0~15 사이 수를 넣으면 정답이 자동으로 계산돼요.'));
        break;
      case 'maze':
        box.append(group('미로 갈림길', b.steps.map((st, si) => h('div', { class: 'mzEd' }, [h('div', { class: 'gt sm' }, `갈림길 ${si + 1}`)].concat(st.doors.map((d, di) => h('div', { class: 'orow' }, [
          pick('radio', `mz-${id}-${si}`, st.answer === di, () => st.answer = di, '맞는 문'),
          inp(d, v => st.doors[di] = v, { tied: id, area: true })
        ])))))));
        break;
      case 'sort': case 'venn': {
        const zs = b.kind === 'sort' ? b.groups.map((g, i) => [String(i), g]) : [['A', b.sets[0] + '만'], ['AB', '둘 다'], ['B', b.sets[1] + '만']];
        box.append(group('카드와 들어갈 곳', b.items.map(it => h('div', { class: 'orow' }, [
          inp(it.t, v => it.t = v, { tied: id }),
          h('select', { class: 'fi sm', onfocus: onFocus, onchange: e => { if (b.kind === 'sort') it.g = +e.target.value; else it.z = e.target.value; commit(); clearCheck(); paintPreview(); } },
            zs.map(([k, l]) => h('option', { value: k, selected: String(b.kind === 'sort' ? it.g : it.z) === k || null }, l)))
        ]))));
        break;
      }
      case 'match':
        box.append(group('짝', b.left.map((l, i) => h('div', { class: 'orow' }, [inp(l, v => b.left[i] = v, { tied: id, small: true }), h('span', { class: 'lb' }, '↔'), inp(b.right[b.answer[i]], v => b.right[b.answer[i]] = v, { tied: id, small: true })])), '같은 줄끼리 짝이에요. 학생 화면에서는 오른쪽 순서가 섞여 나와요.'));
        break;
      case 'order':
        box.append(group('바른 순서', b.items.map((t, i) => h('div', { class: 'orow' }, [h('span', { class: 'lb' }, String(i + 1)), inp(t, v => b.items[i] = v, { tied: id })])), '여기 순서가 정답이에요. 학생 화면에서는 섞여 나와요.'));
        break;
      case 'label':
        box.append(group('번호별 부품 이름', b.markers.map(m => h('div', { class: 'orow' }, [h('span', { class: 'lb' }, String(m.n)), inp(m.answer, v => { m.answer = v; b.bank = b.markers.map(x => x.answer); }, { tied: id })])), '그림과 번호 위치는 고정이에요.'));
        break;
      case 'hotspot':
        box.append(h('div', { class: 'fh' }, '게시물 글과 표시할 곳은 프로토타입에서는 고정이에요. 실제 서비스에서는 글을 쓰고 표시할 곳을 끌어서 지정해요.'));
        break;
      case 'story':
        box.append(group('이야기 장면', Object.entries(b.nodes).map(([k, n]) => h('div', { class: 'mzEd' }, [h('div', { class: 'gt sm' }, n.end ? (n.end === 'good' ? '결말 · 좋은 대응' : '결말 · 아쉬운 대응') : '장면'), inp(n.text, v => n.text = v, { area: true })].concat(
          (n.choices || []).map(c => h('div', { class: 'orow' }, [h('span', { class: 'lb' }, '선택'), inp(c[0], v => c[0] = v, { small: true })]))))), '장면 글과 선택지 글은 고칠 수 있어요. 갈림길 구조는 바꿀 수 없어요.'));
        break;
      case 'write':
        if (b.keywords && b.keywords.length) box.append(field('AI가 확인할 핵심 단어 (쉼표로 구분)', inp(b.keywords.join(', '), v => b.keywords = v.split(',').map(x => x.trim()).filter(Boolean))));
        if ('sample' in b) box.append(field('예시 답', inp(b.sample, v => b.sample = v, { area: true })));
        break;
    }
    return box;
  }

  function editSheet() {
    const s = S(), sh = s.sheet, wrap = h('div');
    wrap.append(field('제목', inp(sh.title, v => sh.title = v)));
    const gwarn = h('div', { class: 'fh warn' });
    const gchk = () => { gwarn.textContent = /할 수 있다\.$/.test(sh.goal.trim()) ? '' : '학습목표는 "~할 수 있다."로 끝나게 써 주세요.'; };
    wrap.append(field('학습목표', inp(sh.goal, v => { sh.goal = v; gchk(); }, { area: true }), gwarn)); gchk();
    const wrapName = WRAP_NAME[sh.type] || '한 줄 정리';
    wrap.append(h('div', { class: 'fld' }, [h('label', { class: 'sw' }, [
      h('input', { type: 'checkbox', role: 'switch', checked: sh.wrapOn !== false || null, onchange: e => { snapshot(); sh.wrapOn = e.target.checked; all(); } }),
      h('span', { class: 'sw-t' }, `${wrapName} 넣기`)]),
      h('div', { class: 'fh' }, sh.wrapOn !== false ? '끄면 활동이 핵심 활동에서 끝나요. 결과는 자동 확인 문항으로만 모아요.' : '꺼져 있어요. 학생 화면에 나오지 않아요.')]));
    const list = h('div', { class: 'blist' });
    sh.sections.forEach(sec => {
      if (sec.role === 'wrap' && sh.wrapOn === false) return;
      list.append(h('div', { class: 'gt sm' }, sec.title));
      sec.blocks.forEach((b, i) => list.append(h('div', { class: 'bl' + (b.hidden ? ' off' : '') }, [
        h('button', { class: 'bl-t', type: 'button', onclick: () => { s.sel = b.id; paintPreview(); paintPanel(); } }, [h('b', null, b.method), h('span', { class: 'bl-p' }, b.prompt.replace(/^\S+ · /, '').slice(0, 18) + '…'), b.hidden ? h('span', { class: 'fh' }, ' · 숨김') : null]),
        h('button', { class: 'ib', type: 'button', 'aria-label': '위로', disabled: i === 0 || null, onclick: () => move({ sec, i }, -1) }, '↑'),
        h('button', { class: 'ib', type: 'button', 'aria-label': '아래로', disabled: i === sec.blocks.length - 1 || null, onclick: () => move({ sec, i }, 1) }, '↓'),
        h('button', { class: 'ib wide', type: 'button', onclick: () => { snapshot(); b.hidden = !b.hidden; all(); } }, b.hidden ? '보이기' : '숨기기')
      ])));
    });
    wrap.append(group('문항', [list], sh.type === 'escape' ? '관문을 숨기면 관문 번호와 금고 번호 자리 수가 자동으로 맞춰져요.' : '숨긴 문항은 학생 화면에 나오지 않아요. 원본에서 지워지지는 않아요.'));
    wrap.append(h('button', { class: 'tolink', type: 'button', onclick: () => { s.tab = 'ai'; paintPanel(); } }, '말로 설명해서 고치기 →'));
    return wrap;
  }

  /* ---------- AI (체험용 시나리오) ---------- */
  function chipsFor(f) {
    if (!f) return [['easy', '숫자를 더 쉽게'], ['hint', '힌트 모두 친절하게'], ['reduce', '문항 하나 줄이기'], ['example', '다른 사례로 바꾸기']];
    return [['easy', '숫자를 더 쉽게'], ['hint', '힌트 더 친절하게'], ['example', '다른 사례로 바꾸기'], ['struct', '다른 활동 방법으로 바꾸기']];
  }
  function route(t) {
    if (/미로|퀴즈|유형|형태|디자인|색|레이아웃|방식으로|게임으로|활동 방법/.test(t)) return 'struct';
    if (/힌트/.test(t)) return 'hint';
    if (/쉽|숫자|난이도|어렵/.test(t)) return 'easy';
    if (/사례|예시|메뉴|학교|소재|상황/.test(t)) return 'example';
    if (/줄|빼|짧|시간|하나만/.test(t)) return 'reduce';
    return null;
  }
  function aiPane(f) {
    const s = S(), box = h('div', { class: 'ai' });
    const log = h('div', { class: 'ai-log' });
    if (!s.chat.length) log.append(h('div', { class: 'msg ai' }, [h('b', null, 'AI'), f ? `'${f.b.method}' 문항을 어떻게 바꿀까요? 내용은 바꿀 수 있고, 활동 방법은 그대로 둬요.` : '활동지를 어떻게 바꿀까요? 미리보기에서 문항을 누르면 그 문항만 고칠 수도 있어요.']));
    s.chat.forEach((m, i) => {
      const el = h('div', { class: 'msg ' + m.who }, [m.who === 'ai' ? h('b', null, 'AI') : null, m.t]);
      if (m.list) el.append(h('ul', { class: 'chg' }, m.list.map(c => h('li', null, [h('span', { class: 'cl' }, c.label), c.before != null ? h('span', { class: 'bf' }, c.before) : null, c.before != null ? ' → ' : null, h('span', { class: 'af' }, c.after)]))));
      if (m.ansNote) el.append(h('div', { class: 'ansnote' }, m.ansNote));
      if (m.prop && s.prop && i === s.chat.length - 1) el.append(h('div', { class: 'row' }, [
        h('button', { class: 'btn pri sm', type: 'button', onclick: apply }, '적용'),
        h('button', { class: 'btn sm', type: 'button', onclick: cancel }, '취소'),
        h('span', { class: 'fh' }, '미리보기에 노란 테두리로 표시했어요')]));
      if (m.goEdit) el.append(h('button', { class: 'tolink', type: 'button', onclick: () => { s.tab = 'edit'; if (m.goEdit !== true) s.sel = m.goEdit; paintPreview(); paintPanel(); } }, '편집에서 확인 →'));
      if (m.chips) el.append(h('div', { class: 'chips' }, m.chips.map(([k, l]) => h('button', { class: 'chip', type: 'button', onclick: () => ask(l, k) }, l))));
      log.append(el);
    });
    const ta = h('textarea', { class: 'fi', rows: 2, placeholder: f ? '예: 숫자를 더 쉽게 바꿔 줘' : '예: 우리 반은 20분이 안 돼서 문항을 줄여 줘', onkeydown: e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } } });
    function send() { const t = ta.value.trim(); if (!t) return; ask(t, route(t)); }
    box.append(log,
      h('div', { class: 'chips' }, chipsFor(f).map(([k, l]) => h('button', { class: 'chip', type: 'button', disabled: !!s.prop || null, onclick: () => ask(l, k) }, l))),
      h('div', { class: 'ai-in' }, [ta, h('button', { class: 'btn pri', type: 'button', disabled: !!s.prop || null, onclick: send }, '보내기')]),
      s.prop ? h('div', { class: 'fh' }, '제안을 적용하거나 취소한 뒤에 다음 요청을 할 수 있어요.') : h('div', { class: 'fh' }, '시제품이라 위 예시 요청에 대해서만 실제로 고쳐져요.'));
    setTimeout(() => { log.scrollTop = log.scrollHeight; }, 0);
    return box;
  }

  function ask(text, intent) {
    const s = S();
    if (s.prop) return;
    s.chat.push({ who: 'me', t: text });
    const f = s.sel ? find(s.sheet, s.sel) : null;
    const r = propose(s.sheet, f, intent);
    s.chat.push(r.msg);
    if (r.sheet) s.prop = { sheet: r.sheet, changed: r.changed, ans: r.ans };
    all();
  }
  function apply() {
    const s = S(); if (!s.prop) return;
    snapshot();
    s.sheet = s.prop.sheet; s.prop.ans.forEach(id => s.check.add(id));
    const ans = s.prop.ans.slice();
    const first = s.prop.ans[0] || s.prop.changed[0];
    s.prop = null;
    s.chat.push({ who: 'ai', t: ans.length ? '적용했어요. 정답이 바뀐 문항은 빨간 테두리로 남겨 뒀어요. 맞는지 확인해 주세요.' : '적용했어요.', goEdit: first || true });
    all();
  }
  function cancel() { const s = S(); s.prop = null; s.chat.push({ who: 'ai', t: '취소했어요. 활동지는 그대로예요.' }); all(); }

  const loopRe = /반복하기 (\d+)번/;
  function propose(sheet, f, intent) {
    const nx = clone(sheet);
    const changed = [], ans = [], list = [];
    const blocks = f ? [find(nx, f.b.id).b] : nx.sections.flatMap(sec => sec.blocks).filter(b => !b.hidden);
    if (intent === 'struct') {
      return { msg: { who: 'ai', t: `활동 방법을 바꾸는 건 할 수 없어요. 바꾸면 자동 확인과 화면이 함께 달라지기 때문이에요. 대신 이렇게 해 볼 수 있어요.`, chips: [['easy', '숫자를 더 쉽게'], ['reduce', '이 문항 숨기고 줄이기'], ['hint', '힌트 더 친절하게']] } };
    }
    if (intent === 'easy') {
      blocks.forEach(b => {
        if (b.kind === 'table' && b.code && b.code.filter(l => loopRe.test(l.t)).length === 2) {
          const loops = b.code.filter(l => loopRe.test(l.t));
          const [o, i] = loops.map(l => +l.t.match(loopRe)[1]);
          const no = Math.max(2, o - 1), ni = Math.max(2, i - 1);
          if (no === o && ni === i) return;
          loops[0].t = `반복하기 ${no}번`; loops[1].t = `반복하기 ${ni}번`;
          b.code.forEach(l => { if (/x 좌표를 -\d+만큼/.test(l.t)) l.t = `x 좌표를 -${ni * 30}만큼 바꾸기`; });
          b.explain = `바깥 반복이 한 번 돌 때마다 안쪽 반복이 처음부터 ${ni}번 돌아요. 그래서 줄마다 ${ni}개, ${no}줄이면 ${ni} × ${no} = ${ni * no}개예요.`;
          b.rows = Array.from({ length: no }, (_, k) => [`${k + 1}번째`, { answer: String(ni) }, { answer: String(ni * (k + 1)) }]);
          list.push({ label: '코드', before: `${o}번 · ${i}번 반복`, after: `${no}번 · ${ni}번 반복` }, { label: '표 정답', before: `합계 ${o * i}`, after: `합계 ${no * ni}` });
          changed.push(b.id); ans.push(b.id);
        } else if (b.kind === 'codediff') {
          const ls = [b.a, b.b].map(c => c.filter(l => loopRe.test(l.t)));
          const nums = ls.map(c => c.map(l => +l.t.match(loopRe)[1]));
          const m = { 4: 3, 3: 2 };
          ls.forEach((c, ci2) => c.forEach((l, k) => l.t = `반복하기 ${m[nums[ci2][k]] || nums[ci2][k]}번`));
          const A = ls[0].map(l => +l.t.match(loopRe)[1]), B = ls[1].map(l => +l.t.match(loopRe)[1]);
          [[b.a, A], [b.b, B]].forEach(([c, n]) => c.forEach(l => { if (/x 좌표를 -\d+만큼/.test(l.t)) l.t = `x 좌표를 -${n[1] * 30}만큼 바꾸기`; }));
          b.explain = `${A[0]} × ${A[1]}와 ${B[0]} × ${B[1]}는 모두 ${A[0] * A[1]}개예요. 개수는 같지만 A는 ${A[1]}개씩 ${A[0]}줄, B는 ${B[1]}개씩 ${B[0]}줄로 모양이 달라요.`;
          list.push({ label: '두 코드', before: '3 × 4 / 4 × 3', after: `${A[0]} × ${A[1]} / ${B[0]} × ${B[1]}` }, { label: '설명', after: '숫자에 맞게 고침 (정답 "같다"는 그대로)' });
          changed.push(b.id);
        } else if (b.kind === 'bitcards') {
          const before = b.targets.map(t => t.value).join(', ');
          const nv = [3, 6];
          b.targets.forEach((t, k) => { t.value = nv[k] || t.value; t.answer = t.value.toString(2).padStart(4, '0'); });
          b.explain = b.targets.map(t => `${t.value} → ${t.answer}`).join(', ');
          list.push({ label: '만들 수', before, after: b.targets.map(t => t.value).join(', ') }, { label: '정답', after: b.targets.map(t => t.answer).join(', ') + ' (자동 계산)' });
          changed.push(b.id); ans.push(b.id);
        } else if (b.kind === 'chart' && b.id === 'a2') {
          // 그래프 숫자를 어림하기 쉬운 수로, 이어진 평균 표도 함께
          const nv = { 월: 10, 화: 30, 수: 8, 목: 30, 금: 6 };
          const before = b.bars.map(x => x.v).join(', ');
          b.bars.forEach(x => x.v = nv[x.label]);
          list.push({ label: '그래프 값', before, after: b.bars.map(x => x.v).join(', ') });
          changed.push(b.id);
          const t = find(nx, 'a3');
          if (t && !t.b.hidden) {
            t.b.rows[0][2].answer = '30'; t.b.rows[1][2].answer = '8'; t.b.hint = '(30 + 30) ÷ 2, (10 + 8 + 6) ÷ 3';
            t.b.explain = '생선·나물 반찬 날의 평균(30kg)이 다른 날(8kg)의 3배가 넘어요.';
            t.b.prompt = '3단계 · 메뉴를 두 무리로 나누어 하루 평균 잔반량을 구하세요. (화 30kg, 목 30kg / 월 10kg, 수 8kg, 금 6kg)';
            list.push({ label: '3단계 표 정답 (이어진 문항)', before: '29 / 9', after: '30 / 8' });
            changed.push('a3'); ans.push('a3');
          }
        }
      });
      if (!changed.length) return { msg: { who: 'ai', t: f ? '이 문항에는 쉽게 바꿀 숫자가 없어요. 대신 힌트를 더 친절하게 바꿔 볼까요?' : '이 활동지에는 쉽게 바꿀 숫자가 없어요. 문항을 하나 줄이거나 힌트를 바꿔 볼까요?', chips: [['hint', '힌트 더 친절하게'], ['reduce', '문항 하나 줄이기']] } };
      return { sheet: nx, changed, ans, msg: { who: 'ai', t: '숫자를 이렇게 바꿔 볼게요.', list, ansNote: ans.length ? '숫자가 바뀌어서 정답도 함께 다시 계산했어요. 적용하면 정답 확인 표시가 남아요.' : null, prop: true } };
    }
    if (intent === 'hint') {
      blocks.forEach(b => {
        if (['note', 'story', 'write'].includes(b.kind) && !b.hint) return;
        const before = b.hint || '(없음)';
        const nh = HINTS[b.id] || (b.hint ? b.hint + ' 그래도 어려우면 짝과 먼저 이야기해 보세요.' : '처음 질문을 다시 읽고, 확실한 것부터 하나씩 골라 보세요.');
        b.hint = nh;
        list.push({ label: b.method, before, after: nh });
        changed.push(b.id);
      });
      if (!changed.length) return { msg: { who: 'ai', t: '이 문항은 힌트를 넣는 방식이 아니에요. 지시문을 더 쉽게 바꿔 볼까요?' } };
      if (!f && list.length > 3) { const n = list.length; list.splice(3); list.push({ label: '그 밖에', after: `${n - 3}개 문항 힌트도 같은 방식으로` }); }
      return { sheet: nx, changed, ans, msg: { who: 'ai', t: '힌트를 이렇게 바꿔 볼게요. 정답을 바로 알려 주지 않고 생각할 거리를 주도록 썼어요.', list, prop: true } };
    }
    if (intent === 'reduce') {
      const cand = f ? f.b.id : REDUCE[nx.id];
      const t = cand && find(nx, cand);
      if (!t || t.b.hidden) return { msg: { who: 'ai', t: '더 줄일 문항이 없어요.' } };
      t.b.hidden = true;
      list.push({ label: t.b.method, after: '숨김 (원본에서 지워지지 않아요)' });
      if (nx.type === 'escape' && t.b.gate) list.push({ label: '관문과 금고', after: '관문 번호와 금고 번호 자리 수가 자동으로 줄어요' });
      changed.push(t.b.id);
      return { sheet: nx, changed, ans, msg: { who: 'ai', t: f ? '이 문항을 숨겨 볼게요.' : `시간을 줄이려면 '${t.b.method}' 문항을 숨기는 게 좋겠어요. 학습목표와 가장 덜 겹치는 문항이에요.`, list, prop: true } };
    }
    if (intent === 'example') {
      const ex = EXAMPLES[nx.id];
      if (!ex) return { msg: { who: 'ai', t: '이 활동지는 사례를 바꾸면 정답이 크게 달라져서, 시제품에서는 바꾸지 않았어요. 실제 서비스에서는 바꿀 사례를 물어본 뒤 정답까지 다시 만들어요.' } };
      ex(nx, list, changed);
      return { sheet: nx, changed, ans, msg: { who: 'ai', t: '사례를 이렇게 바꿔 볼게요. 숫자와 정답은 그대로예요.', list, prop: true } };
    }
    return { msg: { who: 'ai', t: '시제품에서는 아래 예시 요청만 실제로 고쳐 볼 수 있어요.', chips: chipsFor(f) } };
  }
  const HINTS = {
    m1: '바깥 반복 1번째일 때 안쪽 반복이 몇 번 도는지부터 세어 보세요. 2번째, 3번째도 똑같이 처음부터 다시 돌아요.',
    m3: '두 코드에서 숫자만 비교해 보세요. 3 × 4와 4 × 3을 계산하면?',
    g1: '가장 큰 카드부터 생각해 보세요. 만들 수보다 크면 끄고, 작거나 같으면 켜요.',
    c1: '이 글만 보고 민서의 생일, 학교, 사는 곳, 연락처를 알 수 있을까요?',
    d4: '빛 값과 50을 비교해서 50보다 작은 칸만 O예요.',
    a3: '두 날의 잔반을 더한 뒤 2로 나누면 평균이에요.'
  };
  const REDUCE = { 'ws-nested': 'm2', 'ws-vault': 'g2', 'ws-privacy': 'c3', 'ws-sleeptemp': 'd1', 'ws-leftover': 'a1', 'ws-cyber': 't2' };
  const EXAMPLES = {
    'ws-nested': (nx, list, changed) => {
      const m1 = find(nx, 'm1').b; m1.columns = ['바깥 반복', '이번 줄의 의자', '지금까지 의자 합계'];
      m1.prompt = '강당 배치도를 그리는 코드예요. 의자 모양 오브젝트로 도장을 찍어요. 바깥 반복이 한 번 돌 때마다 의자가 몇 개 놓이는지 예측해 표를 채우세요.';
      const m3 = find(nx, 'm3').b; m3.question = '두 코드가 놓는 의자의 총 개수는?';
      nx.title = '반복 안의 반복, 의자는 몇 개?';
      list.push({ label: '소재', before: '도장 문양', after: '강당 의자 배치 (코드는 그대로)' }, { label: '제목', after: nx.title });
      changed.push('m1', 'm3');
    },
    'ws-leftover': (nx, list, changed) => {
      const a2 = find(nx, 'a2').b; const m = { 비빔밥: '제육덮밥', 생선구이: '고등어조림', 카레: '짜장밥', 나물무침: '시금치무침', 떡볶이: '스파게티' };
      list.push({ label: '메뉴', before: a2.bars.map(x => x.sub).join(', '), after: a2.bars.map(x => m[x.sub] || x.sub).join(', ') });
      a2.bars.forEach(x => x.sub = m[x.sub] || x.sub);
      changed.push('a2');
    }
  };

  function all() { paintTop(); paintPreview(); paintPanel(); }
  all();
})();
