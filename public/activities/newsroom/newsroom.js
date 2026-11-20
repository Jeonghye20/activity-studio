/* =========================================================
   뉴스룸 웹북 모듈 (독립 실행)
   Newsroom.mount(root, { content, answers, embedded, onChange, onFullscreen, onReady })
     → { getState(), getValue(), setAnswers(on), reset(), setFullscreen(on), destroy() }
   - 글·숫자는 content(= content.js)에서만 읽는다.
   ========================================================= */
(function () {
  "use strict";

  var BOOK_W = 1240;

  function el(tag, cls, attrs, kids) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (attrs) for (var k in attrs) {
      if (k === "text") e.textContent = attrs[k];
      else if (k === "html") e.innerHTML = attrs[k];
      else if (/^on[A-Z]/.test(k)) e.addEventListener(k.slice(2).toLowerCase(), attrs[k]);
      else if (attrs[k] != null) e.setAttribute(k, attrs[k]);
    }
    if (kids) (Array.isArray(kids) ? kids : [kids]).forEach(function (c) {
      if (c == null) return;
      e.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    });
    return e;
  }
  function asset(name) { return "assets/" + name + ".webp"; }
  function img(name, cls, alt) { return el("img", cls, { src: asset(name), alt: alt || "", draggable: "false" }); }

  // 대괄호 [..] → 형광펜 강조 span
  function markup(text, cls) {
    var frag = document.createDocumentFragment();
    String(text).split(/(\[[^\]]*\])/).forEach(function (p) {
      if (p.charAt(0) === "[" && p.charAt(p.length - 1) === "]") frag.appendChild(el("span", cls, { text: p.slice(1, -1) }));
      else if (p) frag.appendChild(document.createTextNode(p));
    });
    return frag;
  }

  // 지시문: 맨 앞 숫자를 청록 네모 배지로, 나머지는 형광펜 강조
  function instEl(text, hlCls) {
    var wrap = el("div", "nr-inst");
    var m = String(text).match(/^(\d+)\s+([\s\S]*)$/);
    if (m) { wrap.appendChild(el("span", "nr-inst-badge", { text: m[1] })); wrap.appendChild(markup(m[2], hlCls)); }
    else wrap.appendChild(markup(text, hlCls));
    return wrap;
  }

  function mount(root, opts) {
    opts = opts || {};
    var C = opts.content || window.NEWSROOM_CONTENT;
    var onChange = typeof opts.onChange === "function" ? opts.onChange : function () {};
    var onFullscreen = typeof opts.onFullscreen === "function" ? opts.onFullscreen : function () {};
    var embedded = !!opts.embedded;
    var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    var st = freshState();
    st.answers = !!opts.answers;
    function freshState() {
      return {
        page: 1,
        clip: 0, playing: !reduced, videoDone: false,
        selCard: 0,
        placed: C.ch2.cards.map(function () { return false; }),
        bars: { 동영상: 0, 학습: 0, 게임: 0, SNS: 0 },
        wrong2: C.ch2.cards.map(function () { return 0; }),
        help2: 0, table2: false, streak: 0,
        activeClaim: 0,
        claims: C.ch3.claims.map(function () { return { verdict: null, evidence: false, wrong: 0 }; }),
        help3: 0, ruler: null,
        choice: null, ch4wrong: false,
        answers: false, fullscreen: false,
      };
    }

    // ---------- 완료·잠금 ----------
    function placedCount() { return st.placed.filter(Boolean).length; }
    function claimDone(i) { var c = st.claims[i], d = C.ch3.claims[i]; return c.verdict === d.answer && c.evidence; }
    function ch2done() { return placedCount() === C.ch2.cards.length; }
    function ch3done() { return st.claims.every(function (c, i) { return claimDone(i); }); }
    function ch4done() { return st.choice != null && C.ch4.options[st.choice].correct; }
    function chapterDone(n) { return n === 1 ? (st.videoDone || st.page > 1) : n === 2 ? ch2done() : n === 3 ? ch3done() : n === 4 ? ch4done() : ch4done(); }
    function unlocked(n) { if (st.answers) return true; return n <= 2 ? true : n === 3 ? ch2done() : n === 4 ? ch3done() : ch4done(); }
    function canAdvance() { if (st.answers) return true; var n = st.page; return n === 1 ? true : n === 2 ? ch2done() : n === 3 ? ch3done() : n === 4 ? ch4done() : false; }

    function getValue() {
      return { saved: ch4done(), page: st.page, cards: placedCount(), claims: claimsDone2(), choice: st.choice };
    }
    function claimsDone2() { return st.claims.filter(function (c, i) { return claimDone(i); }).length; }
    function fire() { onChange(getValue()); }

    // ---------- 뼈대 ----------
    root.classList.add("nr-root");
    if (reduced) root.classList.add("nr-reduced");
    root.innerHTML = "";

    // 전체화면 안내 띠 (활동지에 끼워져 책이 줄어 있을 때만 보인다. 책과 함께 줄지 않음)
    var banner = el("div", "nr-cta");
    var ctaIcon = cornerIcon();
    var ctaText = el("div", "nr-cta-text", null, [
      el("div", "nr-cta-title", { text: C.ctaTitle }),
      el("div", "nr-cta-sub", { text: C.ctaSub }),
    ]);
    var ctaBtn = el("button", "nr-cta-btn", { type: "button", text: C.ctaBtn });
    ctaBtn.addEventListener("click", function () { setFullscreen(true); });
    banner.appendChild(el("div", "nr-cta-l", null, [ctaIcon, ctaText]));
    banner.appendChild(ctaBtn);
    banner.style.display = "none";
    root.appendChild(banner);

    var scaler = el("div", "nr-scaler");
    var book = el("div", "nr-book");
    scaler.appendChild(book);
    root.appendChild(scaler);

    var cover = el("div", "nr-cover");
    var paper = el("div", "nr-paper");
    cover.appendChild(paper);
    cover.appendChild(el("div", "nr-stack"));
    book.appendChild(cover);

    // 머리줄
    var head = el("div", "nr-head");
    head.appendChild(el("div", "nr-head-title", { text: C.paperTitle }));
    var headR = el("div", "nr-head-r");
    var fsTop = el("button", "nr-fstop", { type: "button", title: C.fsOpen }, [cornerIcon(), el("span", null, { text: C.fsOpen })]);
    fsTop.addEventListener("click", function () { setFullscreen(true); });
    var stampWrap = el("div", "nr-stamps");
    stampWrap.appendChild(el("span", "nr-stamp-label", { text: C.stampLabel }));
    var stampDots = [];
    for (var i = 0; i < 5; i++) { var d = el("span", "nr-stamp-dot"); stampDots.push(d); stampWrap.appendChild(d); }
    var pageNum = el("span", "nr-pagenum");
    headR.appendChild(fsTop); headR.appendChild(stampWrap); headR.appendChild(pageNum);
    head.appendChild(headR);
    paper.appendChild(head);

    // 정답 보기 띠
    var band = el("div", "nr-band", { text: C.answersBand });
    paper.appendChild(band);

    // 본문 무대
    var stage = el("div", "nr-stage");
    paper.appendChild(stage);

    // 발바닥 줄
    var foot = el("div", "nr-foot");
    var footLabel = el("span", "nr-foot-label");
    var fold = el("button", "nr-fold", { type: "button", title: C.turn }, [el("span", "nr-fold-corner"), el("span", "nr-fold-t", { text: C.turn })]);
    fold.addEventListener("click", function () { tryNext(); });
    foot.appendChild(footLabel); foot.appendChild(fold);
    paper.appendChild(foot);

    // 버튼 줄
    var btnrow = el("div", "nr-btnrow");
    var tabs = el("div", "nr-tabs");
    btnrow.appendChild(tabs);
    var actions = el("div", "nr-actions");
    var restartBtn = el("button", "nr-abtn", { type: "button", text: C.restart });
    restartBtn.addEventListener("click", doReset);
    var fsBtn = el("button", "nr-abtn", { type: "button" });
    fsBtn.addEventListener("click", function () { setFullscreen(!st.fullscreen); });
    var prevBtn = el("button", "nr-abtn", { type: "button", text: C.prevBtn });
    prevBtn.addEventListener("click", goPrev);
    var nextBtn = el("button", "nr-next", { type: "button" });
    nextBtn.addEventListener("click", tryNext);
    actions.appendChild(restartBtn); actions.appendChild(fsBtn); actions.appendChild(prevBtn); actions.appendChild(nextBtn);
    btnrow.appendChild(actions);
    book.appendChild(btnrow);

    // ---------- 아이콘 ----------
    function cornerIcon() {
      var ns = "http://www.w3.org/2000/svg";
      var s = document.createElementNS(ns, "svg");
      s.setAttribute("viewBox", "0 0 24 24"); s.setAttribute("class", "nr-ic");
      s.innerHTML = '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>';
      return s;
    }
    function lockIcon() {
      var ns = "http://www.w3.org/2000/svg";
      var s = document.createElementNS(ns, "svg");
      s.setAttribute("viewBox", "0 0 24 24"); s.setAttribute("class", "nr-ic");
      s.innerHTML = '<rect x="5" y="11" width="14" height="9" rx="2" fill="currentColor"/><path d="M8 11V8a4 4 0 0 1 8 0v3" fill="none" stroke="currentColor" stroke-width="2"/>';
      return s;
    }

    // ---------- 화면 틀 갱신 ----------
    function syncChrome() {
      root.classList.toggle("nr-fs", st.fullscreen);
      book.classList.toggle("nr-ans", st.answers);
      band.style.display = st.answers ? "" : "none";
      pageNum.textContent = st.page + " / 5";
      footLabel.textContent = "— " + st.page + " / 5 —";
      fsBtn.textContent = st.fullscreen ? C.fsSmall : C.fsBig;
      fsTop.style.display = st.fullscreen ? "none" : "";

      // 도장 동그라미
      stampDots.forEach(function (dot, k) {
        var done = chapterDone(k + 1);
        dot.classList.toggle("done", done);
        if (done && !dot.firstChild) dot.appendChild(img("stamp-round", "nr-stamp-img"));
        if (!done && dot.firstChild) dot.innerHTML = "";
      });

      // 장 이름표
      tabs.innerHTML = "";
      C.chapters.forEach(function (name, k) {
        var n = k + 1, cur = n === st.page, done = chapterDone(n), lk = !unlocked(n);
        var t = el("button", "nr-tab" + (cur ? " cur" : "") + (done && !cur ? " done" : "") + (lk && !cur ? " lock" : ""), { type: "button" });
        if (cur) { t.appendChild(el("span", "nr-tab-no", { text: String(n) })); t.appendChild(el("span", "nr-tab-name", { text: name })); }
        else { var no = el("span", "nr-tab-no", { text: done ? "✓" : String(n) }); t.appendChild(no); }
        t.addEventListener("click", function () {
          if (unlocked(n)) { if (n !== st.page) goPage(n); }
          else { shake(t); editorSay && editorSay(C.lockSay, "surprise"); }
        });
        tabs.appendChild(t);
      });

      // 이전·다음
      prevBtn.style.display = st.page > 1 ? "" : "none";
      nextBtn.innerHTML = "";
      nextBtn.className = "nr-next";
      if (st.page >= 5) { nextBtn.style.display = "none"; }
      else {
        nextBtn.style.display = "";
        if (canAdvance()) {
          nextBtn.disabled = false; nextBtn.classList.add("go");
          nextBtn.textContent = C.nextLabels[st.page - 1];
          if (st.page === 1 && st.videoDone) nextBtn.classList.add("pulse");
        } else {
          nextBtn.disabled = true; nextBtn.classList.add("locked");
          nextBtn.appendChild(lockIcon());
          var lab = st.page === 2 ? C.lockLabels.ch2(C.ch2.cards.length - placedCount())
            : st.page === 3 ? C.lockLabels.ch3(3 - claimsDone2()) : C.lockLabels.ch4();
          nextBtn.appendChild(el("span", null, { text: lab }));
        }
      }
      // 넘기기 모서리
      fold.style.display = (st.page < 5 && canAdvance()) ? "" : "none";
    }

    // ---------- 편집장 줄 ----------
    var editorSay = null; // 현재 장의 편집장 말하기 함수
    function makeEditorRow(firstLine) {
      var face = img(C.editor.faceDefault, "nr-ed-face", "편집장");
      var faceWrap = el("div", "nr-ed-facew", null, [face]);
      var bubble = el("div", "nr-ed-bubble");
      bubble.appendChild(el("b", null, { text: C.editor.name }));
      var line = el("span", "nr-ed-line", { text: firstLine });
      bubble.appendChild(line);
      var rowEl = el("div", "nr-ed-row", null, [faceWrap, bubble]);
      var backT = null;
      function say(text, mood) {
        line.textContent = text;
        face.src = asset(mood === "praise" ? C.editor.facePraise : mood === "surprise" ? C.editor.faceSurprise : C.editor.faceDefault);
        faceWrap.classList.remove("jump", "wob");
        void faceWrap.offsetWidth;
        if (!reduced) faceWrap.classList.add(mood === "praise" ? "jump" : mood === "surprise" ? "wob" : "");
        if (backT) clearTimeout(backT);
        if (mood && mood !== "default") backT = setTimeout(function () { face.src = asset(C.editor.faceDefault); faceWrap.classList.remove("jump", "wob"); }, 1600);
      }
      editorSay = say;
      return { el: rowEl, say: say };
    }
    function shake(elm) { if (reduced) return; elm.classList.remove("nr-shake"); void elm.offsetWidth; elm.classList.add("nr-shake"); setTimeout(function () { elm.classList.remove("nr-shake"); }, 450); }

    // ---------- 그래프 ----------
    var PLOT = 300;
    function buildGraph(cfg) {
      // cfg: { values(key->num), interactive, onBar(key,barEl), mini, showNames, plot }
      var plotH = cfg.plot || (cfg.mini ? 120 : PLOT);
      var max = C.axisMax;
      var wrap = el("div", "nr-graph" + (cfg.mini ? " mini" : ""));
      if (cfg.title) wrap.appendChild(el("div", "nr-graph-title", { text: cfg.title }));
      var area = el("div", "nr-plotarea");
      var axis = el("div", "nr-axis");
      var plot = el("div", "nr-plot");
      plot.style.height = plotH + "px";
      if (!cfg.mini) {
        for (var v = max; v >= 0; v -= 5) {
          var y = plotH - (v / max) * plotH;
          axis.appendChild(el("span", "nr-ytick", { style: "top:" + y + "px" }, [String(v)]));
          plot.appendChild(el("span", "nr-grid", { style: "bottom:" + (v / max) * plotH + "px" }));
        }
      }
      var bars = {};
      var cols = el("div", "nr-cols");
      C.cats.forEach(function (cat) {
        var val = cfg.values[cat.key] || 0;
        var hp = (val / max) * plotH;
        var col = el("div", "nr-col");
        var fill = el("div", "nr-bar", { style: "height:" + hp + "px" });
        if (cfg.mini && cat.key === "동영상") fill.classList.add("hot");
        var pill = null;
        if (!cfg.mini) { pill = el("span", "nr-bar-val"); if (val > 0) pill.textContent = val + "시간"; fill.appendChild(pill); }
        col.appendChild(fill);
        if (cfg.showNames !== false) {
          var nm = el("div", "nr-col-name");
          nm.appendChild(img(cat.icon, "nr-col-ic"));
          nm.appendChild(el("span", null, { text: cat.key }));
          col.appendChild(nm);
        }
        if (cfg.interactive) {
          col.classList.add("tap");
          col.setAttribute("role", "button");
          col.setAttribute("tabindex", "0");
          col.setAttribute("aria-label", cat.key + " 막대");
          col.addEventListener("click", function () { cfg.onBar(cat.key, fill, col); });
          col.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); cfg.onBar(cat.key, fill, col); } });
        }
        bars[cat.key] = { fill: fill, pill: pill, col: col };
        cols.appendChild(col);
      });
      plot.appendChild(cols);
      area.appendChild(axis); area.appendChild(plot);
      wrap.appendChild(area);
      wrap.plotH = plotH;
      return { el: wrap, bars: bars, plot: plot, plotH: plotH,
        setValue: function (key, v, animate) {
          var b = bars[key]; if (!b) return;
          b.fill.style.height = (v / max) * plotH + "px";
          if (b.pill) b.pill.textContent = v > 0 ? v + "시간" : "";
          if (animate && !reduced) { b.fill.classList.remove("pop"); void b.fill.offsetWidth; b.fill.classList.add("pop"); }
        } };
    }

    // ---------- 페이지 이동 ----------
    function goPage(n, dir) {
      if (n === st.page && dir == null) { return; }
      dir = dir || (n > st.page ? 1 : -1);
      st.page = n; st.help2 = 0; st.help3 = 0; st.table2 = false; st.ruler = null;
      editorSay = null;
      renderStage();
      if (!reduced) { stage.classList.remove("nr-turn-next", "nr-turn-prev"); void stage.offsetWidth; stage.classList.add(dir >= 0 ? "nr-turn-next" : "nr-turn-prev"); }
      syncChrome(); layout(); fire();
    }
    function goPrev() { if (st.page > 1) goPage(st.page - 1, -1); }
    function tryNext() {
      if (st.page >= 5) return;
      if (!canAdvance()) { if (editorSay) editorSay(C.lockSay, "surprise"); return; }
      goPage(st.page + 1, 1);
    }
    function afterChange() { syncChrome(); layout(); fire(); }

    function renderStage() {
      stage.innerHTML = "";
      var content = st.page === 1 ? renderCh1() : st.page === 2 ? renderCh2() : st.page === 3 ? renderCh3() : st.page === 4 ? renderCh4() : renderCh5();
      stage.appendChild(content);
    }

    // ====================================================
    //  1장 취재 영상
    // ====================================================
    function renderCh1() {
      var K = C.ch1;
      var wrap = el("div", "nr-ch1");

      // 왼쪽 목차
      var tocCol = el("div", "nr-toc");
      tocCol.appendChild(el("div", "nr-toc-title", null, [img("prop-notebook", "nr-toc-nb"), el("span", null, { text: K.notebookTitle })]));
      tocCol.appendChild(el("div", "nr-toc-desc", { text: K.notebookDesc }));
      var list = el("ol", "nr-toc-list");
      K.toc.forEach(function (t) {
        list.appendChild(el("li", null, null, [el("span", "nr-toc-n", { text: String(t.n) }), el("span", "nr-toc-name", { text: t.name }), el("span", "nr-toc-side", { text: t.side })]));
      });
      tocCol.appendChild(list);

      // 가운데 폰
      var phone = el("div", "nr-phone");
      var prog = el("div", "nr-phone-prog");
      var progCells = K.clips.map(function () { return el("span", "nr-prog-cell"); });
      progCells.forEach(function (c) { prog.appendChild(c); });
      var chan = el("div", "nr-phone-chan", null, [el("span", "nr-chan-dot", { text: "별" }), el("span", "nr-chan-name", { text: K.channel }), el("span", "nr-chan-sub", { text: K.sub })]);
      var screen = el("div", "nr-phone-screen");
      var scene = el("img", "nr-phone-img", { alt: "", draggable: "false" });
      var phoneOverlay = el("div", "nr-phone-overlay");
      var side = el("div", "nr-phone-side", null, [
        el("div", "nr-side-item", null, [heartIcon(), el("span", null, { text: "128" })]),
        el("div", "nr-side-item", null, [bubbleIcon(), el("span", null, { text: "24" })]),
        el("div", "nr-side-item", null, [shareIcon()]),
      ]);
      var cap = el("div", "nr-phone-cap");
      var tapL = el("button", "nr-phone-tap l", { type: "button", "aria-label": "앞 장면" });
      var tapR = el("button", "nr-phone-tap r", { type: "button", "aria-label": "다음 장면" });
      var playBtn = el("button", "nr-phone-play", { type: "button" });
      var footTag = el("div", "nr-phone-foot", { text: K.foot });
      screen.appendChild(scene); screen.appendChild(phoneOverlay); screen.appendChild(side); screen.appendChild(cap);
      screen.appendChild(tapL); screen.appendChild(tapR); screen.appendChild(playBtn); screen.appendChild(footTag);
      phone.appendChild(prog); phone.appendChild(chan); phone.appendChild(screen);

      // 오른쪽
      var rightCol = el("div", "nr-ch1-right");
      rightCol.appendChild(img("ed-default", "nr-ed-full bob"));
      var b1 = el("div", "nr-ch1-bubble", null, [el("b", null, { text: C.editor.name }), el("span", null, { text: K.editorBubble })]);
      var b2 = el("div", "nr-ch1-bubble minjun", null, [el("b", null, { text: "민준" }), el("span", null, { text: K.minjunBubble })]);
      var startBtn = el("button", "nr-ch1-start", { type: "button", text: K.startBtn });
      var replayBtn = el("button", "nr-ch1-replay", { type: "button", text: K.replayBtn });
      startBtn.addEventListener("click", function () {
        // 활동지 안 일반 화면에서는 전체화면으로 들어가면서 2장으로 넘어간다
        if (embedded && !st.fullscreen) setFullscreen(true);
        tryNext();
      });
      replayBtn.addEventListener("click", function () { st.clip = 0; st.playing = true; st.videoDone = false; paintClip(); runTimer(); afterChange(); });
      rightCol.appendChild(b1); rightCol.appendChild(b2); rightCol.appendChild(startBtn); rightCol.appendChild(replayBtn);

      wrap.appendChild(tocCol); wrap.appendChild(phone); wrap.appendChild(rightCol);

      // 장면 동작
      var timer = null;
      function paintClip() {
        var cl = K.clips[st.clip];
        scene.src = asset(cl.img);
        if (!reduced) { scene.classList.remove("zin"); void scene.offsetWidth; scene.classList.add("zin"); }
        progCells.forEach(function (c, i) { c.classList.toggle("on", i <= st.clip); });
        cap.innerHTML = ""; cap.appendChild(markup(cl.cap, "nr-cap-hl"));
        phoneOverlay.innerHTML = "";
        if (cl.phone) {
          var po = el("div", "nr-phone-num");
          po.appendChild(el("div", "nr-pn-top", { text: cl.phone.top }));
          po.appendChild(el("div", "nr-pn-big", { text: cl.phone.big }));
          po.appendChild(el("div", "nr-pn-bot", { text: cl.phone.bottom }));
          phoneOverlay.appendChild(po);
        }
        playBtn.textContent = st.playing ? "❚❚" : "▶";
        startBtn.classList.toggle("pulse", st.videoDone);
        replayBtn.style.display = st.videoDone ? "" : "none";
      }
      function stopTimer() { if (timer) { clearTimeout(timer); timer = null; } }
      function runTimer() {
        stopTimer();
        if (!st.playing || reduced) return;
        timer = setTimeout(function () {
          if (st.clip < K.clips.length - 1) { st.clip++; paintClip(); runTimer(); afterChange(); }
          else { st.playing = false; st.videoDone = true; paintClip(); afterChange(); }
        }, 3600);
      }
      function go(delta) {
        stopTimer();
        var n = st.clip + delta;
        if (n < 0) n = 0;
        if (n >= K.clips.length) { n = K.clips.length - 1; st.videoDone = true; st.playing = false; }
        st.clip = n; paintClip();
        if (st.clip === K.clips.length - 1 && delta > 0) { st.videoDone = true; st.playing = false; paintClip(); }
        if (st.playing) runTimer();
        afterChange();
      }
      tapL.addEventListener("click", function () { go(-1); });
      tapR.addEventListener("click", function () { go(1); });
      playBtn.addEventListener("click", function () {
        if (st.videoDone) { st.clip = 0; st.videoDone = false; }
        st.playing = !st.playing; paintClip(); runTimer(); afterChange();
      });

      wrap._cleanup = stopTimer;
      cleanups.push(stopTimer);
      paintClip(); runTimer();
      return wrap;
    }
    function heartIcon() { return svg('<path d="M12 21s-7-4.5-7-9.5A3.5 3.5 0 0 1 12 8a3.5 3.5 0 0 1 7 3.5C19 16.5 12 21 12 21z" fill="#fff"/>', "nr-sic heart"); }
    function bubbleIcon() { return svg('<path d="M4 5h16v11H9l-4 4V5z" fill="#fff"/>', "nr-sic"); }
    function shareIcon() { return svg('<path d="M4 12v7h16v-7M12 3v12M8 7l4-4 4 4" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>', "nr-sic"); }
    function svg(inner, cls) { var ns = "http://www.w3.org/2000/svg"; var s = document.createElementNS(ns, "svg"); s.setAttribute("viewBox", "0 0 24 24"); s.setAttribute("class", cls); s.innerHTML = inner; return s; }

    // ====================================================
    //  2장 정리하기
    // ====================================================
    function renderCh2() {
      var K = C.ch2;
      var wrap = el("div", "nr-ch2");
      var edRow = makeEditorRow(K.editorFirst);
      wrap.appendChild(edRow.el);

      var cols = el("div", "nr-ch2-cols");
      var leftCol = el("div", "nr-ch2-left");
      leftCol.appendChild(instEl(K.inst, "nr-hl"));
      var timeline = el("div", "nr-timeline");
      var cardEls = [];
      K.days.forEach(function (day, di) {
        var rowEl = el("div", "nr-day-row");
        var dc = el("div", "nr-day-circle");
        if (di >= 5) dc.classList.add("weekend");
        dc.appendChild(el("span", "nr-day-txt", { text: day }));
        var nowTag = el("span", "nr-day-now", { text: K.now });
        dc.appendChild(nowTag);
        var cardWrap = el("div", "nr-day-cards");
        rowEl.appendChild(dc); rowEl.appendChild(cardWrap);
        K.cards.forEach(function (card, ci) {
          if (card.day !== di) return;
          var cEl = el("button", "nr-card", { type: "button" });
          cEl.appendChild(img(card.icon, "nr-card-ic"));
          var body = el("div", "nr-card-body", null, [el("div", "nr-card-label", { text: card.label }), el("div", "nr-card-time", { text: card.time + "시간" })]);
          cEl.appendChild(body);
          var check = el("span", "nr-card-check", { text: "✓" });
          cEl.appendChild(check);
          cEl.addEventListener("click", function () { if (!st.placed[ci]) { st.selCard = ci; paint(); } });
          cardEls[ci] = { el: cEl, dayCircle: dc, nowTag: nowTag };
          cardWrap.appendChild(cEl);
        });
        timeline._rows = timeline._rows || [];
        timeline.appendChild(rowEl);
      });
      leftCol.appendChild(timeline);

      var rightCol = el("div", "nr-ch2-right");
      var graph = buildGraph({ values: st.bars, title: K.graphTitle, interactive: true, onBar: onBar });
      rightCol.appendChild(graph.el);
      var warnBox = el("div", "nr-warn"); warnBox.style.display = "none";
      rightCol.appendChild(warnBox);
      var gbtns = el("div", "nr-gbtns");
      var helpBtn = el("button", "nr-gbtn", { type: "button", text: K.helpBtn });
      var tableBtn = el("button", "nr-gbtn", { type: "button", text: K.tableBtn });
      gbtns.appendChild(helpBtn); gbtns.appendChild(tableBtn);
      rightCol.appendChild(gbtns);
      var helpNote = el("div", "nr-help"); helpNote.style.display = "none";
      rightCol.appendChild(helpNote);

      // 기준표 (카드 묶음 위 덮개)
      var tableOverlay = el("div", "nr-table"); tableOverlay.style.display = "none";
      tableOverlay.appendChild(el("div", "nr-table-title", { text: K.tableTitle }));
      C.cats.forEach(function (cat) {
        tableOverlay.appendChild(el("div", "nr-table-row", null, [img(cat.icon, "nr-table-ic"), el("span", "nr-table-name", { text: cat.key }), el("span", "nr-table-mean", { text: cat.mean })]));
      });
      leftCol.appendChild(tableOverlay);

      cols.appendChild(leftCol); cols.appendChild(rightCol);
      wrap.appendChild(cols);

      helpBtn.addEventListener("click", function () { st.help2 = st.help2 >= 2 ? 0 : st.help2 + 1; paintHelp(); });
      tableBtn.addEventListener("click", function () { st.table2 = !st.table2; tableOverlay.style.display = st.table2 ? "" : "none"; tableBtn.classList.toggle("on", st.table2); });

      function paintHelp() {
        if (!st.help2) { helpNote.style.display = "none"; return; }
        helpNote.className = "nr-help";
        helpNote.textContent = st.help2 === 1 ? K.help1 : help2Text();
        helpNote.style.display = "";
      }
      function help2Text() {
        var card = K.cards[firstUnplaced()] || K.cards[st.selCard];
        var cat = catOf(card.cat);
        return "도움말 2 · " + card.label + " 카드는 " + cat.help2;
      }
      function firstUnplaced() { for (var i = 0; i < st.placed.length; i++) if (!st.placed[i]) return i; return st.selCard; }
      function catOf(key) { return C.cats.filter(function (c) { return c.key === key; })[0]; }

      function onBar(key, fill, col) {
        if (ch2done()) return;
        var ci = st.selCard;
        if (st.placed[ci]) ci = firstUnplaced();
        var card = K.cards[ci];
        if (card.cat === key) {
          st.placed[ci] = true;
          st.bars[key] += card.time;
          graph.setValue(key, st.bars[key], true);
          floatPlus(fill, card.time);
          st.streak++;
          // 다음 카드 자동 선택
          var nx = firstUnplaced();
          st.selCard = nx;
          // 편집장 대사
          var n = placedCount();
          if (ch2done()) { edRow.say(K.doneLine, "praise"); confetti(graph.el); }
          else if (st.streak >= 3) edRow.say(K.streakLine(st.streak), "praise");
          else if (n === 8) edRow.say(K.halfLine, "praise");
          else edRow.say(K.okLines[(n - 1) % K.okLines.length], "praise");
          warnBox.style.display = "none";
          paint(); afterChange();
        } else {
          st.streak = 0;
          st.wrong2[ci]++;
          shake(col); col.classList.add("wrongflash");
          setTimeout(function () { col.classList.remove("wrongflash"); }, 600);
          edRow.say(K.wrongLine, "surprise");
          warnBox.textContent = K.wrongBox; warnBox.style.display = "";
          if (st.wrong2[ci] >= 2) { st.help2 = 2; paintHelp(); }
        }
      }

      function floatPlus(fill, n) {
        if (reduced) return;
        var p = el("span", "nr-float", { text: "+" + n });
        fill.appendChild(p);
        setTimeout(function () { if (p.parentNode) p.parentNode.removeChild(p); }, 900);
      }
      function confetti(host) {
        if (reduced) return;
        var box = el("div", "nr-confetti");
        for (var i = 0; i < 16; i++) { var s = el("span"); s.style.left = (10 + Math.floor(i * 5.3)) + "%"; s.style.animationDelay = (i % 5 * 40) + "ms"; box.appendChild(s); }
        host.appendChild(box);
        setTimeout(function () { if (box.parentNode) box.parentNode.removeChild(box); }, 1200);
      }

      function paint() {
        wrap.classList.toggle("done", ch2done());
        cardEls.forEach(function (ref, ci) {
          if (!ref) return;
          ref.el.classList.toggle("placed", st.placed[ci]);
          ref.el.classList.toggle("sel", ci === st.selCard && !st.placed[ci]);
          // 정답 보기: 남은 카드에 칸 이름표
          var ans = ref.el.querySelector(".nr-card-ans");
          if (st.answers && !st.placed[ci]) {
            if (!ans) { ans = el("span", "nr-card-ans"); ref.el.appendChild(ans); }
            ans.textContent = K.cards[ci].cat;
          } else if (ans) ans.remove();
        });
        // 요일 동그라미 상태
        var selDay = K.cards[st.selCard] ? K.cards[st.selCard].day : -1;
        var rows = timeline.querySelectorAll(".nr-day-row");
        rows.forEach(function (r, di) {
          var dayCards = K.cards.map(function (c, i) { return c.day === di ? i : -1; }).filter(function (i) { return i >= 0; });
          var allP = dayCards.every(function (i) { return st.placed[i]; });
          var dc = r.querySelector(".nr-day-circle");
          dc.classList.toggle("done", allP);
          dc.classList.toggle("now", di === selDay && !allP);
        });
        // 정답 보기: 막대 목표 점선
        paintAnswerTargets();
      }
      function paintAnswerTargets() {
        C.cats.forEach(function (cat) {
          var b = graph.bars[cat.key];
          var tgt = b.col.querySelector(".nr-target");
          if (st.answers) {
            if (!tgt) {
              tgt = el("div", "nr-target");
              tgt.appendChild(el("span", "nr-target-pill", { text: "목표 " + C.totals[cat.key] }));
              b.col.insertBefore(tgt, b.col.firstChild);
            }
            tgt.style.height = (C.totals[cat.key] / C.axisMax) * graph.plotH + "px";
          } else if (tgt) tgt.remove();
        });
      }

      paintHelp(); paint();
      return wrap;
    }

    // ====================================================
    //  3장 팩트 체크
    // ====================================================
    function renderCh3() {
      var K = C.ch3;
      var wrap = el("div", "nr-ch3");
      var edRow = makeEditorRow(K.editorFirst);
      wrap.appendChild(edRow.el);

      var cols = el("div", "nr-ch3-cols");
      var leftCol = el("div", "nr-ch3-left");
      leftCol.appendChild(instEl(K.inst, "nr-hl"));
      var claimWrap = el("div", "nr-claims");
      var claimEls = [];
      K.claims.forEach(function (cl, i) {
        var cEl = el("div", "nr-claim");
        cEl.appendChild(img(cl.av, "nr-claim-av", cl.reader));
        var body = el("div", "nr-claim-body");
        body.appendChild(el("div", "nr-claim-meta", null, [el("span", null, { text: cl.reader + " " }), el("span", "nr-claim-heart", { text: "♥" }), el("span", null, { text: " " + cl.hearts })]));
        body.appendChild(el("div", "nr-claim-text", { text: cl.text }));
        var actions = el("div", "nr-claim-actions");
        body.appendChild(actions);
        var line = el("div", "nr-claim-evi"); line.style.display = "none";
        body.appendChild(line);
        cEl.appendChild(body);
        var stamp = el("div", "nr-claim-stamp"); stamp.style.display = "none";
        cEl.appendChild(stamp);
        cEl.addEventListener("click", function () { if (i !== st.activeClaim && !st.answers) { st.activeClaim = i; paint(); } });
        claimEls[i] = { el: cEl, actions: actions, line: line, stamp: stamp, body: body };
        claimWrap.appendChild(cEl);
      });
      leftCol.appendChild(claimWrap);

      var rightCol = el("div", "nr-ch3-right");
      var graph = buildGraph({ values: K.barValues, title: C.ch2.graphTitle, interactive: true, onBar: onBar });
      rightCol.appendChild(graph.el);
      var warnBox = el("div", "nr-warn"); warnBox.style.display = "none";
      rightCol.appendChild(warnBox);
      var helpBtn = el("button", "nr-gbtn", { type: "button", text: K.helpBtn });
      rightCol.appendChild(el("div", "nr-gbtns", null, [helpBtn]));
      var helpNote = el("div", "nr-help"); helpNote.style.display = "none";
      rightCol.appendChild(helpNote);
      helpBtn.addEventListener("click", function () { st.help3 = st.help3 >= 2 ? 0 : st.help3 + 1; paintHelp(); });
      function paintHelp() {
        if (!st.help3) { helpNote.style.display = "none"; return; }
        helpNote.textContent = st.help3 === 1 ? K.help1 : K.claims[st.activeClaim].help2;
        helpNote.style.display = "";
      }

      cols.appendChild(leftCol); cols.appendChild(rightCol);
      wrap.appendChild(cols);

      function clearRuler() {
        var old = graph.plot.querySelector(".nr-ruler"); if (old) old.remove();
        C.cats.forEach(function (c) { graph.bars[c.key].fill.classList.remove("evi"); });
      }
      function putRuler(key) {
        clearRuler();
        var v = K.barValues[key];
        var hp = (v / C.axisMax) * graph.plotH;
        var r = el("div", "nr-ruler", { style: "bottom:" + (hp - 5) + "px" });
        r.appendChild(img("prop-ruler", "nr-ruler-img"));
        r.appendChild(el("span", "nr-ruler-pill", { text: K.heightLabel(v) }));
        graph.plot.appendChild(r);
      }

      function onBar(key, fill, col) {
        var i = st.activeClaim, cl = K.claims[i], sc = st.claims[i];
        if (st.answers) { putRuler(key); return; }
        if (sc.verdict !== cl.answer) { // 아직 판정 전/오답
          putRuler(key); return;
        }
        if (sc.evidence) { putRuler(key); return; }
        if (cl.bars.indexOf(key) >= 0) {
          sc.evidence = true;
          putRuler(key); fill.classList.add("evi");
          edRow.say(i === lastUndone() ? K.lastOk : K.evidenceOk, "praise");
          warnBox.style.display = "none";
          paint(); afterChange();
          setTimeout(function () { var nx = nextUndone(); if (nx != null) { st.activeClaim = nx; paint(); } }, 1400);
        } else {
          putRuler(key); shake(col); col.classList.add("wrongflash");
          setTimeout(function () { col.classList.remove("wrongflash"); }, 600);
          edRow.say(K.evidenceWrong, "surprise");
          warnBox.textContent = K.evidenceWrongBox; warnBox.style.display = "";
        }
      }
      function verdict(i, v) {
        var cl = K.claims[i], sc = st.claims[i];
        if (v === cl.answer) {
          sc.verdict = v;
          edRow.say(K.verdictOk, "praise");
          warnBox.style.display = "none";
          paint(); afterChange();
        } else {
          sc.wrong++;
          edRow.say(K.verdictWrong, "surprise");
          warnBox.textContent = K.verdictWrongBox; warnBox.style.display = "";
          shake(claimEls[i].el);
          if (sc.wrong >= 2) { st.help3 = 2; paintHelp(); }
        }
      }
      function lastUndone() { // 현재 활성 포함, 더 이상 남은 게 없으면 현재
        for (var j = 0; j < K.claims.length; j++) if (j !== st.activeClaim && !claimDone(j)) return -1;
        return st.activeClaim;
      }
      function nextUndone() { for (var j = 0; j < K.claims.length; j++) if (!claimDone(j)) return j; return null; }

      function paint() {
        claimEls.forEach(function (ref, i) {
          var cl = K.claims[i], sc = st.claims[i];
          var active = i === st.activeClaim;
          ref.el.classList.toggle("active", active && !st.answers);
          ref.el.classList.toggle("ansmode", st.answers);
          // 판정 버튼
          ref.actions.innerHTML = "";
          var judged = sc.verdict === cl.answer;
          if (st.answers) {
            // 정답 도장 + 근거 문장
            showStamp(ref, cl.answer);
            ref.line.style.display = ""; ref.line.className = "nr-claim-evi show";
            ref.line.textContent = K.evidenceLead + cl.evidence;
            ref.el.classList.add("ansdone");
          } else if (!judged) {
            if (active) {
              var fb = el("button", "nr-judge fact", { type: "button", text: K.factBtn });
              var nb = el("button", "nr-judge not", { type: "button", text: K.notFactBtn });
              fb.addEventListener("click", function () { verdict(i, "fact"); });
              nb.addEventListener("click", function () { verdict(i, "notfact"); });
              ref.actions.appendChild(fb); ref.actions.appendChild(nb);
            }
            ref.stamp.style.display = "none";
            ref.line.style.display = "none";
          } else {
            showStamp(ref, cl.answer);
            if (!sc.evidence) {
              ref.line.style.display = ""; ref.line.className = "nr-claim-evi hint";
              ref.line.innerHTML = ""; ref.line.appendChild(el("span", "nr-evi-dot")); ref.line.appendChild(document.createTextNode(K.evidenceHint));
            } else {
              ref.line.style.display = ""; ref.line.className = "nr-claim-evi show";
              ref.line.textContent = K.evidenceLead + cl.evidence;
            }
          }
        });
        // 활성 댓글의 근거 막대 정답 알약(정답 보기)
        C.cats.forEach(function (c) {
          var b = graph.bars[c.key]; var pill = b.col.querySelector(".nr-ans-pill");
          var isEvi = st.answers && K.claims[st.activeClaim].bars.indexOf(c.key) >= 0;
          if (isEvi) { if (!pill) { pill = el("span", "nr-ans-pill", { text: K.answerPill }); b.fill.appendChild(pill); } }
          else if (pill) pill.remove();
        });
        paintHelp();
      }
      function showStamp(ref, ans) {
        ref.stamp.style.display = "";
        if (!ref.stamp.firstChild) {
          ref.stamp.appendChild(img("stamp-rect", "nr-stamp-rect"));
          ref.stamp.appendChild(el("span", "nr-stamp-txt"));
        }
        ref.stamp.classList.toggle("factstamp", ans === "fact");
        var txt = ref.stamp.querySelector(".nr-stamp-txt");
        txt.textContent = ans === "fact" ? K.stampFact : K.stampNotFact;
        txt.className = "nr-stamp-txt " + (ans === "fact" ? "fact" : "not");
      }

      paint();
      return wrap;
    }

    // ====================================================
    //  4장 방법 고르기
    // ====================================================
    function renderCh4() {
      var K = C.ch4;
      var wrap = el("div", "nr-ch4");
      var edRow = makeEditorRow(st.choice != null ? (ch4done() ? K.editorOk : K.editorWrong) : K.editor);
      wrap.appendChild(edRow.el);

      var cols = el("div", "nr-ch4-cols");
      var leftCol = el("div", "nr-ch4-left");
      // 근거 메모
      var memo = el("div", "nr-memo");
      memo.appendChild(el("div", "nr-memo-head", null, [img("prop-memo", "nr-memo-ic"), el("span", null, { text: K.memoHeader })]));
      var notes = el("div", "nr-memo-notes");
      var doneClaims = C.ch3.claims.filter(function (cl, i) { return claimDone(i) || st.answers; });
      if (doneClaims.length === 0) {
        notes.appendChild(el("div", "nr-memo-empty", { text: K.memoEmpty }));
      } else {
        C.ch3.claims.forEach(function (cl, i) {
          if (!(claimDone(i) || st.answers)) return;
          notes.appendChild(el("div", "nr-note", { style: "--r:" + (i % 2 ? 0.6 : -0.6) + "deg" }, [el("span", "nr-note-check", { text: "✓" }), el("span", null, { text: cl.evidence })]));
        });
      }
      memo.appendChild(notes);
      leftCol.appendChild(memo);
      leftCol.appendChild(instEl(K.inst, "nr-hl"));

      var optWrap = el("div", "nr-opts");
      var optEls = [];
      K.options.forEach(function (o, i) {
        var oEl = el("button", "nr-opt", { type: "button" });
        oEl.appendChild(el("span", "nr-opt-no"));
        oEl.appendChild(img(o.icon, "nr-opt-ic"));
        oEl.appendChild(el("span", "nr-opt-t", { text: o.text }));
        var tag = el("span", "nr-opt-tag");
        oEl.appendChild(tag);
        oEl.addEventListener("click", function () { choose(i); });
        optEls[i] = { el: oEl, tag: tag };
        optWrap.appendChild(oEl);
      });
      leftCol.appendChild(optWrap);
      var printBtn = el("button", "nr-print", { type: "button", text: K.printBtn });
      printBtn.addEventListener("click", function () { tryNext(); });
      leftCol.appendChild(printBtn);

      var rightCol = el("div", "nr-ch4-right");
      var card = el("div", "nr-ch4-card");
      var ring = el("div", "nr-mj-ring");
      var mj = img("mj-worry", "nr-mj-img", "민준");
      ring.appendChild(mj);
      card.appendChild(ring);
      var mjBubble = el("div", "nr-mj-bubble");
      card.appendChild(mjBubble);
      var mini = buildGraph({ values: C.ch3.barValues, mini: true, showNames: true });
      card.appendChild(mini.el);
      rightCol.appendChild(card);

      cols.appendChild(leftCol); cols.appendChild(rightCol);
      wrap.appendChild(cols);

      function choose(i) {
        st.choice = i;
        var ok = K.options[i].correct;
        if (ok) { edRow.say(K.editorOk, "praise"); mj.src = asset("mj-happy"); mj.classList.add("rise"); }
        else { edRow.say(K.editorWrong, "surprise"); mj.src = asset("mj-hmm"); shake(optEls[i].el); }
        paint(); afterChange();
      }
      function paint() {
        optEls.forEach(function (ref, i) {
          var sel = st.choice === i;
          var ok = K.options[i].correct;
          ref.el.classList.remove("ok", "no", "ansok");
          ref.tag.textContent = "";
          if (st.answers && ok) { ref.el.classList.add("ansok"); ref.tag.textContent = "정답"; }
          if (sel) {
            ref.el.classList.add(ok ? "ok" : "no");
            ref.tag.textContent = ok ? K.okTag : K.noTag;
          }
        });
        mjBubble.innerHTML = "";
        var line = st.choice == null ? K.minjunInit : (ch4done() ? K.minjunOk : K.minjunWrong);
        if (st.answers && st.choice == null) line = K.minjunOk;
        mjBubble.appendChild(el("b", null, { text: "민준" }));
        mjBubble.appendChild(el("span", null, { text: line }));
        if (st.answers) { mj.src = asset("mj-happy"); }
        printBtn.style.display = ch4done() ? "" : "none";
        printBtn.classList.toggle("pulse", ch4done());
        printBtn.disabled = false;
      }
      paint();
      return wrap;
    }

    // ====================================================
    //  5장 1면
    // ====================================================
    function renderCh5() {
      var K = C.ch5;
      var wrap = el("div", "nr-ch5");
      if (!ch4done() && !st.answers) {
        var empty = el("div", "nr-ch5-empty");
        empty.appendChild(el("div", "nr-ch5-empty-box", { text: K.emptyBox }));
        var back = el("button", "nr-abtn solo", { type: "button", text: K.emptyBtn });
        back.addEventListener("click", function () { goPage(4, -1); });
        empty.appendChild(back);
        wrap.appendChild(empty);
        return wrap;
      }
      var paperEl = el("div", "nr-paper1" + (reduced ? "" : " drop"));
      paperEl.appendChild(el("div", "nr-mast", { text: K.masthead }));
      var subRow = el("div", "nr-subline");
      String(K.subline).split(" · ").forEach(function (part) { subRow.appendChild(el("span", null, { text: part })); });
      paperEl.appendChild(subRow);
      var head = el("h1", "nr-headline");
      paperEl.appendChild(head);

      var two = el("div", "nr-paper1-cols");
      var bodyCol = el("div", "nr-paper1-body");
      K.body.forEach(function (p) { bodyCol.appendChild(el("p", null, { text: p })); });
      bodyCol.appendChild(el("div", "nr-byline", { text: K.byline }));
      var rightP = el("div", "nr-paper1-right");
      var mini = buildGraph({ values: C.ch3.barValues, mini: true, plot: 150, showNames: true });
      if (!reduced) { Object.keys(mini.bars).forEach(function (k) { mini.bars[k].fill.style.height = "0px"; }); }
      rightP.appendChild(mini.el);
      var photo = el("div", "nr-paper1-photo");
      photo.appendChild(el("div", "nr-photo-ring", null, [img("mj-happy", "nr-photo-img", "민준")]));
      photo.appendChild(el("div", "nr-photo-cap", null, [el("div", "nr-photo-quote", { text: K.photoCaption }), el("div", "nr-photo-name", { text: K.photoName })]));
      rightP.appendChild(photo);
      two.appendChild(bodyCol); two.appendChild(rightP);
      paperEl.appendChild(two);
      var pubStamp = el("div", "nr-pub-stamp");
      pubStamp.appendChild(img("stamp-rect", "nr-pub-rect"));
      pubStamp.appendChild(el("span", "nr-pub-txt", { text: K.publishStamp }));
      paperEl.appendChild(pubStamp);
      wrap.appendChild(paperEl);

      // 애니메이션: 헤드라인 타이핑 → 막대 자람 → 발행 도장
      if (reduced) {
        head.textContent = K.headline; pubStamp.classList.add("show");
      } else {
        var chars = K.headline.split("");
        var hc = 0;
        head.innerHTML = "";
        var tnode = document.createTextNode("");
        var cursor = el("span", "nr-hl-cursor");
        head.appendChild(tnode); head.appendChild(cursor);
        var t1 = setTimeout(function typ() {
          if (st.page !== 5) return;
          if (hc < chars.length) { tnode.textContent = K.headline.slice(0, ++hc); t1 = setTimeout(typ, 55); }
          else {
            cursor.remove();
            Object.keys(mini.bars).forEach(function (k) { mini.bars[k].fill.style.height = (C.ch3.barValues[k] / C.axisMax) * mini.plotH + "px"; });
            setTimeout(function () { pubStamp.classList.add("show"); }, 700);
          }
        }, 500);
        cleanups.push(function () { clearTimeout(t1); });
      }
      return wrap;
    }

    // ---------- 전체화면 ----------
    var backdrop = null, closeBtn = null;
    function setFullscreen(on) {
      if (on === st.fullscreen) return;
      st.fullscreen = on;
      if (on) {
        // 루트와 같은 클래스를 붙여 CSS 변수·스타일이 그대로 적용되게 한다(색 빠짐 방지)
        backdrop = el("div", "nr-root nr-fs-backdrop" + (reduced ? " nr-reduced" : ""));
        closeBtn = el("button", "nr-fs-close", { type: "button", "aria-label": C.fsClose, text: "×" });
        closeBtn.addEventListener("click", function () { setFullscreen(false); });
        backdrop.appendChild(closeBtn);
        backdrop.appendChild(scaler);
        (root.parentNode || document.body).appendChild(backdrop);
      } else {
        root.appendChild(scaler);
        if (backdrop && backdrop.parentNode) backdrop.parentNode.removeChild(backdrop);
        backdrop = null;
      }
      syncChrome(); layout(); onFullscreen(on);
    }

    // ---------- 크기 맞춤 ----------
    function layout() {
      var natH = book.offsetHeight || 930;
      var k;
      if (st.fullscreen) {
        k = Math.min((window.innerWidth - 16) / BOOK_W, (window.innerHeight - 52) / natH);
      } else {
        var cw = root.clientWidth || BOOK_W;
        k = Math.min(1, cw / BOOK_W);
      }
      book.style.transformOrigin = "top left";
      if (!(k > 0)) k = 1;
      book.style.transform = "scale(" + k + ")";
      scaler.style.width = (BOOK_W * k) + "px";
      scaler.style.height = (natH * k) + "px";
      // 안내 띠: 끼워져 있고 전체화면 아니며 책이 90%보다 작게 줄었을 때만
      banner.style.display = (embedded && !st.fullscreen && k < 0.9) ? "" : "none";
    }

    // ---------- 정리/도움 ----------
    var cleanups = [];
    function runCleanups() { cleanups.forEach(function (f) { try { f(); } catch (e) {} }); cleanups = []; }
    var _renderStage = renderStage;
    renderStage = function () { runCleanups(); _renderStage(); };

    function doReset() {
      var ans = st.answers, fs = st.fullscreen;
      runCleanups();
      st = freshState(); st.answers = ans; st.fullscreen = fs;
      goPage(1, -1);
    }

    // ---------- 키보드 ----------
    function onKey(e) { if (e.key === "Escape" && st.fullscreen) setFullscreen(false); }
    document.addEventListener("keydown", onKey);
    function onResize() { layout(); }
    window.addEventListener("resize", onResize);

    // 첫 그리기
    renderStage(); syncChrome(); layout(); fire();
    requestAnimationFrame(layout);

    return {
      getState: function () { return { page: st.page, cards: placedCount(), claims: claimsDone2(), choice: st.choice, saved: ch4done() }; },
      getValue: getValue,
      setAnswers: function (on) { if (!!on === st.answers) return; st.answers = !!on; renderStage(); syncChrome(); layout(); fire(); },
      setFullscreen: setFullscreen,
      reset: doReset,
      destroy: function () {
        document.removeEventListener("keydown", onKey);
        window.removeEventListener("resize", onResize);
        runCleanups();
        if (backdrop && backdrop.parentNode) backdrop.parentNode.removeChild(backdrop);
        root.innerHTML = ""; root.classList.remove("nr-root", "nr-reduced");
      },
    };
  }

  window.Newsroom = { mount: mount };
})();
