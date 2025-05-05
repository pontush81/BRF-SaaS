import { useContext, createContext } from 'react';
import { User } from '@supabase/supabase-js';

// Define auth context type
interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
}

// Create context
const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
});

// Export hook
export const useAuth = () => useContext(AuthContext);

export default AuthContext;
