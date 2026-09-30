import { initializeApp } from "firebase/app";
import { getFirestore, disableNetwork } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Firebase configuration — values are loaded from environment variables.
// Copy .env.example to .env and fill in your real values. Never commit .env to git.
const env = import.meta.env;

// Without these values Firebase Auth throws "auth/invalid-api-key" at startup,
// which blanks the whole app. Fall back to local offline mode instead.
export const isFirebaseConfigured = Boolean(env.VITE_FIREBASE_API_KEY && env.VITE_FIREBASE_PROJECT_ID);

const firebaseConfig = isFirebaseConfigured
  ? {
      apiKey: env.VITE_FIREBASE_API_KEY,
      authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: env.VITE_FIREBASE_APP_ID,
      measurementId: env.VITE_FIREBASE_MEASUREMENT_ID,
    }
  : {
      // Placeholder values: only used so the SDK can initialize; network is disabled below.
      apiKey: "offline-mode",
      projectId: "grahita-offline",
      appId: "grahita-offline",
    };

if (!isFirebaseConfigured) {
  console.warn(
    "Firebase environment variables are missing (see .env.example). Grahita Space is running in local offline mode."
  );
}

export const app = initializeApp(firebaseConfig);

// Use the default Firestore database (production-ready)
export const db = getFirestore(app);

if (!isFirebaseConfigured) {
  disableNetwork(db).catch((err) => console.warn("Failed to disable Firestore network:", err));
}

// Firebase Authentication
export const auth = getAuth(app);
