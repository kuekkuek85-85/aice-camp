"use client";

import { useState, type FormEvent } from "react";
import { useStudentSession } from "@/lib/hooks/useStudentSession";

export function LoginForm() {
  const { login, error } = useStudentSession();
  const [studentId, setStudentId] = useState("");
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
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

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-4">
      <div className="w-full rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
        <h1 className="text-center text-2xl font-bold text-slate-900">
          AICE 자격증 캠프
        </h1>
        <p className="mt-1 text-center text-sm text-slate-500">장평중학교 방과후 캠프</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label htmlFor="studentId" className="block text-sm font-medium text-slate-700">
              학번 (5자리)
            </label>
            <input
              id="studentId"
              inputMode="numeric"
              maxLength={5}
              placeholder="예: 10203"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value.replace(/\D/g, "").slice(0, 5))}
              className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-3 text-lg tracking-widest focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
            <p className="mt-1 text-xs text-slate-400">학년(1) + 반(2) + 번호(2) 예) 1학년 2반 3번 → 10203</p>
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-700">
              이름
            </label>
            <input
              id="name"
              placeholder="홍길동"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-3 text-lg focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </div>

          {(localError || error) && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              {localError || error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-indigo-600 px-4 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
          >
            {submitting ? "확인 중..." : "입장하기"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-400">
          비밀번호는 없어요. 학번과 이름만 정확히 입력하면 돼요.
        </p>
      </div>
    </div>
  );
}
