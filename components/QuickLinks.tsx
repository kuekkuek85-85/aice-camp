const LINKS = [
  { name: "AI 코디니 체험", desc: "코디니가 처음이라면 여기서 소개 영상을", url: "https://aicodiny.com/intro" },
  { name: "AI 코디니 실습", desc: "실제로 블록을 조립해보는 코딩 화면", url: "https://aicodiny.com/codex" },
  { name: "AICE 공식 홈페이지", desc: "자격증 소개 · 회원가입 · 접수", url: "https://aice.study" },
];

export function QuickLinks() {
  return (
    <section>
      <h2 className="text-lg font-bold text-slate-900">바로가기</h2>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {LINKS.map((link) => (
          <a
            key={link.name}
            href={link.url}
            target="_blank"
            rel="noreferrer"
            className="rounded-xl border border-slate-200 bg-white p-4 transition hover:border-indigo-300 hover:shadow-sm"
          >
            <div className="font-semibold text-slate-900">{link.name}</div>
            <div className="mt-1 text-xs text-slate-500">{link.desc}</div>
          </a>
        ))}
      </div>
    </section>
  );
}
