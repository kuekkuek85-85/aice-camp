"use client";

import { useState } from "react";
import type { DayDoc, DemoParticipant, ProgressDoc } from "@/lib/types";
import { statusIcon, SubmissionModal, type CellSelection } from "@/components/teacher/StudentGrid";

const ONLINE_WINDOW_MS = 15 * 60 * 1000;

type Props = {
  participants: DemoParticipant[];
  progress: ProgressDoc[];
  day: DayDoc | null;
  masking: boolean;
  now: number;
};

// 시연 교사(명단 밖 사용자)의 일차 활동 결과를 학생 그리드와 동일한 방식으로 보여준다.
// 제출물·AI 피드백은 StudentGrid 의 SubmissionModal 을 그대로 재사용한다.
export function DemoActivity({ participants, progress, day, masking, now }: Props) {
  const [selected, setSelected] = useState<CellSelection | null>(null);
  const steps = day ? [...day.steps].sort((a, b) => a.order - b.order) : [];

  // uid -> 선택 일차의 progress
  const progByUid = new Map<string, ProgressDoc>();
  for (const p of progress) {
    if (day && p.dayId === day.dayId) progByUid.set(p.studentId, p);
  }

  const rows = [...participants].sort((a, b) => (b.joinedAt ?? 0) - (a.joinedAt ?? 0));

  if (rows.length === 0) {
    return (
      <section className="rounded-3xl border border-hairline bg-canvas p-4">
        <h2 className="font-mono text-[11px] uppercase tracking-widest text-ink">시연 참가자 활동</h2>
        <p className="mt-2 text-sm text-ink">
          아직 입장한 선생님이 없어요. 입장하면 학생과 동일하게 단계별 진행·제출물·AI 피드백이 여기에 표시돼요.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-2 rounded-3xl border border-hairline bg-canvas p-4">
      <h2 className="font-mono text-[11px] uppercase tracking-widest text-ink">
        시연 참가자 활동 · {day?.dayId ?? "-"}일차
      </h2>
      <p className="text-xs text-ink/60">
        칸을 누르면 그 단계의 산출물과 AI 코치 피드백을 볼 수 있어요. ✅ 완료 · 🕓 나중에 · ⬜ 아직
      </p>

      <div className="overflow-x-auto rounded-2xl border border-hairline">
        <table className="w-full min-w-[600px] text-sm">
          <thead className="bg-surface-soft text-left font-mono text-[11px] uppercase tracking-widest text-ink">
            <tr>
              <th className="px-3 py-2">성함</th>
              <th className="px-3 py-2">소속 학교</th>
              <th className="px-3 py-2">접속</th>
              {steps.map((s) => (
                <th key={s.stepId} className="px-3 py-2 text-center" title={s.title}>
                  {s.order}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => {
              const prog = progByUid.get(p.uid);
              const online = now - (p.lastSeenAt ?? 0) < ONLINE_WINDOW_MS;
              return (
                <tr key={p.uid} className="border-t border-hairline-soft">
                  <td className="px-3 py-2 font-medium text-ink">{p.name}</td>
                  <td className="px-3 py-2 text-ink/70">{p.school}</td>
                  <td className="px-3 py-2 text-xs">
                    {online ? (
                      <span className="font-medium text-success">접속 중</span>
                    ) : (
                      <span className="text-ink/30">오프라인</span>
                    )}
                  </td>
                  {steps.map((s) => (
                    <td key={s.stepId} className="px-1 py-1 text-center">
                      <button
                        onClick={() =>
                          setSelected({
                            name: p.name,
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
    </section>
  );
}
