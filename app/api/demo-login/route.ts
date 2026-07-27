import { NextRequest, NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { adminDb } from "@/lib/firebase/admin";
import { createCustomToken } from "@/lib/firebase/admin-token";

// 교사 시연 트랙 로그인 — 명단 대조 없이 '소속 학교 + 성함'만으로 입장한다.
// 학생 트랙(/api/student-login)과 완전히 분리되며, 발급 토큰에 role="demo" 클레임을 넣는다.

const normalize = (s: string) => s.replace(/\s+/g, " ").trim();

// 같은 학교+성함이면 같은 세션으로 이어지도록 결정적(deterministic) uid 를 만든다.
function demoUid(school: string, name: string) {
  const h = createHash("sha256")
    .update(`${normalize(school)}|${normalize(name)}`)
    .digest("hex")
    .slice(0, 16);
  return `demo-${h}`;
}

export async function POST(req: NextRequest) {
  let body: { school?: string; name?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  const school = normalize(body.school ?? "");
  const name = normalize(body.name ?? "");

  if (!school) {
    return NextResponse.json({ error: "소속 학교를 입력해주세요." }, { status: 400 });
  }
  if (!name) {
    return NextResponse.json({ error: "성함을 입력해주세요." }, { status: 400 });
  }

  try {
    const uid = demoUid(school, name);
    const now = Date.now();

    // 시연 참가자 기록(관리자 SDK) — 대시보드에서 실시간으로 보이도록.
    const ref = adminDb().doc(`demoParticipants/${uid}`);
    const snap = await ref.get();
    await ref.set(
      {
        uid,
        school,
        name,
        joinedAt: snap.exists ? snap.data()?.joinedAt ?? now : now,
        lastSeenAt: now,
      },
      { merge: true }
    );

    const token = createCustomToken(uid, { role: "demo", school });

    return NextResponse.json({ token, studentId: uid, name, school });
  } catch (e) {
    console.error("demo-login error:", e);
    return NextResponse.json(
      { error: "서버 오류로 입장에 실패했습니다. 잠시 후 다시 시도해주세요." },
      { status: 500 }
    );
  }
}
