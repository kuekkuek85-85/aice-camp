// 모의평가 채점 집계 (클라이언트 안전 — 정답은 포함하지 않는다).
// examResults 문서의 results 와 EXAMS 배점을 이용해 회차별 점수를 계산한다.
import type { ExamDef, ExamQuestionResult } from "@/lib/types";
import { PASS_SCORE } from "@/lib/exam/exams";

export type RoundScore = {
  earned: number; // 획득 점수
  correctCount: number; // 맞힌 문항 수
  gradedCount: number; // 채점된(제출/넘어감) 문항 수
  totalQuestions: number; // 준비된 전체 문항 수
  passed: boolean; // 60점 이상
  finished: boolean; // 모든 문항 채점 완료
  attempted: boolean; // 한 문항이라도 응시
};

// 한 학생의 한 회차 성적을 집계한다. results 가 없으면 미응시.
export function scoreRound(
  round: ExamDef,
  results: Record<string, ExamQuestionResult> | undefined
): RoundScore {
  const questions = round.questions.filter((q) => q.ready !== false);
  let earned = 0;
  let correctCount = 0;
  let gradedCount = 0;
  for (const q of questions) {
    const r = results?.[String(q.no)];
    if (!r) continue;
    gradedCount++;
    if (r.correct) {
      earned += q.points;
      correctCount++;
    }
  }
  return {
    earned,
    correctCount,
    gradedCount,
    totalQuestions: questions.length,
    passed: earned >= PASS_SCORE,
    finished: gradedCount >= questions.length && questions.length > 0,
    attempted: gradedCount > 0,
  };
}
