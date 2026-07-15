export function ExamInfo() {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5">
      <h2 className="text-lg font-bold text-slate-900">AICE Future 1급 시험 안내</h2>
      <div className="mt-3 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
        <InfoStat label="문항 수" value="8문항" />
        <InfoStat label="시험 시간" value="60분" />
        <InfoStat label="합격 기준" value="60점 이상" />
        <InfoStat label="사용 도구" value="AI 코디니" />
      </div>
      <p className="mt-3 text-xs text-slate-500">
        AICE Future는 AI 활용 역량을 평가하는 자격증이에요. 캠프 기간 동안 AI 코디니로 직접
        코딩하며 실전 감각을 익혀봐요.
      </p>
    </section>
  );
}

function InfoStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-50 p-3 text-center">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="mt-1 font-bold text-slate-900">{value}</div>
    </div>
  );
}
