// 모의평가 1차 4번(차량번호판 OCR) 파일 업로드
//  - problems/exam1-q4.gen        : 문제 파일(공개 다운로드, attachment)
//  - problems/차량번호판1.png       : 활용데이터 1234 (attachment)
//  - problems/차량번호판2.png       : 활용데이터 1004 (attachment)
//  - answers/exam1-q4-answer.gen  : 정답(서버 전용)
// 사용법: node scripts/upload-exam1-q4.mjs <파일들이 있는 폴더>
//   폴더 안에 exam1-q4.gen, exam1-q4-answer.gen, plate1.png(1234), plate2.png(1004) 준비
import { readFileSync } from "node:fs";
import { adminStorage } from "../lib/firebase/admin.ts";

const SP = process.argv[2];
if (!SP) {
  console.error("사용법: node scripts/upload-exam1-q4.mjs <파일 폴더>");
  process.exit(1);
}

const bucket = adminStorage().bucket();

async function put(localPath, destPath, contentType, disposition) {
  const file = bucket.file(destPath);
  await file.save(readFileSync(localPath), {
    resumable: false,
    metadata: {
      contentType,
      contentDisposition: disposition,
      cacheControl: "no-cache, max-age=0",
    },
  });
  console.log("uploaded", destPath);
}

await put(
  `${SP}/exam1-q4.gen`,
  "problems/exam1-q4.gen",
  "application/octet-stream",
  'attachment; filename="exam1-q4.gen"'
);
await put(
  `${SP}/plate1.png`,
  "problems/차량번호판1.png",
  "application/octet-stream",
  "attachment; filename*=UTF-8''%EC%B0%A8%EB%9F%89%EB%B2%88%ED%98%B8%ED%8C%901.png"
);
await put(
  `${SP}/plate2.png`,
  "problems/차량번호판2.png",
  "application/octet-stream",
  "attachment; filename*=UTF-8''%EC%B0%A8%EB%9F%89%EB%B2%88%ED%98%B8%ED%8C%902.png"
);
await put(
  `${SP}/exam1-q4-answer.gen`,
  "answers/exam1-q4-answer.gen",
  "application/octet-stream",
  'attachment; filename="exam1-q4-answer.gen"'
);

console.log("done");
process.exit(0);
