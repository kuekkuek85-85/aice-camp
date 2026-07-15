"use client";

import { useState } from "react";
import type { StepDef, StepProgress } from "@/lib/types";
import { ProblemFileDownload } from "@/components/ProblemFileDownload";

type Props = {
  step: StepDef;
  progress: StepProgress | undefined;
  unlocked: boolean;
  uploading: boolean;
  submitError: string | null;
  onDone: () => void;
  onDeferred: () => void;
  onSubmitLink: (url: string) => Promise<boolean>;
  onSubmitFile: (file: File) => Promise<boolean>;
  onOpenHint: () => void;
};

export function StepCard({
  step,
  progress,
  unlocked,
  uploading,
  submitError,
  onDone,
  onDeferred,
  onSubmitLink,
  onSubmitFile,
  onOpenHint,
}: Props) {
  const status = progress?.status ?? "todo";
  const isDone = status === "done";
  const isDeferred = status === "deferred";

  return (
    <div
      className={`rounded-xl border p-5 transition ${
        !unlocked
          ? "border-slate-200 bg-slate-50 opacity-60"
          : isDone
            ? "border-emerald-200 bg-emerald-50"
            : "border-slate-200 bg-white"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
            isDone
              ? "bg-emerald-500 text-white"
              : unlocked
                ? "bg-indigo-100 text-indigo-700"
                : "bg-slate-200 text-slate-400"
          }`}
        >
          {isDone ? "✓" : unlocked ? step.order : "🔒"}
        </div>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-bold text-slate-900">{step.title}</h3>
            {step.micRequired && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                🎧 마이크(이어폰) 필요
              </span>
            )}
            {step.deferrable && (
              <span className="rounded-full bg-sky-100 px-2 py-0.5 text-xs font-medium text-sky-700">
                나중에 완료 가능
              </span>
            )}
            {isDeferred && (
              <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-600">
                나중에 완료 예정
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-slate-600">{step.desc}</p>

          {step.resourceUrl && unlocked && (
            <a
              href={step.resourceUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-block text-sm font-medium text-indigo-600 hover:underline"
            >
              자료 열기 →
            </a>
          )}

          {step.links && step.links.length > 0 && unlocked && (
            <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs font-semibold text-slate-600">순서대로 따라 해보세요</p>
              <ol className="mt-2 space-y-1">
                {step.links.map((link, i) => (
                  <li key={link.url}>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-indigo-600 hover:underline"
                    >
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
                        {i + 1}
                      </span>
                      {link.label} →
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {step.problemFileName && unlocked && (
            <ProblemFileDownload fileName={step.problemFileName} />
          )}

          {step.hints && unlocked && !isDone && (
            <HintPanel hints={step.hints} opened={progress?.hintOpened ?? 0} onOpen={onOpenHint} />
          )}

          {unlocked && (
            <div className="mt-3">
              {step.submitType === "check" && !isDone && !isDeferred && (
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={onDone}
                    className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                  >
                    완료했어요 ✓
                  </button>
                  {step.deferrable && (
                    <button
                      onClick={onDeferred}
                      className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                    >
                      나중에 할게요
                    </button>
                  )}
                </div>
              )}

              {step.submitType === "link" && !isDone && (
                <LinkSubmitForm onSubmit={onSubmitLink} />
              )}

              {step.submitType === "file" && !isDone && (
                <FileSubmitForm onSubmit={onSubmitFile} uploading={uploading} />
              )}

              {step.submitType === "linkOrFile" && !isDone && (
                <LinkOrFileSubmitForm
                  onSubmitLink={onSubmitLink}
                  onSubmitFile={onSubmitFile}
                  uploading={uploading}
                />
              )}

              {submitError && (
                <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                  {submitError}
                </p>
              )}

              {isDone && progress?.submission && (
                <SubmissionSummary submission={progress.submission} />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function HintPanel({
  hints,
  opened,
  onOpen,
}: {
  hints: [string, string, string];
  opened: number;
  onOpen: () => void;
}) {
  return (
    <div className="mt-3 space-y-2 rounded-lg bg-amber-50 p-3">
      <p className="text-xs font-semibold text-amber-800">힌트가 필요하면 순서대로 열어보세요</p>
      {hints.slice(0, opened).map((h, i) => (
        <p key={i} className="text-sm text-amber-900">
          <span className="font-semibold">힌트{i + 1}.</span> {h}
        </p>
      ))}
      {opened < hints.length && (
        <button
          onClick={onOpen}
          className="rounded-md border border-amber-300 bg-white px-3 py-1 text-xs font-medium text-amber-700 hover:bg-amber-100"
        >
          힌트{opened + 1} 보기
        </button>
      )}
    </div>
  );
}

function LinkSubmitForm({ onSubmit }: { onSubmit: (url: string) => Promise<boolean> }) {
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <div className="flex gap-2">
      <input
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="https://..."
        className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
      />
      <button
        disabled={busy || !url}
        onClick={async () => {
          setBusy(true);
          await onSubmit(url);
          setBusy(false);
        }}
        className="shrink-0 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
      >
        제출
      </button>
    </div>
  );
}

function FileSubmitForm({
  onSubmit,
  uploading,
}: {
  onSubmit: (file: File) => Promise<boolean>;
  uploading: boolean;
}) {
  return (
    <div>
      <input
        type="file"
        accept=".gen"
        disabled={uploading}
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (file) await onSubmit(file);
          e.target.value = "";
        }}
        className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-indigo-700"
      />
      {uploading && <p className="mt-1 text-xs text-slate-400">업로드 중...</p>}
      <p className="mt-1 text-xs text-slate-400">.gen 파일만, 5MB 이하</p>
    </div>
  );
}

function LinkOrFileSubmitForm({
  onSubmitLink,
  onSubmitFile,
  uploading,
}: {
  onSubmitLink: (url: string) => Promise<boolean>;
  onSubmitFile: (file: File) => Promise<boolean>;
  uploading: boolean;
}) {
  const [mode, setMode] = useState<"link" | "file">("link");

  return (
    <div>
      <div className="mb-2 flex gap-1 text-xs">
        <button
          onClick={() => setMode("link")}
          className={`rounded-md px-2 py-1 font-medium ${mode === "link" ? "bg-indigo-100 text-indigo-700" : "text-slate-400"}`}
        >
          링크로 제출
        </button>
        <button
          onClick={() => setMode("file")}
          className={`rounded-md px-2 py-1 font-medium ${mode === "file" ? "bg-indigo-100 text-indigo-700" : "text-slate-400"}`}
        >
          .gen 파일로 제출
        </button>
      </div>
      {mode === "link" ? (
        <LinkSubmitForm onSubmit={onSubmitLink} />
      ) : (
        <FileSubmitForm onSubmit={onSubmitFile} uploading={uploading} />
      )}
    </div>
  );
}

function SubmissionSummary({ submission }: { submission: NonNullable<StepProgress["submission"]> }) {
  return (
    <div className="mt-2 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">
      제출 완료 ·{" "}
      {submission.type === "link" ? (
        <a href={submission.url} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline">
          제출한 링크 열기
        </a>
      ) : (
        <span>{submission.fileName}</span>
      )}
      <span className="ml-2">{new Date(submission.submittedAt).toLocaleString("ko-KR")}</span>
    </div>
  );
}
