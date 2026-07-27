"use client";

import { useState } from "react";
import type { DayDoc, GradeVerdict, ProgressDoc, RosterEntry, StepProgress, StudentDoc } from "@/lib/types";
import { maskName } from "@/lib/mask";
import { RUBRICS, rubricKey } from "@/lib/grading/rubrics";
import { FeedbackAvatar, type AvatarMood } from "@/components/FeedbackAvatar";

type Props = {
  roster: RosterEntry[];
  students: Record<string, StudentDoc>;
  progress: ProgressDoc[];
  day: DayDoc | null;
  masking: boolean;
  onlyAiceIncomplete: boolean;
  hideNotLoggedIn: boolean;
};

const AICE_SIGNUP_STEP_ID = "aice-signup";
const AICE_SIGNUP_DAY_ID = "1";

export function statusIcon(status: string | undefined) {
  if (status === "done") return "✅";
  if (status === "deferred") return "🕓";
  return "⬜";
}

function sortRoster(roster: RosterEntry[]) {
  return [...roster].sort((a, b) => a.grade - b.grade || a.name.localeCompare(b.name, "ko"));
}

export function StudentGrid({
  roster,
  students,
  progress,
  day,
  masking,
  onlyAiceIncomplete,
  hideNotLoggedIn,
}: Props) {
  const steps = day ? [...day.steps].sort((a, b) => a.order - b.order) : [];
  const [selected, setSelected] = useState<CellSelection | null>(null);

  const progressByStudent = new Map<string, ProgressDoc>();
  for (const p of progress) {
    if (day && p.dayId === day.dayId) progressByStudent.set(p.studentId, p);
  }

  const aiceProgressByStudent = new Map<string, ProgressDoc>();
  for (const p of progress) {
    if (p.dayId === AICE_SIGNUP_DAY_ID) aiceProgressByStudent.set(p.studentId, p);
  }

  const rows = sortRoster(roster).filter((r) => {
    const loggedIn = Boolean(r.studentId && students[r.studentId]);
    if (hideNotLoggedIn && !loggedIn) return false; // 미입장 학생 숨기기
    if (!onlyAiceIncomplete) return true;
    if (!r.studentId) return true; // 미입장 학생은 가입도 미완료
    const status = aiceProgressByStudent.get(r.studentId)?.steps?.[AICE_SIGNUP_STEP_ID]?.status;
    return status !== "done";
  });

  const hiddenCount = hideNotLoggedIn
    ? roster.filter((r) => !(r.studentId && students[r.studentId])).length
    : 0;

  return (
    <div className="space-y-2">
      {hiddenCount > 0 && (
        <p className="px-1 text-xs text-ink/60">
          미입장 학생 {hiddenCount}명이 숨겨져 있어요. (접속한 학생 {rows.length}명 표시)
        </p>
      )}
      <div className="overflow-x-auto rounded-3xl border border-hairline bg-canvas">
      <table className="w-full min-w-[600px] text-sm">
        <thead className="bg-surface-soft text-left font-mono text-[11px] uppercase tracking-widest text-ink">
          <tr>
            <th className="px-3 py-2">학년</th>
            <th className="px-3 py-2">이름</th>
            <th className="px-3 py-2">학번</th>
            <th className="px-3 py-2">접속</th>
            {steps.map((s) => (
              <th key={s.stepId} className="px-3 py-2 text-center" title={s.title}>
                {s.order}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const sid = r.studentId;
            const student = sid ? students[sid] : undefined;
            const prog = sid ? progressByStudent.get(sid) : undefined;
            return (
              <tr key={r.rosterId ?? `${r.grade}-${r.name}`} className="border-t border-hairline-soft">
                <td className="px-3 py-2 text-ink">{r.grade}학년</td>
                <td className="px-3 py-2 font-medium text-ink">
                  {maskName(r.name, masking)}
                  {student?.helpFlag?.active && <span className="ml-1">🙋</span>}
                </td>
                <td className="px-3 py-2 font-mono text-xs text-ink">{sid ?? "—"}</td>
                <td className="px-3 py-2 text-xs">
                  {student ? (
                    <span className="font-medium text-success">접속함</span>
                  ) : (
                    <span className="text-ink/30">미입장</span>
                  )}
                </td>
                {steps.map((s) => (
                  <td key={s.stepId} className="px-1 py-1 text-center">
                    <button
                      onClick={() =>
                        setSelected({
                          name: r.name,
                          stepId: s.stepId,
                          stepOrder: s.order,
                          stepTitle: s.title,
                          submitType: s.submitType,
                          dayId: day?.dayId ?? "",
                          sp: prog?.steps?.[s.stepId],
                        })
                      }
                      title={`${s.order}. ${s.title} — 클릭해서 산출물·피드백 보기`}
                      className="rounded-md px-2 py-1 transition hover:bg-surface-soft"
                    >
                      {statusIcon(prog?.steps?.[s.stepId]?.status)}
                    </button>
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
      </div>

      {selected && (
        <SubmissionModal selection={selected} masking={masking} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}

export type CellSelection = {
  name: string;
  stepId: string;
  stepOrder: number;
  stepTitle: string;
  submitType: string;
  dayId: string;
  sp: StepProgress | undefined;
};

const VERDICT_MOOD: Record<GradeVerdict, AvatarMood> = {
  통과: "celebrate",
  부분통과: "happy",
  미흡: "cheer",
};
const VERDICT_BG: Record<GradeVerdict, string> = {
  통과: "bg-block-mint",
  부분통과: "bg-block-cream",
  미흡: "bg-block-pink",
};
const VERDICT_BADGE: Record<GradeVerdict, string> = {
  통과: "bg-ink text-canvas",
  부분통과: "bg-ink text-canvas",
  미흡: "bg-magenta text-canvas",
};

function statusLabel(status: string | undefined) {
  if (status === "done") return "완료";
  if (status === "deferred") return "나중에 완료 예정";
  return "아직 안 함";
}

export function SubmissionModal({
  selection,
  masking,
  onClose,
}: {
  selection: CellSelection;
  masking: boolean;
  onClose: () => void;
}) {
  const { name, stepId, stepOrder, stepTitle, submitType, dayId, sp } = selection;
  const submission = sp?.submission;
  const grade = sp?.grade;
  const noSubmitStep = submitType === "check" || submitType === "none"; // 산출물을 안 내는 단계
  const isGradeable = Boolean(RUBRICS[rubricKey(dayId, stepId)]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-3xl bg-canvas p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-widest text-ink/60">
              {dayId}일차 · {stepOrder}단계
            </p>
            <h3 className="mt-0.5 font-semibold tracking-tight text-ink">
              {maskName(name, masking)}
            </h3>
            <p className="text-sm text-ink">{stepTitle}</p>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 rounded-full border border-hairline bg-canvas px-2.5 py-1 text-sm text-ink hover:bg-surface-soft"
          >
            ✕
          </button>
        </div>

        <div className="mt-3 rounded-lg bg-surface-soft px-3 py-2 text-sm text-ink">
          상태: <span className="font-semibold">{statusLabel(sp?.status)}</span>
        </div>

        {/* 산출물 */}
        <div className="mt-3">
          <p className="font-mono text-[11px] uppercase tracking-widest text-ink/60">산출물</p>
          {submission ? (
            <div className="mt-1 flex flex-wrap items-center gap-2 rounded-lg border border-hairline px-3 py-2 text-sm text-ink">
              <span>
                {submission.type === "link" ? "🔗 링크 제출" : `📎 ${submission.fileName ?? "파일"}`}
                <span className="ml-2 text-xs text-ink/60">
                  {new Date(submission.submittedAt).toLocaleString("ko-KR")}
                </span>
              </span>
              <a
                href={submission.url}
                target="_blank"
                rel="noreferrer"
                className="ml-auto rounded-full bg-ink px-3 py-1 text-xs font-semibold text-canvas hover:opacity-80"
              >
                {submission.type === "link" ? "링크 열기" : "파일 열기"}
              </a>
            </div>
          ) : (
            <p className="mt-1 rounded-lg bg-surface-soft px-3 py-2 text-sm text-ink/60">
              {noSubmitStep
                ? "이 단계는 산출물을 제출하지 않는 '완료 확인' 단계예요."
                : "아직 제출한 산출물이 없어요. (파일 없이 완료했거나 미제출)"}
            </p>
          )}
        </div>

        {/* AI 피드백 */}
        <div className="mt-3">
          <p className="font-mono text-[11px] uppercase tracking-widest text-ink/60">AI 코치 피드백</p>
          {grade ? (
            <div className="mt-1 flex items-start gap-2">
              <div
                className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full ${VERDICT_BG[grade.verdict]}`}
              >
                <FeedbackAvatar mood={VERDICT_MOOD[grade.verdict]} className="h-[52px] w-[52px]" />
              </div>
              <div className={`relative flex-1 rounded-2xl ${VERDICT_BG[grade.verdict]} p-3`}>
                <div className={`absolute -left-1.5 top-5 h-3 w-3 rotate-45 ${VERDICT_BG[grade.verdict]}`} aria-hidden />
                <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${VERDICT_BADGE[grade.verdict]}`}>
                  AI 코치 · {grade.verdict}
                </span>
                <p className="mt-2 text-sm leading-relaxed text-ink">{grade.feedback}</p>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-ink/50">
                  {new Date(grade.gradedAt).toLocaleString("ko-KR")}
                </p>
              </div>
            </div>
          ) : (
            <p className="mt-1 rounded-lg bg-surface-soft px-3 py-2 text-sm text-ink/60">
              {!isGradeable
                ? "이 단계는 AI 자동 채점 대상이 아니에요."
                : submission
                  ? "아직 채점 결과가 없어요. (채점 전이거나 실패 — 학생 화면에서 다시 채점할 수 있어요)"
                  : "산출물이 없어 채점 결과도 없어요."}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export function CompletionBars({
  roster,
  progress,
  day,
}: Omit<Props, "students" | "masking" | "onlyAiceIncomplete" | "hideNotLoggedIn">) {
  if (!day) return null;
  const steps = [...day.steps].sort((a, b) => a.order - b.order);
  const total = roster.length || 1;

  return (
    <div className="space-y-2 rounded-3xl border border-hairline bg-canvas p-4">
      <h2 className="font-mono text-[11px] uppercase tracking-widest text-ink">단계별 완료율</h2>
      {steps.map((s) => {
        const done = progress.filter(
          (p) => p.dayId === day.dayId && p.steps?.[s.stepId]?.status === "done"
        ).length;
        const pct = Math.round((done / total) * 100);
        return (
          <div key={s.stepId}>
            <div className="flex justify-between text-xs text-ink">
              <span>{s.order}. {s.title}</span>
              <span>{done}/{roster.length} ({pct}%)</span>
            </div>
            <div className="mt-1 h-2 rounded-full bg-hairline-soft">
              <div className="h-2 rounded-full bg-ink" style={{ width: `${pct}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
