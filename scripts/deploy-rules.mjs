// Firebase 보안 규칙 배포 스크립트 (Rules REST API 직접 호출).
//
// 왜 이게 필요한가:
//   `firebase deploy --only storage,firestore:rules` 는 배포 전 serviceusage API로
//   API 활성화 여부를 확인하는데, firebase-adminsdk 서비스 계정에는 그 권한이 없어
//   403(Permission denied to get service ...)으로 막힌다. 이 스크립트는 그 확인 단계를
//   건너뛰고 firebaserules.googleapis.com 에 직접 ruleset 을 만들고 release 를 갱신한다.
//
// ⚠️ 저장소의 *.rules 파일은 자동 배포되지 않는다. 규칙을 고쳤으면 반드시 이 스크립트를 실행할 것.
//
// 사용법 (프로젝트 루트에서, .env.local 로드 후):
//   set -a; . ./.env.local; set +a
//   node scripts/deploy-rules.mjs            # storage + firestore 둘 다 배포
//   node scripts/deploy-rules.mjs storage    # storage 만
//   node scripts/deploy-rules.mjs firestore  # firestore 만
//
// 필요한 환경변수: FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL,
//   FIREBASE_ADMIN_PRIVATE_KEY, NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
import { readFileSync } from "node:fs";
import { GoogleAuth } from "google-auth-library";

const project = process.env.FIREBASE_ADMIN_PROJECT_ID;
const bucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
const privateKey = (process.env.FIREBASE_ADMIN_PRIVATE_KEY || "")
  .replace(/^"|"$/g, "")
  .replace(/\\n/g, "\n");

if (!project || !clientEmail || !privateKey) {
  console.error(
    "FIREBASE_ADMIN_PROJECT_ID / FIREBASE_ADMIN_CLIENT_EMAIL / FIREBASE_ADMIN_PRIVATE_KEY 환경변수가 필요합니다."
  );
  process.exit(1);
}

const targets = process.argv.slice(2).length ? process.argv.slice(2) : ["storage", "firestore"];
const RELEASES = {
  storage: {
    file: "storage.rules",
    fileName: "storage.rules",
    release: () => {
      if (!bucket) throw new Error("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET 이 필요합니다.");
      return `firebase.storage/${bucket}`;
    },
  },
  firestore: {
    file: "firestore.rules",
    fileName: "firestore.rules",
    release: () => "cloud.firestore",
  },
};

const auth = new GoogleAuth({
  credentials: { client_email: clientEmail, private_key: privateKey },
  scopes: ["https://www.googleapis.com/auth/firebase"],
});
const token = (await (await auth.getClient()).getAccessToken()).token;
const H = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
const base = `https://firebaserules.googleapis.com/v1/projects/${project}`;

for (const t of targets) {
  const cfg = RELEASES[t];
  if (!cfg) {
    console.error(`알 수 없는 대상: ${t} (storage 또는 firestore)`);
    process.exit(1);
  }
  const source = readFileSync(cfg.file, "utf8");

  // 1) 새 ruleset 생성
  const createRes = await fetch(`${base}/rulesets`, {
    method: "POST",
    headers: H,
    body: JSON.stringify({ source: { files: [{ name: cfg.fileName, content: source }] } }),
  });
  const created = await createRes.json();
  if (!createRes.ok) {
    console.error(`[${t}] ruleset 생성 실패`, createRes.status, JSON.stringify(created));
    process.exit(1);
  }

  // 2) release 를 새 ruleset 으로 갱신
  const relName = `projects/${project}/releases/${cfg.release()}`;
  const relRes = await fetch(`https://firebaserules.googleapis.com/v1/${relName}`, {
    method: "PATCH",
    headers: H,
    body: JSON.stringify({ release: { name: relName, rulesetName: created.name } }),
  });
  const rel = await relRes.json();
  if (!relRes.ok) {
    console.error(`[${t}] release 갱신 실패`, relRes.status, JSON.stringify(rel));
    process.exit(1);
  }
  console.log(`[${t}] 배포 완료 -> ruleset ${created.name.split("/").pop()}`);
}

console.log("done");
