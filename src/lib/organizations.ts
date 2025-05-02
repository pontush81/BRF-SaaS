import { PrismaClient } from '@prisma/client';
import { unstable_cache } from 'next/cache';
import { createHandbook } from './handbooks';
import { UserRole } from './auth/roleUtils';

const prisma = new PrismaClient();

/**
 * Genererar en slug från ett organisationsnamn
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/å/g, 'a')
    .replace(/ä/g, 'a')
    .replace(/ö/g, 'o')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-');
}

/**
 * Kontrollerar om en slug är unik
 */
export async function isSlugUnique(slug: string, excludeOrgId?: string): Promise<boolean> {
  const existingOrg = await prisma.organization.findFirst({
    where: {
      slug,
      ...(excludeOrgId ? { id: { not: excludeOrgId } } : {}),
    },
  });
  
  return !existingOrg;
}

/**
 * Skapar en unik slug baserad på organisationsnamnet
 */
export async function createUniqueSlug(name: string): Promise<string> {
  let slug = generateSlug(name);
  let isUnique = await isSlugUnique(slug);
  let counter = 1;
  
  // Om sluggen redan används, lägg till ett tal i slutet
  while (!isUnique) {
    slug = `${generateSlug(name)}-${counter}`;
    isUnique = await isSlugUnique(slug);
    counter++;
  }
  
  return slug;
}

/**
 * Hämtar en organisation med dess ID
 */
export async function getOrganizationById(id: string) {
  try {
    const organization = await prisma.organization.findUnique({
      where: { id },
    });
    
    return organization;
  } catch (error) {
    console.error('Error fetching organization by ID:', error);
    return null;
  }
}

/**
 * Hämtar en organisation med dess slug
 * Cache:as för bättre prestanda
 */
export const getOrganizationBySlug = unstable_cache(async (slug: string) => {
  try {
    const organization = await prisma.organization.findUnique({
      where: { slug },
    });
    
    return organization;
  } catch (error) {
    console.error('Error fetching organization by slug:', error);
    return null;
  }
});

/**
 * Hämtar en organisation med dess domain
 * Cache:as för bättre prestanda
 */
export const getOrganizationByDomain = unstable_cache(async (domain: string) => {
  try {
    const organization = await prisma.organization.findFirst({
      where: { domain },
    });
    
    return organization;
  } catch (error) {
    console.error('Error fetching organization by domain:', error);
    return null;
  }
});

/**
 * Hämtar alla organisationer
 */
export async function getAllOrganizations() {
  try {
    const organizations = await prisma.organization.findMany({
      orderBy: { name: 'asc' },
    });
    
    return organizations;
  } catch (error) {
    console.error('Error fetching all organizations:', error);
    return [];
  }
}

/**
 * Skapar en ny organisation
 */
export async function createOrganization(data: { 
  name: string;
  slug?: string;
  domain?: string;
  userId?: string;
}) {
  try {
    // Om ingen slug angavs, skapa en baserad på namnet
    if (!data.slug) {
      data.slug = await createUniqueSlug(data.name);
    } else {
      // Kontrollera att sluggen är unik
      const isUnique = await isSlugUnique(data.slug);
      if (!isUnique) {
        throw new Error('Slug is already in use');
      }
    }
    
    // Skapa organisationen
    const organization = await prisma.organization.create({
      data: {
        name: data.name,
        slug: data.slug,
        domain: data.domain || null,
      },
    });
    
    // Skapa en standardhandbok för organisationen
    await createHandbook(organization.id);
    
    // Om ett användar-ID angavs, koppla användaren till organisationen
    if (data.userId) {
      await prisma.user.update({
        where: { id: data.userId },
        data: {
          organizationId: organization.id,
          role: 'ADMIN',
        },
      });
    }
    
    return organization;
  } catch (error) {
    console.error('Error creating organization:', error);
    throw error;
  }
}

/**
 * Uppdaterar en organisation
 */
export async function updateOrganization(id: string, data: { 
  name?: string;
  slug?: string;
  domain?: string | null;
}) {
  try {
    // Om slug ändras, kontrollera att den är unik
    if (data.slug) {
      const isUnique = await isSlugUnique(data.slug, id);
      if (!isUnique) {
        throw new Error('Slug is already in use');
      }
    }
    
    // Om namnet ändras men inte slug, generera en ny slug
    if (data.name && !data.slug) {
      const organization = await getOrganizationById(id);
      if (organization && organization.name !== data.name) {
        data.slug = await createUniqueSlug(data.name);
      }
    }
    
    const updatedOrganization = await prisma.organization.update({
      where: { id },
      data,
    });
    
    return updatedOrganization;
  } catch (error) {
    console.error('Error updating organization:', error);
    throw error;
  }
}

/**
 * Tar bort en organisation och all relaterad data
 */
export async function deleteOrganization(id: string) {
  try {
    // Ta bort alla handböcker och deras innehåll
    const handbooks = await prisma.handbook.findMany({
      where: { organizationId: id },
      include: { sections: { include: { pages: true } } },
    });
    
    for (const handbook of handbooks) {
      for (const section of handbook.sections) {
        // Ta bort alla sidor i sektionen
        await prisma.page.deleteMany({
          where: { sectionId: section.id },
        });
      }
      
      // Ta bort alla sektioner
      await prisma.section.deleteMany({
        where: { handbookId: handbook.id },
      });
      
      // Ta bort handboken
      await prisma.handbook.delete({
        where: { id: handbook.id },
      });
    }
    
    // Uppdatera användare för att ta bort kopplingen till organisationen
    await prisma.user.updateMany({
      where: { organizationId: id },
      data: { organizationId: null, role: UserRole.MEMBER },
    });
    
    // Ta bort organisationen
    await prisma.organization.delete({
      where: { id },
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting organization:', error);
    throw error;
  }
} 