import { Prisma, User as PrismaUser } from '@prisma/client';
import { UserRole } from '@/lib/auth/roleUtils';

// Representation av en användare med relaterade organisationer
export interface UserWithOrganizations {
  id: string;
  email: string;
  name: string | null;
  firebaseUid: string | null;
  organizations: UserOrganizationWithOrg[];
  createdAt: Date;
  updatedAt: Date;
}

// Representation av UserOrganization med organization inkluderat
export interface UserOrganizationWithOrg {
  id: string;
  userId: string;
  organizationId: string;
  role: UserRole;
  isDefault: boolean;
  createdAt: Date;
  organization: Organization;
}

// Representation av en organisation
export interface Organization {
  id: string;
  name: string;
  slug: string;
  domain: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Hjälpfunktion för att hämta standardorganisationen från en användare
export function getDefaultOrganization(user: UserWithOrganizations): UserOrganizationWithOrg | undefined {
  return user.organizations.find(org => org.isDefault);
}

// Hjälpfunktion för att hämta användarens roll i en specifik organisation
export function getUserRoleInOrganization(user: UserWithOrganizations, organizationId: string): UserRole | null {
  const userOrg = user.organizations.find(org => org.organizationId === organizationId);
  return userOrg?.role || null;
}

// Hjälpfunktion för att kontrollera om användaren har en specifik roll i en organisation
export function hasRole(user: UserWithOrganizations, role: UserRole, organizationId?: string): boolean {
  if (organizationId) {
    // Kolla specifik organisation
    const userRole = getUserRoleInOrganization(user, organizationId);
    return userRole === role;
  } else {
    // Kolla om användaren har rollen i någon organisation
    return user.organizations.some(org => org.role === role);
  }
} 