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

export default function Home() {
  const { status, session } = useStudentSession();

  if (status === "loading") {
    return (
      <div className="flex flex-1 items-center justify-center text-slate-400">불러오는 중...</div>
    );
  }

  if (status === "guest" || !session) {
    return <LoginForm />;
  }

  return <CampHome studentName={session.name} />;
}

function CampHome({ studentName }: { studentName: string }) {
  const { config } = useConfig();

  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 space-y-8 px-4 py-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">환영해요, {studentName}님 👋</h1>
          <p className="mt-1 text-sm text-slate-500">
            오늘은 캠프 {config.currentDay}일차예요. 아래에서 오늘의 학습을 시작해보세요.
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
