import { PrismaClient } from '@prisma/client';
import { cache } from 'react';

const prisma = new PrismaClient();

// Hjälper-funktion för att konvertera en sträng till en URL-vänlig slug
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')     // Ersätt mellanslag med -
    .replace(/å/g, 'a')       // Ersätt svenska tecken
    .replace(/ä/g, 'a')
    .replace(/ö/g, 'o')
    .replace(/[^\w-]+/g, '')  // Ta bort icke-ord tecken
    .replace(/--+/g, '-');    // Ersätt flera - med en
}

// Funktion för att validera att en slug är unik
export async function isSlugUnique(slug: string): Promise<boolean> {
  const existingOrg = await prisma.organization.findUnique({
    where: { slug },
  });
  return !existingOrg;
}

// Funktion för att generera en unik slug
export async function generateUniqueSlug(name: string): Promise<string> {
  let slug = slugify(name);
  let isUnique = await isSlugUnique(slug);
  let counter = 1;
  
  // Om inte unik, lägg till ett nummer i slutet
  while (!isUnique) {
    slug = `${slugify(name)}-${counter}`;
    isUnique = await isSlugUnique(slug);
    counter++;
  }
  
  return slug;
}

// Hämta organisation baserat på slug
export async function getOrganizationBySlug(slug: string) {
  if (!slug) return null;
  
  try {
    const organization = await prisma.organization.findUnique({
      where: { slug },
      include: {
        handbook: true,
      },
    });
    return organization;
  } catch (error) {
    console.error('Error fetching organization by slug:', error);
    return null;
  }
}

// Cached version av getOrganizationBySlug
export const getOrganizationBySlugCached = cache(getOrganizationBySlug);

// Skapa en ny organisation
export async function createOrganization(data: {
  name: string;
  slug?: string;
  domain?: string;
}) {
  try {
    // Om ingen slug angavs, generera en från namnet
    const slug = data.slug || await generateUniqueSlug(data.name);
    
    // Skapa organisationen
    const organization = await prisma.organization.create({
      data: {
        name: data.name,
        slug,
        domain: data.domain,
        // Skapa en tom handbok automatiskt
        handbook: {
          create: {
            title: `${data.name} Handbok`,
            description: `Digital handbok för ${data.name}`,
          },
        },
        // Skapa en aktiv prenumeration
        subscription: {
          create: {
            planType: 'BASIC',
            status: 'TRIAL',
            startDate: new Date(),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dagar
          },
        }
      },
      include: {
        handbook: true,
        subscription: true,
      },
    });
    
    return organization;
  } catch (error) {
    console.error('Error creating organization:', error);
    throw error;
  }
}

// Uppdatera en organisation
export async function updateOrganization(id: string, data: {
  name?: string;
  slug?: string;
  domain?: string;
}) {
  try {
    return await prisma.organization.update({
      where: { id },
      data,
    });
  } catch (error) {
    console.error('Error updating organization:', error);
    throw error;
  }
}

// Ta bort en organisation
export async function deleteOrganization(id: string) {
  try {
    // Ta bort relaterade data först
    await prisma.subscription.deleteMany({
      where: { organizationId: id },
    });
    
    // Ta bort handboken och dess innehåll
    const handbook = await prisma.handbook.findUnique({
      where: { organizationId: id },
      include: { sections: { include: { pages: true } } },
    });
    
    if (handbook) {
      // Ta bort sidor först
      for (const section of handbook.sections) {
        await prisma.page.deleteMany({
          where: { sectionId: section.id },
        });
      }
      
      // Ta bort sektioner
      await prisma.section.deleteMany({
        where: { handbookId: handbook.id },
      });
      
      // Ta bort handboken
      await prisma.handbook.delete({
        where: { id: handbook.id },
      });
    }
    
    // Ta bort användare kopplade till organisationen
    await prisma.user.updateMany({
      where: { organizationId: id },
      data: { organizationId: null },
    });
    
    // Ta bort organisationen
    return await prisma.organization.delete({
      where: { id },
    });
  } catch (error) {
    console.error('Error deleting organization:', error);
    throw error;
  }
} 