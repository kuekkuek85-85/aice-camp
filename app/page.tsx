"use client";

import { useStudentSession } from "@/lib/hooks/useStudentSession";
import { LoginForm } from "@/components/LoginForm";
import { SiteHeader } from "@/components/SiteHeader";
import { ExamInfo } from "@/components/ExamInfo";
import { DayRoadmap } from "@/components/DayRoadmap";
import { StampBoard } from "@/components/StampBoard";
import { ToolMenu } from "@/components/ToolMenu";
import { QuickLinks } from "@/components/QuickLinks";
import { MakingTeaser } from "@/components/MakingTeaser";
import { useConfig } from "@/lib/hooks/useConfig";
import type { LocalSession } from "@/lib/types";
import Link from "next/link";

// 교사 연수 체험 과제 (5일차 · 모의평가)
const WORKSHOP_DAY = "5";
const WORKSHOP_STEP = "mock-exam";
// 1회 2번(5의 배수 판별) 체험용 파일 — public/workshop/ 에서 바로 내려받는다.
const WORKSHOP_FILES = [
  { label: "① 오답: 빈칸 그대로", href: "/workshop/workshop-wrong-blank.gen" },
  { label: "② 오답: 변수 잘못 선택", href: "/workshop/workshop-wrong-variable.gen" },
  { label: "③ 정답", href: "/workshop/workshop-correct.gen" },
];

export default function Home() {
  const { status, session } = useStudentSession();

  if (status === "loading") {
    return (
      <div className="flex flex-1 items-center justify-center font-mono text-xs uppercase tracking-widest text-ink">
        Loading...
      </div>
    );
  }

  if (status === "guest" || !session) {
    return <LoginForm />;
  }

  return <CampHome session={session} />;
}

function CampHome({ session }: { session: LocalSession }) {
  const { config } = useConfig();
  const isDemo = session.role === "demo";

  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 space-y-10 px-4 py-10">
        <div>
          {isDemo && (
            <span className="inline-flex items-center gap-1 rounded-full bg-block-lilac px-3 py-1 text-xs font-bold text-ink">
              🧑‍🏫 교사 연수 모드
            </span>
          )}
          <h1 className="mt-2 text-3xl font-medium tracking-tight text-ink">
            환영해요, {session.name}
            {isDemo ? " 선생님" : "님"} 👋
          </h1>
          <p className="mt-2 text-base text-ink">
            {isDemo ? (
              <>학생 화면 그대로 체험하실 수 있어요. 아래 <span className="font-semibold">체험 과제</span>부터 시작해주세요.</>
            ) : (
              <>오늘은 캠프 <span className="font-semibold">{config.currentDay}일차</span>예요. 아래에서 오늘의 학습을 시작해보세요.</>
            )}
          </p>
        </div>

        {isDemo && (
          <Link
            href={`/day/${WORKSHOP_DAY}#${WORKSHOP_STEP}`}
            className="flex items-center justify-between gap-4 rounded-3xl bg-block-lilac p-6 transition hover:opacity-90"
          >
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-ink">체험 과제</p>
              <p className="mt-1 text-xl font-semibold tracking-tight text-ink">5일차 · 모의평가 (AI 엄격 채점)</p>
              <p className="mt-1 text-sm text-ink">
                1회 1번(객관식)을 풀고, 2번(5의 배수 판별)에 아래 체험 파일을 <b>오답 → 정답</b> 순서로 올려보세요.
              </p>
            </div>
            <span className="shrink-0 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-canvas">바로 가기 →</span>
          </Link>
        )}

        {isDemo && (
          <section className="rounded-3xl border border-hairline bg-canvas p-5">
            <p className="font-mono text-xs uppercase tracking-widest text-ink">체험 파일 (1회 2번용)</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {WORKSHOP_FILES.map((f) => (
                <a
                  key={f.href}
                  href={f.href}
                  download
                  className="rounded-full border border-hairline bg-canvas px-4 py-2 text-sm font-semibold text-ink hover:bg-surface-soft"
                >
                  ⬇ {f.label}
                </a>
              ))}
            </div>
            <p className="mt-2 text-xs text-ink/60">코디니를 열 필요 없이, 받은 파일을 1회 2번 제출란에 그대로 올리면 돼요.</p>
          </section>
        )}

        {!isDemo && <StampBoard />}
        <ExamInfo />
        <DayRoadmap currentDay={config.currentDay} unlockAll={isDemo} />
        <MakingTeaser />
        <ToolMenu />
        <QuickLinks />
      </main>
    </div>
  );
}
