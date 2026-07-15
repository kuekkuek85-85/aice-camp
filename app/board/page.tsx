"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { useStudentSession } from "@/lib/hooks/useStudentSession";
import { usePublicProgressList } from "@/lib/hooks/usePublicProgressList";
import { dayIds } from "@/lib/firestore-paths";

export default function BoardPage() {
  const router = useRouter();
  const { status } = useStudentSession();
  const { list, loading } = usePublicProgressList();
  const [dayFilter, setDayFilter] = useState<string>("all");

  useEffect(() => {
    if (status === "guest") router.replace("/");
  }, [status, router]);

  const filtered = useMemo(
    () => (dayFilter === "all" ? list : list.filter((p) => p.currentDayId === dayFilter)),
    [list, dayFilter]
  );

  const sorted = useMemo(
    () => [...filtered].sort((a, b) => a.studentId.localeCompare(b.studentId)),
    [filtered]
  );

  const summary = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of filtered) {
      const key = `${p.currentStepOrder}. ${p.currentStepTitle}`;
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [filtered]);

  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-4xl flex-1 space-y-6 px-4 py-8">
        <div>
          <h1 className="text-3xl font-medium tracking-tight text-ink">동료 현황판</h1>
          <p className="mt-2 text-base text-ink">
            친구들의 이름과 현재 단계만 볼 수 있어요. 제출물과 링크는 비공개예요.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <TabButton active={dayFilter === "all"} onClick={() => setDayFilter("all")}>
            전체
          </TabButton>
          {dayIds.map((d) => (
            <TabButton key={d} active={dayFilter === d} onClick={() => setDayFilter(d)}>
              {d}일차
            </TabButton>
          ))}
        </div>

        {summary.length > 0 && (
          <div className="rounded-3xl bg-block-cream p-4">
            <h2 className="font-mono text-[11px] uppercase tracking-widest text-ink">단계별 인원</h2>
            <div className="mt-2 flex flex-wrap gap-2">
              {summary.map(([label, count]) => (
                <span
                  key={label}
                  className="rounded-full bg-canvas px-3 py-1 text-xs font-medium text-ink"
                >
                  {label} · {count}명
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="overflow-hidden rounded-3xl border border-hairline bg-canvas">
          <table className="w-full text-sm">
            <thead className="bg-surface-soft text-left font-mono text-[11px] uppercase tracking-widest text-ink">
              <tr>
                <th className="px-4 py-2">이름</th>
                <th className="px-4 py-2">일차</th>
                <th className="px-4 py-2">현재 단계</th>
                <th className="px-4 py-2">상태</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center font-mono text-xs uppercase tracking-widest text-ink">
                    Loading...
                  </td>
                </tr>
              )}
              {!loading && sorted.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-sm text-ink">
                    아직 데이터가 없어요.
                  </td>
                </tr>
              )}
              {sorted.map((p) => (
                <tr key={p.studentId} className="border-t border-hairline-soft">
                  <td className="px-4 py-2 font-medium text-ink">{p.name}</td>
                  <td className="px-4 py-2 text-ink">{p.currentDayId}일차</td>
                  <td className="px-4 py-2 text-ink">
                    {p.currentStepOrder}. {p.currentStepTitle}
                  </td>
                  <td className="px-4 py-2">
                    {p.helpFlag?.active ? (
                      <span className="rounded-full bg-magenta px-2 py-0.5 text-xs font-semibold text-canvas">
                        🙋 막혔어요
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-success">진행 중</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
        active ? "bg-ink text-canvas" : "border border-hairline bg-canvas text-ink hover:bg-surface-soft"
      }`}
    >
      {children}
    </button>
  );
}
