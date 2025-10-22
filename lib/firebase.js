// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export { app, analytics };
