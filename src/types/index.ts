/**
 * Type Definitions Index
 *
 * Central export point for all type definitions to simplify imports
 * Usage: import { Handbook, Section, Page } from '@/types';
 */

// Re-export all non-conflicting types
export * from './handbook';
// Re-export types from organization.ts and prisma.ts with different names
export type { Organization as OrganizationType } from './organization';
export type {
  Organization as PrismaOrganization,
  UserWithOrganizations,
  UserOrganizationWithOrg,
} from './prisma';
// Export non-type members
export {
  getDefaultOrganization,
  getUserRoleInOrganization,
  hasRole,
} from './prisma';
export * from './supabase';

// Add any global type definitions here
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;

/**
 * Common API response structure
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page: number;
  pageSize: number;
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  items: T[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  hasMore: boolean;
}
