import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/** 배포 진단용: 환경변수 존재 여부와 관리자 SDK 초기화 가능 여부만 보여준다(비밀값 미노출). */
export async function GET() {
  const envCheck = {
    NEXT_PUBLIC_FIREBASE_API_KEY: Boolean(process.env.NEXT_PUBLIC_FIREBASE_API_KEY),
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? null,
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? null,
    FIREBASE_ADMIN_PROJECT_ID: process.env.FIREBASE_ADMIN_PROJECT_ID ?? null,
    FIREBASE_ADMIN_CLIENT_EMAIL: Boolean(process.env.FIREBASE_ADMIN_CLIENT_EMAIL),
    FIREBASE_ADMIN_PRIVATE_KEY: Boolean(process.env.FIREBASE_ADMIN_PRIVATE_KEY),
    FIREBASE_ADMIN_PRIVATE_KEY_length: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.length ?? 0,
    FIREBASE_ADMIN_PRIVATE_KEY_startsOk:
      process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/^"/, "").startsWith("-----BEGIN") ?? false,
    TEACHER_PIN: Boolean(process.env.TEACHER_PIN),
  };

  let tokenSign = "not-tried";
  try {
    const { createCustomToken } = await import("@/lib/firebase/admin-token");
    createCustomToken("health-check");
    tokenSign = "ok";
  } catch (e) {
    tokenSign = `error: ${e instanceof Error ? e.message.slice(0, 200) : String(e)}`;
  }

  let firestore = "not-tried";
  try {
    const { adminDb } = await import("@/lib/firebase/admin");
    await adminDb().doc("config/global").get();
    firestore = "ok";
  } catch (e) {
    firestore = `error: ${e instanceof Error ? e.message.slice(0, 200) : String(e)}`;
  }

  return NextResponse.json({ env: envCheck, tokenSign, firestore });
}
