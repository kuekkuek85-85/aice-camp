import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb, adminStorage } from "@/lib/firebase/admin";
import { verifyIdToken } from "@/lib/firebase/admin-token";

async function requireTeacher(req: NextRequest) {
  const authHeader = req.headers.get("authorization") ?? "";
  const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!idToken) return false;
  try {
    const decoded = await verifyIdToken(idToken);
    return decoded.claims.teacher === true;
  } catch {
    return false;
  }
}

/**
 * 학생 기록 전체 초기화 (교사 전용).
 * 삭제: students / progress / publicProgress 컬렉션, roster의 학번 바인딩, Storage 제출물.
 * 보존: roster 명단(이름·학년), days 콘텐츠, config, problems, materials.
 */
export async function POST(req: NextRequest) {
  const isTeacher = await requireTeacher(req);
  if (!isTeacher) {
    return NextResponse.json({ error: "교사 인증이 필요합니다." }, { status: 401 });
  }

  try {
    const db = adminDb();
    const result = { students: 0, progress: 0, publicProgress: 0, unbound: 0, submissionFiles: 0 };

    for (const col of ["students", "progress", "publicProgress"] as const) {
      const snap = await db.collection(col).get();
      for (const d of snap.docs) {
        await d.ref.delete();
        result[col] += 1;
      }
    }

    const roster = await db.collection("roster").get();
    for (const d of roster.docs) {
      if (d.data().studentId) {
        await d.ref.update({
          studentId: FieldValue.delete(),
          boundAt: FieldValue.delete(),
        });
        result.unbound += 1;
      }
    }

    const bucket = adminStorage().bucket();
    const [files] = await bucket.getFiles({ prefix: "submissions/" });
    for (const file of files) {
      await file.delete().catch(() => {});
      result.submissionFiles += 1;
    }

    return NextResponse.json({ ok: true, result });
  } catch (e) {
    console.error("reset-data error:", e);
    return NextResponse.json({ error: "초기화 중 오류가 발생했습니다." }, { status: 500 });
  }
}
