// 모의평가 정의 (클라이언트 안전 — 정답은 포함하지 않는다).
// 정답(MCQ 보기 번호·gen 정답 파일)은 서버 전용 lib/exam/answer-key.ts 에만 둔다.
import type { ExamDef } from "@/lib/types";

export const EXAM_ROUNDS = ["1", "2", "3"];
export const PASS_SCORE = 60; // 60점 이상 합격
export const EXAM_TOTAL = 100;

export const EXAMS: Record<string, ExamDef> = {
  "1": {
    roundId: "1",
    title: "제1차 모의평가",
    questions: [
      {
        no: 1,
        type: "mcq",
        points: 10,
        prompt: "다음 중 데이터의 중요성에 관한 설명으로 옳은 것은 무엇인가요?",
        options: [
          "데이터의 양이 적을수록 효율적인 학습이 가능하므로 모델의 성능이 향상됩니다.",
          "최신의 데이터보다는 과거의 데이터를 사용하는 것이 효과적입니다.",
          "데이터의 양이 많을수록 모델은 다양한 패턴을 파악할 수 있기 때문에 예측 능력이 향상됩니다.",
          "데이터의 품질이 낮아도 모델의 정확도는 영향을 받지 않습니다.",
        ],
      },
      // 2~8번은 문제·정답 .gen 파일과 함께 곧 공개됩니다.
      { no: 2, type: "gen", points: 10, prompt: "", ready: false },
      { no: 3, type: "gen", points: 10, prompt: "", ready: false },
      { no: 4, type: "gen", points: 10, prompt: "", ready: false },
      { no: 5, type: "gen", points: 15, prompt: "", ready: false },
      { no: 6, type: "gen", points: 15, prompt: "", ready: false },
      { no: 7, type: "gen", points: 15, prompt: "", ready: false },
      { no: 8, type: "gen", points: 15, prompt: "", ready: false },
    ],
  },
};
