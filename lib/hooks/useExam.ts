"use client";

import { useCallback, useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { getFirebaseAuth, getFirebaseDb } from "@/lib/firebase/client";
import { useStudentSession } from "@/lib/hooks/useStudentSession";
import { EXAMS } from "@/lib/exam/exams";
import type { ExamResultDoc } from "@/lib/types";

export function useExam(roundId: string) {
  const { session } = useStudentSession();
  const exam = EXAMS[roundId] ?? null;
  const [results, setResults] = useState<ExamResultDoc["results"]>({});
  const [busyNo, setBusyNo] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session) return;
    return onSnapshot(
      doc(getFirebaseDb(), "examResults", `${session.studentId}_${roundId}`),
      (snap) => setResults(snap.exists() ? ((snap.data() as ExamResultDoc).results ?? {}) : {}),
      (err) => console.error("examResults 구독 오류:", err)
    );
  }, [session, roundId]);

  const submitMcq = useCallback(
    async (no: number, choiceIndex: number) => {
      setError(null);
      setBusyNo(no);
      try {
        const idToken = await getFirebaseAuth().currentUser?.getIdToken();
        if (!idToken) throw new Error("로그인이 필요해요.");
        const res = await fetch("/api/exam-grade", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
          body: JSON.stringify({ roundId, no, choiceIndex }),
        });
        if (!res.ok) {
          const d = await res.json().catch(() => ({}));
          throw new Error(d.error ?? "채점에 실패했어요.");
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "채점에 실패했어요.");
      } finally {
        setBusyNo(null);
      }
    },
    [roundId]
  );

  return { session, exam, results, busyNo, error, submitMcq };
}
