import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAnalytics, Analytics } from "firebase/analytics";
import { Auth, getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBZ3jiAeOyQDi9GBgIePFP8pPU035oh6ag",
  authDomain: "pandora-43736.firebaseapp.com",
  projectId: "pandora-43736",
  storageBucket: "pandora-43736.firebasestorage.app",
  messagingSenderId: "212691894027",
  appId: "1:212691894027:web:65917e617ed57257afac0e",
  measurementId: "G-07TTGE58C4"
};

let app: FirebaseApp;
let auth: Auth;
let analytics: Analytics | null = null;

if (typeof window !== "undefined" && !getApps().length) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  if ("measurementId" in firebaseConfig) {
    analytics = getAnalytics(app);
  }
} else {
  app = getApp();
  auth = getAuth(app);
  if ("measurementId" in firebaseConfig) {
    analytics = getAnalytics(app);
  }
}

export { app, auth, analytics };
