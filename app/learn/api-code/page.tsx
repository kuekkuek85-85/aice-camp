"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";

const LINES = [
  { code: 'API결과 = 외부API 호출("전철역 호선 조회")', explain: "종업원(API)에게 주문해서, 돌아온 답(JSON) 전체를 'API결과'에 담아요." },
  { code: 'A = API결과["SearchInfoBySubwayNameService"]', explain: "가장 바깥 상자를 열어요. 서비스 이름 열쇠로 안쪽 내용을 꺼냅니다." },
  { code: 'B = A["row"]', explain: "'row'는 결과들이 담긴 목록(배열)이에요." },
  { code: "C = B[0]", explain: "목록의 첫 번째(0번째) 항목을 꺼내요. 컴퓨터는 0부터 세요!" },
  { code: '호선 = C["LINE_NUM"]', explain: '그 항목 안 "LINE_NUM" 열쇠의 값을 꺼내요. 우리가 찾던 값이에요!' },
  { code: "말하기(호선)", explain: "찾은 값을 화면(채팅)에 말해줘요. 완성!" },
];

// 각 코드 줄이 JSON의 어느 영역을 가리키는지
const REGION = ["all", "service", "row", "row0", "line", "value"] as const;

export default function ApiCodeExplainer() {
  const [step, setStep] = useState(0);
  const region = REGION[step];

  // 현재 단계에서 하이라이트할 영역이면 배경을 준다
  const R = ({ id, children }: { id: string; children: ReactNode }) => (
    <span className={region === id ? "rounded bg-[#ffe14d] font-semibold text-ink" : ""}>{children}</span>
  );

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-hairline bg-canvas">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <span className="font-semibold tracking-tight text-ink">🧑‍💻 코드 한 줄씩 해설</span>
          <Link href="/day/5" className="rounded-full border border-hairline bg-canvas px-3 py-1 text-xs font-medium text-ink hover:bg-surface-soft">
            5일차로 돌아가기
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 space-y-5 px-4 py-8">
        <div>
          <h1 className="text-2xl font-medium tracking-tight text-ink">장한평역 호선 조회 — 한 줄씩</h1>
          <p className="mt-2 text-sm text-ink">
            왼쪽 <b>코드</b>가 오른쪽 <b>JSON</b>의 어느 부분을 꺼내는지 색으로 이어져요. &lsquo;다음 줄&rsquo;을 눌러
            &ldquo;05호선&rdquo;까지 따라가 보세요.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* 좌: 코드 */}
          <div className="space-y-4">
            <div className="rounded-2xl bg-ink p-4 font-mono text-xs leading-relaxed text-canvas sm:text-sm">
              {LINES.map((l, i) => (
                <div
                  key={i}
                  className={`rounded px-2 py-1 transition ${
                    i === step ? "bg-[#ffe14d] font-bold text-ink" : i < step ? "text-canvas/45" : "text-canvas/80"
                  }`}
                >
                  <span className="mr-2 select-none text-canvas/40">{i + 1}</span>
                  {l.code}
                </div>
              ))}
            </div>
            <div className="rounded-2xl bg-surface-soft p-4">
              <p className="font-mono text-[11px] uppercase tracking-widest text-ink/60">{step + 1}번째 줄</p>
              <p className="mt-1 text-sm font-medium text-ink">{LINES[step].explain}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button onClick={() => setStep(0)} className="rounded-full border border-hairline bg-canvas px-4 py-2 text-sm font-medium text-ink hover:bg-surface-soft">⏮ 처음으로</button>
              <button onClick={() => setStep((s) => Math.max(s - 1, 0))} disabled={step === 0} className="rounded-full border border-hairline bg-canvas px-4 py-2 text-sm font-medium text-ink hover:bg-surface-soft disabled:opacity-40">← 이전 줄</button>
              <button onClick={() => setStep((s) => Math.min(s + 1, LINES.length - 1))} disabled={step >= LINES.length - 1} className="rounded-full bg-ink px-5 py-2 text-sm font-semibold text-canvas hover:opacity-80 disabled:opacity-40">다음 줄 →</button>
              <span className="ml-auto font-mono text-xs text-ink/60">{step + 1} / {LINES.length}</span>
            </div>
          </div>

          {/* 우: 원본 JSON */}
          <div className="lg:sticky lg:top-4 lg:self-start">
            <p className="mb-1 font-mono text-[11px] uppercase tracking-widest text-ink/60">원본 JSON (API 응답)</p>
            <div className="overflow-x-auto rounded-2xl bg-ink p-4 font-mono text-[11px] leading-relaxed text-canvas sm:text-xs">
              <pre className="whitespace-pre">
<R id="all">{`{
  `}<R id="service">{`"SearchInfoBySubwayNameService": {
    "list_total_count": 1,
    "RESULT": { "CODE": "INFO-000", "MESSAGE": "정상 처리되었습니다" },
    `}<R id="row">{`"row": [
      `}<R id="row0">{`{
        "STATION_CD": "2544",
        "STATION_NM": "장한평",
        `}<R id="line">{`"LINE_NUM": `}<R id="value">{`"05호선"`}</R></R>{`,
        "FR_CODE": "543"
      }`}</R>{`
    ]`}</R>{`
  }`}</R>{`
}`}</R>
              </pre>
            </div>
            <p className="mt-2 text-xs text-ink/60">색칠된 부분이 지금 줄이 꺼내는 값이에요.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
