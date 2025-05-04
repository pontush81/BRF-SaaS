'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { createClient } from '@supabase/supabase-js';
import { UserRole } from '@/lib/auth/roleUtils';
import { Organization } from '@/types/organization';

// Direct environment variables to avoid imports
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Check if in development mode
const isDevelopment = process.env.NODE_ENV === 'development';

// Skapa istället en funktion som returnerar en klient när den behövs
const getSupabaseClient = () => {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  });
};

// Types
interface DatabaseUser {
  id: string;
  email: string;
  name: string | null;
  organizations: Organization[];
  role?: UserRole | null;
  defaultOrganization?: Organization | null;
  currentOrganization?: Organization | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  dbUser: DatabaseUser | null;
  userRole: UserRole | null;
  organization: { id: string; name: string; slug: string } | null;
  organizations: Organization[];
  currentOrganization: Organization | null;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
  hasRole: (role: UserRole) => boolean;
  switchOrganization: (orgId: string) => Promise<void>;
}

// Default context values
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
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dbUser, setDbUser] = useState<DatabaseUser | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [organization, setOrganization] = useState<{id: string; name: string; slug: string} | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null);

  // Fetch user data from API
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
      // Create URL with optional orgId parameter
      const url = new URL('/api/auth/current-user', window.location.origin);
      if (orgId) {
        url.searchParams.set('orgId', orgId);
      }
      
      const response = await fetch(url.toString());
      
      if (response.ok) {
        const data = await response.json();
        setDbUser(data);
        setUserRole(data.role as UserRole || null);
        
        // Backward compatibility with old organization object
        const legacyOrg = data.currentOrganization ? {
          id: data.currentOrganization.id,
          name: data.currentOrganization.name,
          slug: data.currentOrganization.slug,
        } : null;
        setOrganization(legacyOrg);
        
        // New organizational data
        setOrganizations(data.organizations || []);
        setCurrentOrganization(data.currentOrganization || null);
      } else {
        console.error('Error fetching user data:', await response.text());
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  // Sign out user
  const signOut = async () => {
    try {
      const supabase = getSupabaseClient();
      await supabase.auth.signOut();
      
      // Clear local state
      setUser(null);
      setSession(null);
      setDbUser(null);
      setUserRole(null);
      setOrganization(null);
      setOrganizations([]);
      setCurrentOrganization(null);
      
      // In development mode, also clear the mock cookie
      if (isDevelopment && typeof document !== 'undefined') {
        document.cookie = 'supabase-dev-auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      }
      
      // Redirect to login page
      window.location.href = '/login';
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Refresh session and user data
  const refreshSession = async () => {
    try {
      const supabase = getSupabaseClient();
      // Fetch the user information
      const { data } = await supabase.auth.getUser();
      
      if (data && data.user) {
        // In Supabase v2 we need to fetch the session separately 
        const { data: sessionData } = await supabase.auth.getSession();
        setSession(sessionData.session);
        setUser(data.user);
        await fetchUserData();
      }
    } catch (error) {
      console.error('Error refreshing session:', error);
    }
  };

  // Switch organization context
  const switchOrganization = async (orgId: string) => {
    try {
      const supabase = getSupabaseClient();
      await fetchUserData(orgId);
    } catch (error) {
      console.error('Error switching organization:', error);
    }
  };

  // Check if user has a specific role
  const hasRole = (role: UserRole): boolean => {
    if (!userRole) return false;

    // Admin has all roles
    if (userRole === UserRole.ADMIN) return true;
    
    // Editor has editor and member roles
    if (userRole === UserRole.EDITOR) {
      return role === UserRole.EDITOR || role === UserRole.MEMBER;
    }
    
    // Member only has member role
    return userRole === role;
  };

  // Check for mock authentication in development mode
  const checkMockAuth = () => {
    if (isDevelopment && typeof document !== 'undefined') {
      const hasMockCookie = document.cookie.includes('supabase-dev-auth=true');
      
      if (hasMockCookie && !user) {
        console.log('Found mock auth cookie, setting mock user');
        const mockUser = {
          id: '12345-mock-user-id',
          email: 'dev@example.com',
          app_metadata: {},
          user_metadata: { name: 'Utvecklaren' },
          aud: 'authenticated',
          created_at: new Date().toISOString()
        } as User;
        
        const mockSession = {
          access_token: 'mock-token',
          refresh_token: 'mock-refresh-token',
          expires_at: Math.floor(Date.now() / 1000) + 3600,
          user: mockUser
        } as Session;
        
        setUser(mockUser);
        setSession(mockSession);
        
        // Set basic role and organization for mocked user
        setUserRole(UserRole.ADMIN);
        setOrganization({
          id: 'mock-org-id',
          name: 'Test BRF (Mock)',
          slug: 'test-brf-mock'
        });
        
        return true;
      }
    }
    return false;
  };

  // Initialize auth state when component loads
  useEffect(() => {
    setIsLoading(true);

    // Get initial session
    const initializeAuth = async () => {
      try {
        // First check if we should use mock auth in development
        if (checkMockAuth()) {
          setIsLoading(false);
          return;
        }
        
        const supabase = getSupabaseClient();
        const { data } = await supabase.auth.getUser();
        
        if (data && data.user) {
          // Get session separately
          const { data: sessionData } = await supabase.auth.getSession();
          setSession(sessionData.session);
          setUser(data.user);
          await fetchUserData();
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const supabase = getSupabaseClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log('Auth state changed:', event);
        
        if (newSession) {
          setSession(newSession);
          setUser(newSession.user);
          await fetchUserData();
        } else {
          // Even if session was cleared, check if we should use mock auth in dev
          if (!checkMockAuth()) {
            setSession(null);
            setUser(null);
            setDbUser(null);
            setUserRole(null);
            setOrganization(null);
            setOrganizations([]);
            setCurrentOrganization(null);
          }
        }
        
        setIsLoading(false);
      }
    );

    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, []);

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