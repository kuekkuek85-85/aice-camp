// 주의: firebase-admin/auth 는 import 하지 말 것 — jose(ESM 전용) 의존성 때문에
// 일부 서버리스 런타임에서 로드가 실패한다. 토큰 처리는 lib/firebase/admin-token.ts 사용.
import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

function getAdminApp(): App {
  if (getApps().length) return getApps()[0];

  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  // 붙여넣기 시 값 양끝에 큰따옴표가 함께 들어간 경우까지 흡수한다.
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/^"|"$/g, "").replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "FIREBASE_ADMIN_PROJECT_ID / FIREBASE_ADMIN_CLIENT_EMAIL / FIREBASE_ADMIN_PRIVATE_KEY 환경변수가 필요합니다."
    );
  }

  return initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });
}

export function adminDb() {
  return getFirestore(getAdminApp());
}

export function adminStorage() {
  return getStorage(getAdminApp());
}
