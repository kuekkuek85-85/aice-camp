// 데이터 모델 타입 — PRD 4번 섹션 기준

export type SubmitType = "none" | "check" | "link" | "file" | "linkOrFile" | "fileOrCheck";
// fileOrCheck: .gen 업로드는 선택 — 업로드 없이 "완료했어요" 버튼만으로도 완료 가능

export type StepLink = {
  label: string;
  url: string;
};

export type LinksType = "ordered" | "choice"; // ordered: 순서대로 진행, choice: 이 중 하나 선택

export type StepDef = {
  stepId: string;
  order: number;
  title: string;
  desc: string;
  resourceUrl?: string;
  links?: StepLink[]; // 실습/참고 링크 여러 개
  linksType?: LinksType; // 기본 "ordered"
  linksLabel?: string; // 링크 목록 위 안내 문구 (미지정 시 linksType별 기본 문구)
  submitType: SubmitType;
  parallel?: boolean; // 이전 단계 완료 없이도 병행 가능
  deferrable?: boolean; // 나중에 완료 허용 (AICE 가입 등)
  hints?: [string, string, string];
  micRequired?: boolean;
  problemFileName?: string; // Storage problems/{problemFileName} 공개 다운로드
  materialsPath?: string; // Storage 폴더(예: materials/day1) — 교사가 올린 자료를 자동 목록화
};

export type TimelineBlock = {
  period: string; // "1교시"
  time: string; // "45'"
  activity: string;
  steps: string[]; // 관련 stepId
};

export type DayDoc = {
  dayId: string; // "1", "2", ...
  title: string;
  goal: string;
  timeline: TimelineBlock[];
  steps: StepDef[];
};

export type StepStatus = "todo" | "done" | "deferred";

export type Submission = {
  type: "link" | "file";
  url: string;
  fileName?: string;
  submittedAt: number; // epoch ms
};

export type GradeVerdict = "통과" | "부분통과" | "미흡";

export type StepGrade = {
  verdict: GradeVerdict;
  feedback: string;
  gradedAt: number;
  fileName?: string; // 어떤 제출본을 채점했는지
};

export type StepProgress = {
  status: StepStatus;
  completedAt?: number;
  submission?: Submission;
  hintOpened?: number;
  grade?: StepGrade; // AI 자동 채점 결과 (서버가 기록)
};

export type ProgressDoc = {
  studentId: string;
  dayId: string;
  steps: Record<string, StepProgress>;
  dayStampAt?: number | null;
};

export type HelpFlag = {
  active: boolean;
  at?: number;
  dayId?: string;
  stepId?: string;
};

export type StudentDoc = {
  studentId: string;
  name: string;
  grade: number;
  authUid?: string;
  firstLoginAt?: number;
  lastSeenAt?: number;
  helpFlag?: HelpFlag;
};

export type RosterEntry = {
  rosterId?: string; // Firestore 문서 ID (예: g1-김재우)
  name: string;
  grade: number;
  hasLevel2?: boolean;
  studentId?: string; // 첫 로그인 시 바인딩되는 실제 5자리 학번
  boundAt?: number;
};

export type PublicProgressDoc = {
  studentId: string;
  name: string;
  grade: number;
  currentDayId: string;
  currentStepOrder: number;
  currentStepTitle: string;
  helpFlag?: HelpFlag;
  updatedAt: number;
};

export type ToolMenuItem = {
  name: string;
  desc: string;
  url: string;
};

export type ConfigGlobal = {
  currentDay: number;
  nameMasking: boolean;
  toolMenu: ToolMenuItem[];
};

export type ProblemDoc = {
  problemId: string;
  title: string;
  order: number;
  fileName: string; // Storage 내 problems/{fileName}, answers/{fileName}
  hints: [string, string, string];
};

export const LOCAL_STORAGE_KEY = "aice-camp-student";

export type LocalSession = {
  studentId: string;
  name: string;
  grade: number;
};
