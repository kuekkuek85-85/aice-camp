"use client";

import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase/client";
import { dayIds, progressDocId } from "@/lib/firestore-paths";
import { useStudentSession } from "@/lib/hooks/useStudentSession";

/** 학생별 일차 스탬프 획득 여부 (홈 화면 5칸 스탬프판용) */
export function useMyStamps() {
  const { session } = useStudentSession();
  const [stamps, setStamps] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!session) return;
    const db = getFirebaseDb();
    const unsubs = dayIds.map((dayId) =>
      onSnapshot(
        doc(db, "progress", progressDocId(session.studentId, dayId)),
        (snap) => {
          setStamps((prev) => ({ ...prev, [dayId]: Boolean(snap.data()?.dayStampAt) }));
        },
        (err) => console.error("stamps 구독 오류:", err)
      )
    );
    return () => unsubs.forEach((u) => u());
  }, [session]);

  return stamps;
}
