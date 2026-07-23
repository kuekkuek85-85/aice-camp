// ⚠️ 서버 전용 — API 라우트에서만 import 한다(클라이언트 번들에 넣지 말 것).
// MCQ 정답 보기 번호(0-based)와 gen 문제의 정답 파일명을 담는다.
export const EXAM_ANSWER_KEY: Record<
  string,
  { mcq?: Record<number, number>; gen?: Record<number, string> }
> = {
  "1": {
    mcq: { 1: 2 }, // 1번 정답 ③ (0-based index 2)
    gen: {
      2: "exam1-q2-answer.gen",
      3: "exam1-q3-answer.gen",
      4: "exam1-q4-answer.gen",
      5: "exam1-q5-answer.gen",
      6: "exam1-q6-answer.gen",
      7: "exam1-q7-answer.gen",
      8: "exam1-q8-answer.gen",
    },
  },
  "2": {
    mcq: { 1: 3 }, // 1번 정답 ④ (0-based index 3)
    gen: {
      2: "exam2-q2-answer.gen",
      3: "exam2-q3-answer.gen",
      4: "exam2-q4-answer.gen",
      5: "exam2-q5-answer.gen",
      6: "exam2-q6-answer.gen",
      7: "exam2-q7-answer.gen",
    },
  },
};
