import prisma from '@/lib/prisma';
import { UserRole } from '@/lib/auth/roleUtils';
import { UserWithOrganizations } from '@/types/prisma';

/**
 * Användarrepository som hanterar all användarrelaterad dataåtkomst
 */
export const userRepository = {
  /**
   * Hämtar en användare med alla dess organisationer
   */
  async getUserWithOrganizations(email: string): Promise<UserWithOrganizations | null> {
    return prisma.user.findUnique({
      where: { email },
      include: {
        organizations: {
          include: {
            organization: true
          }
        }
      }
    });
  },

  /**
   * Hämtar en användare med organisationer filtrerade efter roll
   */
  async getUserWithRoleInOrganizations(email: string, role: UserRole): Promise<UserWithOrganizations | null> {
    return prisma.user.findUnique({
      where: { email },
      include: {
        organizations: {
          where: { role },
          include: {
            organization: true
          }
        }
      }
    });
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

    return prisma.user.create({
      data: {
        email,
        name,
        ...(organizationId ? {
          organizations: {
            create: {
              organizationId,
              role,
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
  },

  /**
   * Ansluter en användare till en organisation
   */
  async connectUserToOrganization(userId: string, organizationId: string, role: UserRole = UserRole.MEMBER, isDefault: boolean = false): Promise<UserWithOrganizations> {
    return prisma.user.update({
      where: { id: userId },
      data: {
        organizations: {
          create: {
            organizationId,
            role,
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
  }
}; 