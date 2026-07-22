"use client";

import type { DayDoc, ProgressDoc, RosterEntry, StudentDoc } from "@/lib/types";
import { maskName } from "@/lib/mask";

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

function statusIcon(status: string | undefined) {
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
                  <td key={s.stepId} className="px-3 py-2 text-center" title={s.title}>
                    {statusIcon(prog?.steps?.[s.stepId]?.status)}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
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
