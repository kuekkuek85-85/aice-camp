import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase/admin";

export async function POST(req: NextRequest) {
  let body: { pin?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  const pin = (body.pin ?? "").trim();
  const teacherPin = process.env.TEACHER_PIN;

  if (!teacherPin) {
    return NextResponse.json(
      { error: "서버에 TEACHER_PIN이 설정되어 있지 않습니다." },
      { status: 500 }
    );
  }
  if (!pin || pin !== teacherPin) {
    return NextResponse.json({ error: "PIN이 올바르지 않습니다." }, { status: 401 });
  }

  try {
    const token = await adminAuth().createCustomToken("teacher", { teacher: true });
    return NextResponse.json({ token });
  } catch (e) {
    console.error("teacher-login error:", e);
    return NextResponse.json(
      { error: "서버 오류로 로그인에 실패했습니다. 잠시 후 다시 시도해주세요." },
      { status: 500 }
    );
  }
}
