/**
 * Firebase configuration and initialization
 * Uses npm-installed Firebase (not CDN)
 */
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Firebase configuration (analytics/measurementId excluded for localhost compatibility)
// IMPORTANT: Replace these values with your own Firebase project's config
// from the Firebase Console (Project Settings → General → Your apps).
// Keeping config here makes the app work locally with Vite.
const firebaseConfig = {
  apiKey: "AIzaSyBaevXaLci3AAAz1cA3cfPkhzuyPWfLWD4",
  authDomain: "shahzad-ba1e7.firebaseapp.com",
  projectId: "shahzad-ba1e7",
  // Storage bucket must be the *.appspot.com form to work with Storage SDK
  storageBucket: "shahzad-ba1e7.firebasestorage.app",
  messagingSenderId: "403635896395",
  appId: "1:403635896395:web:3848988b9c1c8061c94dce",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export { app };

export default app;
