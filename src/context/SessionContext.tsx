import { createContext, useContext, ReactNode } from 'react';

// Definiera typerna för sessionsdata
interface User {
  id: string;
  email: string;
  name?: string;
  organization_id?: string;
  role?: string;
}

interface SessionContextType {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
}

// Skapa kontexten med standardvärden
const SessionContext = createContext<SessionContextType>({
  user: null,
  isLoading: false,
  error: null,
});

// Provider-komponent för sessionshantering
export const SessionProvider = ({
  children,
  initialUser = null,
  isLoading = false,
  error = null,
}: {
  children: ReactNode;
  initialUser?: User | null;
  isLoading?: boolean;
  error?: Error | null;
}) => {
  // Vi skulle vanligtvis ha mer logik här för session management
  // men för att åtgärda TypeScript-felen använder vi bara props-värden
  return (
    <SessionContext.Provider
      value={{
        user: initialUser,
        isLoading,
        error,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};

// Hook för att använda sessionsdata
export const useSession = () => useContext(SessionContext);

export default SessionContext;
