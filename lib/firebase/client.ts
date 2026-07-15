"use client";

import { initializeApp, getApps, getApp, type FirebaseOptions, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// 지연 초기화: 모듈을 import하는 것만으로 Firebase에 연결하지 않도록 해서
// (Next.js가 서버에서 페이지를 사전 렌더링할 때 유효한 환경변수가 없어도 빌드가 깨지지 않게 함)
// 실제 초기화는 클라이언트 컴포넌트가 브라우저에서 처음 사용할 때 이루어진다.
let _app: FirebaseApp | undefined;
let _auth: Auth | undefined;
let _db: Firestore | undefined;
let _storage: FirebaseStorage | undefined;

function getFirebaseApp(): FirebaseApp {
  if (!_app) _app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  return _app;
}

export function getFirebaseAuth(): Auth {
  if (!_auth) _auth = getAuth(getFirebaseApp());
  return _auth;
}

export function getFirebaseDb(): Firestore {
  if (!_db) _db = getFirestore(getFirebaseApp());
  return _db;
}

export function getFirebaseStorage(): FirebaseStorage {
  if (!_storage) _storage = getStorage(getFirebaseApp());
  return _storage;
}
