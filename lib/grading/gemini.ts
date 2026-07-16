// Gemini 채점 호출 (서버 전용)
import type { GradeVerdict } from "@/lib/types";
import type { Rubric } from "@/lib/grading/rubrics";

const MODEL = "gemini-flash-latest";
const ENDPOINT = (model: string) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

export type GradeResult = { verdict: GradeVerdict; feedback: string };

function buildPrompt(rubric: Rubric, answerPseudo: string, studentPseudo: string): string {
  return `너는 중학생 블록코딩(AI 코디니) 과제를 채점하는 친절한 보조교사야.
아래 [문제]와 [핵심 요건], [모범답안]을 참고해 [학생답안]을 채점해.

채점 원칙(매우 중요):
- 문제의 핵심을 근본적으로 해결했으면 "통과"야. 변수명·순서·추가 실험은 감점하지 마.
- 예: 2제곱·3제곱을 테스트한 뒤 6제곱을 추가로 호출했어도, 핵심을 해결했으면 통과야.
- 핵심 요건 중 빠진 게 있으면 "미흡"이고, 무엇이 빠졌는지 격려하는 말투로 알려줘.
- 거의 다 했는데 사소한 실수(예: 경계값)만 있으면 "부분통과".
- 학생을 존중하는 따뜻한 반말/존댓말 섞인 말투로, 잘한 점을 먼저 칭찬해.
- 반드시 아래 JSON 형식으로만 답해. 다른 말 붙이지 마.

[문제] ${rubric.title}
[핵심 요건]
${rubric.requirements.map((r, i) => `${i + 1}. ${r}`).join("\n")}

[모범답안]
${answerPseudo}

[학생답안]
${studentPseudo}

출력(JSON): {"verdict":"통과|부분통과|미흡","feedback":"학생에게 보여줄 1~2문장 한국어 피드백"}`;
}

export async function gradeWithGemini(
  rubric: Rubric,
  answerPseudo: string,
  studentPseudo: string
): Promise<GradeResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY 환경변수가 없습니다.");

  const res = await fetch(ENDPOINT(MODEL), {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-goog-api-key": apiKey },
    body: JSON.stringify({
      contents: [{ parts: [{ text: buildPrompt(rubric, answerPseudo, studentPseudo) }] }],
      generationConfig: { responseMimeType: "application/json", temperature: 0 },
    }),
  });

  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Gemini 오류 ${res.status}: ${t.slice(0, 200)}`);
  }

  const data = await res.json();
  const text: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  const parsed = safeParse(text);
  const verdict = normalizeVerdict(parsed?.verdict);
  const feedback = typeof parsed?.feedback === "string" ? parsed.feedback.trim() : "";
  if (!verdict || !feedback) throw new Error("채점 응답을 이해하지 못했습니다.");
  return { verdict, feedback };
}

function safeParse(text: string): { verdict?: string; feedback?: string } | null {
  try {
    return JSON.parse(text);
  } catch {
    // 코드펜스/앞뒤 잡텍스트 제거 후 첫 JSON 객체만 추출
    const m = text.match(/\{[\s\S]*\}/);
    if (m) {
      try {
        return JSON.parse(m[0]);
      } catch {
        return null;
      }
    }
    return null;
  }
}

function normalizeVerdict(v: unknown): GradeVerdict | null {
  if (v === "통과" || v === "부분통과" || v === "미흡") return v;
  return null;
}
