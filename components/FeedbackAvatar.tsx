"use client";

// AI 피드백을 전해주는 오리지널 캐릭터 '코디 요정'.
// 실제 인물을 본뜨지 않은 창작 벡터 일러스트(저작권 안전). 등급별로 표정이 달라진다.
export type AvatarMood = "celebrate" | "happy" | "cheer";

const HAIR = "#6E4A2E";
const HAIR_DK = "#5A3B23";
const SKIN = "#FFE1CD";
const CHEEK = "#FFB0A2";
const LINE = "#3A2A1E";

export function FeedbackAvatar({ mood, className = "" }: { mood: AvatarMood; className?: string }) {
  const wink = mood === "celebrate";
  const bigSmile = mood !== "happy";
  return (
    <svg viewBox="0 0 120 120" className={className} role="img" aria-label="AI 코치 캐릭터">
      {/* 뒤 머리 */}
      <path
        d="M20 66 C16 30 34 14 60 14 C86 14 104 30 100 66 L98 104 C97 114 88 116 85 108 C82 92 84 78 83 72 L37 72 C36 78 38 92 35 108 C32 116 23 114 22 104 Z"
        fill={HAIR}
      />
      {/* 옷/어깨 */}
      <path d="M30 120 C32 102 44 94 60 94 C76 94 88 102 90 120 Z" fill="#8AA06A" />
      <path d="M52 96 C55 104 65 104 68 96 L66 110 L54 110 Z" fill="#FBF3E7" />
      {/* 목 */}
      <rect x="53" y="84" width="14" height="14" rx="6" fill={SKIN} />
      {/* 귀 */}
      <ellipse cx="31" cy="64" rx="5" ry="7" fill={SKIN} />
      <ellipse cx="89" cy="64" rx="5" ry="7" fill={SKIN} />
      {/* 얼굴 */}
      <ellipse cx="60" cy="60" rx="30" ry="31" fill={SKIN} />
      {/* 앞머리 (가운데 가르마) */}
      <path
        d="M30 52 C30 28 44 22 60 22 C76 22 90 28 90 52 C84 42 74 40 68 42 C66 33 62 32 60 40 C58 32 54 33 52 42 C46 40 36 42 30 52 Z"
        fill={HAIR}
      />
      <path d="M31 54 C33 40 40 33 48 30" stroke={HAIR_DK} strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M89 54 C87 40 80 33 72 30" stroke={HAIR_DK} strokeWidth="1.5" fill="none" strokeLinecap="round" />

      {/* 눈썹 */}
      <path d="M42 52 Q48 49 54 51" stroke={LINE} strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <path d="M66 51 Q72 49 78 52" stroke={LINE} strokeWidth="1.6" fill="none" strokeLinecap="round" />

      {/* 눈 */}
      {wink ? (
        <path d="M43 63 Q48 58 53 63" stroke={LINE} strokeWidth="2.4" fill="none" strokeLinecap="round" />
      ) : (
        <g>
          <ellipse cx="48" cy="62" rx="5.4" ry="6.6" fill="#fff" />
          <circle cx="48.5" cy="62.5" r="4.1" fill={LINE} />
          <circle cx="50" cy="61" r="1.3" fill="#fff" />
        </g>
      )}
      <g>
        <ellipse cx="72" cy="62" rx="5.4" ry="6.6" fill="#fff" />
        <circle cx="71.5" cy="62.5" r="4.1" fill={LINE} />
        <circle cx="73" cy="61" r="1.3" fill="#fff" />
      </g>

      {/* 볼터치 */}
      <ellipse cx="42" cy="72" rx="5" ry="3.2" fill={CHEEK} opacity="0.7" />
      <ellipse cx="78" cy="72" rx="5" ry="3.2" fill={CHEEK} opacity="0.7" />

      {/* 입 */}
      {bigSmile ? (
        <path d="M50 76 Q60 90 70 76 Q60 82 50 76 Z" fill="#B24A63" />
      ) : (
        <path d="M53 78 Q60 85 67 78" stroke="#B24A63" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      )}

      {/* 반짝이 (통과일 때) */}
      {mood === "celebrate" && (
        <g fill="#F5C542">
          <path d="M100 26 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2 Z" />
          <path d="M16 40 l1.5 3.5 3.5 1.5 -3.5 1.5 -1.5 3.5 -1.5 -3.5 -3.5 -1.5 3.5 -1.5 Z" />
        </g>
      )}
    </svg>
  );
}
