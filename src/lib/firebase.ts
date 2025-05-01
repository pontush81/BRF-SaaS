import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Kontrollera om vi är i en webbläsarmiljö
const isBrowser = typeof window !== 'undefined';

// Kontrollera om miljövariabler är placeholders
const isPlaceholder = (value?: string) => {
  return !value || value.includes('your-') || value === 'undefined';
};

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Kontrollera om konfigurationen är valid
const isConfigValid = !isPlaceholder(firebaseConfig.apiKey) && 
                     !isPlaceholder(firebaseConfig.authDomain) && 
                     !isPlaceholder(firebaseConfig.projectId);

// Skapa mockad export om konfigurationen inte är valid eller om vi är i en serverrendering
let app;
let auth;
let db;
let storage;

if (isConfigValid) {
  try {
    // Initialize Firebase
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
  } catch (error) {
    console.error('Firebase initialization error:', error);
    // Skapa mockade objekt
    app = null;
    auth = { currentUser: null, onAuthStateChanged: () => () => {} } as any;
    db = {} as any;
    storage = {} as any;
  }
} else {
  console.warn('Firebase configuration is invalid or missing environment variables');
  // Skapa mockade objekt för utveckling/byggfas
  app = null;
  auth = { currentUser: null, onAuthStateChanged: () => () => {} } as any;
  db = {} as any;
  storage = {} as any;
}

export { app, auth, db, storage }; 