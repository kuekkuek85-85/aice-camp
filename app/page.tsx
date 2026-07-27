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
              🧑‍🏫 교사 시연 모드
            </span>
          )}
          <h1 className="mt-2 text-3xl font-medium tracking-tight text-ink">
            환영해요, {isDemo && session.school ? `${session.school} ` : ""}
            {session.name}
            {isDemo ? " 선생님" : ""}님 👋
          </h1>
          <p className="mt-2 text-base text-ink">
            {isDemo ? (
              <>둘러보기 모드예요. 아래 로드맵에서 <span className="font-semibold">1일차 · AI와 첫 만남</span>부터 자유롭게 체험해보세요.</>
            ) : (
              <>오늘은 캠프 <span className="font-semibold">{config.currentDay}일차</span>예요. 아래에서 오늘의 학습을 시작해보세요.</>
            )}
          </p>
        </div>

        <StampBoard />
        <ExamInfo />
        <DayRoadmap currentDay={config.currentDay} />
        <MakingTeaser />
        <ToolMenu />
        <QuickLinks />
      </main>
    </div>
  );
}
