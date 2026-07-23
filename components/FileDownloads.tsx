"use client";

import { useState } from "react";
import { ref, getDownloadURL } from "firebase/storage";
import { getFirebaseStorage } from "@/lib/firebase/client";

type DownloadItem = { fileName: string; label: string };

/** 교사가 Storage problems/ 에 올린 자료(엑셀 등)를 라벨과 함께 내려받게 한다. */
export function FileDownloads({ items }: { items: DownloadItem[] }) {
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleClick(item: DownloadItem) {
    setBusy(item.fileName);
    setError(null);
    try {
      const base = await getDownloadURL(ref(getFirebaseStorage(), `problems/${item.fileName}`));
      // 캐시 무력화(예전 inline 응답이 캐시돼 있어도 새 응답을 받게) + 강제 다운로드
      const url = `${base}${base.includes("?") ? "&" : "?"}dl=${Date.now()}`;
      const a = document.createElement("a");
      a.href = url;
      a.download = item.fileName;
      a.rel = "noreferrer";
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch {
      setError("자료 파일을 아직 찾을 수 없어요. 선생님께 문의해주세요.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="mt-3 rounded-lg bg-block-mint p-3">
      <p className="font-mono text-[11px] uppercase tracking-widest text-ink">📊 문제 데이터 파일</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {items.map((item) => (
          <button
            key={item.fileName}
            onClick={() => handleClick(item)}
            disabled={busy === item.fileName}
            className="rounded-full bg-ink px-4 py-1.5 text-xs font-semibold text-canvas transition hover:opacity-80 disabled:opacity-50"
          >
            📥 {item.label}
          </button>
        ))}
      </div>
      {error && <p className="mt-1 text-xs font-medium text-magenta">{error}</p>}
    </div>
  );
}
