"use client";

import { useState } from "react";
import { useTeacherSession } from "@/lib/hooks/useTeacherSession";
import type { ProblemDoc } from "@/lib/types";

export function AnswerDownloads({ problems }: { problems: ProblemDoc[] }) {
  const { getIdToken } = useTeacherSession();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function download(problem: ProblemDoc) {
    setError(null);
    setBusy(problem.problemId);
    try {
      const idToken = await getIdToken();
      const res = await fetch(`/api/answer-download?file=${encodeURIComponent(problem.fileName)}`, {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "다운로드에 실패했어요.");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = problem.fileName;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "다운로드에 실패했어요.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4">
      <h2 className="text-sm font-bold text-slate-700">정답 .gen 다운로드 (교사 전용)</h2>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      <div className="mt-2 space-y-1">
        {problems.length === 0 && <p className="text-sm text-slate-400">등록된 문제가 없어요.</p>}
        {problems.map((p) => (
          <div key={p.problemId} className="flex items-center justify-between rounded-lg px-3 py-2 text-sm odd:bg-slate-50">
            <span>{p.title}</span>
            <button
              onClick={() => download(p)}
              disabled={busy === p.problemId}
              className="rounded-md bg-slate-900 px-3 py-1 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
            >
              {busy === p.problemId ? "다운로드 중..." : "정답 다운로드"}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
