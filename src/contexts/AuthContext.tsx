'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User as SupabaseUser, Session, AuthChangeEvent } from '@supabase/supabase-js';
import { createBrowserSupabaseClient } from '@/lib/supabase';
import { User as DatabaseUser, UserWithOrg, UserRole } from '@/lib/auth/roleUtils';

type AuthContextType = {
  user: SupabaseUser | null;
  session: Session | null;
  isLoading: boolean;
  dbUser: DatabaseUser | null;
  userRole: UserRole | null;
  organization: {
    id: string;
    name: string;
    slug: string;
  } | null;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
  hasRole: (role: UserRole) => boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: true,
  dbUser: null,
  userRole: null,
  organization: null,
  signOut: async () => {},
  refreshSession: async () => {},
  hasRole: () => false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dbUser, setDbUser] = useState<DatabaseUser | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [organization, setOrganization] = useState<{id: string; name: string; slug: string} | null>(null);

  // Hämta användardata från API
  const fetchUserData = async () => {
    if (!user) {
      setDbUser(null);
      setUserRole(null);
      setOrganization(null);
      return;
    }

    try {
      const response = await fetch('/api/auth/current-user');
      
      if (response.ok) {
        const data = await response.json();
        setDbUser(data);
        setUserRole(data.role as UserRole || null);
        setOrganization(data.organization || null);
      } else {
        console.error('Error fetching user data:', await response.text());
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  useEffect(() => {
    // Initialisera autentisering när komponenten mountas
    const initializeAuth = async () => {
      try {
        setIsLoading(true);
        const supabase = createBrowserSupabaseClient();
        
        // Hämta nuvarande session
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        if (currentSession) {
          setSession(currentSession);
          setUser(currentSession.user);
        }
        
        // Lyssna på autentiseringsförändringar
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (event: AuthChangeEvent, newSession: Session | null) => {
            setSession(newSession);
            setUser(newSession?.user || null);
            setIsLoading(false);
          }
        );
        
        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeAuth();
  }, []);

  // Hämta användardata när användaren ändras
  useEffect(() => {
    if (user) {
      fetchUserData();
    } else {
      setDbUser(null);
      setUserRole(null);
      setOrganization(null);
    }
  }, [user]);

  // Logga ut användaren
  const signOut = async () => {
    try {
      setIsLoading(true);
      const supabase = createBrowserSupabaseClient();
      await supabase.auth.signOut();
      // OnAuthStateChange-lyssnaren kommer att uppdatera state
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Uppdatera sessionen
  const refreshSession = async () => {
    try {
      setIsLoading(true);
      const supabase = createBrowserSupabaseClient();
      const { data: { session: refreshedSession } } = await supabase.auth.getSession();
      
      if (refreshedSession) {
        setSession(refreshedSession);
        setUser(refreshedSession.user);
        await fetchUserData();
      }
    } catch (error) {
      console.error('Error refreshing session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Kontrollera om användaren har en specifik roll
  const hasRole = (role: UserRole): boolean => {
    if (!userRole) return false;
    
    // Admin har alla rättigheter
    if (userRole === UserRole.ADMIN) return true;
    
    // Editor har editor- och member-rättigheter
    if (userRole === UserRole.EDITOR && (role === UserRole.EDITOR || role === UserRole.MEMBER)) return true;
    
    // Member har bara member-rättigheter
    if (userRole === UserRole.MEMBER && role === UserRole.MEMBER) return true;
    
    return false;
  };

  const value = {
    user,
    session,
    isLoading,
    dbUser,
    userRole,
    organization,
    signOut,
    refreshSession,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 