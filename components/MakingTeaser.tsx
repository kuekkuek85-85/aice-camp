import Link from "next/link";

export function MakingTeaser() {
  return (
    <Link
      href="/making"
      className="block rounded-xl border border-dashed border-indigo-300 bg-indigo-50 p-5 transition hover:border-indigo-400"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-indigo-900">✨ 이 사이트는 이렇게 만들었어요</h2>
          <p className="mt-1 text-sm text-indigo-700">
            선생님이 AI와 대화하며 이 캠프 사이트를 만든 과정을 공개해요. 캠프가 끝날 때쯤,
            여러분도 이런 걸 만들 수 있어요.
          </p>
        </div>
        <span className="text-indigo-400">→</span>
      </div>
    </Link>
  );
}
