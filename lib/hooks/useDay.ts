"use client";

import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase/client";
import type { DayDoc } from "@/lib/types";

export function useDay(dayId: string) {
  const [day, setDay] = useState<DayDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(
      doc(getFirebaseDb(), "days", dayId),
      (snap) => {
        if (snap.exists()) {
          setDay(snap.data() as DayDoc);
          setNotFound(false);
        } else {
          setDay(null);
          setNotFound(true);
        }
        setLoading(false);
      },
      () => setLoading(false)
    );
    return () => unsub();
  }, [dayId]);

  return { day, loading, notFound };
}
