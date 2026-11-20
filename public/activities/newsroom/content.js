/* =========================================================
   뉴스룸 웹북 — 글자·숫자 데이터
   교사가 고칠 부분은 여기(content.js)만 바꾸면 된다.
   그림은 assets/ 안의 webp 파일 이름으로 가리킨다.
   대괄호 [ ] 로 감싼 부분은 화면에서 형광펜(강조)으로 보인다.
   ========================================================= */
window.NEWSROOM_CONTENT = {
  paperTitle: "별숲 학생 신문 · 데이터 특집",
  stampLabel: "취재 도장",
  fsOpen: "전체화면으로 보기",
  fsClose: "전체화면 닫기",
  fsSmall: "작게 보기",
  fsBig: "전체화면",
  restart: "처음부터",
  prevBtn: "이전 장",
  turn: "넘기기",
  // 전체화면 안내 띠(활동지 안 일반 화면에서만)
  ctaTitle: "전체화면으로 크게 풀어 보자.",
  ctaSub: "취재 영상과 책 넘기기는 전체화면에서 가장 잘 보입니다.",
  ctaBtn: "전체화면으로 풀기",

  // 장 이름(버튼 줄·도장)
  chapters: ["취재 영상", "정리하기", "팩트 체크", "방법 고르기", "1면"],
  // 다음 버튼 글자 (1~4장). 5장은 없음.
  nextLabels: ["취재 시작하기", "다음 장: 팩트 체크", "다음 장: 방법 고르기", "1면 인쇄하기"],
  // 잠겼을 때 다음 버튼 자리 글자
  lockLabels: {
    ch2: function (n) { return "카드 " + n + "장이 남았습니다"; },
    ch3: function (n) { return "댓글 " + n + "개가 남았습니다"; },
    ch4: function () { return "방법을 골라야 합니다"; },
  },
  lockSay: '"이 장을 먼저 끝내야 넘길 수 있어."',

  // 편집장 공통
  editor: { name: "편집장", faceDefault: "ed-default-face", facePraise: "ed-praise-face", faceSurprise: "ed-surprise-face" },

  // 정답 보기 띠
  answersBand: "정답 보기 중입니다. 학생 화면에는 보이지 않습니다. 정답 보기 중에는 장을 자유롭게 넘길 수 있습니다.",

  // 칸(막대) 정의 — 순서가 곧 막대 순서
  cats: [
    { key: "동영상", icon: "st-play", mean: "영상을 보는 데 쓴 시간", help2: "영상을 보는 데 썼는지 생각해 보자." },
    { key: "학습", icon: "st-book", mean: "공부하는 데 쓴 시간", help2: "공부하는 데 썼는지 생각해 보자." },
    { key: "게임", icon: "st-game", mean: "게임을 하는 데 쓴 시간", help2: "게임을 하는 데 썼는지 생각해 보자." },
    { key: "SNS", icon: "st-chat", mean: "친구와 글·사진을 주고받는 데 쓴 시간", help2: "친구와 글이나 사진을 주고받는 데 썼는지 생각해 보자." },
  ],
  axisMax: 25,
  totals: { 동영상: 21, 학습: 14, 게임: 7, SNS: 7 },

  // ===== 1장 취재 영상 =====
  ch1: {
    notebookTitle: "오늘의 취재",
    notebookDesc: "제보가 들어왔습니다. 취재 영상을 보고, 장을 넘기며 기사를 완성해 보자.",
    toc: [
      { n: 1, name: "취재 영상으로 사건 보기", side: "1분" },
      { n: 2, name: "기록 카드 정리하기", side: "그래프" },
      { n: 3, name: "팩트 체크", side: "댓글 판정" },
      { n: 4, name: "방법 고르기", side: "결론" },
      { n: 5, name: "1면 완성", side: "발행" },
    ],
    channel: "별숲 학생 신문",
    sub: "구독",
    foot: "@별숲학생신문 · 데이터 특집",
    clips: [
      { img: "clip1-night", cap: "새벽 1시. 민준이는 아직 [화면을 넘기고] 있습니다." },
      { img: "clip2-phone", cap: "이번 주 사용 시간을 모두 더하면 49시간. [어디에] 이렇게 많이 썼습니까?", phone: { top: "이번 주 사용 시간", big: "49", bottom: "시간" } },
      { img: "clip3-tip", cap: '"제 기록이에요. 진짜 많이 쓰는 건지 [밝혀 주세요!]"' },
      { img: "clip4-scoop", cap: "기록 카드 15장 입수! [그래프로 사실을] 확인해 보자." },
    ],
    editorBubble: '"취재 영상부터 보자. 화면 오른쪽을 누르면 다음 장면으로 넘어가."',
    minjunBubble: '"제 스마트폰 기록이에요. 기사로 사실을 밝혀 주세요!"',
    startBtn: "취재 시작하기",
    replayBtn: "취재 영상 다시 보기",
  },

  // ===== 2장 정리하기 =====
  ch2: {
    editorFirst: '"월요일부터 카드를 하나씩 알맞은 칸에 넣자."',
    inst: "1 월요일부터 카드를 하나씩 [알맞은 칸]에 넣어 보자.",
    graphTitle: "민준이의 일주일 스마트폰 사용 시간 (단위: 시간)",
    days: ["월", "화", "수", "목", "금", "토", "일"],
    now: "지금",
    // 기록 카드 15장 (요일 순서). cat 은 정답 칸, icon 은 스티커
    cards: [
      { day: 0, label: "유튜브 영상", time: 4, cat: "동영상", icon: "st-play" },
      { day: 0, label: "온라인 강의", time: 2, cat: "학습", icon: "st-lecture" },
      { day: 1, label: "짧은 영상", time: 3, cat: "동영상", icon: "st-play" },
      { day: 1, label: "영어 단어 앱", time: 2, cat: "학습", icon: "st-book" },
      { day: 2, label: "모바일 게임", time: 3, cat: "게임", icon: "st-game" },
      { day: 2, label: "친구 사진 보기", time: 2, cat: "SNS", icon: "st-photo" },
      { day: 3, label: "온라인 강의", time: 3, cat: "학습", icon: "st-lecture" },
      { day: 3, label: "유튜브 영상", time: 4, cat: "동영상", icon: "st-play" },
      { day: 4, label: "모바일 게임", time: 4, cat: "게임", icon: "st-game" },
      { day: 4, label: "단체 대화방", time: 2, cat: "SNS", icon: "st-chat" },
      { day: 5, label: "유튜브 영상", time: 6, cat: "동영상", icon: "st-play" },
      { day: 5, label: "수학 문제 앱", time: 4, cat: "학습", icon: "st-book" },
      { day: 6, label: "짧은 영상", time: 4, cat: "동영상", icon: "st-play" },
      { day: 6, label: "수학 문제 앱", time: 3, cat: "학습", icon: "st-book" },
      { day: 6, label: "친구 소식 보기", time: 3, cat: "SNS", icon: "st-chat" },
    ],
    okLines: ['"좋아, 정확해!"', '"그 카드는 거기가 맞지."', '"취재 속도 좋은데?"', '"깔끔해!"'],
    streakLine: function (n) { return '"연속 ' + n + '번! 기자 감각이 살아 있어."'; },
    halfLine: '"절반 넘었어. 막대 모양이 보이기 시작하지?"',
    wrongLine: '"어? 다시 한번 읽어 볼까?"',
    wrongBox: "이 칸이 아닙니다. 카드에 적힌 내용을 다시 읽어 보자.",
    doneLine: '"그래프 완성! 다음 장에서 댓글이 사실인지 따져 보자."',
    helpBtn: "? 도움말",
    tableBtn: "기준표",
    tableTitle: "칸 기준표",
    help1: "도움말 1 · 카드의 한 일이 어떤 일인지 떠올려 보자. 기준표를 열면 칸마다 어떤 시간을 모으는지 알 수 있습니다.",
  },

  // ===== 3장 팩트 체크 =====
  ch3: {
    editorFirst: '"독자 댓글이 세 개 왔어. 사실인지 그래프로 판정해 보자."',
    inst: "2 독자 댓글이 [사실인지] 판정해 보자.",
    factBtn: "사실",
    notFactBtn: "사실 아님",
    evidenceHint: "근거가 되는 막대를 그래프에서 눌러 보자.",
    evidenceLead: "근거 · ",
    heightLabel: function (n) { return "높이 " + n; },
    // 막대 값(완성된 그래프) — 2장 합계와 같다
    barValues: { 동영상: 21, 학습: 14, 게임: 7, SNS: 7 },
    claims: [
      { reader: "별빛", av: "av-star", hearts: 42, text: "민준이는 동영상을 제일 오래 봤대.", answer: "fact", bars: ["동영상"], evidence: "동영상 막대가 가장 높습니다.", help2: "네 막대 가운데 가장 높은 막대를 찾아보자." },
      { reader: "숲속", av: "av-leaf", hearts: 17, text: "민준이는 공부보다 SNS를 더 오래 했대.", answer: "notfact", bars: ["학습", "SNS"], evidence: "학습 막대가 SNS 막대보다 높습니다.", help2: "학습 막대와 SNS 막대 가운데 어느 쪽이 더 높은지 선으로 재 보자." },
      { reader: "달빛", av: "av-moon", hearts: 9, text: "게임 시간이랑 SNS 시간이 똑같대.", answer: "fact", bars: ["게임", "SNS"], evidence: "게임 막대와 SNS 막대의 높이가 같습니다.", help2: "게임 막대에 선을 긋고, 그 선이 SNS 막대 끝에 닿는지 보자." },
    ],
    stampFact: "사실",
    stampNotFact: "사실 아님",
    verdictOk: '"판정 좋아! 이제 근거 막대를 짚어 줘."',
    evidenceOk: '"근거까지 완벽해. 다음 댓글로 가자."',
    lastOk: '"팩트 체크 끝! 이제 결론을 내자."',
    verdictWrong: '"잠깐, 막대 높이를 다시 재 볼까?"',
    verdictWrongBox: "그래프와 다시 맞춰 보자.",
    evidenceWrong: '"그 막대는 이 댓글과 관계가 적어."',
    evidenceWrongBox: "이 막대만으로는 댓글이 맞는지 따지기 어렵습니다. 댓글에 나온 칸을 다시 보자.",
    helpBtn: "? 도움말",
    help1: "도움말 1 · 막대를 누르면 높이를 재는 선이 생깁니다. 선을 그어 막대 높이를 비교해 보자.",
    answerPill: "근거 · 정답",
  },

  // ===== 4장 방법 고르기 =====
  ch4: {
    editor: '"확인한 사실을 근거로 민준이에게 방법을 골라 줘."',
    memoHeader: "근거 메모 · 2장에서 확인한 사실",
    memoEmpty: "2장에서 댓글을 판정하면 근거 메모가 여기에 붙습니다.",
    inst: "3 근거 메모를 보고 [민준이에게 권할 방법]을 골라 보자.",
    options: [
      { text: "동영상 자동 재생을 끄고, 하루에 볼 시간을 정한다.", icon: "st-autoplay-off", correct: true },
      { text: "학습 앱을 모두 지운다.", icon: "st-app-delete", correct: false },
      { text: "게임 시간부터 줄인다.", icon: "st-game-down", correct: false },
    ],
    okTag: "✓ 맞아요",
    noTag: "다시 보기",
    minjunInit: '"어떻게 하면 좋을까? 그래프를 보고 골라 줘."',
    minjunWrong: '"음… 그건 그래프랑 잘 안 맞는 것 같아. 근거 메모를 다시 봐 줄래?"',
    minjunOk: '"그래, 그거라면 해 볼 수 있겠어!"',
    editorOk: '"좋은 결론이야. 1면에 싣자!"',
    editorWrong: '"민준이 표정을 봐. 근거 메모를 다시 볼까?"',
    printBtn: "1면 인쇄하기",
  },

  // ===== 5장 1면 =====
  ch5: {
    masthead: "별숲 학생 신문",
    subline: "데이터 특집호 · 11월 셋째 주 · 2학년 3반 기자단",
    headline: "민준이의 스마트폰 시간, 동영상이 가장 많아",
    body: [
      "별숲중학교 2학년 민준이는 일주일 동안 스마트폰을 모두 49시간 썼습니다. 기록 카드 15장을 용도별로 정리하니 동영상이 21시간으로 가장 많았습니다. 하루로 나누면 동영상에만 3시간을 쓴 셈입니다.",
      "취재팀은 그래프를 근거로 동영상 자동 재생을 끄고, 하루에 볼 시간을 정하자고 권했습니다.",
    ],
    byline: "취재 · [이름] 기자",
    photoCaption: '"고마워! 동영상부터 줄여 볼게."',
    photoName: "제보한 민준이",
    publishStamp: "발행",
    emptyBox: "아직 기사 결론이 없습니다. 방법을 고르면 1면이 완성됩니다.",
    emptyBtn: "방법 고르기로 돌아가기",
  },
};
