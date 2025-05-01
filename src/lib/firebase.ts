import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

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

// Definiera typ för mockad auth
interface MockAuth extends Auth {
  currentUser: null;
  onAuthStateChanged: () => () => void;
}

// Skapa en tom (mock) version av Firebase-services
const mockAuth: MockAuth = { 
  currentUser: null,
  onAuthStateChanged: () => () => {},
} as MockAuth;

const mockFirestore = {} as Firestore;
const mockStorage = {} as FirebaseStorage;

// Skapa mockad export om konfigurationen inte är valid eller om vi är i en serverrendering
let app: FirebaseApp | null = null;
let auth: Auth = mockAuth;
let db: Firestore = mockFirestore;
let storage: FirebaseStorage = mockStorage;

// Initialisera Firebase endast på klientsidan och med giltig konfiguration
if (isBrowser && isConfigValid) {
  try {
    // Initialize Firebase
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    console.log('Firebase initialized successfully');
  } catch (error) {
    console.error('Firebase initialization error:', error);
    // Använd mock-objekt vid fel
    app = null;
    auth = mockAuth;
    db = mockFirestore;
    storage = mockStorage;
  }
} else {
  if (!isBrowser) {
    console.warn('Firebase skipped in server context');
  } else {
    console.warn('Firebase configuration is invalid or missing environment variables');
  }
  // Använd mock-objekt
  app = null;
  auth = mockAuth;
  db = mockFirestore;
  storage = mockStorage;
}

export { app, auth, db, storage }; 