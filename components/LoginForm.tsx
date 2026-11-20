"use client";

import { useState, type FormEvent } from "react";
import { useStudentSession } from "@/lib/hooks/useStudentSession";

type Track = "student" | "demo";

export function LoginForm() {
  const { login, loginDemo, error } = useStudentSession();
  const [track, setTrack] = useState<Track>("demo");

  // 학생 트랙
  const [studentId, setStudentId] = useState("");
  const [name, setName] = useState("");

  // 교사 연수 트랙 — 실명·소속 대신 연수 코드 + 닉네임
  const [workshopCode, setWorkshopCode] = useState("");
  const [nickname, setNickname] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  function switchTrack(next: Track) {
    setTrack(next);
    setLocalError(null);
  }

  async function handleStudentSubmit(e: FormEvent) {
    e.preventDefault();
    setLocalError(null);
    if (!/^\d{5}$/.test(studentId)) {
      setLocalError("학번은 5자리 숫자로 입력해주세요. (예: 학년1+반2+번호2 → 10203)");
      return;
    }
    if (!name.trim()) {
      setLocalError("이름을 입력해주세요.");
      return;
    }
    setSubmitting(true);
    await login(studentId, name.trim());
    setSubmitting(false);
  }

  async function handleDemoSubmit(e: FormEvent) {
    e.preventDefault();
    setLocalError(null);
    if (!workshopCode.trim()) {
      setLocalError("연수 코드를 입력해주세요.");
      return;
    }
    if (!nickname.trim()) {
      setLocalError("닉네임을 입력해주세요.");
      return;
    }
    setSubmitting(true);
    await loginDemo(workshopCode.trim(), nickname.trim());
    setSubmitting(false);
  }

  const isStudent = track === "student";

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center px-4">
      <p className="font-mono text-xs uppercase tracking-widest text-ink">JANGPYEONG MIDDLE SCHOOL</p>
      <h1 className="mt-2 text-center text-4xl font-medium tracking-tight text-ink">
        AICE 자격증 캠프
      </h1>

      {/* 트랙 선택 */}
      <div className="mt-6 flex w-full gap-2 rounded-full bg-surface-soft p-1">
        <button
          type="button"
          onClick={() => switchTrack("student")}
          className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold transition ${
            isStudent ? "bg-ink text-canvas" : "text-ink hover:bg-canvas"
          }`}
        >
          🎓 학생 수업
        </button>
        <button
          type="button"
          onClick={() => switchTrack("demo")}
          className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold transition ${
            !isStudent ? "bg-ink text-canvas" : "text-ink hover:bg-canvas"
          }`}
        >
          🧑‍🏫 교사 연수
        </button>
      </div>

      {isStudent ? (
        <div className="mt-4 w-full rounded-3xl bg-block-lime p-8">
          <form onSubmit={handleStudentSubmit} className="space-y-4">
            <div>
              <label htmlFor="studentId" className="block text-sm font-semibold text-ink">
                학번 (5자리)
              </label>
              <input
                id="studentId"
                inputMode="numeric"
                maxLength={5}
                placeholder="예: 10203"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value.replace(/\D/g, "").slice(0, 5))}
                className="mt-1 w-full rounded-lg border border-hairline bg-canvas px-4 py-3 text-lg tracking-widest text-ink focus:outline-none focus:ring-2 focus:ring-ink"
              />
              <p className="mt-1 text-xs text-ink">학년(1) + 반(2) + 번호(2) 예) 1학년 2반 3번 → 10203</p>
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-ink">
                이름
              </label>
              <input
                id="name"
                placeholder="홍길동"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full rounded-lg border border-hairline bg-canvas px-4 py-3 text-lg text-ink focus:outline-none focus:ring-2 focus:ring-ink"
              />
            </div>

            {(localError || error) && (
              <p className="rounded-lg bg-canvas px-3 py-2 text-sm font-medium text-magenta">
                {localError || error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-full bg-ink px-5 py-3 font-semibold text-canvas transition hover:opacity-80 disabled:opacity-50"
            >
              {submitting ? "확인 중..." : "입장하기"}
            </button>
          </form>
        </div>
      ) : (
        <div className="mt-4 w-full rounded-3xl bg-block-lilac p-8">
          <p className="text-sm font-medium text-ink">
            선생님 연수·체험용 입장이에요. 실명이나 소속은 받지 않아요.
          </p>
          <form onSubmit={handleDemoSubmit} className="mt-4 space-y-4">
            <div>
              <label htmlFor="workshopCode" className="block text-sm font-semibold text-ink">
                연수 코드
              </label>
              <input
                id="workshopCode"
                placeholder="강사님이 알려준 코드"
                autoCapitalize="characters"
                autoComplete="off"
                value={workshopCode}
                onChange={(e) => setWorkshopCode(e.target.value)}
                className="mt-1 w-full rounded-lg border border-hairline bg-canvas px-4 py-3 text-lg tracking-widest text-ink focus:outline-none focus:ring-2 focus:ring-ink"
              />
            </div>

            <div>
              <label htmlFor="nickname" className="block text-sm font-semibold text-ink">
                닉네임
              </label>
              <input
                id="nickname"
                placeholder="예: 코딩하는곰"
                maxLength={20}
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="mt-1 w-full rounded-lg border border-hairline bg-canvas px-4 py-3 text-lg text-ink focus:outline-none focus:ring-2 focus:ring-ink"
              />
              <p className="mt-1 text-xs text-ink">강사 화면에 이 닉네임으로 표시돼요.</p>
            </div>

            {(localError || error) && (
              <p className="rounded-lg bg-canvas px-3 py-2 text-sm font-medium text-magenta">
                {localError || error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-full bg-ink px-5 py-3 font-semibold text-canvas transition hover:opacity-80 disabled:opacity-50"
            >
              {submitting ? "입장 중..." : "연수 입장하기"}
            </button>
          </form>
        </div>
      )}

      <p className="mt-6 text-center text-xs text-ink">
        {isStudent
          ? "비밀번호는 없어요. 학번과 이름만 정확히 입력하면 돼요."
          : "연수 코드와 닉네임만 입력하면 바로 입장돼요."}
      </p>
    </div>
  );
}
