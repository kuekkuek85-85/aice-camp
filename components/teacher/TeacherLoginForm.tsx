"use client";

import { useState, type FormEvent } from "react";
import { useTeacherSession } from "@/lib/hooks/useTeacherSession";

export function TeacherLoginForm() {
  const { login, error } = useTeacherSession();
  const [pin, setPin] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    await login(pin);
    setSubmitting(false);
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col items-center justify-center px-4">
      <div className="w-full rounded-3xl border border-hairline bg-canvas p-8">
        <p className="text-center font-mono text-xs uppercase tracking-widest text-ink">TEACHER</p>
        <h1 className="mt-1 text-center text-2xl font-medium tracking-tight text-ink">교사 대시보드</h1>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <input
            type="password"
            placeholder="PIN 입력"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            className="w-full rounded-lg border border-hairline bg-canvas px-4 py-3 text-center text-lg tracking-widest text-ink focus:outline-none focus:ring-2 focus:ring-ink"
          />
          {error && <p className="rounded-lg bg-surface-soft px-3 py-2 text-sm font-medium text-magenta">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-full bg-ink px-5 py-3 font-semibold text-canvas transition hover:opacity-80 disabled:opacity-50"
          >
            {submitting ? "확인 중..." : "입장"}
          </button>
        </form>
      </div>
    </div>
  );
}
