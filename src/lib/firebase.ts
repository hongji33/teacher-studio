import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const config = {
  // Firebase web app configuration is public; access is controlled by Auth and rules.
  apiKey:
    import.meta.env.VITE_FIREBASE_API_KEY ||
    "AIzaSyCF9GULYVpSM_iGe9iWWlhFltNTAW1c5KM",
  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ||
    "teacher-studio-f0d81.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "teacher-studio-f0d81",
  appId:
    import.meta.env.VITE_FIREBASE_APP_ID ||
    "1:937422979748:web:ab3b98462cc28a17eb1c31",
};
export const firebase = Object.values(config).every(Boolean)
  ? (() => {
      try {
        const app = initializeApp(config);
        return { auth: getAuth(app), db: getFirestore(app) };
      } catch {
        return null;
      }
    })()
  : null;
