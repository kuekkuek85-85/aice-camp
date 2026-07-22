"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";

// 전국 초등학교 학급당 학생 수(예시) — 해마다 조금씩 줄어드는 추세
const DATA: { year: number; value: number }[] = [
  { year: 2015, value: 22.6 },
  { year: 2016, value: 22.4 },
  { year: 2017, value: 22.0 },
  { year: 2018, value: 21.7 },
  { year: 2019, value: 21.2 },
  { year: 2020, value: 21.1 },
  { year: 2021, value: 20.6 },
  { year: 2022, value: 20.3 },
  { year: 2023, value: 19.9 },
  { year: 2024, value: 19.6 },
];
const THRESHOLD = 18;

// 최소제곱법으로 y = a*year + b 구하기
function fitLine(points: { year: number; value: number }[]) {
  const n = points.length;
  const sx = points.reduce((s, p) => s + p.year, 0);
  const sy = points.reduce((s, p) => s + p.value, 0);
  const sxx = points.reduce((s, p) => s + p.year * p.year, 0);
  const sxy = points.reduce((s, p) => s + p.year * p.value, 0);
  const a = (n * sxy - sx * sy) / (n * sxx - sx * sx);
  const b = (sy - a * sx) / n;
  return { a, b };
}

type Frame = { year: number; pred: number; done: boolean; text: string };

export default function RegressionSim() {
  const { a, b } = useMemo(() => fitLine(DATA), []);
  const predict = useCallback((year: number) => a * year + b, [a, b]);

  const frames = useMemo<Frame[]>(() => {
    const out: Frame[] = [];
    for (let year = 2025; year <= 2040; year++) {
      const pred = predict(year);
      const done = pred <= THRESHOLD;
      out.push({
        year,
        pred,
        done,
        text: done
          ? `${year}년 예측값은 약 ${pred.toFixed(1)}명 → 드디어 ${THRESHOLD}명 이하! 예측을 멈추고 "${year}년"이 정답이에요. 🎉`
          : `${year}년 예측값은 약 ${pred.toFixed(1)}명. 아직 ${THRESHOLD}명보다 많으니 다음 해도 예측해봐요.`,
      });
      if (done) break;
    }
    return out;
  }, [predict]);

  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const frame = frames[step];

  const next = useCallback(() => setStep((s) => Math.min(s + 1, frames.length - 1)), [frames.length]);
  useEffect(() => {
    if (!playing) return;
    if (step >= frames.length - 1) return void setPlaying(false);
    const t = setTimeout(next, 1200);
    return () => clearTimeout(t);
  }, [playing, step, frames.length, next]);

  // 좌표 매핑
  const W = 640, H = 320, padL = 46, padR = 20, padT = 20, padB = 34;
  const xMin = 2015, xMax = 2032, yMin = 17, yMax = 23.5;
  const sx = (year: number) => padL + ((year - xMin) / (xMax - xMin)) * (W - padL - padR);
  const sy = (val: number) => padT + (1 - (val - yMin) / (yMax - yMin)) * (H - padT - padB);

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-hairline bg-canvas">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
          <span className="font-semibold tracking-tight text-ink">📈 회귀분석 시뮬레이션</span>
          <Link href="/day/4" className="rounded-full border border-hairline bg-canvas px-3 py-1 text-xs font-medium text-ink hover:bg-surface-soft">
            4일차로 돌아가기
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 space-y-6 px-4 py-8">
        <div>
          <h1 className="text-2xl font-medium tracking-tight text-ink">회귀분석이 뭐예요?</h1>
          <p className="mt-2 text-sm text-ink">
            흩어진 데이터 속에서 <b>규칙(추세선)</b>을 찾아, 그 선을 <b>미래까지 늘려 예측</b>하는 방법이에요. 아래는 해마다
            줄어드는 &lsquo;학급당 학생 수&rsquo; 데이터예요. 점들 사이로 가장 잘 맞는 직선을 그리고, 그 선을 따라 앞으로의 값을
            예측해 <b>{THRESHOLD}명 이하가 되는 해</b>를 찾아봐요.
          </p>
        </div>

        {/* 산점도 + 회귀선 */}
        <div className="rounded-3xl border border-hairline bg-canvas p-4">
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
            {/* 축 */}
            <line x1={padL} y1={padT} x2={padL} y2={H - padB} stroke="#e6e6e6" />
            <line x1={padL} y1={H - padB} x2={W - padR} y2={H - padB} stroke="#e6e6e6" />
            {/* y 눈금 */}
            {[18, 19, 20, 21, 22, 23].map((v) => (
              <g key={v}>
                <line x1={padL} y1={sy(v)} x2={W - padR} y2={sy(v)} stroke="#f1f1f1" />
                <text x={padL - 6} y={sy(v) + 3} textAnchor="end" className="fill-ink" fontSize="9">{v}</text>
              </g>
            ))}
            {/* x 눈금 */}
            {[2015, 2020, 2025, 2030].map((yr) => (
              <text key={yr} x={sx(yr)} y={H - padB + 14} textAnchor="middle" className="fill-ink" fontSize="9">{yr}</text>
            ))}
            {/* 18명 기준선 */}
            <line x1={padL} y1={sy(THRESHOLD)} x2={W - padR} y2={sy(THRESHOLD)} stroke="#ff3d8b" strokeWidth="1.5" strokeDasharray="5 4" />
            <text x={W - padR} y={sy(THRESHOLD) - 4} textAnchor="end" fill="#ff3d8b" fontSize="9" fontWeight="bold">{THRESHOLD}명 기준</text>
            {/* 회귀선 */}
            <line x1={sx(xMin)} y1={sy(predict(xMin))} x2={sx(xMax)} y2={sy(predict(xMax))} stroke="#000" strokeWidth="2" opacity="0.85" />
            {/* 실제 데이터 점 */}
            {DATA.map((p) => (
              <circle key={p.year} cx={sx(p.year)} cy={sy(p.value)} r="4" fill="#1ea64a" />
            ))}
            {/* 예측 점 (스텝까지) */}
            {frames.slice(0, step + 1).map((f) => (
              <g key={f.year}>
                <line x1={sx(f.year)} y1={sy(f.pred)} x2={sx(f.year)} y2={H - padB} stroke={f.done ? "#ff3d8b" : "#c8b6e6"} strokeWidth="1" strokeDasharray="2 2" />
                <circle cx={sx(f.year)} cy={sy(f.pred)} r="5" fill={f.done ? "#ff3d8b" : "#fff"} stroke={f.done ? "#ff3d8b" : "#000"} strokeWidth="2" />
              </g>
            ))}
          </svg>
          <div className="mt-2 flex flex-wrap justify-center gap-3 text-[11px] text-ink">
            <span className="flex items-center gap-1"><span className="inline-block h-2.5 w-2.5 rounded-full bg-success" /> 실제 데이터(과거)</span>
            <span className="flex items-center gap-1"><span className="inline-block h-2.5 w-2.5 rounded-full border-2 border-ink bg-canvas" /> 예측(미래)</span>
            <span className="flex items-center gap-1"><span className="inline-block h-0.5 w-4 bg-ink" /> 추세선(회귀선)</span>
          </div>
        </div>

        {/* 상태 + 설명 */}
        <div className="grid grid-cols-3 gap-3">
          <Stat label="예측 연도" value={`${frame.year}년`} />
          <Stat label="예측 학생 수" value={`${frame.pred.toFixed(1)}명`} highlight={frame.done} />
          <Stat label="추세선 기울기" value={`${a.toFixed(2)}/년`} />
        </div>
        <div className={`rounded-2xl p-4 text-sm font-medium text-ink ${frame.done ? "bg-block-mint" : "bg-surface-soft"}`}>
          {frame.text}
        </div>

        {/* 컨트롤 */}
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={() => { setPlaying(false); setStep(0); }} className="rounded-full border border-hairline bg-canvas px-4 py-2 text-sm font-medium text-ink hover:bg-surface-soft">⏮ 처음으로</button>
          <button onClick={() => { setPlaying(false); next(); }} disabled={step >= frames.length - 1} className="rounded-full bg-ink px-5 py-2 text-sm font-semibold text-canvas hover:opacity-80 disabled:opacity-40">다음 해 예측 ▶</button>
          <button onClick={() => setPlaying((p) => !p)} disabled={step >= frames.length - 1} className="rounded-full bg-magenta px-5 py-2 text-sm font-semibold text-canvas hover:opacity-80 disabled:opacity-40">{playing ? "⏸ 멈춤" : "⏵ 자동 예측"}</button>
        </div>

        {/* 단순 vs 다중 회귀 개념 */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-hairline bg-canvas p-4">
            <h3 className="text-sm font-bold text-ink">단순 회귀 분석</h3>
            <p className="mt-1 text-xs text-ink">입력(원인) <b>1개</b>로 결과 1개를 예측해요. 위 그래프처럼요!</p>
            <div className="mt-3 flex items-center justify-center gap-2 text-xs">
              <span className="rounded-lg bg-block-lilac px-2 py-1 font-medium text-ink">연도</span>
              <span className="text-ink/50">→</span>
              <span className="rounded-lg bg-block-mint px-2 py-1 font-medium text-ink">학생 수</span>
            </div>
          </div>
          <div className="rounded-2xl border border-hairline bg-canvas p-4">
            <h3 className="text-sm font-bold text-ink">다중 회귀 분석</h3>
            <p className="mt-1 text-xs text-ink">입력(원인) <b>여러 개</b>로 결과 1개를 예측해요. 더 복잡한 관계도 분석!</p>
            <div className="mt-3 flex items-center justify-center gap-2 text-xs">
              <span className="flex flex-col gap-1">
                <span className="rounded-lg bg-block-lilac px-2 py-0.5 font-medium text-ink">연도</span>
                <span className="rounded-lg bg-block-lilac px-2 py-0.5 font-medium text-ink">출생아 수</span>
                <span className="rounded-lg bg-block-lilac px-2 py-0.5 font-medium text-ink">학교 수</span>
              </span>
              <span className="text-ink/50">→</span>
              <span className="rounded-lg bg-block-mint px-2 py-1 font-medium text-ink">학생 수</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-2xl p-3 text-center ${highlight ? "bg-block-mint" : "border border-hairline bg-canvas"}`}>
      <p className="font-mono text-[10px] uppercase tracking-widest text-ink/60">{label}</p>
      <p className="mt-1 text-lg font-bold text-ink">{value}</p>
    </div>
  );
}
