export function ExamInfo() {
  return (
    <section className="rounded-3xl border border-hairline bg-canvas p-6">
      <p className="font-mono text-xs uppercase tracking-widest text-ink">EXAM INFO</p>
      <h2 className="mt-1 text-xl font-semibold tracking-tight text-ink">AICE Future 1급 시험 안내</h2>
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        <InfoStat label="문항 수" value="8문항" />
        <InfoStat label="시험 시간" value="60분" />
        <InfoStat label="합격 기준" value="60점 이상" />
        <InfoStat label="사용 도구" value="AI 코디니" />
      </div>
      <p className="mt-4 text-sm text-ink">
        AICE Future는 AI 활용 역량을 평가하는 자격증이에요. 캠프 기간 동안 AI 코디니로 직접
        코딩하며 실전 감각을 익혀봐요.
      </p>
    </section>
  );
}

function InfoStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-surface-soft p-3 text-center">
      <div className="font-mono text-[11px] uppercase tracking-widest text-ink">{label}</div>
      <div className="mt-1 font-bold text-ink">{value}</div>
    </div>
  );
}
