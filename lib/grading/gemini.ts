// Gemini 채점 호출 (서버 전용)
import type { GradeVerdict } from "@/lib/types";
import type { Rubric } from "@/lib/grading/rubrics";

const MODEL = "gemini-flash-latest";
const ENDPOINT = (model: string) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

export type GradeResult = { verdict: GradeVerdict; feedback: string };

function buildPrompt(rubric: Rubric, answerPseudo: string | undefined, studentPseudo: string): string {
  // 정답 파일이 없는 자유 창작 과제 — 요건 충족 여부로만, 격려 중심으로 채점
  if (!answerPseudo) {
    return `너는 중학생 블록코딩(AI 코디니) 과제를 채점하는 친절한 보조교사야.
이 과제는 정해진 정답이 없는 '자유 창작 프로젝트'야. 학생이 스스로 주제와 데이터를 골라 만들었어.
아래 [문제]와 [필수 요건]을 기준으로 [학생답안]을 평가해.

채점 원칙(매우 중요):
- 주제·데이터·구체적인 동작은 학생 자유야. 무엇을 만들었는지(주제 선택)로는 절대 감점하지 마.
- [필수 요건]을 충분히 갖추고 하나의 완결된 프로그램으로 동작하면 "통과".
- 방향은 맞는데 요건 일부가 빠졌으면 "부분통과", 요건 대부분이 빠졌거나 거의 만들다 만 상태면 "미흡".
- 반복문·조건문은 종류·문법과 상관없이 문제를 해결했으면 인정해.
- 창작 과제이니 잘한 점을 구체적으로 먼저 칭찬하고, 부족한 부분은 '무엇을 더하면 더 좋아질지' 격려하는 말투로 알려줘.
- 반드시 아래 JSON 형식으로만 답해. 다른 말 붙이지 마.

[문제] ${rubric.title}
[필수 요건]
${rubric.requirements.map((r, i) => `${i + 1}. ${r}`).join("\n")}

[학생답안]
${studentPseudo}

출력(JSON): {"verdict":"통과|부분통과|미흡","feedback":"학생에게 보여줄 1~2문장 한국어 피드백(칭찬 + 다음 단계 제안)"}`;
  }

  return `너는 중학생 블록코딩(AI 코디니) 과제를 채점하는 친절한 보조교사야.
아래 [문제]와 [핵심 요건], [모범답안]을 참고해 [학생답안]을 채점해.

채점 원칙(매우 중요):
- 문제의 핵심을 근본적으로 해결했으면 "통과"야. 변수명·순서·추가 실험은 감점하지 마.
- 예: 2제곱·3제곱을 테스트한 뒤 6제곱을 추가로 호출했어도, 핵심을 해결했으면 통과야.
- 반복문의 '종류'는 절대 감점 사유가 아니야. for 반복이든, 조건 반복(while)이든, N번 반복이든, 방식과 상관없이 반복 구조로 문제를 해결했으면 요건을 충족한 거야. 모범답안이 for를 썼더라도 학생이 다른 반복문을 썼다는 이유로 미흡을 주면 안 돼.
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
  answerPseudo: string | undefined,
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

// 모의평가(시험) 전용 — 엄격 채점. 정답과 기능적으로 완전히 같아야 정답(부분 점수 없음).
export async function gradeExamGen(
  prompt: string,
  answerPseudo: string,
  studentPseudo: string
): Promise<{ correct: boolean; feedback: string }> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY 환경변수가 없습니다.");

  const text = `너는 중학생 블록코딩(AI 코디니) 모의평가를 채점하는 채점관이야.
이건 시험이라서 부분 점수가 없어. [학생답안]이 [정답]과 '기능적으로 완전히 동일'하면 correct=true, 하나라도 다르면 correct=false 야.

채점 기준:
- 학생은 문제의 빈칸(갈색 블록)을 정해진 후보 블록으로 채워 완성해. 블록 안의 숫자·문자·기호는 문제에 맞게 바뀔 수 있어.
- 변수명, 블록 순서 같은 표현 차이는 결과가 같으면 정답으로 봐도 돼. 하지만 로직·값·출력이 조금이라도 다르면 오답이야.
- 핵심 동작(입력, 계산/조건/반복, 출력 문구와 값)이 정답과 전부 일치해야 correct=true.
- 반드시 아래 JSON 형식으로만 답해.

[문제] ${prompt || "(설명 생략)"}

[정답]
${answerPseudo}

[학생답안]
${studentPseudo}

출력(JSON): {"correct": true 또는 false, "feedback": "학생에게 보여줄 1문장 한국어 피드백(왜 맞았는지/무엇이 틀렸는지)"}`;

  const res = await fetch(ENDPOINT(MODEL), {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-goog-api-key": apiKey },
    body: JSON.stringify({
      contents: [{ parts: [{ text }] }],
      generationConfig: { responseMimeType: "application/json", temperature: 0 },
    }),
  });
  if (!res.ok) throw new Error(`Gemini 오류 ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const data = await res.json();
  const out: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  const parsed = safeParse(out) as { correct?: unknown; feedback?: unknown } | null;
  const correct = parsed?.correct === true;
  const feedback = typeof parsed?.feedback === "string" ? parsed.feedback.trim() : correct ? "정답이에요!" : "다시 확인해봐요.";
  return { correct, feedback };
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
