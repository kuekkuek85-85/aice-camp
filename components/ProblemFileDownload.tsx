"use client";

import { useState } from "react";
import { ref, getDownloadURL } from "firebase/storage";
import { getFirebaseStorage } from "@/lib/firebase/client";

export function ProblemFileDownload({ fileName }: { fileName: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setBusy(true);
    setError(null);
    try {
      const url = await getDownloadURL(ref(getFirebaseStorage(), `problems/${fileName}`));
      window.open(url, "_blank", "noreferrer");
    } catch {
      setError("문제 파일을 아직 찾을 수 없어요. 선생님께 문의해주세요.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-2">
      <button
        onClick={handleClick}
        disabled={busy}
        className="rounded-full bg-ink px-4 py-1.5 text-xs font-semibold text-canvas transition hover:opacity-80 disabled:opacity-50"
      >
        📥 문제 파일(.gen) 다운로드
      </button>
      {error && <p className="mt-1 text-xs font-medium text-magenta">{error}</p>}
    </div>
  );
}
