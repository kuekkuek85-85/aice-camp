"use client";

import { dayIds } from "@/lib/firestore-paths";
import { useMyStamps } from "@/lib/hooks/useMyStamps";

export function StampBoard() {
  const stamps = useMyStamps();
  const count = dayIds.filter((d) => stamps[d]).length;

  return (
    <section className="rounded-3xl bg-block-cream p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-ink">나의 스탬프판</h3>
        <span className="font-mono text-xs uppercase tracking-widest text-ink">
          {count} / {dayIds.length}
        </span>
      </div>
      <div className="mt-3 flex gap-3">
        {dayIds.map((dayId) => (
          <div
            key={dayId}
            className={`flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold ${
              stamps[dayId]
                ? "bg-ink text-canvas"
                : "border-2 border-dashed border-ink/30 bg-canvas text-ink/30"
            }`}
          >
            {stamps[dayId] ? "★" : dayId}
          </div>
        ))}
      </div>
    </section>
  );
}
