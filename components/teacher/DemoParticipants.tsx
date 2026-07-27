"use client";

import type { DemoParticipant } from "@/lib/types";

// 최근 입장 시각으로 접속 여부 추정(15분 이내 입장을 '접속 중'으로 본다 — 시연 세션 길이 여유)
const ONLINE_WINDOW_MS = 15 * 60 * 1000;

export function DemoParticipants({
  participants,
  now,
}: {
  participants: DemoParticipant[];
  now: number;
}) {
  const rows = [...participants].sort((a, b) => (b.joinedAt ?? 0) - (a.joinedAt ?? 0));
  const online = rows.filter((p) => now - (p.lastSeenAt ?? 0) < ONLINE_WINDOW_MS).length;

  return (
    <section className="rounded-3xl border border-hairline bg-block-lilac/40 p-4">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="font-mono text-[11px] uppercase tracking-widest text-ink">🧑‍🏫 교사 시연 참가자</h2>
        <span className="rounded-full bg-ink px-2 py-0.5 text-[11px] font-bold text-canvas">
          총 {rows.length}
        </span>
        {online > 0 && (
          <span className="rounded-full bg-block-mint px-2 py-0.5 text-[11px] font-bold text-ink">
            접속 중 {online}
          </span>
        )}
      </div>

      {rows.length === 0 ? (
        <p className="mt-2 text-sm text-ink">
          아직 입장한 선생님이 없어요. 로그인 화면의 <b>🧑‍🏫 교사 시연</b> 탭에서 학교·성함으로 입장하면 여기에 실시간으로 표시돼요.
        </p>
      ) : (
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {rows.map((p) => {
            const isOnline = now - (p.lastSeenAt ?? 0) < ONLINE_WINDOW_MS;
            return (
              <div
                key={p.uid}
                className="flex items-center gap-2 rounded-2xl border border-hairline bg-canvas px-3 py-2"
              >
                <span
                  className={`h-2 w-2 shrink-0 rounded-full ${isOnline ? "bg-success" : "bg-ink/20"}`}
                  title={isOnline ? "접속 중" : "오프라인"}
                />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-ink">{p.name}</span>
                  <span className="block truncate text-xs text-ink/60">{p.school}</span>
                </span>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
