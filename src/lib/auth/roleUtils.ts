import { PrismaClient } from '@prisma/client';
import { createServerClient } from '../supabase';
import { cookies } from 'next/headers';
import prisma from '../prisma';

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
 * Hämtar den inloggade användarens information, inklusive roll och organisation
 */
export async function getCurrentUser(): Promise<UserWithOrg | null> {
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

/**
 * Förbereder en användare vid registrering: skapar användare i databasen
 */
export async function prepareUserOnSignUp(
  email: string,
  name: string | null,
  organizationId: string | null = null,
  role: UserRole = UserRole.MEMBER
): Promise<User> {
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
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      organizationId,
      role
    }
  });
  
  return user as unknown as User;
} 