const CASE = {
  id: "ws-privacy",
  fileNo: "사건 파일 05",
  title: "누가 내 계정에 들어왔을까?",
  goal: "게시물 속에 드러난 개인 정보를 찾고, 개인 정보를 보호하는 실천 방안을 세울 수 있다.",

  /* 이미지: 파일 경로를 넣으면 그림이 나오고, 비워 두면 이름표 자리 상자가 나옵니다. */
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
    "prop.phone": "assets/prop-phone.png",
    "prop.laptop": "assets/prop-laptop.png",
    "prop.key": "assets/prop-key.png",
    "clue.cake": "assets/clue-cake.png",
    "clue.uniform": "assets/clue-uniform.png",
    "clue.bus": "assets/clue-bus.png",
    "clue.phone": "assets/clue-phone.png",
    "clue.login": "assets/clue-login.png",
    "clue.clock": "assets/clue-clock.png",
    "clue.lock": "assets/clue-lock.png",
    "clue.id": "assets/clue-id.png",
    "clue.weather": "assets/clue-weather.png",
    "post.photo": "assets/post-photo.jpg",
    "bg.desk": "", "bg.board": ""
  },
  assetLabels: {
    "det.default": "[탐정] 기본", "det.think": "[탐정] 생각", "det.serious": "[탐정] 진지", "det.wow": "[탐정] 놀람", "det.point": "[탐정] 가리킴", "det.praise": "[탐정] 칭찬",
    "inv.default": "[조수] 기본", "inv.surprise": "[조수] 놀람", "inv.found": "[조수] 발견", "inv.proud": "[조수] 자신감",
    "prop.phone": "[소품] 민서 휴대폰", "prop.laptop": "[소품] 노트북", "prop.key": "[소품] 컴퓨터실 열쇠",
    "post.photo": "[소품] 생일 파티 사진", "clue.cake": "[단서] 케이크", "clue.uniform": "[단서] 교복", "clue.bus": "[단서] 정류장", "clue.phone": "[단서] 전화",
    "clue.login": "[단서] 로그인 창", "clue.clock": "[단서] 시계", "clue.lock": "[단서] 자물쇠", "clue.id": "[단서] 아이디", "clue.weather": "[단서] 맑은 날"
  },

  roleName: "탐정 조수",

  /* 오프닝 카툰: 사건 발생 → 의뢰 → 수상한 게시물 → 탐정의 추리 */
  opening: {
    startLabel: "사건 시작하기",
    panels: [
      { kind: "notify", caption: "어젯밤 9시 12분", img: "prop.phone",
        app: "SNS", time: "방금", head: "새 기기에서 로그인했어요", body: "처음 보는 컴퓨터에서 minseo_0412 계정에 로그인했어요." },
      { kind: "duo", caption: "다음 날 아침, 민서의 도움 요청",
        lines: [
          { who: "det", face: "serious", say: "누가 민서 계정에 몰래 들어왔어." },
          { who: "inv", face: "surprise", say: "민서는 비밀번호를 아무한테도 안 알려 줬어요!" }
        ] },
      { kind: "photo", caption: "민서가 어제 올린 생일 게시물", img: "post.photo",
        lines: [
          { who: "det", face: "think", say: "이 게시물, 뭔가 수상해." },
          { who: "inv", face: "found", say: "범인이 이걸 봤을까요?" }
        ] },
      { kind: "theory", caption: "탐정의 추리",
        how: ["물건을 조사해 단서 모으기", "진짜 증거인지 확인하기", "증거 연결하기"],
        lines: [ { who: "det", face: "point", say: "증거를 모아 추리가 맞는지 확인해 보자!" } ] }
    ]
  },

  /* 탐정의 추리 하나 (가설 B 없음) */
  hypotheses: [
    { id: "A", short: "게시물로 비밀번호 추측", text: "범인은 민서의 게시물을 보고 비밀번호를 알아냈다",
      where: "휴대폰 게시물 · 노트북",
      checks: [ { img: "prop.phone", label: "휴대폰 게시물" }, { img: "prop.laptop", label: "노트북 로그인" } ] }
  ],

  evidence: {
    birth:  { title: "생일 4/12",        img: "clue.cake" },
    school: { title: "별숲중 2학년 3반",        img: "clue.uniform" },
    home:   { title: "별숲마을 3단지",        img: "clue.bus" },
    phone:  { title: "전화번호",         img: "clue.phone" },
    pw:     { title: "비밀번호 = 이름+생일", img: "clue.login" },
    logout: { title: "16:55 로그아웃",   img: "clue.clock" },
    locked: { title: "17시 컴퓨터실 잠금", img: "clue.lock" },
    id:     { title: "아이디 minseo_0412", img: "clue.id" },
    weather:{ title: "맑은 날씨",        img: "clue.weather" }
  },

  stages: [
    /* ---------- 1. 수집 ---------- */
    {
      step: "수집", kind: "desk",
      intro: [
        { who: "det", face: "think", say: "먼저 민서 휴대폰을 조사하자." },
        { who: "inv", face: "default", say: "'조사하기'를 눌러 볼게요!" }
      ],
      idle: "'조사하기' 표시가 붙은 물건을 눌러 보자",
      props: [
        { id: "phone", img: "prop.phone", x: 40, y: 80, w: 130, h: 230, r: -6, label: "조사하기",
          modules: [{
            type: "search", name: "게시물 살펴보기",
            mission: "글에서 개인 정보에 해당하는 말을 찾아 눌러 보자",
            start: { who: "det", face: "think", say: "누구인지 알 수 있는 정보를 찾아봐." },
            post: { author: "minseo_0412", sub: "전체 공개 · 어제", img: "post.photo",
              text: "[[birth|오늘은 내 생일]]! [[x1|날씨도 맑아서]] 기분 최고였어. [[school|별숲중 2학년 3반]] 친구들, 축하해 줘서 고마워! [[x2|케이크도 정말 맛있었어]]. 사진은 [[home|우리 집 앞 별숲마을 3단지 버스 정류장]]에서 찍었어. 사진 받고 싶으면 [[phone|010-0000-1234]]로 연락 줘~" },
            targets: ["birth","school","home","phone"],
            onHit: { who: "inv", face: "found", say: "찾았다!" },
            onMiss: { who: "det", face: "think", say: "그걸로 누구인지 알 수 있을까?" },
            hints: ["생일과 다니는 학교를 찾아보자.", "사는 곳과 연락처도 개인 정보야."],
            done: { who: "det", face: "wow", say: "작은 정보도 모이면 한 사람이 보여." }
          }]
        },
        { id: "laptop", img: "prop.laptop", x: 50, y: 360, w: 170, h: 110, r: 4, lockedLabel: "2단계" }
      ],
      hyp: { A: "likely" },
      complete: { title: "수집 완료!", text: "개인 정보 단서 4장을 증거 수첩에 모았어.", next: "확인 단계로 가기" }
    },
    /* ---------- 2. 검증 ---------- */
    {
      step: "확인", kind: "desk",
      intro: [
        { who: "det", face: "serious", say: "모은 단서가 진짜 증거인지 확인하자." }
      ],
      idle: "'조사하기' 표시가 붙은 노트북을 눌러 보자",
      props: [
        { id: "phone", img: "prop.phone", x: 40, y: 330, w: 100, h: 170, r: -8, doneLabel: "조사 끝" },
        { id: "laptop", img: "prop.laptop", x: 30, y: 90, w: 180, h: 120, r: 3, label: "조사하기", frame: "laptop",
          modules: [
            { type: "reenact", name: "① 범인처럼 로그인하기",
              mission: "수첩의 단서로 민서의 비밀번호를 알아내 로그인해 보자",
              start: { who: "det", face: "serious", say: "범인도 게시물만 보고 이렇게 했을 거야." },
              piecesLabel: "수첩의 단서 · 눌러서 비밀번호 칸에 넣기", slotTitle: "비밀번호",
              field: { label: "아이디", value: "minseo_0412" }, answer: ["minseo","0412"], maxTries: 5,
              goLabel: "로그인", slotLabel: "비밀번호 칸", slotHint: "단서를 눌러 넣기",
              winText: "로그인 성공 · 게시물만 보고 {n}번 만에 알아냈어",
              pieces: [
                { text: "minseo", from: "아이디" }, { text: "0412", from: "생일" },
                { text: "23", from: "반" }, { text: "5678", from: "전화" }, { text: "!", from: "" }
              ],
              onMiss: { who: "det", face: "think", say: "아이디와 수첩을 다시 살펴보자." },
              hints: ["아이디에 이름이 들어 있어.", "이름 뒤에 생일 네 자리를 붙여 보자."],
              done: [ { who: "inv", face: "surprise", say: "게시물만 보고 열렸어요!" }, { who: "det", face: "wow", say: "추리가 맞았어!" } ],
              give: ["pw"], hyp: { A: "confirmed" }
            },
            { type: "select", name: "② 학교 컴퓨터 확인하기", title: "민서 계정 · 로그인 기록",
              mission: "학교 컴퓨터 때문이 아니라는 증거 2개를 골라 보자",
              start: { who: "det", face: "think", say: "학교 컴퓨터도 한번 살펴보자." },
              question: {
                title: "탐정의 질문",
                text: "민서는 어제 학교 컴퓨터실에서도 로그인했어. 로그아웃을 안 했다면 누군가 그 컴퓨터로 들어갈 수 있었을 거야. 정말 그랬을까?"
              },
              groups: [
                { title: "민서 계정 로그인 기록", sub: "어제", ids: ["r1","r2","r3"] },
                { title: "탐문 수사", sub: "주변 사람들에게 물어본 증언", ids: ["t1","t2"] }
              ],
              items: [
                { id: "r1", kind: "log", time: "16:40", text: "학교 컴퓨터실 3번 컴퓨터", act: "로그인" },
                { id: "r2", kind: "log", time: "16:55", text: "학교 컴퓨터실 3번 컴퓨터", act: "로그아웃" },
                { id: "r3", kind: "log", time: "21:12", text: "처음 보는 컴퓨터", act: "로그인", tag: "범인" },
                { id: "t1", kind: "say", who: "컴퓨터실 선생님", text: "컴퓨터실은 오후 5시에 문을 잠가요. 밤에는 아무도 못 들어가요." },
                { id: "t2", kind: "say", who: "친구 지우", text: "민서가 어제 방과 후 수업 때 3번 자리에 앉았어요." }
              ],
              answer: ["r2","t1"],
              why: {
                r1: "그건 민서가 학교 컴퓨터를 썼다는 기록이야.",
                r3: "범인이 들어온 기록이야. 이것만으로는 학교 컴퓨터인지 알 수 없어.",
                t2: "그 말만으로는 학교 컴퓨터 때문인지 알 수 없어."
              },
              hints: ["민서가 학교 컴퓨터에서 로그아웃했는지 기록을 보자.", "16:55 기록, 그리고 밤에 컴퓨터실에 들어갈 수 있었는지 보자."],
              done: { who: "inv", face: "found", say: "학교 컴퓨터는 이번 사건과 상관없어요!" },
              give: ["logout","locked"]
            }
          ]
        },
        { id: "key", img: "prop.key", x: 70, y: 540, w: 100, h: 100, r: 12 }
      ],
      complete: { title: "확인 완료!", text: "탐정의 추리가 맞았어. 학교 컴퓨터는 이번 사건과 상관없었어.", next: "결론 단계로 가기" }
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
        { ev: "birth", x: 40, y: 80, r: -3 },
        { ev: "pw", x: 40, y: 270, r: 2 },
        { ev: "id", x: 70, y: 430, r: -2 },
        { ev: "weather", x: 600, y: 330, r: 3 },
        { ev: "logout", x: 620, y: 470, r: -2 }
      ],
      answer: ["birth","pw","id"],
      why: {
        weather: "날씨로는 비밀번호를 알 수 없지.",
        logout: "학교 컴퓨터는 이번 사건과 상관없었지."
      },
      hints: ["범인이 가장 먼저 본 것은 무엇일까?", "아이디도 증거가 될 수 있어."],
      linked: { who: "inv", face: "proud", say: "다 연결했어요!" },
      rx: {
        title: "민서에게 알려 줄 실천 방법",
        mission: "민서에게 알려 줄 실천 카드 2장을 골라 보자",
        sub: "맞는 카드 2장 고르기",
        options: ["게시물에 생일·학교 올리지 않기", "비밀번호를 생일로 바꾸기", "추측하기 어려운 비밀번호 쓰기", "사진을 더 많이 올리기"],
        answer: [0, 2],
        wrong: { who: "det", face: "think", say: "그러면 또 뚫리지 않을까?" }
      },
      done: { who: "det", face: "praise", say: "사건 해결! 훌륭한 수사였어." }
    }
  ],

  learned: [
    "생일·학교·사는 곳처럼 작은 정보도 모이면 나를 알아낼 수 있다.",
    "개인 정보로 만든 비밀번호는 게시물만 보고도 추측할 수 있다.",
    "게시물에 개인 정보를 올리지 않고, 추측하기 어려운 비밀번호를 쓴다."
  ]
};
