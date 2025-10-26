import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAnalytics, Analytics } from "firebase/analytics";
import { Auth, getAuth } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDRzgQYyEoTDbpVZ463iBGGA_jckvB7lIg",
  authDomain: "pandora-7c682.firebaseapp.com",
  projectId: "pandora-7c682",
  storageBucket: "pandora-7c682.appspot.com",
  messagingSenderId: "593126997779",
  appId: "1:593126997779:web:f84d9d3c99eba61d75e4e6",
  measurementId: "G-0W6736J8LG"
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
