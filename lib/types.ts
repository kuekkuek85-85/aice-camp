// 데이터 모델 타입 — PRD 4번 섹션 기준

export type SubmitType = "none" | "check" | "link" | "file" | "linkOrFile";

export type StepLink = {
  label: string;
  url: string;
};

export type StepDef = {
  stepId: string;
  order: number;
  title: string;
  desc: string;
  resourceUrl?: string;
  links?: StepLink[]; // 순서대로 따라가는 실습 링크 여러 개
  submitType: SubmitType;
  parallel?: boolean; // 이전 단계 완료 없이도 병행 가능
  deferrable?: boolean; // 나중에 완료 허용 (AICE 가입 등)
  hints?: [string, string, string];
  micRequired?: boolean;
  problemFileName?: string; // Storage problems/{problemFileName} 공개 다운로드
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

export type StepProgress = {
  status: StepStatus;
  completedAt?: number;
  submission?: Submission;
  hintOpened?: number;
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
