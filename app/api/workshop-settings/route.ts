import { NextRequest, NextResponse } from "next/server";
import { verifyIdToken } from "@/lib/firebase/admin-token";
import { getWorkshopSettings, normalizeCode, saveWorkshopSettings } from "@/lib/workshop";

// 교사 전용 — 연수 입장 스위치와 연수 코드 조회/변경
async function isTeacher(req: NextRequest) {
  const h = req.headers.get("authorization") ?? "";
  if (!h.startsWith("Bearer ")) return false;
  try {
    const { claims } = await verifyIdToken(h.slice(7));
    return claims.teacher === true;
  } catch {
    return false;
  }
}

export async function GET(req: NextRequest) {
  if (!(await isTeacher(req))) return NextResponse.json({ error: "교사만 볼 수 있어요." }, { status: 403 });
  return NextResponse.json(await getWorkshopSettings(true));
}

export async function POST(req: NextRequest) {
  if (!(await isTeacher(req))) return NextResponse.json({ error: "교사만 바꿀 수 있어요." }, { status: 403 });
  let body: { enabled?: boolean; code?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }
  const enabled = body.enabled === true;
  const code = normalizeCode(body.code ?? "");
  if (enabled && code.length < 4) {
    return NextResponse.json({ error: "연수를 열려면 4자 이상의 연수 코드가 필요해요." }, { status: 400 });
  }
  await saveWorkshopSettings({ enabled, code });
  return NextResponse.json({ enabled, code });
}
