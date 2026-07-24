"use client";

import { useState } from "react";
import type { ExamResultDoc, ExamQuestionResult, RosterEntry } from "@/lib/types";
import { EXAMS, EXAM_ROUNDS, PASS_SCORE } from "@/lib/exam/exams";
import { scoreRound } from "@/lib/exam/scoring";
import { maskName } from "@/lib/mask";

type Props = {
  roster: RosterEntry[];
  examResults: ExamResultDoc[];
  masking: boolean;
};

function sortRoster(roster: RosterEntry[]) {
  return [...roster].sort((a, b) => a.grade - b.grade || a.name.localeCompare(b.name, "ko"));
}

// 한 문항 결과를 셀 표식으로: 맞음 ○ / 틀림 ✕ / 넘어감 – / 미제출 ·
function cell(r: ExamQuestionResult | undefined) {
  if (!r) return { mark: "·", cls: "text-ink/25", title: "미제출" };
  if (r.skipped) return { mark: "–", cls: "text-ink/40", title: "넘어감(0점)" };
  if (r.correct) return { mark: "○", cls: "text-success font-bold", title: "정답" };
  return { mark: "✕", cls: "text-magenta font-bold", title: "오답" };
}

export function ExamResults({ roster, examResults, masking }: Props) {
  const [roundId, setRoundId] = useState<string>(EXAM_ROUNDS[0]);
  const round = EXAMS[roundId];

  // studentId -> 이 회차 결과 맵
  const resultByStudent = new Map<string, Record<string, ExamQuestionResult>>();
  for (const doc of examResults) {
    if (doc.roundId === roundId) resultByStudent.set(doc.studentId, doc.results ?? {});
  }

  const questions = round ? round.questions.filter((q) => q.ready !== false) : [];

  const rows = sortRoster(roster).map((r) => {
    const results = r.studentId ? resultByStudent.get(r.studentId) : undefined;
    const score = round ? scoreRound(round, results) : null;
    return { roster: r, results, score };
  });

  // 회차 요약: 응시/합격/평균
  const attempted = rows.filter((row) => row.score?.attempted);
  const passedCount = rows.filter((row) => row.score?.passed).length;
  const avg =
    attempted.length > 0
      ? Math.round(attempted.reduce((n, row) => n + (row.score?.earned ?? 0), 0) / attempted.length)
      : 0;

  return (
    <section className="rounded-3xl border border-hairline bg-canvas p-4">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="font-mono text-[11px] uppercase tracking-widest text-ink">모의평가 결과</h2>
        <div className="flex gap-1.5">
          {EXAM_ROUNDS.map((r) => (
            <button
              key={r}
              onClick={() => setRoundId(r)}
              className={`rounded-full px-3 py-1 text-sm font-semibold transition ${
                roundId === r
                  ? "bg-ink text-canvas"
                  : "border border-hairline bg-canvas text-ink hover:bg-surface-soft"
              }`}
            >
              {r}회
            </button>
          ))}
        </div>
        {round && (
          <span className="ml-auto flex flex-wrap items-center gap-2 text-xs text-ink/70">
            <span className="rounded-full bg-surface-soft px-2 py-0.5 font-semibold">
              응시 {attempted.length}/{roster.length}
            </span>
            <span className="rounded-full bg-block-mint px-2 py-0.5 font-semibold text-ink">
              합격 {passedCount}
            </span>
            <span className="rounded-full bg-surface-soft px-2 py-0.5 font-semibold">
              응시자 평균 {avg}점
            </span>
          </span>
        )}
      </div>

      {!round ? (
        <p className="mt-3 text-sm text-ink">준비 중인 회차예요.</p>
      ) : (
        <>
          <p className="mt-2 text-xs text-ink/60">
            {PASS_SCORE}점 이상 합격 · ○ 정답 · ✕ 오답 · – 넘어감 · · 미제출 · 문항 번호를 누르면 배점을 볼 수 있어요.
          </p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-hairline text-ink/60">
                  <th className="px-2 py-2 text-left font-medium">학생</th>
                  {questions.map((q) => (
                    <th
                      key={q.no}
                      className="px-1 py-2 text-center font-medium"
                      title={`${q.no}번 · ${q.type === "mcq" ? "객관식" : "실습"} · ${q.points}점`}
                    >
                      {q.no}
                    </th>
                  ))}
                  <th className="px-2 py-2 text-right font-medium">총점</th>
                  <th className="px-2 py-2 text-center font-medium">상태</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(({ roster: r, results, score }) => {
                  const key = r.rosterId ?? r.studentId ?? r.name;
                  const status = !score?.attempted
                    ? { label: "미응시", cls: "bg-surface-soft text-ink/50" }
                    : score.passed
                      ? { label: "합격", cls: "bg-block-mint text-ink" }
                      : score.finished
                        ? { label: "불합격", cls: "bg-magenta text-canvas" }
                        : { label: "진행중", cls: "bg-block-cream text-ink" };
                  return (
                    <tr key={key} className="border-b border-hairline/60 last:border-0">
                      <td className="px-2 py-1.5 font-medium text-ink">
                        {maskName(r.name, masking)}
                        {!r.studentId && <span className="ml-1 text-[11px] text-ink/40">미입장</span>}
                      </td>
                      {questions.map((q) => {
                        const c = cell(results?.[String(q.no)]);
                        return (
                          <td key={q.no} className={`px-1 py-1.5 text-center ${c.cls}`} title={c.title}>
                            {c.mark}
                          </td>
                        );
                      })}
                      <td className="px-2 py-1.5 text-right font-semibold text-ink">
                        {score?.attempted ? `${score.earned}` : "–"}
                        <span className="text-ink/40">/100</span>
                      </td>
                      <td className="px-2 py-1.5 text-center">
                        <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${status.cls}`}>
                          {status.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}
