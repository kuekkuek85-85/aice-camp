import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";

const STUDENT_ID_RE = /^\d{5}$/;

const normalize = (s: string) => s.replace(/\s+/g, "");

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

  const grade = Number(studentId[0]);
  if (grade < 1 || grade > 3) {
    return NextResponse.json(
      { error: "학번 첫 자리는 학년(1~3)이어야 해요. 학번을 다시 확인해주세요." },
      { status: 400 }
    );
  }

  try {
    const db = adminDb();

    // 명단 대조: 학년 + 이름으로 찾는다 (사전에 정확한 학번을 몰라도 등록 가능하도록).
    const rosterSnap = await db.collection("roster").where("grade", "==", grade).get();
    const matched = rosterSnap.docs.find(
      (d) => normalize((d.data().name as string) ?? "") === normalize(name)
    );

    if (!matched) {
      return NextResponse.json(
        { error: `명단에서 ${grade}학년 "${name}" 학생을 찾을 수 없습니다. 학번(학년)과 이름을 다시 확인해주세요.` },
        { status: 404 }
      );
    }

    const entry = matched.data() as { name: string; grade: number; hasLevel2?: boolean; studentId?: string };

    // 이미 다른 학번으로 입장한 이름이면 차단 (오입력·도용 방지)
    if (entry.studentId && entry.studentId !== studentId) {
      const masked = `${entry.studentId.slice(0, 2)}***`;
      return NextResponse.json(
        { error: `"${entry.name}" 학생은 이미 학번 ${masked} 으로 입장했어요. 처음 입력했던 학번을 사용하거나, 잘못 입력했다면 선생님께 말씀해주세요.` },
        { status: 409 }
      );
    }

    const now = Date.now();

    // 첫 로그인: 이 학번을 명단에 바인딩
    if (!entry.studentId) {
      await matched.ref.set({ studentId, boundAt: now }, { merge: true });
    }

    const studentRef = db.doc(`students/${studentId}`);
    const studentSnap = await studentRef.get();
    await studentRef.set(
      {
        studentId,
        name: entry.name,
        grade: entry.grade,
        firstLoginAt: studentSnap.exists ? studentSnap.data()?.firstLoginAt ?? now : now,
        lastSeenAt: now,
      },
      { merge: true }
    );

    const token = await adminAuth().createCustomToken(studentId, {
      role: "student",
      grade: entry.grade,
    });

    return NextResponse.json({
      token,
      name: entry.name,
      grade: entry.grade,
      hasLevel2: entry.hasLevel2 ?? false,
    });
  } catch (e) {
    console.error("student-login error:", e);
    return NextResponse.json(
      { error: "서버 오류로 로그인에 실패했습니다. 잠시 후 다시 시도해주세요." },
      { status: 500 }
    );
  }
}
