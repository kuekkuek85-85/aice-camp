"use client";

import { useConfig } from "@/lib/hooks/useConfig";

const FALLBACK_TOOLS = [
  { name: "Canva AI", desc: "노트를 보기 좋게 디자인 (교육용 팀 초대)", url: "https://www.canva.com/brand/join?token=SzX1bRZsMAJe5nNeK4T89g&brandingVariant=edu&referrer=team-invite" },
  { name: "Gemini", desc: "질문하고 대화하며 개념 정리", url: "https://gemini.google.com/" },
  { name: "NotebookLM", desc: "책 내용을 AI 요약노트로 정리", url: "https://notebooklm.google.com/" },
];

export function ToolMenu() {
  const { config } = useConfig();
  const tools = config.toolMenu.length ? config.toolMenu : FALLBACK_TOOLS;

  return (
    <section>
      <h2 className="text-lg font-bold text-slate-900">AI 공부노트 도구 메뉴판</h2>
      <p className="mt-1 text-sm text-slate-500">아래 도구 중 하나를 골라 오늘의 공부노트를 만들어보세요.</p>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {tools.map((tool) => (
          <a
            key={tool.name}
            href={tool.url}
            target="_blank"
            rel="noreferrer"
            className="rounded-xl border border-slate-200 bg-white p-4 transition hover:border-indigo-300 hover:shadow-sm"
          >
            <div className="font-semibold text-slate-900">{tool.name}</div>
            <div className="mt-1 text-xs text-slate-500">{tool.desc}</div>
          </a>
        ))}
      </div>
    </section>
  );
}
