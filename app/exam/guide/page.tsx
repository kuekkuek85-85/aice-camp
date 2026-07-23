"use client";

import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";

export default function ExamGuide() {
  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-2xl flex-1 space-y-5 px-4 py-8">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-ink/60">모의평가 안내</p>
          <h1 className="mt-1 text-3xl font-medium tracking-tight text-ink">시험은 이렇게 봐요 📋</h1>
          <p className="mt-2 text-sm text-ink">
            5일 동안 배운 걸 점검하는 모의평가예요. 아래 규칙을 먼저 읽고 시작하세요. 규칙은 <b>1·2·3회 모두 공통</b>이에요.
          </p>
        </div>

        {/* 구성 & 배점 */}
        <section className="rounded-3xl border border-hairline bg-canvas p-5">
          <h2 className="font-mono text-[11px] uppercase tracking-widest text-ink">문제 구성 · 배점</h2>
          <ul className="mt-2 space-y-1.5 text-sm text-ink">
            <li>· <b>1번</b> — 이론 (객관식) · <b>10점</b></li>
            <li>· <b>2~8번</b> — 실습 (코디니 빈칸 채우기)</li>
            <li className="ml-4">· 2·3·4번 : 각 <b>10점</b></li>
            <li className="ml-4">· 5·6·7·8번 : 각 <b>15점</b></li>
          </ul>
          <div className="mt-3 rounded-xl bg-block-lilac p-3 text-sm font-semibold text-ink">
            총 100점 만점 · <span className="text-magenta">60점 이상이면 합격</span> 🎉
          </div>
        </section>

        {/* 실습 문제 푸는 법 */}
        <section className="rounded-3xl border border-hairline bg-canvas p-5">
          <h2 className="font-mono text-[11px] uppercase tracking-widest text-ink">실습 문제(2~8번) 푸는 법</h2>
          <ol className="mt-2 space-y-2 text-sm text-ink">
            <li>
              <b>1.</b> 문제 <code className="rounded bg-surface-soft px-1">.gen</code> 파일(필요하면 활용 데이터도)을 내려받아 코디니(codex)에 업로드해요.
            </li>
            <li>
              <b>2.</b> 코드 안에 있는 <span className="rounded bg-[#b98a4a] px-1.5 py-0.5 font-semibold text-white">-- 이 블록을 바꾸세요 --</span> ·{" "}
              <span className="rounded bg-[#b98a4a] px-1.5 py-0.5 font-semibold text-white">?</span> 같은 <b>갈색 블록</b>을 찾아요.
            </li>
            <li>
              <b>3.</b> 그 갈색 블록을 <b>삭제</b>하고, 문제에서 준 <b>&lsquo;활용할 블록&rsquo;</b> 중에서 골라 그 자리에 끼워 완성해요.
            </li>
            <li>
              <b>4.</b> 다 풀면 내 답안 <code className="rounded bg-surface-soft px-1">.gen</code> 파일을 다시 제출해요. <b>AI 코치</b>가 채점해줘요.
            </li>
          </ol>
          <div className="mt-3 space-y-1 rounded-xl bg-block-cream p-3 text-sm text-ink">
            <p className="font-semibold">⚠️ 꼭 지켜요</p>
            <p>· 문제에서 준 <b>활용할 블록만</b> 쓸 수 있어요. (다른 블록은 사용 금지)</p>
            <p>· 같은 블록을 <b>여러 번</b> 써도 돼요.</p>
            <p>· 블록 안의 <b>숫자·문자·기호</b>는 문제에 맞게 바꿔도 돼요.</p>
          </div>
        </section>

        {/* 채점 & 진행 */}
        <section className="rounded-3xl border border-hairline bg-canvas p-5">
          <h2 className="font-mono text-[11px] uppercase tracking-widest text-ink">채점 · 진행</h2>
          <ul className="mt-2 space-y-1.5 text-sm text-ink">
            <li>· 모의평가는 <b>정확히 맞아야 정답</b>이에요. 하나라도 다르면 오답이에요. (평소 실습보다 엄격!)</li>
            <li>· 막히면 각 문제의 <b>힌트</b>를 열어볼 수 있어요.</li>
            <li>· 한 회를 다 풀면 <b>총점과 합격/불합격</b>이 나와요.</li>
            <li>· 1회를 마치면 이어서 <b>2회 · 3회</b>도 풀 수 있어요.</li>
          </ul>
        </section>

        <div className="flex flex-wrap gap-2">
          <Link href="/exam" className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-canvas hover:opacity-80">
            모의평가 시작하기 →
          </Link>
          <Link href="/" className="rounded-full border border-hairline bg-canvas px-5 py-2.5 text-sm font-medium text-ink hover:bg-surface-soft">
            홈으로
          </Link>
        </div>
      </main>
    </div>
  );
}
