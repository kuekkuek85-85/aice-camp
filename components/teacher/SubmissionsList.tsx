"use client";

import type { ProgressDoc, RosterEntry } from "@/lib/types";
import { maskName } from "@/lib/mask";

type Props = {
  roster: RosterEntry[];
  progress: ProgressDoc[];
  masking: boolean;
};

export function SubmissionsList({ roster, progress, masking }: Props) {
  const nameOf = (studentId: string) => roster.find((r) => r.studentId === studentId)?.name ?? studentId;

  const items = progress
    .flatMap((p) =>
      Object.entries(p.steps ?? {})
        .filter(([, step]) => step.submission)
        .map(([stepId, step]) => ({
          studentId: p.studentId,
          dayId: p.dayId,
          stepId,
          submission: step.submission!,
        }))
    )
    .sort((a, b) => b.submission.submittedAt - a.submission.submittedAt);

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4">
      <h2 className="text-sm font-bold text-slate-700">제출물 ({items.length})</h2>
      <div className="mt-2 max-h-96 space-y-1 overflow-y-auto">
        {items.length === 0 && <p className="text-sm text-slate-400">아직 제출물이 없어요.</p>}
        {items.map((item, i) => (
          <div
            key={i}
            className="flex items-center justify-between rounded-lg px-3 py-2 text-sm odd:bg-slate-50"
          >
            <span>
              <span className="font-medium">{maskName(nameOf(item.studentId), masking)}</span>
              <span className="ml-2 text-xs text-slate-400">
                {item.dayId}일차 · {item.stepId}
              </span>
            </span>
            <a
              href={item.submission.url}
              target="_blank"
              rel="noreferrer"
              className="rounded-md bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 hover:bg-indigo-100"
            >
              {item.submission.type === "link" ? "링크 열기" : `${item.submission.fileName ?? "파일"} 열기`}
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}
