// Firestore 초기 데이터 시딩 스크립트
//
// 실행 전: .env.local 에 FIREBASE_ADMIN_PROJECT_ID / FIREBASE_ADMIN_CLIENT_EMAIL /
// FIREBASE_ADMIN_PRIVATE_KEY 를 채워두세요.
//
// 실행: node --env-file=.env.local scripts/seed.mjs
//
// ⚠️ ROSTER 배열은 예시입니다. 실제 캠프 명단(23명)으로 반드시 교체한 뒤 실행하세요.

import { cert, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const app = initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  }),
});

const db = getFirestore(app);

// 실제 캠프 명단 (2026 여름, 23명) — 학번은 학생 첫 로그인 시 자동 바인딩된다.
// hasLevel2(작년 Future 2급 취득)는 파악되는 대로 교사가 콘솔에서 true로 바꿔주면 된다.
const ROSTER = [
  { name: "김재우", grade: 1 },
  { name: "김준희", grade: 1 },
  { name: "이경섭", grade: 1 },
  { name: "이정우", grade: 1 },
  { name: "장새하", grade: 1 },
  { name: "장윤슬", grade: 1 },
  { name: "박강민", grade: 2 },
  { name: "박찬민", grade: 2 },
  { name: "서재윤", grade: 2 },
  { name: "서재희", grade: 2 },
  { name: "김승범", grade: 3 },
  { name: "김준혁", grade: 3 },
  { name: "김하정", grade: 3 },
  { name: "민준원", grade: 3 },
  { name: "민지원", grade: 3 },
  { name: "박소희", grade: 3 },
  { name: "박진아", grade: 3 },
  { name: "서은지", grade: 3 },
  { name: "설지후", grade: 3 },
  { name: "손우림", grade: 3 },
  { name: "이열정", grade: 3 },
  { name: "이준성", grade: 3 },
  { name: "함지운", grade: 3 },
].map((s) => ({ ...s, hasLevel2: false }));

const CONFIG_GLOBAL = {
  currentDay: 1,
  nameMasking: false,
  toolMenu: [
    { name: "Canva AI", desc: "노트를 보기 좋게 디자인 (교육용 팀 초대)", url: "https://www.canva.com/brand/join?token=SzX1bRZsMAJe5nNeK4T89g&brandingVariant=edu&referrer=team-invite" },
    { name: "Gemini", desc: "질문하고 대화하며 개념 정리", url: "https://gemini.google.com/" },
    { name: "NotebookLM", desc: "책 내용을 AI 요약노트로 정리", url: "https://notebooklm.google.com/" },
  ],
};

const DAY1 = {
  dayId: "1",
  title: "1일차 · AI와 첫 만남",
  goal: "AICE Future를 알아보고, 이론을 AI 도구로 정리하고, AI 코디니를 체험·실습한 뒤 AICE에 가입한다.",
  timeline: [
    { period: "1교시", time: "45'", activity: "오리엔테이션 → AICE Future 알아보기 → 이론 정리 노트 시작", steps: ["orientation", "future-intro", "ai-note"] },
    { period: "2교시", time: "45'", activity: "이론 정리 노트 완성·제출 → 코디니 체험", steps: ["ai-note", "codiny-intro"] },
    { period: "3교시", time: "50'", activity: "코디니 실습·작품 제출 → AICE 회원가입", steps: ["codiny-practice", "aice-signup"] },
  ],
  steps: [
    {
      stepId: "orientation",
      order: 1,
      title: "입장 · 참고 사이트 둘러보기",
      desc: "캠프에 온 것을 환영해요! 오늘 사용할 사이트들을 하나씩 열어 둘러본 뒤, 아래 완료 버튼을 눌러주세요.",
      submitType: "check",
      linksType: "choice",
      linksLabel: "오늘 사용할 사이트 목록 — 하나씩 열어보세요",
      links: [
        { label: "AICE 공식 홈페이지", url: "https://aice.study/main" },
        { label: "AICE Future 소개", url: "https://aice.study/info/aice/future" },
        { label: "AI 코디니 체험", url: "https://aicodiny.com/intro" },
        { label: "AI 코디니 실습 (codex)", url: "https://aicodiny.com/codex" },
      ],
    },
    {
      stepId: "future-intro",
      order: 2,
      title: "AICE Future 알아보기",
      desc: "우리가 준비하는 AICE Future 자격증이 무엇인지 소개 페이지를 읽어보고 완료 체크하세요.",
      submitType: "check",
      resourceUrl: "https://aice.study/info/aice/future",
    },
    {
      stepId: "ai-note",
      order: 3,
      title: "이론 내용 바이브 코딩으로 정리하기",
      desc: "선생님이 올려준 이론 자료(사진)를 내려받아, 아래 AI 도구 중 하나로 스스로 학습·요약해 나만의 산출물을 만들고 링크를 제출하세요.",
      submitType: "link",
      materialsPath: "materials/day1",
      linksType: "choice",
      linksLabel: "AI 도구 — 셋 중 하나를 골라 사용하세요",
      links: [
        { label: "Canva AI (교육용 팀 참여)", url: "https://www.canva.com/brand/join?token=SzX1bRZsMAJe5nNeK4T89g&brandingVariant=edu&referrer=team-invite" },
        { label: "Gemini", url: "https://gemini.google.com/" },
        { label: "NotebookLM", url: "https://notebooklm.google.com/" },
      ],
    },
    {
      stepId: "codiny-intro",
      order: 4,
      title: "AI 코디니 체험",
      desc: "AI 코디니 체험 페이지에서 TTS → STT → 호출어 → AI비서 → 워드클라우드 → 단순회귀 기능을 둘러보고 완료 체크하세요. (마이크/이어폰 필요)",
      submitType: "check",
      resourceUrl: "https://aicodiny.com/intro",
      micRequired: true,
    },
    {
      stepId: "codiny-practice",
      order: 5,
      title: "AI 코디니 실습 · 작품 제출",
      desc: "기초 강의를 순서대로 따라 한 뒤, codex에서 \"지니야 호출 → TTS 응답\" 작품을 완성하세요. 작품은 .gen 파일로 내려받아 업로드하면 좋아요. 업로드가 어려우면 \"파일 없이 완료했어요\"를 눌러 다음 단계로 넘어가도 됩니다. (함수 강의는 2일차에 다시 사용해요)",
      submitType: "fileOrCheck",
      resourceUrl: "https://aicodiny.com/codex",
      micRequired: true,
      links: [
        { label: "기초① TTS (음성 합성)", url: "https://aicodiny.com/edu-basic/blocks?eduId=r158455azu83" },
        { label: "기초② STT (음성 인식)", url: "https://aicodiny.com/edu-basic/blocks?eduId=blkeduvlf419950yuyk" },
        { label: "기초③ 호출어", url: "https://aicodiny.com/edu-basic/blocks?eduId=mfc185352ed512" },
        { label: "기초④ AI 비서", url: "https://aicodiny.com/edu-basic/blocks?eduId=blkeduidb421909ohrx" },
        { label: "기초⑤ 워드클라우드", url: "https://aicodiny.com/edu-basic/blocks?eduId=e158810oyc29" },
        { label: "기초⑥ 단순회귀", url: "https://aicodiny.com/edu-basic/blocks?eduId=i158814nir982" },
        { label: "함수① 숫자확인", url: "https://aicodiny.com/edu-basic/blocks?eduId=mti191054pp917" },
        { label: "함수② 홀수짝수", url: "https://aicodiny.com/edu-basic/blocks?eduId=xmr191056jrn583" },
        { label: "함수③ 평균계산", url: "https://aicodiny.com/edu-basic/blocks?eduId=dh191058dk37" },
        { label: "함수④ 자판기", url: "https://aicodiny.com/edu-basic/blocks?eduId=obu191060pm03" },
        { label: "작품 만들기 (codex)", url: "https://aicodiny.com/codex" },
      ],
    },
    {
      stepId: "aice-signup",
      order: 6,
      title: "AICE 공식 홈페이지 회원가입 · 로그인",
      desc: "aice.study 에서 회원가입 후 로그인까지 확인하세요. 중1은 본인인증 이슈로 지연될 수 있어요 — '나중에 할게요'를 누르고 가정에서 완료해도 괜찮아요.",
      submitType: "check",
      resourceUrl: "https://aice.study/main",
      deferrable: true,
    },
  ],
};

const CODEX_URL = "https://aicodiny.com/codex";

const DAY2 = {
  dayId: "2",
  title: "2일차 · 함수와 로직",
  goal: "매개변수·반환값이 있는 함수를 따라 만들어보고, 반복문과 함수를 함께 쓰는 미션 2개에 도전한다.",
  timeline: [
    { period: "1교시", time: "45'", activity: "따라하기 ① 제곱 출력하기 · ② 제곱 구하기", steps: ["square-print", "square-return"] },
    { period: "2교시", time: "45'", activity: "각자 미션 ① 거듭제곱 · ② 구구단", steps: ["power-mission", "gugudan-mission"] },
    { period: "3교시", time: "50'", activity: "각자 미션 ③ 단 제외 구구단 · ④ 3의 배수 · ⑤ 소수 → 마무리", steps: ["gugudan-skip-mission", "multiple3-mission", "prime-mission"] },
  ],
  steps: [
    {
      stepId: "square-print",
      order: 1,
      title: "따라하기 ① 매개변수 있는 함수 — 제곱 출력하기",
      desc: "매개변수 x를 받아 x의 제곱을 말하는 '제곱 출력하기' 함수를 선생님과 함께 만들어요. 제곱 출력하기(2), 제곱 출력하기(3)을 호출해보고, 마지막에는 사용자에게 수를 입력받아 그 수로 함수를 호출해보세요. 완성했으면 완료 버튼!",
      submitType: "fileOrCheck",
      linksType: "choice",
      linksLabel: "실습 사이트",
      links: [{ label: "AI 코디니 실습 사이트(codex) 열기", url: CODEX_URL }],
      hints: [
        "'함수' 카테고리에서 매개변수 x가 있는 '제곱 출력하기' 함수를 정의하세요.",
        "함수 안에서 x × x 를 말하기(출력) 블록에 넣으면 제곱이 출력돼요.",
        "호출 블록으로 제곱 출력하기(2), 제곱 출력하기(3)을 실행해보고, '묻고 기다리기'로 받은 대답을 인수 자리에 넣어보세요.",
      ],
    },
    {
      stepId: "square-return",
      order: 2,
      title: "따라하기 ② 반환값 있는 함수 — 제곱 구하기",
      desc: "이번에는 매개변수 x를 받아 제곱한 값을 '돌려주는(반환)' 함수 '제곱 구하기'를 만들어요. 제곱 구하기(2), 제곱 구하기(3)을 호출해서 반환값을 출력해보고, 사용자에게 입력받은 수로도 호출해보세요. 완성했으면 완료 버튼!",
      submitType: "fileOrCheck",
      linksType: "choice",
      linksLabel: "실습 사이트",
      links: [{ label: "AI 코디니 실습 사이트(codex) 열기", url: CODEX_URL }],
      hints: [
        "이번 함수는 값을 '돌려줘요' — 반환값이 있는 함수로 정의하세요.",
        "함수 안에서는 x × x 를 반환만 하고, 말하기(출력)는 함수 밖(호출한 쪽)에서 해요.",
        "말하기 블록 안에 '제곱 구하기(입력받은 수)' 호출 블록을 끼워 넣으면 반환값이 그대로 출력돼요.",
      ],
    },
    {
      stepId: "power-mission",
      order: 3,
      title: "각자 미션 ① 거듭제곱 구하기 (반복문 활용)",
      desc: "문제 상황: 수학 시간에 2의 10제곱을 계산해야 해요. 매개변수 x와 y를 받아 x의 y거듭제곱을 구하는 함수를 스스로 만들어보세요. 함수와 함께 반복문을 사용해야 해요! 완성 후 여러 값으로 호출해 확인하고 완료 버튼을 누르세요.",
      submitType: "fileOrCheck",
      linksType: "choice",
      linksLabel: "실습 사이트",
      links: [{ label: "AI 코디니 실습 사이트(codex) 열기", url: CODEX_URL }],
      hints: [
        "거듭제곱은 같은 수를 여러 번 곱하는 것 — x를 y번 곱하려면 어떤 블록이 필요할까요? (반복!)",
        "'결과' 변수를 1로 시작하고, y번 반복하면서 결과 × x 를 '결과'에 다시 저장하세요.",
        "매개변수 x, y를 받는 함수 안에 반복문을 넣고 '결과'를 반환한 뒤, 거듭제곱(2, 10)처럼 호출해 출력해보세요.",
      ],
    },
    {
      stepId: "gugudan-mission",
      order: 4,
      title: "각자 미션 ② 구구단 구하기 (반복문 활용)",
      desc: "문제 상황: 동생에게 구구단을 알려주는 프로그램을 만들어요. 매개변수 '단'을 받아 그 단(예: 7단)의 1~9까지 결과를 차례로 출력하는 함수를 스스로 만들어보세요. 역시 함수와 반복문을 함께 사용해야 해요! 완성했으면 완료 버튼을 누르세요.",
      submitType: "fileOrCheck",
      linksType: "choice",
      linksLabel: "실습 사이트",
      links: [{ label: "AI 코디니 실습 사이트(codex) 열기", url: CODEX_URL }],
      hints: [
        "7단이라면 7×1부터 7×9까지 — 1부터 9까지 커지는 수가 필요해요. 반복문을 떠올려보세요.",
        "반복 변수 i가 1~9로 변하는 동안, 단 × i 를 말하기(출력) 블록으로 보여주세요.",
        "매개변수 '단'을 받는 함수를 정의하고 반복문 안에서 \"단 × i = 결과\" 형태로 출력한 뒤, 원하는 단을 인수로 호출하세요.",
      ],
    },
    {
      stepId: "gugudan-skip-mission",
      order: 5,
      title: "각자 미션 ③ 입력한 단만 빼고 구구단 출력하기 (반복문 활용)",
      desc: "문제 상황: 동생이 7단은 이미 외웠대요! 매개변수로 '제외할 단'을 받아, 2~9단 중 그 단만 빼고 나머지 단을 모두 출력하는 함수를 스스로 만들어보세요. 함수와 반복문(그리고 조건!)을 함께 사용해야 해요. 완성했으면 완료 버튼을 누르세요.",
      submitType: "fileOrCheck",
      linksType: "choice",
      linksLabel: "실습 사이트",
      links: [{ label: "AI 코디니 실습 사이트(codex) 열기", url: CODEX_URL }],
      hints: [
        "반복이 두 겹 필요해요 — 2~9단을 도는 바깥 반복과, 각 단에서 1~9를 곱하는 안쪽 반복. 미션②에서 만든 '구구단' 함수를 다시 쓰면 안쪽 반복은 이미 완성돼 있어요!",
        "바깥 반복에서 \"만약 지금 단 = 제외할 단이면 출력하지 않기(건너뛰기)\" 조건 블록을 넣으세요.",
        "매개변수 '제외할 단'을 받는 함수 안에서, 2~9를 도는 반복 중 제외할 단이 아닐 때만 구구단(지금 단)을 호출하고, 마지막에 원하는 단을 인수로 함수를 호출하세요.",
      ],
    },
    {
      stepId: "multiple3-mission",
      order: 6,
      title: "각자 미션 ④ 3의 배수인지 음성으로 알려주기 (나머지 연산 + TTS)",
      desc: "문제 상황: 369 게임에서 3의 배수마다 박수를 쳐야 해요! 매개변수로 숫자를 받아 그 수가 3의 배수인지 아닌지 판별하고, 결과를 화면이 아니라 음성(TTS)으로 말해주는 함수를 스스로 만들어보세요. 함수·나머지 연산·TTS를 함께 사용해야 해요. ※ 13, 31처럼 3의 배수는 아니지만 숫자 3이 들어가는 수는 난이도상 다루지 않아요 — '3의 배수'만 판별하면 됩니다. 완성했으면 완료 버튼을 누르세요.",
      submitType: "fileOrCheck",
      micRequired: true,
      linksType: "choice",
      linksLabel: "실습 사이트",
      links: [{ label: "AI 코디니 실습 사이트(codex) 열기", url: CODEX_URL }],
      hints: [
        "어떤 수가 3의 배수인지 알려면 3으로 나눈 '나머지'를 보면 돼요 — 연산 카테고리에서 나머지 블록을 찾아보세요.",
        "만약 (수를 3으로 나눈 나머지) = 0 이면 배수(박수 짝!), 아니면 배수가 아니에요 — 조건(만약~아니면) 블록으로 갈라주세요.",
        "1일차에 써본 TTS(음성 합성) 블록을 기억하나요? 말하기 대신 TTS 블록에 \"3의 배수예요, 짝! / 3의 배수가 아니에요\"를 넣어 소리로 알려주고, 입력받은 수로 함수를 호출하세요.",
      ],
    },
    {
      stepId: "prime-mission",
      order: 7,
      title: "각자 미션 ⑤ \"지니야\"를 부르면 소수 판별하기 (반복문·나머지 연산 + 호출어)",
      desc: "문제 상황: 수학 탐정 AI 비서를 만들어요! \"지니야\"라고 부르면 깨어나서, 숫자를 받아 소수인지 아닌지 알려주는 함수를 실행하게 만드세요. 함수, 반복문, 나머지 연산에 호출어 인식까지 모두 사용하는 최종 보스 미션! 완성했으면 완료 버튼을 누르세요.",
      submitType: "fileOrCheck",
      micRequired: true,
      linksType: "choice",
      linksLabel: "실습 사이트",
      links: [{ label: "AI 코디니 실습 사이트(codex) 열기", url: CODEX_URL }],
      hints: [
        "소수는 약수가 딱 2개(1과 자기 자신)뿐인 수예요. 약수가 몇 개인지 세어보면 소수인지 알 수 있어요!",
        "'약수 개수' 변수를 0으로 시작하고, for 반복으로 i를 1부터 그 수까지 늘리면서 (수를 i로 나눈 나머지) = 0 이면 약수 개수를 1씩 늘리세요.",
        "반복이 끝난 뒤 약수 개수가 2와 같으면 \"소수가 맞아요\", 아니면 \"소수가 아니에요\"를 출력하세요. 그리고 \"지니야\" 호출어가 인식되면 이 함수를 호출하게 연결하면 나만의 수학 비서 완성!",
      ],
    },
  ],
};

function placeholderDay(dayId, title, goal) {
  return {
    dayId,
    title,
    goal,
    timeline: [],
    steps: [
      {
        stepId: "placeholder",
        order: 1,
        title: "콘텐츠 준비 중",
        desc: "선생님이 이 일차의 단계를 곧 채워줄 거예요.",
        submitType: "check",
      },
    ],
  };
}

const DATA_PORTAL_URL = "https://www.data.go.kr/";

const DAY3 = {
  dayId: "3",
  title: "3일차 · 엑셀 데이터 활용",
  goal: "엑셀(표) 데이터를 AI 코디니 '데이터 세트'로 불러와 활용하는 프로그램을 만든다. 주어진 엑셀로 실습하고, 공공데이터포털에서 직접 찾은 데이터로도 도전한다.",
  timeline: [
    { period: "1교시", time: "45'", activity: "엑셀 데이터·데이터 세트 개념 → 미션 ① 꽃말 도우미", steps: ["excel-intro", "flower-meaning"] },
    { period: "2교시", time: "45'", activity: "미션 ② 영어 단어 퀴즈 · 미션 ③ AICE 합격 조회", steps: ["word-quiz", "pass-check"] },
    { period: "3교시", time: "50'", activity: "미션 ④ 서울 폭염 최다 연도(최댓값 찾기) → 미션 ⑤ 나만의 데이터 앱(자유)", steps: ["heatwave-year", "free-project"] },
  ],
  steps: [
    {
      stepId: "excel-intro",
      order: 1,
      title: "엑셀 데이터란? · 오늘의 흐름",
      desc: "오늘은 엑셀(표) 데이터를 AI 코디니의 '데이터 세트'로 불러와 활용해요. 두 갈래로 진행합니다 — ① 선생님이 준 엑셀로 실습하기, ② 공공데이터포털에서 직접 데이터를 찾아 만들기. codex와 공공데이터포털을 한 번씩 열어보고 완료를 눌러주세요.",
      submitType: "check",
      linksType: "choice",
      linksLabel: "오늘 사용할 사이트",
      links: [
        { label: "AI 코디니 실습 사이트(codex) 열기", url: CODEX_URL },
        { label: "공공데이터포털 열기", url: DATA_PORTAL_URL },
      ],
    },
    {
      stepId: "flower-meaning",
      order: 2,
      title: "미션 ① 꽃말 도우미 (엑셀 데이터 + 번역)",
      desc: "문제 상황: 꽃집을 돕는 '꽃말 도우미'를 만들어요! 아래 '꽃말_엑셀.xlsx'을 내려받아 codex에서 '데이터 세트'로 추가한 뒤, 사용자가 꽃 이름을 말(또는 입력)하면 그 꽃의 꽃말을 한국어로 알려주고(예: \"장미의 꽃말은 사랑입니다.\") 영어로도 번역해서 알려주는 프로그램을 만드세요. 데이터 세트에 없는 꽃을 말하면 \"해당 꽃의 정보가 없습니다.\"라고 안내해야 해요. 완성한 .gen 파일을 업로드하면 AI가 채점해줘요. (마이크/이어폰 필요)",
      submitType: "fileOrCheck",
      micRequired: true,
      downloads: [{ fileName: "꽃말_엑셀.xlsx", label: "꽃말 엑셀 데이터 내려받기(.xlsx)" }],
      linksType: "choice",
      linksLabel: "실습 사이트",
      links: [{ label: "AI 코디니 실습 사이트(codex) 열기", url: CODEX_URL }],
      hints: [
        "먼저 '꽃말_엑셀.xlsx'을 내려받아 codex에서 '데이터 세트 추가'로 불러오세요. 그리고 사용자가 꽃 이름을 말(또는 입력)하면 그 이름으로 데이터 세트에서 꽃말을 '찾기' 하세요.",
        "찾은 꽃말이 '없음(비어 있음)'인지 조건(만약~아니면)으로 확인하세요 — 없으면 \"해당 꽃의 정보가 없습니다.\"라고 안내합니다.",
        "꽃말이 있으면 \"OO의 꽃말은 △△입니다\" 문장을 만들어 음성으로 말하고, 번역 블록으로 영어로 바꿔 한 번 더 말해주세요. 계속 반복하기로 여러 꽃을 물어볼 수도 있어요.",
      ],
    },
    {
      stepId: "word-quiz",
      order: 3,
      title: "미션 ② 영어 단어 퀴즈 (문제·정답 데이터셋 + 점수)",
      desc: "문제 상황: 영어 단어 퀴즈 프로그램을 만들어요! 아래 두 엑셀('영어단어퀴즈_문제.xlsx', '영어단어퀴즈_정답.xlsx')을 내려받아 codex에서 각각 '영단어 문제', '영단어 정답' 데이터 세트로 추가하세요. 전체 문제를 순서대로 하나씩 들려주고(또는 보여주고) 사용자에게 영어 단어 답을 입력받아, 맞으면 점수를 1점 올리세요. 모든 문제를 다 풀면 총 몇 점인지 알려줘야 해요. 완성한 .gen 파일을 업로드하면 AI가 채점해줘요. (마이크/이어폰 필요)",
      submitType: "fileOrCheck",
      micRequired: true,
      downloads: [
        { fileName: "영어단어퀴즈_문제.xlsx", label: "문제 엑셀 내려받기(.xlsx)" },
        { fileName: "영어단어퀴즈_정답.xlsx", label: "정답 엑셀 내려받기(.xlsx)" },
      ],
      linksType: "choice",
      linksLabel: "실습 사이트",
      links: [{ label: "AI 코디니 실습 사이트(codex) 열기", url: CODEX_URL }],
      hints: [
        "두 엑셀을 각각 '영단어 문제', '영단어 정답' 데이터 세트로 추가하세요. 문제는 번호(1~10)로 찾으면 돼요 — 반복문 i를 1부터 10까지 돌리며 데이터 세트에서 i번 문제를 '찾기' 하세요.",
        "먼저 점수 변수를 0으로 시작하세요. 각 문제를 낸 뒤 사용자 입력을 받아, '만약 입력 = 정답'이면 점수 = 점수 + 1 로 올립니다(아니면 오답 안내).",
        "반복이 끝난 뒤 점수 변수를 이용해 \"○개 정답!\"처럼 총점을 알려주세요. 정답도 데이터 세트에서 i번으로 찾아 비교하면 편해요.",
      ],
    },
    {
      stepId: "pass-check",
      order: 4,
      title: "미션 ③ AICE 합격 조회 (엑셀 데이터 + 조건)",
      desc: "문제 상황: 'AICE 자격증 합격 조회 프로그램'을 만들어요! 아래 '성적.xlsx'을 내려받아 codex에서 '성적' 데이터 세트로 추가하세요. 사용자가 휴대폰 번호 뒷 4자리를 입력하면 그 번호의 성적을 데이터 세트에서 찾아, 없는 번호면 \"조회 결과가 없습니다.\"라고 안내하고, 있으면 성적이 60점 이상이면 \"합격\", 아니면 \"불합격\"을 알려주세요. 완성한 .gen 파일을 업로드하면 AI가 채점해줘요. (마이크/이어폰 필요)",
      submitType: "fileOrCheck",
      micRequired: true,
      downloads: [{ fileName: "성적.xlsx", label: "성적 엑셀 내려받기(.xlsx)" }],
      linksType: "choice",
      linksLabel: "실습 사이트",
      links: [{ label: "AI 코디니 실습 사이트(codex) 열기", url: CODEX_URL }],
      hints: [
        "'성적.xlsx'을 '성적' 데이터 세트로 추가하세요. 사용자에게 휴대폰 번호 4자리를 입력받아, 그 번호로 데이터 세트에서 성적을 '찾기' 하세요.",
        "찾은 성적이 '없음(비어 있음)'인지 조건(만약~아니면)으로 먼저 확인하세요 — 없으면 \"조회 결과가 없습니다.\"라고 안내합니다.",
        "성적이 있으면 또 다른 조건으로 '만약 성적 ≥ 60'이면 \"합격\", 아니면 \"불합격\"을 알려주세요. (조건이 두 번 필요해요!)",
      ],
    },
    {
      stepId: "heatwave-year",
      order: 5,
      title: "미션 ④ 서울 폭염 최다 연도 찾기 (엑셀 데이터 + 최댓값 탐색)",
      desc: "문제 상황: 서울에서 폭염이 가장 많이 발생한 연도를 찾아주는 프로그램을 만들어요! 아래 '행정안전부_폭염 발생현황.xlsx'을 내려받아 codex에서 '서울 폭염' 데이터 세트로 추가하세요. 2007년부터 2022년까지의 폭염일수를 하나씩 살펴보며 '가장 많은 해'를 찾아(최댓값 찾기), 그 연도를 음성으로 안내하면 됩니다. 여러 값 중 최댓값을 찾는 방법이 헷갈리면 아래 '최댓값 찾기 시뮬레이션'을 꼭 먼저 열어보세요! 완성한 .gen 파일을 업로드하면 AI가 채점해줘요. (마이크/이어폰 필요)",
      submitType: "fileOrCheck",
      micRequired: true,
      downloads: [{ fileName: "행정안전부_폭염 발생현황.xlsx", label: "서울 폭염 엑셀 내려받기(.xlsx)" }],
      linksType: "choice",
      linksLabel: "실습 사이트 & 도움말 — 필요할 때 열어보세요",
      links: [
        { label: "🔎 최댓값 찾기 시뮬레이션 (단계별 도움말)", url: "/sim/max-search" },
        { label: "AI 코디니 실습 사이트(codex) 열기", url: CODEX_URL },
      ],
      hints: [
        "'서울 폭염' 데이터 세트를 추가하고, 먼저 첫 해(2007년)의 폭염일수를 '지금까지 최댓값'으로 정해두세요. '결과 연도' 변수도 준비하면 좋아요.",
        "반복문으로 다음 해부터 마지막 해(2022년)까지 돌면서, '만약 이번 해 폭염일수 > 지금까지 최댓값'이면 최댓값과 결과 연도를 이번 해로 바꿔주세요. (헷갈리면 시뮬레이션을 보세요!)",
        "데이터 값이 글자(문자)로 들어오면 숫자로 바꿔서 비교해야 정확해요. 반복이 끝나면 '결과 연도'를 음성으로 안내하세요.",
      ],
    },
    {
      stepId: "free-project",
      order: 6,
      title: "미션 ⑤ 나만의 데이터 앱 (자유 프로젝트) 🚀",
      desc: "이번엔 여러분 차례예요! 공공데이터포털(data.go.kr)에서 관심 있는 데이터를 하나 골라 엑셀로 내려받아 codex에서 '데이터 세트'로 추가하고, 지금까지 배운 블록으로 '실제로 쓸모 있는' 나만의 프로그램을 만드세요.\n\n[꼭 들어가야 할 것] ① 공공데이터(엑셀)를 데이터 세트로 사용하기 ② 사용자 입력 또는 반복으로 데이터 다루기 ③ 조건·반복·최댓값 찾기 중 최소 1가지 사용하기 ④ 결과를 음성(또는 말하기)으로 안내하기.\n\n주제·데이터·동작은 자유예요! 무엇을 만들지 막막하면 아래 힌트의 아이디어를 참고하세요. 완성한 .gen을 업로드하면 AI가 '무엇을 잘했고 무엇을 더하면 좋을지' 격려 피드백을 줘요.",
      submitType: "fileOrCheck",
      micRequired: true,
      linksType: "choice",
      linksLabel: "데이터 찾기 & 실습",
      links: [
        { label: "공공데이터포털 열기 (data.go.kr)", url: DATA_PORTAL_URL },
        { label: "AI 코디니 실습 사이트(codex) 열기", url: CODEX_URL },
      ],
      hints: [
        "무엇을 만들지 막막하면 이런 주제는 어때요? 🌫️ 우리 지역 미세먼지 등급 안내 / 🚇 지하철역 혼잡 시간 알려주기 / 📚 도서관·축제 개방시간 안내 / 🌡️ 기온·인구 데이터에서 최댓값(가장 큰 해) 찾기",
        "데이터를 골랐으면 '무엇을 입력하면 무엇을 알려줄지'를 한 문장으로 정해보세요. 예: \"측정소 이름을 말하면 미세먼지 등급을 알려준다.\" → 데이터 세트에서 '찾기' → 조건으로 등급 나누기.",
        "배운 걸 떠올려요 — 조회(미션①③), 반복+점수(미션②), 최댓값 찾기(미션④). 이 중 하나만 잘 써도 훌륭해요! 마지막엔 꼭 음성/말하기로 결과를 안내하면 완성이에요.",
      ],
    },
  ],
};

const DAY4 = {
  dayId: "4",
  title: "4일차 · AI 비전·응용",
  goal: "카메라로 글자를 읽는 OCR(문자 인식)을 비롯해 다양한 AI 기능으로 나만의 프로그램을 만든다.",
  timeline: [
    { period: "1교시", time: "45'", activity: "OCR(문자 인식) 개념 → 미션 ① OCR 번역기", steps: ["ocr-intro", "ocr-translate"] },
    { period: "2교시", time: "45'", activity: "미션 ② 감정 노래 추천 (얼굴·감정 인식)", steps: ["emotion-song"] },
    { period: "3교시", time: "50'", activity: "미션 ③ 티처블머신 자세 게임 → 미션 ④ 회귀분석 예측", steps: ["teachable-pose", "regression-predict"] },
  ],
  steps: [
    {
      stepId: "ocr-intro",
      order: 1,
      title: "오늘의 흐름 · 준비하기",
      desc: "오늘은 카메라로 글자를 읽는 OCR(문자 인식)을 비롯해 다양한 AI 기능으로 프로그램을 만들어요. 실습 사이트(codex)를 열고, 마이크·카메라 권한을 허용한 뒤 시작하세요.",
      submitType: "check",
      micRequired: true,
      linksType: "choice",
      linksLabel: "오늘 사용할 사이트",
      links: [{ label: "AI 코디니 실습 사이트(codex) 열기", url: CODEX_URL }],
    },
    {
      stepId: "ocr-translate",
      order: 2,
      title: "미션 ① OCR 번역기 (문자 인식 + 번역)",
      desc: "문제 상황: 카메라로 비춘 한국어 글자를 읽어 영어로 번역해주는 통역기를 만들어요! \"지니야\"라고 부르면 시작해서, 비디오(카메라) 화면을 켜고 글자를 감지한 뒤, 감지된 첫 번째 텍스트를 한국어→영어로 번역해서 음성으로 알려주세요. 완성한 .gen 파일을 업로드하면 AI가 채점해줘요. (마이크·카메라 필요)",
      submitType: "fileOrCheck",
      micRequired: true,
      linksType: "choice",
      linksLabel: "실습 사이트",
      links: [{ label: "AI 코디니 실습 사이트(codex) 열기", url: CODEX_URL }],
      hints: [
        "\"지니야\" 호출어 블록으로 시작하게 만드세요. 호출어가 인식되면 그 안에서 카메라를 켜고 글자를 감지합니다.",
        "'비디오 화면 보이기' → '텍스트 감지 시작(카메라)' 순서로 넣으세요. 감지가 끝나면 '감지된 텍스트'를 가져올 수 있어요.",
        "감지된 첫 번째(1번째) 텍스트를 번역 블록(한국어→영어)에 넣고, 그 결과를 음성으로 말해주면 완성이에요.",
      ],
    },
    {
      stepId: "emotion-song",
      order: 3,
      title: "미션 ② 감정 노래 추천 (얼굴·감정 인식)",
      desc: "문제 상황: 얼굴 표정을 보고 기분에 맞는 노래를 추천해주는 AI DJ를 만들어요! \"지니야\"라고 부르면 시작해서, 비디오(카메라) 화면을 켜고 얼굴을 감지한 뒤 '감정 분석' 신호를 보내 감정을 분석하세요. 감정이 '기쁨'이면 신나는 노래, '슬픔'이면 위로가 되는 노래, 그 외에는 랜덤으로 노래를 재생한다고 음성으로 안내하면 됩니다. 완성한 .gen 파일을 업로드하면 AI가 채점해줘요. (마이크·카메라 필요)",
      submitType: "fileOrCheck",
      micRequired: true,
      linksType: "choice",
      linksLabel: "실습 사이트",
      links: [{ label: "AI 코디니 실습 사이트(codex) 열기", url: CODEX_URL }],
      hints: [
        "\"지니야\" 호출어로 시작해서 '비디오 화면 보이기' → '얼굴 감지 시작(카메라)'을 넣으세요. 얼굴이 감지되면 '감정 분석' 신호를 '보내고 기다리기' 하세요.",
        "따로 '감정 분석 신호를 받았을 때' 블록을 만들어, 그 안에서 감지된 얼굴의 '감정'을 가져와 비교합니다.",
        "조건(만약~아니고 만약~아니면)으로 감정을 나누세요 — '기쁨'이면 신나는 노래, '슬픔'이면 위로되는 노래, 그 외에는 랜덤 노래를 재생한다고 음성으로 안내하면 완성이에요.",
      ],
    },
    {
      stepId: "teachable-pose",
      order: 4,
      title: "미션 ③ 티처블머신 자세 게임 (직접 학습한 AI 모델)",
      desc: "문제 상황: 내가 직접 AI를 학습시켜 '왼손들어/오른손들어' 자세 게임을 만들어요! 먼저 티처블머신(teachablemachine.withgoogle.com)에서 '왼손들어', '오른손들어' 두 자세(포즈)를 학습시키고, [내보내기 → 업로드 → 공유 링크 복사]로 내 모델 링크를 만드세요. codex에서 비디오를 켜고 좌우 반전한 뒤 그 링크로 모델을 연결하고, 5번 반복하며 왼손/오른손을 무작위로 문제로 내(음성), 사용자의 자세가 문제와 맞으면 점수를 올리고, 마지막에 총점을 알려주세요. 완성한 .gen 파일을 업로드하면 AI가 채점해줘요. (마이크·카메라 필요, 링크는 각자 달라요)",
      submitType: "fileOrCheck",
      micRequired: true,
      linksType: "choice",
      linksLabel: "사용할 사이트",
      links: [
        { label: "티처블머신 열기 (모델 학습)", url: "https://teachablemachine.withgoogle.com" },
        { label: "AI 코디니 실습 사이트(codex) 열기", url: CODEX_URL },
      ],
      hints: [
        "티처블머신에서 'Pose Project'로 '왼손들어', '오른손들어' 두 클래스를 학습시키고, [Export Model → Upload → 공유 링크 복사]로 내 모델 링크를 준비하세요.",
        "codex에서 '비디오 화면 보이기' → '비디오 좌우 반전' → '티처블머신 자세 모델 연결'(복사한 링크 붙여넣기) 순서로 시작하세요. 점수 변수는 0으로 시작!",
        "5번 반복 안에서 무작위(1~2)로 문제(왼손/오른손)를 정해 음성으로 내고, '티처블머신 인식 결과'가 문제와 같으면 점수+1(아니면 오답). 반복이 끝나면 총점을 말해주세요.",
      ],
    },
    {
      stepId: "regression-predict",
      order: 5,
      title: "미션 ④ 학급당 학생 수 예측 (단순 회귀 분석)",
      desc: "문제 상황: 데이터의 흐름을 읽어 미래를 예측하는 AI를 만들어요! 2024년 이후 전국 초등학교의 학급당 학생 수가 18명 이하로 줄어드는 해를 예측합니다. codex의 [AI 학습 → 데이터 과학 → 단순 회귀 분석]에서 '초등학생 학급당 학생 수' 테이블을 불러와, '전국' 값을 예측하는 단순 회귀 모델을 만들고 이름을 '학급당 학생 수 예측'으로 저장하세요. 그리고 2025년부터 매년 예측값을 채팅으로 출력하다가, 18명 이하가 되는 첫 해가 나오면 그 연도를 알려주고 멈추면 됩니다. 회귀분석이 낯설면 아래 '회귀분석 시뮬레이션'을 꼭 먼저 열어보세요! 완성한 .gen 파일을 업로드하면 AI가 채점해줘요.",
      submitType: "fileOrCheck",
      micRequired: true,
      linksType: "choice",
      linksLabel: "실습 사이트 & 도움말 — 필요할 때 열어보세요",
      links: [
        { label: "📈 회귀분석 시뮬레이션 (단계별 도움말)", url: "/sim/regression" },
        { label: "AI 코디니 실습 사이트(codex) 열기", url: CODEX_URL },
      ],
      hints: [
        "[AI 학습 → 데이터 과학 → 단순 회귀 분석]에서 '초등학생 학급당 학생 수' 테이블을 불러와, '전국' 값을 예측하는 모델을 만들고 이름을 '학급당 학생 수 예측'으로 저장하세요.",
        "'연도' 변수를 2025로 시작하고 '계속 반복' 안에서 '단순회귀예측(연도)'로 학생 수를 구해 채팅으로 출력하세요.",
        "만약 예측한 학생 수가 18 이하이면 그 연도를 안내하고 '반복 멈추기'로 멈추세요. 아니면 연도를 1 늘려 다음 해를 예측합니다.",
      ],
    },
  ],
};
const DAY5 = {
  dayId: "5",
  title: "5일차 · API & 모의고사",
  goal: "외부 API로 실시간 정보를 불러오는 법을 정답 코드 해설로 익히고, 모의고사로 5일간 배운 내용을 점검한다.",
  timeline: [
    { period: "1교시", time: "45'", activity: "API·JSON 개념 → API 문제 ① 정답 코드 한 줄씩 해설", steps: ["api-subway"] },
    { period: "2~4교시", time: "150'", activity: "모의고사 3회 (곧 공개)", steps: ["api-subway"] },
  ],
  steps: [
    {
      stepId: "api-subway",
      order: 1,
      title: "API 문제 ① 장한평역 호선 조회 (정답 코드 해설)",
      desc:
        "문제 상황: 장한평역이 몇 호선인지 실시간으로 조회하는 프로그램을 만들어요! 이번 문제는 조금 어려워서, 완성된 정답 코드를 함께 한 줄씩 이해하는 방식으로 진행해요.\n\n" +
        "① 아래에서 문제·정답 .gen을 내려받아 codex에 업로드하세요.\n" +
        "② [속성 → 외부 API 추가]에서 'API 이름: 전철역 호선 조회', 'END POINT: http://openapi.seoul.go.kr:8088/53736b544f6b756537366352686b68/json/SearchInfoBySubwayNameService/1/5/장한평' 을 저장하고 '호출 테스트'를 눌러보세요.\n" +
        "③ 아래 '🔌 API가 뭐예요?', '📦 JSON이 뭐예요?', '🧑‍💻 코드 한 줄씩 해설'을 열어 개념과 코드를 이해하세요.\n" +
        "이해했으면 완료를 누르세요. (원하면 내 파일을 업로드해도 돼요)",
      submitType: "fileOrCheck",
      downloads: [{ fileName: "day5-api-1.gen", label: "API 문제·정답 코드 내려받기(.gen)" }],
      linksType: "choice",
      linksLabel: "설명 자료 & 실습 — 순서대로 열어보세요",
      links: [
        { label: "🔌 API가 뭐예요? (그림 설명)", url: "/learn/api" },
        { label: "📦 JSON이 뭐예요? (그림 설명)", url: "/learn/json" },
        { label: "🧑‍💻 코드 한 줄씩 해설", url: "/learn/api-code" },
        { label: "AI 코디니 실습 사이트(codex) 열기", url: CODEX_URL },
      ],
      hints: [
        "외부 API는 '종업원'이에요 — 내가 못 들어가는 서버(주방)에 대신 다녀와 데이터(음식)를 가져다줘요. 먼저 '🔌 API가 뭐예요?'를 열어보세요.",
        "API가 돌려주는 답은 JSON이에요. 이름표(key)를 순서대로 타고 들어가면 값이 나와요: SearchInfoBySubwayNameService → row → 0 → LINE_NUM. '📦 JSON이 뭐예요?'에서 직접 따라가 보세요.",
        "코드는 이 경로를 그대로 한 줄씩 꺼내는 것뿐이에요. '🧑‍💻 코드 한 줄씩 해설'에서 각 줄이 JSON의 어디를 꺼내는지 맞춰보면 완전히 이해돼요!",
      ],
    },
  ],
};

// 교사 대시보드 "정답 .gen 다운로드" 목록.
// 완성 예시 .gen을 Storage answers/{fileName} 에 올려두면 교사만 내려받을 수 있다.
const PROBLEMS = [
  {
    problemId: "problem-1",
    title: "따라하기① 제곱 출력하기",
    order: 1,
    fileName: "problem-1.gen",
    hints: DAY2.steps[0].hints,
  },
  {
    problemId: "problem-2",
    title: "따라하기② 제곱 구하기",
    order: 2,
    fileName: "problem-2.gen",
    hints: DAY2.steps[1].hints,
  },
  {
    problemId: "problem-3",
    title: "미션① 거듭제곱 구하기",
    order: 3,
    fileName: "problem-3.gen",
    hints: DAY2.steps[2].hints,
  },
  {
    problemId: "problem-4",
    title: "미션② 구구단 구하기",
    order: 4,
    fileName: "problem-4.gen",
    hints: DAY2.steps[3].hints,
  },
  {
    problemId: "problem-5",
    title: "미션③ 입력한 단만 빼고 구구단 출력",
    order: 5,
    fileName: "problem-5.gen",
    hints: DAY2.steps[4].hints,
  },
  {
    problemId: "problem-6",
    title: "미션④ 3의 배수 음성(TTS) 판별",
    order: 6,
    fileName: "problem-6.gen",
    hints: DAY2.steps[5].hints,
  },
  {
    problemId: "problem-7",
    title: "미션⑤ 지니야 호출 소수 판별",
    order: 7,
    fileName: "problem-7.gen",
    hints: DAY2.steps[6].hints,
  },
  {
    problemId: "day3-1",
    title: "3일차 미션① 꽃말 도우미 (엑셀+번역)",
    order: 8,
    fileName: "day3-1.gen",
    hints: DAY3.steps[1].hints,
  },
  {
    problemId: "day3-2",
    title: "3일차 미션② 영어 단어 퀴즈 (문제·정답 데이터셋+점수)",
    order: 9,
    fileName: "day3-2.gen",
    hints: DAY3.steps[2].hints,
  },
  {
    problemId: "day3-3",
    title: "3일차 미션③ AICE 합격 조회 (엑셀+조건)",
    order: 10,
    fileName: "day3-3.gen",
    hints: DAY3.steps[3].hints,
  },
  {
    problemId: "day3-4",
    title: "3일차 미션④ 서울 폭염 최다 연도 (엑셀+최댓값 탐색)",
    order: 11,
    fileName: "day3-4.gen",
    hints: DAY3.steps[4].hints,
  },
  {
    problemId: "day4-1",
    title: "4일차 OCR① OCR 번역기 (문자 인식+번역)",
    order: 12,
    fileName: "day4-1.gen",
    hints: DAY4.steps[1].hints,
  },
  {
    problemId: "day4-2",
    title: "4일차 미션② 감정 노래 추천 (얼굴·감정 인식)",
    order: 13,
    fileName: "day4-2.gen",
    hints: DAY4.steps[2].hints,
  },
  {
    problemId: "day4-3",
    title: "4일차 미션③ 티처블머신 자세 게임 (직접 학습 모델)",
    order: 14,
    fileName: "day4-3.gen",
    hints: DAY4.steps[3].hints,
  },
  {
    problemId: "day4-4",
    title: "4일차 미션④ 학급당 학생 수 예측 (단순 회귀 분석)",
    order: 15,
    fileName: "day4-4.gen",
    hints: DAY4.steps[4].hints,
  },
];

async function main() {
  console.log("roster 시딩...");
  // 문서 ID는 g{학년}-{이름}. merge라서 재실행해도 바인딩된 studentId가 보존된다.
  const validIds = new Set(ROSTER.map((e) => `g${e.grade}-${e.name}`));
  for (const entry of ROSTER) {
    await db.doc(`roster/g${entry.grade}-${entry.name}`).set(entry, { merge: true });
  }
  // 명단에 없는 옛 항목(예시/테스트 데이터) 정리
  const existing = await db.collection("roster").get();
  for (const doc of existing.docs) {
    if (!validIds.has(doc.id)) {
      console.log(`  - 명단 외 항목 삭제: ${doc.id}`);
      await doc.ref.delete();
    }
  }

  console.log("config/global 시딩...");
  await db.doc("config/global").set(CONFIG_GLOBAL);

  console.log("days 시딩...");
  for (const day of [DAY1, DAY2, DAY3, DAY4, DAY5]) {
    await db.doc(`days/${day.dayId}`).set(day);
  }

  console.log("problems 시딩...");
  for (const problem of PROBLEMS) {
    await db.doc(`problems/${problem.problemId}`).set(problem);
  }

  console.log("✅ 시딩 완료");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
