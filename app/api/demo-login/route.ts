import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { adminDb } from "@/lib/firebase/admin";
import { createCustomToken } from "@/lib/firebase/admin-token";
import { getWorkshopSettings, isDemoUid, normalizeCode } from "@/lib/workshop";

// 교사 연수(시연) 트랙 로그인 — 명단 대조 없이 '연수 코드 + 닉네임'으로 입장한다.
// 실명·소속 등 개인정보는 받지 않는다. 학생 트랙과 완전히 분리되며(uid 접두어 demo-),
// 발급 토큰에 role="demo" 클레임을 넣는다. 교사가 대시보드에서 연수를 열어 둔 동안만 입장 가능.

const MAX_NICKNAME = 20;

export async function POST(req: NextRequest) {
  let body: { code?: string; nickname?: string; uid?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  const code = normalizeCode(body.code ?? "");
  const nickname = (body.nickname ?? "").replace(/\s+/g, " ").trim();

  if (!code) return NextResponse.json({ error: "연수 코드를 입력해주세요." }, { status: 400 });
  if (!nickname) return NextResponse.json({ error: "닉네임을 입력해주세요." }, { status: 400 });
  if (nickname.length > MAX_NICKNAME) {
    return NextResponse.json({ error: `닉네임은 ${MAX_NICKNAME}자 이내로 입력해주세요.` }, { status: 400 });
  }

  try {
    const settings = await getWorkshopSettings(true);
    if (!settings.enabled) {
      return NextResponse.json({ error: "지금은 연수 입장이 열려 있지 않아요." }, { status: 403 });
    }
    if (code !== settings.code) {
      return NextResponse.json({ error: "연수 코드가 맞지 않아요. 다시 확인해주세요." }, { status: 403 });
    }

    const db = adminDb();
    const now = Date.now();

    // 재접속(새로고침 등) 때는 기존 uid 를 이어 쓴다. 같은 닉네임을 고른 다른 참가자와는
    // 섞이지 않도록 uid 는 닉네임이 아니라 무작위로 만든다.
    let uid: string | null = null;
    let joinedAt = now;
    if (body.uid && isDemoUid(body.uid)) {
      const prev = await db.doc(`demoParticipants/${body.uid}`).get();
      if (prev.exists) {
        uid = body.uid;
        joinedAt = prev.data()?.joinedAt ?? now;
      }
    }
    if (!uid) uid = `demo-${randomBytes(8).toString("hex")}`;

    await db.doc(`demoParticipants/${uid}`).set({ uid, name: nickname, joinedAt, lastSeenAt: now });

    const token = createCustomToken(uid, { role: "demo" });
    return NextResponse.json({ token, studentId: uid, name: nickname });
  } catch (e) {
    console.error("demo-login error:", e);
    return NextResponse.json(
      { error: "서버 오류로 입장에 실패했습니다. 잠시 후 다시 시도해주세요." },
      { status: 500 }
    );
  }
}
