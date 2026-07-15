"use client";

import { useHelpFlag } from "@/lib/hooks/useHelpFlag";

export function HelpButton({ dayId, stepId }: { dayId: string; stepId: string }) {
  const { helpFlag, raiseHelp, clearHelp } = useHelpFlag(dayId, stepId);
  const active = helpFlag?.active && helpFlag.dayId === dayId && helpFlag.stepId === stepId;

  return active ? (
    <button
      onClick={clearHelp}
      className="rounded-full bg-red-500 px-4 py-2 text-sm font-semibold text-white shadow-sm animate-pulse"
    >
      🙋 선생님을 기다리는 중... (취소)
    </button>
  ) : (
    <button
      onClick={raiseHelp}
      className="rounded-full border border-red-300 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-100"
    >
      🙋 막혔어요
    </button>
  );
}
