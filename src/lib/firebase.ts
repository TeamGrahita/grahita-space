import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Firebase configuration for Grahita Space (project: grahita-space-4638f)
const firebaseConfig = {
  apiKey: "AIzaSyBCVZXJFz87PaDZWdPSG6wCtoxieFRlg20",
  authDomain: "grahita-space-4638f.firebaseapp.com",
  projectId: "grahita-space-4638f",
  storageBucket: "grahita-space-4638f.firebasestorage.app",
  messagingSenderId: "379355924686",
  appId: "1:379355924686:web:f95535b10a1062128aa89f",
  measurementId: "G-E41MYPCWCK"
};

export const app = initializeApp(firebaseConfig);

// Use the default Firestore database (production-ready)
export const db = getFirestore(app);

// Firebase Authentication
export const auth = getAuth(app);
