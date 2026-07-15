"use client";

import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase/client";
import type { ConfigGlobal } from "@/lib/types";

const DEFAULT_CONFIG: ConfigGlobal = {
  currentDay: 1,
  nameMasking: false,
  toolMenu: [],
};

export function useConfig() {
  const [config, setConfig] = useState<ConfigGlobal>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(
      doc(getFirebaseDb(), "config", "global"),
      (snap) => {
        if (snap.exists()) {
          setConfig({ ...DEFAULT_CONFIG, ...(snap.data() as ConfigGlobal) });
        }
        setLoading(false);
      },
      () => setLoading(false)
    );
    return () => unsub();
  }, []);

  return { config, loading };
}
