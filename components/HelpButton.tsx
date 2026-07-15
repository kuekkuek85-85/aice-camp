"use client";

import { useHelpFlag } from "@/lib/hooks/useHelpFlag";

export function HelpButton({ dayId, stepId }: { dayId: string; stepId: string }) {
  const { helpFlag, raiseHelp, clearHelp } = useHelpFlag(dayId, stepId);
  const active = helpFlag?.active && helpFlag.dayId === dayId && helpFlag.stepId === stepId;

  return active ? (
    <button
      onClick={clearHelp}
      className="animate-pulse rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-canvas shadow-lg"
    >
      🙋 선생님을 기다리는 중... (취소)
    </button>
  ) : (
    <button
      onClick={raiseHelp}
      className="rounded-full bg-magenta px-5 py-2.5 text-sm font-semibold text-canvas shadow-lg transition hover:opacity-80"
    >
      🙋 막혔어요
    </button>
  );
}
