const LINKS = [
  { name: "AI 코디니 체험", desc: "코디니가 처음이라면 여기서 소개 영상을", url: "https://aicodiny.com/intro" },
  { name: "AI 코디니 실습", desc: "실제로 블록을 조립해보는 코딩 화면", url: "https://aicodiny.com/codex" },
  { name: "AICE 공식 홈페이지", desc: "자격증 소개 · 회원가입 · 접수", url: "https://aice.study/main" },
  { name: "AICE Future 소개", desc: "우리가 준비하는 Future 등급 안내", url: "https://aice.study/info/aice/future" },
];

export function QuickLinks() {
  return (
    <section className="rounded-3xl bg-block-lime p-6">
      <p className="font-mono text-xs uppercase tracking-widest text-ink">LINKS</p>
      <h2 className="mt-1 text-xl font-semibold tracking-tight text-ink">바로가기</h2>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {LINKS.map((link) => (
          <a
            key={link.name}
            href={link.url}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg bg-canvas p-4 transition hover:opacity-80"
          >
            <div className="font-semibold text-ink">{link.name}</div>
            <div className="mt-1 text-xs text-ink">{link.desc}</div>
          </a>
        ))}
      </div>
    </section>
  );
}
