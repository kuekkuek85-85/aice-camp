import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";

const STUDENT_ID_RE = /^\d{5}$/;

export async function POST(req: NextRequest) {
  let body: { studentId?: string; name?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  const studentId = (body.studentId ?? "").trim();
  const name = (body.name ?? "").trim();

  if (!STUDENT_ID_RE.test(studentId)) {
    return NextResponse.json(
      { error: "학번은 5자리 숫자로 입력해주세요. (예: 10203)" },
      { status: 400 }
    );
  }
  if (!name) {
    return NextResponse.json({ error: "이름을 입력해주세요." }, { status: 400 });
  }

  try {
    const db = adminDb();
    const rosterSnap = await db.doc(`roster/${studentId}`).get();
    if (!rosterSnap.exists) {
      return NextResponse.json(
        { error: "명단에서 학번을 찾을 수 없습니다. 학번을 다시 확인해주세요." },
        { status: 404 }
      );
    }

    const roster = rosterSnap.data() as { name: string; grade: number; hasLevel2?: boolean };
    const normalize = (s: string) => s.replace(/\s+/g, "");
    if (normalize(roster.name) !== normalize(name)) {
      return NextResponse.json(
        { error: "이름이 명단과 일치하지 않습니다. 학번과 이름을 다시 확인해주세요." },
        { status: 400 }
      );
    }

    const now = Date.now();
    const studentRef = db.doc(`students/${studentId}`);
    const studentSnap = await studentRef.get();
    await studentRef.set(
      {
        studentId,
        name: roster.name,
        grade: roster.grade,
        firstLoginAt: studentSnap.exists ? studentSnap.data()?.firstLoginAt ?? now : now,
        lastSeenAt: now,
      },
      { merge: true }
    );

    const token = await adminAuth().createCustomToken(studentId, {
      role: "student",
      grade: roster.grade,
    });

    return NextResponse.json({
      token,
      name: roster.name,
      grade: roster.grade,
      hasLevel2: roster.hasLevel2 ?? false,
    });
  } catch (e) {
    console.error("student-login error:", e);
    return NextResponse.json(
      { error: "서버 오류로 로그인에 실패했습니다. 잠시 후 다시 시도해주세요." },
      { status: 500 }
    );
  }
}
