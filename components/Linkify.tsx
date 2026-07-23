import type { ReactNode } from "react";

// 텍스트 안의 URL(https://… 또는 맨 도메인 data.go.kr 등)을 클릭 가능한 링크로 바꾼다.
export const URL_RE =
  /(https?:\/\/[^\s)'"]+|(?:[a-z0-9-]+\.)+(?:com|kr|org|net|io|co|gov|edu|ai|dev)(?:\/[^\s)'"]*)?)/gi;

export function Linkify({ text }: { text: string }) {
  const parts: ReactNode[] = [];
  let last = 0;
  let key = 0;
  for (const m of text.matchAll(URL_RE)) {
    const raw = m[0];
    const idx = m.index ?? 0;
    if (idx > last) parts.push(text.slice(last, idx));
    const href = raw.startsWith("http") ? raw : `https://${raw}`;
    parts.push(
      <a
        key={key++}
        href={href}
        target="_blank"
        rel="noreferrer"
        className="break-all font-medium text-ink underline underline-offset-2 hover:opacity-70"
      >
        {raw}
      </a>
    );
    last = idx + raw.length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return <>{parts}</>;
}
