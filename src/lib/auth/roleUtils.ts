import { createServerClient } from '../supabase';
import { UserWithOrganizations, UserOrganizationWithOrg, getDefaultOrganization } from '@/types/prisma';
import { userRepository } from '@/repositories/userRepository';
import { organizationRepository } from '@/repositories/organizationRepository';

// Definiera UserRole-enum som motsvarar Prisma-schemat
export enum UserRole {
  ADMIN = 'ADMIN',
  EDITOR = 'EDITOR',
  MEMBER = 'MEMBER'
}

// Definiera kompatibilitet med äldre koddelar (för legacy support)
export interface User {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  organizationId: string | null;
}

// Re-export UserRole för bakåtkompatibilitet
// export { UserRole }; // Borttaget för att undvika dubbel export

export type UserWithOrg = User & {
  organization: {
    id: string;
    name: string;
    slug: string;
  } | null;
};

/**
 * Kontrollerar om en användare har en specifik roll
 */
export function hasRole(user: User | UserWithOrg | UserWithOrganizations | null, role: UserRole): boolean {
  if (!user) return false;
  
  // Om den nya UserWithOrganizations används
  if ('organizations' in user) {
    return user.organizations.some(org => {
      // Adminrättigheter över alla roller
      if (org.role === UserRole.ADMIN) return true;
      // Editorrättigheter över editor och member
      if (org.role === UserRole.EDITOR && (role === UserRole.EDITOR || role === UserRole.MEMBER)) return true;
      // Memberrättigheter bara över member
      if (org.role === UserRole.MEMBER && role === UserRole.MEMBER) return true;
      return false;
    });
  }
  
  // Legacy support för gamla User/UserWithOrg
  // Admins har alla rättigheter
  if (user.role === UserRole.ADMIN) return true;
  
  // Editors har editor och member rättigheter
  if (user.role === UserRole.EDITOR && (role === UserRole.EDITOR || role === UserRole.MEMBER)) return true;
  
  // Members har bara member rättigheter
  if (user.role === UserRole.MEMBER && role === UserRole.MEMBER) return true;
  
  return false;
}

/**
 * Förbereder en användare vid registrering: skapar användare i databasen
 */
export async function prepareUserOnSignUp(
  email: string,
  name: string | null,
  organizationId: string | null = null,
  role: UserRole = UserRole.MEMBER
): Promise<User> {
  // Använd userRepository istället för direkta prisma-anrop
  const createData: {
    email: string;
    name: string | null;
    organizationId?: string;
    role: UserRole;
  } = {
    email,
    name,
    role
  };
  
  // Lägg bara till organizationId om det inte är null
  if (organizationId) {
    createData.organizationId = organizationId;
  }
  
  const user = await userRepository.createUserWithOrganization(createData);
  
  // Konvertera till legacy format för kompabilitet
  const defaultOrg = getDefaultOrganization(user);
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: defaultOrg?.role || role,
    organizationId: defaultOrg?.organizationId || null
  };
}

/**
 * Kopplar en befintlig användare till en organisation
 */
export async function connectUserToOrganization(
  userId: string,
  organizationId: string,
  role: UserRole = UserRole.MEMBER
): Promise<User> {
  // Använd userRepository istället för direkta prisma-anrop
  const user = await userRepository.connectUserToOrganization(
    userId,
    organizationId,
    role,
    true // Sätt som standardorganisation
  );
  
  // Konvertera till legacy format för kompabilitet
  const defaultOrg = getDefaultOrganization(user);
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: defaultOrg?.role || role,
    organizationId: defaultOrg?.organizationId || null
  };
}

// === Server Component only functions (App Router) ===
// Dessa funktioner kan bara användas i server components inom /app katalogen

export async function getCurrentUserServer() {
  // Dynamisk import för att undvika att importera next/headers vid byggtid
  const { cookies } = await import('next/headers');
  
  const cookieStore = cookies();
  const supabase = createServerClient();
  
  // Hämta Supabase session
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return null;
  
  // Kontrollera att email finns
  if (!session.user.email) return null;
  
  // Hämta användare från databas via repository
  const dbUser = await userRepository.getUserWithOrganizations(session.user.email);
  if (!dbUser) return null;
  
  // Konvertera till legacy format för kompabilitet
  const defaultOrg = getDefaultOrganization(dbUser);
  return {
    id: dbUser.id,
    email: dbUser.email,
    name: dbUser.name,
    role: defaultOrg?.role || UserRole.MEMBER,
    organizationId: defaultOrg?.organizationId || null,
    organization: defaultOrg?.organization ? {
      id: defaultOrg.organization.id,
      name: defaultOrg.organization.name,
      slug: defaultOrg.organization.slug
    } : null
  } as UserWithOrg;
}

// === För användning i både Pages Router och App Router ===

/**
 * Wrapper för getCurrentUser som kan användas överallt. Inuti /app katalogen 
 * importeras denna funktion och ger samma resultat som getCurrentUserServer.
 * 
 * I /pages katalogen behöver du använda serverSideProps och hämta användaren
 * från API:et istället.
 */
export async function getCurrentUser(): Promise<UserWithOrg | null> {
  // Kontrollera om vi är i en server component miljö
  if (typeof window === 'undefined') {
    return getCurrentUserServer();
  }
  
  // Annars är vi i en klientmiljö, så vi returnerar null
  // och användaren får istället använda API-anropet i client components
  console.warn(
    'getCurrentUser() anropades i en klientkomponent. ' +
    'Använd useAuth() i context istället.'
  );
  return null;
} 