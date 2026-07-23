"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { useStudentSession } from "@/lib/hooks/useStudentSession";
import { EXAMS, EXAM_ROUNDS } from "@/lib/exam/exams";

export default function ExamHub() {
  const router = useRouter();
  const { status } = useStudentSession();

  useEffect(() => {
    if (status === "guest") router.replace("/");
  }, [status, router]);

  if (status !== "ready") {
    return (
      <div className="flex flex-1 items-center justify-center font-mono text-xs uppercase tracking-widest text-ink">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-2xl flex-1 space-y-5 px-4 py-8">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-ink/60">5일차 · 모의평가</p>
            <h1 className="mt-1 text-3xl font-medium tracking-tight text-ink">모의평가 🚀</h1>
          </div>
          <Link href="/exam/guide" className="rounded-full border border-hairline bg-canvas px-3 py-1.5 text-sm font-medium text-ink hover:bg-surface-soft">
            시험 안내 보기
          </Link>
        </div>
        <p className="text-sm text-ink">회차를 골라 시작하세요. 한 회를 마치면 다음 회차도 풀 수 있어요.</p>

        <div className="space-y-3">
          {EXAM_ROUNDS.map((r, i) => {
            const exam = EXAMS[r];
            const open = Boolean(exam);
            return open ? (
              <Link
                key={r}
                href={`/exam/${r}`}
                className="flex items-center justify-between rounded-3xl border border-hairline bg-canvas p-5 transition hover:bg-surface-soft"
              >
                <div>
                  <p className="text-lg font-semibold text-ink">{i + 1}회 · {exam.title}</p>
                  <p className="mt-0.5 text-sm text-ink/70">8문제 · 100점 만점 · 60점 이상 합격</p>
                </div>
                <span className="rounded-full bg-ink px-4 py-1.5 text-sm font-semibold text-canvas">시작 →</span>
              </Link>
            ) : (
              <div key={r} className="flex items-center justify-between rounded-3xl border border-hairline bg-surface-soft p-5 opacity-60">
                <div>
                  <p className="text-lg font-semibold text-ink">{i + 1}회 모의평가</p>
                  <p className="mt-0.5 text-sm text-ink/70">준비 중이에요</p>
                </div>
                <span className="text-2xl">🔒</span>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
