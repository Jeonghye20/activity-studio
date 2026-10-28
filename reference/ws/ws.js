/* 활동지 렌더러: 데이터(JSON) 하나 → 학생 활동지 화면. 활동 방법(kind)마다 컴포넌트 하나. */
(function () {
  'use strict';
  const TYPE = {
    concept: ['개념 확인', false], escape: ['탈출 게임', true], mystery: ['추리 게임', true],
    practice: ['실습 기록', false], analysis: ['자료 분석', false], discussion: ['토론·의견', false]
  };

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
  const norm = s => String(s == null ? '' : s).replace(/\s+/g, '').replace(/,/g, '').toLowerCase();
  // 숫자 정답은 쉼표·단위·공백을 지우고 값으로 비교 (8,000원 = 8000, 5% = 5)
  const same = (input, ans) => {
    const A = norm(ans);
    if (/^-?\d+(\.\d+)?$/.test(A)) { const m = norm(input).match(/^-?\d+(\.\d+)?/); return !!m && parseFloat(m[0]) === parseFloat(A); }
    return norm(input) === A;
  };
  const eqSet = (a, b) => a.length === b.length && a.every(x => b.includes(x));

  /* ---------- code lines ---------- */
  function codeView(lines, opt) {
    opt = opt || {};
    const box = h('div', { class: 'code' + (opt.click ? ' click' : '') });
    lines.forEach((l, i) => {
      const inner = [h('span', { class: 'no' }, String(i + 1)), h('span', { class: 'bk ' + (l.k || 'act'), style: 'margin-left:' + (l.d * 22) + 'px' }, l.t)];
      const el = opt.click
        ? h('button', { class: 'ln', type: 'button', 'aria-pressed': 'false', 'data-i': i, onclick: () => opt.click(i, el) }, inner)
        : h('div', { class: 'ln' }, inner);
      box.append(el);
    });
    return box;
  }

  /* ---------- components: each returns {el, check(), reveal(), value()} ---------- */
  const C = {};

  C.choice = function (b, ctx, multi) {
    const sel = new Set();
    const wrap = h('div', { class: 'opts' + (b.options.some(o => o.length > 14) ? ' col' : '') });
    const btns = b.options.map((o, i) => {
      const bt = h('button', { class: 'opt' + (multi ? ' sq' : ''), type: 'button', 'aria-pressed': 'false', onclick: () => {
        if (multi) { sel.has(i) ? sel.delete(i) : sel.add(i); }
        else { sel.clear(); sel.add(i); }
        btns.forEach((x, j) => x.setAttribute('aria-pressed', sel.has(j)));
        ctx.changed();
      } }, [h('span', { class: 'mk' }, multi ? '✓' : String.fromCharCode(65 + i)), o]);
      return bt;
    });
    btns.forEach(x => wrap.append(x));
    return {
      el: wrap,
      answered: () => sel.size > 0,
      check: () => multi ? eqSet([...sel], b.answer) : sel.has(b.answer),
      reveal: () => [].concat(b.answer).forEach(i => btns[i].classList.add('is-ans'))
    };
  };
  C.short = function (b, ctx) {
    const inp = h('input', { class: 'short-in', type: 'text', 'aria-label': '답 입력', placeholder: '답', oninput: ctx.changed, onkeydown: e => { if (e.key === 'Enter') ctx.autoCheck(); } });
    const acc = [].concat(b.answer).map(norm);
    return {
      el: h('div', { class: 'short' }, [inp, b.unit ? h('span', { class: 'short-u' }, b.unit) : null]),
      answered: () => inp.value.trim() !== '',
      check: () => [].concat(b.answer).some(a => same(inp.value, a)),
      reveal: () => { inp.value = [].concat(b.answer)[0]; inp.classList.add('is-ans'); }
    };
  };
  C.multi = (b, ctx) => C.choice(b, ctx, true);
  C.cloze = (b, ctx) => C.fixsentence(b, ctx);
  C.oddone = (b, ctx) => C.choice(b, ctx, false);

  C.table = function (b, ctx) {
    const box = h('div');
    if (b.code) box.append(codeView(b.code));
    const t = h('table', { class: 'tbl' });
    t.append(h('tr', null, b.columns.map(c => h('th', null, c))));
    const cells = [];
    b.rows.forEach(r => {
      const tr = h('tr');
      r.forEach(c => {
        if (typeof c === 'object') {
          const inp = c.options
            ? h('select', { onchange: ctx.changed }, [h('option', { value: '' }, '선택')].concat(c.options.map(o => h('option', { value: o }, o))))
            : h('input', { type: 'text', inputmode: 'numeric', 'aria-label': '값 입력', oninput: ctx.changed });
          const td = h('td', null, inp);
          cells.push({ inp, td, ans: c.answer });
          tr.append(td);
        } else tr.append(h('td', null, c));
      });
      t.append(tr);
    });
    box.append(t);
    return {
      el: box,
      answered: () => cells.every(c => c.inp.value !== ''),
      check: () => { let ok = true; cells.forEach(c => { const g = same(c.inp.value, c.ans); c.td.classList.toggle('wrong', !g && c.inp.value !== ''); ok = ok && g; }); return ok; },
      reveal: () => cells.forEach(c => { c.inp.value = c.ans; c.inp.classList.add('is-ans'); })
    };
  };

  C.codediff = function (b, ctx) {
    const picked = new Set();
    const lineEls = [];
    const bView = codeView(b.b, { click: (i, el) => { picked.has(i) ? picked.delete(i) : picked.add(i); el.setAttribute('aria-pressed', picked.has(i)); ctx.changed(); } });
    bView.querySelectorAll('.ln').forEach(x => lineEls.push(x));
    const q = C.choice({ options: b.options, answer: b.answer }, ctx);
    const el = h('div', null, [
      h('div', { class: 'two' }, [h('div', null, [h('div', { class: 'code-cap' }, '코드 A'), codeView(b.a)]), h('div', null, [h('div', { class: 'code-cap' }, '코드 B · 다른 줄 누르기'), bView])]),
      h('p', { class: 'prompt', style: 'margin-bottom:8px' }, b.question), q.el
    ]);
    return {
      el,
      answered: () => picked.size > 0 && q.answered(),
      check: () => eqSet([...picked], b.diff) && q.check(),
      reveal: () => { b.diff.forEach(i => lineEls[i].classList.add('is-ans')); q.reveal(); }
    };
  };

  C.fixsentence = function (b, ctx) {
    const slots = [];
    const sent = h('div', { class: 'sent' });
    const menu = h('div', { class: 'slot-menu' });
    let open = null;
    const blankMode = b.parts.some(p => typeof p === 'object' && p.now == null);
    b.parts.forEach(p => {
      if (typeof p === 'string') { sent.append(p); return; }
      const s = { p, val: p.now };
      s.btn = h('button', { class: 'slot', type: 'button', 'aria-expanded': 'false', onclick: () => {
        if (open === s) { close(); return; }
        open = s; slots.forEach(x => x.btn.setAttribute('aria-expanded', x === s));
        menu.innerHTML = '';
        p.options.forEach(o => menu.append(h('button', { class: 'chip', type: 'button', 'aria-pressed': String(o === s.val), onclick: () => {
          s.val = o; s.btn.textContent = o; s.btn.classList.remove('blank'); s.btn.classList.toggle('changed', o !== p.now); close(); ctx.changed();
        } }, o)));
        menu.classList.add('show');
      } }, p.now == null ? '\u3000\u3000\u3000' : p.now);
      if (p.now == null) s.btn.classList.add('blank');
      slots.push(s); sent.append(s.btn);
    });
    function close() { open = null; menu.classList.remove('show'); slots.forEach(x => x.btn.setAttribute('aria-expanded', 'false')); }
    return {
      el: h('div', null, [sent, menu]),
      answered: () => blankMode ? slots.every(s => s.val != null) : slots.some(s => s.val !== s.p.now),
      check: () => slots.every(s => s.val === s.p.answer),
      reveal: () => slots.forEach(s => { s.val = s.p.answer; s.btn.textContent = s.p.answer; s.btn.classList.remove('blank'); s.btn.classList.add('is-ans'); })
    };
  };

  C.bitcards = function (b, ctx) {
    const rows = b.targets.map(t => {
      const bits = b.cards.map(() => 0);
      const sum = h('span', { class: 'bit-sum' });
      const cardEls = b.cards.map((v, i) => h('button', { class: 'card', type: 'button', 'aria-pressed': 'false', 'aria-label': v + ' 카드', onclick: () => { bits[i] ^= 1; paint(); ctx.changed(); } },
        [h('span', { class: 'v' }, String(v)), h('span', { class: 'b' }, '0')]));
      function paint() {
        cardEls.forEach((c, i) => { c.setAttribute('aria-pressed', !!bits[i]); c.querySelector('.b').textContent = bits[i]; });
        const s = b.cards.reduce((a, v, i) => a + v * bits[i], 0);
        sum.innerHTML = '합계 <b>' + s + '</b> · 이진수 <b>' + bits.join('') + '</b>';
      }
      paint();
      const el = h('div', { class: 'bit-row' }, [h('div', { class: 'bit-target' }, [h('small', null, '만들 수'), String(t.value)]), h('div', { class: 'cards' }, cardEls), sum]);
      return { el, bits, t, paint };
    });
    return {
      el: h('div', null, rows.map(r => r.el)),
      answered: () => rows.every(r => r.bits.some(x => x)),
      check: () => rows.every(r => r.bits.join('') === r.t.answer),
      reveal: () => rows.forEach(r => { r.t.answer.split('').forEach((x, i) => r.bits[i] = +x); r.paint(); })
    };
  };

  C.reveal = function (b, ctx) {
    const n = b.pixels.length, g = b.grid, px = 200 / n;
    let svg = '<svg width="200" height="200" viewBox="0 0 200 200" aria-hidden="true"><rect width="200" height="200" fill="#fff"/>';
    b.pixels.forEach((row, y) => row.split('').forEach((c, x) => { if (c === '1') svg += `<rect x="${x * px}" y="${y * px}" width="${px}" height="${px}" fill="#1f2a44"/>`; }));
    svg += '</svg>';
    let opened = 0;
    const count = h('div', { class: 'rv-count' });
    const tiles = h('div', { class: 'rv-tiles', style: `grid-template-columns:repeat(${g},1fr)` });
    const all = [];
    for (let i = 0; i < g * g; i++) {
      const t = h('button', { type: 'button', 'aria-label': (i + 1) + '번 칸 열기', onclick: () => { if (t.classList.contains('open')) return; t.classList.add('open'); opened++; paintCount(); } }, String(i + 1));
      all.push(t); tiles.append(t);
    }
    function paintCount() {
      const star = opened <= g * g / 4 ? '★★★' : opened <= g * g / 2 ? '★★☆' : '★☆☆';
      count.textContent = `연 칸 ${opened} / ${g * g} · 지금 맞히면 ${star}`;
    }
    paintCount();
    const q = C.choice({ options: b.options, answer: b.answer }, ctx);
    return {
      el: h('div', { class: 'reveal' }, [h('div', { class: 'rv-box', html: svg }, tiles), h('div', { class: 'rv-side' }, [count, q.el])]),
      answered: q.answered, check: q.check,
      reveal: () => { all.forEach(t => t.classList.add('open')); q.reveal(); },
      onOk: () => all.forEach(t => t.classList.add('open'))
    };
  };

  C.maze = function (b, ctx) {
    let cur = 0;
    const path = h('div', { class: 'maze-path' });
    const doors = h('div', { class: 'doors' });
    const exit = h('div', { class: 'maze-exit' }, '출구에 도착했어요!');
    function paint() {
      path.innerHTML = '';
      path.append(h('span', { class: 'mz done' }, '입구'));
      b.steps.forEach((s, i) => { path.append(h('span', { class: 'mz-line' })); path.append(h('span', { class: 'mz ' + (i < cur ? 'done' : i === cur ? 'cur' : '') }, String(i + 1))); });
      path.append(h('span', { class: 'mz-line' })); path.append(h('span', { class: 'mz ' + (cur >= b.steps.length ? 'done' : '') }, '출구'));
      doors.innerHTML = '';
      if (cur >= b.steps.length) { exit.classList.add('show'); return; }
      const st = b.steps[cur];
      st.doors.forEach((d, i) => doors.append(h('button', { class: 'door', type: 'button', onclick: e => {
        ctx.tried();
        if (i === st.answer) { cur++; paint(); ctx.changed(); if (cur >= b.steps.length) ctx.autoCheck(); }
        else { const el = e.currentTarget; el.classList.remove('dead'); void el.offsetWidth; el.classList.add('dead'); ctx.say('막다른 길이에요. 다른 문을 골라 보세요.', 'no'); }
      } }, [h('span', { class: 'dl' }, (i ? '오른쪽' : '왼쪽') + ' 문'), d])));
    }
    paint();
    return {
      el: h('div', null, [path, doors, exit]),
      answered: () => cur >= b.steps.length, check: () => cur >= b.steps.length, selfCheck: true,
      reveal: () => { if (cur < b.steps.length) { doors.querySelectorAll('.door')[b.steps[cur].answer].classList.add('is-ans'); } }
    };
  };

  C.hotspot = function (b, ctx) {
    const picked = new Set(); const spots = {};
    const t = h('div', { class: 'post-t' });
    b.text.split(/(\[\[[^\]]+\]\])/).forEach(seg => {
      const m = seg.match(/^\[\[([^|]+)\|(.+)\]\]$/);
      if (!m) { t.append(seg); return; }
      const id = m[1];
      const sp = h('button', { class: 'spot', type: 'button', 'aria-pressed': 'false', onclick: () => { picked.has(id) ? picked.delete(id) : picked.add(id); sp.setAttribute('aria-pressed', picked.has(id)); paint(); ctx.changed(); } }, m[2]);
      spots[id] = sp; t.append(sp);
    });
    const cnt = h('div', { class: 'spot-count' });
    function paint() { cnt.textContent = `표시한 곳 ${picked.size}곳`; }
    paint();
    const post = h('div', { class: 'post' }, [h('div', { class: 'post-h' }, [h('span', { class: 'post-av' }), b.author]), h('div', { class: 'post-img' }, '사진'), t]);
    return {
      el: h('div', null, [post, cnt]),
      answered: () => picked.size > 0,
      check: () => eqSet([...picked], b.answer),
      reveal: () => b.answer.forEach(id => spots[id].classList.add('is-ans'))
    };
  };

  const BOARD = '<svg viewBox="0 0 300 200" aria-hidden="true"><rect x="6" y="6" width="288" height="188" rx="16" fill="#2f5d50" stroke="#1f2a44" stroke-width="2"/>' +
    '<rect x="222" y="14" width="44" height="22" rx="4" fill="#c9ced6" stroke="#1f2a44"/>' +
    (function () { let s = ''; for (let r = 0; r < 5; r++) for (let c = 0; c < 5; c++) s += `<rect x="${118 + c * 14}" y="${58 + r * 14}" width="8" height="8" rx="1" fill="#f3d36b"/>`; return s; })() +
    '<rect x="108" y="50" width="84" height="76" rx="6" fill="none" stroke="#9fc4b5" stroke-dasharray="4 3"/>' +
    '<circle cx="42" cy="92" r="16" fill="#1f2a44"/><circle cx="42" cy="92" r="9" fill="#5b6474"/>' +
    (function () { let s = ''; for (let i = 0; i < 12; i++) s += `<circle cx="${58 + i * 17}" cy="176" r="5" fill="#d8b75a" stroke="#1f2a44"/>`; return s; })() +
    '</svg>';

  C.label = function (b, ctx) {
    const fig = h('div', { class: 'board', html: BOARD });
    b.markers.forEach(m => fig.append(h('span', { class: 'pin', style: `left:${m.x}%;top:${m.y}%` }, String(m.n))));
    const sels = b.markers.map(m => {
      const s = h('select', { onchange: ctx.changed, 'aria-label': m.n + '번 부품 이름' }, [h('option', { value: '' }, '이름 고르기')].concat(b.bank.map(x => h('option', { value: x }, x))));
      return { m, s };
    });
    return {
      el: h('div', { class: 'label-wrap' }, [fig, h('div', { class: 'label-list' }, sels.map(x => h('label', null, [h('span', { class: 'pinn' }, String(x.m.n)), x.s])))]),
      answered: () => sels.every(x => x.s.value),
      check: () => sels.every(x => x.s.value === x.m.answer),
      reveal: () => sels.forEach(x => { x.s.value = x.m.answer; x.s.classList.add('is-ans'); })
    };
  };

  C.match = function (b, ctx) {
    const pair = b.left.map(() => -1);
    let pick = -1;
    const order = b.shuffle || b.right.map((_, i) => i);
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const L = b.left.map((t, i) => h('button', { class: 'mi', type: 'button', onclick: () => {
      if (pair[i] >= 0) { pair[i] = -1; pick = -1; paint(); ctx.changed(); return; }
      pick = pick === i ? -1 : i; paint();
    } }, [h('span', { class: 'mb' }, String(i + 1)), t]));
    const R = order.map(ri => h('button', { class: 'mi', type: 'button', 'data-ri': ri, onclick: () => {
      if (pick < 0) { ctx.say('왼쪽에서 먼저 하나를 고르세요.', 'info'); return; }
      pair.forEach((v, k) => { if (v === ri) pair[k] = -1; });
      pair[pick] = ri; pick = -1; paint(); ctx.changed();
    } }, [h('span', { class: 'mb' }, ''), b.right[ri]]));
    const box = h('div', { class: 'match' }, [h('div', { class: 'mcol' }, L), h('div', { class: 'mcol' }, R)]);
    box.prepend(svg);
    function paint() {
      L.forEach((el, i) => { el.classList.toggle('picked', pick === i); el.classList.toggle('paired', pair[i] >= 0); });
      R.forEach(el => { const ri = +el.dataset.ri; const li = pair.indexOf(ri); el.classList.toggle('paired', li >= 0); el.querySelector('.mb').textContent = li >= 0 ? String(li + 1) : ''; });
      requestAnimationFrame(lines);
    }
    function lines() {
      const br = box.getBoundingClientRect();
      svg.innerHTML = '';
      pair.forEach((ri, li) => {
        if (ri < 0) return;
        const a = L[li].getBoundingClientRect(), r = R[order.indexOf(ri)].getBoundingClientRect();
        const ln = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        ln.setAttribute('x1', a.right - br.left); ln.setAttribute('y1', a.top + a.height / 2 - br.top);
        ln.setAttribute('x2', r.left - br.left); ln.setAttribute('y2', r.top + r.height / 2 - br.top);
        ln.setAttribute('stroke', '#1f2a44'); ln.setAttribute('stroke-width', '2');
        svg.append(ln);
      });
    }
    window.addEventListener('resize', () => requestAnimationFrame(lines));
    setTimeout(paint, 0);
    return {
      el: h('div', null, [h('p', { class: 'place-tip' }, '왼쪽을 고른 뒤 오른쪽을 누르면 이어져요. 이은 것을 다시 누르면 풀려요.'), box]),
      answered: () => pair.every(x => x >= 0),
      check: () => pair.every((ri, li) => ri === b.answer[li]),
      reveal: () => { b.answer.forEach((ri, li) => pair[li] = ri); paint(); L.forEach(x => x.classList.add('is-ans')); },
      redraw: () => requestAnimationFrame(lines)
    };
  };

  C.order = function (b, ctx) {
    let cur = b.start.slice();
    const list = h('div', { class: 'order' });
    let els = [];
    function paint(moved) {
      list.innerHTML = '';
      els = cur.map((ii, pos) => h('div', { class: 'oi' + (moved === pos ? ' moved' : '') }, [
        h('span', { class: 'on' }, String(pos + 1)),
        h('span', { class: 'bk' }, b.items[ii]),
        h('span', { class: 'ob' }, [
          h('button', { type: 'button', 'aria-label': '위로', disabled: pos === 0, onclick: () => mv(pos, -1) }, '↑'),
          h('button', { type: 'button', 'aria-label': '아래로', disabled: pos === cur.length - 1, onclick: () => mv(pos, 1) }, '↓')
        ])
      ]));
      els.forEach(x => list.append(x));
    }
    let touched = false;
    function mv(p, d) { const q = p + d; [cur[p], cur[q]] = [cur[q], cur[p]]; touched = true; paint(q); ctx.changed(); const btn = els[q].querySelectorAll('.ob button')[d < 0 ? 0 : 1]; if (btn && !btn.disabled) btn.focus(); }
    paint();
    return {
      el: list,
      answered: () => touched,
      check: () => cur.every((v, i) => v === i),
      reveal: () => { cur = b.items.map((_, i) => i); paint(); els.forEach(x => x.classList.add('is-ans')); }
    };
  };

  function place(b, ctx, zonesDef, venn) {
    const where = b.items.map(() => null);
    let pick = -1;
    const bank = h('div', { class: 'bank' });
    const zoneEls = {};
    const zonesBox = venn ? h('div', { class: 'venn' }, [h('div', { class: 'c a' }), h('div', { class: 'c b' })])
      : h('div', { class: 'zones', style: `grid-template-columns:repeat(${zonesDef.length},1fr)` });
    zonesDef.forEach(z => {
      const zc = h('div', { class: 'zc' });
      const el = h(venn ? 'div' : 'div', { class: venn ? 'vz ' + z.key : 'zone', role: 'button', tabindex: '0', 'aria-label': z.label + '에 놓기',
        onclick: () => drop(z.key),
        onkeydown: e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); drop(z.key); } } },
        [h('span', { class: 'zt' }, z.label), zc]);
      zoneEls[z.key] = zc; zonesBox.append(el);
    });
    function drop(key) { if (pick < 0) return; where[pick] = key; pick = -1; paint(); ctx.changed(); }
    let chips = [];
    function paint() {
      bank.innerHTML = ''; Object.values(zoneEls).forEach(z => z.innerHTML = '');
      chips = b.items.map((it, i) => {
        const c = h('button', { class: 'chip', type: 'button', 'aria-pressed': String(pick === i), onclick: e => {
          if (pick >= 0 && pick !== i && where[i] != null) return; // 다른 카드를 든 채 놓인 카드를 누르면 그 칸에 놓기
          e.stopPropagation(); pick = pick === i ? -1 : i; paint();
        } }, it.t);
        (where[i] == null ? bank : zoneEls[where[i]]).append(c);
        return c;
      });
      if (!bank.children.length) bank.append(h('span', { class: 'bank-empty' }, '모두 놓았어요. 옮기려면 놓은 카드를 다시 누르세요.'));
      zonesBox.classList.toggle('armed', pick >= 0);
    }
    paint();
    const key = it => it.z != null ? it.z : String(it.g);
    return {
      el: h('div', null, [h('p', { class: 'place-tip' }, '카드를 누른 뒤 놓을 곳을 누르세요.'), bank, zonesBox]),
      answered: () => where.every(w => w != null),
      check: () => { let ok = true; b.items.forEach((it, i) => { const g = where[i] === key(it); chips[i].classList.toggle('wrong', !g && where[i] != null); ok = ok && g; }); return ok; },
      reveal: () => { b.items.forEach((it, i) => where[i] = key(it)); pick = -1; paint(); chips.forEach(c => c.classList.add('is-ans')); }
    };
  }
  C.sort = (b, ctx) => place(b, ctx, b.groups.map((g, i) => ({ key: String(i), label: g })), false);
  C.venn = (b, ctx) => place(b, ctx, [{ key: 'A', label: b.sets[0] + '만' }, { key: 'AB', label: '둘 다' }, { key: 'B', label: b.sets[1] + '만' }], true);

  C.chart = function (b, ctx) {
    const W = 560, H = 230, pad = 34, max = Math.max(...b.bars.map(x => x.v)) * 1.15, bw = (W - pad * 2) / b.bars.length;
    let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="요일별 잔반량 막대그래프">`;
    [0, 10, 20, 30].forEach(v => { const y = H - pad - (v / max) * (H - pad * 2); s += `<line x1="${pad}" x2="${W - 8}" y1="${y}" y2="${y}" stroke="#e3e8ee"/><text x="${pad - 6}" y="${y + 4}" font-size="11" text-anchor="end" fill="#6b7383">${v}</text>`; });
    b.bars.forEach((x, i) => {
      const bh = (x.v / max) * (H - pad * 2), X = pad + i * bw + bw * .2, Y = H - pad - bh;
      s += `<rect x="${X}" y="${Y}" width="${bw * .6}" height="${bh}" rx="4" fill="#6b7fa8"/><text x="${X + bw * .3}" y="${Y - 6}" font-size="12" font-weight="700" text-anchor="middle" fill="#1f2a44">${x.v}</text>`;
      s += `<text x="${X + bw * .3}" y="${H - pad + 15}" font-size="12" font-weight="700" text-anchor="middle" fill="#1f2a44">${x.label}</text><text x="${X + bw * .3}" y="${H - pad + 29}" font-size="11" text-anchor="middle" fill="#6b7383">${x.sub}</text>`;
    });
    s += `<text x="${pad}" y="14" font-size="11" fill="#6b7383">(${b.unit})</text></svg>`;
    const q = C.choice({ options: b.options, answer: b.answer }, ctx);
    return { el: h('div', { class: 'chart' }, [h('div', { html: s }), h('p', { class: 'prompt', style: 'margin:10px 0 8px' }, b.question), q.el]), answered: q.answered, check: q.check, reveal: q.reveal };
  };

  C.story = function (b, ctx) {
    const log = h('div', { class: 'st-log' });
    const opts = h('div', { class: 'opts col' });
    let ended = null;
    function go(id, pickText) {
      if (pickText) log.append(h('div', { class: 'st-pick' }, pickText));
      const n = b.nodes[id];
      opts.innerHTML = '';
      if (n.end) {
        ended = n.end;
        log.append(h('div', { class: 'st-end ' + n.end }, [h('b', null, n.end === 'good' ? '좋은 대응이에요' : '이런 결과가 생겼어요'), n.text]));
        opts.append(h('button', { class: 'btn sm', type: 'button', onclick: restart }, '처음부터 다시 해 보기'));
        ctx.changed();
        return;
      }
      log.append(h('div', { class: 'st-node' }, n.text));
      n.choices.forEach(([t, to]) => opts.append(h('button', { class: 'opt', type: 'button', onclick: () => go(to, t) }, [h('span', { class: 'mk' }, '›'), t])));
    }
    function restart() { log.innerHTML = ''; ended = null; go(b.start); }
    go(b.start);
    return { el: h('div', null, [log, opts]), answered: () => !!ended, check: () => ended === 'good', ungraded: true, reveal: () => {} };
  };

  C.write = function (b, ctx) {
    const ta = h('textarea', { 'aria-label': '답 쓰기', placeholder: '여기에 써 보세요', oninput: ctx.changed });
    const sample = b.sample ? h('div', { class: 'sample' }, '예시 답: ' + b.sample) : null;
    const need = b.minKeywords || (b.keywords || []).length;
    return {
      el: h('div', null, [ta, b.keywords && b.keywords.length ? h('div', { class: 'ai-note' }, '제출하면 AI가 핵심 단어가 들어갔는지 확인해요 (체험)') : null, sample]),
      answered: () => ta.value.trim().length > 4,
      ungraded: b.graded === false || !(b.keywords && b.keywords.length),
      check: () => { const hit = (b.keywords || []).filter(k => ta.value.includes(k)); return hit.length >= need; },
      detail: () => { const kw = b.keywords || []; const hit = kw.filter(k => ta.value.includes(k)); const miss = kw.filter(k => !ta.value.includes(k)); return `핵심 단어 ${hit.length}/${kw.length}개 포함` + (hit.length < need && miss.length ? ` · '${miss.slice(0, 2).join("', '")}'을(를) 넣어 다시 써 볼까요?` : ''); },
      reveal: () => { if (sample) sample.classList.add('show'); }
    };
  };

  C.note = function (b, ctx) {
    const cb = h('input', { type: 'checkbox', onchange: ctx.changed });
    return { el: h('div', { class: 'note' }, [h('label', null, [cb, '실행해서 확인했어요'])]), answered: () => cb.checked, check: () => cb.checked, ungraded: true, reveal: () => {} };
  };

  /* ---------- sheet ---------- */
  function render(sheet, root, opt) {
    opt = opt || {};
    root.innerHTML = '';
    const [typeName, isGame] = TYPE[sheet.type];
    const blocks = [];
    const gates = {};
    const ws = h('article', { class: 'ws' + (opt.answers ? ' ans-mode' : ''), 'data-id': sheet.id });

    const unitLabel = opt.unitLabel ? opt.unitLabel(sheet.unit) : sheet.unit;
    ws.append(h('header', { class: 'ws-head' }, [
      h('div', { class: 'ws-meta' }, [h('span', { class: 'tag type' }, typeName), h('span', null, unitLabel + ' · ' + sheet.minutes + '분')]),
      h('h1', null, sheet.title),
      h('div', { class: 'goal' }, [h('b', null, '학습목표'), sheet.goal]),
      h('div', { class: 'name' }, [
        h('label', null, ['반', h('input', { class: 'nm', inputmode: 'numeric', maxlength: '2', 'data-f': 'cls' })]),
        h('label', null, ['번호', h('input', { class: 'nm', inputmode: 'numeric', maxlength: '2', 'data-f': 'no' })]),
        h('label', null, ['이름', h('input', { class: 'nm w', maxlength: '10', 'data-f': 'name' })])
      ])
    ]));
    if (opt.edit) { const hd = ws.querySelector('.ws-head'); hd.classList.add('ed'); if (opt.edit.selected == null) hd.classList.add('sel'); hd.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); opt.edit.onSelect(null); }, true); }
    if (sheet.story) ws.append(h('div', { class: 'story' }, [h('b', null, sheet.type === 'escape' ? '미션' : '사건 개요'), sheet.story]));
    let gateBar = null;
    if (sheet.type === 'escape') { gateBar = h('div', { class: 'gates' }); ws.append(gateBar); }

    // 보이는 관문만 순서대로 번호를 매기고, 금고 번호도 그 관문들에서 만든다
    let gi = 0; const lockDigits = [];
    sheet.sections.forEach(sec => sec.blocks.forEach(b => { delete b._g; if (b.gate && !b.hidden) { b._g = ++gi; lockDigits.push(b.reward); } }));
    let secNo = 0;
    sheet.sections.forEach(sec => {
      if (sec.role === 'wrap' && sheet.wrapOn === false) return;
      const vis = sec.blocks.filter(b => !b.hidden);
      if (!vis.length && !(sec.role === 'main' && sheet.lock)) return;
      const s = h('section', { class: 'sec' }, [h('h2', { class: 'sec-h' }, [h('span', { class: 'n' }, String(++secNo)), sec.title])]);
      vis.forEach(b => s.append(block(b)));
      if (sec.role === 'main' && sheet.lock && lockDigits.length) s.append(lockBlock(lockDigits));
      ws.append(s);
    });

    const sum = h('div', { class: 'sum' });
    const submitBtn = h('button', { class: 'btn pri', type: 'button', onclick: submit }, '제출하기');
    const done = h('div', { class: 'done-msg' });
    ws.append(h('div', { class: 'submit' }, [sum, submitBtn]), done);
    root.append(ws);
    ws.addEventListener('input', e => { if (e.target.classList.contains('nm')) e.target.classList.remove('need'); });
    paintGates(); paintSum();
    if (opt.answers) blocks.forEach(x => { x.api.reveal(); if (x.b._g) x.passed = true; x.el.classList.remove('locked'); x.reward && x.reward.classList.add('show'); });
    paintGates();
    blocks.forEach(x => x.api.redraw && x.api.redraw());

    function block(b) {
      const fb = h('div', { class: 'fb' });
      const explain = b.explain ? h('div', { class: 'explain', html: '<b>설명</b> ' + b.explain }) : null;
      const hint = b.hint ? h('div', { class: 'hint' }, '힌트: ' + b.hint) : null;
      const rec = { b, tries: 0, passed: false, fb, explain };
      const ctx = {
        changed: () => { fb.classList.remove('show'); if (!opt.answers) { rec.passed = false; if (explain) explain.classList.remove('show'); } paintSum(); },
        tried: () => { rec.tries++; },
        say: (t, k) => { fb.className = 'fb show ' + k; fb.textContent = t; },
        autoCheck: () => doCheck()
      };
      const api = (C[b.kind] || C.note)(b, ctx);
      rec.api = api;
      const checkBtn = api.selfCheck || api.ungraded ? null : h('button', { class: 'btn sm', type: 'button', onclick: doCheck }, b._g ? '관문 확인' : '확인');
      const reward = b.reward ? h('div', { class: 'reward' }, [h('span', { class: 'dg' }, b.reward), `관문 ${b._g} 통과! 금고 번호 하나를 얻었어요.`]) : null;
      rec.reward = reward;
      function doCheck() {
        if (!api.answered()) { ctx.say('먼저 답을 골라 주세요.', 'info'); return; }
        if (!api.selfCheck) rec.tries++;
        const ok = api.check();
        rec.passed = ok;
        if (ok) {
          if (api.selfCheck) fb.classList.remove('show');
          else ctx.say(b.kind === 'write' ? '좋아요. ' + api.detail() : '맞았어요!', 'ok');
          if (explain) explain.classList.add('show');
          if (reward) reward.classList.add('show');
          if (api.onOk) api.onOk();
          paintGates();
        } else {
          ctx.say(b.kind === 'write' ? api.detail() : '아직 아니에요. 다시 살펴보세요.' + (rec.tries >= 2 && hint ? ' 힌트를 열어 봐도 좋아요.' : ''), 'no');
        }
        paintSum();
      }
      const top = h('div', { class: 'blk-top' }, [b._g ? h('span', { class: 'gate-tag' }, '관문 ' + b._g) : null, (opt.answers || opt.edit) ? h('span', { class: 'method' }, b.method) : null]);
      const row = h('div', { class: 'row' }, [checkBtn, hint ? h('button', { class: 'hintbtn', type: 'button', onclick: () => hint.classList.toggle('show') }, '힌트 보기') : null]);
      const codeTop = b.code && b.kind !== 'table' ? h('div', { style: 'margin-bottom:12px' }, codeView(b.code)) : null;
      const el = h('div', { class: 'blk', 'data-b': b.id }, [top, h('p', { class: 'prompt' }, b.prompt), codeTop, api.el, (checkBtn || hint) ? row : null, hint, fb, explain, reward]);
      rec.el = el;
      blocks.push(rec);
      if (b._g) gates[b._g] = rec;
      if (b.afterLock && !opt.answers && !opt.edit) { rec.afterLock = true; el.classList.add('locked'); el.setAttribute('data-lockmsg', '금고를 열면 나타나요'); }
      if (opt.edit) {
        el.classList.add('ed');
        if (opt.edit.selected === b.id) el.classList.add('sel');
        const mk = opt.edit.marks && opt.edit.marks[b.id];
        if (mk) { el.classList.add('mk-' + mk); top.append(h('span', { class: 'mk-badge ' + mk }, mk === 'ai' ? 'AI 제안' : mk === 'aians' ? 'AI 제안 · 정답 바뀜' : '정답 확인 필요')); }
        el.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); opt.edit.onSelect(b.id); }, true);
      }
      return el;
    }

    function lockBlock(digits) {
      const lock = { answer: digits.join(''), explain: digits.map((d, i) => `관문 ${i + 1}에서 ${d}`).join(', ') + '을(를) 얻었어요.' };
      const ins = digits.map((_, i) => h('input', { inputmode: 'numeric', maxlength: '1', 'aria-label': (i + 1) + '번째 숫자', oninput: e => { e.target.value = e.target.value.replace(/\D/g, ''); if (e.target.value && ins[i + 1]) ins[i + 1].focus(); } }));
      const fb = h('div', { class: 'fb' });
      const box = h('div', { class: 'lockbox' }, [h('div', { class: 'lock-ic', 'aria-hidden': 'true' }, '🔒'), h('div', { class: 'lock-digits' }, ins), h('button', { class: 'btn pri', type: 'button', onclick: () => {
        const v = ins.map(x => x.value).join('');
        if (v === lock.answer) { box.classList.add('open'); box.querySelector('.lock-ic').textContent = '🔓'; blocks.filter(x => x.afterLock).forEach(x => x.el.classList.remove('locked')); fb.className = 'fb show ok'; fb.textContent = '금고가 열렸어요! ' + lock.explain; }
        else { fb.className = 'fb show no'; fb.textContent = '번호가 맞지 않아요. 관문에서 얻은 숫자를 순서대로 넣어 보세요.'; }
      } }, '금고 열기')]);
      if (opt.answers) lock.answer.split('').forEach((d, i) => ins[i].value = d);
      return h('div', { class: 'blk' }, [h('div', { class: 'blk-top' }, [h('span', { class: 'gate-tag' }, '마지막'), h('span', { class: 'method' }, '자물쇠 번호')]), h('p', { class: 'prompt' }, `관문에서 얻은 숫자 ${digits.length}개를 순서대로 넣어 금고를 여세요.`), box, fb]);
    }

    function paintGates() {
      const keys = Object.keys(gates).map(Number).sort();
      keys.forEach(k => { const prev = gates[k - 1]; gates[k].el.classList.toggle('locked', !!prev && !prev.passed && !opt.answers && !opt.edit); });
      if (!gateBar) return;
      gateBar.innerHTML = '';
      keys.forEach((k, i) => {
        const g = gates[k];
        if (i) gateBar.append(h('span', { class: 'gate-arrow' }, '›'));
        gateBar.append(h('span', { class: 'gate' + (g.passed ? ' done' : '') }, ['관문 ' + k, h('span', { class: 'dg' }, g.passed ? g.b.reward : '?')]));
      });
      gateBar.append(h('span', { class: 'gate-arrow' }, '›'), h('span', { class: 'gate' }, '🔒 금고'));
    }

    function paintSum() {
      const graded = blocks.filter(x => !x.api.ungraded);
      const answered = blocks.filter(x => x.api.answered()).length;
      sum.innerHTML = `답한 문항 <b>${answered}/${blocks.length}</b> · 확인해서 맞힌 문항 <b>${graded.filter(x => x.passed).length}/${graded.length}</b>`;
    }

    function submit() {
      const who = [...ws.querySelectorAll('.nm')];
      const empty = who.find(x => !x.value.trim());
      if (empty) { empty.focus(); empty.classList.add('need'); done.classList.add('show'); done.classList.add('warn'); done.textContent = '반, 번호, 이름을 먼저 적어 주세요.'; return; }
      done.classList.remove('warn');
      const left = blocks.filter(x => !x.api.answered());
      if (left.length && !confirm(`아직 답하지 않은 문항이 ${left.length}개 있어요. 그래도 제출할까요?`)) return;
      const graded = blocks.filter(x => !x.api.ungraded);
      const res = graded.map(x => ({ id: x.b.id, ok: x.api.answered() && x.api.check(), tries: x.tries }));
      const okN = res.filter(r => r.ok).length;
      done.classList.add('show');
      done.textContent = `선생님께 제출했어요. 자동 확인 결과 ${okN}/${graded.length}문항이 맞았어요. 선생님 피드백이 오면 알려 드릴게요.`;
      submitBtn.disabled = true;
      if (opt.onSubmit) opt.onSubmit({ id: sheet.id, results: res, at: Date.now() });
    }
  }

  window.WS = { render, TYPE };
})();
