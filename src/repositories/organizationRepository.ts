import prisma from '@/lib/prisma';
import { Organization } from '@/types/prisma';

/**
 * Organisationsrepository som hanterar all organisationsrelaterad dataåtkomst
 */
export const organizationRepository = {
  /**
   * Hämtar en organisation baserat på slug
   */
  async getOrganizationBySlug(slug: string): Promise<Organization | null> {
    return prisma.organization.findUnique({
      where: { slug }
    });
  },

  /**
   * Hämtar en organisation baserat på ID
   */
  async getOrganizationById(id: string): Promise<Organization | null> {
    return prisma.organization.findUnique({
      where: { id }
    });
  },

  /**
   * Söker efter organisationer baserat på namn
   */
  async searchOrganizationsByName(query: string, limit: number = 10): Promise<Organization[]> {
    return prisma.organization.findMany({
      where: {
        name: {
          contains: query,
          mode: 'insensitive'
        }
      },
      orderBy: {
        name: 'asc'
      },
      take: limit
    });
  },

  /**
   * Skapar en ny organisation
   */
  async createOrganization(data: { name: string, slug: string, domain?: string | null }): Promise<Organization> {
    return prisma.organization.create({
      data
    });
  },

  /**
   * Uppdaterar en organisation
   */
  async updateOrganization(id: string, data: { name?: string, slug?: string, domain?: string | null }): Promise<Organization> {
    return prisma.organization.update({
      where: { id },
      data
    });
  },

  /**
   * Hämtar användarantal i en organisation
   */
  async getUserCountInOrganization(organizationId: string): Promise<number> {
    return prisma.userOrganization.count({
      where: { organizationId }
    });
  }
}; 