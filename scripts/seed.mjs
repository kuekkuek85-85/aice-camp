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
      desc: "캠프에 온 것을 환영해요! 오늘 사용할 사이트들을 미리 둘러보세요. (이 단계는 입장하면 자동 완료돼요)",
      submitType: "none",
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
      desc: "아래 AI 도구 중 하나를 골라 오늘 배운 이론을 나만의 노트로 정리하고, 노트 링크를 제출하세요.",
      submitType: "link",
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
      desc: "기초 강의를 순서대로 따라 한 뒤, codex에서 \"지니야 호출 → TTS 응답\" 작품을 완성하세요. codex는 링크 공유가 안 되니 프로젝트를 .gen 파일로 내려받아 업로드로 제출해요. (함수 강의는 2일차에 다시 사용해요)",
      submitType: "file",
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
