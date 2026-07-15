import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminStorage } from "@/lib/firebase/admin";

async function requireTeacher(req: NextRequest) {
  const authHeader = req.headers.get("authorization") ?? "";
  const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!idToken) return false;
  try {
    const decoded = await adminAuth().verifyIdToken(idToken);
    return decoded.teacher === true;
  } catch {
    return false;
  }
}

export async function GET(req: NextRequest) {
  const isTeacher = await requireTeacher(req);
  if (!isTeacher) {
    return NextResponse.json({ error: "교사 인증이 필요합니다." }, { status: 401 });
  }

  const fileName = req.nextUrl.searchParams.get("file");
  if (!fileName || fileName.includes("..") || fileName.includes("/")) {
    return NextResponse.json({ error: "잘못된 파일명입니다." }, { status: 400 });
  }

  try {
    const bucket = adminStorage().bucket();
    const file = bucket.file(`answers/${fileName}`);
    const [exists] = await file.exists();
    if (!exists) {
      return NextResponse.json({ error: "파일을 찾을 수 없습니다." }, { status: 404 });
    }

    const [buffer] = await file.download();
    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (e) {
    console.error("answer-download error:", e);
    return NextResponse.json(
      { error: "서버 오류로 다운로드에 실패했습니다." },
      { status: 500 }
    );
  }
}
