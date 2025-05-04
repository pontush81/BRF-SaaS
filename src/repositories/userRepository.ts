import prisma from '@/lib/prisma';
import { UserRole } from '@/lib/auth/roleUtils';
import { UserWithOrganizations, UserOrganizationWithOrg, Organization } from '@/types/prisma';
import { Prisma } from '@prisma/client';

type PrismaUser = {
  id: string;
  email: string;
  name: string | null;
  firebaseUid: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type PrismaUserOrganization = {
  id: string;
  userId: string;
  organizationId: string;
  role: string; // This is the Prisma enum
  isDefault: boolean;
  createdAt: Date;
};

// Function to map Prisma UserRole enum to our application's UserRole enum
function mapPrismaRoleToAppRole(prismaRole: string): UserRole {
  // Match the string values
  if (prismaRole === 'ADMIN') return UserRole.ADMIN;
  if (prismaRole === 'EDITOR') return UserRole.EDITOR;
  if (prismaRole === 'MEMBER') return UserRole.MEMBER;
  // Default fallback
  return UserRole.MEMBER;
}

// Function to convert Prisma User with organizations to our UserWithOrganizations type
function convertPrismaUserToAppUser(
  user: PrismaUser & {
    organizations: (PrismaUserOrganization & {
      organization: Organization;
    })[];
  }
): UserWithOrganizations {
  return {
    ...user,
    organizations: user.organizations.map(org => ({
      ...org,
      role: mapPrismaRoleToAppRole(org.role),
      organization: org.organization
    })) as UserOrganizationWithOrg[]
  };
}

/**
 * Användarrepository som hanterar all användarrelaterad dataåtkomst
 */
export const userRepository = {
  /**
   * Hämtar en användare med alla dess organisationer
   */
  async getUserWithOrganizations(email: string): Promise<UserWithOrganizations | null> {
    console.log(`[userRepository] Attempting to find user with email: ${email}`);
    try {
      const user = await prisma.user.findUnique({
        where: { email },
        include: {
          organizations: {
            include: {
              organization: true
            }
          }
        }
      });
      
      console.log(`[userRepository] User fetch result:`, { 
        found: !!user,
        userId: user?.id,
        organizationsCount: user?.organizations?.length || 0 
      });
      
      return user ? convertPrismaUserToAppUser(user as any) : null;
    } catch (error) {
      console.error(`[userRepository] Error fetching user with email ${email}:`, error);
      throw error;
    }
  },

  /**
   * Hämtar en användare med organisationer filtrerade efter roll
   */
  async getUserWithRoleInOrganizations(email: string, role: UserRole): Promise<UserWithOrganizations | null> {
    // Convert our application UserRole to Prisma's enum values
    let prismaRole;
    
    if (role === UserRole.ADMIN) {
      prismaRole = 'ADMIN';
    } else if (role === UserRole.EDITOR) {
      prismaRole = 'EDITOR';
    } else {
      prismaRole = 'MEMBER';
    }
    
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        organizations: {
          where: { 
            role: prismaRole as any 
          },
          include: {
            organization: true
          }
        }
      }
    });
    
    return user ? convertPrismaUserToAppUser(user as any) : null;
  },

  /**
   * Skapar en användare och associerar den med en organisation
   */
  async createUserWithOrganization(userData: {
    email: string;
    name?: string | null;
    organizationId?: string;
    role?: UserRole;
  }): Promise<UserWithOrganizations> {
    const { email, name, organizationId, role = UserRole.MEMBER } = userData;
    
    // Convert our application UserRole to Prisma's enum values
    let prismaRole;
    
    if (role === UserRole.ADMIN) {
      prismaRole = 'ADMIN';
    } else if (role === UserRole.EDITOR) {
      prismaRole = 'EDITOR';
    } else {
      prismaRole = 'MEMBER';
    }

    const user = await prisma.user.create({
      data: {
        email,
        name,
        ...(organizationId ? {
          organizations: {
            create: {
              organizationId,
              role: prismaRole as any,
              isDefault: true
            }
          }
        } : {})
      },
      include: {
        organizations: {
          include: {
            organization: true
          }
        }
      }
    });
    
    return convertPrismaUserToAppUser(user as any);
  },

  /**
   * Ansluter en användare till en organisation
   */
  async connectUserToOrganization(userId: string, organizationId: string, role: UserRole = UserRole.MEMBER, isDefault: boolean = false): Promise<UserWithOrganizations> {
    // Convert our application UserRole to Prisma's enum values
    let prismaRole;
    
    if (role === UserRole.ADMIN) {
      prismaRole = 'ADMIN';
    } else if (role === UserRole.EDITOR) {
      prismaRole = 'EDITOR';
    } else {
      prismaRole = 'MEMBER';
    }
    
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        organizations: {
          create: {
            organizationId,
            role: prismaRole as any,
            isDefault
          }
        }
      },
      include: {
        organizations: {
          include: {
            organization: true
          }
        }
      }
    });
    
    return convertPrismaUserToAppUser(user as any);
  }
}; 