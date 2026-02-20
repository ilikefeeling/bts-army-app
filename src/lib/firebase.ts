import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, initializeFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getFunctions } from "firebase/functions";

const firebaseConfig = {
  apiKey: (process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyChQ31VZtgTwhsk4_QEBKRt3Y25ugzcEMw").trim(),
  authDomain: (process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "bts-army-a9935.firebaseapp.com").trim(),
  projectId: (process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "bts-army-a9935").trim(),
  storageBucket: (process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "bts-army-a9935.firebasestorage.app").trim(),
  messagingSenderId: (process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "907376520978").trim(),
  appId: (process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:907376520978:web:1caf6e6b01069fe9a74dcb").trim(),
};

// Initialize Firebase (Singleton pattern)
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// In some restricted environments (like certain mobile browsers or behind firewalls), 
// WebSockets might be blocked. Force long-polling as a fallback.
const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
});

const auth = getAuth(app);
const functions = getFunctions(app);

export { app, db, auth, functions };
