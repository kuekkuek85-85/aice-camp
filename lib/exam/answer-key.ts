// ⚠️ 서버 전용 — API 라우트에서만 import 한다(클라이언트 번들에 넣지 말 것).
// MCQ 정답 보기 번호(0-based)와 gen 문제의 정답 파일명을 담는다.
export const EXAM_ANSWER_KEY: Record<
  string,
  { mcq?: Record<number, number>; gen?: Record<number, string> }
> = {
  "1": {
    mcq: { 1: 2 }, // 1번 정답 ③ (0-based index 2)
    gen: {
      // 2~8번 정답 .gen이 오면 여기에 채운다. 예: 2: "exam1-q2-answer.gen"
    },
  },
};
