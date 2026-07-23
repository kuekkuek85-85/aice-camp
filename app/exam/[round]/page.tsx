"use client";

import { use, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { FileDownloads } from "@/components/FileDownloads";
import { useStudentSession } from "@/lib/hooks/useStudentSession";
import { useExam } from "@/lib/hooks/useExam";
import { PASS_SCORE, EXAM_TOTAL } from "@/lib/exam/exams";
import type { ExamQuestion, ExamQuestionResult } from "@/lib/types";

export default function ExamRoundPage({ params }: { params: Promise<{ round: string }> }) {
  const { round } = use(params);
  const router = useRouter();
  const { status } = useStudentSession();
  const { exam, results, busyNo, error, submitMcq, uploadAndGrade } = useExam(round);

  useEffect(() => {
    if (status === "guest") router.replace("/");
  }, [status, router]);

  const summary = useMemo(() => {
    if (!exam) return null;
    const available = exam.questions.filter((q) => q.type === "mcq" || q.ready);
    const gradedCount = available.filter((q) => results[q.no]).length;
    const earned = exam.questions.reduce((s, q) => s + (results[q.no]?.correct ? q.points : 0), 0);
    const allReady = exam.questions.every((q) => q.type === "mcq" || q.ready);
    const complete = allReady && exam.questions.every((q) => results[q.no]);
    return { availableCount: available.length, gradedCount, earned, complete };
  }, [exam, results]);

  if (status !== "ready" || !exam) {
    return (
      <div className="flex flex-1 items-center justify-center font-mono text-xs uppercase tracking-widest text-ink">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col pb-24">
      <SiteHeader />
      <main className="mx-auto w-full max-w-2xl flex-1 space-y-5 px-4 py-8">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-ink/60">모의평가</p>
            <h1 className="mt-1 text-2xl font-medium tracking-tight text-ink">{exam.title}</h1>
          </div>
          <Link href="/exam/guide" className="rounded-full border border-hairline bg-canvas px-3 py-1.5 text-xs font-medium text-ink hover:bg-surface-soft">
            시험 안내
          </Link>
        </div>

        {error && <p className="rounded-lg bg-surface-soft px-3 py-2 text-sm font-medium text-magenta">{error}</p>}

        {exam.questions.map((q) => (
          <QuestionCard
            key={q.no}
            q={q}
            result={results[q.no]}
            busy={busyNo === q.no}
            onSubmitMcq={(idx) => submitMcq(q.no, idx)}
            onUploadGen={(file) => uploadAndGrade(q.no, file)}
          />
        ))}

        {summary && (
          <ScorePanel earned={summary.earned} graded={summary.gradedCount} available={summary.availableCount} complete={summary.complete} />
        )}
      </main>
    </div>
  );
}

function QuestionCard({
  q,
  result,
  busy,
  onSubmitMcq,
  onUploadGen,
}: {
  q: ExamQuestion;
  result: ExamQuestionResult | undefined;
  busy: boolean;
  onSubmitMcq: (choiceIndex: number) => void;
  onUploadGen: (file: File) => void;
}) {
  const [selected, setSelected] = useState<number | null>(result?.choiceIndex ?? null);
  const [hintOpen, setHintOpen] = useState(false);

  if (q.type === "gen" && !q.ready) {
    return (
      <div className="rounded-3xl border border-hairline bg-surface-soft p-5 opacity-70">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-ink">문제 {q.no}</span>
          <span className="rounded-full bg-canvas px-2 py-0.5 text-xs font-bold text-ink">{q.points}점</span>
        </div>
        <p className="mt-2 text-sm text-ink/70">🔒 곧 공개돼요.</p>
      </div>
    );
  }

  const graded = Boolean(result);
  return (
    <div className={`rounded-3xl border p-5 ${graded ? (result!.correct ? "border-success/40 bg-block-mint" : "border-magenta/40 bg-block-pink") : "border-hairline bg-canvas"}`}>
      <div className="flex items-center justify-between">
        <span className="font-semibold text-ink">문제 {q.no}{q.type === "mcq" ? " · 이론(객관식)" : ""}</span>
        <div className="flex items-center gap-2">
          {graded && (
            <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${result!.correct ? "bg-ink text-canvas" : "bg-magenta text-canvas"}`}>
              {result!.correct ? "정답 ✓" : "오답 ✗"}
            </span>
          )}
          <span className="rounded-full bg-surface-soft px-2 py-0.5 text-xs font-bold text-ink">{q.points}점</span>
        </div>
      </div>

      <p className="mt-2 whitespace-pre-line text-sm font-medium text-ink">{q.prompt}</p>

      {q.type === "gen" && (
        <div className="mt-3 space-y-3">
          {q.problemFile && (
            <FileDownloads
              items={[
                { fileName: q.problemFile, label: "문제 파일(.gen) 내려받기" },
                ...(q.dataFiles ?? []),
              ]}
            />
          )}
          <div className="rounded-lg border border-hairline bg-canvas p-3">
            <p className="text-xs font-semibold text-ink">✅ 다 풀었으면 내 답안(.gen)을 제출하세요</p>
            <input
              type="file"
              accept=".gen"
              disabled={busy}
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) onUploadGen(file);
                e.target.value = "";
              }}
              className="mt-2 block w-full text-sm text-ink file:mr-3 file:rounded-full file:border-0 file:bg-ink file:px-4 file:py-2 file:text-sm file:font-semibold file:text-canvas hover:file:opacity-80"
            />
            {busy && <p className="mt-1 font-mono text-xs uppercase tracking-widest text-ink">채점 중...</p>}
            {graded && (
              <p className="mt-2 text-sm text-ink">🤖 {result!.feedback}</p>
            )}
          </div>
        </div>
      )}

      {q.type === "mcq" && q.options && (
        <>
          <div className="mt-3 space-y-2">
            {q.options.map((opt, i) => {
              const chosen = selected === i;
              const isAnswerChoice = graded && result!.choiceIndex === i;
              return (
                <button
                  key={i}
                  onClick={() => setSelected(i)}
                  className={`flex w-full items-start gap-2 rounded-xl border px-3 py-2 text-left text-sm transition ${
                    chosen ? "border-ink bg-canvas" : "border-hairline bg-canvas hover:bg-surface-soft"
                  } ${isAnswerChoice && !result!.correct ? "ring-2 ring-magenta" : ""}`}
                >
                  <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold ${chosen ? "bg-ink text-canvas" : "bg-surface-soft text-ink"}`}>
                    {"①②③④⑤".charAt(i)}
                  </span>
                  <span className="text-ink">{opt}</span>
                </button>
              );
            })}
          </div>
          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={() => selected !== null && onSubmitMcq(selected)}
              disabled={selected === null || busy}
              className="rounded-full bg-ink px-5 py-2 text-sm font-semibold text-canvas transition hover:opacity-80 disabled:opacity-40"
            >
              {busy ? "채점 중..." : graded ? "다시 제출" : "제출하고 채점"}
            </button>
            {graded && !result!.correct && (
              <span className="text-xs text-ink">다시 골라 제출할 수 있어요.</span>
            )}
          </div>
        </>
      )}

      {q.hint && (
        <div className="mt-3">
          {hintOpen ? (
            <p className="rounded-lg bg-block-cream p-3 text-sm text-ink"><b>힌트.</b> {q.hint}</p>
          ) : (
            <button onClick={() => setHintOpen(true)} className="rounded-full bg-canvas px-3 py-1 text-xs font-semibold text-ink ring-1 ring-hairline hover:bg-surface-soft">
              💡 힌트 보기
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function ScorePanel({ earned, graded, available, complete }: { earned: number; graded: number; available: number; complete: boolean }) {
  const passed = earned >= PASS_SCORE;
  return (
    <div className="sticky bottom-4 rounded-3xl border border-hairline bg-canvas p-5 shadow-lg">
      {complete ? (
        <div className={`rounded-2xl p-4 text-center ${passed ? "bg-block-mint" : "bg-block-pink"}`}>
          <p className="text-sm font-medium text-ink">최종 점수</p>
          <p className="mt-1 text-3xl font-bold text-ink">{earned} <span className="text-lg text-ink/60">/ {EXAM_TOTAL}점</span></p>
          <p className={`mt-1 text-lg font-bold ${passed ? "text-success" : "text-magenta"}`}>
            {passed ? "합격이에요! 🎉" : "불합격 — 다시 도전해봐요 💪"}
          </p>
          <Link href="/exam" className="mt-3 inline-block rounded-full bg-ink px-4 py-1.5 text-xs font-semibold text-canvas hover:opacity-80">
            다른 회차 풀기 →
          </Link>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-widest text-ink/60">현재 획득 점수</p>
            <p className="mt-0.5 text-2xl font-bold text-ink">{earned}점 <span className="text-sm font-medium text-ink/60">/ {EXAM_TOTAL}점</span></p>
          </div>
          <p className="text-right text-xs text-ink/70">
            채점 {graded}/{available}문항<br />
            나머지 문제는 곧 공개돼요
          </p>
        </div>
      )}
    </div>
  );
}
