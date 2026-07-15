"use client";

import Link from "next/link";
import { useStudentSession } from "@/lib/hooks/useStudentSession";

export function SiteHeader() {
  const { session, logout } = useStudentSession();

  return (
    <header className="border-b border-hairline bg-canvas">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link href="/" className="font-semibold tracking-tight text-ink">
          🎓 AICE 자격증 캠프
        </Link>
        <nav className="flex items-center gap-2 text-sm text-ink">
          <Link href="/" className="rounded-full px-3 py-1.5 font-medium hover:bg-surface-soft">
            홈
          </Link>
          <Link href="/board" className="rounded-full px-3 py-1.5 font-medium hover:bg-surface-soft">
            동료 현황판
          </Link>
          {session && (
            <span className="ml-2 flex items-center gap-2 border-l border-hairline pl-4">
              <span className="font-medium">{session.name}님</span>
              <button
                onClick={logout}
                className="rounded-full border border-hairline bg-canvas px-3 py-1 text-xs font-medium text-ink hover:bg-surface-soft"
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
