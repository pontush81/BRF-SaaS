'use server';

import { UserRole } from './roleUtils';
import { getDefaultOrganization } from '@/types/prisma';
import { userRepository } from '@/repositories/userRepository';

// Typdefiniton för User med organization för kompabilitet
export type UserWithOrg = {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  organizationId: string | null;
  organization: {
    id: string;
    name: string;
    slug: string;
  } | null;
};

/**
 * Hämtar inloggad användare från Supabase och databasen.
 * Denna funktion importerar next/headers och kan BARA användas på servern.
 *
 * Körs i serverkomponenter eller API-routes.
 */
export async function getCurrentUserServer() {
  try {
    // Dynamisk import för att undvika att importera next/headers vid byggtid
    const { cookies } = await import('next/headers');
    const cookieStore = cookies();

    // Importera getServerSideUser istället för att skapa en egen client
    const { getServerSideUser } = await import('@/supabase-server');

    // Använd getServerSideUser direkt med cookieStore
    const user = await getServerSideUser(cookieStore);

    console.log('Server auth check:', {
      userExists: !!user,
      userId: user?.id,
      userEmail: user?.email,
    });

    if (!user || !user.email) {
      console.log('No authenticated user found');
      return null;
    }

    // Hämta användare från databas via repository
    console.log('Fetching user from database with email:', user.email);
    try {
      const dbUser = await userRepository.getUserWithOrganizations(user.email);
      console.log('DB User fetch result:', {
        userExists: !!dbUser,
        userId: dbUser?.id,
        orgCount: dbUser?.organizations?.length || 0,
      });

      if (!dbUser) {
        console.log('User not found in database despite valid session');

        // Om användaren har en session men saknas i databasen, skapa användaren
        console.log('Attempting to create missing user in database');
        try {
          // Check if user has user_metadata property and extract name safely
          const userName =
            user &&
            typeof user === 'object' &&
            'user_metadata' in user &&
            user.user_metadata &&
            typeof user.user_metadata === 'object' &&
            'name' in user.user_metadata
              ? String(user.user_metadata.name)
              : null;

          const newUser = await userRepository.createUserWithOrganization({
            email: user.email,
            name: userName,
          });

          console.log('Successfully created missing user:', {
            userId: newUser.id,
            email: newUser.email,
          });

          // Returnera nyskapad användare i legacy-format
          return {
            id: newUser.id,
            email: newUser.email,
            name: newUser.name,
            role: UserRole.MEMBER,
            organizationId: null,
            organization: null,
          } as UserWithOrg;
        } catch (createError) {
          console.error('Failed to create missing user:', createError);
          return null;
        }
      }

      // Konvertera till legacy format för kompabilitet
      const defaultOrg = getDefaultOrganization(dbUser);
      console.log('Default org:', {
        exists: !!defaultOrg,
        orgId: defaultOrg?.organizationId,
        orgName: defaultOrg?.organization?.name,
      });

      return {
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.name,
        role: defaultOrg?.role || UserRole.MEMBER,
        organizationId: defaultOrg?.organizationId || null,
        organization: defaultOrg?.organization
          ? {
              id: defaultOrg.organization.id,
              name: defaultOrg.organization.name,
              slug: defaultOrg.organization.slug,
            }
          : null,
      } as UserWithOrg;
    } catch (error) {
      console.error('Error fetching user from database:', error);
      return null;
    }
  } catch (error) {
    console.error('Error in getCurrentUserServer:', error);
    return null;
  }
}
