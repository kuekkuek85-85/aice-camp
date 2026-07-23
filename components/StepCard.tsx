"use client";

import { useState, type ReactNode } from "react";
import type { StepDef, StepGrade, StepProgress } from "@/lib/types";
import { RUBRICS, rubricKey } from "@/lib/grading/rubrics";
import { ProblemFileDownload } from "@/components/ProblemFileDownload";
import { FileDownloads } from "@/components/FileDownloads";
import { MaterialsList } from "@/components/MaterialsList";
import { FeedbackAvatar, type AvatarMood } from "@/components/FeedbackAvatar";

type Props = {
  step: StepDef;
  dayId: string;
  progress: StepProgress | undefined;
  unlocked: boolean;
  uploading: boolean;
  grading?: boolean;
  submitError: string | null;
  onDone: () => void;
  onDeferred: () => void;
  onSubmitLink: (url: string) => Promise<boolean>;
  onSubmitFile: (file: File) => Promise<boolean>;
  onOpenHint: () => void;
  onRegrade: () => void;
};

export function StepCard({
  step,
  dayId,
  progress,
  unlocked,
  uploading,
  grading = false,
  submitError,
  onDone,
  onDeferred,
  onSubmitLink,
  onSubmitFile,
  onOpenHint,
  onRegrade,
}: Props) {
  const status = progress?.status ?? "todo";
  const isDone = status === "done";
  const isDeferred = status === "deferred";

  // 이 단계가 AI 자동 채점 대상인지, 그리고 파일 제출은 됐는데 아직 채점 결과가 없는지
  const isGradeable = Boolean(RUBRICS[rubricKey(dayId, step.stepId)]);
  const awaitingGrade =
    isGradeable && progress?.submission?.type === "file" && !progress?.grade && !grading;

  // 제출 완료 후에도 "수정하기"로 다시 제출할 수 있게 한다
  const [editing, setEditing] = useState(false);
  const showSubmitForm = !isDone || editing;

  async function handleSubmitLink(url: string) {
    const ok = await onSubmitLink(url);
    if (ok) setEditing(false);
    return ok;
  }

  async function handleSubmitFile(file: File) {
    const ok = await onSubmitFile(file);
    if (ok) setEditing(false);
    return ok;
  }

  return (
    <div
      className={`rounded-3xl p-5 transition ${
        !unlocked
          ? "bg-surface-soft opacity-50"
          : isDone
            ? "bg-block-mint"
            : "border border-hairline bg-canvas"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
            isDone
              ? "bg-ink text-canvas"
              : unlocked
                ? "bg-surface-soft text-ink"
                : "bg-hairline text-ink/40"
          }`}
        >
          {isDone ? "✓" : unlocked ? step.order : "🔒"}
        </div>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold tracking-tight text-ink">{step.title}</h3>
            {step.micRequired && (
              <span className="rounded-full bg-block-cream px-2 py-0.5 text-xs font-medium text-ink">
                🎧 마이크(이어폰) 필요
              </span>
            )}
            {step.deferrable && (
              <span className="rounded-full bg-block-lilac px-2 py-0.5 text-xs font-medium text-ink">
                나중에 완료 가능
              </span>
            )}
            {isDeferred && (
              <span className="rounded-full bg-canvas px-2 py-0.5 text-xs font-medium text-ink">
                나중에 완료 예정
              </span>
            )}
          </div>
          <p className="mt-1 whitespace-pre-line text-sm text-ink">
            <Linkify text={step.desc} />
          </p>

          {step.resourceUrl && unlocked && (
            <a
              href={step.resourceUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-block rounded-full border border-hairline bg-canvas px-3 py-1 text-sm font-medium text-ink hover:bg-surface-soft"
            >
              자료 열기 →
            </a>
          )}

          {step.links && step.links.length > 0 && unlocked && (
            <div className="mt-3 rounded-lg bg-surface-soft p-3">
              <p className="font-mono text-[11px] uppercase tracking-widest text-ink">
                {step.linksLabel ??
                  (step.linksType === "choice"
                    ? "이 중 하나를 골라 사용하세요"
                    : "순서대로 따라 해보세요")}
              </p>
              <ol className="mt-2 space-y-1">
                {step.links.map((link, i) => (
                  <li key={link.url}>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 text-sm font-medium text-ink hover:underline"
                    >
                      {step.linksType === "choice" ? (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-canvas text-xs font-bold text-ink">
                          •
                        </span>
                      ) : (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-ink text-xs font-bold text-canvas">
                          {i + 1}
                        </span>
                      )}
                      {link.label} →
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {step.materialsPath && unlocked && <MaterialsList path={step.materialsPath} />}

          {step.downloads && step.downloads.length > 0 && unlocked && (
            <FileDownloads items={step.downloads} />
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
                    className="rounded-full bg-ink px-5 py-2 text-sm font-semibold text-canvas transition hover:opacity-80"
                  >
                    완료했어요 ✓
                  </button>
                  {step.deferrable && (
                    <button
                      onClick={onDeferred}
                      className="rounded-full border border-hairline bg-canvas px-5 py-2 text-sm font-medium text-ink hover:bg-surface-soft"
                    >
                      나중에 할게요
                    </button>
                  )}
                </div>
              )}

              {step.submitType === "link" && showSubmitForm && (
                <LinkSubmitForm onSubmit={handleSubmitLink} />
              )}

              {step.submitType === "file" && showSubmitForm && (
                <FileSubmitForm onSubmit={handleSubmitFile} uploading={uploading} />
              )}

              {step.submitType === "linkOrFile" && showSubmitForm && (
                <LinkOrFileSubmitForm
                  onSubmitLink={handleSubmitLink}
                  onSubmitFile={handleSubmitFile}
                  uploading={uploading}
                />
              )}

              {step.submitType === "fileOrCheck" && (
                <div className="space-y-2">
                  {showSubmitForm && (
                    <FileSubmitForm onSubmit={handleSubmitFile} uploading={uploading} />
                  )}
                  {!isDone && (
                    <button
                      onClick={onDone}
                      className="rounded-full border border-hairline bg-canvas px-5 py-2 text-sm font-medium text-ink hover:bg-surface-soft"
                    >
                      파일 없이 완료했어요 ✓
                    </button>
                  )}
                  {isDone && !progress?.submission && (
                    <div className="flex flex-wrap items-center gap-2 rounded-lg bg-canvas px-3 py-2 text-xs text-ink">
                      <span>완료됨 · 산출물은 나중에 올려도 돼요</span>
                      {editing ? (
                        <button
                          onClick={() => setEditing(false)}
                          className="rounded-full border border-hairline bg-canvas px-3 py-1 font-medium text-ink hover:bg-surface-soft"
                        >
                          닫기
                        </button>
                      ) : (
                        <button
                          onClick={() => setEditing(true)}
                          className="rounded-full bg-ink px-3 py-1 font-semibold text-canvas hover:opacity-80"
                        >
                          📎 산출물 올리기
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {submitError && (
                <p className="mt-2 rounded-lg bg-surface-soft px-3 py-2 text-sm font-medium text-magenta">
                  {submitError}
                </p>
              )}

              {isDone && progress?.submission && (
                <SubmissionSummary
                  submission={progress.submission}
                  editing={editing}
                  onEdit={() => setEditing(true)}
                  onCancelEdit={() => setEditing(false)}
                />
              )}

              {grading && !progress?.grade && (
                <p className="mt-2 rounded-lg bg-block-lilac px-3 py-2 text-sm font-medium text-ink">
                  🤖 AI가 채점하고 있어요... 잠시만요!
                </p>
              )}

              {awaitingGrade && (
                <div className="mt-2 flex flex-wrap items-center gap-2 rounded-lg bg-block-cream px-3 py-2 text-sm text-ink">
                  <span>아직 AI 채점 결과가 없어요.</span>
                  <button
                    onClick={onRegrade}
                    className="rounded-full bg-ink px-3 py-1 text-xs font-semibold text-canvas hover:opacity-80"
                  >
                    🤖 AI 채점 받기
                  </button>
                </div>
              )}

              {progress?.grade && <GradePanel grade={progress.grade} />}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// 설명글 안의 URL(https://… 또는 맨 도메인 data.go.kr 등)을 클릭 가능한 링크로 바꾼다.
const URL_RE =
  /(https?:\/\/[^\s)]+|(?:[a-z0-9-]+\.)+(?:com|kr|org|net|io|co|gov|edu|ai|dev)(?:\/[^\s)]*)?)/gi;

function Linkify({ text }: { text: string }) {
  const parts: ReactNode[] = [];
  let last = 0;
  let key = 0;
  for (const m of text.matchAll(URL_RE)) {
    const raw = m[0];
    const idx = m.index ?? 0;
    if (idx > last) parts.push(text.slice(last, idx));
    const href = raw.startsWith("http") ? raw : `https://${raw}`;
    parts.push(
      <a
        key={key++}
        href={href}
        target="_blank"
        rel="noreferrer"
        className="font-medium text-ink underline underline-offset-2 hover:opacity-70"
      >
        {raw}
      </a>
    );
    last = idx + raw.length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return <>{parts}</>;
}

const GRADE_STYLE: Record<
  StepGrade["verdict"],
  { bg: string; disc: string; badge: string; icon: string; mood: AvatarMood }
> = {
  통과: { bg: "bg-block-mint", disc: "bg-block-mint", badge: "bg-ink text-canvas", icon: "🎉", mood: "celebrate" },
  부분통과: { bg: "bg-block-cream", disc: "bg-block-cream", badge: "bg-ink text-canvas", icon: "🙂", mood: "happy" },
  미흡: { bg: "bg-block-pink", disc: "bg-block-pink", badge: "bg-magenta text-canvas", icon: "💪", mood: "cheer" },
};

function GradePanel({ grade }: { grade: StepGrade }) {
  const s = GRADE_STYLE[grade.verdict] ?? GRADE_STYLE["부분통과"];
  return (
    <div className="mt-2 flex items-start gap-2">
      {/* 캐릭터 아바타 */}
      <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-full ${s.disc}`}>
        <FeedbackAvatar mood={s.mood} className="h-[58px] w-[58px]" />
      </div>
      {/* 말풍선 */}
      <div className={`relative flex-1 rounded-2xl ${s.bg} p-3`}>
        <div
          className={`absolute -left-1.5 top-6 h-3 w-3 rotate-45 ${s.bg}`}
          aria-hidden
        />
        <div className="flex items-center gap-2">
          <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${s.badge}`}>
            {s.icon} AI 코치 · {grade.verdict}
          </span>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-ink">{grade.feedback}</p>
        <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-ink/60">
          AI 참고용 피드백 · 최종 확인은 선생님이 해요
        </p>
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
    <div className="mt-3 space-y-2 rounded-lg bg-block-cream p-3">
      <p className="font-mono text-[11px] uppercase tracking-widest text-ink">힌트 — 순서대로 열어보세요</p>
      {hints.slice(0, opened).map((h, i) => (
        <p key={i} className="text-sm text-ink">
          <span className="font-semibold">힌트{i + 1}.</span> {h}
        </p>
      ))}
      {opened < hints.length && (
        <button
          onClick={onOpen}
          className="rounded-full bg-canvas px-3 py-1 text-xs font-semibold text-ink hover:opacity-80"
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
        className="flex-1 rounded-lg border border-hairline bg-canvas px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-ink"
      />
      <button
        disabled={busy || !url}
        onClick={async () => {
          setBusy(true);
          await onSubmit(url);
          setBusy(false);
        }}
        className="shrink-0 rounded-full bg-ink px-5 py-2 text-sm font-semibold text-canvas transition hover:opacity-80 disabled:opacity-50"
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
        className="block w-full text-sm text-ink file:mr-3 file:rounded-full file:border-0 file:bg-ink file:px-5 file:py-2 file:text-sm file:font-semibold file:text-canvas hover:file:opacity-80"
      />
      {uploading && <p className="mt-1 font-mono text-xs uppercase tracking-widest text-ink">Uploading...</p>}
      <p className="mt-1 text-xs text-ink">.gen 파일만, 5MB 이하</p>
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
          className={`rounded-full px-3 py-1 font-semibold ${mode === "link" ? "bg-ink text-canvas" : "border border-hairline bg-canvas text-ink"}`}
        >
          링크로 제출
        </button>
        <button
          onClick={() => setMode("file")}
          className={`rounded-full px-3 py-1 font-semibold ${mode === "file" ? "bg-ink text-canvas" : "border border-hairline bg-canvas text-ink"}`}
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

function SubmissionSummary({
  submission,
  editing,
  onEdit,
  onCancelEdit,
}: {
  submission: NonNullable<StepProgress["submission"]>;
  editing: boolean;
  onEdit: () => void;
  onCancelEdit: () => void;
}) {
  return (
    <div className="mt-2 flex flex-wrap items-center gap-2 rounded-lg bg-canvas px-3 py-2 text-xs text-ink">
      <span>
        제출 완료 ·{" "}
        {submission.type === "link" ? (
          <a href={submission.url} target="_blank" rel="noreferrer" className="font-semibold text-ink underline">
            제출한 링크 열기
          </a>
        ) : (
          <span>{submission.fileName}</span>
        )}
        <span className="ml-2">{new Date(submission.submittedAt).toLocaleString("ko-KR")}</span>
      </span>
      {editing ? (
        <button
          onClick={onCancelEdit}
          className="rounded-full border border-hairline bg-canvas px-3 py-1 font-medium text-ink hover:bg-surface-soft"
        >
          수정 취소
        </button>
      ) : (
        <button
          onClick={onEdit}
          className="rounded-full bg-ink px-3 py-1 font-semibold text-canvas hover:opacity-80"
        >
          ✏️ 수정하기
        </button>
      )}
    </div>
  );
}
