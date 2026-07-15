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
        className="rounded-lg border border-indigo-300 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 disabled:opacity-60"
      >
        📥 문제 파일(.gen) 다운로드
      </button>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
