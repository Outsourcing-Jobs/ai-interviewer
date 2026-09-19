/**
 * @file src/config/firebase.ts
 * @description Firebase client SDK initialization (singleton).
 * Safely handles missing/invalid Firebase configuration without crashing the application.
 */

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, type Auth } from "firebase/auth";

const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN;
const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;

const isFirebaseConfigured = Boolean(apiKey && apiKey.trim() && apiKey !== "undefined" && apiKey !== "your_firebase_api_key");

let auth: Auth | null = null;
let googleProvider: GoogleAuthProvider | null = null;

if (isFirebaseConfigured) {
    try {
        const firebaseConfig = { apiKey, authDomain, projectId };
        const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
        auth = getAuth(app);
        googleProvider = new GoogleAuthProvider();
    } catch (err) {
        console.warn("[Firebase] Initialization skipped or failed:", err);
    }
}

export { auth, googleProvider, isFirebaseConfigured };

