import { NextRequest, NextResponse } from "next/server";
import { adminDb, adminStorage } from "@/lib/firebase/admin";
import { verifyIdToken } from "@/lib/firebase/admin-token";
import { genToPseudo } from "@/lib/grading/gen-to-pseudo";
import { RUBRICS, rubricKey } from "@/lib/grading/rubrics";
import { gradeWithGemini } from "@/lib/grading/gemini";
import { progressDocId } from "@/lib/firestore-paths";

export const maxDuration = 60;

async function getUid(req: NextRequest): Promise<{ uid: string; teacher: boolean } | null> {
  const authHeader = req.headers.get("authorization") ?? "";
  const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!idToken) return null;
  try {
    const decoded = await verifyIdToken(idToken);
    return { uid: decoded.uid, teacher: decoded.claims.teacher === true };
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  const caller = await getUid(req);
  if (!caller) return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });

  let body: { dayId?: string; stepId?: string; studentId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  const dayId = (body.dayId ?? "").trim();
  const stepId = (body.stepId ?? "").trim();
  // 학생은 본인만, 교사는 지정한 학생을 채점할 수 있다
  const studentId = caller.teacher ? (body.studentId ?? "").trim() : caller.uid;
  if (!dayId || !stepId || !studentId) {
    return NextResponse.json({ error: "dayId/stepId/studentId가 필요합니다." }, { status: 400 });
  }

  const rubric = RUBRICS[rubricKey(dayId, stepId)];
  if (!rubric) {
    return NextResponse.json({ error: "이 단계는 자동 채점 대상이 아니에요." }, { status: 400 });
  }

  try {
    const bucket = adminStorage().bucket();

    const [studentBuf] = await bucket
      .file(`submissions/${studentId}/${dayId}/${stepId}.gen`)
      .download()
      .catch(() => [null] as unknown as [Buffer]);
    if (!studentBuf) {
      return NextResponse.json({ error: "제출한 .gen 파일을 찾을 수 없어요." }, { status: 404 });
    }

    const [answerBuf] = await bucket.file(`answers/${rubric.answerFile}`).download();

    let studentPseudo: string;
    let answerPseudo: string;
    try {
      studentPseudo = genToPseudo(studentBuf.toString("utf8"));
      answerPseudo = genToPseudo(answerBuf.toString("utf8"));
    } catch {
      return NextResponse.json(
        { error: ".gen 파일을 해석하지 못했어요. 올바른 코디니 파일인지 확인해주세요." },
        { status: 422 }
      );
    }

    const result = await gradeWithGemini(rubric, answerPseudo, studentPseudo);

    // 결과를 서버(관리자)가 progress 문서에 기록 → 위변조 방지, 학생/교사 화면에 실시간 반영
    const now = Date.now();
    await adminDb()
      .doc(`progress/${progressDocId(studentId, dayId)}`)
      .set(
        {
          studentId,
          dayId,
          steps: {
            [stepId]: {
              grade: { verdict: result.verdict, feedback: result.feedback, gradedAt: now },
            },
          },
        },
        { merge: true }
      );

    return NextResponse.json({ ok: true, grade: { ...result, gradedAt: now } });
  } catch (e) {
    console.error("grade error:", e);
    return NextResponse.json(
      { error: "채점 중 문제가 생겼어요. 잠시 후 다시 시도해주세요." },
      { status: 500 }
    );
  }
}
