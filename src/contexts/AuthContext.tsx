'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User as SupabaseUser, Session, AuthChangeEvent } from '@supabase/supabase-js';
import { createBrowserSupabaseClient } from '@/lib/supabase';
import { User as DatabaseUser, UserWithOrg, UserRole } from '@/lib/auth/roleUtils';

// Interface för organisation
interface Organization {
  id: string;
  name: string;
  slug: string;
  domain: string | null;
  role: UserRole;
  isDefault: boolean;
}

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
  organizations: Organization[];
  currentOrganization: Organization | null;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
  hasRole: (role: UserRole) => boolean;
  switchOrganization: (organizationId: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: true,
  dbUser: null,
  userRole: null,
  organization: null,
  organizations: [],
  currentOrganization: null,
  signOut: async () => {},
  refreshSession: async () => {},
  hasRole: () => false,
  switchOrganization: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dbUser, setDbUser] = useState<DatabaseUser | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [organization, setOrganization] = useState<{id: string; name: string; slug: string} | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null);

  // Hämta användardata från API
  const fetchUserData = async (orgId?: string) => {
    if (!user) {
      setDbUser(null);
      setUserRole(null);
      setOrganization(null);
      setOrganizations([]);
      setCurrentOrganization(null);
      return;
    }

    try {
      // Skapa URL med optional orgId parameter
      const url = new URL('/api/auth/current-user', window.location.origin);
      if (orgId) {
        url.searchParams.set('orgId', orgId);
      }
      
      const response = await fetch(url.toString());
      
      if (response.ok) {
        const data = await response.json();
        setDbUser(data);
        setUserRole(data.role as UserRole || null);
        
        // Bakåtkompatibilitet med gamla organization-objektet
        const legacyOrg = data.currentOrganization ? {
          id: data.currentOrganization.id,
          name: data.currentOrganization.name,
          slug: data.currentOrganization.slug,
        } : null;
        setOrganization(legacyOrg);
        
        // Nya organisationsdata
        setOrganizations(data.organizations || []);
        setCurrentOrganization(data.currentOrganization || null);
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
      setOrganizations([]);
      setCurrentOrganization(null);
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

  // Byt organisation
  const switchOrganization = async (organizationId: string) => {
    try {
      setIsLoading(true);
      
      // Hitta organisationen i listan
      const targetOrg = organizations.find(org => org.id === organizationId);
      if (!targetOrg) {
        console.error('Organization not found:', organizationId);
        return;
      }
      
      // Använd switch-organization-endpointen för att navigera till rätt subdomän
      const currentPath = window.location.pathname;
      window.location.href = `/switch-organization?orgId=${organizationId}&redirect=${currentPath}`;
      
    } catch (error) {
      console.error('Error switching organization:', error);
      setIsLoading(false);
    }
  };

  const value = {
    user,
    session,
    isLoading,
    dbUser,
    userRole,
    organization,
    organizations,
    currentOrganization,
    signOut,
    refreshSession,
    hasRole,
    switchOrganization,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 