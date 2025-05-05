/**
 * Handbook Types
 * Centralized type definitions for the handbook feature
 */

/**
 * Represents a handbook which belongs to an organization
 */
export interface Handbook {
  id: string;
  title: string;
  description?: string;
  organizationId: string;
  sections: Section[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Represents a section within a handbook
 */
export interface Section {
  id: string;
  title: string;
  description?: string;
  sortOrder: number;
  handbookId: string;
  pages: Page[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Represents a page within a section
 */
export interface Page {
  id: string;
  title: string;
  content: string;
  sortOrder: number;
  published: boolean;
  sectionId: string;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  publishedBy?: string;
  version: number;
  previousVersion?: string;
}

/**
 * Valid user roles in the application
 */
export enum UserRole {
  ADMIN = 'ADMIN',
  EDITOR = 'EDITOR',
  MEMBER = 'MEMBER'
}

/**
 * Represents the relationship between a user and an organization
 */
export interface UserOrganization {
  id: string;
  userId: string;
  organizationId: string;
  role: UserRole;
  isDefault: boolean;
  joinedAt: Date;
  invitedBy?: string;
}

/**
 * Represents an invitation to join an organization
 */
export interface Invitation {
  id: string;
  email: string;
  organizationId: string;
  role: UserRole;
  status: 'pending' | 'accepted' | 'expired';
  token: string;
  invitedBy: string;
  createdAt: Date;
  expiresAt: Date;
} 