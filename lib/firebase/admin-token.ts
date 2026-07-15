// firebase-admin/auth 대체 유틸.
//
// firebase-admin의 auth 모듈은 jwks-rsa → jose(ESM 전용)를 끌어와서
// require(ESM)을 지원하지 않는 서버리스 런타임에서 로드 자체가 실패한다.
// 커스텀 토큰 발급과 ID 토큰 검증은 표준 RS256 JWT라서
// Node 내장 crypto만으로 처리한다. (Firestore/Storage 관리자 모듈은 무관 — 그대로 사용)

import { createSign, createVerify, X509Certificate } from "node:crypto";

const CUSTOM_TOKEN_AUD =
  "https://identitytoolkit.googleapis.com/google.identity.identitytoolkit.v1.IdentityToolkit";
const ID_TOKEN_CERTS_URL =
  "https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com";

function b64url(input: Buffer | string): string {
  return Buffer.from(input).toString("base64url");
}

function getServiceAccount() {
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/^"|"$/g, "").replace(
    /\\n/g,
    "\n"
  );
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  if (!clientEmail || !privateKey || !projectId) {
    throw new Error(
      "FIREBASE_ADMIN_PROJECT_ID / FIREBASE_ADMIN_CLIENT_EMAIL / FIREBASE_ADMIN_PRIVATE_KEY 환경변수가 필요합니다."
    );
  }
  return { clientEmail, privateKey, projectId };
}

/** Firebase 커스텀 토큰 발급 (adminAuth().createCustomToken 대체) */
export function createCustomToken(uid: string, claims?: Record<string, unknown>): string {
  const { clientEmail, privateKey } = getServiceAccount();
  const now = Math.floor(Date.now() / 1000);

  const header = { alg: "RS256", typ: "JWT" };
  const payload: Record<string, unknown> = {
    iss: clientEmail,
    sub: clientEmail,
    aud: CUSTOM_TOKEN_AUD,
    iat: now,
    exp: now + 3600,
    uid,
  };
  if (claims && Object.keys(claims).length > 0) payload.claims = claims;

  const signingInput = `${b64url(JSON.stringify(header))}.${b64url(JSON.stringify(payload))}`;
  const signer = createSign("RSA-SHA256");
  signer.update(signingInput);
  const signature = signer.sign(privateKey).toString("base64url");
  return `${signingInput}.${signature}`;
}

// Google 공개 인증서 캐시 (서버리스 웜 인스턴스 동안 재사용)
let certsCache: { certs: Record<string, string>; fetchedAt: number } | null = null;

async function getGooglePublicCerts(): Promise<Record<string, string>> {
  if (certsCache && Date.now() - certsCache.fetchedAt < 30 * 60 * 1000) {
    return certsCache.certs;
  }
  const res = await fetch(ID_TOKEN_CERTS_URL);
  if (!res.ok) throw new Error(`Google 공개키를 가져오지 못했습니다 (${res.status})`);
  const certs = (await res.json()) as Record<string, string>;
  certsCache = { certs, fetchedAt: Date.now() };
  return certs;
}

export type VerifiedIdToken = {
  uid: string;
  claims: Record<string, unknown>;
};

/** Firebase ID 토큰 검증 (adminAuth().verifyIdToken 대체) */
export async function verifyIdToken(idToken: string): Promise<VerifiedIdToken> {
  const { projectId } = getServiceAccount();
  const parts = idToken.split(".");
  if (parts.length !== 3) throw new Error("토큰 형식이 올바르지 않습니다.");

  const header = JSON.parse(Buffer.from(parts[0], "base64url").toString());
  const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString());

  if (header.alg !== "RS256" || !header.kid) throw new Error("지원하지 않는 토큰입니다.");

  const certs = await getGooglePublicCerts();
  const certPem = certs[header.kid];
  if (!certPem) throw new Error("서명 키를 찾을 수 없습니다.");

  const verifier = createVerify("RSA-SHA256");
  verifier.update(`${parts[0]}.${parts[1]}`);
  const valid = verifier.verify(
    new X509Certificate(certPem).publicKey,
    Buffer.from(parts[2], "base64url")
  );
  if (!valid) throw new Error("토큰 서명이 유효하지 않습니다.");

  const now = Math.floor(Date.now() / 1000);
  if (payload.exp <= now) throw new Error("토큰이 만료되었습니다.");
  if (payload.aud !== projectId) throw new Error("토큰 대상(aud)이 일치하지 않습니다.");
  if (payload.iss !== `https://securetoken.google.com/${projectId}`) {
    throw new Error("토큰 발급자(iss)가 일치하지 않습니다.");
  }
  if (!payload.sub) throw new Error("토큰에 사용자 정보가 없습니다.");

  return { uid: payload.sub as string, claims: payload as Record<string, unknown> };
}
