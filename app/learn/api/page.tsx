"use client";

import Link from "next/link";

export default function ApiExplainer() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-hairline bg-canvas">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
          <span className="font-semibold tracking-tight text-ink">🔌 API가 뭐예요?</span>
          <Link href="/day/5" className="rounded-full border border-hairline bg-canvas px-3 py-1 text-xs font-medium text-ink hover:bg-surface-soft">
            5일차로 돌아가기
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 space-y-6 px-4 py-8">
        <div>
          <h1 className="text-2xl font-medium tracking-tight text-ink">API = 식당의 &lsquo;종업원&rsquo;</h1>
          <p className="mt-2 text-sm text-ink">
            내 프로그램은 남의 컴퓨터(서버) 속 데이터를 <b>직접</b> 꺼내올 수 없어요. 식당에서 손님이 주방에 못 들어가는 것과
            똑같죠. 그래서 <b>종업원(API)</b>에게 주문하면, 종업원이 주방에서 음식(데이터)을 가져다줘요.
          </p>
        </div>

        {/* 비유 그림 */}
        <div className="rounded-3xl border border-hairline bg-canvas p-4">
          <svg viewBox="0 0 640 240" className="w-full">
            {/* 손님 */}
            <g>
              <circle cx="80" cy="90" r="26" fill="#c9b6e6" />
              <rect x="58" y="120" width="44" height="42" rx="10" fill="#c9b6e6" />
              <text x="80" y="185" textAnchor="middle" fontSize="12" className="fill-ink" fontWeight="bold">내 프로그램</text>
              <text x="80" y="202" textAnchor="middle" fontSize="10" className="fill-ink">(손님)</text>
            </g>
            {/* 종업원 API */}
            <g>
              <circle cx="320" cy="90" r="30" fill="#8AA06A" />
              <rect x="294" y="122" width="52" height="46" rx="10" fill="#8AA06A" />
              <rect x="300" y="70" width="40" height="26" rx="4" fill="#fff" />
              <text x="320" y="88" textAnchor="middle" fontSize="10" fill="#333">주문서</text>
              <text x="320" y="190" textAnchor="middle" fontSize="13" className="fill-ink" fontWeight="bold">API</text>
              <text x="320" y="207" textAnchor="middle" fontSize="10" className="fill-ink">(종업원)</text>
            </g>
            {/* 주방/서버 */}
            <g>
              <rect x="520" y="60" width="90" height="100" rx="12" fill="#f4ecd6" stroke="#e6e6e6" />
              <text x="565" y="105" textAnchor="middle" fontSize="24">🍳</text>
              <text x="565" y="185" textAnchor="middle" fontSize="12" className="fill-ink" fontWeight="bold">서버(주방)</text>
              <text x="565" y="202" textAnchor="middle" fontSize="10" className="fill-ink">데이터 보관</text>
            </g>
            {/* 화살표 */}
            <g fontSize="10" className="fill-ink">
              <line x1="112" y1="80" x2="284" y2="80" stroke="#000" strokeWidth="1.5" markerEnd="url(#ar)" />
              <text x="198" y="72" textAnchor="middle">① 요청(주문)</text>
              <line x1="352" y1="80" x2="516" y2="80" stroke="#000" strokeWidth="1.5" markerEnd="url(#ar)" />
              <text x="434" y="72" textAnchor="middle">② 데이터 찾기</text>
              <line x1="516" y1="130" x2="352" y2="130" stroke="#ff3d8b" strokeWidth="1.5" markerEnd="url(#arp)" />
              <text x="434" y="146" textAnchor="middle" fill="#ff3d8b">③ 음식(데이터)</text>
              <line x1="284" y1="130" x2="112" y2="130" stroke="#ff3d8b" strokeWidth="1.5" markerEnd="url(#arp)" />
              <text x="198" y="146" textAnchor="middle" fill="#ff3d8b">④ 응답(JSON)</text>
            </g>
            <defs>
              <marker id="ar" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#000" /></marker>
              <marker id="arp" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#ff3d8b" /></marker>
            </defs>
          </svg>
        </div>

        <div className="rounded-2xl bg-block-lilac p-4 text-sm text-ink">
          <b>오늘의 예시</b> — &ldquo;장한평역은 몇 호선일까?&rdquo;<br />
          내 프로그램이 서울시 지하철 정보 API에게 <b>&ldquo;장한평&rdquo;</b>을 물어보면, API가 서버에서 찾아 <b>&ldquo;05호선&rdquo;</b>이 담긴
          답(JSON)을 돌려줘요.
        </div>

        <div className="rounded-2xl border border-hairline bg-canvas p-4">
          <p className="font-mono text-[11px] uppercase tracking-widest text-ink/60">엔드포인트(주소) = 종업원을 부르는 방법</p>
          <p className="mt-2 break-all rounded-lg bg-surface-soft p-3 font-mono text-xs text-ink">
            http://openapi.seoul.go.kr:8088/<span className="text-magenta">인증키</span>/json/<span className="text-success">SearchInfoBySubwayNameService</span>/1/5/<span className="font-bold">장한평</span>
          </p>
          <ul className="mt-2 space-y-1 text-xs text-ink">
            <li>· <span className="text-magenta font-semibold">인증키</span> : 나를 증명하는 열쇠(허락받은 사람만 주문 가능)</li>
            <li>· <span className="text-success font-semibold">서비스 이름</span> : 어떤 정보를 원하는지 (지하철역 정보)</li>
            <li>· <span className="font-semibold">장한평</span> : 내가 찾고 싶은 값(역 이름)</li>
          </ul>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link href="/learn/json" className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-canvas hover:opacity-80">다음: JSON이 뭐예요? →</Link>
          <Link href="/learn/api-code" className="rounded-full border border-hairline bg-canvas px-4 py-2 text-sm font-medium text-ink hover:bg-surface-soft">코드 한 줄씩 보기</Link>
        </div>
      </main>
    </div>
  );
}
