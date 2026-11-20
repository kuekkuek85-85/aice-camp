// 교사 연수(시연) 데이터 정리 — 실제 학생 데이터는 건드리지 않는다.
//
// 대상(모두 uid 접두어 "demo-" 로만 식별):
//   Firestore  demoParticipants/*            (연수 참가자 목록 전체)
//              progress/demo-*_{일차}        (단계 진행·제출·AI 피드백)
//              examResults/demo-*_{회차}     (모의평가 결과)
//              publicProgress/demo-*, students/demo-*  (원래 생기지 않지만 혹시 남은 것)
//   Storage    submissions/demo-*/**, examSubmissions/demo-*/**  (제출한 .gen)
//
// 사용법 (프로젝트 루트, .env.local 로드 후):
//   set -a; . ./.env.local; set +a
//   node scripts/cleanup-demo.mjs            # 기본: 무엇이 지워질지 목록만 출력(dry-run)
//   node scripts/cleanup-demo.mjs --apply    # 실제 삭제
//   node scripts/cleanup-demo.mjs --apply --close   # 삭제 + 연수 입장 닫기
//
// ⚠️ 교사 대시보드의 '초기화' 버튼은 실제 학생 데이터 전체를 지운다. 연수 정리에는 이 스크립트를 쓴다.
import { cert, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

const APPLY = process.argv.includes("--apply");
const CLOSE = process.argv.includes("--close");

const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/^"|"$/g, "").replace(/\\n/g, "\n");
if (!projectId || !clientEmail || !privateKey) {
  console.error("FIREBASE_ADMIN_* 환경변수가 필요합니다. (.env.local 을 먼저 로드하세요)");
  process.exit(1);
}

initializeApp({
  credential: cert({ projectId, clientEmail, privateKey }),
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
});
const db = getFirestore();
const bucket = getStorage().bucket();

const isDemo = (id) => id.startsWith("demo-");

async function demoDocs(collection, all = false) {
  const refs = await db.collection(collection).listDocuments();
  return refs.filter((r) => all || isDemo(r.id));
}

const targets = {
  demoParticipants: await demoDocs("demoParticipants", true),
  progress: await demoDocs("progress"),
  examResults: await demoDocs("examResults"),
  publicProgress: await demoDocs("publicProgress"),
  students: await demoDocs("students"),
};

const files = [
  ...(await bucket.getFiles({ prefix: "submissions/demo-" }))[0],
  ...(await bucket.getFiles({ prefix: "examSubmissions/demo-" }))[0],
];

// 안전장치: 대상은 반드시 demo- 로만 식별된 것이어야 한다(demoParticipants 제외)
for (const [col, refs] of Object.entries(targets)) {
  if (col === "demoParticipants") continue;
  if (refs.some((r) => !isDemo(r.id))) throw new Error(`${col} 에 demo- 가 아닌 문서가 섞였습니다. 중단합니다.`);
}
if (files.some((f) => !/^(submissions|examSubmissions)\/demo-/.test(f.name))) {
  throw new Error("Storage 대상에 demo- 가 아닌 파일이 섞였습니다. 중단합니다.");
}

console.log(APPLY ? "== 삭제 실행 ==" : "== 미리보기(dry-run) — 실제로 지우려면 --apply ==");
for (const [col, refs] of Object.entries(targets)) {
  console.log(`Firestore ${col}: ${refs.length}건`);
  refs.slice(0, 50).forEach((r) => console.log(`   - ${r.path}`));
}
console.log(`Storage 제출 파일: ${files.length}개`);
files.slice(0, 50).forEach((f) => console.log(`   - ${f.name}`));

if (APPLY) {
  for (const refs of Object.values(targets)) {
    for (const r of refs) await r.delete();
  }
  for (const f of files) await f.delete();
  console.log("삭제 완료.");
}

if (CLOSE) {
  if (APPLY) {
    await db.doc("workshopSettings/main").set({ enabled: false, code: "", updatedAt: Date.now() });
    console.log("연수 입장을 닫았습니다(코드 초기화).");
  } else {
    console.log("(--apply 와 함께 쓰면 연수 입장을 닫습니다)");
  }
}
