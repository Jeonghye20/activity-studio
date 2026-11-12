const CASE = {
  id: "ws-debug",
  fileNo: "사건 파일 07",
  title: "응원 점수는 왜 10점일까?",
  goal: "프로그램을 실행하며 오류의 원인을 찾고, 변수의 처음값 위치를 고쳐 오류를 해결할 수 있다.",

  assets: {
    "det.default": "", "det.think": "", "det.serious": "", "det.wow": "", "det.point": "", "det.praise": "",
    "inv.default": "", "inv.surprise": "", "inv.found": "", "inv.proud": "",
    "prop.laptop": "", "prop.board": "", "prop.memo": "",
    "out.screen": "", "clue.reset": "", "clue.ten": "", "clue.input": "", "clue.scoreboard": "",
    "clue.fixed": "", "clue.speed": "", "clue.rumor": ""
  },
  assetLabels: {
    "det.default": "[탐정] 기본", "det.think": "[탐정] 생각", "det.serious": "[탐정] 진지", "det.wow": "[탐정] 놀람", "det.point": "[탐정] 가리킴", "det.praise": "[탐정] 칭찬",
    "inv.default": "[수사원] 기본", "inv.surprise": "[수사원] 놀람", "inv.found": "[수사원] 발견", "inv.proud": "[수사원] 자신감",
    "prop.laptop": "[소품] 방송부 노트북", "prop.board": "[소품] 체육대회 점수판", "prop.memo": "[소품] 방송부 메모",
    "out.screen": "[소품] 전광판 화면 · 합계 10점",
    "clue.reset": "[단서] 0으로 돌아가는 숫자", "clue.ten": "[단서] 10점 전광판", "clue.input": "[단서] 입력 기록표",
    "clue.scoreboard": "[단서] 점수판 사진", "clue.fixed": "[단서] 46점 전광판", "clue.speed": "[단서] 초시계", "clue.rumor": "[단서] 말풍선"
  },

  hypotheses: [
    { id: "A", short: "합계가 0으로 돌아감", text: "반복할 때마다 합계가 0으로 돌아간다" },
    { id: "B", short: "점수 입력 실수", text: "방송부가 점수를 잘못 입력했다" }
  ],

  evidence: {
    reset:  { title: "반복 안에 '합계 = 0'",   img: "clue.reset" },
    ten:    { title: "결과 10 = 4반 점수",     img: "clue.ten" },
    input:  { title: "입력 12·9·15·10",       img: "clue.input" },
    board:  { title: "점수판도 12·9·15·10",    img: "clue.scoreboard" },
    fixed:  { title: "고친 뒤 합계 46점",      img: "clue.fixed" },
    speed:  { title: "실행 시간 0.2초",        img: "clue.speed" },
    rumor:  { title: "\"컴퓨터가 틀렸대\"",     img: "clue.rumor" }
  },

  stages: [
    /* ---------- 1. 수집 ---------- */
    {
      step: "수집", kind: "desk",
      intro: [
        { who: "det", face: "serious", say: "응원 점수 합계가 10점이래." },
        { who: "inv", face: "surprise", say: "네 반 다 합치면 더 많은데요?" },
        { who: "det", face: "think", say: "방송부 노트북부터 보자." }
      ],
      idle: "'조사하기' 표시가 붙은 물건을 눌러요",
      props: [
        { id: "laptop", img: "prop.laptop", x: 30, y: 90, w: 180, h: 130, r: -4, label: "조사하기",
          modules: [{
            type: "search", name: "코드 살펴보기",
            mission: "코드와 결과에서 수상한 곳 2곳 찾기",
            code: [
              { kind: "start", text: "시작하기 버튼을 클릭했을 때" },
              { kind: "loop",  text: "[[x1|4번 반복하기]]", indent: 0 },
              { kind: "var",   text: "[[reset|합계를 0으로 정하기]]", indent: 1 },
              { kind: "var",   text: "[[x2|점수를 다음 반 점수로 정하기]]", indent: 1 },
              { kind: "var",   text: "합계에 점수만큼 더하기", indent: 1 },
              { kind: "",      text: "[[x3|합계를 말하기]]", indent: 0 }
            ],
            output: { img: "out.screen", text: "응원 점수 합계: [[ten|10점]]" },
            targets: ["reset", "ten"],
            onHit: { who: "inv", face: "found", say: "여기 수상해요!" },
            onMiss: { who: "det", face: "think", say: "그 블록은 제대로 일하고 있어." },
            hints: ["반복할 때마다 실행되는 블록을 봐.", "합계가 몇으로 시작하는지 봐."],
            done: { who: "det", face: "wow", say: "10점은 마지막 반 점수랑 같네!" }
          }]
        },
        { id: "board", img: "prop.board", x: 40, y: 330, w: 170, h: 130, r: 4, lockedLabel: "2단계" }
      ],
      hyp: { A: "likely" }
    },
    /* ---------- 2. 검증 ---------- */
    {
      step: "검증", kind: "desk",
      intro: [
        { who: "inv", face: "default", say: "점수를 잘못 넣은 건 아닐까요?" },
        { who: "det", face: "serious", say: "점수판이랑 맞춰 보자." }
      ],
      idle: "점수판을 눌러 봐요",
      props: [
        { id: "laptop", img: "prop.laptop", x: 30, y: 360, w: 150, h: 110, r: -6, doneLabel: "조사 끝" },
        { id: "board", img: "prop.board", x: 30, y: 90, w: 180, h: 140, r: 3, label: "조사하기",
          modules: [
            { type: "select", name: "① 가설 B 확인",
              mission: "가설 B를 지울 증거 2개 고르기",
              note: "체육대회 응원 점수: 1반 12 · 2반 9 · 3반 15 · 4반 10",
              items: [
                { id: "i1", kind: "log", time: "입력", text: "12 → 9 → 15 → 10", act: "방송부 입력 기록" },
                { id: "i2", kind: "log", time: "실행", text: "0.2초 만에 끝남", act: "실행 기록" },
                { id: "t1", kind: "say", who: "체육 선생님", text: "점수판 사진이랑 똑같이 불러 줬어.", img: "prop.board" },
                { id: "t2", kind: "say", who: "친구 서연", text: "컴퓨터가 가끔 계산을 틀린대." }
              ],
              answer: ["i1", "t1"],
              why: {
                i2: "빨리 끝난 건 오류랑 상관없어.",
                t2: "컴퓨터는 시킨 대로만 계산해."
              },
              hints: ["입력한 점수가 맞는지 확인할 증거를 찾아.", "입력 기록과 점수판을 비교해 봐."],
              done: { who: "inv", face: "found", say: "입력은 다 맞았어요!" },
              give: ["input", "board"], hyp: { B: "out" }
            },
            { type: "reenact", name: "② 코드 고치기",
              mission: "블록 순서를 바꿔 합계 46점 만들기",
              piecesLabel: "블록 · 실행할 순서대로 누르기",
              slotLabel: "고친 코드", slotHint: "블록을 순서대로 눌러 넣어요", stack: true,
              pieces: [
                { text: "4번 반복하기", from: "" },
                { text: "합계를 0으로 정하기", from: "" },
                { text: "합계에 점수만큼 더하기", from: "" },
                { text: "합계를 말하기", from: "" }
              ],
              answer: ["합계를 0으로 정하기", "4번 반복하기", "합계에 점수만큼 더하기", "합계를 말하기"],
              slots: 4, maxTries: 5, goLabel: "실행",
              winText: "합계 46점! {n}번 만에 고쳤어요",
              onMiss: { who: "det", face: "think", say: "합계는 언제 한 번만 0이면 될까?" },
              hints: ["'0으로 정하기'는 반복 밖으로 꺼내야 해.", "처음값 → 반복 → 더하기 → 말하기 순서야."],
              done: { who: "inv", face: "proud", say: "46점이 나왔어요!" },
              give: ["fixed"], hyp: { A: "confirmed" }
            }
          ]
        },
        { id: "memo", img: "prop.memo", x: 60, y: 520, w: 120, h: 70, r: 10 }
      ]
    },
    /* ---------- 3. 결론 ---------- */
    {
      step: "결론", kind: "board",
      intro: [
        { who: "det", face: "point", say: "증거를 실로 가설 A에 이어 봐." }
      ],
      mission: "가설 A를 뒷받침하는 증거 잇기",
      target: "A",
      cards: [
        { ev: "reset", x: 40, y: 80, r: -3 },
        { ev: "ten", x: 40, y: 270, r: 2 },
        { ev: "fixed", x: 70, y: 430, r: -2 },
        { ev: "speed", x: 600, y: 330, r: 3 },
        { ev: "rumor", x: 620, y: 470, r: -2 }
      ],
      answer: ["reset", "ten", "fixed"],
      why: {
        speed: "실행 속도는 합계랑 상관없어.",
        rumor: "그건 소문이지 증거가 아니야."
      },
      hints: ["합계가 0이 되는 증거부터 찾아.", "고친 뒤 결과도 증거야."],
      linked: { who: "inv", face: "proud", say: "다 연결했어요!" },
      rx: {
        title: "방송부에 알려 줄 실천 방법",
        mission: "방송부에 알려 줄 실천 카드 2장을 골라 보자",
        sub: "맞는 카드 2장 고르기",
        options: ["처음값은 반복 밖에서 정하기", "오류가 나면 처음부터 다시 짜기", "변수 값을 한 단계씩 따라가 보기", "컴퓨터를 껐다 켜기"],
        answer: [0, 2],
        wrong: { who: "det", face: "think", say: "그러면 원인을 못 찾지 않을까?" }
      },
      done: { who: "det", face: "praise", say: "사건 해결! 훌륭한 디버깅이었어." }
    }
  ],

  learned: [
    "반복 안에 '0으로 정하기'가 있으면 값이 매번 처음으로 돌아간다.",
    "변수의 처음값은 반복이 시작되기 전에 한 번만 정한다.",
    "오류는 결과를 보고 변수 값을 따라가며 원인을 찾는다."
  ]
};
