// This script is injected into the browser page by Playwright.
// It initializes Firebase so that our test script can access it via window.firebase

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
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
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Expose Firebase to the window object
window.firebase = {
    app: app,
    auth: () => auth
};
