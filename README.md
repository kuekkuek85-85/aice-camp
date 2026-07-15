# AICE 자격증 캠프 (장평중학교)

2026 여름 AICE Future 1급 방과후 캠프(5일, 23명)를 위한 학습 플랫폼입니다.

- **프론트엔드**: Next.js(App Router) + React + Tailwind CSS
- **백엔드**: Firebase (Firestore + Storage + Anonymous Auth)
- **배포**: Vercel

## 1. 로그인 방식 안내

학생은 비밀번호 없이 **5자리 학번 + 이름**으로 입장합니다. 사전 명단(`roster`)에는
**학년과 이름만** 등록해두면 되고(정확한 학번을 몰라도 됨), 서버가 학번 첫 자리(학년)와
이름을 명단과 대조한 뒤 **첫 로그인 시 그 학번을 명단에 자동 연결(바인딩)** 합니다.
이후에는 같은 학번으로만 입장할 수 있어 오입력·도용을 막습니다. (학생이 학번을 잘못
입력해 바인딩됐다면, 교사가 Firestore 콘솔에서 해당 `roster` 문서의 `studentId` 필드를
지우면 다시 첫 로그인이 가능합니다.)

내부적으로는 학번을 uid로 하는 Firebase 커스텀 토큰을 발급해 Firestore 보안 규칙이
"본인 데이터만 쓰기"를 검증합니다. 교사는 PIN으로 로그인하며 `teacher: true` 클레임이
담긴 토큰을 받습니다.

## 2. 초기 설정

### 2.1 Firebase 프로젝트 준비

1. [Firebase 콘솔](https://console.firebase.google.com)에서 프로젝트를 생성합니다.
2. **Authentication** → 로그인 방법에서 **익명(Anonymous)** 을 활성화합니다.
3. **Firestore Database** 를 생성합니다 (프로덕션 모드).
4. **Storage** 를 생성합니다.
5. 프로젝트 설정 → 일반 → "내 앱"에서 웹 앱을 추가해 클라이언트 설정값을 받습니다.
6. 프로젝트 설정 → 서비스 계정 → "새 비공개 키 생성"으로 관리자(Admin) 자격 증명을
   받습니다 (JSON 파일의 `project_id`, `client_email`, `private_key`).

### 2.2 환경변수

`.env.example` 을 `.env.local` 로 복사하고 위에서 받은 값을 채웁니다.

```bash
cp .env.example .env.local
```

`TEACHER_PIN` 은 교사만 아는 값으로 직접 정합니다.

### 2.3 보안 규칙 배포

[Firebase CLI](https://firebase.google.com/docs/cli) 설치 후:

```bash
firebase login
firebase use --add   # 프로젝트 선택
firebase deploy --only firestore:rules,storage:rules
```

### 2.4 초기 데이터 시딩

`scripts/seed.mjs` 의 `ROSTER` 배열을 **실제 캠프 명단 23명**으로 교체한 뒤 실행합니다.
(예시 데이터가 들어있으니 반드시 교체하세요.)

```bash
node --env-file=.env.local scripts/seed.mjs
```

이 스크립트는 다음을 생성합니다.

- `roster/*` — 학생 명단
- `config/global` — 전역 설정(오늘 일차, 도구 메뉴판 등)
- `days/1` ~ `days/5` — 일차별 단계 콘텐츠(1일차 완성, 2일차 함수 뼈대, 3~5일차 자리표시자)
- `problems/*` — 함수 문제 힌트 메타데이터

### 2.5 .gen 파일 업로드

문제/정답 `.gen` 파일은 Firebase 콘솔의 Storage 화면에서 직접 업로드하세요.

- 문제 파일 → `problems/problem-1.gen` ~ `problems/problem-4.gen` (학생 공개 다운로드)
- 정답 파일 → `answers/problem-1.gen` ~ `answers/problem-4.gen` (교사만 `/api/answer-download` 로 다운로드)

### 2.6 실행

```bash
npm install
npm run dev
```

`http://localhost:3000` (학생), `http://localhost:3000/teacher` (교사)

### 2.7 Vercel 배포

Vercel 프로젝트를 생성하고 `.env.local` 의 모든 값을 Vercel 환경변수로 등록한 뒤 배포합니다.
`FIREBASE_ADMIN_PRIVATE_KEY` 는 개행문자(`\n`)가 포함되므로, Vercel 환경변수 입력 시
따옴표로 감싼 원본 값을 그대로 붙여넣으면 됩니다.

## 3. 데이터 모델

`days/{dayId}` 문서의 `steps` 배열만 수정하면 2~4일차 콘텐츠도 1일차와 동일한 구조로
동작합니다. 자세한 필드 설명은 `lib/types.ts` 를 참고하세요.

```
roster/{studentId}
students/{studentId}
progress/{studentId}_{dayId}
publicProgress/{studentId}        // 동료 현황판 공개용 (이름·현재 단계·막혔어요만)
days/{dayId}
config/global
problems/{problemId}
```

Storage 구조:

```
problems/          // 문제 .gen (공개 읽기)
answers/           // 정답 .gen (서버 라우트 전용)
submissions/{studentId}/{dayId}/{stepId}.gen
```

## 4. 캠프 종료 후 데이터 삭제 절차

학번과 이름은 개인정보에 해당하므로, 캠프가 끝난 뒤 아래 절차로 데이터를 삭제하세요.

1. Firebase 콘솔 → Firestore Database 에서 다음 컬렉션을 전체 삭제합니다.
   - `roster`, `students`, `progress`, `publicProgress`
   - (`days`, `config`, `problems` 는 콘텐츠 데이터이므로 다음 캠프에 재사용 가능 — 필요 시 유지)
2. Firebase 콘솔 → Storage 에서 `submissions/` 폴더 전체를 삭제합니다.
3. Firebase 콘솔 → Authentication 에서 캠프 기간 중 생성된 사용자(학번 uid, `teacher`)를
   전체 삭제합니다.
4. `.env.local` 및 Vercel에 등록한 `TEACHER_PIN` 을 변경하거나 프로젝트를 비활성화합니다.

## 5. 개발 스크립트

```bash
npm run dev      # 개발 서버
npm run build    # 프로덕션 빌드
npm run lint     # 린트
```
