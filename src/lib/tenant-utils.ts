import { PrismaClient } from '@prisma/client';
import { getEnvironment, Environment } from './env';

/**
 * Helper function to determine if development logging should be enabled
 */
function isDevelopmentLogging(environment: Environment): boolean {
  return environment === Environment.DEVELOPMENT;
}

/**
 * Creates a Prisma client instance for a specific tenant (organization)
 * This is useful when interacting with Supabase where Row Level Security is enforced
 *
 * @param organizationId The ID of the organization/tenant to isolate queries to
 * @returns A Prisma client instance configured for the specific tenant
 */
export function createTenantPrismaClient(organizationId: string) {
  const environment = getEnvironment();

  // Only apply tenant isolation in non-development environments
  // In development, we're likely using a local database without RLS
  if (environment !== Environment.DEVELOPMENT) {
    // Create a new Prisma client with query middleware
    const prisma = new PrismaClient({
      log: isDevelopmentLogging(environment)
        ? ['query', 'error', 'warn']
        : ['error'],
    }).$extends({
      query: {
        $allModels: {
          // Add organization filter to every query
          async $allOperations({ args, query, model, operation }) {
            // Create a safe copy of args
            const newArgs = JSON.parse(JSON.stringify(args));

            // Skip operations that shouldn't be filtered (like count with no where clause)
            if (
              [
                'findMany',
                'findFirst',
                'findUnique',
                'findFirstOrThrow',
                'findUniqueOrThrow',
              ].includes(operation)
            ) {
              // Don't modify any query that already explicitly specifies an organizationId
              if (
                newArgs.where &&
                typeof newArgs.where === 'object' &&
                'organizationId' in newArgs.where
              ) {
                return query(args);
              }

              // For other queries, add the organizationId filter
              newArgs.where = {
                ...(newArgs.where || {}),
                organizationId,
              };

              return query(newArgs);
            }

            // For create operations, ensure organizationId is set
            if (
              operation === 'create' &&
              newArgs.data &&
              typeof newArgs.data === 'object'
            ) {
              if (!('organizationId' in newArgs.data)) {
                newArgs.data = {
                  ...newArgs.data,
                  organizationId,
                };
              }

              return query(newArgs);
            }

            // For createMany operations, ensure organizationId is set on all records
            if (
              operation === 'createMany' &&
              newArgs.data &&
              Array.isArray(newArgs.data)
            ) {
              newArgs.data = newArgs.data.map((item: any) => ({
                ...item,
                organizationId: item.organizationId || organizationId,
              }));

              return query(newArgs);
            }

            return query(args);
          },
        },
      },
    });

    return prisma;
  }

  // In development, just return a regular Prisma client
  return new PrismaClient({
    log: ['query', 'error', 'warn'],
  });
}

/**
 * Middleware function for Next.js API routes that sets up tenant isolation
 *
 * Example usage:
 * ```ts
 * export default withTenantIsolation(async function handler(req, res) {
 *   const { prisma, organizationId } = req;
 *   // Use prisma as normal, but it's already tenant-isolated
 * });
 * ```
 */
export function withTenantIsolation(handler: any) {
  return async (req: any, res: any) => {
    // Get organizationId from headers or params
    const organizationId =
      req.headers['x-organization-id'] ||
      req.query.organizationId ||
      req.cookies?.organizationId;

    const environment = getEnvironment();
    if (!organizationId && environment !== Environment.DEVELOPMENT) {
      return res.status(400).json({
        error:
          'Missing organization ID. Tenant isolation requires an organization ID.',
      });
    }

    // Create tenant-specific Prisma client
    req.prisma = organizationId
      ? createTenantPrismaClient(organizationId)
      : new PrismaClient();

    // Store the organizationId for reference
    req.organizationId = organizationId;

    // Call the original handler
    return handler(req, res);
  };
}
