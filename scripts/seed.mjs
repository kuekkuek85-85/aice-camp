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
    { period: "2교시", time: "45'", activity: "각자 미션 ① 거듭제곱 구하기", steps: ["power-mission"] },
    { period: "3교시", time: "50'", activity: "각자 미션 ② 구구단 · ③ 단 제외 구구단 → 마무리", steps: ["gugudan-mission", "gugudan-skip-mission"] },
  ],
  steps: [
    {
      stepId: "square-print",
      order: 1,
      title: "따라하기 ① 매개변수 있는 함수 — 제곱 출력하기",
      desc: "매개변수 x를 받아 x의 제곱을 말하는 '제곱 출력하기' 함수를 선생님과 함께 만들어요. 제곱 출력하기(2), 제곱 출력하기(3)을 호출해보고, 마지막에는 사용자에게 수를 입력받아 그 수로 함수를 호출해보세요. 완성했으면 완료 버튼!",
      submitType: "check",
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
      submitType: "check",
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
      submitType: "check",
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
      submitType: "check",
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
      submitType: "check",
      linksType: "choice",
      linksLabel: "실습 사이트",
      links: [{ label: "AI 코디니 실습 사이트(codex) 열기", url: CODEX_URL }],
      hints: [
        "반복이 두 겹 필요해요 — 2~9단을 도는 바깥 반복과, 각 단에서 1~9를 곱하는 안쪽 반복. 미션②에서 만든 '구구단' 함수를 다시 쓰면 안쪽 반복은 이미 완성돼 있어요!",
        "바깥 반복에서 \"만약 지금 단 = 제외할 단이면 출력하지 않기(건너뛰기)\" 조건 블록을 넣으세요.",
        "매개변수 '제외할 단'을 받는 함수 안에서, 2~9를 도는 반복 중 제외할 단이 아닐 때만 구구단(지금 단)을 호출하고, 마지막에 원하는 단을 인수로 함수를 호출하세요.",
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

const DAY3 = placeholderDay("3", "3일차 · 심화 실습", "콘텐츠 준비 중");
const DAY4 = placeholderDay("4", "4일차 · 종합 프로젝트", "콘텐츠 준비 중");
const DAY5 = placeholderDay("5", "5일차 · 자습 · 모의평가", "자습 및 모의평가를 진행합니다.");

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
