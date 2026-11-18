/* =========================================================
   장치 수리 센터 모듈
   RepairCenter.mount(root, { content, answers, onChange, onSolved })
     → { setAnswers(on), reset(), getState(), destroy() }
   - 글은 content(= content.js)에서만 읽는다.
   - 바깥과 주고받기: 추리 게임과 같은 방식(쿼리 ?answers=1 로 시작, message 로 토글, postMessage 로 상태 전송).
   ========================================================= */
(function () {
  "use strict";

  // LED 5×5 숫자 (끝자리)
  var DIGITS = {
    0: ["11111", "10001", "10001", "10001", "11111"],
    1: ["00100", "01100", "00100", "00100", "01110"],
    2: ["11111", "00001", "11111", "10000", "11111"],
    3: ["11111", "00001", "11111", "00001", "11111"],
    4: ["10001", "10001", "11111", "00001", "00001"],
    5: ["11111", "10000", "11111", "00001", "11111"],
    6: ["11111", "10000", "11111", "10001", "11111"],
    7: ["11111", "00001", "00010", "00100", "00100"],
    8: ["11111", "10001", "11111", "10001", "11111"],
    9: ["11111", "10001", "11111", "00001", "11111"],
  };

  var CORRECT = { start: ["set0"], A: ["show"], shake: ["inc"], B: ["set0", "show"] };
  var HAT_ORDER = ["start", "A", "shake", "B"];

  function h(tag, cls, attrs, kids) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (attrs) for (var k in attrs) {
      if (k === "text") e.textContent = attrs[k];
      else if (k === "html") e.innerHTML = attrs[k];
      else if (k === "on") { for (var ev in attrs[k]) e.addEventListener(ev, attrs[k][ev]); }
      else if (attrs[k] != null) e.setAttribute(k, attrs[k]);
    }
    [].concat(kids || []).forEach(function (c) { if (c == null || c === false) return; e.append(c.nodeType ? c : document.createTextNode(c)); });
    return e;
  }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  function mount(root, opts) {
    opts = opts || {};
    var C = opts.content || window.REPAIR_CONTENT;
    var onChange = typeof opts.onChange === "function" ? opts.onChange : function () {};
    var onSolved = typeof opts.onSolved === "function" ? opts.onSolved : function () {};
    var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // 요청별 상태
    function freshReq(i) {
      var def = C.requests[i];
      var code = clone(CORRECT);
      if (def.bug === "shake") code.shake = ["set0"];
      else if (def.bug === "A") code.A = ["clear"];
      else if (def.bug === "B") code.B = ["show", "set0"];
      return {
        def: def, code: code,
        blockFixed: false, choice: null, done: false, hintsSeen: 0,
        count: 0, led: null, lastHat: null, deviceTouched: false,
        memoKey: "intro", reqFolded: false,
      };
    }
    var st = {
      cur: 0, answers: !!opts.answers, manualOpen: false, manualPage: 1,
      reqs: [0, 1, 2].map(freshReq),
    };

    root.classList.add("rp-root");
    root.style.setProperty("--mon-img", 'url("assets/frame-monitor.png")');
    root.style.setProperty("--brush-img", 'url("assets/highlight-brush.svg")');
    root.innerHTML = "";
    var board = h("div", "rp-board");
    root.append(board);

    // 장치 시뮬
    function runHat(r, hat) {
      r.code[hat].forEach(function (op) {
        if (op === "set0") r.count = 0;
        else if (op === "inc") r.count += 1;
        else if (op === "show") r.led = r.count;
        else if (op === "clear") r.led = null;
      });
      r.lastHat = hat;
      r.deviceTouched = true;
    }
    function resetDevice(r) {
      r.count = 0; r.led = null; r.lastHat = null; r.deviceTouched = false;
      // 시작하면 실행(운동 횟수 0)
      r.code.start.forEach(function (op) { if (op === "set0") r.count = 0; });
    }

    function cur() { return st.reqs[st.cur]; }
    function fixedCount() { return st.reqs.filter(function (r) { return r.done; }).length; }
    function allDone() { return st.reqs.every(function (r) { return r.done; }); }

    function emit() {
      onChange({
        requests: st.reqs.map(function (r) { return { fixed: r.blockFixed, choice: r.choice, hintsSeen: r.hintsSeen }; }),
        fixedCount: fixedCount(), allDone: allDone(),
      });
      if (allDone()) onSolved();
    }

    // ---- 동작 ----
    function pressDevice(hat) {
      var r = cur();
      runHat(r, hat);
      if (!r.blockFixed) r.memoKey = "touched";
      else if (r.choice == null) r.memoKey = "pickPrompt";
      else r.memoKey = r.def.choices[r.choice].correct ? "choiceRight" : "choiceWrong";
      render();
      if (!reduced) {
        var dev = board.querySelector(".rp-device");
        if (dev) { dev.classList.remove("shake"); void dev.offsetWidth; dev.classList.add("shake"); }
      }
      emit();
    }
    function clickBlock(hat) {
      var r = cur();
      if (r.blockFixed) return;
      if (hat === r.def.bug) {
        r.code = clone(CORRECT);
        r.blockFixed = true;
        resetDevice(r);
        r.memoKey = "fixed";
      } else {
        r.memoKey = "again";
      }
      render(); emit();
    }
    function clickChoice(idx) {
      var r = cur();
      if (!r.blockFixed) return;
      r.choice = idx;
      if (r.def.choices[idx].correct) {
        r.done = true; r.memoKey = "choiceRight";
      } else {
        r.memoKey = "choiceWrong";
      }
      render(); emit();
    }
    function showHint() {
      var r = cur();
      if (r.hintsSeen >= 2) return;
      r.hintsSeen += 1; r.memoKey = "hint";
      render(); emit();
    }
    function gotoRequest(i) {
      st.cur = i;
      var r = cur();
      resetDevice(r); r.hintsSeen = 0; r.memoKey = "intro"; r.reqFolded = false;
      st.manualPage = 1;
      render();
    }
    function nextRequest() {
      if (!cur().done) return;
      var nx = st.reqs.findIndex(function (r) { return !r.done; });
      if (nx >= 0) gotoRequest(nx);
    }

    // ---- 텍스트 파서 ----
    function memoFrag(text) {
      var frag = document.createDocumentFragment();
      text.split(/(\[\[.*?\]\])/).forEach(function (seg) {
        if (/^\[\[.*\]\]$/.test(seg)) frag.append(h("span", "rp-hl", { text: seg.slice(2, -2) }));
        else if (seg) frag.append(document.createTextNode(seg));
      });
      return frag;
    }
    function redFrag(text) {
      var frag = document.createDocumentFragment();
      text.split(/(__.*?__)/).forEach(function (seg) {
        if (/^__.*__$/.test(seg)) frag.append(h("b", "rp-red", { text: seg.slice(2, -2) }));
        else if (seg) frag.append(document.createTextNode(seg));
      });
      return frag;
    }

    // ---- 블록 렌더 ----
    function blockEl(blkKey, clickable, extraCls) {
      var b = C.blocks[blkKey];
      var kids = [h("span", "rp-ans-tag wrong")];
      b.tokens.forEach(function (tk) {
        if (tk.v) kids.push(h("span", "cell-v", { text: tk.t }));
        else if (tk.n) kids.push(h("span", "cell-n", { text: tk.t }));
        else kids.push(document.createTextNode(tk.t));
      });
      var cls = "rp-blk " + b.kind + (clickable ? " clickable" : "") + (extraCls || "");
      var attrs = { };
      if (clickable) { attrs.type = "button"; attrs.tabindex = "0"; }
      var tag = clickable ? "button" : "div";
      if (!clickable) delete attrs.type;
      return h(tag, cls, attrs, kids);
    }

    // ---- 메모 테마 ----
    function memoTheme(r) {
      var k = r.memoKey;
      if (r.done || k === "fixed" || k === "choiceRight") return "green";
      if (k === "again" || k === "choiceWrong") return "orange";
      return "mint";
    }
    function eyeSvg(theme) {
      var col = theme === "orange" ? "#ffa94d" : theme === "green" ? "#51cf66" : "#63e6be";
      if (theme === "orange") return '<svg class="rp-eye" viewBox="0 0 16 16"><circle cx="8" cy="8" r="6" fill="none" stroke="' + col + '" stroke-width="2.5"/></svg>';
      // 웃는 반달 눈
      return '<svg class="rp-eye" viewBox="0 0 16 16"><path d="M2 9 A6 6 0 0 1 14 9" fill="none" stroke="' + col + '" stroke-width="2.5" stroke-linecap="round"/></svg>';
    }
    function memoTextFrag(r) {
      var k = r.memoKey;
      if (k === "hint") return memoFrag(r.def.hints[Math.max(0, r.hintsSeen - 1)]);
      if (k === "fixed") return memoFrag(r.def.memoFixed);
      var map = { intro: C.memo.intro, touched: C.memo.touched, again: C.memo.again, pickPrompt: C.memo.pickPrompt, choiceRight: C.memo.choiceRight, choiceWrong: C.memo.choiceWrong, allDone: C.memo.allDone };
      return memoFrag(allDone() ? C.memo.allDone : (map[k] || C.memo.intro));
    }
    function memoTag(r, theme) {
      if (r.memoKey === "hint") return C.ui.memoHint(r.hintsSeen);
      if (theme === "orange") return C.ui.memoAgain;
      if (theme === "green") return C.ui.memoDone;
      return C.ui.memoTitle;
    }

    // ---- LED 그리드 ----
    function ledGrid(led) {
      var cells = [];
      var pat = led == null ? null : DIGITS[Math.abs(led) % 10];
      for (var y = 0; y < 5; y++) for (var x = 0; x < 5; x++) {
        var on = pat && pat[y][x] === "1";
        cells.push(h("i", on ? "on" : null));
      }
      return cells;
    }

    // ================= 렌더 =================
    function render() {
      root.classList.toggle("answers", st.answers);
      board.innerHTML = "";
      var r = cur();

      // 정답 보기 띠
      board.append(h("div", "rp-ans-banner", null, [
        spanHTML('<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5c4700" stroke-width="2.4"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg>'),
        C.answers.banner,
      ]));

      // 1) 간판
      var tabs = st.reqs.map(function (rq, i) {
        return h("button", "rp-tab" + (i === st.cur ? " on" : ""), { type: "button", on: { click: function () { gotoRequest(i); } } },
          [rq.done ? h("span", "tick", { text: "✓" }) : null, "요청 " + rq.def.no]);
      });
      board.append(h("div", "rp-sign", null, [
        h("div", "rp-sign-l", null, [
          h("div", "rp-sign-txt", null, [h("div", "sm", { text: C.center }), h("div", "lg", { text: C.title })]),
          h("img", null, { src: "assets/prop-tools.png", alt: "" }),
        ]),
        h("div", "rp-tabs", null, tabs),
      ]));

      // 2) 요청서 줄
      board.append(reqRow(r));

      // 3) 설명서
      board.append(manualEl());

      // 4) 두 칸
      board.append(colsEl(r));

      // 5) 지시 3
      board.append(inst3El(r));

      // 6) 아래 줄
      board.append(bottomEl());
    }

    function reqRow(r) {
      var techSrc = r.done ? "tech-praise" : (r.memoKey === "again" ? "tech-surprise" : "tech-default");
      var kids = [h("img", "rp-tech", { src: "assets/" + techSrc + ".png", alt: "수리 기사" })];

      // 모니터
      var mon;
      if (r.reqFolded) {
        mon = h("div", "rp-monitor", null, [
          h("div", "rp-mon-cap"),
          h("div", "rp-mon-folded", null, [
            h("b", null, { text: "요청 " + r.def.no }), "· " + r.def.name + " · " + r.def.say,
            h("button", "un", { type: "button", on: { click: function () { r.reqFolded = false; render(); } } }, C.ui.reqUnfold),
          ]),
        ]);
      } else {
        var friend = "fr-" + friendKey(r.def.name) + (r.done ? "-happy" : "-worry");
        mon = h("div", "rp-monitor", null, [
          h("div", "rp-mon-cap"),
          h("div", "rp-mon-screen", null, [
            h("div", "rp-mon-top", null, [
              h("span", "rp-mon-no", { text: "수리 요청 " + r.def.no + "번" }),
              h("span", "rp-mon-state" + (r.done ? " done" : ""), { text: r.done ? C.ui.doneTag : C.ui.received }),
            ]),
            h("div", "rp-mon-body", null, [
              h("img", "rp-friend", { src: "assets/" + friend + ".png", alt: r.def.name }),
              h("div", "rp-mon-who", null, [
                h("b", null, { text: "맡긴 사람 " + r.def.name }),
                h("div", "rp-mon-say", { text: r.def.say }),
                h("button", "rp-mon-foldbtn", { type: "button", on: { click: function () { r.reqFolded = true; render(); } } }, C.ui.reqFold),
              ]),
            ]),
            r.done ? h("img", "rp-mon-stamp", { src: "assets/prop-stamp.png", alt: "" }) : null,
          ]),
        ]);
      }
      kids.push(mon);

      // 설명서 옆 버튼 (접힘 상태만)
      if (!st.manualOpen) {
        kids.push(h("div", "rp-manual-side", null, [
          h("div", "rp-tablet-thumb"),
          h("button", "rp-btn-green", { type: "button", on: { click: function () { st.manualOpen = true; st.manualPage = 1; render(); } } }, C.ui.manualOpen),
        ]));
      }
      return h("div", "rp-reqrow", null, kids);
    }

    function manualEl() {
      var wrap = h("div", "rp-manual" + (st.manualOpen ? " open" : ""));
      if (!st.manualOpen) return wrap;
      var screen;
      if (st.manualPage === 1) {
        var ps = C.manual.page1.map(function (t) { return h("p", null, null, [redFrag(t)]); });
        screen = h("div", "rp-mpage", null, [
          h("img", "jr", { src: "assets/prop-jumprope.png", alt: "" }),
          h("div", "rp-mtext", null, ps),
        ]);
      } else {
        var rows = C.manual.page2.map(function (it) {
          return h("div", "rp-muse-row", null, [h("span", "rp-muse-badge", { text: it.badge }), h("span", null, { text: it.text })]);
        });
        screen = h("div", "rp-muse", null, rows);
      }
      var foot = st.manualPage === 1
        ? h("div", "rp-manual-foot", null, [h("span", "pg", { text: "1 / 2" }), h("button", "rp-btn-green", { type: "button", on: { click: function () { st.manualPage = 2; render(); } } }, C.ui.manualNext)])
        : h("div", "rp-manual-foot", null, [h("button", "rp-btn-green outline", { type: "button", on: { click: function () { st.manualPage = 1; render(); } } }, C.ui.manualAgain), h("span", "pg", { text: "2 / 2" })]);
      wrap.append(h("div", "rp-tablet", null, [
        h("div", "rp-status-bar", null, ["9:41", h("span", "r", null, [wifiSvg(), "82%"])]),
        h("div", "rp-screen2", null, [
          h("div", "rp-manual-head", null, [
            h("span", "t1", { text: C.ui.manualTitle }),
            h("span", "t2", { text: st.manualPage === 2 ? C.ui.manualUse : C.deviceName }),
            h("button", "close", { type: "button", on: { click: function () { st.manualOpen = false; render(); } } }, C.ui.manualClose),
          ]),
          screen,
          foot,
        ]),
        h("div", "rp-home-bar"),
      ]));
      return wrap;
    }

    function colsEl(r) {
      // 왼쪽
      var theme = memoTheme(r);
      var ledVal = r.led == null
        ? h("span", "vv empty", { text: C.ui.ledEmpty })
        : h("span", "vv", { text: String(r.led) });
      var ledIcon = h("span", "ic", null, [h("i")]);
      var varIcon = h("span", "ic", null, [boxSvg()]);
      var left = h("div", "rp-col-left", null, [
        h("div", "rp-inst", null, [h("span", "num", { text: "1" }), h("span", "tx", { text: C.inst1 })]),
        // 매트 + 장치
        h("div", "rp-mat", null, [
          h("div", "rp-device-wrap", null, [deviceEl(r)]),
          h("div", "rp-mat-row", null, [
            h("button", "rp-shake-btn", { type: "button", on: { click: function () { pressDevice("shake"); } } }, [shakeIcon(), C.ui.shakeBtn]),
            h("img", "rp-bot", { src: "assets/bot-" + botKey(r) + ".png", alt: "조수 로봇" }),
          ]),
        ]),
        // 값 줄
        h("div", "rp-values", null, [
          h("div", "rp-val left" + (r.led == null ? " off" : ""), null, [
            ledIcon,
            h("div", "rp-val-col", null, [h("span", "nm", { text: C.ui.ledName }), ledVal]),
          ]),
          h("div", "rp-val right", null, [
            varIcon,
            h("div", "rp-val-col", null, [h("span", "nm", { text: C.ui.varName }), h("span", "vv", { text: String(r.count) })]),
          ]),
        ]),
        // 작업 메모
        memoEl(r, theme),
      ]);

      // 오른쪽
      var helpLabel = r.hintsSeen === 0 ? C.ui.hintOpen : (r.hintsSeen === 1 ? C.ui.hintMore : C.ui.hintAllSeen);
      var right = h("div", "rp-col-right", null, [
        h("div", "rp-inst", null, [
          h("span", "num", { text: "2" }), h("span", "tx", { text: C.inst2 }),
          h("button", "help", { type: "button", disabled: r.hintsSeen >= 2 ? "" : null, on: { click: showHint } }, helpLabel),
        ]),
        codeEl(r),
      ]);
      return h("div", "rp-cols", null, [left, right]);
    }

    function deviceEl(r) {
      return h("div", "rp-device", null, [
        h("div", "rp-dev-board", null, [h("div", "rp-led-grid", null, ledGrid(r.led))]),
        h("button", "rp-dev-btn rp-dev-a", { type: "button", "aria-label": "A 버튼", on: { click: function () { pressDevice("A"); } } }, "A"),
        h("button", "rp-dev-btn rp-dev-b", { type: "button", "aria-label": "B 버튼", on: { click: function () { pressDevice("B"); } } }, "B"),
        h("div", "rp-dev-pins", null, [h("span"), h("span"), h("span")]),
      ]);
    }

    function memoEl(r, theme) {
      var tag = memoTag(r, theme);
      return h("div", "rp-memo " + theme, null, [
        h("div", "rp-memo-ant"),
        h("div", "rp-memo-ear l"), h("div", "rp-memo-ear r"),
        h("div", "rp-memo-box", null, [
          h("div", "rp-memo-screen", null, [
            h("div", "rp-memo-head", null, [
              spanHTML(eyeSvg(theme)), h("span", "rp-memo-tag", { text: tag }), spanHTML(eyeSvg(theme)),
            ]),
            h("div", "rp-memo-text", null, [memoTextFrag(r)]),
          ]),
        ]),
      ]);
    }

    function codeEl(r) {
      var canvas = h("div", "rp-canvas");
      HAT_ORDER.forEach(function (hat) {
        var hatObj = C.hats[hat];
        var isBug = hat === r.def.bug;
        var clickableInner = !r.blockFixed; // 고치기 전엔 모든 안쪽 블록 클릭 가능
        var inner = r.code[hat].map(function (blkKey) {
          var extra = "";
          if (st.answers && isBug && !r.blockFixed) extra += " bugmark";
          if (r.blockFixed && isBug) extra += " fixed";
          var el = blockEl(blkKey, clickableInner, extra);
          if (clickableInner) el.addEventListener("click", function () { clickBlock(hat); });
          // 정답 보기: 잘못된 블록 태그 문구
          if (st.answers && isBug && !r.blockFixed) {
            var tg = el.querySelector(".rp-ans-tag.wrong");
            if (tg) tg.textContent = (r.def.bug === "B" ? C.answers.wrongTagOrder : C.answers.wrongTag);
          }
          return el;
        });
        var wrap = h("div", "rp-hat-wrap " + hatObj.kind, null, inner);
        var hatBox = h("div", "rp-hat " + hatObj.kind + (r.lastHat === hat ? " ran" : ""), null, [
          h("div", "rp-hat-top", { text: hatObj.label }),
          h("span", "rp-ran-tag", { text: C.ui.justRan }),
          wrap,
        ]);
        canvas.append(hatBox);
        // 정답 보기: 버그 hat 아래에 바른 블록(초록) + "✓ 바른 블록" 이름표
        if (st.answers && isBug && !r.blockFixed) {
          var correctInner = CORRECT[hat].map(function (bk) {
            var el = blockEl(bk, false, " fixed");
            var t = el.querySelector(".rp-ans-tag.wrong");
            if (t) { t.className = "rp-ans-tag right"; t.textContent = C.answers.rightTag; }
            return el;
          });
          canvas.append(h("div", "rp-ans-right", null, correctInner));
        }
      });
      return h("div", "rp-code", null, [
        h("div", "rp-code-top", null, [h("span", "tab", { text: C.ui.codeTab }), h("span", "nm", { text: C.deviceName })]),
        h("div", "rp-code-main", null, [
          h("div", "rp-toolbar", null, [
            h("div", "rp-tool-row", null, [h("span", "rp-tool blue"), h("span", "rp-tool-nm", { text: "기본" })]),
            h("div", "rp-tool-row", null, [h("span", "rp-tool purple"), h("span", "rp-tool-nm", { text: "입력" })]),
            h("div", "rp-tool-row", null, [h("span", "rp-tool red"), h("span", "rp-tool-nm", { text: "변수" })]),
          ]),
          canvas,
        ]),
      ]);
    }

    function inst3El(r) {
      var wrap = h("div", "rp-inst3" + ((r.blockFixed || st.answers) ? " show" : ""));
      if (!(r.blockFixed || st.answers)) return wrap;
      wrap.append(h("div", "rp-inst", null, [h("span", "num", { text: "3" }), h("span", "tx", { text: C.inst3 })]));
      var cards = r.def.choices.map(function (ch, i) {
        var cls = "rp-choice" + (ch.correct ? " is-correct" : "");
        if (r.choice === i) cls += ch.correct ? " right" : " wrong";
        var mk = (r.choice === i) ? (ch.correct ? h("span", "mk", { text: "✓ " }) : h("span", "mk", { text: "[다시] " })) : null;
        return h("button", cls, { type: "button", on: { click: function () { clickChoice(i); } } }, [
          h("span", "dot"), mk, h("span", null, { text: ch.text }),
          h("span", "ans-pick", { text: C.answers.pickTag }),
        ]);
      });
      wrap.append(h("div", "rp-choices", null, cards));

      // 수리 완료 카드
      if (r.done) {
        var friend = "fr-" + friendKey(r.def.name) + "-happy";
        wrap.append(h("div", "rp-done-card show", null, [
          h("img", "rp-done-friend", { src: "assets/" + friend + ".png", alt: "" }),
          h("div", "rp-done-txt", null, [
            h("div", "h", { text: "✓ 수리 끝 · " + r.def.name }),
            h("div", "s", { text: r.def.done }),
          ]),
          h("img", "rp-done-stamp", { src: "assets/prop-stamp.png", alt: "" }),
          h("img", "rp-done-tech", { src: "assets/tech-praise.png", alt: "" }),
        ]));
      }
      // 모두 마침
      if (allDone()) {
        wrap.append(h("div", "rp-allwrap show", null, [
          h("img", null, { src: "assets/prop-tray.png", alt: "" }),
          h("div", "t", { text: C.ui.allDoneProp }),
          h("a", "rp-btn-green", { href: C.ui.makecodeUrl, target: "_blank", rel: "noopener", style: "text-decoration:none" }, C.ui.makecode),
        ]));
      }
      return wrap;
    }

    function bottomEl() {
      var done = cur().done;
      var all = allDone();
      var btn;
      if (all) {
        btn = h("button", "rp-next ready", { type: "button", on: { click: function () { onSolved(); } } }, C.ui.submit);
      } else {
        btn = h("button", "rp-next" + (done ? " ready" : ""), { type: "button", disabled: done ? null : "", on: { click: nextRequest } }, C.ui.nextReq);
      }
      return h("div", "rp-bottom", null, [
        h("span", "rp-progress", null, [memoFragPlain(C.ui.fixedCount(fixedCount()))]),
        btn,
      ]);
    }

    // ---- 작은 헬퍼 ----
    function spanHTML(s) { var e = h("span"); e.innerHTML = s; return e.firstChild; }
    function memoFragPlain(text) {
      // "고친 요청 n / 3" 에서 n 강조
      var m = text.match(/(\D*)(\d+)(.*)/);
      if (!m) return document.createTextNode(text);
      var f = document.createDocumentFragment();
      f.append(document.createTextNode(m[1])); f.append(h("b", null, { text: m[2] })); f.append(document.createTextNode(m[3]));
      return f;
    }
    function friendKey(name) { return name === "하윤" ? "hayun" : name === "도현" ? "dohyun" : "seoa"; }
    function botKey(r) {
      if (r.memoKey === "again" || r.memoKey === "choiceWrong") return "surprise";
      if (r.done || r.memoKey === "fixed" || r.memoKey === "choiceRight") return "praise";
      return "default";
    }
    function shakeIcon() { return spanHTML('<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="8" y="3" width="8" height="18" rx="2"/><path d="M4 8v8M20 8v8"/></svg>'); }
    function boxSvg() { return spanHTML('<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2"><rect x="4" y="4" width="16" height="16" rx="2"/></svg>'); }
    function wifiSvg() { return spanHTML('<svg width="15" height="12" viewBox="0 0 24 18" fill="#cfd4e0"><path d="M12 15a2 2 0 110 4 2 2 0 010-4zM5 9a10 10 0 0114 0l-2 2a7 7 0 00-10 0zM1 5a16 16 0 0122 0l-2 2a13 13 0 00-18 0z"/></svg>'); }

    // 첫 그리기
    render();
    emit();

    return {
      setAnswers: function (on) { st.answers = !!on; render(); },
      reset: function () {
        st = { cur: 0, answers: st.answers, manualOpen: false, manualPage: 1, reqs: [0, 1, 2].map(freshReq) };
        render(); emit();
      },
      getState: function () {
        return { requests: st.reqs.map(function (r) { return { fixed: r.blockFixed, choice: r.choice, hintsSeen: r.hintsSeen }; }), fixedCount: fixedCount(), allDone: allDone() };
      },
      destroy: function () { root.innerHTML = ""; root.classList.remove("rp-root", "answers"); },
    };
  }

  window.RepairCenter = { mount: mount };
})();
