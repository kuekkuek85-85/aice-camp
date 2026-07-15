"use client";

import { useState } from "react";
import { useTeacherSession } from "@/lib/hooks/useTeacherSession";

export function DangerZone() {
  const { getIdToken } = useTeacherSession();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleReset() {
    const typed = window.prompt(
      "학생들의 접속·진행·제출 기록이 전부 삭제됩니다. (명단·수업 콘텐츠·자료는 유지)\n\n계속하려면 '초기화' 라고 입력하세요."
    );
    if (typed !== "초기화") {
      if (typed !== null) window.alert("'초기화' 라고 정확히 입력해야 진행됩니다.");
      return;
    }

    setBusy(true);
    setMessage(null);
    try {
      const idToken = await getIdToken();
      const res = await fetch("/api/reset-data", {
        method: "POST",
        headers: { Authorization: `Bearer ${idToken}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "초기화에 실패했습니다.");
      const r = data.result;
      setMessage(
        `✅ 초기화 완료 — 학생 ${r.students}건, 진행 ${r.progress}건, 현황판 ${r.publicProgress}건, 학번연결 해제 ${r.unbound}명, 제출파일 ${r.submissionFiles}개 삭제`
      );
    } catch (e) {
      setMessage(`❌ ${e instanceof Error ? e.message : "초기화에 실패했습니다."}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-xl border border-red-300 bg-red-50 p-4">
      <h2 className="text-sm font-bold text-red-800">⚠️ 데이터 초기화</h2>
      <p className="mt-1 text-xs text-red-600">
        학생 접속·진행·제출 기록과 업로드 파일을 전부 삭제하고 학번 연결을 초기화합니다.
        명단(이름·학년), 일차 콘텐츠, 이론 자료, 문제 파일은 유지됩니다. 되돌릴 수 없어요.
      </p>
      <button
        onClick={handleReset}
        disabled={busy}
        className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
      >
        {busy ? "초기화 중..." : "학생 기록 전체 초기화"}
      </button>
      {message && <p className="mt-2 text-xs font-medium text-red-800">{message}</p>}
    </section>
  );
}
