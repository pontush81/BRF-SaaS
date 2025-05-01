'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  UserCredential,
  Auth
} from 'firebase/auth';
import { auth } from '@/lib/firebase';

// Kontrollera om vi är i en webbläsarmiljö
const isBrowser = typeof window !== 'undefined';

interface AuthContextType {
  currentUser: User | null;
  signup: (email: string, password: string) => Promise<UserCredential | null>;
  login: (email: string, password: string) => Promise<UserCredential | null>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (displayName: string) => Promise<void>;
  loading: boolean;
  isConfigured: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isConfigured, setIsConfigured] = useState(false);

  // Check if Firebase Auth is properly configured
  useEffect(() => {
    // Skydda mot körning i SSR-kontexten
    if (!isBrowser) {
      setLoading(false);
      return;
    }

    try {
      if (auth && typeof auth.onAuthStateChanged === 'function') {
        setIsConfigured(true);
        
        // Lyssna på auth-förändringar
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          setCurrentUser(user);
          setLoading(false);
        });
        
        // Städa upp när komponenten unmountas
        return unsubscribe;
      } else {
        console.warn('Firebase Auth is not properly configured');
        setIsConfigured(false);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error checking Firebase Auth configuration:', error);
      setIsConfigured(false);
      setLoading(false);
    }
  }, []);

  function signup(email: string, password: string) {
    if (!isBrowser || !isConfigured) {
      console.warn('Firebase Auth is not configured or not in browser, mocking signup');
      return Promise.resolve(null);
    }
    return createUserWithEmailAndPassword(auth, email, password);
  }

  function login(email: string, password: string) {
    if (!isBrowser || !isConfigured) {
      console.warn('Firebase Auth is not configured or not in browser, mocking login');
      return Promise.resolve(null);
    }
    return signInWithEmailAndPassword(auth, email, password);
  }

  function logout() {
    if (!isBrowser || !isConfigured) {
      console.warn('Firebase Auth is not configured or not in browser, mocking logout');
      return Promise.resolve();
    }
    return signOut(auth);
  }

  function resetPassword(email: string) {
    if (!isBrowser || !isConfigured) {
      console.warn('Firebase Auth is not configured or not in browser, mocking reset password');
      return Promise.resolve();
    }
    return sendPasswordResetEmail(auth, email);
  }

  async function updateUserProfile(displayName: string) {
    if (!isBrowser || !isConfigured) {
      console.warn('Firebase Auth is not configured or not in browser, mocking profile update');
      return Promise.resolve();
    }
    if (!auth.currentUser) return Promise.reject('No user logged in');
    return updateProfile(auth.currentUser, { displayName });
  }

  const value = {
    currentUser,
    signup,
    login,
    logout,
    resetPassword,
    updateUserProfile,
    loading,
    isConfigured
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
} 