// 교사 연수(시연) 트랙 설정 — 서버 전용.
// Firestore `workshopSettings/main` 은 보안 규칙에 match 가 없어 클라이언트 접근이 전면 차단되고(기본 거부),
// 관리자 SDK(서버)로만 읽고 쓴다. 교사는 /api/workshop-settings 를 통해서만 바꾼다.
import { adminDb } from "@/lib/firebase/admin";

export type WorkshopSettings = { enabled: boolean; code: string };

const DOC = "workshopSettings/main";
const CACHE_MS = 10_000;
let cache: { value: WorkshopSettings; at: number } | null = null;

export const isDemoUid = (uid: string) => uid.startsWith("demo-");

export async function getWorkshopSettings(fresh = false): Promise<WorkshopSettings> {
  if (!fresh && cache && Date.now() - cache.at < CACHE_MS) return cache.value;
  const snap = await adminDb().doc(DOC).get();
  const d = snap.data() ?? {};
  // 문서가 없으면 '닫힘'이 기본값 — 연수 코드 없이 누구나 입장하는 일이 없도록.
  const value: WorkshopSettings = { enabled: d.enabled === true, code: typeof d.code === "string" ? d.code : "" };
  cache = { value, at: Date.now() };
  return value;
}

export async function saveWorkshopSettings(value: WorkshopSettings) {
  await adminDb().doc(DOC).set({ ...value, updatedAt: Date.now() });
  cache = { value, at: Date.now() };
}

export const normalizeCode = (s: string) => s.replace(/\s+/g, "").toUpperCase();

/** 연수 참가자(demo-*) 가 AI 채점 등 서버 기능을 써도 되는지 — 연수가 닫히면 이미 로그인한 참가자도 차단 */
export async function demoAllowed(uid: string): Promise<boolean> {
  if (!isDemoUid(uid)) return true;
  return (await getWorkshopSettings()).enabled;
}
