"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase/client";
import type {
  ProgressDoc,
  RosterEntry,
  StudentDoc,
  ProblemDoc,
  ExamResultDoc,
  DemoParticipant,
} from "@/lib/types";

export function useTeacherData() {
  const [roster, setRoster] = useState<RosterEntry[]>([]);
  const [students, setStudents] = useState<Record<string, StudentDoc>>({});
  const [progress, setProgress] = useState<ProgressDoc[]>([]);
  const [problems, setProblems] = useState<ProblemDoc[]>([]);
  const [examResults, setExamResults] = useState<ExamResultDoc[]>([]);
  const [demoParticipants, setDemoParticipants] = useState<DemoParticipant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const db = getFirebaseDb();
    const unsubs = [
      onSnapshot(collection(db, "roster"), (snap) => {
        setRoster(snap.docs.map((d) => ({ rosterId: d.id, ...(d.data() as RosterEntry) })));
      }),
      onSnapshot(collection(db, "students"), (snap) => {
        const map: Record<string, StudentDoc> = {};
        snap.docs.forEach((d) => {
          map[d.id] = d.data() as StudentDoc;
        });
        setStudents(map);
      }),
      onSnapshot(collection(db, "progress"), (snap) => {
        setProgress(snap.docs.map((d) => d.data() as ProgressDoc));
        setLoading(false);
      }),
      onSnapshot(collection(db, "problems"), (snap) => {
        setProblems(snap.docs.map((d) => d.data() as ProblemDoc).sort((a, b) => a.order - b.order));
      }),
      onSnapshot(collection(db, "examResults"), (snap) => {
        setExamResults(snap.docs.map((d) => d.data() as ExamResultDoc));
      }),
      onSnapshot(collection(db, "demoParticipants"), (snap) => {
        setDemoParticipants(snap.docs.map((d) => d.data() as DemoParticipant));
      }),
    ];
    return () => unsubs.forEach((u) => u());
  }, []);

  return { roster, students, progress, problems, examResults, demoParticipants, loading };
}
