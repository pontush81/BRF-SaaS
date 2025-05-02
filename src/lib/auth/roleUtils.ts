import { createServerClient } from '../supabase';

// Definiera UserRole-enum som motsvarar Prisma-schemat
export enum UserRole {
  ADMIN = 'ADMIN',
  EDITOR = 'EDITOR',
  MEMBER = 'MEMBER'
}

// Definiera vår egen User-typ baserad på Prisma-schema
export interface User {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  organizationId: string | null;
}

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
export function hasRole(user: User | UserWithOrg | null, role: UserRole): boolean {
  if (!user) return false;
  
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
  // Dynamisk import av Prisma för att undvika att importera vid byggtid
  const { default: prisma } = await import('../prisma');
  
  // Skapa användare i databasen
  const user = await prisma.user.create({
    data: {
      email,
      name,
      role,
      organizationId
    }
  });
  
  return user as unknown as User;
}

/**
 * Kopplar en befintlig användare till en organisation
 */
export async function connectUserToOrganization(
  userId: string,
  organizationId: string,
  role: UserRole = UserRole.MEMBER
): Promise<User> {
  // Dynamisk import av Prisma för att undvika att importera vid byggtid
  const { default: prisma } = await import('../prisma');
  
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      organizationId,
      role
    }
  });
  
  return user as unknown as User;
}

// === Server Component only functions (App Router) ===
// Dessa funktioner kan bara användas i server components inom /app katalogen

export async function getCurrentUserServer() {
  // Dynamisk import för att undvika att importera next/headers och prisma vid byggtid
  const { cookies } = await import('next/headers');
  const { default: prisma } = await import('../prisma');
  
  const cookieStore = cookies();
  const supabase = createServerClient();
  
  // Hämta Supabase session
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return null;
  
  // Hämta användare från databas
  const dbUser = await prisma.user.findUnique({
    where: { 
      email: session.user.email 
    },
    include: {
      organization: {
        select: {
          id: true,
          name: true,
          slug: true
        }
      }
    }
  });
  
  return dbUser as unknown as UserWithOrg;
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