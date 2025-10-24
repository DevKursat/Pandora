import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAnalytics, Analytics } from "firebase/analytics";
import { Auth, getAuth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

// Firebase yapılandırması artık ortam değişkenlerinden okunuyor.
// Bu, projenizi daha güvenli hale getirir.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let analytics: Analytics | null = null;

// Sadece tüm anahtarlar mevcutsa Firebase'i başlat.
if (firebaseConfig.apiKey && firebaseConfig.projectId) {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);

    // Initialize Analytics only on the client side
    if (typeof window !== 'undefined') {
      if (firebaseConfig.measurementId) {
        analytics = getAnalytics(app);
      }
    }
} else {
    console.warn("Firebase yapılandırma anahtarları eksik. Lütfen ortam değişkenlerini kontrol edin.");
}


export { app, auth, db, analytics };
