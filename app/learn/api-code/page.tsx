"use client";

import { useState } from "react";
import Link from "next/link";

const LINES = [
  {
    code: 'API결과 = 외부API 호출("전철역 호선 조회")',
    explain: "종업원(API)에게 주문해서, 돌아온 답(JSON) 전체를 'API결과'에 담아요.",
    value: '{ "SearchInfoBySubwayNameService": { … 전체 응답 … } }',
  },
  {
    code: 'A = API결과["SearchInfoBySubwayNameService"]',
    explain: "가장 바깥 상자를 열어요. 서비스 이름 열쇠로 안쪽 내용을 꺼냅니다.",
    value: '{ "list_total_count": 1, "RESULT": {…}, "row": [ … ] }',
  },
  {
    code: 'B = A["row"]',
    explain: "'row'는 결과들이 담긴 목록(배열)이에요. 역이 여러 개면 여러 개가 들어있죠.",
    value: '[ { "STATION_NM": "장한평", "LINE_NUM": "05호선", … } ]',
  },
  {
    code: "C = B[0]",
    explain: "목록의 첫 번째(0번째) 항목을 꺼내요. 컴퓨터는 0부터 세요!",
    value: '{ "STATION_NM": "장한평", "LINE_NUM": "05호선", "FR_CODE": "543" }',
  },
  {
    code: '호선 = C["LINE_NUM"]',
    explain: '그 항목 안 "LINE_NUM" 열쇠의 값을 꺼내요. 우리가 찾던 값이에요!',
    value: '"05호선"',
  },
  {
    code: "말하기(호선)",
    explain: "찾은 값을 화면(채팅)에 말해줘요. 완성!",
    value: "화면에 → 05호선",
  },
];

export default function ApiCodeExplainer() {
  const [step, setStep] = useState(0);

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-hairline bg-canvas">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
          <span className="font-semibold tracking-tight text-ink">🧑‍💻 코드 한 줄씩 해설</span>
          <Link href="/day/5" className="rounded-full border border-hairline bg-canvas px-3 py-1 text-xs font-medium text-ink hover:bg-surface-soft">
            5일차로 돌아가기
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 space-y-6 px-4 py-8">
        <div>
          <h1 className="text-2xl font-medium tracking-tight text-ink">장한평역 호선 조회 — 한 줄씩</h1>
          <p className="mt-2 text-sm text-ink">
            JSON을 <b>열쇠 순서대로 타고 들어가</b> &ldquo;05호선&rdquo;을 꺼내는 과정을 한 줄씩 따라가요. &lsquo;다음 줄&rsquo;을 눌러보세요.
          </p>
        </div>

        {/* 코드 */}
        <div className="rounded-2xl bg-ink p-4 font-mono text-xs leading-relaxed text-canvas sm:text-sm">
          {LINES.map((l, i) => (
            <div
              key={i}
              className={`rounded px-2 py-1 transition ${
                i === step ? "bg-magenta/30 font-bold" : i < step ? "text-canvas/50" : "text-canvas/80"
              }`}
            >
              <span className="mr-2 select-none text-canvas/40">{i + 1}</span>
              {l.code}
            </div>
          ))}
        </div>

        {/* 이 줄 해설 + 값 */}
        <div className="rounded-2xl bg-surface-soft p-4">
          <p className="text-sm font-medium text-ink">{LINES[step].explain}</p>
          <p className="mt-2 font-mono text-[11px] uppercase tracking-widest text-ink/60">이 줄이 얻는 값</p>
          <pre className="mt-1 overflow-x-auto rounded-lg bg-canvas p-3 font-mono text-xs text-ink">{LINES[step].value}</pre>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button onClick={() => setStep(0)} className="rounded-full border border-hairline bg-canvas px-4 py-2 text-sm font-medium text-ink hover:bg-surface-soft">⏮ 처음으로</button>
          <button onClick={() => setStep((s) => Math.max(s - 1, 0))} disabled={step === 0} className="rounded-full border border-hairline bg-canvas px-4 py-2 text-sm font-medium text-ink hover:bg-surface-soft disabled:opacity-40">← 이전 줄</button>
          <button onClick={() => setStep((s) => Math.min(s + 1, LINES.length - 1))} disabled={step >= LINES.length - 1} className="rounded-full bg-ink px-5 py-2 text-sm font-semibold text-canvas hover:opacity-80 disabled:opacity-40">다음 줄 →</button>
          <span className="ml-auto font-mono text-xs text-ink/60">{step + 1} / {LINES.length}</span>
        </div>
      </main>
    </div>
  );
}
