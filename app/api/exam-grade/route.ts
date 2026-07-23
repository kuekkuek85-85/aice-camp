import { NextRequest, NextResponse } from "next/server";
import { adminDb, adminStorage } from "@/lib/firebase/admin";
import { verifyIdToken } from "@/lib/firebase/admin-token";
import { EXAM_ANSWER_KEY } from "@/lib/exam/answer-key";
import { EXAMS } from "@/lib/exam/exams";
import { genToPseudo } from "@/lib/grading/gen-to-pseudo";
import { gradeExamGen } from "@/lib/grading/gemini";

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

  let body: { roundId?: string; no?: number; choiceIndex?: number; studentId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  const roundId = String(body.roundId ?? "").trim();
  const no = Number(body.no);
  const studentId = caller.teacher ? String(body.studentId ?? "").trim() : caller.uid;
  const exam = EXAMS[roundId];
  const question = exam?.questions.find((q) => q.no === no);
  if (!exam || !question || !studentId) {
    return NextResponse.json({ error: "잘못된 시험 문항입니다." }, { status: 400 });
  }

  const key = EXAM_ANSWER_KEY[roundId] ?? {};
  const docRef = adminDb().doc(`examResults/${studentId}_${roundId}`);
  const now = Date.now();

  try {
    if (question.type === "mcq") {
      const answer = key.mcq?.[no];
      if (answer === undefined) {
        return NextResponse.json({ error: "정답이 등록되지 않은 문항입니다." }, { status: 400 });
      }
      const choiceIndex = Number(body.choiceIndex);
      if (!Number.isInteger(choiceIndex)) {
        return NextResponse.json({ error: "보기를 선택해주세요." }, { status: 400 });
      }
      const correct = choiceIndex === answer;
      await docRef.set(
        { studentId, roundId, results: { [no]: { type: "mcq", correct, choiceIndex, gradedAt: now } } },
        { merge: true }
      );
      return NextResponse.json({ ok: true, correct });
    }

    // gen 문항 — 학생 제출본을 정답과 엄격 비교
    const answerFile = key.gen?.[no];
    if (!answerFile) {
      return NextResponse.json({ error: "아직 채점 준비 중인 문항이에요." }, { status: 400 });
    }
    const bucket = adminStorage().bucket();
    const [studentBuf] = await bucket
      .file(`examSubmissions/${studentId}/${roundId}/${no}.gen`)
      .download()
      .catch(() => [null] as unknown as [Buffer]);
    if (!studentBuf) {
      return NextResponse.json({ error: "제출한 .gen 파일을 찾을 수 없어요." }, { status: 404 });
    }
    const [answerBuf] = await bucket.file(`answers/${answerFile}`).download();

    let studentPseudo: string;
    let answerPseudo: string;
    try {
      studentPseudo = genToPseudo(studentBuf.toString("utf8"));
      answerPseudo = genToPseudo(answerBuf.toString("utf8"));
    } catch {
      return NextResponse.json(
        { error: ".gen 파일을 해석하지 못했어요." },
        { status: 422 }
      );
    }
    const result = await gradeExamGen(question.prompt, answerPseudo, studentPseudo);
    await docRef.set(
      {
        studentId,
        roundId,
        results: { [no]: { type: "gen", correct: result.correct, feedback: result.feedback, gradedAt: now } },
      },
      { merge: true }
    );
    return NextResponse.json({ ok: true, correct: result.correct, feedback: result.feedback });
  } catch (e) {
    console.error("exam-grade error:", e);
    return NextResponse.json({ error: "채점 중 문제가 생겼어요. 잠시 후 다시 시도해주세요." }, { status: 500 });
  }
}
