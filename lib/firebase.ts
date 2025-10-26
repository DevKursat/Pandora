import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDi4wnt7fiBVKn6dcDMxs9LtwYyVayxjV0",
  authDomain: "pandora-31.firebaseapp.com",
  projectId: "pandora-31",
  storageBucket: "pandora-31.appspot.com",
  messagingSenderId: "68280231637",
  appId: "1:68280231637:web:376ef3976af75aa7a0e45c",
  measurementId: "G-6XTLED3NJR"
};

// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
