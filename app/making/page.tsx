import { SiteHeader } from "@/components/SiteHeader";

const SCENES = [
  {
    emoji: "📝",
    title: "① PRD 작성",
    prompt:
      "\"2026 여름 AICE Future 1급 방과후 캠프(5일, 23명)를 위한 학습 플랫폼 PRD를 같이 써보자. 1일차가 완벽하게 돌아가는 게 목표야.\"",
    desc: "선생님이 캠프의 목표와 학생 시나리오를 AI에게 설명하며 기획 문서(PRD)를 함께 작성했어요.",
  },
  {
    emoji: "💻",
    title: "② Claude Code로 구현",
    prompt:
      "\"Next.js + Firebase로 학번+이름 로그인, 일차별 단계 카드, 교사 대시보드를 만들어줘. 정답 파일은 교사만 받을 수 있게 해줘.\"",
    desc: "AI가 PRD를 읽고 실제 코드(페이지, 데이터베이스 구조, 보안 규칙)를 직접 작성했어요.",
  },
  {
    emoji: "🚀",
    title: "③ 배포",
    prompt: "\"Vercel에 배포하고, 환경변수 설정 방법을 README에 정리해줘.\"",
    desc: "완성된 코드를 인터넷에 올려서 여러분이 접속할 수 있는 주소가 만들어졌어요.",
  },
  {
    emoji: "🎉",
    title: "④ 완성",
    prompt: "\"이제 우리 캠프 사이트가 완성됐어. 학생들이 사용할 준비가 됐어!\"",
    desc: "지금 여러분이 보고 있는 이 사이트가 이렇게 만들어졌어요.",
  },
];

export default function MakingPage() {
  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 space-y-8 px-4 py-8">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-ink">MAKING OF</p>
          <h1 className="mt-1 text-3xl font-medium tracking-tight text-ink">✨ 이 사이트는 이렇게 만들었어요</h1>
          <p className="mt-2 text-base text-ink">
            이 캠프 사이트는 선생님이 AI(Claude)와 대화하며 직접 만든 &ldquo;바이브 코딩&rdquo;
            결과물이에요. 실제로 어떤 대화를 나눴는지 살짝 공개할게요.
          </p>
        </div>

        <div className="space-y-4">
          {SCENES.map((scene, i) => {
            const blocks = ["bg-block-lime", "bg-block-lilac", "bg-block-cream", "bg-block-mint"];
            return (
              <div key={scene.title} className={`rounded-3xl p-6 ${blocks[i % blocks.length]}`}>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{scene.emoji}</span>
                  <h2 className="font-semibold tracking-tight text-ink">{scene.title}</h2>
                </div>
                <p className="mt-3 rounded-lg bg-canvas px-3 py-2 font-mono text-xs text-ink">
                  {scene.prompt}
                </p>
                <p className="mt-2 text-sm text-ink">{scene.desc}</p>
              </div>
            );
          })}
        </div>

        <div className="rounded-3xl bg-block-navy p-8 text-center">
          <p className="font-mono text-xs uppercase tracking-widest text-canvas/80">
            이 사이트를 만드는 데 걸린 시간: 약 N시간
          </p>
          <p className="mt-2 text-xl font-medium tracking-tight text-canvas">
            여러분도 곧, 여러분만의 것을 만들 수 있어요. 🌱
          </p>
        </div>
      </main>
    </div>
  );
}
