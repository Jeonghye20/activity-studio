/* =========================================================
   장치 수리 센터 — 내용 데이터 (교사가 글자만 고치는 곳)
   화면에 나오는 모든 글을 여기 모읍니다. 코드(repair.js)에는 글을 박지 않습니다.
   - 작업 메모/도움말 문장에서 [[ ]] 안은 보라 형광펜 강조입니다.
   - 설명서 1쪽에서 __ __ 안은 빨강 굵게 강조입니다.
   ========================================================= */
window.REPAIR_CONTENT = {
  center: "나무중학교",
  title: "장치 수리 센터",
  deviceName: "운동 횟수 표시 장치",

  // 지시문
  inst1: "장치를 눌러 이상한 점을 찾아보자.",
  inst2: "잘못된 블록을 찾아 눌러 보자.",
  inst3: "잘못된 블록 때문에 생긴 일을 골라 보자.",

  // 버튼·라벨
  ui: {
    shakeBtn: "장치 흔들기",
    ledName: "LED 화면",
    ledEmpty: "빈 화면",
    varName: "운동 횟수",
    manualOpen: "설명서 보기",
    manualClose: "설명서 접기",
    manualTitle: "장치 설명서",
    manualNext: "사용 방법 보기",
    manualAgain: "장치 설명 다시 보기",
    manualUse: "사용 방법",
    reqFold: "요청서 접기",
    reqUnfold: "요청서 펼치기",
    received: "접수",
    doneTag: "✓ 수리 끝",
    hintOpen: "도움말 보기",
    hintMore: "도움말 하나 더 보기",
    hintAllSeen: "도움말을 모두 보았습니다",
    justRan: "방금 실행",
    nextReq: "다음 요청",
    submit: "제출하기",
    fixedCount: (n) => `고친 요청 ${n} / 3`,
    makecode: "메이크코드 열기",
    makecodeUrl: "https://makecode.microbit.org/",
    allDoneProp: "수리를 모두 마쳤습니다. 이제 메이크코드에서 나만의 장치를 만들어 보자.",
    memoTitle: "작업 메모",
    memoAgain: "다시 살펴보기",
    memoDone: "✓ 작업 메모",
    memoHint: (i) => `도움말 ${i} / 2`,
    codeTab: "블록",
    blockTag: "방금 실행",
  },

  // 정답 보기 모드
  answers: {
    banner: "정답 보기 중입니다. 학생 화면에는 보이지 않습니다.",
    wrongTag: "잘못된 블록",
    wrongTagOrder: "순서가 바뀐 블록",
    rightTag: "✓ 바른 블록",
    pickTag: "정답",
  },

  // 블록 토큰 (var=변수 어두운 칸, num=흰 숫자 칸, 나머지는 기본)
  // kind: 'blue' | 'purple' | 'red'
  hats: {
    start: { label: "시작하면", kind: "blue" },
    A:     { label: "A 버튼 누를 때", kind: "purple" },
    shake: { label: "흔들림 감지될 때", kind: "purple" },
    B:     { label: "B 버튼 누를 때", kind: "purple" },
  },
  blocks: {
    set0:  { kind: "red",  tokens: [{ t: "운동 횟수", v: true }, { t: "에" }, { t: "0", n: true }, { t: "저장" }] },
    inc:   { kind: "red",  tokens: [{ t: "운동 횟수", v: true }, { t: "값" }, { t: "1", n: true }, { t: "증가" }] },
    show:  { kind: "blue", tokens: [{ t: "숫자 출력" }, { t: "운동 횟수", v: true }] },
    clear: { kind: "blue", tokens: [{ t: "LED 스크린 지우기" }] },
  },

  // 설명서
  manual: {
    page1: [
      "줄넘기를 할 때 횟수를 대신 세어 주는 장치입니다. 마이크로비트로 만든 이 장치는 흔들 때마다 줄넘기 횟수가 하나씩 증가하고, 줄넘기 횟수를 LED 화면에 보여 줍니다.",
      "이 장치는 __운동 횟수__ 변수를 이용하여 줄넘기 횟수를 저장합니다.",
    ],
    page2: [
      { badge: "흔들", text: "장치를 흔들면 운동 횟수가 1만큼 증가합니다." },
      { badge: "A", text: "A 버튼을 누르면 운동 횟수를 LED 화면에 보여 줍니다." },
      { badge: "B", text: "B 버튼을 누르면 운동 횟수를 0으로 초기화하고, LED 화면에도 0을 보여 줍니다." },
    ],
  },

  // 공통 작업 메모 문장
  memo: {
    intro: "장치를 이미 켜 두었습니다. [[장치 흔들기 버튼과 A, B 버튼]]을 눌러 보세요.",
    touched: "이상한 점을 찾았습니까? [[그때 장치가 실행한 블록]]을 살펴보세요.",
    again: "이 블록은 제 역할을 합니다. [[이상한 점이 나타나는 순간에 장치가 실행하는 블록]]을 살펴보세요.",
    pickPrompt: "[[잘못된 블록 때문에 생긴 일]]을 골라 보세요.",
    choiceRight: "바르게 골랐습니다. [[고친 장치를 다시 눌러]] 확인해 보세요.",
    choiceWrong: "[[장치를 다시 눌러 보고]] 한 번 더 생각해 보세요.",
    allDone: "수리를 모두 마쳤습니다. 이제 메이크코드에서 나만의 장치를 만들어 보자.",
  },

  // 요청 3개
  requests: [
    {
      no: 1, name: "하윤",
      say: "아무리 흔들어도 A 버튼을 누르면 0만 나와.",
      done: "고마워! 이제 잘 돼.",
      bug: "shake",                 // 버그가 있는 '~할 때' 블록
      memoFixed: "바르게 고쳤습니다. 이제 장치는 [[흔들림을 감지할 때마다 운동 횟수를 1씩 늘립니다.]]",
      hints: [
        "[[흔들 때 장치가 실행하는 블록]]을 찾아보세요.",
        "[['흔들림 감지될 때' 블록 안에 넣은 블록]]이 운동 횟수를 늘리는지 살펴보세요.",
      ],
      choices: [
        { text: "흔들 때마다 운동 횟수에 0을 저장했기 때문입니다.", correct: true },
        { text: "A 버튼이 숫자를 출력하지 않았기 때문입니다.", correct: false },
      ],
    },
    {
      no: 2, name: "도현",
      say: "A 버튼을 눌러도 화면에 아무것도 안 나와.",
      done: "고마워! 이제 잘 돼.",
      bug: "A",
      memoFixed: "바르게 고쳤습니다. 이제 [[A 버튼을 누르면 장치가 운동 횟수를 화면에 출력합니다.]]",
      hints: [
        "[[A 버튼을 누를 때 장치가 실행하는 블록]]을 찾아보세요.",
        "[['A 버튼 누를 때' 블록 안에 넣은 블록]]이 숫자를 출력하는지 살펴보세요.",
      ],
      choices: [
        { text: "장치가 흔들림을 세지 않았기 때문입니다.", correct: false },
        { text: "A 버튼을 누르면 장치가 화면을 지웠기 때문입니다.", correct: true },
      ],
    },
    {
      no: 3, name: "서아",
      say: "B 버튼을 눌렀는데 화면이 0을 보여 주지 않고 아까 숫자를 보여 줘.",
      done: "고마워! 이제 잘 돼.",
      bug: "B",                     // B 블록 안 두 블록의 순서가 바뀜
      memoFixed: "두 블록의 순서를 바꾸었습니다. 장치는 블록 안에 넣은 블록을 [[위에서부터 차례로 실행합니다.]]",
      hints: [
        "[['B 버튼 누를 때' 블록 안의 두 블록]]을 위에서부터 차례로 읽어 보세요.",
        "장치가 숫자를 출력할 때 [[운동 횟수가 이미 0인지]] 생각해 보세요.",
      ],
      choices: [
        { text: "장치가 숫자를 먼저 출력하고 나서 0을 저장했기 때문입니다.", correct: true },
        { text: "'B 버튼 누를 때' 블록 안에 블록이 모자랐기 때문입니다.", correct: false },
      ],
    },
  ],
};
