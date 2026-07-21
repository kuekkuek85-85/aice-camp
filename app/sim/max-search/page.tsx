"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";

// 서울 폭염 발생일수 (행정안전부, 2007~2022) — 문제 4번 데이터와 동일
const DATA: { year: number; days: number }[] = [
  { year: 2007, days: 4 },
  { year: 2008, days: 3 },
  { year: 2009, days: 4 },
  { year: 2010, days: 2 },
  { year: 2011, days: 3 },
  { year: 2012, days: 14 },
  { year: 2013, days: 2 },
  { year: 2014, days: 10 },
  { year: 2015, days: 8 },
  { year: 2016, days: 24 },
  { year: 2017, days: 13 },
  { year: 2018, days: 35 },
  { year: 2019, days: 15 },
  { year: 2020, days: 4 },
  { year: 2021, days: 18 },
  { year: 2022, days: 10 },
];

type Frame = {
  cursor: number; // 지금 보고 있는 칸 (index)
  maxIdx: number; // 지금까지 최댓값을 가진 칸
  updated: boolean; // 이번 단계에서 최댓값이 바뀌었는지
  done: boolean; // 탐색 끝
  text: string; // 설명
};

function buildFrames(): Frame[] {
  const frames: Frame[] = [];
  let maxIdx = 0;
  frames.push({
    cursor: 0,
    maxIdx: 0,
    updated: false,
    done: false,
    text: `첫 번째 해 ${DATA[0].year}년(${DATA[0].days}일)을 '지금까지 가장 많은 해'로 정해두고 시작해요.`,
  });
  for (let i = 1; i < DATA.length; i++) {
    const cur = DATA[i];
    const best = DATA[maxIdx];
    if (cur.days > best.days) {
      maxIdx = i;
      frames.push({
        cursor: i,
        maxIdx,
        updated: true,
        done: false,
        text: `${cur.year}년은 ${cur.days}일! 지금까지 최대(${best.days}일)보다 많으니까 → 가장 많은 해를 ${cur.year}년으로 바꿔요. 🎉`,
      });
    } else {
      frames.push({
        cursor: i,
        maxIdx,
        updated: false,
        done: false,
        text: `${cur.year}년은 ${cur.days}일. 지금까지 최대(${DATA[maxIdx].year}년 ${best.days}일)보다 적으니까 그대로 둬요.`,
      });
    }
  }
  const win = DATA[maxIdx];
  frames.push({
    cursor: DATA.length - 1,
    maxIdx,
    updated: false,
    done: true,
    text: `끝까지 다 봤어요! 서울에서 폭염이 가장 많이 발생한 해는 ${win.year}년(${win.days}일)이에요. 음성으로 안내하면 완성! ✅`,
  });
  return frames;
}

export default function MaxSearchSim() {
  const frames = useMemo(buildFrames, []);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const frame = frames[step];
  const maxDays = Math.max(...DATA.map((d) => d.days));

  const next = useCallback(() => setStep((s) => Math.min(s + 1, frames.length - 1)), [frames.length]);

  useEffect(() => {
    if (!playing) return;
    if (step >= frames.length - 1) {
      setPlaying(false);
      return;
    }
    const t = setTimeout(next, 1100);
    return () => clearTimeout(t);
  }, [playing, step, frames.length, next]);

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-hairline bg-canvas">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
          <span className="font-semibold tracking-tight text-ink">🔎 최댓값 찾기 시뮬레이션</span>
          <Link
            href="/day/3"
            className="rounded-full border border-hairline bg-canvas px-3 py-1 text-xs font-medium text-ink hover:bg-surface-soft"
          >
            3일차로 돌아가기
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 space-y-6 px-4 py-8">
        <div>
          <h1 className="text-2xl font-medium tracking-tight text-ink">
            여러 데이터 중 가장 큰 값은 어떻게 찾을까요?
          </h1>
          <p className="mt-2 text-sm text-ink">
            컴퓨터는 값을 <b>하나씩 순서대로</b> 보면서 가장 큰 값을 찾아요(선형 탐색). 방법은 딱 두 단계예요 —
            ① 맨 앞 값을 <b>&lsquo;지금까지 최대&rsquo;</b>로 정한다. ② 다음 값이 지금까지 최대보다 <b>크면</b> 최대를
            그 값으로 바꾼다. 끝까지 반복하면 가장 큰 값이 남아요!
          </p>
        </div>

        {/* 막대 그래프 */}
        <div className="rounded-3xl border border-hairline bg-canvas p-4">
          <div className="flex items-end justify-center gap-1.5" style={{ height: 220 }}>
            {DATA.map((d, i) => {
              const isCursor = i === frame.cursor && !frame.done;
              const isMax = i === frame.maxIdx;
              const seen = i <= frame.cursor;
              const h = Math.round((d.days / maxDays) * 170) + 8;
              return (
                <div key={d.year} className="flex flex-1 flex-col items-center justify-end gap-1">
                  <span
                    className={`text-[11px] font-bold ${isMax ? "text-magenta" : seen ? "text-ink" : "text-ink/30"}`}
                  >
                    {d.days}
                  </span>
                  <div
                    className={`w-full rounded-t-md transition-all duration-500 ${
                      isMax
                        ? "bg-block-mint"
                        : isCursor
                          ? "bg-block-lilac"
                          : seen
                            ? "bg-surface-soft"
                            : "bg-hairline"
                    } ${isCursor ? "ring-2 ring-ink" : ""}`}
                    style={{ height: h }}
                  />
                  <span
                    className={`text-[10px] ${isMax ? "font-bold text-ink" : "text-ink/50"}`}
                    style={{ writingMode: "vertical-rl" }}
                  >
                    {d.year}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-3 text-[11px] text-ink">
            <span className="flex items-center gap-1">
              <span className="inline-block h-3 w-3 rounded bg-block-lilac ring-2 ring-ink" /> 지금 보는 해
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block h-3 w-3 rounded bg-block-mint" /> 지금까지 가장 많은 해
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block h-3 w-3 rounded bg-hairline" /> 아직 안 본 해
            </span>
          </div>
        </div>

        {/* 현재 상태 + 설명 */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <StatBox label="지금 보는 해" value={frame.done ? "—" : `${DATA[frame.cursor].year}년`} sub={frame.done ? "" : `${DATA[frame.cursor].days}일`} />
          <StatBox label="지금까지 최대" value={`${DATA[frame.maxIdx].year}년`} sub={`${DATA[frame.maxIdx].days}일`} highlight />
          <StatBox label="진행" value={`${Math.min(frame.cursor + 1, DATA.length)} / ${DATA.length}`} sub="칸" />
        </div>

        <div
          className={`rounded-2xl p-4 text-sm font-medium text-ink transition ${
            frame.done ? "bg-block-mint" : frame.updated ? "bg-block-cream" : "bg-surface-soft"
          }`}
        >
          {frame.text}
        </div>

        {/* 컨트롤 */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => { setPlaying(false); setStep(0); }}
            className="rounded-full border border-hairline bg-canvas px-4 py-2 text-sm font-medium text-ink hover:bg-surface-soft"
          >
            ⏮ 처음으로
          </button>
          <button
            onClick={() => { setPlaying(false); next(); }}
            disabled={step >= frames.length - 1}
            className="rounded-full bg-ink px-5 py-2 text-sm font-semibold text-canvas hover:opacity-80 disabled:opacity-40"
          >
            한 단계씩 ▶
          </button>
          <button
            onClick={() => setPlaying((p) => !p)}
            disabled={step >= frames.length - 1}
            className="rounded-full bg-magenta px-5 py-2 text-sm font-semibold text-canvas hover:opacity-80 disabled:opacity-40"
          >
            {playing ? "⏸ 멈춤" : "⏵ 자동 재생"}
          </button>
        </div>

        {/* 의사코드 */}
        <div className="rounded-2xl bg-ink p-4 font-mono text-xs leading-relaxed text-canvas">
          <p className="text-canvas/50"># 최댓값(가장 많은 해) 찾기</p>
          <p className={frame.cursor === 0 ? "rounded bg-canvas/20 px-1" : ""}>최댓값 = 첫 번째 값(2007년)</p>
          <p>반복: 다음 해부터 마지막 해까지</p>
          <p className={frame.updated ? "rounded bg-block-mint/30 px-1" : ""}>
            &nbsp;&nbsp;만약 (이번 해 &gt; 지금까지 최댓값) 이면:
          </p>
          <p className={frame.updated ? "rounded bg-block-mint/30 px-1" : ""}>
            &nbsp;&nbsp;&nbsp;&nbsp;최댓값 = 이번 해, 결과 연도 = 이번 해
          </p>
          <p className={frame.done ? "rounded bg-block-mint/30 px-1" : ""}>결과 연도를 음성으로 안내</p>
        </div>
      </main>
    </div>
  );
}

function StatBox({ label, value, sub, highlight }: { label: string; value: string; sub?: string; highlight?: boolean }) {
  return (
    <div className={`rounded-2xl p-3 text-center ${highlight ? "bg-block-mint" : "border border-hairline bg-canvas"}`}>
      <p className="font-mono text-[10px] uppercase tracking-widest text-ink/60">{label}</p>
      <p className="mt-1 text-lg font-bold text-ink">{value}</p>
      {sub && <p className="text-xs text-ink">{sub}</p>}
    </div>
  );
}
