"use client";

import { useConfig } from "@/lib/hooks/useConfig";

const FALLBACK_TOOLS = [
  { name: "NotebookLM", desc: "책 내용을 AI 요약노트로 정리", url: "https://notebooklm.google.com" },
  { name: "ChatGPT / Claude", desc: "질문하고 대화하며 개념 정리", url: "https://chat.openai.com" },
  { name: "Canva AI", desc: "노트를 보기 좋게 디자인", url: "https://www.canva.com" },
  { name: "바이브 코딩", desc: "이 사이트처럼 AI와 함께 만들기", url: "https://claude.ai" },
];

export function ToolMenu() {
  const { config } = useConfig();
  const tools = config.toolMenu.length ? config.toolMenu : FALLBACK_TOOLS;

  return (
    <section>
      <h2 className="text-lg font-bold text-slate-900">AI 공부노트 도구 메뉴판</h2>
      <p className="mt-1 text-sm text-slate-500">아래 도구 중 하나를 골라 오늘의 공부노트를 만들어보세요.</p>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
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
