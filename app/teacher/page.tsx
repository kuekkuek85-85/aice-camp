"use client";

import { useEffect, useState } from "react";
import { TeacherSessionProvider, useTeacherSession } from "@/lib/hooks/useTeacherSession";
import { TeacherLoginForm } from "@/components/teacher/TeacherLoginForm";
import { HelpQueue } from "@/components/teacher/HelpQueue";
import { StudentGrid, CompletionBars } from "@/components/teacher/StudentGrid";
import { SubmissionsList } from "@/components/teacher/SubmissionsList";
import { ExamResults } from "@/components/teacher/ExamResults";
import { DemoParticipants } from "@/components/teacher/DemoParticipants";
import { AnswerDownloads } from "@/components/teacher/AnswerDownloads";
import { DangerZone } from "@/components/teacher/DangerZone";
import { CurrentDayControl } from "@/components/teacher/CurrentDayControl";
import { useTeacherData } from "@/lib/hooks/useTeacherData";
import { useDay } from "@/lib/hooks/useDay";
import { dayIds } from "@/lib/firestore-paths";

export default function TeacherPage() {
  return (
    <TeacherSessionProvider>
      <TeacherGate />
    </TeacherSessionProvider>
  );
}

function TeacherGate() {
  const { status, logout } = useTeacherSession();

  if (status === "loading") {
    return (
      <div className="flex flex-1 items-center justify-center font-mono text-xs uppercase tracking-widest text-ink">
        Loading...
      </div>
    );
  }
  if (status === "guest") {
    return <TeacherLoginForm />;
  }
  return <TeacherDashboard onLogout={logout} />;
}

function TeacherDashboard({ onLogout }: { onLogout: () => void }) {
  const [dayId, setDayId] = useState("1");
  const [masking, setMasking] = useState(false);
  const [onlyAiceIncomplete, setOnlyAiceIncomplete] = useState(false);
  const [hideNotLoggedIn, setHideNotLoggedIn] = useState(false);
  const { roster, students, progress, problems, examResults, demoParticipants } = useTeacherData();
  const { day } = useDay(dayId);

  // '접속 중' 표시를 위해 1분마다 현재 시각 갱신
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-hairline bg-canvas">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <h1 className="font-semibold tracking-tight text-ink">🧑‍🏫 교사 대시보드</h1>
          <button
            onClick={onLogout}
            className="rounded-full border border-hairline bg-canvas px-3 py-1 text-xs font-medium text-ink hover:bg-surface-soft"
          >
            로그아웃
          </button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 space-y-6 px-4 py-6">
        <CurrentDayControl />

        <DemoParticipants participants={demoParticipants} now={now} />

        <div className="flex flex-wrap items-center gap-3">
          <span className="font-mono text-xs uppercase tracking-widest text-ink">대시보드 보기</span>
          {dayIds.map((d) => (
            <button
              key={d}
              onClick={() => setDayId(d)}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                dayId === d ? "bg-ink text-canvas" : "border border-hairline bg-canvas text-ink hover:bg-surface-soft"
              }`}
            >
              {d}일차
            </button>
          ))}

          <label className="ml-auto flex items-center gap-2 text-sm text-ink">
            <input type="checkbox" checked={masking} onChange={(e) => setMasking(e.target.checked)} />
            이름 마스킹
          </label>
          <label className="flex items-center gap-2 text-sm text-ink">
            <input
              type="checkbox"
              checked={onlyAiceIncomplete}
              onChange={(e) => setOnlyAiceIncomplete(e.target.checked)}
            />
            AICE 가입 미완료만
          </label>
          <label className="flex items-center gap-2 text-sm text-ink">
            <input
              type="checkbox"
              checked={hideNotLoggedIn}
              onChange={(e) => setHideNotLoggedIn(e.target.checked)}
            />
            미입장 학생 숨기기
          </label>
        </div>

        <HelpQueue students={students} masking={masking} />

        <StudentGrid
          roster={roster}
          students={students}
          progress={progress}
          day={day}
          masking={masking}
          onlyAiceIncomplete={onlyAiceIncomplete}
          hideNotLoggedIn={hideNotLoggedIn}
        />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <CompletionBars roster={roster} progress={progress} day={day} />
          <AnswerDownloads problems={problems} />
        </div>

        <SubmissionsList roster={roster} progress={progress} masking={masking} day={day} dayId={dayId} />

        <ExamResults roster={roster} examResults={examResults} masking={masking} />

        <DangerZone />
      </main>
    </div>
  );
}
