"use client";

import { useState } from "react";
import { TeacherSessionProvider, useTeacherSession } from "@/lib/hooks/useTeacherSession";
import { TeacherLoginForm } from "@/components/teacher/TeacherLoginForm";
import { HelpQueue } from "@/components/teacher/HelpQueue";
import { StudentGrid, CompletionBars } from "@/components/teacher/StudentGrid";
import { SubmissionsList } from "@/components/teacher/SubmissionsList";
import { AnswerDownloads } from "@/components/teacher/AnswerDownloads";
import { DangerZone } from "@/components/teacher/DangerZone";
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
    return <div className="flex flex-1 items-center justify-center text-slate-400">불러오는 중...</div>;
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
  const { roster, students, progress, problems } = useTeacherData();
  const { day } = useDay(dayId);

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <h1 className="font-bold text-slate-900">🧑‍🏫 교사 대시보드</h1>
          <button onClick={onLogout} className="text-sm text-slate-400 hover:text-slate-600">
            로그아웃
          </button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 space-y-6 px-4 py-6">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium text-slate-500">일차</span>
          {dayIds.map((d) => (
            <button
              key={d}
              onClick={() => setDayId(d)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                dayId === d ? "bg-indigo-600 text-white" : "bg-white text-slate-600 ring-1 ring-slate-200"
              }`}
            >
              {d}일차
            </button>
          ))}

          <label className="ml-auto flex items-center gap-2 text-sm text-slate-600">
            <input type="checkbox" checked={masking} onChange={(e) => setMasking(e.target.checked)} />
            이름 마스킹
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={onlyAiceIncomplete}
              onChange={(e) => setOnlyAiceIncomplete(e.target.checked)}
            />
            AICE 가입 미완료만
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
        />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <CompletionBars roster={roster} progress={progress} day={day} />
          <AnswerDownloads problems={problems} />
        </div>

        <SubmissionsList roster={roster} progress={progress} masking={masking} />

        <DangerZone />
      </main>
    </div>
  );
}
