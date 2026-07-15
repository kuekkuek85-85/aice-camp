"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase/client";
import type { PublicProgressDoc } from "@/lib/types";

export function usePublicProgressList() {
  const [list, setList] = useState<PublicProgressDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(getFirebaseDb(), "publicProgress"),
      (snap) => {
        setList(snap.docs.map((d) => d.data() as PublicProgressDoc));
        setLoading(false);
      },
      () => setLoading(false)
    );
    return () => unsub();
  }, []);

  return { list, loading };
}
