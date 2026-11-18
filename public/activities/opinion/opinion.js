/* =========================================================
   의견 저울 모듈 (독립 실행)
   OpinionScale.mount(root, { content, value, onChange })
     → { getValue(), setValue(v), destroy() }
   - 글은 content(= content.js)에서만 읽는다.
   - 값이 바뀌면 onChange(value) 를 부른다. getValue 로 현재 값을 읽는다.
   ========================================================= */
(function () {
  "use strict";

  // 저울 기하 (1536×1024 기준 좌표)
  var PIV = { x: 767.5, y: 180.5 };
  var R = 474.5;
  var RING = { x: 303, y: 55 };
  var CW = 1536, CH = 1024;

  var SCREENS = ["stance", "reason", "confirm", "flip", "drag", "write"];
  var CHIP_OF = { stance: 0, reason: 1, confirm: 2, flip: 3, drag: 3, write: 3 };

  function el(tag, cls, attrs) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (attrs) for (var k in attrs) {
      if (k === "text") e.textContent = attrs[k];
      else if (k === "html") e.innerHTML = attrs[k];
      else e.setAttribute(k, attrs[k]);
    }
    return e;
  }

  // 받침에 따라 은/는
  function eunNeun(word) {
    if (!word) return "는";
    var ch = word.charCodeAt(word.length - 1);
    if (ch < 0xac00 || ch > 0xd7a3) return "는";
    return ((ch - 0xac00) % 28) !== 0 ? "은" : "는";
  }

  function mount(root, opts) {
    opts = opts || {};
    var C = opts.content || window.OPINION_CONTENT;
    var onChange = typeof opts.onChange === "function" ? opts.onChange : function () {};
    var onFullscreen = typeof opts.onFullscreen === "function" ? opts.onFullscreen : function () {};
    var onNavigate = typeof opts.onNavigate === "function" ? opts.onNavigate : function () {};
    var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    var st = {
      screen: "stance",
      stance: null, reason: null, customText: "",
      flip: [null, null],      // 카드별 고른 보기 index (null=앞면)
      blanks: [null, null],    // 채운 단어 또는 null
      dragHint: "start",       // start | wrong | done  (+ dragWord)
      dragWord: "",
      opinion: "",
      saved: false,
      helpOpen: false,
      fullscreen: false,
    };
    if (opts.value) applyValue(opts.value, true);

    function applyValue(v, silent) {
      if (!v) return;
      ["stance", "reason", "customText", "opinion"].forEach(function (k) { if (k in v) st[k] = v[k]; });
      if ("customReason" in v) st.customText = v.customReason || "";
      if ("screen" in v && v.screen) st.screen = v.screen;
      if ("blanks" in v && v.blanks) st.blanks = v.blanks.slice(0, 2);
      if ("saved" in v) st.saved = !!v.saved;
      if (!silent) { render(); fire(); }
    }

    function reasonCommitted() {
      if (st.reason == null) return false;
      if (st.reason === "custom") return st.customText.trim().length > 0;
      return true;
    }

    function getValue() {
      return {
        stance: st.stance, reason: st.reason, customReason: st.customText,
        blanks: st.blanks.slice(), opinion: st.opinion, saved: st.saved,
        screen: st.screen,
      };
    }
    function fire() { onChange(getValue()); }

    // ---------- 이미지 매트 제거(캔버스 프리멀티플라이 축소) ----------
    var srcCache = {};   // url -> Image
    var faceCache = {};  // key -> dataURL
    function cleanFace(img, url, hPx) {
      var dpr = window.devicePixelRatio || 1;
      var key = url + "@" + Math.round(hPx) + "@" + dpr;
      if (faceCache[key]) { img.src = faceCache[key]; return; }
      if (!img.src) img.src = url; // 준비되기 전엔 원본
      function draw(im) {
        if (!im.naturalWidth) { img.src = url; return; }
        var h = Math.max(1, Math.round(hPx * dpr));
        var w = Math.max(1, Math.round(h * im.naturalWidth / im.naturalHeight));
        var cv = document.createElement("canvas"); cv.width = w; cv.height = h;
        var ctx = cv.getContext("2d");
        ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = "high";
        ctx.drawImage(im, 0, 0, w, h); // 캔버스 합성은 프리멀티플라이 → 투명 매트가 번지지 않음
        var out;
        try { out = cv.toDataURL("image/png"); } catch (e) { img.src = url; return; } // file:// 보안 예외 시 원본
        faceCache[key] = out; img.src = out;
      }
      var cached = srcCache[url];
      if (cached && cached.complete && cached.naturalWidth) { draw(cached); return; }
      var im = cached || new Image();
      if (!cached) { srcCache[url] = im; im.src = url; }
      if (im.complete && im.naturalWidth) draw(im);
      else im.addEventListener("load", function () { draw(im); }, { once: true });
    }

    // ---------- 뼈대 DOM ----------
    root.classList.add("op-root");
    root.innerHTML = "";
    var board = el("div", "op-board");

    // 머리 띠
    var head = el("div", "op-head");
    var headL = el("div", "op-head-l");
    headL.appendChild(el("img", null, { src: "img/scale-full.png", alt: "" }));
    headL.appendChild(el("div", "op-title op-jua", { text: C.title }));
    head.appendChild(headL);
    var stepsWrap = el("div", "op-steps");
    var chipEls = C.steps.map(function (name, i) {
      var c = el("button", "op-chip", { type: "button", disabled: "" });
      c.appendChild(el("i", null, { text: String(i + 1) }));
      c.appendChild(document.createTextNode(name));
      stepsWrap.appendChild(c);
      return c;
    });
    var fsBtn = el("button", "op-fsbtn", { type: "button" });
    stepsWrap.appendChild(fsBtn);
    head.appendChild(stepsWrap);
    board.appendChild(head);
    fsBtn.addEventListener("click", function () { setFullscreen(!st.fullscreen); });

    // 저울 영역
    var scalebox = el("div", "op-scalebox");
    var host = el("div", "op-host");
    var hostStage = el("img", "op-host-stage", { src: "img/host-stage.png", alt: "" });
    var hostFig = el("img", "op-host-fig show", { alt: "사회자 도담" });
    host.appendChild(hostStage); host.appendChild(hostFig);
    scalebox.appendChild(host);

    var bubble = el("div", "op-bubble");
    scalebox.appendChild(bubble);

    var scalewrap = el("div", "op-scalewrap", { role: "img" });
    scalewrap.appendChild(el("img", "op-sc-base", { src: "img/scale-base.png", alt: "" }));
    var beam = el("img", "op-sc-beam", { src: "img/scale-beam.png", alt: "" });
    var panL = el("div", "op-pan");
    panL.appendChild(el("img", "op-pan-empty", { src: "img/scale-pan.png", alt: "" }));
    panL.appendChild(el("img", "op-pan-weight", { src: "img/scale-pan-weight.png", alt: "" }));
    var panR = el("div", "op-pan");
    panR.appendChild(el("img", "op-pan-empty", { src: "img/scale-pan.png", alt: "" }));
    panR.appendChild(el("img", "op-pan-weight", { src: "img/scale-pan-weight.png", alt: "" }));
    var labelL = el("div", "op-plabel", { text: C.sides.ok.label });
    var labelR = el("div", "op-plabel", { text: C.sides.no.label });
    scalewrap.appendChild(beam);
    scalewrap.appendChild(panL); scalewrap.appendChild(panR);
    scalewrap.appendChild(labelL); scalewrap.appendChild(labelR);
    scalebox.appendChild(scalewrap);
    board.appendChild(scalebox);

    // 고르기 영역
    var choice = el("div", "op-choice");
    var clabel = el("div", "op-clabel");
    clabel.appendChild(el("img", null, { src: "img/weight.png", alt: "" }));
    var clabelT = el("div", "op-clabel-t op-jua");
    clabel.appendChild(clabelT);
    var helpBtn = el("button", "op-help-btn", { type: "button" });
    clabel.appendChild(helpBtn);
    choice.appendChild(clabel);
    var helpNote = el("div", "op-help-note"); helpNote.hidden = true;
    choice.appendChild(helpNote);
    var cbody = el("div", "op-cbody");
    choice.appendChild(cbody);
    var nav = el("div", "op-nav");
    var prevBtn = el("button", "op-prev", { type: "button", text: C.prevBtn });
    var nextBtn = el("button", "op-next", { type: "button" });
    nav.appendChild(prevBtn); nav.appendChild(nextBtn);
    choice.appendChild(nav);
    board.appendChild(choice);

    helpBtn.addEventListener("click", function () { st.helpOpen = !st.helpOpen; updateHelp(); });
    prevBtn.addEventListener("click", goPrev);
    nextBtn.addEventListener("click", onNext);

    root.appendChild(board);

    // ---------- 단계 이동 ----------
    function goScreen(s) { st.screen = s; st.helpOpen = false; render(); fire(); onNavigate(); showTyping(); }
    function goPrev() {
      if (st.screen === "write" && st.saved) { st.saved = false; render(); fire(); showTyping(); return; }
      if (st.screen === "write") { goScreen("drag"); return; }
      var i = SCREENS.indexOf(st.screen);
      if (i > 0) goScreen(SCREENS[i - 1]);
    }
    function onNext() {
      if (st.screen === "write") { saveOpinion(); return; }
      if (!nextReady()) return;
      var i = SCREENS.indexOf(st.screen);
      if (i < SCREENS.length - 1) {
        var nx = SCREENS[i + 1];
        if (nx === "drag") st.dragHint = (st.blanks[0] && st.blanks[1]) ? "done" : "start";
        goScreen(nx);
      }
    }
    function nextReady() {
      if (st.screen === "stance") return st.stance != null;
      if (st.screen === "reason") return reasonCommitted();
      if (st.screen === "confirm") return true;
      if (st.screen === "flip") return st.flip[0] === 0 && st.flip[1] === 0;
      if (st.screen === "drag") return !!(st.blanks[0] && st.blanks[1]);
      return false;
    }
    function saveOpinion() {
      if (!st.opinion.trim() || st.saved) return;
      st.saved = true; render(); fire(); onNavigate(); showTyping();
    }

    // ---------- 입장/이유 ----------
    function pickStance(s) {
      if (st.stance !== s) { st.reason = null; st.customText = ""; }
      st.stance = s; render(); fire();
    }
    function pickReason(r) { st.reason = r; render(); fire(); }

    // ---------- 그리기 ----------
    function render() { renderChoiceBody(); updateChrome(); }

    function currentHostLine() {
      if (st.screen === "flip") return C.tidy.flip.host;
      if (st.screen === "drag") return C.tidy.drag.host;
      if (st.screen === "write") return st.saved ? C.tidy.saved.host : C.tidy.write.host;
      return C.host.lines[st.screen] || "";
    }
    function currentLabel() {
      if (st.screen === "flip") return C.tidy.flip.label;
      if (st.screen === "drag") return C.tidy.drag.label;
      if (st.screen === "write") return st.saved ? C.tidy.saved.label : C.tidy.write.label;
      return C.choiceLabels[st.screen] || "";
    }
    function currentHelp() {
      if (st.screen === "stance") return C.helps.stance;
      if (st.screen === "reason") return st.stance === "no" ? C.helps.reasonNo : C.helps.reasonOk;
      if (st.screen === "confirm") return C.helps.confirm;
      if (st.screen === "flip") return C.tidy.flip.help;
      if (st.screen === "drag") return C.tidy.drag.help;
      if (st.screen === "write") return C.tidy.write.help;
      return "";
    }
    function currentFace() {
      if (st.screen === "reason" && st.reason === "custom") return "img/host-surprise.png";
      if (st.screen === "write" && st.saved) return "img/host-praise.png";
      return "img/host-default.png";
    }

    function updateChrome() {
      var idx = CHIP_OF[st.screen];
      chipEls.forEach(function (c, i) {
        c.classList.remove("now", "done");
        if (i < idx) c.classList.add("done"); else if (i === idx) c.classList.add("now");
      });
      fsBtn.textContent = st.fullscreen ? C.fsClose : C.fsOpen;

      // 사회자 그림 (한 장만, 매트 제거)
      var figH = (host.clientHeight || (st.fullscreen ? 320 : 250)) * 0.92;
      cleanFace(hostFig, currentFace(), figH);

      // 말풍선 (상황 썸네일 없음)
      bubble.innerHTML = "";
      bubble.appendChild(el("b", null, { text: C.host.name }));
      bubble.appendChild(document.createTextNode(currentHostLine()));

      updateScale();

      clabelT.textContent = currentLabel();
      helpBtn.style.display = "";
      updateHelp();

      // 버튼 줄
      var showPrev = st.screen !== "stance";
      prevBtn.style.display = showPrev ? "" : "none";
      if (st.screen === "write") {
        nextBtn.textContent = st.saved ? C.tidy.saved.btn : C.tidy.write.saveBtn;
        var canSave = st.opinion.trim().length > 0 && !st.saved;
        nextBtn.classList.toggle("ready", canSave);
        nextBtn.disabled = !canSave;
      } else {
        nextBtn.textContent = C.nextBtn;
        var ready = nextReady();
        nextBtn.classList.toggle("ready", ready);
        nextBtn.disabled = !ready;
      }
    }

    function updateHelp() {
      helpBtn.textContent = st.helpOpen ? C.helpClose : C.helpBtn;
      helpBtn.classList.toggle("open", st.helpOpen);
      if (!st.helpOpen) { helpNote.hidden = true; return; }
      helpNote.innerHTML = "";
      helpNote.appendChild(el("b", null, { text: C.helpLead }));
      helpNote.appendChild(document.createTextNode(currentHelp()));
      helpNote.hidden = false;
    }

    function updateScale() {
      var committed = reasonCommitted();
      var a = st.stance == null ? 0 : (committed ? 14 : 7);
      var theta = st.stance == null ? 0 : (st.stance === "ok" ? -a : a);
      beam.style.transform = "rotate(" + theta + "deg)";
      placePan(panL, labelL, -1, theta);
      placePan(panR, labelR, +1, theta);
      panL.classList.toggle("weighted", committed && st.stance === "ok");
      panR.classList.toggle("weighted", committed && st.stance === "no");
      labelL.className = "op-plabel " + (st.stance == null ? "" : st.stance === "ok" ? "on" : "off");
      labelR.className = "op-plabel " + (st.stance == null ? "" : st.stance === "no" ? "on" : "off");
      if (st.stance == null) scalewrap.setAttribute("aria-label", C.scaleAria.flat);
      else scalewrap.setAttribute("aria-label", C.scaleAria.tilt(C.sides[st.stance].label));
    }
    function placePan(pan, label, sign, thetaDeg) {
      var t = thetaDeg * Math.PI / 180;
      var ex = PIV.x + sign * R * Math.cos(t);
      var ey = PIV.y + sign * R * Math.sin(t);
      pan.style.left = ((ex - RING.x) / CW * 100) + "%";
      pan.style.top = ((ey - RING.y) / CH * 100) + "%";
      label.style.left = (ex / CW * 100) + "%";
      label.style.top = ((ey + 540) / CH * 100) + "%";
    }

    // ---------- 고르기 본문 ----------
    function renderChoiceBody() {
      cbody.innerHTML = "";
      if (st.screen === "stance") return renderStance();
      if (st.screen === "reason") return renderReason();
      if (st.screen === "confirm") return renderConfirm();
      if (st.screen === "flip") return renderFlip();
      if (st.screen === "drag") return renderDrag();
      if (st.screen === "write") return renderWrite();
    }

    function renderStance() {
      var row = el("div", "op-stance-row");
      [["ok", C.sides.ok.label], ["no", C.sides.no.label]].forEach(function (p) {
        var b = el("button", "op-stance-btn" + (st.stance === p[0] ? " on" : ""), { type: "button" });
        b.appendChild(el("img", null, { src: "img/weight.png", alt: "" }));
        b.appendChild(el("span", "op-jua", { text: p[1] }));
        b.addEventListener("click", function () { pickStance(p[0]); });
        row.appendChild(b);
      });
      cbody.appendChild(row);
      cbody.appendChild(el("div", "op-stance-hint", { text: C.stanceHint }));
    }

    function renderReason() {
      var list = st.stance === "no" ? C.reasons.no : C.reasons.ok;
      var grid = el("div", "op-reason-grid");
      list.forEach(function (txt, i) {
        var card = el("button", "op-reason" + (st.reason === i ? " on" : ""), { type: "button" });
        card.appendChild(el("img", null, { src: "img/weight.png", alt: "" }));
        card.appendChild(el("span", "op-reason-t", { text: txt }));
        card.appendChild(el("span", "op-stamp op-jua", { text: C.olim }));
        card.addEventListener("click", function () { pickReason(i); });
        grid.appendChild(card);
      });
      var custom = el("button", "op-reason custom" + (st.reason === "custom" ? " on" : ""), { type: "button" });
      custom.appendChild(el("span", "op-reason-t", { text: C.custom.label }));
      custom.appendChild(el("span", "op-stamp op-jua", { text: C.olim }));
      custom.addEventListener("click", function () { pickReason("custom"); });
      grid.appendChild(custom);
      cbody.appendChild(grid);

      if (st.reason === "custom") {
        var box = el("div", "op-custom-box");
        box.appendChild(el("label", null, { text: C.custom.inputLabel, for: "op-custom-input" }));
        var rowi = el("div", "op-input-row");
        var input = el("input", null, {
          id: "op-custom-input", type: "text", maxlength: String(C.custom.maxlen),
          placeholder: C.custom.placeholder, value: st.customText,
        });
        var count = el("span", "op-count", { text: st.customText.length + " / " + C.custom.maxlen });
        input.addEventListener("input", function () {
          st.customText = input.value;
          count.textContent = input.value.length + " / " + C.custom.maxlen;
          updateChrome(); fire();
        });
        rowi.appendChild(input); rowi.appendChild(count);
        box.appendChild(rowi); cbody.appendChild(box);
        setTimeout(function () { if (document.activeElement !== input) input.focus(); }, 0);
      }
    }

    function renderConfirm() {
      var wrap = el("div", "op-memo-wrap");
      var memo = el("div", "op-memo");
      memo.appendChild(el("div", "op-memo-tape"));
      memo.appendChild(el("div", "op-memo-lead", { text: C.confirmLead }));
      var row = el("div", "op-memo-row");
      row.appendChild(el("span", "op-memo-stance", { text: st.stance ? C.sides[st.stance].label : "" }));
      row.appendChild(el("span", "op-memo-reason", { text: reasonText() }));
      memo.appendChild(row); wrap.appendChild(memo); cbody.appendChild(wrap);
    }
    function reasonText() {
      if (st.reason === "custom") return st.customText;
      if (st.reason == null) return "";
      return (st.stance === "no" ? C.reasons.no : C.reasons.ok)[st.reason] || "";
    }

    // ---------- 정리 ① 카드 뒤집기 ----------
    function renderFlip() {
      var F = C.tidy.flip;
      var row = el("div", "op-flip-row");
      F.cards.forEach(function (cd, ci) {
        var chosen = st.flip[ci];
        var flip = el("button", "op-flip" + (chosen != null ? " flipped" : ""), { type: "button", "aria-label": cd.no });
        var inner = el("div", "op-flip-inner");
        // 앞면
        var front = el("div", "op-flip-face op-flip-front");
        front.appendChild(el("div", "op-flip-no", { text: cd.no }));
        front.appendChild(el("div", "op-flip-q op-jua", { text: cd.question }));
        var opts = el("div", "op-flip-opts");
        cd.options.forEach(function (o, oi) {
          var ob = el("button", "op-flip-opt", { type: "button", text: o });
          ob.addEventListener("click", function (e) { e.stopPropagation(); st.flip[ci] = oi; render(); fire(); });
          opts.appendChild(ob);
        });
        front.appendChild(opts);
        inner.appendChild(front);
        // 뒷면
        var correct = chosen === 0;
        var back = el("div", "op-flip-face op-flip-back " + (correct ? "right" : "wrong"));
        if (correct) {
          back.appendChild(el("div", "op-flip-no", { text: cd.no }));
          back.appendChild(el("div", "op-flip-key op-jua", { text: cd.key }));
          back.appendChild(el("div", "op-flip-desc", { text: cd.rightDesc }));
        } else {
          back.appendChild(el("div", "op-flip-wtitle op-jua", { text: F.wrongTitle }));
          back.appendChild(el("div", "op-flip-desc", { text: cd.wrongDesc }));
        }
        var mini = el("button", "op-flip-mini", { type: "button", text: correct ? F.frontBtn : F.retryBtn });
        mini.addEventListener("click", function (e) { e.stopPropagation(); st.flip[ci] = null; render(); fire(); });
        back.appendChild(mini);
        inner.appendChild(back);
        flip.appendChild(inner);
        row.appendChild(flip);
      });
      cbody.appendChild(row);
    }

    // ---------- 정리 ② 단어 끌어다 놓기 ----------
    var blankEls = [];
    function renderDrag() {
      var D = C.tidy.drag;
      var box = el("div", "op-drag-box");
      box.appendChild(el("div", "op-drag-q op-jua", { text: D.question }));
      var sent = el("div", "op-sent");
      blankEls = [];
      sent.appendChild(document.createTextNode(D.sentence.before));
      sent.appendChild(makeBlank(0));
      sent.appendChild(document.createTextNode(D.sentence.mid));
      sent.appendChild(makeBlank(1));
      sent.appendChild(document.createTextNode(D.sentence.after));
      box.appendChild(sent);

      var words = el("div", "op-words");
      D.words.forEach(function (w) {
        var used = st.blanks.indexOf(w) !== -1;
        var wb = el("button", "op-word" + (used ? " used" : ""), { type: "button", text: w });
        if (!used) attachWord(wb, w);
        words.appendChild(wb);
      });
      box.appendChild(words);

      var hint = el("div", "op-drag-hint" + (st.dragHint === "wrong" ? " wrong" : st.dragHint === "done" ? " done" : ""));
      if (st.dragHint === "wrong") hint.textContent = "'" + st.dragWord + "'" + eunNeun(st.dragWord) + D.hintWrongTail;
      else if (st.dragHint === "done") hint.textContent = D.hintDone;
      else hint.textContent = D.hintStart;
      box.appendChild(hint);
      cbody.appendChild(box);
    }
    function makeBlank(i) {
      var filled = st.blanks[i];
      var b = el("div", "op-blank" + (filled ? " filled" : ""), {
        "data-blank": String(i), role: "button", tabindex: "0",
        "aria-label": (filled ? filled : "빈칸 " + (i + 1)),
      });
      b.textContent = filled || "";
      if (filled) {
        b.addEventListener("click", function () { st.blanks[i] = null; st.dragHint = "start"; render(); fire(); });
        b.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); st.blanks[i] = null; st.dragHint = "start"; render(); fire(); } });
      }
      blankEls[i] = b;
      return b;
    }
    function tryPlace(word, blankIdx) {
      // blankIdx === null → 맞는 빈 칸 자동 탐색
      var D = C.tidy.drag;
      var target = -1;
      if (blankIdx == null) {
        for (var i = 0; i < 2; i++) if (!st.blanks[i] && D.blanks[i].answer === word) { target = i; break; }
      } else if (!st.blanks[blankIdx] && D.blanks[blankIdx].answer === word) {
        target = blankIdx;
      }
      if (target === -1) { st.dragHint = "wrong"; st.dragWord = word; render(); fire(); return false; }
      st.blanks[target] = word;
      st.dragHint = (st.blanks[0] && st.blanks[1]) ? "done" : "start";
      render(); fire(); return true;
    }
    function attachWord(wb, word) {
      // 누르기 / Enter → 자동 배치
      wb.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); if (!tryPlace(word, null)) bounce(wb); }
      });
      // 포인터 드래그 (마우스·터치)
      var startX, startY, moved, fly, downId;
      wb.addEventListener("pointerdown", function (e) {
        if (e.button != null && e.button !== 0) return;
        downId = e.pointerId; startX = e.clientX; startY = e.clientY; moved = false;
        try { wb.setPointerCapture(e.pointerId); } catch (x) {}
      });
      wb.addEventListener("pointermove", function (e) {
        if (downId == null) return;
        var dx = e.clientX - startX, dy = e.clientY - startY;
        if (!moved && Math.abs(dx) + Math.abs(dy) > 6) {
          moved = true;
          fly = el("div", "op-word-fly", { text: word });
          document.body.appendChild(fly);
          wb.classList.add("dragging");
        }
        if (moved && fly) { fly.style.left = (e.clientX - 30) + "px"; fly.style.top = (e.clientY - 23) + "px"; }
      });
      function finish(e) {
        if (downId == null) return;
        var id = downId; downId = null;
        try { wb.releasePointerCapture(id); } catch (x) {}
        wb.classList.remove("dragging");
        if (fly && fly.parentNode) fly.parentNode.removeChild(fly);
        fly = null;
        if (!moved) { if (!tryPlace(word, null)) bounce(wb); return; }
        // 드롭 위치의 빈칸 찾기
        var hit = null;
        for (var i = 0; i < 2; i++) {
          var be = blankEls[i]; if (!be) continue;
          var r = be.getBoundingClientRect();
          if (e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom) { hit = i; break; }
        }
        if (hit == null) return; // 빈칸 밖 → 조용히 복귀
        if (!tryPlace(word, hit)) { shakeBlank(hit); bounce(wb); }
      }
      wb.addEventListener("pointerup", finish);
      wb.addEventListener("pointercancel", finish);
    }
    function bounce(wb) {
      wb.classList.remove("bounce"); void wb.offsetWidth; wb.classList.add("bounce");
      setTimeout(function () { wb.classList.remove("bounce"); }, 500);
    }
    function shakeBlank(i) {
      var be = blankEls[i]; if (!be) return;
      be.classList.remove("shake"); void be.offsetWidth; be.classList.add("shake");
      setTimeout(function () { be.classList.remove("shake"); }, 450);
    }

    // ---------- 정리 ③ 내 의견 쓰기 ----------
    function renderWrite() {
      var W = C.tidy.write;
      var box = el("div", "op-write-box");
      var chip = W.stanceChipPrefix + (st.stance ? C.sides[st.stance].label : "");
      box.appendChild(el("div", "op-write-chip op-jua", { text: chip }));
      box.appendChild(el("div", "op-write-q op-jua", { text: W.question }));
      var area = el("div", "op-write-area");
      var ta = el("textarea", null, { rows: "3", maxlength: String(W.maxlen), placeholder: W.placeholder });
      ta.value = st.opinion;
      if (st.saved) ta.setAttribute("readonly", "");
      var count = el("div", "op-write-count", { text: st.opinion.length + " / " + W.maxlen });
      ta.addEventListener("input", function () {
        st.opinion = ta.value; count.textContent = ta.value.length + " / " + W.maxlen;
        updateChrome(); fire();
      });
      area.appendChild(ta); area.appendChild(count);
      box.appendChild(area); cbody.appendChild(box);
    }

    // ---------- 가운데 타이핑 ----------
    var typingEl = null, typingTimer = null;
    function hideTyping() {
      if (typingTimer) { clearTimeout(typingTimer); typingTimer = null; }
      if (typingEl && typingEl.parentNode) typingEl.parentNode.removeChild(typingEl);
      typingEl = null;
    }
    function showTyping() {
      hideTyping();
      if (reduced) return;
      var line = currentHostLine();
      var ov = el("div", "op-typing");
      var bub = el("div", "op-typing-bubble");
      bub.appendChild(el("div", "op-typing-name", { text: C.host.name }));
      var txt = el("div", "op-typing-text");
      var tnode = document.createTextNode("");
      var cursor = el("span", "op-typing-cursor");
      txt.appendChild(tnode); txt.appendChild(cursor);
      bub.appendChild(txt);
      bub.appendChild(el("div", "op-typing-tip", { text: C.typingHint }));
      ov.appendChild(bub);
      var bigHost = el("img", "op-typing-host", { alt: "" });
      cleanFace(bigHost, "img/host-default.png", 300);
      ov.appendChild(bigHost);
      ov.addEventListener("click", hideTyping);
      board.appendChild(ov);
      typingEl = ov;
      var i = 0;
      (function step() {
        if (typingEl !== ov) return;
        if (i < line.length) { tnode.textContent = line.slice(0, ++i); typingTimer = setTimeout(step, 45); }
        else { typingTimer = setTimeout(hideTyping, 1000); }
      })();
    }

    // ---------- 전체화면 ----------
    var backdrop = null;
    function setFullscreen(on) {
      if (on === st.fullscreen) return;
      st.fullscreen = on;
      if (on) {
        backdrop = el("div", "op-root op-fs-backdrop");
        root.parentNode.insertBefore(backdrop, root);
        backdrop.appendChild(board);
      } else {
        root.appendChild(board);
        if (backdrop && backdrop.parentNode) backdrop.parentNode.removeChild(backdrop);
        backdrop = null;
      }
      updateChrome();
      onFullscreen(on);
    }

    // ---------- 키보드 ----------
    function onKey(e) {
      if (typingEl) {
        if (e.key === "Enter" || e.key === "Escape" || e.key === " ") { e.preventDefault(); hideTyping(); return; }
      }
      if (e.key === "Escape" && st.fullscreen) setFullscreen(false);
    }
    document.addEventListener("keydown", onKey);

    // 첫 그리기 + 첫 타이핑
    render();
    showTyping();

    return {
      getValue: getValue,
      setValue: function (v) { applyValue(v, false); },
      destroy: function () {
        document.removeEventListener("keydown", onKey);
        hideTyping();
        if (backdrop && backdrop.parentNode) backdrop.parentNode.removeChild(backdrop);
        root.innerHTML = ""; root.classList.remove("op-root");
      },
    };
  }

  window.OpinionScale = { mount: mount };
})();
