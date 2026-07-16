"use client";

import { useState } from "react";
import type { DayDoc, GradeVerdict, ProgressDoc, RosterEntry, StepGrade, Submission } from "@/lib/types";
import { maskName } from "@/lib/mask";

type Props = {
  roster: RosterEntry[];
  progress: ProgressDoc[];
  masking: boolean;
  day: DayDoc | null;
  dayId: string;
};

type Row = {
  studentId: string;
  submission: Submission;
  grade?: StepGrade;
};

type Group = {
  stepId: string;
  label: string;
  rows: Row[];
};

const VERDICT_BADGE: Record<GradeVerdict, string> = {
  통과: "bg-block-mint text-ink",
  부분통과: "bg-block-cream text-ink",
  미흡: "bg-magenta text-canvas",
};

export function SubmissionsList({ roster, progress, masking, day, dayId }: Props) {
  const [openStepId, setOpenStepId] = useState<string | null>(null);

  const nameOf = (studentId: string) =>
    roster.find((r) => r.studentId === studentId)?.name ?? studentId;

  // 선택한 일차의 제출물만 모아 stepId별로 묶는다
  const byStep = new Map<string, Row[]>();
  for (const p of progress) {
    if (p.dayId !== dayId) continue;
    for (const [stepId, step] of Object.entries(p.steps ?? {})) {
      if (!step.submission) continue;
      const rows = byStep.get(stepId) ?? [];
      rows.push({ studentId: p.studentId, submission: step.submission, grade: step.grade });
      byStep.set(stepId, rows);
    }
  }

  // 일차의 단계 순서를 따르고, 정의에 없는 stepId는 뒤에 붙인다
  const defSteps = day?.steps ?? [];
  const orderedStepIds = [
    ...defSteps.map((s) => s.stepId).filter((id) => byStep.has(id)),
    ...[...byStep.keys()].filter((id) => !defSteps.some((s) => s.stepId === id)),
  ];

  const groups: Group[] = orderedStepIds.map((stepId) => {
    const def = defSteps.find((s) => s.stepId === stepId);
    const label = def ? `${def.order}. ${def.title}` : stepId;
    const rows = (byStep.get(stepId) ?? []).sort(
      (a, b) => b.submission.submittedAt - a.submission.submittedAt
    );
    return { stepId, label, rows };
  });

  const total = groups.reduce((n, g) => n + g.rows.length, 0);

  return (
    <section className="rounded-3xl border border-hairline bg-canvas p-4">
      <h2 className="font-mono text-[11px] uppercase tracking-widest text-ink">
        제출물 · {dayId}일차 (총 {total})
      </h2>
      <p className="mt-1 text-xs text-ink/60">미션을 눌러 그 미션의 제출물과 AI 피드백을 펼쳐 보세요.</p>

      {groups.length === 0 && <p className="mt-2 text-sm text-ink">아직 제출물이 없어요.</p>}

      <div className="mt-3 space-y-2">
        {groups.map((g) => {
          const open = openStepId === g.stepId;
          const tally: Record<GradeVerdict, number> = { 통과: 0, 부분통과: 0, 미흡: 0 };
          let ungraded = 0;
          for (const r of g.rows) {
            if (r.grade) tally[r.grade.verdict]++;
            else ungraded++;
          }

          return (
            <div key={g.stepId} className="overflow-hidden rounded-2xl border border-hairline">
              <button
                onClick={() => setOpenStepId(open ? null : g.stepId)}
                className={`flex w-full items-center gap-2 px-4 py-3 text-left transition ${
                  open ? "bg-surface-soft" : "bg-canvas hover:bg-surface-soft"
                }`}
              >
                <span className="font-mono text-xs text-ink/60">{open ? "▾" : "▸"}</span>
                <span className="flex-1 text-sm font-semibold text-ink">{g.label}</span>
                <span className="flex flex-wrap items-center justify-end gap-1">
                  {(["통과", "부분통과", "미흡"] as GradeVerdict[])
                    .filter((v) => tally[v] > 0)
                    .map((v) => (
                      <span
                        key={v}
                        className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${VERDICT_BADGE[v]}`}
                      >
                        {v} {tally[v]}
                      </span>
                    ))}
                  {ungraded > 0 && (
                    <span className="rounded-full bg-surface-soft px-2 py-0.5 text-[11px] font-bold text-ink/60">
                      미채점 {ungraded}
                    </span>
                  )}
                </span>
                <span className="ml-1 shrink-0 rounded-full bg-ink px-2 py-0.5 text-[11px] font-bold text-canvas">
                  {g.rows.length}
                </span>
              </button>

              {open && (
                <div className="max-h-96 space-y-1 overflow-y-auto border-t border-hairline p-2">
                  {g.rows.map((item, i) => (
                    <div key={i} className="rounded-lg px-3 py-2 text-sm odd:bg-surface-soft">
                      <div className="flex items-center justify-between gap-2">
                        <span className="flex items-center gap-2">
                          <span className="font-medium text-ink">
                            {maskName(nameOf(item.studentId), masking)}
                          </span>
                          {item.grade ? (
                            <span
                              className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${VERDICT_BADGE[item.grade.verdict]}`}
                            >
                              {item.grade.verdict}
                            </span>
                          ) : (
                            <span className="rounded-full bg-surface-soft px-2 py-0.5 text-[11px] font-bold text-ink/60">
                              미채점
                            </span>
                          )}
                        </span>
                        <a
                          href={item.submission.url}
                          target="_blank"
                          rel="noreferrer"
                          className="shrink-0 rounded-full bg-ink px-3 py-1 text-xs font-semibold text-canvas hover:opacity-80"
                        >
                          {item.submission.type === "link"
                            ? "링크 열기"
                            : `${item.submission.fileName ?? "파일"} 열기`}
                        </a>
                      </div>
                      {item.grade && <p className="mt-1 text-xs text-ink">🤖 {item.grade.feedback}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
