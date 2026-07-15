"use client";

import { useEffect, useState } from "react";
import { ref, listAll, getDownloadURL } from "firebase/storage";
import { getFirebaseStorage } from "@/lib/firebase/client";

type MaterialFile = { name: string; url: string };

/** 교사가 Storage 폴더에 올린 자료(사진 등)를 자동으로 나열한다. 업로드만 하면 코드 수정 없이 표시됨. */
export function MaterialsList({ path }: { path: string }) {
  const [files, setFiles] = useState<MaterialFile[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const result = await listAll(ref(getFirebaseStorage(), path));
        const items = await Promise.all(
          result.items.map(async (item) => ({
            name: item.name,
            url: await getDownloadURL(item),
          }))
        );
        if (!cancelled) setFiles(items.sort((a, b) => a.name.localeCompare(b.name, "ko")));
      } catch {
        if (!cancelled) setFiles([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [path]);

  if (files === null) return null; // 로딩 중엔 아무것도 표시하지 않음

  return (
    <div className="mt-3 rounded-lg bg-block-pink p-3">
      <p className="font-mono text-[11px] uppercase tracking-widest text-ink">📚 오늘의 이론 자료</p>
      {files.length === 0 ? (
        <p className="mt-1 text-xs text-ink">선생님이 자료를 올리면 여기에 나타나요. 조금만 기다려주세요!</p>
      ) : (
        <ul className="mt-2 space-y-1">
          {files.map((file) => (
            <li key={file.name}>
              <a
                href={file.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-ink hover:underline"
              >
                📥 {file.name}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
