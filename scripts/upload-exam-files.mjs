// 모의평가 파일 업로드(범용).
//  - 문제/활용데이터는 Storage problems/ 에 attachment(강제 다운로드)로 올린다.
//  - 정답 .gen 은 answers/ 에만 올린다(서버 전용, 학생 노출 금지).
//
// 사용법:
//   node scripts/upload-exam-files.mjs <manifest.json>
//
// manifest.json 형식:
//   {
//     "baseDir": "/abs/path/to/files",      // 생략 시 manifest 파일 폴더 기준
//     "problems": [                          // problems/<dest> 로 업로드
//       { "local": "exam1-q5.gen", "dest": "exam1-q5.gen" },
//       { "local": "음식_칼로리.xlsx", "dest": "음식_칼로리.xlsx" }
//     ],
//     "answers": [                           // answers/<dest> 로 업로드(서버 전용)
//       { "local": "exam1-q5-answer.gen", "dest": "exam1-q5-answer.gen" }
//     ]
//   }
import { readFileSync } from "node:fs";
import { dirname, isAbsolute, join } from "node:path";
import { adminStorage } from "../lib/firebase/admin.ts";

const manifestPath = process.argv[2];
if (!manifestPath) {
  console.error("사용법: node scripts/upload-exam-files.mjs <manifest.json>");
  process.exit(1);
}

const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
const baseDir = manifest.baseDir || dirname(manifestPath);
const resolve = (p) => (isAbsolute(p) ? p : join(baseDir, p));

// 한글 등 비ASCII 파일명도 안전하게 내려받도록 RFC 5987 filename* 을 함께 준다.
const disposition = (name) =>
  `attachment; filename="download"; filename*=UTF-8''${encodeURIComponent(name)}`;

const bucket = adminStorage().bucket();

async function put(localPath, destPath, dispositionName) {
  await bucket.file(destPath).save(readFileSync(localPath), {
    resumable: false,
    metadata: {
      contentType: "application/octet-stream",
      contentDisposition: disposition(dispositionName),
      cacheControl: "no-cache, max-age=0",
    },
  });
  console.log("uploaded", destPath);
}

for (const item of manifest.problems ?? []) {
  await put(resolve(item.local), `problems/${item.dest}`, item.dest);
}
for (const item of manifest.answers ?? []) {
  await put(resolve(item.local), `answers/${item.dest}`, item.dest);
}

console.log("done");
process.exit(0);
