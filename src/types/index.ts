/**
 * Type Definitions Index
 * 
 * Central export point for all type definitions to simplify imports
 * Usage: import { Handbook, Section, Page } from '@/types';
 */

// Re-export all types from individual type files
export * from './handbook';
export * from './organization';
export * from './prisma';
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