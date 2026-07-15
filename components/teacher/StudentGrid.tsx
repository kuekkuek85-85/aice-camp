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
};

const AICE_SIGNUP_STEP_ID = "aice-signup";
const AICE_SIGNUP_DAY_ID = "1";

function statusIcon(status: string | undefined) {
  if (status === "done") return "✅";
  if (status === "deferred") return "🕓";
  return "⬜";
}

export function StudentGrid({ roster, students, progress, day, masking, onlyAiceIncomplete }: Props) {
  const steps = day ? [...day.steps].sort((a, b) => a.order - b.order) : [];

  const progressByStudent = new Map<string, ProgressDoc>();
  for (const p of progress) {
    if (day && p.dayId === day.dayId) progressByStudent.set(p.studentId, p);
  }

  const aiceProgressByStudent = new Map<string, ProgressDoc>();
  for (const p of progress) {
    if (p.dayId === AICE_SIGNUP_DAY_ID) aiceProgressByStudent.set(p.studentId, p);
  }

  const rows = [...roster]
    .sort((a, b) => a.studentId.localeCompare(b.studentId))
    .filter((r) => {
      if (!onlyAiceIncomplete) return true;
      const status = aiceProgressByStudent.get(r.studentId)?.steps?.[AICE_SIGNUP_STEP_ID]?.status;
      return status !== "done";
    });

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table className="w-full min-w-[600px] text-sm">
        <thead className="bg-slate-50 text-left text-xs text-slate-500">
          <tr>
            <th className="px-3 py-2">학번</th>
            <th className="px-3 py-2">이름</th>
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
            const student = students[r.studentId];
            const prog = progressByStudent.get(r.studentId);
            return (
              <tr key={r.studentId} className="border-t border-slate-100">
                <td className="px-3 py-2 text-slate-500">{r.studentId}</td>
                <td className="px-3 py-2 font-medium text-slate-800">
                  {maskName(r.name, masking)}
                  {student?.helpFlag?.active && <span className="ml-1">🙋</span>}
                </td>
                <td className="px-3 py-2 text-xs">
                  {student ? (
                    <span className="text-emerald-600">접속함</span>
                  ) : (
                    <span className="text-slate-300">미접속</span>
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
  );
}

export function CompletionBars({ roster, progress, day }: Omit<Props, "students" | "masking" | "onlyAiceIncomplete">) {
  if (!day) return null;
  const steps = [...day.steps].sort((a, b) => a.order - b.order);
  const total = roster.length || 1;

  return (
    <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-4">
      <h2 className="text-sm font-bold text-slate-700">단계별 완료율</h2>
      {steps.map((s) => {
        const done = progress.filter(
          (p) => p.dayId === day.dayId && p.steps?.[s.stepId]?.status === "done"
        ).length;
        const pct = Math.round((done / total) * 100);
        return (
          <div key={s.stepId}>
            <div className="flex justify-between text-xs text-slate-500">
              <span>{s.order}. {s.title}</span>
              <span>{done}/{roster.length} ({pct}%)</span>
            </div>
            <div className="mt-1 h-2 rounded-full bg-slate-100">
              <div className="h-2 rounded-full bg-indigo-500" style={{ width: `${pct}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
