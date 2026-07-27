"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { onAuthStateChanged, signInWithCustomToken, signOut } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase/client";
import { LOCAL_STORAGE_KEY, type LocalSession } from "@/lib/types";

type Status = "loading" | "guest" | "ready";

type StudentSessionValue = {
  status: Status;
  session: LocalSession | null;
  error: string | null;
  login: (studentId: string, name: string) => Promise<boolean>;
  loginDemo: (school: string, name: string) => Promise<boolean>;
  logout: () => void;
};

const StudentSessionContext = createContext<StudentSessionValue | null>(null);

function readLocalSession(): LocalSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed?.studentId && parsed?.name) return parsed as LocalSession;
    return null;
  } catch {
    return null;
  }
}

async function callLogin(studentId: string, name: string) {
  const res = await fetch("/api/student-login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ studentId, name }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error ?? "로그인에 실패했습니다.");
  }
  return data as { token: string; studentId: string; name: string; grade: number; hasLevel2: boolean };
}

async function callDemoLogin(school: string, name: string) {
  const res = await fetch("/api/demo-login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ school, name }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error ?? "입장에 실패했습니다.");
  }
  return data as { token: string; studentId: string; name: string; school: string };
}

export function StudentSessionProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Status>("loading");
  const [session, setSession] = useState<LocalSession | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const local = readLocalSession();
    const auth = getFirebaseAuth();

    const unsub = onAuthStateChanged(auth, async (user) => {
      // 교사로 로그인된 상태면 학생 세션 복구가 끼어들지 않는다
      // (같은 브라우저에 학생 localStorage가 남아 있어도 교사 인증을 덮어쓰지 않도록)
      if (user) {
        const tokenResult = await user.getIdTokenResult();
        if (tokenResult.claims.teacher === true) {
          setSession(null);
          setStatus("guest");
          return;
        }
      }

      if (user && local && user.uid === local.studentId) {
        setSession(local);
        setStatus("ready");
        return;
      }

      if (local) {
        try {
          let restored: LocalSession;
          if (local.role === "demo" && local.school) {
            const data = await callDemoLogin(local.school, local.name);
            await signInWithCustomToken(auth, data.token);
            restored = {
              studentId: data.studentId ?? local.studentId,
              name: data.name,
              grade: 0,
              role: "demo",
              school: data.school ?? local.school,
            };
          } else {
            const data = await callLogin(local.studentId, local.name);
            await signInWithCustomToken(auth, data.token);
            restored = {
              studentId: data.studentId ?? local.studentId,
              name: data.name,
              grade: data.grade,
              role: "student",
            };
          }
          window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(restored));
          setSession(restored);
          setStatus("ready");
          return;
        } catch {
          window.localStorage.removeItem(LOCAL_STORAGE_KEY);
        }
      }

      setSession(null);
      setStatus("guest");
    });

    return () => unsub();
  }, []);

  const login = useCallback(async (studentId: string, name: string) => {
    setError(null);
    try {
      const data = await callLogin(studentId, name);
      await signInWithCustomToken(getFirebaseAuth(), data.token);
      const newSession: LocalSession = {
        studentId: data.studentId ?? studentId,
        name: data.name,
        grade: data.grade,
        role: "student",
      };
      window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newSession));
      setSession(newSession);
      setStatus("ready");
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : "로그인에 실패했습니다.");
      return false;
    }
  }, []);

  const loginDemo = useCallback(async (school: string, name: string) => {
    setError(null);
    try {
      const data = await callDemoLogin(school, name);
      await signInWithCustomToken(getFirebaseAuth(), data.token);
      const newSession: LocalSession = {
        studentId: data.studentId,
        name: data.name,
        grade: 0,
        role: "demo",
        school: data.school,
      };
      window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newSession));
      setSession(newSession);
      setStatus("ready");
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : "입장에 실패했습니다.");
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    window.localStorage.removeItem(LOCAL_STORAGE_KEY);
    signOut(getFirebaseAuth()).catch(() => {});
    setSession(null);
    setStatus("guest");
  }, []);

  const value = useMemo(
    () => ({ status, session, error, login, loginDemo, logout }),
    [status, session, error, login, loginDemo, logout]
  );

  return (
    <StudentSessionContext.Provider value={value}>{children}</StudentSessionContext.Provider>
  );
}

export function useStudentSession() {
  const ctx = useContext(StudentSessionContext);
  if (!ctx) throw new Error("useStudentSession은 StudentSessionProvider 안에서 사용하세요.");
  return ctx;
}
