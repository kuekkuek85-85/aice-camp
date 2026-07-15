import Link from "next/link";

export function MakingTeaser() {
  return (
    <Link
      href="/making"
      className="block rounded-3xl bg-block-lilac p-6 transition hover:opacity-90"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-ink">
            ✨ 이 사이트는 이렇게 만들었어요
          </h2>
          <p className="mt-1 text-sm text-ink">
            선생님이 AI와 대화하며 이 캠프 사이트를 만든 과정을 공개해요. 캠프가 끝날 때쯤,
            여러분도 이런 걸 만들 수 있어요.
          </p>
        </div>
        <span className="rounded-full bg-magenta px-4 py-2 text-sm font-semibold text-canvas">
          구경하기 →
        </span>
      </div>
    </Link>
  );
}
