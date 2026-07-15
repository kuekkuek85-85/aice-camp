"use client";

import { doc, updateDoc, setDoc } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase/client";
import type { StudentDoc } from "@/lib/types";
import { maskName } from "@/lib/mask";

type Props = {
  students: Record<string, StudentDoc>;
  masking: boolean;
};

export function HelpQueue({ students, masking }: Props) {
  const queue = Object.entries(students)
    .filter(([, s]) => s.helpFlag?.active)
    .sort((a, b) => (a[1].helpFlag?.at ?? 0) - (b[1].helpFlag?.at ?? 0));

  async function resolve(studentId: string) {
    const db = getFirebaseDb();
    const flag = { active: false };
    await Promise.all([
      updateDoc(doc(db, "students", studentId), { helpFlag: flag }),
      setDoc(doc(db, "publicProgress", studentId), { helpFlag: flag }, { merge: true }),
    ]);
  }

  return (
    <section className="rounded-3xl bg-block-pink p-4">
      <h2 className="text-sm font-semibold text-ink">🙋 막혔어요 큐 ({queue.length})</h2>
      {queue.length === 0 ? (
        <p className="mt-2 text-sm text-ink">현재 도움을 요청한 학생이 없어요.</p>
      ) : (
        <ul className="mt-2 space-y-2">
          {queue.map(([studentId, s]) => (
            <li
              key={studentId}
              className="flex items-center justify-between rounded-lg bg-canvas px-3 py-2 text-sm"
            >
              <span>
                <span className="font-semibold text-ink">{maskName(s.name, masking)}</span>
                <span className="ml-2 font-mono text-xs text-ink">
                  {s.helpFlag?.dayId}일차 · {s.helpFlag?.stepId}
                </span>
                {s.helpFlag?.at && (
                  <span className="ml-2 font-mono text-xs text-ink">
                    {new Date(s.helpFlag.at).toLocaleTimeString("ko-KR")}
                  </span>
                )}
              </span>
              <button
                onClick={() => resolve(studentId)}
                className="rounded-full bg-ink px-3 py-1 text-xs font-semibold text-canvas hover:opacity-80"
              >
                해결됨
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
