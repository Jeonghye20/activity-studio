(function(){
const $ = (s, el=document) => el.querySelector(s);
const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const P = new URLSearchParams(location.search);
const ANSWERS = P.get('answers') === '1';          /* 교사용 정답 보기 */
const PLAY = P.get('play');                        /* 전체화면 주소 (활동지 페이지가 넘겨 줌) */
const EMBED = window.parent !== window || P.has('embed');   /* 활동지 안에 들어가 있으면 제목 숨김 */
const NAME = (() => {                              /* 학생 이름: 활동지에서 입력한 정보 → 주소 → 기본값 */
  try { const i = JSON.parse(localStorage.getItem('activity_studio_student_info') || '{}'); if (i && i.name) return i.name; } catch(e){}
  return P.get('name') || '학생';
})();
const SAVE_KEY = 'mystery_' + CASE.id;             /* 진행 저장 */
const W = 1000, H = 700;                           /* 화면 틀: 이 크기로 그리고 창에 맞춰 줄이거나 늘림 */
const ROLE = CASE.roleName || '탐정 조수';
const THEORY = CASE.hypotheses.length === 1;   /* 추리 하나만 확인하는 방식 */
const HYP_LABEL = THEORY ? { open: '확인 전', likely: '확인 중', confirmed: '확인!', out: '아님' } : { open: '?', likely: '유력', confirmed: '확인', out: '지움' };
const ASST_KEY = 'activity_studio_assistant';
const CHARS = window.CHARACTERS || null;      /* 공통 캐릭터(조수 고르기) */

/* 이미지: 경로가 있으면 그림, 없으면 이름표 상자 */
function art(key, cls){
  let src = CASE.assets[key];
  if (CHARS && S.asst && key.startsWith('inv.')){
    const a = CHARS.assistants.find(x => x.id === S.asst);
    if (a) src = a.faces[key.slice(4)] || a.faces.default;
  }
  if (src) return `<img class="img ${cls||''}" src="${esc(src)}" alt="">`;
  return `<div class="ph">${esc(CASE.assetLabels[key] || key)}</div>`;
}

const S = {};
function reset(fresh){
  if (fresh) clearSave();
  Object.assign(S, { links:null, boardLinked:false, boardPos:null, stage:0, reviewFrom:null, open:null, mod:0, modDone:{}, evidence:[], seen:0, hyp:{}, hints:0, tries:0, start:Date.now(), solved:false, line:null, reply:null });
  CASE.hypotheses.forEach(h => S.hyp[h.id] = 'open');
  S.pointer = true;
  try { S.asst = +localStorage.getItem(ASST_KEY) || null; } catch(e){ S.asst = null; }
  const saved = fresh ? null : loadSave();
  if (saved){ Object.assign(S, saved); S.links = new Set(saved.links || []); S.start = Date.now() - (saved.sec||0)*1000;
    /* 사건 데이터가 바뀌어 없어진 증거는 저장에서 빼기 */
    S.evidence = (S.evidence || []).filter(id => CASE.evidence[id]);
    S.links = new Set([...S.links].filter(id => CASE.evidence[id]));
    if (!CASE.stages[S.stage]) S.stage = 0; }
  const begin = () => { if (saved) enterStage(); else if (CASE.opening){ S.cut = 0; renderOpening(); } else enterStage(); };
  if (CHARS && !S.asst) renderPicker(begin); else begin();
}

/* ---------- 진행 저장 (정답 보기에서는 저장하지 않음) ---------- */
function save(){
  if (ANSWERS || S.solved) return;
  try { localStorage.setItem(SAVE_KEY, JSON.stringify({ stage:(S.reviewFrom ?? S.stage), evidence:S.evidence, seen:S.evidence.length, hyp:S.hyp, modDone:S.modDone,
    links:[...(S.links||[])], boardLinked:S.boardLinked, boardPos:S.boardPos, hints:S.hints, tries:S.tries, sec:Math.round((Date.now()-S.start)/1000) })); } catch(e){}
}
function loadSave(){ if (ANSWERS) return null; try { return JSON.parse(localStorage.getItem(SAVE_KEY) || 'null'); } catch(e){ return null; } }
function clearSave(){ try { localStorage.removeItem(SAVE_KEY); } catch(e){} }

/* ---------- 화면 틀 맞추기 ---------- */
function fit(){
  /* 1000×700을 기준으로 줄이거나 늘리고, 남는 쪽(세로·가로)은 틀을 늘려 채움 */
  const s = Math.min(innerWidth / W, innerHeight / H);
  const cw = Math.min(innerWidth / s, 1280), ch = innerHeight / s;
  S.scale = s;
  root.style.width = cw + 'px'; root.style.height = ch + 'px';
  root.style.transform = `scale(${s})`;
  root.style.left = Math.max(0, (innerWidth - cw*s) / 2) + 'px';
  root.style.top = '0px';
}
/* 머리 공통: 사건 번호·제목(활동지 안에서는 숨김) */
function headHTML(){
  return EMBED ? '' : `<span class="tag">${esc(CASE.fileNo)}</span><h1 class="title">${esc(CASE.title)}</h1>`;
}
function toolsHTML(withRestart){
  return `<span class="tools">${withRestart?'<button class="btn-line" id="restart">처음부터</button>':''}${PLAY?'<button class="btn-line" id="fullBtn" title="새 창에서 크게 보기">전체화면</button>':''}</span>`;
}
function bindTools(){
  if ($('#fullBtn')) $('#fullBtn').onclick = () => window.open(PLAY, '_blank');
  if ($('#restart')) $('#restart').onclick = () => askConfirm('처음부터 다시 할까요?', '모은 증거가 모두 사라져요.', '처음부터 하기', () => reset(true));
}
function answersBar(){
  return ANSWERS ? `<div class="ans-bar"><b>교사용 · 정답 보기</b><span>초록 표시가 정답이에요.</span><button id="skipBtn">이 단계 건너뛰기 ▶</button></div>` : '';
}

/* ---------- 조수 고르기 (처음 한 번, 명찰을 누르면 다시) ---------- */
function renderPicker(after){
  clearTimeout(talkTimer);
  let pick = S.asst || null;
  const draw = () => {
    const a = CHARS.assistants.find(x => x.id === pick);
    root.innerHTML = `
      <header class="top">${headHTML()}${toolsHTML(false)}</header>
      <div class="picker">
        <div class="pk-head">
          <div class="pk-det">${art('det.default')}</div>
          <div class="c-bubble pk-say">함께 사건을 풀 ${esc(ROLE)}를 골라 줘!</div>
        </div>
        <div class="pk-cards" role="radiogroup" aria-label="${esc(ROLE)} 고르기">${CHARS.assistants.map(x=>`
          <button class="pk-card ${x.id===pick?'on':''}" role="radio" aria-checked="${x.id===pick}" data-id="${x.id}" aria-label="${x.id}번 ${esc(ROLE)}">
            <img src="${esc(x.id===pick ? x.faces.proud : x.card)}" alt="">
          </button>`).join('')}</div>
        <div class="pk-bar">
          ${a?`<span class="pk-badge">${esc(ROLE)} · ${esc(NAME)}</span>`:'<span class="pk-hint">마음에 드는 캐릭터를 눌러요</span>'}
          <button class="btn-main btn-start" id="pkGo" ${a?'':'disabled'}>이 ${esc(ROLE)}와 함께하기</button>
        </div>
      </div>`;
    root.querySelectorAll('.pk-card').forEach(b => b.onclick = () => { pick = +b.dataset.id; draw(); root.querySelector(`.pk-card[data-id="${pick}"]`).focus(); });
    const go = $('#pkGo'); if (go && a) go.onclick = () => { S.asst = pick; try { localStorage.setItem(ASST_KEY, pick); } catch(e){} after(); };
  };
  draw();
}

/* ---------- 오프닝 카툰: 사건 상황 → 사건 시작하기 ---------- */
/* 진행 단계: 맨 앞 '사건' 버튼(카툰 다시 보기) + 수집·검증·결론 */
function stepsHTML(inOpening){
  const caseBtn = CASE.opening ? `<button class="st st-case ${inOpening?'now':''}" id="caseBtn" ${inOpening?'aria-current="step"':''}><i>
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M4 5h16v11H8l-4 4z"/></svg></i>사건</button><span class="st-bar ${inOpening?'':'done'}"></span>` : '';
  /* 지금 단계(cur)까지는 눌러서 이동: 지난 단계는 다시 보기, 지금 단계는 돌아가기 */
  const cur = S.reviewFrom ?? S.stage, opReview = inOpening && S.review;
  return `<nav class="steps" aria-label="진행 단계">${caseBtn}${CASE.stages.map((s,k)=>{
    const done = (!inOpening || opReview) && (k<cur||S.solved), now = !inOpening && k===cur && !S.solved;
    const view = !inOpening && S.reviewFrom != null && k === S.stage;
    const go = (!inOpening || opReview) && !S.solved && k <= cur && !(now && S.reviewFrom == null);
    const inner = `<i>${done?'✓':k+1}</i>${esc(s.step)}`;
    const cls = `st ${done?'done':''} ${now&&!view?'now':''} ${view?'view':''}`;
    return `${k?`<span class="st-bar ${(!inOpening||opReview)&&k<=cur?'done':''}"></span>`:''}${go
      ? `<button class="${cls} st-go" data-k="${k}" title="${k<cur?esc(s.step)+' 다시 보기':esc(s.step)+' 단계로 돌아가기'}" ${view?'aria-current="step"':''}>${inner}</button>`
      : `<span class="${cls}" ${now?'aria-current="step"':''}>${inner}</span>`}`;
  }).join('')}</nav>`;
}
function bindStepBtns(){
  document.querySelectorAll('.st-go').forEach(b => b.onclick = () => { S.inOpening = false; S.review = false; goStage(+b.dataset.k); });
}
/* 지난 단계 다시 보기 · 지금 단계로 돌아가기 */
function goStage(k){
  const cur = S.reviewFrom ?? S.stage;
  if (k > cur) return;
  S.open = null; S.mod = 0;
  if (k === cur){ S.stage = cur; S.reviewFrom = null; enterStage(); return; }
  S.reviewFrom = cur; S.stage = k;
  S.line = { who:'det', face:'default', say: CASE.stages[k].step + ' 단계를 다시 보자.' }; S.reply = { face:'default', say:'' };
  render();
}
function bindCaseBtn(){
  bindStepBtns();
  const b = $('#caseBtn'); if (!b) return;
  b.onclick = () => { if (S.inOpening) return; S.review = true; S.cut = CASE.opening.panels.length-1; renderOpening(); };
}

function renderOpening(){
  clearTimeout(talkTimer);
  S.inOpening = true;
  const op = CASE.opening, n = op.panels.length;
  root.innerHTML = `
    <header class="top">${headHTML()}${stepsHTML(true)}${toolsHTML(false)}</header>
    <div class="opening">
      <div class="comic">${op.panels.map((p,k)=>`<section class="cut ${k<=S.cut?'show':''} ${k===S.cut?'now':''}" aria-hidden="${k>S.cut}">${panelHTML(p,k)}</section>`).join('')}</div>
      <div class="op-bar">
        <span class="op-count">${S.cut+1} / ${n}</span>
        ${S.cut<n-1
          ? `<button class="btn-sub" id="skip">건너뛰기</button><button class="btn-main" id="nextCut">다음 컷 ▶</button>`
          : S.review
            ? `<button class="btn-main" id="back">수사로 돌아가기 ▶</button>`
            : `<button class="btn-main btn-start" id="start">${esc(op.startLabel||'사건 시작하기')}</button>`}
      </div>
    </div>`;
  const go = () => { S.inOpening = false; S.started = true; enterStage(); };
  if ($('#back')) { $('#back').onclick = () => { S.inOpening = false; S.review = false; render(); }; $('#back').focus(); }
  if ($('#nextCut')) $('#nextCut').onclick = () => { S.cut++; renderOpening(); };
  if ($('#skip')) $('#skip').onclick = () => { S.cut = n-1; renderOpening(); };
  bindTools(); bindStepBtns();
  if ($('#start')) { $('#start').onclick = go; $('#start').focus(); } else if ($('#nextCut')) $('#nextCut').focus();
}
function panelHTML(p, k){
  const bubbles = (p.lines||[]).map(l => `
    <div class="c-say ${l.who}"><div class="c-face">${art((l.who==='det'?'det.':'inv.')+(l.face||'default'))}</div><div class="c-bubble ${l.who==='det'?'tail-l':'inv tail-r'}">${esc(l.say)}</div></div>`).join('');
  let body = '';
  if (p.kind === 'notify' && p.bg){
    /* 장면 배경 위에 소품과 알림 */
    body = `<div class="c-phone c-scene-wrap"><div class="c-scene">${art(p.bg)}</div><div class="c-scene-img">${art(p.img)}</div>${p.bgFront?`<div class="c-scene c-scene-front" style="clip-path:inset(${+p.bgFront}% 0 0 0)">${art(p.bg)}</div>`:''}${p.thing?`<div class="c-scene-thing">${art(p.thing)}</div>`:''}
      <div class="c-noti c-robot-say tail-l"><small>${esc(p.app||'알림')}</small><b>${esc(p.head)}</b>${esc(p.body)}</div></div>`;
  } else if (p.kind === 'notify'){
    body = `<div class="c-phone"><div class="c-phone-img">${art(p.img)}</div>
      <div class="c-noti"><small>${esc(p.app||'알림')} · ${esc(p.time||'방금')}</small><b>${esc(p.head)}</b>${esc(p.body)}</div></div>`;
  } else if (p.kind === 'photo'){
    body = `<div class="c-photo">${art(p.img)}</div>`;
  } else if (p.kind === 'duo'){
    /* 탐정·수사원이 크게 나와 대화하는 컷 */
    const [a,b] = p.lines||[];
    return `${p.caption?`<div class="c-cap">${esc(p.caption)}</div>`:''}
      <div class="c-duo${p.bg?' has-bg':''}">${p.bg?`<div class="c-scene">${art(p.bg)}</div>`:''}
        <div class="c-big det">${art('det.'+((a&&a.face)||'default'))}</div>
        <div class="c-duo-talk">${a?`<div class="c-bubble tail-l">${esc(a.say)}</div>`:''}${b?`<div class="c-bubble inv tail-r">${esc(b.say)}</div>`:''}</div>
        <div class="c-big inv">${art('inv.'+((b&&b.face)||'default'))}</div>
      </div>`;
  } else if (p.kind === 'hypo'){
    /* 가설 두 개와 각각 어디를 조사할지 */
    body = `<div class="c-hypo">${CASE.hypotheses.map(h=>`
      <div class="c-hcard ${h.id}"><div class="c-hid">가설 ${h.id}</div><div class="c-himg">${art(h.img)}</div>
        <b>${esc(h.text)}</b><span class="c-hwhere">조사: ${esc(h.where||'')}</span></div>`).join('')}</div>
      ${p.how?`<div class="c-how">${p.how.map((x,i)=>`<span><i>${i+1}</i>${esc(x)}</span>`).join('<em>›</em>')}</div>`:''}`;
  } else if (p.kind === 'theory'){
    /* 탐정의 추리 하나 + 어디서 확인할지 */
    const h = CASE.hypotheses[0];
    body = `<div class="c-theory">
        <div class="c-tcard"><div class="c-hid">탐정의 추리</div><b>${esc(h.text)}</b></div>
        <div class="c-check"><span class="c-check-t">확인할 곳</span>${(h.checks||[]).map(c=>`<div class="c-chk"><div class="c-chk-img">${art(c.img)}</div><span>${esc(c.label)}</span></div>`).join('')}</div>
      </div>
      ${p.how?`<div class="c-how">${p.how.map((x,i)=>`<span><i>${i+1}</i>${esc(x)}</span>`).join('<em>›</em>')}</div>`:''}`;
  } else if (p.kind === 'plan'){
    body = `<ol class="c-plan">${p.steps.map((st,i)=>`<li><span class="c-plan-no">${i+1}</span><div class="c-plan-img">${art(st.img)}</div><b>${esc(st.title)}</b><span>${esc(st.text)}</span></li>`).join('')}</ol>`;
  }
  return `${p.caption?`<div class="c-cap">${esc(p.caption)}</div>`:''}${body}<div class="c-lines">${bubbles}</div>`;
}
function stage(){ return CASE.stages[S.stage]; }
function enterStage(){
  S.open = null; S.mod = 0;
  S.line = { face:'default', say:'' }; S.reply = { face:'default', say:'' };
  const st = stage();
  render();
  playLines(st.intro || []);
}

/* 대화: 탐정·수사원 말을 차례로 띄움 */
let talkTimer = null;
function playLines(lines){
  clearTimeout(talkTimer);
  let i = 0;
  const next = () => { if (i >= lines.length) return; say(lines[i++]); talkTimer = setTimeout(next, 1500); };
  next();
}
function say(line, tone){
  if (!line) return;
  if (line.who === 'det') { S.line = { ...line, tone }; }
  else { S.reply = { ...line, tone }; if (S.line && S.line.tone === 'no') S.line = { face:'default', say:'' }; }
  renderTalk();
}

/* 게임 안 확인 창 (브라우저 confirm은 미리보기·틀 안에서 막힐 수 있어서 쓰지 않음) */
function askConfirm(title, text, okLabel, onOk){
  const old = $('#ask'); if (old) old.remove();
  root.insertAdjacentHTML('beforeend', `
    <div class="ask" id="ask" role="dialog" aria-modal="true" aria-label="${esc(title)}">
      <div class="ask-card"><h2>${esc(title)}</h2>${text?`<p>${esc(text)}</p>`:''}
        <div class="ask-row"><button class="btn-sub" id="askNo">계속하기</button><button class="btn-main" id="askOk">${esc(okLabel)}</button></div></div>
    </div>`);
  const close = () => { const a = $('#ask'); if (a) a.remove(); };
  $('#askNo').onclick = close;
  $('#askOk').onclick = () => { close(); onOk(); };
  $('#ask').onclick = e => { if (e.target.id === 'ask') close(); };
  $('#askNo').focus();
}

/* ---------- 틀 ---------- */
const root = $('#game');
function render(){
  const st = stage();
  root.innerHTML = `
    <header class="top">${headHTML()}${stepsHTML(false)}${toolsHTML(true)}</header>
    ${answersBar()}
    <div class="body">
      <main class="stage ${st.kind}" id="stage"></main>
      <aside class="note" id="note"></aside>
    </div>
    <footer class="talk" id="talk"></footer>`;
  bindTools();
  if ($('#skipBtn')) $('#skipBtn').onclick = skipStage;
  bindCaseBtn();
  if (st.kind === 'desk') renderDesk(st); else renderBoard(st);
  renderNote();
  renderTalk();
  save();
}

/* 정답 보기: 이 단계를 정답으로 끝내고 다음으로 */
function skipStage(){
  if (S.reviewFrom != null){ goStage(S.reviewFrom); return; }
  const st = stage();
  if (S.solved) return;
  if (st.kind === 'desk'){
    st.props.forEach(p => { (p.modules||[]).forEach(m => { give(m.targets); give(m.give); setHyp(m.hyp); }); if (p.modules) S.modDone[S.stage+':'+p.id] = true; });
    setHyp(st.hyp);
    if (S.stage < CASE.stages.length-1) nextStage(); else finish();
  } else {
    give(st.answer); S.links = new Set(st.answer); S.boardLinked = true;
    CASE.hypotheses.forEach(h => { if (S.hyp[h.id] !== 'out') S.hyp[h.id] = 'confirmed'; });
    S.solved = true; S.line = { ...(st.done||{}), who:'det' }; S.reply = { face:'proud', say:'' }; finish();
  }
}

function renderTalk(){
  const t = $('#talk'); if (!t) return;
  const d = S.line || { face:'default', say:'' }, r = S.reply || { face:'default', say:'' };
  t.innerHTML = `
    <div class="face-wrap"><div class="face det">${art('det.'+(d.face||'default'))}</div><span class="badge">${esc(CASE.detName||'탐정')}</span></div>
    ${d.say?`<div class="bubble tail-l ${d.tone||''}">${esc(d.say)}</div>`:''}
    ${r.say?`<div class="bubble inv tail-r">${esc(r.say)}</div>`:'<span style="margin-left:auto"></span>'}
    <div class="face-wrap"><div class="face inv">${art('inv.'+(r.face||'default'))}</div>${CHARS?`<button class="badge" id="badgeBtn" title="${esc(ROLE)} 바꾸기">${esc(ROLE)} · ${esc(NAME)}</button>`:`<span class="badge">${esc(ROLE)} · ${esc(NAME)}</span>`}</div>`;
  if ($('#badgeBtn')) $('#badgeBtn').onclick = () => renderPicker(() => render());
}

function renderNote(){
  const st = stage(), n = $('#note');
  if (st.kind === 'board' && S.boardLinked && !S.solved) return renderRx(st, n);
  /* 빈 '?' 칸은 수집 단계에서 찾을 개수만큼만. 그 뒤로는 모은 증거만 */
  const goal = (S.stage === 0 && st.kind === 'desk') ? (st.props.flatMap(p => (p.modules||[]).map(m => (m.targets||[]).length)).reduce((a,b)=>a+b,0)) : 0;
  const slots = Math.max(goal, S.evidence.length);
  n.innerHTML = `
    <h2>증거 수첩 <small>${S.evidence.length}장</small></h2>
    <div class="ev-grid">${Array.from({length:slots},(_,k)=>{
      const id = S.evidence[k];
      if (!id) return '<div class="ev-empty">?</div>';
      const e = CASE.evidence[id];
      return `<div class="ev ${k>=S.seen?'new':''}"><div class="ev-img">${art(e.img)}</div><div class="ev-t">${esc(e.title)}</div></div>`;
    }).join('')}</div>
    ${THEORY ? (() => { const h = CASE.hypotheses[0]; return `
    <div class="theory ${S.hyp[h.id]}">
      <div class="th-top"><span class="th-t">탐정의 추리</span><span class="th-state">${HYP_LABEL[S.hyp[h.id]]}</span></div>
      <p class="th-text">${esc(h.text)}</p>
      ${h.where?`<div class="th-where">확인할 곳: ${esc(h.where)}</div>`:''}
    </div>`; })() : `<div class="hyps"><div class="hyps-t">용의 방법</div>${CASE.hypotheses.map(h=>`
      <div class="hyp ${S.hyp[h.id]}">${THEORY?'':`<b>${h.id}</b>`}<span>${esc(THEORY?h.text:h.short)}${h.where?`<small class="hyp-where">확인: ${esc(h.where)}</small>`:''}</span><em>${HYP_LABEL[S.hyp[h.id]]}</em></div>`).join('')}</div>`}`;
  S.seen = S.evidence.length;
}

/* 공통 동작 */
function give(ids){ (ids||[]).forEach(id => { if (!S.evidence.includes(id)) S.evidence.push(id); }); renderNote(); save(); }
function setHyp(m){ Object.assign(S.hyp, m||{}); renderNote(); save(); }
function setMission(text, count){
  const m = $('#mission'); if (!m) return;
  if (S.reviewFrom != null){
    const back = CASE.stages[S.reviewFrom].step;
    m.classList.add('review');
    m.innerHTML = `<span class="mis-t">다시 보기 · ${esc(stage().step)} 단계에서 찾은 것</span><button class="mis-hint" id="backCur">${esc(back)} 단계로 돌아가기 ▶</button>`;
    $('#backCur').onclick = () => goStage(S.reviewFrom);
    return;
  }
  m.innerHTML = `<span class="mis-t">할 일 · ${esc(text)}${count?` <b>${count}</b>`:''}</span>
    <button class="mis-hint" id="hintBtn" title="탐정에게 도움말 듣기"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9V16h7v-2.1A6 6 0 0 0 12 3z"/></svg>도움말</button>`;
  $('#hintBtn').onclick = giveHint;
}
function curModule(){ const st = stage(); if (!S.open) return null; const p = st.props.find(p=>p.id===S.open); return p && p.modules[S.mod]; }
function giveHint(){
  const st = stage();
  const m = st.kind==='board' ? st : curModule();
  if (!m || !m.hints){ say({ who:'det', face:'point', say: st.idle || "'조사하기' 표시가 붙은 물건을 눌러 봐." }); return; }
  m._h = Math.min((m._h||0)+1, m.hints.length);
  S.hints++;
  say({ who:'det', face:'think', say: m.hints[m._h-1] });
}

/* ---------- 책상 장면 ---------- */
const DK = 0.8;   /* 사건 파일의 물건 위치(옛 큰 화면 기준)를 1000×700 틀에 맞게 줄임 */
function renderDesk(st){
  const el = $('#stage');
  el.innerHTML = `<div class="mission" id="mission"></div>` + st.props.map(p => {
    const active = !!p.modules && !S.modDone[S.stage+':'+p.id];
    const done = !!p.doneLabel || S.modDone[S.stage+':'+p.id];
    const locked = !p.modules && !p.doneLabel;
    const tag = active ? p.label : done ? (p.doneLabel || '조사 끝') : (p.lockedLabel || '');
    return `<button class="prop ${CASE.assets[p.img]?'has-img':''} ${active?'active':''} ${done&&!active?'done':''} ${locked?'locked':''}" data-id="${p.id}"
      style="left:${p.x*DK}px;top:${p.y*DK}px;width:${p.w*DK}px;height:${p.h*DK}px;--r:${p.r}deg;transform:rotate(${p.r}deg)"
      ${active?'':'tabindex="-1" aria-disabled="true"'} aria-label="${esc(CASE.assetLabels[p.img]||p.id)}">
      <div class="prop-box">${art(p.img)}</div>${tag?`<span class="prop-tag">${esc(tag)}</span>`:''}</button>`;
  }).join('') + `<div id="zoomArea"></div>`;
  if (S.reviewFrom != null) el.querySelectorAll('.prop.done').forEach(b => {
    const p = st.props.find(x => x.id === b.dataset.id); if (!p || !p.modules) return;
    b.classList.add('revisit'); b.removeAttribute('tabindex'); b.removeAttribute('aria-disabled');
    b.onclick = () => { S.open = b.dataset.id; S.mod = 0; openZoom(st); };
  });
  el.querySelectorAll('.prop.active').forEach(b => b.onclick = () => { S.pointer = false; $('#hand')&&$('#hand').remove(); S.open = b.dataset.id; S.mod = 0; openZoom(st); });
  const first = el.querySelector('.prop.active');
  if (S.pointer && first && !S.open && S.reviewFrom == null){
    el.insertAdjacentHTML('beforeend', `<div class="hand" id="hand" aria-hidden="true" style="left:${first.offsetLeft+first.offsetWidth-30}px;top:${first.offsetTop+first.offsetHeight-20}px">
      <svg width="54" height="54" viewBox="0 0 24 24" fill="#fff" stroke="#1F2A55" stroke-width="1.4" stroke-linejoin="round"><path d="M9 11V4.5a1.5 1.5 0 0 1 3 0V10l.5-.1a1.5 1.5 0 0 1 2.9.6l.1.3a1.5 1.5 0 0 1 2.8.8V13a1.5 1.5 0 0 1 2.7.9V16a6 6 0 0 1-6 6h-1.8a6 6 0 0 1-4.6-2.2L4.6 15a1.6 1.6 0 0 1 2.4-2.1L9 15z"/></svg></div>`);
  }
  if (S.open) openZoom(st);
  else { $('#zoomArea').innerHTML = `<div class="idle">${S.reviewFrom != null ? '\'조사 끝\' 소품을 누르면 그때 찾은 것을 다시 볼 수 있어' : esc(st.idle)}</div>`; setMission(st.idle); }
}

function openZoom(st){
  const p = st.props.find(p=>p.id===S.open);
  const m = p.modules[S.mod];
  $('#zoomArea').innerHTML = `
    <section class="zoom ${p.frame||''}" aria-label="${esc(m.name)}">
      <div class="zoom-head">${p.frame==='laptop'?'<span class="win-dots" aria-hidden="true"><i></i><i></i><i></i></span>':''}<span class="jua">${esc(m.title || (CASE.assetLabels[p.img]||'').replace(/\[.*?\]\s*/,''))}</span></div>
      ${p.modules.length>1?`<div class="zoom-steps">${p.modules.map((x,k)=>{ const rv = S.reviewFrom != null, d = rv || k<S.mod;
        const inner = `<i>${d?'✓':k+1}</i>${esc(x.name.replace(/^[①②③④]\s*/,''))}`;
        return `${k?'<span class="zs-bar"></span>':''}${rv?`<button class="zs done ${k===S.mod?'now':''}" data-m="${k}">${inner}</button>`:`<span class="zs ${k<S.mod?'done':k===S.mod?'now':''}">${inner}</span>`}`; }).join('')}</div>`:''}
      <div class="zoom-body" id="zb"></div>
    </section>`;
  setMission(m.mission);
  if (m.start && S.reviewFrom == null){ clearTimeout(talkTimer); S.line = { ...m.start }; S.reply = { face: S.reply ? S.reply.face : 'default', say: '' }; renderTalk(); }
  const review = S.reviewFrom != null;
  if (review) document.querySelectorAll('.zoom-steps button.zs').forEach(b => b.onclick = () => { S.mod = +b.dataset.m; openZoom(st); });
  MODULES[m.type](m, $('#zb'), review ? () => {} : () => finishModule(st, p, m), review);
}

function finishModule(st, p, m){
  give(m.give); setHyp(m.hyp);
  if (m.done) playLines([].concat(m.done));
  if (S.mod < p.modules.length-1){
    setTimeout(() => { S.mod++; openZoom(st); }, 1800);
  } else {
    S.modDone[S.stage+':'+p.id] = true;
    setHyp(st.hyp); save();
    setTimeout(() => showComplete(st), 1200);
  }
}
/* 단계가 끝나면 완료 창 + 다음 단계 버튼 (저절로 넘어가지 않음) */
function showComplete(st){
  const c = st.complete || { title: st.step + ' 완료!', text: '', next: '다음 단계로 가기' };
  $('#stage').insertAdjacentHTML('beforeend', `
    <div class="stage-done" role="dialog" aria-label="${esc(c.title)}">
      <div class="sd-card">
        <div class="sd-check" aria-hidden="true">✓</div>
        <h2>${esc(c.title)}</h2>
        ${c.text?`<p>${esc(c.text)}</p>`:''}
        <button class="btn-main btn-start" id="sdNext">${esc(c.next)} ▶</button>
      </div>
    </div>`);
  $('#sdNext').onclick = nextStage; $('#sdNext').focus();
}
function nextStage(){
  if (S.stage < CASE.stages.length-1){ S.stage++; enterStage(); }
}

/* ---------- 조사 모듈 ---------- */
const MODULES = {

  /* 화면 수색 */
  search(m, el, done){
    const found = new Set(m.targets.filter(id => S.evidence.includes(id)));
    const tok = txt => esc(txt).replace(/\[\[(\w+)\|([^\]]+)\]\]/g, (_,id,t)=>`<span class="tok" role="button" tabindex="0" data-id="${id}">${t}</span>`);
    if (m.code){
      /* 코드 화면: 블록 코드 줄 + 실행 결과 */
      el.innerHTML = `
        <div class="code-wrap">
          <div class="code">${m.code.map(l=>`<div class="cl" style="padding-left:${(l.indent||0)*28+12}px"><span class="blk ${l.kind||''}">${tok(l.text)}</span></div>`).join('')}</div>
          ${m.output?`<div class="out"><div class="out-t">실행 결과</div>${m.output.img?`<div class="out-img">${art(m.output.img)}</div>`:''}<p>${tok(m.output.text)}</p></div>`:''}
        </div>`;
      /* 실행 추적(trace)이 있으면: 명령 | 로봇이 한 일 표 + 아래 실행 결과 띠 */
      if (m.code.some(l => l.trace)){
        el.innerHTML = `
          <div class="trace">
            <div class="tr-h"><span>${esc(m.codeTitle||'명령')}</span><span>${esc(m.traceTitle||'로봇이 한 일')}</span></div>
            ${m.code.map(l=>`<div class="tr-row"><div class="cl" style="padding-left:${(l.indent||0)*24+8}px"><span class="blk ${l.kind||''}">${tok(l.text)}</span></div><div class="tr-do">${l.trace?esc(l.trace):''}</div></div>`).join('')}
          </div>
          ${m.output?`<div class="out out-strip">${m.output.img?`<div class="out-img">${art(m.output.img)}</div>`:''}<div><div class="out-t">실행 결과</div><p>${tok(m.output.text)}</p></div></div>`:''}`;
      }
    } else {
      el.innerHTML = `
        <div class="post-top"><span class="avatar"></span><div><div class="post-id">${esc(m.post.author)}</div><div class="post-sub">${esc(m.post.sub)}</div></div></div>
        <div class="post-img">${art(m.post.img)}</div>
        <p class="post-text">${tok(m.post.text)}</p>`;
    }
    if (ANSWERS) m.targets.forEach(id => { const t = el.querySelector(`.tok[data-id="${id}"]`); if (t) t.classList.add('ans'); });
    found.forEach(id => { const el2 = el.querySelector(`.tok[data-id="${id}"]`); if (el2) el2.classList.add('hit'); });
    const count = () => setMission(m.mission, `${found.size} / ${m.targets.length}`);
    count();
    el.querySelectorAll('.tok').forEach(t => {
      const act = () => {
        if (t.classList.contains('hit')||t.classList.contains('miss')||found.size===m.targets.length) return;
        const id = t.dataset.id;
        if (m.targets.includes(id)){
          t.classList.add('hit'); found.add(id); give([id]); count();
          if (found.size === m.targets.length) done(); else say(m.onHit);
        } else {
          S.tries++; t.classList.add('miss'); t.classList.add('shake'); say(m.onMiss, 'no');
        }
      };
      t.onclick = act; t.onkeydown = e => { if (e.key==='Enter'||e.key===' '){ e.preventDefault(); act(); } };
    });
  },

  /* 수사 재현: 단서를 이어 답 맞히기 */
  reenact(m, el, done){
    let built = [], used = 0, won = false;
    el.innerHTML = `
      <div class="split">
        <div>
          ${m.field?`<div class="field"><small>${esc(m.field.label)}</small>${esc(m.field.value)}</div>`:''}
          ${m.slotTitle?`<div class="slot-t">${esc(m.slotTitle)}</div>`:''}
          <div class="slot ${m.stack?'stack':''}" id="slot" data-hint="${esc(m.slotHint||'눌러서 넣기')}" aria-label="${esc(m.slotLabel||'답 칸')}"></div>
          <div class="row"><button class="btn-main" id="go">${esc(m.goLabel||'확인')}</button><button class="btn-sub" id="clr">지우기</button></div>
          <div class="dots" id="dots"></div>
          <div id="res"></div>
        </div>
        <div>
          <div class="mod-note">${esc(m.piecesLabel||'단서 · 눌러서 넣기')}</div>
          <div class="pieces">${m.pieces.map((p,k)=>`<button class="piece ghost ${ANSWERS&&[].concat(m.answer).includes(p.text)?'ans':''}" data-k="${k}">${esc(p.text)}${p.from?`<small>${esc(p.from)}</small>`:''}</button>`).join('')}</div>
        </div>
      </div>`;
    const slot = $('#slot', el), dots = $('#dots', el), res = $('#res', el);
    const draw = () => {
      slot.innerHTML = built.map(t=>`<span class="piece">${esc(t)}</span>`).join('');
      if (m.stack) el.querySelectorAll('.pieces .piece').forEach(b => b.disabled = built.includes(m.pieces[+b.dataset.k].text));
      dots.innerHTML = '기회 ' + Array.from({length:m.maxTries},(_,k)=>`<i class="${won&&k===used-1?'win':k<used?'used':''}"></i>`).join('');
    };
    draw();
    el.querySelectorAll('.pieces .piece').forEach(b => b.onclick = () => { if (!won && built.length < (m.slots||4)){ built.push(m.pieces[+b.dataset.k].text); draw(); } });
    $('#clr', el).onclick = () => { if (!won){ built = []; draw(); res.innerHTML=''; } };
    $('#go', el).onclick = () => {
      if (won) return;
      if (!built.length){ res.innerHTML = '<div class="result no">단서를 먼저 넣어 보자.</div>'; return; }
      used++; S.tries++;
      if (built.join('|') === [].concat(m.answer).join('|')){
        won = true; draw();
        res.innerHTML = `<div class="result ok">${esc((m.winText||'성공! {n}번 만에').replace('{n}', used))}</div>`;
        done();
      } else {
        draw(); slot.classList.remove('shake'); void slot.offsetWidth; slot.classList.add('shake');
        if (used >= m.maxTries){ used = 0; res.innerHTML = '<div class="result no">기회를 다 썼어. 도움말을 눌러 보자.</div>'; setTimeout(draw, 900); }
        else res.innerHTML = `<div class="result no">비밀번호가 맞지 않아 · 남은 기회 ${m.maxTries-used}번</div>`;
        built = []; setTimeout(draw, 600);
        say(m.onMiss, 'no');
      }
    };
  },

  /* 증거 고르기: 기록·진술에서 정답 묶음 고르기 */
  select(m, el, done, review){
    const sel = new Set();
    const row = it => it.kind==='log'
      ? `<button class="pick log-row ${it.tag?'is-tag':''}" data-id="${it.id}" aria-pressed="false"><span class="t">${esc(it.time)}</span><span class="lr-where">${esc(it.text)}</span><span class="a">${esc(it.act)}</span>${it.tag?`<span class="lr-tag">${esc(it.tag)}</span>`:''}</button>`
      : `<button class="pick" data-id="${it.id}" aria-pressed="false">${it.img?`<span class="pick-img">${art(it.img)}</span>`:''}<span><span class="who">${esc(it.who)}</span>"${esc(it.text)}"</span></button>`;
    /* 묶음(group)이 있으면 제목을 붙여 나눠 보여 줌 */
    const groups = m.groups || [{ title: '', ids: m.items.map(i=>i.id) }];
    el.innerHTML = `
      ${m.question?`<div class="sel-q"><b>${esc(m.question.title)}</b><p>${esc(m.question.text)}</p></div>`:''}
      ${m.note?`<div class="mod-note key-note">${esc(m.note)}</div>`:''}
      ${groups.map(g=>`<div class="sel-group">${g.title?`<div class="sel-gt">${esc(g.title)}${g.sub?`<small>${esc(g.sub)}</small>`:''}</div>`:''}
        <div class="picks">${g.ids.map(id=>row(m.items.find(i=>i.id===id))).join('')}</div></div>`).join('')}
      <div class="row"><button class="btn-main" id="chk">${esc(m.goLabel||'탐정에게 보여 주기')}</button><span class="mod-note" id="cnt" style="margin:0">고른 증거 0 / ${m.answer.length}</span></div>`;
    const picks = el.querySelectorAll('.pick');
    if (review){
      picks.forEach(p => { p.disabled = true; if (m.answer.includes(p.dataset.id)) p.classList.add('on','right'); });
      $('#chk', el).remove(); $('#cnt', el).textContent = `고른 증거 ${m.answer.length} / ${m.answer.length}`;
      return;
    }
    if (ANSWERS) picks.forEach(p => { if (m.answer.includes(p.dataset.id)) p.classList.add('ans'); });
    picks.forEach(p => p.onclick = () => {
      if (p.disabled) return;
      const id = p.dataset.id; sel.has(id)?sel.delete(id):sel.add(id);
      p.classList.toggle('on', sel.has(id)); p.setAttribute('aria-pressed', sel.has(id));
      picks.forEach(x=>x.classList.remove('right','wrong'));
      $('#cnt', el).textContent = `고른 증거 ${sel.size} / ${m.answer.length}`;
    });
    $('#chk', el).onclick = () => {
      if (!sel.size){ say({ who:'det', face:'think', say:'증거를 먼저 골라 보자.' }); return; }
      S.tries++;
      const wrong = [...sel].filter(id=>!m.answer.includes(id));
      const miss = m.answer.filter(id=>!sel.has(id));
      picks.forEach(p=>{ const id=p.dataset.id; if(sel.has(id)) p.classList.add(m.answer.includes(id)?'right':'wrong'); });
      if (!wrong.length && !miss.length){ picks.forEach(p=>p.disabled=true); $('#chk', el).remove(); done(); }
      else if (wrong.length) say({ who:'det', face:'think', say: m.why[wrong[0]] || '그 증거는 아닌 것 같아.' }, 'no');
      else say({ who:'det', face:'point', say: `좋아, ${m.answer.length-miss.length}개는 맞아. 하나 더 찾아보자!` });
    };
  },

  /* 순서 복원: 명령 카드를 차례대로 놓고 로봇에게 실행시키기 */
  order(m, el, done, review){
    /* 명령 고쳐 실행하기: 왼쪽 프로그램(빈 칸) · 오른쪽 블록 상자 → 실행하면 로봇 실행 화면 */
    const n = m.answer.length;
    const card = id => m.cards.find(c => c.id === id);
    const st0 = Object.assign({}, m.init || {});
    let placed = review ? m.answer.slice() : [], running = false, won = !!review, view = review ? 'run' : 'box';
    el.innerHTML = `
      <div class="ord2">
        <div class="o2-prog">
          <div class="o2-t">${esc(m.slotsTitle||'프로그램')}</div>
          ${m.startText?`<div class="o2-start"><span class="blk start">${esc(m.startText)}</span></div>`:''}
          <ol class="o2-slots" id="oSlots"></ol>
          <div class="row" id="oBtns"><button class="btn-main" id="oRun">${esc(m.runLabel||'실행하기')} ▶</button><button class="btn-sub" id="oClr">모두 빼기</button></div>
        </div>
        <div class="o2-side" id="oSide"></div>
      </div>`;
    const slots = $('#oSlots', el), side = $('#oSide', el);
    const blk = (c, extra='') => `<span class="blk ${c.kind||''}">${esc(c.text)}</span>${extra}`;
    const drawSlots = (runAt=-1, bad=-1) => {
      slots.innerHTML = Array.from({length:n}, (_,i) => {
        const id = placed[i], cls = i===bad?'bad':(won||i<runAt)?'ok':i===runAt?'run':'';
        return id
          ? `<li><button class="o2-slot filled ${cls}" data-i="${i}" ${running||won?'disabled':''} title="눌러서 빼기"><i>${i+1}</i>${blk(card(id))}</button></li>`
          : `<li><div class="o2-slot empty ${i===placed.length?'next':''}"><i>${i+1}</i><span>${i===placed.length?'여기에 끼워요':''}</span></div></li>`;
      }).join('');
      slots.querySelectorAll('.o2-slot.filled').forEach(b => b.onclick = () => {
        if (running || won) return;
        placed.splice(+b.dataset.i, 1); view = 'box'; draw();
      });
    };
    const drawBox = () => {
      side.innerHTML = `<div class="o2-t">${esc(m.cardsLabel||'명령 블록 · 눌러서 차례대로 끼우기')}</div>
        <div class="o2-box">${m.cards.map(c => { const k = m.answer.indexOf(c.id);
          return `<button class="o2-card ${ANSWERS&&k>=0?'ans':''}" data-id="${c.id}" ${placed.includes(c.id)?'disabled':''}>${ANSWERS&&k>=0?`<b class="ord-ans">${k+1}</b>`:''}${blk(c)}</button>`; }).join('')}</div>`;
      side.querySelectorAll('.o2-card').forEach(b => b.onclick = () => {
        if (running || won || placed.length >= n) return;
        placed.push(b.dataset.id); draw();
      });
    };
    const gauge = s => {
      const t = Math.max(0, Math.min(100, s.temp ?? 20));
      return `<div class="o2-state">
        <div class="o2-g"><span>물</span><b>${esc(s.water||'없음')}</b></div>
        <div class="o2-g"><span>물 온도</span><div class="o2-bar"><i style="width:${t}%;background:${t>=100?'var(--red)':t>=60?'#FF922B':'#74C0FC'}"></i></div><b>${t}℃</b></div>
        <div class="o2-g"><span>인덕션</span><b class="${s.heat?'on':'off'}">${s.heat?'켜짐':'꺼짐'}</b></div>
        <div class="o2-g"><span>면</span><b>${esc(s.noodle||'없음')}</b></div>
      </div>`;
    };
    const drawRun = (s, log, result) => {
      side.innerHTML = `<div class="o2-t">${esc(m.runTitle||'실행 화면')}</div>
        <div class="o2-run">
          <div class="o2-robot ${running?'busy':''}">${art(m.robotImg)}</div>
          ${gauge(s)}
        </div>
        <div class="o2-log" aria-live="polite">${log||''}</div>
        <div id="oRes">${result||''}</div>`;
    };
    const winHTML = () => `<div class="result ok ord-ok">${m.winImg?`<span class="ord-win">${art(m.winImg)}</span>`:''}<span>${esc(m.winText||'성공!')}</span></div>`;
    const finalState = () => m.answer.reduce((s,id) => Object.assign(s, (card(id).run||{}).state), Object.assign({}, st0));
    const draw = () => {
      drawSlots();
      $('#oBtns', el).style.display = won ? 'none' : '';
      if (view === 'run' && won) drawRun(finalState(), esc(m.doneLog||'명령을 모두 실행했어.'), winHTML());
      else drawBox();
    };
    draw();
    if (review) return;
    $('#oClr', el).onclick = () => { if (!running && !won){ placed = []; view = 'box'; draw(); } };
    $('#oRun', el).onclick = () => {
      if (running || won) return;
      if (placed.length < n){ say({ who:'det', face:'think', say:`명령 블록 ${n}개를 모두 끼워 보자.` }); return; }
      S.tries++; running = true; view = 'run';
      const bad = placed.findIndex((id,i) => id !== m.answer[i]);
      const s = Object.assign({}, st0);
      let i = 0;
      drawSlots(0); drawRun(s, '실행 준비 중...');
      const step = () => {
        if (i < n && (bad < 0 || i < bad)){
          const c = card(placed[i]), r = c.run || {};
          Object.assign(s, r.state || {});
          drawSlots(i); drawRun(s, `<b>${i+1}번</b> ${esc(c.text)} → ${esc(r.say||'실행했어.')}`);
          i++; setTimeout(step, 800); return;
        }
        running = false;
        if (bad < 0){
          won = true; drawSlots(); $('#oBtns', el).style.display = 'none';
          drawRun(s, esc(m.doneLog||'명령을 모두 실행했어.'), winHTML());
          done();
        } else {
          drawSlots(-1, bad);
          drawRun(Object.assign(s, { noodle: m.failNoodle || '이상해' }), `<b>${bad+1}번</b> ${esc(card(placed[bad]).text)} → <em>${esc((m.fail||{})[placed[bad]] || '여기서 라면이 이상해졌어.')}</em>`,
            `<div class="result no ord-ok">${m.failImg?`<span class="ord-win">${art(m.failImg)}</span>`:''}<span>${bad+1}번 명령에서 멈췄어. 블록을 빼고 다시 끼워 보자.</span></div><button class="btn-sub" id="oFix">명령 고치기</button>`);
          $('#oFix', el).onclick = () => { view = 'box'; draw(); };
          slots.querySelectorAll('.o2-slot.filled').forEach(b => b.disabled = false);
          say(m.onMiss, 'no');
        }
      };
      setTimeout(step, 500);
    };
  }
};

/* ---------- 보드 장면 ---------- */
function renderBoard(st){
  const el = $('#stage');
  S.links = S.links || new Set();
  /* 카드 자리를 섞어서 정답·함정이 위치로 드러나지 않게 (한 번 섞으면 이번 판 동안 유지) */
  if (!S.boardPos){
    const slots = THEORY
      ? [ {x:24,y:62,r:-3}, {x:560,y:58,r:3}, {x:18,y:226,r:2}, {x:568,y:232,r:-2}, {x:300,y:378,r:2}, {x:40,y:388,r:-2}, {x:552,y:392,r:3} ]
      : st.cards.map(c => ({ x:c.x*DK, y:c.y*DK, r:c.r }));
    const order = st.cards.map((_,i)=>i).sort(() => Math.random() - .5);
    S.boardPos = {}; st.cards.forEach((c,i) => S.boardPos[c.ev] = slots[order[i] % slots.length]);
  }
  const hA = CASE.hypotheses.find(h=>h.id===st.target);
  const others = CASE.hypotheses.filter(h=>h.id!==st.target);
  el.innerHTML = `
    <div class="mission" id="mission"></div>
    <svg class="threads" id="threads" aria-hidden="true"></svg>
    <div class="hyp-card" id="target" style="left:270px;top:176px;transform:rotate(-2deg)"><span class="pin" id="targetPin"></span>
      <div class="h-id">${THEORY?'탐정의 추리':'가설 '+hA.id}</div><div class="h-t">${esc(hA.text)}</div>
      ${S.hyp[hA.id]==='confirmed'?'<span class="stamp">확인</span>':''}
    </div>
    ${others.map((h,k)=>`<div class="hyp-card out" style="left:480px;top:${70+k*10}px;width:230px;transform:rotate(3deg)">
      <div class="h-id">가설 ${h.id}</div><div class="h-t">${esc(h.text)}</div><span class="xmark">✕</span></div>`).join('')}
    ${st.cards.map(c => { const e = CASE.evidence[c.ev], pos = S.boardPos[c.ev]; return `
      <button class="pin-card ${S.links.has(c.ev)?'linked':''} ${ANSWERS&&st.answer.includes(c.ev)?'ans':''}" data-ev="${c.ev}" style="left:${pos.x}px;top:${pos.y}px;transform:rotate(${pos.r}deg)" aria-pressed="${S.links.has(c.ev)}">
        <span class="pin"></span><div class="pc-img">${art(e.img)}</div><div class="pc-t">${esc(e.title)}</div></button>`; }).join('')}`;
  setMission(st.mission, `${[...S.links].filter(x=>st.answer.includes(x)).length} / ${st.answer.length}`);
  drawThreads();
  el.querySelectorAll('.pin-card').forEach(b => b.onclick = () => {
    if (S.boardLinked) return;
    const ev = b.dataset.ev;
    if (S.links.has(ev)){ S.links.delete(ev); b.classList.remove('linked'); }
    else if (!st.answer.includes(ev)){
      S.tries++; b.classList.remove('bad'); void b.offsetWidth; b.classList.add('bad'); setTimeout(() => b.classList.remove('bad'), 700);
      say({ who:'det', face:'think', say: st.why[ev] || '그건 이 사건과 상관없어.' }, 'no'); return;
    } else { S.links.add(ev); b.classList.add('linked'); give([ev]); }
    setMission(st.mission, `${[...S.links].filter(x=>st.answer.includes(x)).length} / ${st.answer.length}`);
    drawThreads();
    if (st.answer.every(a=>S.links.has(a))){
      S.boardLinked = true; save(); say(st.linked);
      setMission(st.rx.mission || '실천 카드를 골라 보자');
      renderNote();
    }
  });
}
function drawThreads(){
  const svg = $('#threads'), tg = $('#target'); if (!svg || !tg) return;
  /* 실: 증거 카드의 빨간 핀 가운데 → 추리 카드의 핀 가운데 */
  const box = svg.getBoundingClientRect();
  const k = S.scale || 1;   /* 화면 틀을 줄였으면 그만큼 되돌림 */
  const mid = el => { const r = el.getBoundingClientRect(); return [(r.left - box.left + r.width/2)/k, (r.top - box.top + r.height/2)/k]; };
  const [tx, ty] = mid($('#targetPin'));
  svg.innerHTML = [...(S.links||[])].map(ev => {
    const pin = document.querySelector(`.pin-card[data-ev="${ev}"] .pin`); if (!pin) return '';
    const [x, y] = mid(pin);
    const sag = Math.min(40, Math.hypot(tx-x, ty-y) * 0.12);   /* 실이 살짝 처지게 */
    return `<path d="M${x} ${y} Q${(x+tx)/2} ${(y+ty)/2 + sag} ${tx} ${ty}" stroke="#C92A2A" stroke-width="3" fill="none" stroke-linecap="round"/>`;
  }).join('');
}

/* 실천 카드 */
function renderRx(st, n){
  const rx = st.rx, sel = new Set();
  n.innerHTML = `<h2>${esc(rx.title)}</h2><p class="mod-note" style="margin:0">${esc(rx.sub)}</p>
    <div class="rx-cards">${rx.options.map((o,k)=>`<button class="pick rx-card c${k%4} ${ANSWERS&&rx.answer.includes(k)?'ans':''}" data-k="${k}" aria-pressed="false">
      <span class="rx-top"><span class="rx-no">${k+1}</span><span class="rx-label">${esc(rx.cardLabel||'실천 카드')}</span><span class="rx-stamp" aria-hidden="true">선택</span>
        <svg class="rx-ic" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z"/><path d="M9 12l2 2 4-4"/></svg></span>
      <span class="rx-text">${esc(o)}</span></button>`).join('')}</div>
    <button class="btn-main" id="solve" style="height:56px;font-size:22px">사건 해결!</button>`;
  const picks = n.querySelectorAll('.pick');
  picks.forEach(p => p.onclick = () => {
    const k = +p.dataset.k; sel.has(k)?sel.delete(k):sel.add(k);
    p.classList.toggle('on', sel.has(k)); p.setAttribute('aria-pressed', sel.has(k));
    picks.forEach(x=>x.classList.remove('wrong'));
  });
  $('#solve', n).onclick = () => {
    S.tries++;
    const ok = sel.size===rx.answer.length && rx.answer.every(a=>sel.has(a));
    if (!ok){
      picks.forEach(p=>{ const k=+p.dataset.k; if(sel.has(k)&&!rx.answer.includes(k)) p.classList.add('wrong'); });
      say(sel.size<rx.answer.length ? { who:'det', face:'think', say:`${rx.answer.length}장을 골라 보자.` } : rx.wrong, 'no');
      return;
    }
    S.solved = true; clearSave(); S.reply = { face:'proud', say:'' }; say(st.done); finish();
  };
}

/* ---------- 결과 ---------- */
function finish(){
  S.solved = true; clearSave();
  const sec = Math.round((Date.now()-S.start)/1000);
  render();
  const el = $('#stage');
  el.insertAdjacentHTML('beforeend', `
    <div class="solved" role="dialog" aria-label="사건 해결">
      <div class="seal">사건 해결</div>
      <h2>${esc(ROLE)} ${esc(NAME)}, 수고했어요!</h2>
      <div class="stats">
        <div class="stat"><b>${Math.floor(sec/60)}분 ${String(sec%60).padStart(2,'0')}초</b><small>걸린 시간</small></div>
        <div class="stat"><b>${S.evidence.length}장</b><small>모은 증거</small></div>
        <div class="stat"><b>${S.hints}번</b><small>도움말</small></div>
      </div>
      <div class="lr-head"><b>이번 사건에서 알게 된 것</b><span id="lrCount">0 / ${CASE.learned.length} 확인</span></div>
      <div class="lr-cards">${CASE.learned.map((t,k)=>`
        <button class="lr-card" data-k="${k}" aria-expanded="false">
          <span class="lr-front"><span class="lr-no">${k+1}</span>
            <span class="lr-tapwrap" aria-hidden="true"><span class="lr-ripple"></span>
              <svg class="lr-tap" width="44" height="44" viewBox="0 0 48 48" fill="none">
                <path d="M19 26V9.5a3.5 3.5 0 0 1 7 0V22l1.2-.3a3.4 3.4 0 0 1 4.1 2.2l.1.3 1.3-.3a3.3 3.3 0 0 1 3.9 2.4l1 .1a3.3 3.3 0 0 1 3.4 3.3V34a10 10 0 0 1-10 10h-4.2a10 10 0 0 1-7.9-3.9l-6.3-8.2a3.4 3.4 0 0 1 5.1-4.4L19 30z" fill="#FFF3BF" stroke="#1F2A55" stroke-width="2.6" stroke-linejoin="round"/>
                <path d="M26 22v6M32.6 23.6V28M38.8 26.4V29" stroke="#1F2A55" stroke-width="2.2" stroke-linecap="round"/>
              </svg></span>
            <span class="lr-hint">눌러서 확인하기</span></span>
          <span class="lr-back"><span class="lr-no">${k+1}</span><span class="lr-text">${esc(t)}</span></span>
        </button>`).join('')}</div>
      <button class="btn-sub" id="again" hidden>다시 하기</button>
    </div>`);
  const open = new Set();
  const cards = el.querySelectorAll('.lr-card');
  const upd = () => { $('#lrCount').textContent = `${open.size} / ${CASE.learned.length} 확인`; $('#again').hidden = open.size === 0; };
  cards.forEach(c => c.onclick = () => {
    c.classList.add('open'); c.setAttribute('aria-expanded', 'true'); open.add(c.dataset.k); upd();
  });
  /* 다시 하기: 카드를 글자가 보이기 전 상태로 */
  $('#again').onclick = () => { cards.forEach(c => { c.classList.remove('open'); c.setAttribute('aria-expanded','false'); }); open.clear(); upd(); cards[0].focus(); };
  try { if (window.parent !== window) window.parent.postMessage({ source:'mystery-engine', caseId:CASE.id, status:'solved', seconds:sec, hints:S.hints, tries:S.tries, evidence:S.evidence.length }, '*'); } catch(e){}
}

window.addEventListener('resize', () => { fit(); drawThreads(); });
fit();
reset();
})();
