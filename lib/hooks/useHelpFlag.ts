"use client";

import { useEffect, useState } from "react";
import { doc, onSnapshot, setDoc, updateDoc } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase/client";
import { useStudentSession } from "@/lib/hooks/useStudentSession";
import type { HelpFlag } from "@/lib/types";

export function useHelpFlag(dayId: string, stepId: string) {
  const { session } = useStudentSession();
  const [helpFlag, setHelpFlag] = useState<HelpFlag | null>(null);

  useEffect(() => {
    if (!session) return;
    return onSnapshot(doc(getFirebaseDb(), "students", session.studentId), (snap) => {
      setHelpFlag((snap.data()?.helpFlag as HelpFlag) ?? null);
    });
  }, [session]);

  async function raiseHelp() {
    // 시연 교사(demo)는 students 문서가 없고 학생 현황판에도 섞이지 않으므로 건너뛴다.
    if (!session || session.role === "demo") return;
    const db = getFirebaseDb();
    const flag = { active: true, at: Date.now(), dayId, stepId };
    await Promise.all([
      updateDoc(doc(db, "students", session.studentId), { helpFlag: flag }),
      setDoc(doc(db, "publicProgress", session.studentId), { helpFlag: flag }, { merge: true }),
    ]);
  }

  async function clearHelp() {
    if (!session || session.role === "demo") return;
    const db = getFirebaseDb();
    const flag = { active: false };
    await Promise.all([
      updateDoc(doc(db, "students", session.studentId), { helpFlag: flag }),
      setDoc(doc(db, "publicProgress", session.studentId), { helpFlag: flag }, { merge: true }),
    ]);
  }

  return { helpFlag, raiseHelp, clearHelp };
}
