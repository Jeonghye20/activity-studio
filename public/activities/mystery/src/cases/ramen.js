const CASE = {
  id: "ws-ramen",
  fileNo: "사건 파일 02",
  title: "로봇이 끓인 이상한 라면",
  goal: "로봇이 실행한 명령에서 순서와 조건의 오류를 찾아 바른 알고리즘으로 고칠 수 있다.",

  /* 이미지: 파일 경로를 넣으면 그림이 나오고, 비워 두면 이름표 자리 상자가 나옵니다.
     탐정·조수는 사건 1 그림을 그대로 씁니다. */
  assets: {
    "det.default": "assets/det-default.png",
    "det.think": "assets/det-think.png",
    "det.serious": "assets/det-serious.png",
    "det.wow": "assets/det-wow.png",
    "det.point": "assets/det-point.png",
    "det.praise": "assets/det-praise.png",
    "inv.default": "assets/inv-default.png",
    "inv.surprise": "assets/inv-surprise.png",
    "inv.found": "assets/inv-found.png",
    "inv.proud": "assets/inv-proud.png",
    "prop.ramenpot": "", "prop.card": "assets/prop-card.png", "prop.robot": "assets/prop-robot.png", "prop.pot": "assets/prop-pot.png",
    "post.ramen": "assets/post-ramen.jpg",
    "clue.cond": "assets/clue-cond.png", "clue.order": "assets/clue-order.png", "clue.result": "assets/clue-result.png", "clue.fixed": "assets/clue-fixed.png",
    "clue.check": "assets/clue-check.png", "clue.egg": "assets/clue-egg.png", "clue.bag": "assets/clue-bag.png",
    "bg.club": "assets/bg-club.jpg", "bg.desk": "", "bg.board": ""
  },
  assetLabels: {
    "det.default": "[탐정] 기본", "det.think": "[탐정] 생각", "det.serious": "[탐정] 진지", "det.wow": "[탐정] 놀람", "det.point": "[탐정] 가리킴", "det.praise": "[탐정] 칭찬",
    "inv.default": "[조수] 기본", "inv.surprise": "[조수] 놀람", "inv.found": "[조수] 발견", "inv.proud": "[조수] 자신감",
    "bg.club": "[배경] 요리 동아리실", "prop.ramenpot": "[소품] 이상한 라면 냄비", "prop.card": "[소품] 명령 카드 태블릿", "prop.robot": "[소품] 요리 로봇 보글봇", "prop.pot": "[소품] 라면 냄비",
    "post.ramen": "[소품] 이상한 라면 사진",
    "clue.cond": "[단서] 거꾸로 된 조건", "clue.order": "[단서] 너무 빨리 끈 인덕션", "clue.result": "[단서] 퍼지고 딱딱한 면",
    "clue.fixed": "[단서] 제대로 된 라면", "clue.check": "[단서] 점검표", "clue.egg": "[단서] 삶은 달걀", "clue.bag": "[단서] 라면 봉지"
  },

  roleName: "탐정 조수",

  /* 오프닝 카툰: 사건 발생 → 의뢰 → 수상한 결과 → 탐정의 추리 */
  opening: {
    startLabel: "사건 시작하기",
    panels: [
      { kind: "notify", caption: "오늘 점심, 별숲중 요리 동아리실", img: "prop.robot", bg: "bg.club", bgFront: 72, thing: "prop.ramenpot",
        app: "보글봇", head: "라면 완성!", body: "받은 명령을 모두 실행했어요." },
      { kind: "duo", caption: "요리 동아리의 도움 요청", bg: "bg.club",
        lines: [
          { who: "det", face: "serious", say: "로봇이 끓인 라면이 이상해." },
          { who: "inv", face: "surprise", say: "면이 퍼졌는데 속은 딱딱해요!" }
        ] },
      { kind: "photo", caption: "보글봇이 끓인 라면", img: "post.ramen",
        lines: [
          { who: "det", face: "think", say: "로봇은 명령대로만 움직여." },
          { who: "inv", face: "found", say: "그럼 명령이 수상해요!" }
        ] },
      { kind: "theory", caption: "탐정의 추리",
        how: ["명령 카드에서 단서 모으기", "고쳐서 다시 끓여 확인하기", "증거 연결하기"],
        lines: [ { who: "det", face: "point", say: "증거로 추리를 확인해 보자!" } ] }
    ]
  },

  /* 탐정의 추리 하나 */
  hypotheses: [
    { id: "A", short: "명령 순서·조건 오류", text: "로봇이 받은 명령의 순서와 조건이 잘못됐다",
      where: "명령 카드, 요리 로봇",
      checks: [ { img: "prop.card", label: "명령 카드" }, { img: "prop.robot", label: "요리 로봇" } ] }
  ],

  evidence: {
    cond:   { title: "조건이 거꾸로: 끓지 않았다면", img: "clue.cond" },
    order:  { title: "인덕션을 너무 빨리 끔",         img: "clue.order" },
    fixed:  { title: "고친 명령 → 라면 완성",      img: "clue.fixed" },
    check:  { title: "아침 점검: 모두 정상",        img: "clue.check" },
    egg:    { title: "어제 달걀 삶기 성공",         img: "clue.egg" },
    bag:    { title: "라면 봉지는 새것",           img: "clue.bag" }
  },

  stages: [
    /* ---------- 1. 수집 ---------- */
    {
      step: "수집", kind: "desk",
      intro: [
        { who: "det", face: "think", say: "로봇이 받은 명령부터 보자." },
        { who: "inv", face: "default", say: "'조사하기'를 눌러 볼게요!" }
      ],
      idle: "'조사하기' 표시가 붙은 명령 카드를 눌러 보자",
      props: [
        { id: "card", img: "prop.card", x: 40, y: 80, w: 150, h: 200, r: -5, label: "조사하기",
          modules: [{
            type: "search", name: "명령 카드 살펴보기", title: "보글봇 명령 카드",
            mission: "라면을 이상하게 만든 명령 2곳을 찾아 눌러 보자",
            start: { who: "det", face: "think", say: "어느 명령이 수상할까?" },
            code: [
              { kind: "start", text: "라면 끓이기 시작" },
              { kind: "", text: "[[x1|냄비에 물 550mL를 붓는다]]" },
              { kind: "", text: "[[x2|인덕션을 켠다]]" },
              { kind: "loop", text: "[[cond|만일 물이 끓지 않았다면]]" },
              { kind: "", text: "면과 스프를 넣는다", indent: 1 },
              { kind: "", text: "[[order|인덕션을 끈다]]" },
              { kind: "", text: "[[x3|4분 30초 기다린다]]" }
            ],
            output: { img: "post.ramen", text: "면은 퍼지고 속은 딱딱해" },
            targets: ["cond", "order"],
            onHit: { who: "inv", face: "found", say: "여기가 이상해요!" },
            onMiss: { who: "det", face: "think", say: "그 명령은 문제없어 보여." },
            hints: ["면을 넣을 때 물은 어때야 할까?", "인덕션을 끄고 기다리면 면이 익을까?"],
            done: { who: "det", face: "wow", say: "순서와 조건이 둘 다 수상해." }
          }]
        },
        { id: "robot", img: "prop.robot", x: 40, y: 340, w: 170, h: 230, r: 3, lockedLabel: "2단계" }
      ],
      hyp: { A: "likely" },
      complete: { title: "수집 완료!", text: "수상한 명령 2곳을 증거 수첩에 모았어.", next: "확인 단계로 가기" }
    },
    /* ---------- 2. 확인 ---------- */
    {
      step: "확인", kind: "desk",
      intro: [
        { who: "det", face: "serious", say: "명령을 고치면 라면이 될까?" },
        { who: "inv", face: "default", say: "헷갈린 곳만 고치면 돼요!" }
      ],
      idle: "'조사하기' 표시가 붙은 요리 로봇을 눌러 보자",
      props: [
        { id: "card", img: "prop.card", x: 50, y: 380, w: 110, h: 150, r: -8, doneLabel: "조사 끝" },
        { id: "robot", img: "prop.robot", x: 30, y: 80, w: 180, h: 240, r: 2, label: "조사하기",
          modules: [
            { type: "order", name: "① 명령 고쳐 다시 끓이기", title: "보글봇 · 명령 다시 넣기",
              mission: "명령 카드 6장을 바른 순서로 놓아 보자",
              start: { who: "det", face: "serious", say: "고친 명령으로 다시 끓여 보자." },
              slotsTitle: "보글봇 명령", cardsLabel: "명령 카드 · 눌러서 차례대로 넣기",
              runLabel: "로봇에게 실행시키기",
              cards: [
                { id: "noodle", text: "면과 스프를 넣는다" },
                { id: "off", text: "인덕션을 끈다" },
                { id: "water", text: "냄비에 물 550mL를 붓는다" },
                { id: "wrongif", text: "만일 물이 끓지 않았다면 면과 스프를 넣는다" },
                { id: "wait", text: "4분 30초 기다린다" },
                { id: "fire", text: "인덕션을 켠다" },
                { id: "boil", text: "물이 끓을 때까지 기다린다" }
              ],
              answer: ["water", "fire", "boil", "noodle", "wait", "off"],
              fail: {
                water: "물을 붓기 전에 다른 일을 했어!",
                fire: "빈 냄비에 인덕션을 켰어!",
                boil: "인덕션이 꺼져 있어서 물이 안 끓어!",
                noodle: "물이 안 끓었는데 면을 넣었어!",
                wrongif: "찬물에 면을 넣었어. 면이 퍼져!",
                wait: "면도 없는데 기다리기만 했어.",
                off: "인덕션이 꺼져서 면이 안 익어!"
              },
              winImg: "clue.fixed",
              winText: "라면 완성! 고친 명령대로 끓였어.",
              onMiss: { who: "det", face: "think", say: "어디서 이상해졌는지 보자." },
              hints: ["면은 물이 끓은 다음에 넣어야 해.", "인덕션은 4분 30초 기다린 다음에 꺼."],
              done: [ { who: "inv", face: "surprise", say: "이번엔 제대로 됐어요!" }, { who: "det", face: "wow", say: "추리가 맞았어!" } ],
              give: ["fixed"], hyp: { A: "confirmed" }
            },
            { type: "select", name: "② 로봇 고장 확인하기", title: "보글봇 · 작업 기록",
              mission: "로봇이 고장 나지 않았다는 증거 2개를 골라 보자",
              start: { who: "det", face: "think", say: "로봇 고장은 아닌지 보자." },
              question: {
                title: "탐정의 질문",
                text: "로봇이 고장 나서 라면을 이상하게 끓였을지도 몰라. 정말 그랬을까?"
              },
              groups: [
                { title: "보글봇 작업 기록", sub: "어제 · 오늘", ids: ["r1", "r2", "r3"] },
                { title: "탐문 수사", sub: "동아리 친구들에게 물어본 말", ids: ["t1", "t2"] }
              ],
              items: [
                { id: "r1", kind: "log", time: "오늘 08:30", text: "아침 점검 · 모든 부품", act: "정상" },
                { id: "r2", kind: "log", time: "어제 15:10", text: "달걀 삶기 명령", act: "그대로 실행 · 성공" },
                { id: "r3", kind: "log", time: "오늘 12:00", text: "라면 끓이기 명령", act: "그대로 실행", tag: "이번 사건" },
                { id: "t1", kind: "say", who: "동아리 친구 서준", text: "라면은 로봇한테 너무 어려운 요리예요." },
                { id: "t2", kind: "say", who: "동아리 친구 하린", text: "로봇이 움직일 때 윙 소리가 났어요." }
              ],
              answer: ["r1", "r2"],
              why: {
                r3: "명령대로 했다는 기록이야. 고장인지는 몰라.",
                t1: "그건 짐작이야. 기록으로 확인해 보자.",
                t2: "윙 소리는 움직일 때 늘 나는 소리야."
              },
              hints: ["점검 결과가 적힌 기록을 찾아보자.", "어제 다른 요리는 잘했는지 보자."],
              done: { who: "inv", face: "found", say: "로봇은 멀쩡해요. 명령이 문제예요!" },
              give: ["check", "egg"]
            }
          ]
        },
        { id: "pot", img: "prop.pot", x: 60, y: 580, w: 120, h: 90, r: 6 }
      ],
      complete: { title: "확인 완료!", text: "로봇은 멀쩡했어. 명령의 순서와 조건이 문제였어.", next: "결론 단계로 가기" }
    },
    /* ---------- 3. 결론 ---------- */
    {
      step: "결론", kind: "board",
      intro: [
        { who: "det", face: "point", say: "진짜 증거만 골라 연결해 보자." }
      ],
      mission: "탐정의 추리를 뒷받침하는 증거를 골라 연결해 보자",
      target: "A",
      cards: [
        { ev: "cond", x: 40, y: 80, r: -3 },
        { ev: "order", x: 40, y: 270, r: 2 },
        { ev: "fixed", x: 70, y: 430, r: -2 },
        { ev: "check", x: 600, y: 330, r: 3 },
        { ev: "bag", x: 620, y: 470, r: -2 }
      ],
      answer: ["cond", "order", "fixed"],
      why: {
        check: "로봇이 멀쩡한 건 알았지. 원인은 아니야.",
        bag: "봉지가 새것이어도 명령이 틀리면 소용없어."
      },
      hints: ["라면을 이상하게 만든 명령 두 곳을 떠올려 봐.", "고쳐서 다시 끓인 결과도 증거야."],
      linked: { who: "inv", face: "proud", say: "다 연결했어요!" },
      rx: {
        title: "명령 카드를 쓸 때 지킬 점",
        mission: "명령을 쓸 때 지킬 점 2장을 골라 보자",
        sub: "맞는 카드 2장 고르기",
        cardLabel: "지킬 점",
        options: ["일이 일어나는 순서대로 쓰기", "로봇을 새것으로 바꾸기", "언제 할지 조건을 정확히 쓰기", "명령을 짧게 줄이기"],
        answer: [0, 2],
        wrong: { who: "det", face: "think", say: "그러면 라면이 제대로 될까?" }
      },
      done: { who: "det", face: "praise", say: "사건 해결! 훌륭한 수사였어." }
    }
  ],

  learned: [
    "로봇은 받은 명령을 순서대로 그대로 실행한다.",
    "순서나 조건이 하나만 틀려도 결과가 달라진다.",
    "알고리즘은 순서를 바르게, 조건을 정확하게 써야 한다."
  ]
};
