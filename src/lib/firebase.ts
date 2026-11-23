import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getAuth, 
  setPersistence, 
  browserLocalPersistence 
} from "firebase/auth";
import { 
  getFirestore, 
  enableIndexedDbPersistence 
} from "firebase/firestore";

// Firebase credentials from firebase_sdk.md
export const firebaseConfig = {
  apiKey: "AIzaSyDklaO9qNX7Rx1LkmVWfMlRd1nk0-FxrBI",
  authDomain: "vr-electric-crm.firebaseapp.com",
  projectId: "vr-electric-crm",
  storageBucket: "vr-electric-crm.firebasestorage.app",
  messagingSenderId: "1033378129487",
  appId: "1:1033378129487:web:7a7ce62fdbbbb0ebf32c3a"
};

// Initialize Primary Firebase App
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Explicitly enforce permanent browser session persistence
setPersistence(auth, browserLocalPersistence).catch((err) => {
  console.warn("Auth persistence notice:", err);
});

// Offline persistence for Firestore
try {
  enableIndexedDbPersistence(db).catch(() => {});
} catch {
  // Persistence already enabled or unsupported
}

export default app;
