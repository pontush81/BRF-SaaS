import { PrismaClient } from '@prisma/client';
import { createHandbookTemplate } from './handbook-template';
import { cache } from 'react';

const prisma = new PrismaClient();

/**
 * Hämtar en handbok för en specifik organisation
 * Cache:as för bättre prestanda vid serversiderendering
 */
export const getHandbookByOrgId = cache(async (organizationId: string) => {
  try {
    const handbook = await prisma.handbook.findFirst({
      where: { organizationId },
      include: {
        sections: {
          orderBy: { sortOrder: 'asc' },
          include: {
            pages: {
              orderBy: { sortOrder: 'asc' }
            }
          }
        }
      }
    });
    
    return handbook;
  } catch (error) {
    console.error('Error fetching handbook:', error);
    return null;
  }
});

/**
 * Hämtar en handbok med dess ID
 */
export async function getHandbookById(id: string) {
  try {
    const handbook = await prisma.handbook.findUnique({
      where: { id },
      include: {
        sections: {
          orderBy: { sortOrder: 'asc' },
          include: {
            pages: {
              orderBy: { sortOrder: 'asc' }
            }
          }
        }
      }
    });
    
    return handbook;
  } catch (error) {
    console.error('Error fetching handbook by ID:', error);
    return null;
  }
}

/**
 * Skapar en ny handbok för en organisation
 */
export async function createHandbook(organizationId: string, title: string = 'Bostadshandbok') {
  try {
    // Skapa handboken
    const handbook = await prisma.handbook.create({
      data: {
        title,
        organizationId
      }
    });
    
    // Fyll med standardinnehåll
    await createHandbookTemplate(handbook.id);
    
    return handbook;
  } catch (error) {
    console.error('Error creating handbook:', error);
    throw error;
  }
}

/**
 * Uppdaterar en handbok
 */
export async function updateHandbook(id: string, data: { title?: string }) {
  try {
    const updatedHandbook = await prisma.handbook.update({
      where: { id },
      data
    });
    
    return updatedHandbook;
  } catch (error) {
    console.error('Error updating handbook:', error);
    throw error;
  }
}

/**
 * Hämtar en sektion med ID
 */
export async function getSectionById(id: string) {
  try {
    const section = await prisma.section.findUnique({
      where: { id },
      include: {
        pages: {
          orderBy: { sortOrder: 'asc' }
        }
      }
    });
    
    return section;
  } catch (error) {
    console.error('Error fetching section:', error);
    return null;
  }
}

/**
 * Skapar en ny sektion i en handbok
 */
export async function createSection(handbookId: string, data: { title: string, sortOrder?: number }) {
  try {
    // Hitta högsta sortOrder om det inte angetts
    if (!data.sortOrder) {
      const highestSortOrder = await prisma.section.findFirst({
        where: { handbookId },
        orderBy: { sortOrder: 'desc' },
        select: { sortOrder: true }
      });
      
      data.sortOrder = highestSortOrder ? highestSortOrder.sortOrder + 1 : 1;
    }
    
    // Skapa ett nytt objekt med garanterade värden (sortOrder kan inte vara undefined här)
    const sectionData = {
      title: data.title,
      sortOrder: data.sortOrder, // Nu är detta alltid ett nummer efter if-satsen ovan
      handbookId
    };
    
    const section = await prisma.section.create({
      data: sectionData
    });
    
    return section;
  } catch (error) {
    console.error('Error creating section:', error);
    throw error;
  }
}

/**
 * Uppdaterar en sektion
 */
export async function updateSection(id: string, data: { title?: string, sortOrder?: number }) {
  try {
    const updatedSection = await prisma.section.update({
      where: { id },
      data
    });
    
    return updatedSection;
  } catch (error) {
    console.error('Error updating section:', error);
    throw error;
  }
}

/**
 * Tar bort en sektion och alla dess sidor
 */
export async function deleteSection(id: string) {
  try {
    // Först ta bort alla sidor i sektionen
    await prisma.page.deleteMany({
      where: { sectionId: id }
    });
    
    // Sedan ta bort sektionen
    await prisma.section.delete({
      where: { id }
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting section:', error);
    throw error;
  }
}

/**
 * Hämtar en sida med ID
 */
export async function getPageById(id: string) {
  try {
    const page = await prisma.page.findUnique({
      where: { id }
    });
    
    return page;
  } catch (error) {
    console.error('Error fetching page:', error);
    return null;
  }
}

/**
 * Skapar en ny sida i en sektion
 */
export async function createPage(sectionId: string, data: { title: string, content: string, sortOrder?: number }) {
  try {
    // Hitta högsta sortOrder om det inte angetts
    if (!data.sortOrder) {
      const highestSortOrder = await prisma.page.findFirst({
        where: { sectionId },
        orderBy: { sortOrder: 'desc' },
        select: { sortOrder: true }
      });
      
      data.sortOrder = highestSortOrder ? highestSortOrder.sortOrder + 1 : 1;
    }
    
    // Skapa ett nytt objekt med garanterade värden (sortOrder kan inte vara undefined här)
    const pageData = {
      title: data.title,
      content: data.content,
      sortOrder: data.sortOrder, // Nu är detta alltid ett nummer efter if-satsen ovan
      sectionId
    };
    
    const page = await prisma.page.create({
      data: pageData
    });
    
    return page;
  } catch (error) {
    console.error('Error creating page:', error);
    throw error;
  }
}

/**
 * Uppdaterar en sida
 */
export async function updatePage(id: string, data: { title?: string, content?: string, sortOrder?: number }) {
  try {
    const updatedPage = await prisma.page.update({
      where: { id },
      data
    });
    
    return updatedPage;
  } catch (error) {
    console.error('Error updating page:', error);
    throw error;
  }
}

/**
 * Tar bort en sida
 */
export async function deletePage(id: string) {
  try {
    await prisma.page.delete({
      where: { id }
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting page:', error);
    throw error;
  }
} 