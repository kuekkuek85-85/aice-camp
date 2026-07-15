"use client";

import Link from "next/link";
import { useStudentSession } from "@/lib/hooks/useStudentSession";

export function SiteHeader() {
  const { session, logout } = useStudentSession();

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="font-bold text-slate-900">
          🎓 AICE 자격증 캠프
        </Link>
        <nav className="flex items-center gap-4 text-sm text-slate-600">
          <Link href="/" className="hover:text-indigo-600">
            홈
          </Link>
          <Link href="/board" className="hover:text-indigo-600">
            동료 현황판
          </Link>
          {session && (
            <span className="flex items-center gap-2 border-l border-slate-200 pl-4">
              <span className="text-slate-500">{session.name}님</span>
              <button
                onClick={logout}
                className="rounded-md px-2 py-1 text-xs text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                다른 사람이에요
              </button>
            </span>
          )}
        </nav>
      </div>
    </header>
  );
}
