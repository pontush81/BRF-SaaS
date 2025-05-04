import { UserRole } from '@/lib/auth/roleUtils';

/**
 * Organization interface used throughout the application
 * Centralizing this definition avoids type conflicts
 */
export interface Organization {
  id: string;
  name: string;
  slug: string;
  domain?: string | null;
  role: UserRole;
  isDefault: boolean;
} 