import prisma from '@/lib/prisma';
import { UserRole } from '@prisma/client';
// Importera bara konstanter från client-filen
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/supabase-client';
import {
  UserWithOrganizations,
  UserOrganizationWithOrg,
  getDefaultOrganization,
} from '@/types/prisma';
import { userRepository } from '@/repositories/userRepository';
import { organizationRepository } from '@/repositories/organizationRepository';

// Re-export UserRole för att göra den tillgänglig
export { UserRole };

// SUPERADMIN constant for backward compatibility
// This avoids having to update the database schema
export const SUPERADMIN_ROLE = 'SUPERADMIN';

/**
 * Checks if a user has SUPERADMIN access
 * @param userData The user data to check
 * @returns True if the user has SUPERADMIN access
 */
export function hasSuperAdminAccess(userData: { role: any } | null): boolean {
  if (!userData) return false;

  // Check for string role comparison
  if (typeof userData.role === 'string') {
    return userData.role === SUPERADMIN_ROLE;
  }

  // Try toString() method if available
  if (userData.role && typeof userData.role.toString === 'function') {
    return userData.role.toString() === SUPERADMIN_ROLE;
  }

  return false;
}

// Definiera kompatibilitet med äldre koddelar (för legacy support)
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
export function hasRole(
  user: User | UserWithOrg | UserWithOrganizations | null,
  role: UserRole
): boolean {
  if (!user) return false;

  // Om den nya UserWithOrganizations används
  if ('organizations' in user) {
    return user.organizations.some(org => {
      // Adminrättigheter över alla roller
      if (org.role === UserRole.ADMIN) return true;
      // Editorrättigheter över editor och member
      if (
        org.role === UserRole.EDITOR &&
        (role === UserRole.EDITOR || role === UserRole.MEMBER)
      )
        return true;
      // Memberrättigheter bara över member
      if (org.role === UserRole.MEMBER && role === UserRole.MEMBER) return true;
      return false;
    });
  }

  // Legacy support för gamla User/UserWithOrg
  // Admins har alla rättigheter
  if (user.role === UserRole.ADMIN) return true;

  // Editors har editor och member rättigheter
  if (
    user.role === UserRole.EDITOR &&
    (role === UserRole.EDITOR || role === UserRole.MEMBER)
  )
    return true;

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
  if (!email) {
    throw new Error('Email is required');
  }

  // Kontrollera om användaren redan finns
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error('User already exists');
  }

  // Skapa användaren
  const user = await prisma.user.create({
    data: {
      email,
      name,
    },
  });

  // Om organizationId, koppla användaren till organisationen
  if (organizationId) {
    await prisma.userOrganization.create({
      data: {
        userId: user.id,
        organizationId,
        role,
        isDefault: true,
      },
    });
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    organizationId,
    role,
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
  // Kontrollera om användaren finns
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Kontrollera om organisationen finns
  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
  });

  if (!organization) {
    throw new Error('Organization not found');
  }

  // Kontrollera om användaren redan är kopplad till organisationen
  const existingConnection = await prisma.userOrganization.findFirst({
    where: {
      userId,
      organizationId,
    },
  });

  if (existingConnection) {
    throw new Error('User is already connected to this organization');
  }

  // Koppla användaren till organisationen
  await prisma.userOrganization.create({
    data: {
      userId,
      organizationId,
      role,
      isDefault: false,
    },
  });

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    organizationId,
    role,
  };
}

/**
 * Wrapper för getCurrentUser som kan användas överallt.
 * Returnerar alltid null i klientmiljö och ger felmeddelande.
 */
export async function getCurrentUser(): Promise<UserWithOrg | null> {
  // Kontrollera om vi är i en server component miljö
  if (typeof window === 'undefined') {
    console.error(
      'getCurrentUser() anropades på servern. Använd getCurrentUserServer från /auth/server-utils istället. ' +
        'Detta är helt separerat för att undvika att importera next/headers i klientkomponenter.'
    );
    return null;
  }

  // Annars är vi i en klientmiljö, så vi returnerar null
  // och användaren får istället använda API-anropet i client components
  console.warn(
    'getCurrentUser() anropades i en klientkomponent. ' +
      'Använd useAuth() i context istället.'
  );
  return null;
}
