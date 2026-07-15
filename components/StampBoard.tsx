"use client";

import { dayIds } from "@/lib/firestore-paths";
import { useMyStamps } from "@/lib/hooks/useMyStamps";

export function StampBoard() {
  const stamps = useMyStamps();
  const count = dayIds.filter((d) => stamps[d]).length;

  return (
    <section className="rounded-xl border border-amber-200 bg-amber-50 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-amber-800">나의 스탬프판</h3>
        <span className="text-xs font-medium text-amber-700">{count} / {dayIds.length}</span>
      </div>
      <div className="mt-3 flex gap-3">
        {dayIds.map((dayId) => (
          <div
            key={dayId}
            className={`flex h-12 w-12 items-center justify-center rounded-full border-2 text-lg font-bold ${
              stamps[dayId]
                ? "border-amber-400 bg-amber-300 text-amber-900"
                : "border-dashed border-amber-300 bg-white text-amber-300"
            }`}
          >
            {stamps[dayId] ? "★" : dayId}
          </div>
        ))}
      </div>
    </section>
  );
}
