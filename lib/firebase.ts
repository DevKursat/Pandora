import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAnalytics, Analytics } from "firebase/analytics";
import { Auth, getAuth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBZ3jiAeOyQDi9GBgIePFP8pPU035oh6ag",
  authDomain: "pandora-43736.firebaseapp.com",
  projectId: "pandora-43736",
  storageBucket: "pandora-43736.firebasestorage.app",
  messagingSenderId: "212691894027",
  appId: "1:212691894027:web:65917e617ed57257afac0e",
  measurementId: "G-07TTGE58C4"
};

// Initialize Firebase
const app: FirebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);
let analytics: Analytics | null = null;

// Initialize Analytics only on the client side
if (typeof window !== 'undefined') {
  if ("measurementId" in firebaseConfig) {
    analytics = getAnalytics(app);
  }
}

export { app, auth, db, analytics };
