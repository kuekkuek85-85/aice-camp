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

// ⚠️ 예시 데이터 — 실제 23명 명단으로 교체하세요.
const ROSTER = [
  { studentId: "10101", name: "예시학생", grade: 1, hasLevel2: false },
  { studentId: "30101", name: "테스트학생", grade: 3, hasLevel2: true },
];

const CONFIG_GLOBAL = {
  currentDay: 1,
  nameMasking: false,
  toolMenu: [
    { name: "NotebookLM", desc: "책 내용을 AI 요약노트로 정리", url: "https://notebooklm.google.com" },
    { name: "ChatGPT / Claude", desc: "질문하고 대화하며 개념 정리", url: "https://chat.openai.com" },
    { name: "Canva AI", desc: "노트를 보기 좋게 디자인", url: "https://www.canva.com" },
    { name: "바이브 코딩", desc: "이 사이트처럼 AI와 함께 만들기", url: "https://claude.ai" },
  ],
};

const DAY1 = {
  dayId: "1",
  title: "1일차 · AI와 첫 만남",
  goal: "AI 공부노트를 만들고, AI 코디니 기능을 체험하며 첫 작품을 제출한다.",
  timeline: [
    { period: "1교시", time: "45'", activity: "오리엔테이션 → 라이브 데모 → 개인 AI 공부노트 제작", steps: ["orientation", "ai-notebook"] },
    { period: "2교시", time: "45'", activity: "노트 마무리 → 공유·상호 반응 → 이론 정리", steps: ["ai-notebook", "notebook-share"] },
    { period: "3교시", time: "50'", activity: "코디니 기능 투어 → AICE 가입 병행 → codex 작품 미션", steps: ["codiny-tour", "aice-signup", "codex-submit"] },
  ],
  steps: [
    {
      stepId: "orientation",
      order: 1,
      title: "입장 · 오리엔테이션",
      desc: "캠프 홈을 둘러보고 오늘의 흐름을 확인하세요.",
      submitType: "none",
    },
    {
      stepId: "ai-notebook",
      order: 2,
      title: "AI 공부노트 제출",
      desc: "도구 메뉴판에서 하나를 골라 오늘 배운 내용을 AI와 함께 정리하고, 노트 URL을 제출하세요.",
      submitType: "link",
    },
    {
      stepId: "notebook-share",
      order: 3,
      title: "노트 공유 참여",
      desc: "친구들과 노트를 공유하고 서로의 노트에 반응을 남긴 뒤 완료 체크하세요.",
      submitType: "check",
    },
    {
      stepId: "codiny-tour",
      order: 4,
      title: "코디니 기능 투어",
      desc: "AI 코디니 intro 체험 후, 아래 6가지 기능을 순서대로 직접 따라 해보세요. (마이크/이어폰 필요)",
      submitType: "check",
      resourceUrl: "https://aicodiny.com/intro",
      micRequired: true,
      links: [
        { label: "① TTS (음성 합성)", url: "https://aicodiny.com/edu-basic/blocks?eduId=r158455azu83" },
        { label: "② STT (음성 인식)", url: "https://aicodiny.com/edu-basic/blocks?eduId=blkeduvlf419950yuyk" },
        { label: "③ 호출어", url: "https://aicodiny.com/edu-basic/blocks?eduId=mfc185352ed512" },
        { label: "④ AI 비서", url: "https://aicodiny.com/edu-basic/blocks?eduId=blkeduidb421909ohrx" },
        { label: "⑤ 워드클라우드", url: "https://aicodiny.com/edu-basic/blocks?eduId=e158810oyc29" },
        { label: "⑥ 단순회귀", url: "https://aicodiny.com/edu-basic/blocks?eduId=i158814nir982" },
      ],
    },
    {
      stepId: "aice-signup",
      order: 5,
      title: "AICE 회원가입",
      desc: "aice.study 에서 회원가입을 진행하세요. 중1은 본인인증 이슈로 지연될 수 있어요 — 가정에서 완료해도 괜찮아요.",
      submitType: "check",
      resourceUrl: "https://aice.study/main",
      deferrable: true,
    },
    {
      stepId: "codex-submit",
      order: 6,
      title: "codex 작품 제출",
      desc: "\"지니야 호출 → TTS 응답\" 수준의 작품을 완성하세요. codex는 링크 공유가 안 되니, 프로젝트를 .gen 파일로 내려받아 업로드해 제출하세요.",
      submitType: "file",
      resourceUrl: "https://aicodiny.com/codex",
      parallel: true,
    },
  ],
};

const DAY2 = {
  dayId: "2",
  title: "2일차 · 함수와 로직",
  goal: "함수의 개념을 익히고, 문제 1을 함께 푼 뒤 2~4번 문제에 개인적으로 도전한다.",
  timeline: [
    { period: "1교시", time: "45'", activity: "함수 개념 강의", steps: ["concept"] },
    { period: "2교시", time: "45'", activity: "문제 1 함께 풀기", steps: ["problem-1-together"] },
    { period: "3교시", time: "50'", activity: "문제 2~4 개인 도전", steps: ["problem-2-challenge", "problem-3-challenge", "problem-4-challenge"] },
  ],
  steps: [
    { stepId: "concept", order: 1, title: "함수 개념 익히기", desc: "함수의 정의·호출·매개변수·반환값 개념을 정리합니다. (콘텐츠 준비 중)", submitType: "check" },
    { stepId: "problem-1-together", order: 2, title: "문제 1 함께 풀기 (숫자확인)", desc: "선생님과 함께 함수 호출 구조를 완성합니다. 아래 실습 링크에서 직접 블록을 조립해보세요.", submitType: "check", resourceUrl: "https://aicodiny.com/edu-basic/blocks?eduId=mti191054pp917", problemFileName: "problem-1.gen", hints: [
      "함수는 정의만 하면 실행되지 않아요. 무엇이 필요할까요?",
      "시작 스택의 빈 자리에 들어갈 블록을 '함수' 카테고리에서 찾아보세요.",
      "'숫자확인' 호출 블록을 연결하고, 인수 자리에 '입력' 변수를 넣으세요.",
    ] },
    { stepId: "problem-2-challenge", order: 3, title: "문제 2 개인 도전 (홀수짝수)", desc: "매개변수와 반환값을 사용하는 함수를 완성해 .gen으로 제출하세요. 아래 실습 링크에서 풀어보세요.", submitType: "file", resourceUrl: "https://aicodiny.com/edu-basic/blocks?eduId=xmr191056jrn583", problemFileName: "problem-2.gen", hints: [
      "이 함수는 값을 '돌려주는' 함수예요. 빈 곳이 세 군데예요.",
      "if 조건에는 \"x가 짝수인가?\"를 판별하는 블록이, 반환 자리에는 '결과' 변수가 필요해요.",
      "호출할 때 '입력' 변수를 인수로 전달하세요.",
    ] },
    { stepId: "problem-3-challenge", order: 4, title: "문제 3 개인 도전 (평균계산)", desc: "매개변수 3개를 갖는 함수를 완성해 .gen으로 제출하세요. 아래 실습 링크에서 풀어보세요.", submitType: "file", resourceUrl: "https://aicodiny.com/edu-basic/blocks?eduId=dh191058dk37", problemFileName: "problem-3.gen", hints: [
      "매개변수가 3개인 함수예요. 호출할 때 몇 개를 전달해야 할까요?",
      "국어·수학·영어 점수를 순서대로 인수에 연결하고, 함수의 반환 자리에 '평균'을 넣으세요.",
      "말하기 블록에 '평균 점수' 변수를 이어 붙이세요.",
    ] },
    { stepId: "problem-4-challenge", order: 5, title: "문제 4 개인 도전 (자판기)", desc: "함수 두 개를 순서대로 호출하는 문제를 완성해 .gen으로 제출하세요. 아래 실습 링크에서 풀어보세요.", submitType: "file", resourceUrl: "https://aicodiny.com/edu-basic/blocks?eduId=obu191060pm03", problemFileName: "problem-4.gen", hints: [
      "함수 두 개를 '순서대로' 호출해야 해요. 어떤 순서일까요?",
      "'가격 확인' 다음에 '거스름돈 계산'. 거스름돈은 무엇에서 무엇을 뺀 값일까요?",
      "빼기 연산 블록에 '지불 금액'과 '가격'을 넣어 거스름돈 말하기에 연결하세요.",
    ] },
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

const DAY3 = placeholderDay("3", "3일차 · 심화 실습", "콘텐츠 준비 중");
const DAY4 = placeholderDay("4", "4일차 · 종합 프로젝트", "콘텐츠 준비 중");
const DAY5 = placeholderDay("5", "5일차 · 자습 · 모의평가", "자습 및 모의평가를 진행합니다.");

const PROBLEMS = [
  {
    problemId: "problem-1",
    title: "1번 숫자확인",
    order: 1,
    fileName: "problem-1.gen",
    hints: DAY2.steps[1].hints,
  },
  {
    problemId: "problem-2",
    title: "2번 홀수짝수",
    order: 2,
    fileName: "problem-2.gen",
    hints: DAY2.steps[2].hints,
  },
  {
    problemId: "problem-3",
    title: "3번 평균계산",
    order: 3,
    fileName: "problem-3.gen",
    hints: DAY2.steps[3].hints,
  },
  {
    problemId: "problem-4",
    title: "4번 자판기",
    order: 4,
    fileName: "problem-4.gen",
    hints: DAY2.steps[4].hints,
  },
];

async function main() {
  console.log("roster 시딩...");
  for (const entry of ROSTER) {
    await db.doc(`roster/${entry.studentId}`).set(entry);
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
