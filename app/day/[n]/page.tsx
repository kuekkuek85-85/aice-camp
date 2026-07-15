"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { HelpButton } from "@/components/HelpButton";
import { StepCard } from "@/components/StepCard";
import { useStudentSession } from "@/lib/hooks/useStudentSession";
import { useConfig } from "@/lib/hooks/useConfig";
import { useDayProgress, isStepUnlocked } from "@/lib/hooks/useDayProgress";

export default function DayPage({ params }: { params: Promise<{ n: string }> }) {
  const { n } = use(params);
  const router = useRouter();
  const { status, session } = useStudentSession();
  const { config } = useConfig();
  const {
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
  } = useDayProgress(n);

  useEffect(() => {
    if (status === "guest") router.replace("/");
  }, [status, router]);

  const steps = useMemo(() => (day ? [...day.steps].sort((a, b) => a.order - b.order) : []), [day]);

  const currentStepId = useMemo(() => {
    for (const step of steps) {
      const st = progress?.steps?.[step.stepId]?.status;
      if (st !== "done" && st !== "deferred") return step.stepId;
    }
    return steps.at(-1)?.stepId ?? "";
  }, [steps, progress]);

  if (status !== "ready" || !session) {
    return (
      <div className="flex flex-1 items-center justify-center font-mono text-xs uppercase tracking-widest text-ink">
        Loading...
      </div>
    );
  }

  const dayNum = Number(n);
  if (Number.isInteger(dayNum) && dayNum > config.currentDay) {
    return (
      <div className="flex flex-1 flex-col">
        <SiteHeader />
        <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center px-4 text-center">
          <span className="text-4xl">🔒</span>
          <h1 className="mt-3 text-xl font-semibold tracking-tight text-ink">아직 열리지 않은 일차예요</h1>
          <p className="mt-1 text-sm text-ink">오늘은 {config.currentDay}일차예요. 조금만 기다려주세요.</p>
        </main>
      </div>
    );
  }

  if (dayLoading) {
    return (
      <div className="flex flex-1 items-center justify-center font-mono text-xs uppercase tracking-widest text-ink">
        Loading...
      </div>
    );
  }

  if (notFound || !day) {
    return (
      <div className="flex flex-1 flex-col">
        <SiteHeader />
        <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center px-4 text-center">
          <span className="text-4xl">🚧</span>
          <h1 className="mt-3 text-xl font-semibold tracking-tight text-ink">아직 준비 중인 일차예요</h1>
          <p className="mt-1 text-sm text-ink">선생님이 콘텐츠를 곧 채워줄 거예요.</p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col pb-24">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 space-y-6 px-4 py-8">
        <div>
          <h1 className="text-3xl font-medium tracking-tight text-ink">{day.title}</h1>
          <p className="mt-2 text-base text-ink">{day.goal}</p>
        </div>

        {/* 오늘의 학습 순서 한눈에 보기 */}
        <div className="rounded-3xl bg-block-lilac p-5">
          <h2 className="font-mono text-xs uppercase tracking-widest text-ink">오늘의 학습 순서</h2>
          <ol className="mt-2 flex flex-wrap items-center gap-y-1 text-sm">
            {steps.map((step, i) => {
              const st = progress?.steps?.[step.stepId]?.status;
              const done = st === "done" || st === "deferred";
              const isCurrent = !done && step.stepId === currentStepId;
              return (
                <li key={step.stepId} className="flex items-center">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      done
                        ? "bg-block-mint text-ink"
                        : isCurrent
                          ? "bg-ink text-canvas"
                          : "bg-canvas text-ink"
                    }`}
                  >
                    {done ? "✓ " : `${step.order}. `}
                    {step.title}
                  </span>
                  {i < steps.length - 1 && <span className="mx-1 text-ink/40">→</span>}
                </li>
              );
            })}
          </ol>
        </div>

        {day.timeline?.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {day.timeline.map((block, i) => (
              <div key={i} className="rounded-lg border border-hairline bg-canvas px-3 py-2 text-xs text-ink">
                <span className="font-semibold">{block.period}</span>
                <span className="ml-1 font-mono">({block.time})</span>
                <span className="ml-2">{block.activity}</span>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-4">
          {steps.map((step) => (
            <StepCard
              key={step.stepId}
              step={step}
              progress={progress?.steps?.[step.stepId]}
              unlocked={isStepUnlocked(steps, steps.indexOf(step), progress)}
              uploading={uploading === step.stepId}
              submitError={submitError}
              onDone={() => markDone(step.stepId)}
              onDeferred={() => markDeferred(step.stepId)}
              onSubmitLink={(url) => submitLink(step.stepId, url)}
              onSubmitFile={(file) => submitFile(step.stepId, file)}
              onOpenHint={() => openHint(step.stepId)}
            />
          ))}
        </div>
      </main>

      <div className="fixed bottom-6 right-6">
        <HelpButton dayId={n} stepId={currentStepId} />
      </div>
    </div>
  );
}
