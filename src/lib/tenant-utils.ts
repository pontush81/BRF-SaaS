import { PrismaClient } from '@prisma/client';
import { getEnvironment, Environment } from './env';

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
      log: environment === Environment.DEVELOPMENT ? ['query', 'error', 'warn'] : ['error'],
    }).$extends({
      query: {
        $allModels: {
          // Add organization filter to every query
          async $allOperations({ args, query, model, operation }) {
            // Skip operations that shouldn't be filtered (like count with no where clause)
            if (['findMany', 'findFirst', 'findUnique', 'findFirstOrThrow', 'findUniqueOrThrow'].includes(operation)) {
              // Don't modify any query that already explicitly specifies an organizationId
              if (args.where && 'organizationId' in args.where) {
                return query(args);
              }
              
              // For other queries, add the organizationId filter
              args.where = {
                ...args.where,
                organizationId,
              };
            }
            
            // For create operations, ensure organizationId is set
            if (operation === 'create' && !args.data.organizationId) {
              args.data.organizationId = organizationId;
            }
            
            // For createMany operations, ensure organizationId is set on all records
            if (operation === 'createMany') {
              args.data = args.data.map((item: any) => ({
                ...item,
                organizationId: item.organizationId || organizationId,
              }));
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
    
    if (!organizationId && getEnvironment() !== Environment.DEVELOPMENT) {
      return res.status(400).json({ 
        error: 'Missing organization ID. Tenant isolation requires an organization ID.' 
      });
    }
    
    // Create tenant-specific Prisma client
    req.prisma = organizationId ? 
      createTenantPrismaClient(organizationId) : 
      new PrismaClient();
    
    // Store the organizationId for reference
    req.organizationId = organizationId;
    
    // Call the original handler
    return handler(req, res);
  };
} 