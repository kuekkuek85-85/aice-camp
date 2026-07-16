"use client";

import { useState } from "react";
import { doc, setDoc } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase/client";
import { useConfig } from "@/lib/hooks/useConfig";
import { dayIds } from "@/lib/firestore-paths";

/** 학생 화면의 "오늘 일차"를 전환한다. 이 값보다 뒤의 일차는 학생에게 잠긴다. */
export function CurrentDayControl() {
  const { config } = useConfig();
  const [busy, setBusy] = useState(false);

  async function setCurrentDay(n: number) {
    setBusy(true);
    try {
      await setDoc(doc(getFirebaseDb(), "config", "global"), { currentDay: n }, { merge: true });
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-3xl bg-block-lime p-4">
      <div className="flex flex-wrap items-center gap-3">
        <div>
          <h2 className="font-mono text-[11px] uppercase tracking-widest text-ink">
            학생 화면 오늘 일차
          </h2>
          <p className="mt-0.5 text-xs text-ink">
            학생들에게는 이 일차까지만 열려요. 지난 일차는 열람 가능, 뒤 일차는 잠김.
          </p>
        </div>
        <div className="ml-auto flex gap-2">
          {dayIds.map((d) => {
            const n = Number(d);
            const active = config.currentDay === n;
            return (
              <button
                key={d}
                onClick={() => setCurrentDay(n)}
                disabled={busy || active}
                className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                  active
                    ? "bg-ink text-canvas"
                    : "bg-canvas text-ink hover:opacity-80 disabled:opacity-50"
                }`}
              >
                {d}일차
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
