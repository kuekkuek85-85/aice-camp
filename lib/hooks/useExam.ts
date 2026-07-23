"use client";

import { useCallback, useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { ref, uploadBytes } from "firebase/storage";
import { getFirebaseAuth, getFirebaseDb, getFirebaseStorage } from "@/lib/firebase/client";
import { useStudentSession } from "@/lib/hooks/useStudentSession";
import { EXAMS } from "@/lib/exam/exams";
import type { ExamResultDoc } from "@/lib/types";

const MAX_FILE_BYTES = 5 * 1024 * 1024;

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

  // 실습(gen) 문항 — 학생 .gen 업로드 후 서버에 엄격 채점 요청
  const uploadAndGrade = useCallback(
    async (no: number, file: File) => {
      setError(null);
      if (!session) return;
      if (!file.name.toLowerCase().endsWith(".gen")) {
        setError(".gen 확장자 파일만 제출할 수 있어요.");
        return;
      }
      if (file.size > MAX_FILE_BYTES) {
        setError("파일 크기는 5MB를 넘을 수 없어요.");
        return;
      }
      setBusyNo(no);
      try {
        const path = `examSubmissions/${session.studentId}/${roundId}/${no}.gen`;
        await uploadBytes(ref(getFirebaseStorage(), path), file);
        const idToken = await getFirebaseAuth().currentUser?.getIdToken();
        if (!idToken) throw new Error("로그인이 필요해요.");
        const res = await fetch("/api/exam-grade", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
          body: JSON.stringify({ roundId, no }),
        });
        if (!res.ok) {
          const d = await res.json().catch(() => ({}));
          throw new Error(d.error ?? "채점에 실패했어요.");
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "제출/채점에 실패했어요.");
      } finally {
        setBusyNo(null);
      }
    },
    [roundId, session]
  );

  return { session, exam, results, busyNo, error, submitMcq, uploadAndGrade };
}
