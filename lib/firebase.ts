import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAnalytics, Analytics } from "firebase/analytics";
import { Auth, getAuth } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDi4wnt7fiBVKn6dcDMxs9LtwYyVayxjV0",
  authDomain: "pandora-31.firebaseapp.com",
  projectId: "pandora-31",
  storageBucket: "pandora-31.firebasestorage.app",
  messagingSenderId: "68280231637",
  appId: "1:68280231637:web:376ef3976af75aa7a0e45c",
  measurementId: "G-6XTLED3NJR"
};


// Initialize Firebase
const app: FirebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth: Auth = getAuth(app);
let analytics: Analytics | null = null;

// Initialize Analytics only on the client side
if (typeof window !== 'undefined') {
  if ("measurementId" in firebaseConfig) {
    analytics = getAnalytics(app);
  }
}

export { app, auth, analytics };
