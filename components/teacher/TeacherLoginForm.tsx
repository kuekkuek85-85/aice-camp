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
      <div className="w-full rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
        <h1 className="text-center text-xl font-bold text-slate-900">교사 대시보드</h1>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <input
            type="password"
            placeholder="PIN 입력"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-4 py-3 text-center text-lg tracking-widest focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />
          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-slate-900 px-4 py-3 font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
          >
            {submitting ? "확인 중..." : "입장"}
          </button>
        </form>
      </div>
    </div>
  );
}
