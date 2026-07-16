"use client";

import { useCallback, useEffect, useState } from "react";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getFirebaseDb, getFirebaseStorage } from "@/lib/firebase/client";
import { useStudentSession } from "@/lib/hooks/useStudentSession";
import { useDay } from "@/lib/hooks/useDay";
import { progressDocId } from "@/lib/firestore-paths";
import type { ProgressDoc, StepDef, StepProgress } from "@/lib/types";

const MAX_FILE_BYTES = 5 * 1024 * 1024;

function prerequisiteOrder(steps: StepDef[], index: number): number | null {
  if (index <= 0) return null;
  const prev = steps[index - 1];
  if (prev.parallel) return prerequisiteOrder(steps, index - 1);
  return prev.order;
}

export function isStepUnlocked(steps: StepDef[], index: number, progress: ProgressDoc | null) {
  const need = prerequisiteOrder(steps, index);
  if (need === null) return true;
  const prereqStep = steps.find((s) => s.order === need);
  if (!prereqStep) return true;
  const status = progress?.steps?.[prereqStep.stepId]?.status;
  return status === "done" || status === "deferred";
}

export function useDayProgress(dayId: string) {
  const { session } = useStudentSession();
  const { day, loading: dayLoading, notFound } = useDay(dayId);
  const [progress, setProgress] = useState<ProgressDoc | null>(null);
  const [uploading, setUploading] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!session) return;
    return onSnapshot(
      doc(getFirebaseDb(), "progress", progressDocId(session.studentId, dayId)),
      (snap) => {
        setProgress(snap.exists() ? (snap.data() as ProgressDoc) : null);
      },
      (err) => console.error("progress 구독 오류:", err)
    );
  }, [session, dayId]);

  const writePublicProgress = useCallback(
    async (nextProgress: Record<string, StepProgress>) => {
      if (!session || !day) return;
      const steps = [...day.steps].sort((a, b) => a.order - b.order);
      let current = steps[0];
      for (const step of steps) {
        const st = nextProgress[step.stepId]?.status;
        current = step;
        if (st !== "done" && st !== "deferred") break;
      }
      await setDoc(
        doc(getFirebaseDb(), "publicProgress", session.studentId),
        {
          studentId: session.studentId,
          name: session.name,
          grade: session.grade,
          currentDayId: dayId,
          currentStepOrder: current.order,
          currentStepTitle: current.title,
          updatedAt: Date.now(),
        },
        { merge: true }
      );
    },
    [session, day, dayId]
  );

  const patchStep = useCallback(
    async (stepId: string, patch: Partial<StepProgress>) => {
      if (!session) return;
      const ref_ = doc(getFirebaseDb(), "progress", progressDocId(session.studentId, dayId));
      // 주의: 점(.) 경로 키는 setDoc(merge)에서 통짜 필드명으로 저장되므로 반드시 중첩 객체로 쓴다.
      const data = {
        studentId: session.studentId,
        dayId,
        steps: { [stepId]: patch },
      };
      await setDoc(ref_, data, { merge: true });

      const merged: Record<string, StepProgress> = { ...(progress?.steps ?? {}) };
      merged[stepId] = { ...(merged[stepId] ?? { status: "todo" }), ...patch } as StepProgress;
      await writePublicProgress(merged);
    },
    [session, dayId, progress, writePublicProgress]
  );

  const markDone = useCallback(
    (stepId: string) => patchStep(stepId, { status: "done", completedAt: Date.now() }),
    [patchStep]
  );

  const markDeferred = useCallback(
    (stepId: string) => patchStep(stepId, { status: "deferred", completedAt: Date.now() }),
    [patchStep]
  );

  const submitLink = useCallback(
    async (stepId: string, url: string) => {
      setSubmitError(null);
      if (!/^https?:\/\//i.test(url.trim())) {
        setSubmitError("http:// 또는 https:// 로 시작하는 링크를 입력해주세요.");
        return false;
      }
      await patchStep(stepId, {
        status: "done",
        completedAt: Date.now(),
        submission: { type: "link", url: url.trim(), submittedAt: Date.now() },
      });
      return true;
    },
    [patchStep]
  );

  const submitFile = useCallback(
    async (stepId: string, file: File) => {
      setSubmitError(null);
      if (!session) return false;
      if (!file.name.toLowerCase().endsWith(".gen")) {
        setSubmitError(".gen 확장자 파일만 업로드할 수 있어요.");
        return false;
      }
      if (file.size > MAX_FILE_BYTES) {
        setSubmitError("파일 크기는 5MB를 넘을 수 없어요.");
        return false;
      }
      setUploading(stepId);
      try {
        const path = `submissions/${session.studentId}/${dayId}/${stepId}.gen`;
        const storageRef = ref(getFirebaseStorage(), path);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        await patchStep(stepId, {
          status: "done",
          completedAt: Date.now(),
          submission: { type: "file", url, fileName: file.name, submittedAt: Date.now() },
        });
        return true;
      } catch {
        setSubmitError("업로드에 실패했어요. 네트워크를 확인하고 다시 시도해주세요.");
        return false;
      } finally {
        setUploading(null);
      }
    },
    [session, dayId, patchStep]
  );

  const openHint = useCallback(
    async (stepId: string) => {
      const current = progress?.steps?.[stepId]?.hintOpened ?? 0;
      await patchStep(stepId, { hintOpened: current + 1 });
    },
    [progress, patchStep]
  );

  const stampIfComplete = useCallback(async () => {
    if (!session || !day || !progress) return;
    const allDone = day.steps.every((s) => {
      const st = progress.steps?.[s.stepId]?.status;
      return st === "done" || st === "deferred";
    });
    if (allDone && !progress.dayStampAt) {
      await setDoc(
        doc(getFirebaseDb(), "progress", progressDocId(session.studentId, dayId)),
        { dayStampAt: Date.now() },
        { merge: true }
      );
    }
  }, [session, day, progress, dayId]);

  useEffect(() => {
    stampIfComplete();
  }, [stampIfComplete]);

  // 자동 완료 단계(submitType: "none")는 방문 시 즉시 완료 처리
  useEffect(() => {
    if (!day || !session) return;
    day.steps.forEach((step) => {
      if (step.submitType === "none" && progress?.steps?.[step.stepId]?.status !== "done") {
        markDone(step.stepId);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [day, session, progress]);

  return {
    day,
    dayLoading,
    notFound,
    progress,
    uploading,
    submitError,
    markDone,
    markDeferred,
    submitLink,
    submitFile,
    openHint,
  };
}
