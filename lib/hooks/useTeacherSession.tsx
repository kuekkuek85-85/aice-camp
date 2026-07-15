"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { onAuthStateChanged, signInWithCustomToken, signOut } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase/client";

type Status = "loading" | "guest" | "ready";

type TeacherSessionValue = {
  status: Status;
  error: string | null;
  login: (pin: string) => Promise<boolean>;
  logout: () => void;
  getIdToken: () => Promise<string | null>;
};

const TeacherSessionContext = createContext<TeacherSessionValue | null>(null);

export function TeacherSessionProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Status>("loading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(getFirebaseAuth(), async (user) => {
      if (!user) {
        setStatus("guest");
        return;
      }
      const result = await user.getIdTokenResult();
      setStatus(result.claims.teacher === true ? "ready" : "guest");
    });
    return () => unsub();
  }, []);

  const login = useCallback(async (pin: string) => {
    setError(null);
    try {
      const res = await fetch("/api/teacher-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "PIN 확인에 실패했습니다.");
      await signInWithCustomToken(getFirebaseAuth(), data.token);
      setStatus("ready");
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : "PIN 확인에 실패했습니다.");
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    signOut(getFirebaseAuth()).catch(() => {});
    setStatus("guest");
  }, []);

  const getIdToken = useCallback(async () => {
    const current = getFirebaseAuth().currentUser;
    if (!current) return null;
    return current.getIdToken();
  }, []);

  const value = useMemo(
    () => ({ status, error, login, logout, getIdToken }),
    [status, error, login, logout, getIdToken]
  );

  return <TeacherSessionContext.Provider value={value}>{children}</TeacherSessionContext.Provider>;
}

export function useTeacherSession() {
  const ctx = useContext(TeacherSessionContext);
  if (!ctx) throw new Error("useTeacherSession은 TeacherSessionProvider 안에서 사용하세요.");
  return ctx;
}
