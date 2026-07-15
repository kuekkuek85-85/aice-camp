"use client";

import Link from "next/link";
import { dayIds } from "@/lib/firestore-paths";
import { useMyStamps } from "@/lib/hooks/useMyStamps";

const DAY_TITLES: Record<string, string> = {
  "1": "1일차 · AI와 첫 만남",
  "2": "2일차 · 함수와 로직",
  "3": "3일차 · 심화 실습",
  "4": "4일차 · 종합 프로젝트",
  "5": "5일차 · 자습 · 모의평가",
};

export function DayRoadmap({ currentDay }: { currentDay: number }) {
  const stamps = useMyStamps();

  return (
    <section>
      <h2 className="text-lg font-bold text-slate-900">5일 로드맵</h2>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-5">
        {dayIds.map((dayId) => {
          const n = Number(dayId);
          const isToday = n === currentDay;
          const isPast = n < currentDay;
          const isLocked = n > currentDay;
          const stamped = stamps[dayId];

          const card = (
            <div
              className={`flex h-full flex-col items-center justify-center rounded-xl border p-4 text-center transition ${
                isToday
                  ? "border-indigo-400 bg-indigo-50 ring-2 ring-indigo-300"
                  : isLocked
                    ? "border-slate-200 bg-slate-100 text-slate-400"
                    : "border-slate-200 bg-white hover:border-indigo-300"
              }`}
            >
              <span className="text-2xl">{stamped ? "🏅" : isLocked ? "🔒" : "📘"}</span>
              <span className="mt-2 text-sm font-semibold">{DAY_TITLES[dayId]}</span>
              {isToday && <span className="mt-1 text-xs font-medium text-indigo-600">오늘</span>}
              {isPast && !isToday && <span className="mt-1 text-xs text-slate-400">열람 가능</span>}
            </div>
          );

          return isLocked ? (
            <div key={dayId} aria-disabled className="cursor-not-allowed">
              {card}
            </div>
          ) : (
            <Link key={dayId} href={`/day/${dayId}`}>
              {card}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
