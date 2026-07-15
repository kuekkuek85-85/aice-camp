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
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center px-4">
      <p className="font-mono text-xs uppercase tracking-widest text-ink">JANGPYEONG MIDDLE SCHOOL</p>
      <h1 className="mt-2 text-center text-4xl font-medium tracking-tight text-ink">
        AICE 자격증 캠프
      </h1>

      <div className="mt-8 w-full rounded-3xl bg-block-lime p-8">
        <form onSubmit={handleSubmit} className="space-y-4">
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

      <p className="mt-6 text-center text-xs text-ink">
        비밀번호는 없어요. 학번과 이름만 정확히 입력하면 돼요.
      </p>
    </div>
  );
}
