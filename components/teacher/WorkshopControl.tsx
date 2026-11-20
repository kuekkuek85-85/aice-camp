"use client";

import { useEffect, useState } from "react";
import { useTeacherSession } from "@/lib/hooks/useTeacherSession";

// 교사 연수 입장 스위치 — 열려 있는 동안만 '연수 코드 + 닉네임' 입장과 연수 참가자의 AI 채점이 허용된다.
export function WorkshopControl() {
  const { getIdToken } = useTeacherSession();
  const [enabled, setEnabled] = useState(false);
  const [code, setCode] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const idToken = await getIdToken();
        const res = await fetch("/api/workshop-settings", { headers: { Authorization: `Bearer ${idToken}` } });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "설정을 불러오지 못했어요.");
        setEnabled(data.enabled === true);
        setCode(data.code ?? "");
      } catch (e) {
        setMsg({ ok: false, text: e instanceof Error ? e.message : "설정을 불러오지 못했어요." });
      } finally {
        setLoaded(true);
      }
    })();
  }, [getIdToken]);

  async function save(nextEnabled: boolean) {
    setBusy(true);
    setMsg(null);
    try {
      const idToken = await getIdToken();
      const res = await fetch("/api/workshop-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({ enabled: nextEnabled, code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "저장하지 못했어요.");
      setEnabled(data.enabled === true);
      setCode(data.code ?? "");
      setMsg({ ok: true, text: data.enabled ? `연수 입장을 열었어요. 코드: ${data.code}` : "연수 입장을 닫았어요." });
    } catch (e) {
      setMsg({ ok: false, text: e instanceof Error ? e.message : "저장하지 못했어요." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-3xl border border-hairline bg-canvas p-4">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="font-mono text-[11px] uppercase tracking-widest text-ink">연수 입장</h2>
        {loaded && (
          <span
            className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
              enabled ? "bg-block-mint text-ink" : "bg-surface-soft text-ink/60"
            }`}
          >
            {enabled ? "열림" : "닫힘"}
          </span>
        )}
      </div>
      <p className="mt-1 text-xs text-ink/60">
        열려 있는 동안만 연수 코드로 입장할 수 있고, 연수 참가자의 AI 채점도 이때만 동작해요. 연수가 끝나면 꼭 닫아주세요.
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="연수 코드 (4자 이상)"
          disabled={!loaded || busy}
          className="w-48 rounded-lg border border-hairline bg-canvas px-3 py-2 font-mono text-sm tracking-widest text-ink focus:outline-none focus:ring-2 focus:ring-ink"
        />
        <button
          onClick={() => save(true)}
          disabled={!loaded || busy}
          className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-canvas hover:opacity-80 disabled:opacity-50"
        >
          {enabled ? "코드 저장" : "연수 열기"}
        </button>
        {enabled && (
          <button
            onClick={() => save(false)}
            disabled={busy}
            className="rounded-full border border-hairline bg-canvas px-4 py-2 text-sm font-semibold text-ink hover:bg-surface-soft disabled:opacity-50"
          >
            연수 닫기
          </button>
        )}
      </div>
      {msg && <p className={`mt-2 text-sm font-medium ${msg.ok ? "text-success" : "text-magenta"}`}>{msg.text}</p>}
    </section>
  );
}
