import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, initializeFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getFunctions } from "firebase/functions";

const firebaseConfig = {
  apiKey: (process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyB50jNW2XdEBBxnU86RW0BJWF7FBNy8hdw").trim(),
  authDomain: (process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "bts-army-number.firebaseapp.com").trim(),
  projectId: (process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "bts-army-number").trim(),
  storageBucket: (process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "bts-army-number.firebasestorage.app").trim(),
  messagingSenderId: (process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "124686840757").trim(),
  appId: (process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:124686840757:web:33e683238f7587359ddffc").trim(),
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
