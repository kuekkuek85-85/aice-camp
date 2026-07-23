"use client";

import { useState } from "react";
import Link from "next/link";

const STEPS: { key: string; crumb: string; desc: string }[] = [
  { key: "SearchInfoBySubwayNameService", crumb: '["SearchInfoBySubwayNameService"]', desc: "가장 바깥 상자를 열어요. 서비스 이름이 첫 번째 열쇠(key)예요." },
  { key: "row", crumb: '["row"]', desc: "그 안의 'row'는 결과들이 담긴 목록(배열, [])이에요." },
  { key: "0", crumb: "[0]", desc: "목록의 첫 번째 항목을 꺼내요. 컴퓨터는 0부터 세니까 '0번째'예요!" },
  { key: "LINE_NUM", crumb: '["LINE_NUM"]', desc: '그 항목 안 "LINE_NUM" 열쇠의 값 → "05호선"! 드디어 찾았어요 🎉' },
];

export default function JsonExplainer() {
  const [step, setStep] = useState(-1);
  const activeKeys = STEPS.slice(0, step + 1).map((s) => s.key);
  const isActive = (k: string) => activeKeys.includes(k);
  const isCurrent = (k: string) => step >= 0 && STEPS[step].key === k;

  const K = ({ name }: { name: string }) => (
    <span
      className={`rounded px-1 ${
        isCurrent(name) ? "bg-magenta font-bold text-canvas" : isActive(name) ? "bg-block-mint text-ink" : "text-success"
      }`}
    >
      &quot;{name}&quot;
    </span>
  );

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-hairline bg-canvas">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
          <span className="font-semibold tracking-tight text-ink">📦 JSON이 뭐예요?</span>
          <Link href="/day/5" className="rounded-full border border-hairline bg-canvas px-3 py-1 text-xs font-medium text-ink hover:bg-surface-soft">
            5일차로 돌아가기
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 space-y-6 px-4 py-8">
        <div>
          <h1 className="text-2xl font-medium tracking-tight text-ink">JSON = 라벨 붙은 &lsquo;상자&rsquo;</h1>
          <p className="mt-2 text-sm text-ink">
            JSON은 데이터를 <b>&lsquo;이름표(key)&rsquo;</b>와 <b>&lsquo;내용물(value)&rsquo;</b> 짝으로 정리한 거예요. 상자 안에 상자가 들어있듯
            <b> 중첩</b>될 수 있어요. 원하는 값을 꺼내려면 이름표를 <b>순서대로 타고 들어가면</b> 돼요. 아래 &lsquo;다음&rsquo;을 눌러
            &ldquo;05호선&rdquo;까지 따라가 봐요!
          </p>
        </div>

        {/* 실제 JSON */}
        <div className="overflow-x-auto rounded-2xl bg-ink p-4 font-mono text-xs leading-relaxed text-canvas">
          <pre className="whitespace-pre">
{`{
  `}<K name="SearchInfoBySubwayNameService" />{`: {
    "list_total_count": 1,
    "RESULT": { "CODE": "INFO-000", "MESSAGE": "정상 처리되었습니다" },
    `}<K name="row" />{`: [
      `}<span className={isCurrent("0") ? "rounded bg-magenta px-1 font-bold text-canvas" : isActive("0") ? "rounded bg-block-mint px-1 text-ink" : ""}>{`{`}</span>{`
        "STATION_CD": "2544",
        "STATION_NM": "장한평",
        `}<K name="LINE_NUM" />{`: `}<span className={isActive("LINE_NUM") ? "rounded bg-block-cream px-1 font-bold text-ink" : "text-block-cream"}>&quot;05호선&quot;</span>{`,
        "FR_CODE": "543"
      }
    ]
  }
}`}
          </pre>
        </div>

        {/* 경로 */}
        <div className="rounded-2xl border border-hairline bg-canvas p-3">
          <p className="font-mono text-[11px] uppercase tracking-widest text-ink/60">지금까지 타고 들어간 경로</p>
          <p className="mt-1 font-mono text-sm text-ink">
            API결과{STEPS.slice(0, step + 1).map((s, i) => (
              <span key={i} className="font-bold text-magenta">{s.crumb}</span>
            ))}
            {step === STEPS.length - 1 && <span className="ml-2 font-sans font-semibold text-success">= &quot;05호선&quot;</span>}
          </p>
        </div>

        <div className={`rounded-2xl p-4 text-sm font-medium text-ink ${step === STEPS.length - 1 ? "bg-block-mint" : "bg-surface-soft"}`}>
          {step < 0 ? "'다음 열쇠 열기'를 눌러 값을 찾아가 봐요." : STEPS[step].desc}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button onClick={() => setStep(-1)} className="rounded-full border border-hairline bg-canvas px-4 py-2 text-sm font-medium text-ink hover:bg-surface-soft">⏮ 처음으로</button>
          <button onClick={() => setStep((s) => Math.min(s + 1, STEPS.length - 1))} disabled={step >= STEPS.length - 1} className="rounded-full bg-ink px-5 py-2 text-sm font-semibold text-canvas hover:opacity-80 disabled:opacity-40">다음 열쇠 열기 🔑</button>
          <Link href="/learn/api-code" className="ml-auto rounded-full bg-magenta px-4 py-2 text-sm font-semibold text-canvas hover:opacity-80">코드 한 줄씩 보기 →</Link>
        </div>
      </main>
    </div>
  );
}
